import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import { dogs } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";

import {
  correctPracticeAttempt,
  getPracticeHistory,
  recordPracticeAttempt,
} from "../../training-service";

describe("training-service (workers D1)", () => {
  it("persists a repetition outcome under the authenticated owner's primary Dog", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "practice@example.com", id: "practice-owner", name: "Practice Owner" });
    await db
      .insert(dogs)
      .values({ id: "practice-dog", name: "Practice Dog", userId: "practice-owner" });

    // Act
    const recorded = await recordPracticeAttempt(
      {
        attemptId: "018f47ad-9d72-7a31-a50b-a11111111111",
        outcome: "success",
        stepId: "level-1/zen:step-1",
        target: "Dog moves away from a treat in your hand while you sit.",
      },
      { db, userId: "practice-owner" },
    );
    const history = await getPracticeHistory("level-1/zen:step-1", {
      db,
      userId: "practice-owner",
    });

    // Assert
    expect(recorded).toMatchObject({
      attemptId: "018f47ad-9d72-7a31-a50b-a11111111111",
      dogId: "practice-dog",
      outcome: "success",
    });
    expect(history).toMatchObject([
      {
        attemptId: "018f47ad-9d72-7a31-a50b-a11111111111",
        outcome: "success",
        target: "Dog moves away from a treat in your hand while you sit.",
      },
    ]);
  });

  it("corrects a saved outcome and exposes the correction in history", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({
      email: "correction@example.com",
      id: "correction-owner",
      name: "Correction Owner",
    });
    await db.insert(dogs).values({ id: "correction-dog", userId: "correction-owner" });
    await recordPracticeAttempt(
      {
        attemptId: "018f47ad-9d72-7a31-a50b-a22222222222",
        outcome: "success",
        stepId: "level-1/zen:step-1",
        target: "First target",
      },
      { db, userId: "correction-owner" },
    );

    // Act
    const corrected = await correctPracticeAttempt(
      { attemptId: "018f47ad-9d72-7a31-a50b-a22222222222", outcome: "not_yet" },
      { db, userId: "correction-owner" },
    );
    const history = await getPracticeHistory("level-1/zen:step-1", {
      db,
      userId: "correction-owner",
    });

    // Assert
    expect(corrected).toMatchObject({
      attemptId: "018f47ad-9d72-7a31-a50b-a22222222222",
      outcome: "not_yet",
    });
    expect(history).toMatchObject([
      { attemptId: "018f47ad-9d72-7a31-a50b-a22222222222", outcome: "not_yet" },
    ]);
  });

  it("makes a retried attempt idempotent", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    const input = {
      attemptId: "018f47ad-9d72-7a31-a50b-a44444444444",
      outcome: "success" as const,
      stepId: "level-1/zen:step-1",
      target: "First target",
    };
    await db
      .insert(user)
      .values({ email: "retry@example.com", id: "retry-owner", name: "Retry Owner" });

    // Act
    await recordPracticeAttempt(input, { db, userId: "retry-owner" });
    await recordPracticeAttempt(
      { ...input, target: "Changed retry payload" },
      { db, userId: "retry-owner" },
    );
    const history = await getPracticeHistory(input.stepId, { db, userId: "retry-owner" });

    // Assert
    expect(history).toHaveLength(1);
    expect(history[0]?.target).toBe("First target");
  });

  it("does not return another owner's Dog history", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values([
      { email: "first-owner@example.com", id: "first-owner", name: "First Owner" },
      { email: "second-owner@example.com", id: "second-owner", name: "Second Owner" },
    ]);
    await db.insert(dogs).values([
      { id: "first-dog", userId: "first-owner" },
      { id: "second-dog", userId: "second-owner" },
    ]);
    await recordPracticeAttempt(
      {
        attemptId: "018f47ad-9d72-7a31-a50b-a33333333333",
        outcome: "success",
        stepId: "level-1/zen:step-1",
        target: "Target",
      },
      { db, userId: "first-owner" },
    );

    // Act
    const secondOwnerHistory = await getPracticeHistory("level-1/zen:step-1", {
      db,
      userId: "second-owner",
    });
    const firstOwnerDogs = await db.select().from(dogs).where(eq(dogs.userId, "first-owner"));

    // Assert
    expect(secondOwnerHistory).toStrictEqual([]);
    expect(firstOwnerDogs).toHaveLength(1);
  });
});
