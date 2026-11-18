import { env } from "cloudflare:workers";
import { asc, eq } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import { dogs, stepCompletions } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";
import { ApplicationError } from "@/shared/errors";

import { getPage, getStepProgress, getSyllabus, toggleStep } from "../../curriculum-service";

const EXPECTED_PAGE_COUNT = 69;
const EXPECTED_STEP_COUNT = 235;
const EARLIER_TIMESTAMP = new Date("2026-01-01T00:00:00.000Z");
const LATER_TIMESTAMP = new Date("2026-02-01T00:00:00.000Z");

describe("curriculum-service (workers D1)", () => {
  it("returns the full syllabus page and step counts", () => {
    expect.assertions(2);

    // Act
    const syllabus = getSyllabus();

    // Assert
    expect(syllabus.totalPages).toBe(EXPECTED_PAGE_COUNT);
    expect(syllabus.totalSteps).toBe(EXPECTED_STEP_COUNT);
  });

  it("returns a behavior page for a known slug", () => {
    expect.assertions(2);

    // Act
    const zen = getPage("level-1/zen");

    // Assert
    expect(zen?.kind).toBe("behavior");
    expect(zen?.title).toBe("Level 1: Zen");
  });

  it("returns null for an unknown page slug", () => {
    expect.assertions(1);

    // Act
    const unknown = getPage("level-1/nonexistent");

    // Assert
    expect(unknown).toBeNull();
  });

  it("returns empty step progress with zero DB writes when the user has no dog", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({ email: "nodog@example.com", id: "user-nodog", name: "No Dog" });

    // Act (exercises default getDb() fallback as well)
    const progress = await getStepProgress({ userId: "user-nodog" });
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-nodog"));

    // Assert
    expect(progress).toStrictEqual([]);
    expect(dogRows).toHaveLength(0);
  });

  it("lazily creates a stub Dog on first completion using default getDb()", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({ email: "lazy@example.com", id: "user-lazy", name: "Lazy User" });

    // Act
    const result = await toggleStep(
      { completed: true, stepId: "level-1/zen:step-3" },
      { userId: "user-lazy" },
    );
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-lazy"));
    const progress = await getStepProgress({ db, userId: "user-lazy" });

    // Assert
    expect(result).toStrictEqual({ completed: true, stepId: "level-1/zen:step-3" });
    expect(dogRows).toMatchObject([{ name: "My Dog", userId: "user-lazy" }]);
    expect(dogRows[0]?.createdAt).toBeInstanceOf(Date);
    expect(progress).toStrictEqual(["level-1/zen:step-3"]);
  });

  it("rejects checking a Tested Step that has no passing Test or prior completion", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "bypass@example.com", id: "user-bypass", name: "Bypass" });
    await db.insert(dogs).values({ id: "dog-bypass", userId: "user-bypass" });

    // Act
    const toggle = toggleStep(
      { completed: true, stepId: "level-1/zen:step-1" },
      { db, userId: "user-bypass" },
    );

    // Assert
    await expect(toggle).rejects.toMatchObject({ code: "CURRICULUM_STEP_TEST_REQUIRED" });
    await expect(getStepProgress({ db, userId: "user-bypass" })).resolves.toStrictEqual([]);
  });

  it("is idempotent when marking the same step complete repeatedly", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "repeat@example.com", id: "user-repeat", name: "Repeat User" });
    await toggleStep(
      { completed: true, stepId: "level-1/zen:step-3" },
      { db, userId: "user-repeat" },
    );

    // Act
    const second = await toggleStep(
      { completed: true, stepId: "level-1/zen:step-3" },
      { db, userId: "user-repeat" },
    );
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-repeat"));
    const progress = await getStepProgress({ db, userId: "user-repeat" });

    // Assert
    expect(second).toStrictEqual({ completed: true, stepId: "level-1/zen:step-3" });
    expect(dogRows).toHaveLength(1);
    expect(progress).toStrictEqual(["level-1/zen:step-3"]);
  });

  it("creates only one Dog and persists both steps under concurrent toggleStep calls", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({
      email: "concurrent@example.com",
      id: "user-concurrent",
      name: "Concurrent User",
    });

    // Act
    const results = await Promise.all([
      toggleStep(
        { completed: true, stepId: "level-1/zen:step-3" },
        { db, userId: "user-concurrent" },
      ),
      toggleStep(
        { completed: true, stepId: "level-1/come:step-2" },
        { db, userId: "user-concurrent" },
      ),
    ]);
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-concurrent"));
    const progress = await getStepProgress({ db, userId: "user-concurrent" });

    // Assert
    expect(results).toStrictEqual([
      { completed: true, stepId: "level-1/zen:step-3" },
      { completed: true, stepId: "level-1/come:step-2" },
    ]);
    expect(dogRows).toHaveLength(1);
    expect(dogRows[0]).toMatchObject({ name: "My Dog", userId: "user-concurrent" });
    expect(progress).toStrictEqual(["level-1/come:step-2", "level-1/zen:step-3"]);
  });

  it("reads and writes progress strictly on the user's first Dog ordered by created_at ASC", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "multidog@example.com", id: "user-multidog", name: "Multi Dog" });
    await db.insert(dogs).values([
      {
        createdAt: LATER_TIMESTAMP,
        id: "dog-second",
        name: "Second",
        updatedAt: LATER_TIMESTAMP,
        userId: "user-multidog",
      },
      {
        createdAt: EARLIER_TIMESTAMP,
        id: "dog-first",
        name: "First",
        updatedAt: EARLIER_TIMESTAMP,
        userId: "user-multidog",
      },
    ]);

    // Act
    await toggleStep(
      { completed: true, stepId: "level-1/sit:step-1" },
      { db, userId: "user-multidog" },
    );
    const completionsFirst = await db
      .select()
      .from(stepCompletions)
      .where(eq(stepCompletions.dogId, "dog-first"));
    const completionsSecond = await db
      .select()
      .from(stepCompletions)
      .where(eq(stepCompletions.dogId, "dog-second"));
    const progress = await getStepProgress({ db, userId: "user-multidog" });

    // Assert
    expect(completionsFirst).toHaveLength(1);
    expect(completionsSecond).toHaveLength(0);
    expect(progress).toStrictEqual(["level-1/sit:step-1"]);
  });

  it("avoids creating a dog when unchecking a step for a user with no dog", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({
      email: "uncheck-nodog@example.com",
      id: "user-uncheck-nodog",
      name: "Uncheck No Dog",
    });

    // Act
    const result = await toggleStep(
      { completed: false, stepId: "level-1/zen:step-3" },
      { db, userId: "user-uncheck-nodog" },
    );
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-uncheck-nodog"));

    // Assert
    expect(result).toStrictEqual({ completed: false, stepId: "level-1/zen:step-3" });
    expect(dogRows).toHaveLength(0);
  });

  it("deletes only the unchecked step completion for an existing dog", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "uncheck@example.com", id: "user-uncheck", name: "Uncheck User" });
    await toggleStep(
      { completed: true, stepId: "level-1/zen:step-3" },
      { db, userId: "user-uncheck" },
    );
    await toggleStep(
      { completed: true, stepId: "level-1/zen:step-2" },
      { db, userId: "user-uncheck" },
    );

    // Act
    const removed = await toggleStep(
      { completed: false, stepId: "level-1/zen:step-3" },
      { db, userId: "user-uncheck" },
    );
    const remaining = await getStepProgress({ db, userId: "user-uncheck" });

    // Assert
    expect(removed).toStrictEqual({ completed: false, stepId: "level-1/zen:step-3" });
    expect(remaining).toStrictEqual(["level-1/zen:step-2"]);
  });

  it("idempotently handles unchecking an already incomplete step", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({
      email: "uncheck-idempotent@example.com",
      id: "user-uncheck-idempotent",
      name: "Uncheck Idempotent",
    });
    await toggleStep(
      { completed: true, stepId: "level-1/zen:step-2" },
      { db, userId: "user-uncheck-idempotent" },
    );

    // Act
    const result = await toggleStep(
      { completed: false, stepId: "level-1/zen:step-3" },
      { db, userId: "user-uncheck-idempotent" },
    );
    const remaining = await getStepProgress({ db, userId: "user-uncheck-idempotent" });

    // Assert
    expect(result).toStrictEqual({ completed: false, stepId: "level-1/zen:step-3" });
    expect(remaining).toStrictEqual(["level-1/zen:step-2"]);
  });

  it("rejects unknown step IDs with ApplicationError", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "badstep@example.com", id: "user-badstep", name: "Bad Step" });

    // Act
    const action = toggleStep(
      { completed: true, stepId: "level-1/nonexistent:step-1" },
      { db, userId: "user-badstep" },
    );

    // Assert
    await expect(action).rejects.toMatchObject({
      code: "CURRICULUM_STEP_NOT_FOUND",
      name: ApplicationError.name,
    });
  });

  it("does not create a dog when toggleStep rejects an unknown step ID", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({
      email: "badstep-nodog@example.com",
      id: "user-badstep-nodog",
      name: "Bad Step No Dog",
    });

    // Act
    const [outcome] = await Promise.allSettled([
      toggleStep(
        { completed: true, stepId: "level-1/nonexistent:step-1" },
        { db, userId: "user-badstep-nodog" },
      ),
    ]);
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-badstep-nodog"));

    // Assert
    expect(outcome.status).toBe("rejected");
    expect(dogRows).toHaveLength(0);
  });

  it("isolates step completions cleanly per user", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values([
      { email: "alice@example.com", id: "user-alice", name: "Alice" },
      { email: "bob@example.com", id: "user-bob", name: "Bob" },
    ]);

    // Act
    await toggleStep(
      { completed: true, stepId: "level-2/focus:step-3" },
      { db, userId: "user-alice" },
    );
    await toggleStep({ completed: true, stepId: "level-3/zen:step-4" }, { db, userId: "user-bob" });
    const aliceProgress = await getStepProgress({ db, userId: "user-alice" });
    const bobProgress = await getStepProgress({ db, userId: "user-bob" });
    const allDogs = await db.select().from(dogs).orderBy(asc(dogs.userId));

    // Assert
    expect(aliceProgress).toStrictEqual(["level-2/focus:step-3"]);
    expect(bobProgress).toStrictEqual(["level-3/zen:step-4"]);
    expect(allDogs.map((row) => row.userId)).toStrictEqual(["user-alice", "user-bob"]);
  });

  it("unmarks a step when the user has no dog yet", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);
    await db.insert(user).values({ email: "nodog@example.com", id: "user-nodog", name: "No Dog" });

    const result = await toggleStep(
      { completed: false, stepId: "level-1/zen:step-2" },
      { db, userId: "user-nodog" },
    );

    expect(result).toStrictEqual({ completed: false, stepId: "level-1/zen:step-2" });
  });

  it("requires a passing step test for level-1/zen:step-1 when a dog exists without one", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "notest@example.com", id: "user-notest", name: "No Test" });
    await toggleStep(
      { completed: true, stepId: "level-1/zen:step-2" },
      { db, userId: "user-notest" },
    );

    await expect(
      toggleStep({ completed: true, stepId: "level-1/zen:step-1" }, { db, userId: "user-notest" }),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_TEST_REQUIRED" });
  });

  it("requires a passing step test for level-1/zen:step-1 when the user has no dog", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);
    await db.insert(user).values({
      email: "notest-nodog@example.com",
      id: "user-notest-nodog",
      name: "No Test No Dog",
    });

    await expect(
      toggleStep(
        { completed: true, stepId: "level-1/zen:step-1" },
        { db, userId: "user-notest-nodog" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_TEST_REQUIRED" });
  });

  it("allows idempotent completion of level-1/zen:step-1 when already completed", async () => {
    expect.hasAssertions();
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "already-done@example.com", id: "user-already-done", name: "Already Done" });
    await db.insert(dogs).values({ id: "dog-already-done", userId: "user-already-done" });
    await db.insert(stepCompletions).values({
      dogId: "dog-already-done",
      stepId: "level-1/zen:step-1",
    });

    const result = await toggleStep(
      { completed: true, stepId: "level-1/zen:step-1" },
      { db, userId: "user-already-done" },
    );

    expect(result).toStrictEqual({ completed: true, stepId: "level-1/zen:step-1" });
  });
});
