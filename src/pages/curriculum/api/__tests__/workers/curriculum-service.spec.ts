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
  it("returns the full syllabus and individual pages or null for unknown slugs", () => {
    expect.assertions(5);

    // Arrange & Act
    const syllabus = getSyllabus();
    const zen = getPage("level-1/zen");
    const unknown = getPage("level-1/nonexistent");

    // Assert
    expect(syllabus.totalPages).toBe(EXPECTED_PAGE_COUNT);
    expect(syllabus.totalSteps).toBe(EXPECTED_STEP_COUNT);
    expect(zen?.kind).toBe("behavior");
    expect(zen?.title).toBe("Level 1: Zen");
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

  it("lazily creates a stub Dog on first completion and is idempotent across repeats", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values({ email: "lazy@example.com", id: "user-lazy", name: "Lazy User" });

    // Act (first call exercises default getDb() fallback)
    const first = await toggleStep(
      { completed: true, stepId: "level-1/zen:step-1" },
      { userId: "user-lazy" },
    );
    const second = await toggleStep(
      { completed: true, stepId: "level-1/zen:step-1" },
      { db, userId: "user-lazy" },
    );
    await toggleStep(
      { completed: true, stepId: "level-1/come:step-2" },
      { db, userId: "user-lazy" },
    );
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-lazy"));
    const progress = await getStepProgress({ db, userId: "user-lazy" });

    // Assert
    expect(first).toStrictEqual({ completed: true, stepId: "level-1/zen:step-1" });
    expect(second).toStrictEqual({ completed: true, stepId: "level-1/zen:step-1" });
    expect(dogRows).toMatchObject([{ name: "My Dog", userId: "user-lazy" }]);
    expect(progress).toStrictEqual(["level-1/come:step-2", "level-1/zen:step-1"]);
  });

  it("reads and writes progress strictly on the user's first Dog ordered by created_at ASC", async () => {
    expect.assertions(2);

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

    // Assert
    expect(completionsFirst).toHaveLength(1);
    expect(completionsSecond).toHaveLength(0);
  });

  it("idempotently deletes completions and avoids DB writes when unchecking without a dog", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "uncheck@example.com", id: "user-uncheck", name: "Uncheck User" });

    // Act
    const noDogResult = await toggleStep(
      { completed: false, stepId: "level-1/zen:step-1" },
      { db, userId: "user-uncheck" },
    );
    const dogsBefore = await db.select().from(dogs).where(eq(dogs.userId, "user-uncheck"));
    await toggleStep(
      { completed: true, stepId: "level-1/zen:step-1" },
      { db, userId: "user-uncheck" },
    );
    await toggleStep(
      { completed: true, stepId: "level-1/zen:step-2" },
      { db, userId: "user-uncheck" },
    );
    const removed = await toggleStep(
      { completed: false, stepId: "level-1/zen:step-1" },
      { db, userId: "user-uncheck" },
    );
    await toggleStep(
      { completed: false, stepId: "level-1/zen:step-1" },
      { db, userId: "user-uncheck" },
    );
    const remaining = await getStepProgress({ db, userId: "user-uncheck" });

    // Assert
    expect(noDogResult).toStrictEqual({ completed: false, stepId: "level-1/zen:step-1" });
    expect(dogsBefore).toHaveLength(0);
    expect(removed).toStrictEqual({ completed: false, stepId: "level-1/zen:step-1" });
    expect(remaining).toStrictEqual(["level-1/zen:step-2"]);
  });

  it("rejects unknown step IDs with ApplicationError without creating a dog", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "badstep@example.com", id: "user-badstep", name: "Bad Step" });

    // Act & Assert
    await expect(
      toggleStep(
        { completed: true, stepId: "level-1/nonexistent:step-1" },
        { db, userId: "user-badstep" },
      ),
    ).rejects.toMatchObject({
      code: "CURRICULUM_STEP_NOT_FOUND",
      name: ApplicationError.name,
    });
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "user-badstep"));
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
});
