import { env } from "cloudflare:workers";
import { eq, inArray } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import {
  comeafterRecords,
  dogs,
  homeworkReflections,
  stepCompletions,
  stepTests,
} from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";

import {
  getPageGeneralization,
  saveComeafterRecord,
  saveHomeworkReflection,
} from "../../generalization-service";

const EARLIER_TIMESTAMP = new Date("2026-01-01T00:00:00.000Z");
const LATER_TIMESTAMP = new Date("2026-02-01T00:00:00.000Z");

async function resolvedEmpty(): Promise<never[]> {
  return await Promise.resolve([]);
}

describe("generalization-service (workers D1)", () => {
  it("returns empty state with zero DB writes when the user has no dog", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "gen-nodog@example.com", id: "gen-user-nodog", name: "No Dog" });

    // Act
    const behaviorState = await getPageGeneralization("level-1/zen", {
      userId: "gen-user-nodog",
    });
    const homeworkState = await getPageGeneralization("level-1/homework", {
      db,
      userId: "gen-user-nodog",
    });
    const overviewState = await getPageGeneralization("level-1/00-overview", {
      db,
      userId: "gen-user-nodog",
    });
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "gen-user-nodog"));

    // Assert
    expect(behaviorState).toStrictEqual({
      comeafters: {},
      homeworkReflection: null,
      latestStepTests: {},
    });
    expect(homeworkState).toStrictEqual({
      comeafters: {},
      homeworkReflection: null,
      latestStepTests: {},
    });
    expect(overviewState).toStrictEqual({
      comeafters: {},
      homeworkReflection: null,
      latestStepTests: {},
    });
    expect(dogRows).toHaveLength(0);
  });

  it("rejects invalid page slugs and invalid step IDs cleanly", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "gen-invalid@example.com", id: "gen-user-invalid", name: "Invalid" });

    // Act & Assert
    await expect(
      getPageGeneralization("level-1/nonexistent", { db, userId: "gen-user-invalid" }),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });
    await expect(
      saveComeafterRecord(
        { note: "Standing", status: "practicing", stepId: "level-1/zen:step-99" },
        { db, userId: "gen-user-invalid" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });
    await expect(
      saveHomeworkReflection(
        { pageSlug: "level-1/zen", reflection: "Not a homework page" },
        { db, userId: "gen-user-invalid" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });
    await expect(
      saveHomeworkReflection(
        { pageSlug: "level-1/nonexistent", reflection: "Missing page" },
        { db, userId: "gen-user-invalid" },
      ),
    ).rejects.toMatchObject({ code: "CURRICULUM_STEP_NOT_FOUND" });
  });

  it("persists and updates Comeafter records without inserting step_completions or step_tests", async () => {
    expect.assertions(5);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "gen-comeafter@example.com", id: "gen-user-comeafter", name: "Comeafter" });

    // Act
    const first = await saveComeafterRecord(
      { note: "Practiced standing in hallway", status: "practicing", stepId: "level-1/zen:step-1" },
      { userId: "gen-user-comeafter" },
    );
    const updated = await saveComeafterRecord(
      {
        note: "Generalized outside on leash",
        status: "completed",
        stepId: "level-1/zen:step-1",
      },
      { db, userId: "gen-user-comeafter" },
    );
    const pageState = await getPageGeneralization("level-1/zen", {
      db,
      userId: "gen-user-comeafter",
    });
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "gen-user-comeafter"));
    const dogIds = dogRows.map((row) => row.id);
    const completions = await db
      .select()
      .from(stepCompletions)
      .where(inArray(stepCompletions.dogId, dogIds));
    const tests = await db.select().from(stepTests).where(inArray(stepTests.dogId, dogIds));

    // Assert
    expect(first).toMatchObject({
      note: "Practiced standing in hallway",
      status: "practicing",
      stepId: "level-1/zen:step-1",
    });
    expect(updated).toMatchObject({
      note: "Generalized outside on leash",
      status: "completed",
      stepId: "level-1/zen:step-1",
    });
    expect(pageState.comeafters["level-1/zen:step-1"]).toMatchObject({
      note: "Generalized outside on leash",
      status: "completed",
      stepId: "level-1/zen:step-1",
    });
    expect(dogRows).toHaveLength(1);
    expect({ completions, tests }).toStrictEqual({ completions: [], tests: [] });
  });

  it("persists and updates Homework reflections across reloads without altering completions", async () => {
    expect.assertions(5);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "gen-homework@example.com", id: "gen-user-homework", name: "Homework" });

    // Act
    await saveHomeworkReflection(
      { pageSlug: "level-1/homework", reflection: "Short sessions in kitchen" },
      { userId: "gen-user-homework" },
    );
    const updated = await saveHomeworkReflection(
      { pageSlug: "level-1/homework", reflection: "Added calm settles in backyard" },
      { db, userId: "gen-user-homework" },
    );
    const pageState = await getPageGeneralization("level-1/homework", {
      db,
      userId: "gen-user-homework",
    });
    const emptyHomeworkState = await getPageGeneralization("level-2/homework", {
      db,
      userId: "gen-user-homework",
    });
    const dogRows = await db.select().from(dogs).where(eq(dogs.userId, "gen-user-homework"));
    const completions = await db
      .select()
      .from(stepCompletions)
      .where(
        inArray(
          stepCompletions.dogId,
          dogRows.map((row) => row.id),
        ),
      );

    // Assert
    expect(updated).toMatchObject({
      pageSlug: "level-1/homework",
      reflection: "Added calm settles in backyard",
    });
    expect(pageState.homeworkReflection).toMatchObject({
      pageSlug: "level-1/homework",
      reflection: "Added calm settles in backyard",
    });
    expect(emptyHomeworkState.homeworkReflection).toBeNull();
    expect(dogRows).toHaveLength(1);
    expect(completions).toHaveLength(0);
  });

  it("isolates Comeafter records and Homework reflections across distinct owners", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(user).values([
      { email: "gen-owner-a@example.com", id: "gen-owner-a", name: "Owner A" },
      { email: "gen-owner-b@example.com", id: "gen-owner-b", name: "Owner B" },
    ]);
    await db.insert(dogs).values([
      { id: "gen-dog-a", userId: "gen-owner-a" },
      { id: "gen-dog-b", userId: "gen-owner-b" },
    ]);

    // Act
    await saveComeafterRecord(
      { note: "Owner A note", status: "practicing", stepId: "level-1/zen:step-2" },
      { db, userId: "gen-owner-a" },
    );
    await saveHomeworkReflection(
      { pageSlug: "level-1/homework", reflection: "Owner A reflection" },
      { db, userId: "gen-owner-a" },
    );

    const ownerBZen = await getPageGeneralization("level-1/zen", { db, userId: "gen-owner-b" });
    const ownerBHomework = await getPageGeneralization("level-1/homework", {
      db,
      userId: "gen-owner-b",
    });

    await saveComeafterRecord(
      { note: "Owner B note", status: "completed", stepId: "level-1/zen:step-2" },
      { db, userId: "gen-owner-b" },
    );
    const ownerAZen = await getPageGeneralization("level-1/zen", { db, userId: "gen-owner-a" });

    // Assert
    expect(ownerBZen.comeafters).toStrictEqual({});
    expect(ownerBHomework.homeworkReflection).toBeNull();
    expect(ownerAZen.comeafters["level-1/zen:step-2"]).toMatchObject({
      note: "Owner A note",
      status: "practicing",
    });
    await expect(
      db.select().from(comeafterRecords).where(eq(comeafterRecords.dogId, "gen-dog-b")),
    ).resolves.toHaveLength(1);
  });

  it("reads and writes strictly on the user's primary Dog ordered by created_at ASC", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "gen-multidog@example.com", id: "gen-user-multidog", name: "Multi" });
    await db.insert(dogs).values([
      {
        createdAt: LATER_TIMESTAMP,
        id: "gen-dog-second",
        name: "Second",
        updatedAt: LATER_TIMESTAMP,
        userId: "gen-user-multidog",
      },
      {
        createdAt: EARLIER_TIMESTAMP,
        id: "gen-dog-first",
        name: "First",
        updatedAt: EARLIER_TIMESTAMP,
        userId: "gen-user-multidog",
      },
    ]);

    // Act
    await saveComeafterRecord(
      { note: "First dog note", status: "completed", stepId: "level-1/zen:step-3" },
      { db, userId: "gen-user-multidog" },
    );
    await saveHomeworkReflection(
      { pageSlug: "level-1/homework", reflection: "First dog reflection" },
      { db, userId: "gen-user-multidog" },
    );

    // Assert
    await expect(
      db.select().from(comeafterRecords).where(eq(comeafterRecords.dogId, "gen-dog-first")),
    ).resolves.toHaveLength(1);
    await expect(
      db.select().from(comeafterRecords).where(eq(comeafterRecords.dogId, "gen-dog-second")),
    ).resolves.toHaveLength(0);
    await expect(
      db.select().from(homeworkReflections).where(eq(homeworkReflections.dogId, "gen-dog-first")),
    ).resolves.toHaveLength(1);
    await expect(
      db.select().from(homeworkReflections).where(eq(homeworkReflections.dogId, "gen-dog-second")),
    ).resolves.toHaveLength(0);
  });

  it("returns the latest step_tests outcome per stepId in ascending test order", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    await db
      .insert(user)
      .values({ email: "gen-tests@example.com", id: "gen-user-tests", name: "Tests" });
    await db.insert(dogs).values({ id: "gen-dog-tests", userId: "gen-user-tests" });
    await db.insert(stepTests).values([
      {
        coldOverride: false,
        dogId: "gen-dog-tests",
        outcome: "success",
        stepId: "level-1/zen:step-1",
        testId: "test-1",
        testedAt: EARLIER_TIMESTAMP,
      },
      {
        coldOverride: false,
        dogId: "gen-dog-tests",
        outcome: "not_yet",
        stepId: "level-1/zen:step-1",
        testId: "test-2",
        testedAt: LATER_TIMESTAMP,
      },
      {
        coldOverride: false,
        dogId: "gen-dog-tests",
        outcome: "success",
        stepId: "level-1/zen:step-2",
        testId: "test-3",
        testedAt: EARLIER_TIMESTAMP,
      },
    ]);

    // Act
    const state = await getPageGeneralization("level-1/zen", {
      db,
      userId: "gen-user-tests",
    });
    const overviewState = await getPageGeneralization("level-1/00-overview", {
      db,
      userId: "gen-user-tests",
    });

    // Assert
    expect(state.latestStepTests).toStrictEqual({
      "level-1/zen:step-1": "not_yet",
      "level-1/zen:step-2": "success",
    });
    expect(state.comeafters).toStrictEqual({});
    expect(overviewState).toStrictEqual({
      comeafters: {},
      homeworkReflection: null,
      latestStepTests: {},
    });
  });

  it("throws INTERNAL_SERVER_ERROR when inserted dog cannot be read back", async () => {
    expect.assertions(1);

    // Arrange
    const stubDbEmpty = {
      insert: () => ({
        select: resolvedEmpty,
      }),
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: resolvedEmpty,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof getDb>;

    // Act & Assert
    await expect(
      saveComeafterRecord(
        { note: "Standing", status: "practicing", stepId: "level-1/zen:step-1" },
        { db: stubDbEmpty, userId: "stub-user" },
      ),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
