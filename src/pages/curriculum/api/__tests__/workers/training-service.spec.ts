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
  undoPracticeAttempt,
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

  it("undoes a practice attempt and handles missing dog, invalid step, or missing attempt", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({
      email: "undo@example.com",
      id: "undo-owner",
      name: "Undo Owner",
    });

    // No dog yet
    const emptyHistory = await getPracticeHistory("level-1/zen:step-1", {
      db,
      userId: "undo-owner",
    });
    expect(emptyHistory).toStrictEqual([]);

    await expect(
      getPracticeHistory("invalid-step", { db, userId: "undo-owner" }),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });

    await expect(
      correctPracticeAttempt(
        { attemptId: "018f47ad-9d72-7a31-a50b-a99999999999", outcome: "success" },
        { db, userId: "undo-owner" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    await expect(
      undoPracticeAttempt("018f47ad-9d72-7a31-a50b-a99999999999", { db, userId: "undo-owner" }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("handles practice attempt undo and missing attempts for an existing dog", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);

    await db.insert(user).values({
      email: "undo@example.com",
      id: "undo-owner",
      name: "Undo Owner",
    });
    await db.insert(dogs).values({ id: "undo-dog", userId: "undo-owner" });

    await expect(
      correctPracticeAttempt(
        { attemptId: "018f47ad-9d72-7a31-a50b-a99999999999", outcome: "success" },
        { db, userId: "undo-owner" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    await expect(
      undoPracticeAttempt("018f47ad-9d72-7a31-a50b-a99999999999", { db, userId: "undo-owner" }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    await recordPracticeAttempt(
      {
        attemptId: "018f47ad-9d72-7a31-a50b-a88888888888",
        outcome: "success",
        stepId: "level-1/zen:step-1",
        target: "First target",
      },
      { db, userId: "undo-owner" },
    );

    const undone = await undoPracticeAttempt("018f47ad-9d72-7a31-a50b-a88888888888", {
      db,
      userId: "undo-owner",
    });
    expect(undone).toStrictEqual({
      attemptId: "018f47ad-9d72-7a31-a50b-a88888888888",
      undone: true,
    });
  });

  it("records and queries step tests for any cold-testable Main Quest step across levels", async () => {
    expect.assertions(5);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "multi-test@example.com", id: "multi-test-owner", name: "Multi Owner" });
    await db.insert(dogs).values({ id: "multi-test-dog", userId: "multi-test-owner" });

    // Act
    const zenTwo = await recordStepTest(
      {
        coldOverride: false,
        outcome: "success",
        stepId: "level-1/zen:step-2",
        testId: "018f47ad-9d72-7a31-a50b-b99999999991",
      },
      { db, userId: "multi-test-owner" },
    );
    const comeThree = await recordStepTest(
      {
        coldOverride: true,
        outcome: "not_yet",
        stepId: "level-2/come:step-3",
        testId: "018f47ad-9d72-7a31-a50b-b99999999992",
      },
      { db, userId: "multi-test-owner" },
    );
    const retrieveOne = await recordStepTest(
      {
        coldOverride: false,
        outcome: "success",
        stepId: "level-3/retrieve:step-1",
        testId: "018f47ad-9d72-7a31-a50b-b99999999993",
      },
      { db, userId: "multi-test-owner" },
    );
    const comeHistory = await getStepTestHistory("level-2/come:step-3", {
      db,
      userId: "multi-test-owner",
    });
    const completions = await getStepProgress({ db, userId: "multi-test-owner" });

    // Assert
    expect(zenTwo.stepId).toBe("level-1/zen:step-2");
    expect(comeThree.stepId).toBe("level-2/come:step-3");
    expect(retrieveOne.stepId).toBe("level-3/retrieve:step-1");
    expect(comeHistory.map((test) => test.testId)).toStrictEqual([
      "018f47ad-9d72-7a31-a50b-b99999999992",
    ]);
    expect(completions).toStrictEqual(["level-1/zen:step-2", "level-3/retrieve:step-1"]);
  });

  it("rejects recordStepTest and getStepTestHistory for steps without cold tests or invalid steps", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);

    await expect(
      recordStepTest(
        {
          coldOverride: false,
          outcome: "success",
          stepId: "level-1/zen:step-5",
          testId: "018f47ad-9d72-7a31-a50b-b99999999999",
        },
        { db, userId: "undo-owner" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });

    await expect(
      recordStepTest(
        {
          coldOverride: false,
          outcome: "success",
          stepId: "level-2/tricks:step-1",
          testId: "018f47ad-9d72-7a31-a50b-b99999999998",
        },
        { db, userId: "undo-owner" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });

    await expect(
      getStepTestHistory("theory/01-foreword:step-1", { db, userId: "undo-owner" }),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });

    await expect(
      getStepTestHistory("invalid-step", { db, userId: "undo-owner" }),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });
  });

  it("handles missing dogs, missing records, and invalid practice steps", async () => {
    expect.assertions(4);

    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "edge@example.com", id: "edge-owner", name: "Edge Owner" });

    await expect(
      getPracticeTotals("level-1/zen:step-1", { db, userId: "edge-owner" }),
    ).resolves.toStrictEqual([]);
    await expect(
      getPracticeStepDecision("level-1/zen:step-1", { db, userId: "edge-owner" }),
    ).resolves.toBeNull();
    await expect(
      getStepTestHistory("level-1/zen:step-1", { db, userId: "edge-owner" }),
    ).resolves.toStrictEqual([]);

    await expect(
      correctPracticeTotals(
        { notYetCount: 0, recordId: "018f47ad-9d72-7a31-a50b-c99999999999", successCount: 1 },
        { db, userId: "edge-owner" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("handles edge-owner decision, totals correction, and unknown targets", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);

    await db
      .insert(user)
      .values({ email: "edge@example.com", id: "edge-owner", name: "Edge Owner" });
    await db.insert(dogs).values({ id: "edge-dog", userId: "edge-owner" });

    await expect(
      getPracticeStepDecision("level-1/zen:step-1", { db, userId: "edge-owner" }),
    ).resolves.toBeNull();

    await expect(
      correctPracticeTotals(
        { notYetCount: 0, recordId: "018f47ad-9d72-7a31-a50b-c99999999999", successCount: 1 },
        { db, userId: "edge-owner" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    await expect(
      recordPracticeAttempt(
        {
          attemptId: "018f47ad-9d72-7a31-a50b-c88888888888",
          outcome: "success",
          stepId: "invalid-step",
          target: "Target",
        },
        { db, userId: "edge-owner" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });
  });

  it("rejects recordStepTest for non-cold-testable step and correctPracticeTotals for missing record", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "edge2@example.com", id: "edge-owner-2", name: "Edge Owner 2" });
    await db.insert(dogs).values({ id: "edge-dog-2", userId: "edge-owner-2" });

    await expect(
      recordStepTest(
        {
          coldOverride: false,
          outcome: "success",
          stepId: "invalid-step",
          testId: "018f47ad-9d72-7a31-a50b-c77777777777",
        },
        { db, userId: "edge-owner-2" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });

    await expect(
      correctPracticeTotals(
        { notYetCount: 0, recordId: "018f47ad-9d72-7a31-a50b-c66666666666", successCount: 1 },
        { db, userId: "edge-owner-2" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("throws INTERNAL_SERVER_ERROR when inserted dog or record cannot be read back", async () => {
    expect.hasAssertions();

    const emptySelectChain = {
      from: () => ({
        where: () => ({
          limit: resolvedEmpty,
          orderBy: () => ({
            limit: resolvedEmpty,
          }),
        }),
      }),
    };
    const stubDbEmpty = {
      batch: resolvedEmpty,
      insert: () => ({
        select: () => ({
          onConflictDoNothing: resolvedVoid,
        }),
        values: () => ({
          onConflictDoNothing: resolvedVoid,
        }),
      }),
      select: () => emptySelectChain,
    } as unknown as ReturnType<typeof getDb>;

    await expect(
      recordPracticeTotals(
        {
          notYetCount: 0,
          recordId: "018f47ad-9d72-7a31-a50b-d11111111111",
          stepId: "level-1/zen:step-1",
          successCount: 1,
          target: "Zen target",
        },
        { db: stubDbEmpty, userId: "stub-user" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    await expect(
      recordStepTest(
        {
          coldOverride: false,
          outcome: "success",
          stepId: "level-1/zen:step-1",
          testId: "018f47ad-9d72-7a31-a50b-d22222222222",
        },
        { db: stubDbEmpty, userId: "stub-user" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    await expect(
      recordPracticeAttempt(
        {
          attemptId: "018f47ad-9d72-7a31-a50b-d33333333333",
          outcome: "success",
          stepId: "level-1/zen:step-1",
          target: "Zen target",
        },
        { db: stubDbEmpty, userId: "stub-user" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    let selectCount = 0;
    const stubResponses = [[{ id: "stub-dog" }], []];
    const stubDbDogOnly = {
      batch: resolvedEmpty,
      insert: () => ({
        select: () => ({
          onConflictDoNothing: resolvedVoid,
        }),
        values: () => ({
          onConflictDoNothing: resolvedVoid,
        }),
      }),
      select: () => ({
        from: () => ({
          // oxlint-disable-next-line typescript/promise-function-async -- Drizzle query builder is both thenable and chainable
          where: () => {
            const rowsPromise = Promise.resolve(stubResponses[selectCount]);
            selectCount += 1;
            async function getRows() {
              return await rowsPromise;
            }
            return Object.assign(rowsPromise, {
              limit: getRows,
              orderBy: () => ({
                limit: getRows,
              }),
            });
          },
        }),
      }),
    } as unknown as ReturnType<typeof getDb>;

    await expect(
      recordStepTest(
        {
          coldOverride: false,
          outcome: "success",
          stepId: "level-1/zen:step-1",
          testId: "018f47ad-9d72-7a31-a50b-d44444444444",
        },
        { db: stubDbDogOnly, userId: "stub-user" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});

async function resolvedEmpty() {
  await Promise.resolve();
  return [];
}

async function resolvedVoid() {
  await Promise.resolve();
}
