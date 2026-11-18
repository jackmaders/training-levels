import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import { dogs, stepCompletions } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";

import { getStepProgress, toggleStep } from "../../curriculum-service";
import {
  correctPracticeTotals,
  getPracticeStepDecision,
  getPracticeTotals,
  recordPracticeTotals,
  savePracticeStepDecision,
} from "../../practice-progress-service";
import { getStepTestHistory, recordStepTest } from "../../step-test-service";
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

  it("persists aggregate totals and corrections without creating ordered attempts", async () => {
    expect.assertions(2);
    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "totals@example.com", id: "totals-owner", name: "Totals Owner" });

    // Act
    await recordPracticeTotals(
      {
        notYetCount: 4,
        recordId: "018f47ad-9d72-7a31-a50b-a88888888888",
        stepId: "level-1/zen:step-1",
        successCount: 7,
        target: "Dog moves away from the protected treat while seated.",
      },
      { db, userId: "totals-owner" },
    );
    await correctPracticeTotals(
      {
        notYetCount: 3,
        recordId: "018f47ad-9d72-7a31-a50b-a88888888888",
        successCount: 8,
      },
      { db, userId: "totals-owner" },
    );
    const totals = await getPracticeTotals("level-1/zen:step-1", { db, userId: "totals-owner" });
    const attempts = await getPracticeHistory("level-1/zen:step-1", { db, userId: "totals-owner" });

    // Assert
    expect(totals).toMatchObject([
      {
        notYetCount: 3,
        recordId: "018f47ad-9d72-7a31-a50b-a88888888888",
        successCount: 8,
        target: "Dog moves away from the protected treat while seated.",
      },
    ]);
    expect(attempts).toStrictEqual([]);
  });

  it("retains the handler's readiness choice for a later Test recommendation", async () => {
    expect.assertions(1);
    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "decision@example.com", id: "decision-owner", name: "Decision Owner" });

    // Act
    await savePracticeStepDecision(
      { decision: "recommend_test", stepId: "level-1/zen:step-1" },
      {
        db,
        userId: "decision-owner",
      },
    );
    const decision = await getPracticeStepDecision("level-1/zen:step-1", {
      db,
      userId: "decision-owner",
    });

    // Assert
    expect(decision).toMatchObject({ decision: "recommend_test", stepId: "level-1/zen:step-1" });
  });

  it("persists cold Test results under the Dog owner and retains failed retests after a pass", async () => {
    expect.assertions(5);
    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values([
      { email: "test-owner@example.com", id: "test-owner", name: "Test Owner" },
      { email: "other-owner@example.com", id: "other-owner", name: "Other Owner" },
    ]);
    await db.insert(dogs).values({ id: "test-dog", userId: "test-owner" });
    const passedTest = {
      coldOverride: false,
      outcome: "success",
      stepId: "level-1/zen:step-1",
      testId: "018f47ad-9d72-7a31-a50b-b11111111111",
    } as const;
    await recordStepTest(passedTest, { db, userId: "test-owner" });

    // Act
    const failedTest = await recordStepTest(
      {
        coldOverride: true,
        outcome: "not_yet",
        stepId: passedTest.stepId,
        testId: "018f47ad-9d72-7a31-a50b-b22222222222",
      },
      { db, userId: "test-owner" },
    );
    const ownerHistory = await getStepTestHistory(passedTest.stepId, {
      db,
      userId: "test-owner",
    });
    const otherOwnerHistory = await getStepTestHistory(passedTest.stepId, {
      db,
      userId: "other-owner",
    });
    const completedSteps = await getStepProgress({ db, userId: "test-owner" });

    // Assert
    expect(failedTest).toMatchObject({ coldOverride: true, outcome: "not_yet" });
    expect(ownerHistory.map(({ outcome }) => outcome)).toStrictEqual(["success", "not_yet"]);
    expect(ownerHistory[1]).toMatchObject({ coldOverride: true, outcome: "not_yet" });
    expect(otherOwnerHistory).toStrictEqual([]);
    expect(completedSteps).toContain(passedTest.stepId);
  });

  it("keeps a legacy Step completion without inventing a Test record", async () => {
    expect.assertions(3);
    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "legacy-test@example.com", id: "legacy-test-owner", name: "Legacy Owner" });
    await db.insert(dogs).values({ id: "legacy-test-dog", userId: "legacy-test-owner" });
    await db.insert(stepCompletions).values({
      dogId: "legacy-test-dog",
      id: "legacy-test-completion",
      stepId: "level-1/zen:step-1",
    });

    // Act
    const completion = await toggleStep(
      { completed: true, stepId: "level-1/zen:step-1" },
      { db, userId: "legacy-test-owner" },
    );
    const history = await getStepTestHistory("level-1/zen:step-1", {
      db,
      userId: "legacy-test-owner",
    });
    const completions = await getStepProgress({ db, userId: "legacy-test-owner" });

    // Assert
    expect(completion.completed).toBe(true);
    expect(history).toStrictEqual([]);
    expect(completions).toStrictEqual(["level-1/zen:step-1"]);
  });
});
