import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vite-plus/test";

import { dogs, stepCompletions, type StepCompletion } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";

const MILLISECOND_EPOCH_THRESHOLD = 1_000_000_000_000;

beforeEach(async () => {
  const db = getDb(env.DB);
  await db
    .insert(user)
    .values([
      { email: "progress-owner-a@example.com", id: "progress-owner-a", name: "Progress A" },
      { email: "progress-owner-b@example.com", id: "progress-owner-b", name: "Progress B" },
    ])
    .onConflictDoNothing();

  await db
    .insert(dogs)
    .values([
      { id: "dog-a", name: "Dog A", userId: "progress-owner-a" },
      { id: "dog-b", name: "Dog B", userId: "progress-owner-b" },
    ])
    .onConflictDoNothing();
});

describe("stepCompletions schema", () => {
  it("persists a step completion with generated id and millisecond completedAt", async () => {
    expect.assertions(5);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const [created]: StepCompletion[] = await db
      .insert(stepCompletions)
      .values({ dogId: "dog-a", stepId: "level-1/zen:step-1" })
      .returning();

    // Assert
    expect(created).toBeDefined();
    expect(created?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu);
    expect(created?.dogId).toBe("dog-a");
    expect(created?.stepId).toBe("level-1/zen:step-1");
    expect(created?.completedAt.getTime()).toBeGreaterThan(MILLISECOND_EPOCH_THRESHOLD);
  });

  it("rejects duplicate (dog_id, step_id) for the same dog", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(stepCompletions).values({ dogId: "dog-a", stepId: "level-1/zen:step-1" });

    // Act
    const action = db
      .insert(stepCompletions)
      .values({ dogId: "dog-a", stepId: "level-1/zen:step-1" });

    // Assert
    await expect(action).rejects.toMatchObject({
      cause: {
        message: expect.stringContaining(
          "UNIQUE constraint failed: step_completions.dog_id, step_completions.step_id",
        ) as unknown,
      },
    });
  });

  it("allows another dog to complete the same step_id", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(stepCompletions).values({ dogId: "dog-a", stepId: "level-1/zen:step-1" });

    // Act
    const sameStepForOtherDog = await db
      .insert(stepCompletions)
      .values({ dogId: "dog-b", stepId: "level-1/zen:step-1" })
      .returning();

    // Assert
    expect(sameStepForOtherDog).toHaveLength(1);
    expect(sameStepForOtherDog[0]).toMatchObject({
      dogId: "dog-b",
      stepId: "level-1/zen:step-1",
    });
  });

  it("rejects inserting a step completion for a nonexistent dog", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = db
      .insert(stepCompletions)
      .values({ dogId: "missing-dog", stepId: "level-1/zen:step-1" });

    // Assert
    await expect(action).rejects.toMatchObject({
      cause: {
        message: expect.stringContaining("FOREIGN KEY constraint failed") as unknown,
      },
    });
  });

  it("cascades deletion from dog to stepCompletions without affecting other dogs", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(stepCompletions).values([
      { dogId: "dog-a", stepId: "level-1/zen:step-1" },
      { dogId: "dog-b", stepId: "level-1/zen:step-1" },
    ]);

    // Act
    await db.delete(dogs).where(eq(dogs.id, "dog-a"));
    const remainingDogACompletions = await db
      .select()
      .from(stepCompletions)
      .where(eq(stepCompletions.dogId, "dog-a"));
    const remainingDogBCompletions = await db
      .select()
      .from(stepCompletions)
      .where(eq(stepCompletions.dogId, "dog-b"));

    // Assert
    expect(remainingDogACompletions).toHaveLength(0);
    expect(remainingDogBCompletions).toHaveLength(1);
  });

  it("cascades user deletion through dogs to stepCompletions", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(stepCompletions).values([
      { dogId: "dog-a", stepId: "level-1/zen:step-1" },
      { dogId: "dog-b", stepId: "level-1/zen:step-1" },
    ]);

    // Act
    await db.delete(user).where(eq(user.id, "progress-owner-a"));
    const remainingDogsA = await db.select().from(dogs).where(eq(dogs.id, "dog-a"));
    const remainingCompletionsA = await db
      .select()
      .from(stepCompletions)
      .where(eq(stepCompletions.dogId, "dog-a"));
    const remainingCompletionsB = await db
      .select()
      .from(stepCompletions)
      .where(eq(stepCompletions.dogId, "dog-b"));

    // Assert
    expect(remainingDogsA).toHaveLength(0);
    expect(remainingCompletionsA).toHaveLength(0);
    expect(remainingCompletionsB).toHaveLength(1);
  });
});
