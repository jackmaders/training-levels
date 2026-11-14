import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vite-plus/test";

import { dogs, type Dog } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";

const MILLISECOND_EPOCH_THRESHOLD = 1_000_000_000_000;

beforeEach(async () => {
  const db = getDb(env.DB);
  await db
    .insert(user)
    .values([
      { email: "dog-owner-a@example.com", id: "owner-a", name: "Owner A" },
      { email: "dog-owner-b@example.com", id: "owner-b", name: "Owner B" },
    ])
    .onConflictDoNothing();
});

describe("dogs schema", () => {
  it("persists a dog with default name, generated id, and millisecond timestamps", async () => {
    expect.assertions(4);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const [created]: Dog[] = await db.insert(dogs).values({ userId: "owner-a" }).returning();

    // Assert
    expect(created).toMatchObject({ name: "My Dog", userId: "owner-a" });
    expect(created?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu);
    expect(created?.createdAt.getTime()).toBeGreaterThan(MILLISECOND_EPOCH_THRESHOLD);
    expect(created?.updatedAt.getTime()).toBeGreaterThan(MILLISECOND_EPOCH_THRESHOLD);
  });

  it("allows multiple dogs for the same user via non-unique dogs_user_id_idx", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);

    // Act
    await db.insert(dogs).values([
      { name: "First Dog", userId: "owner-a" },
      { name: "Second Dog", userId: "owner-a" },
    ]);
    const ownerDogs = await db.select().from(dogs).where(eq(dogs.userId, "owner-a"));

    // Assert
    expect(ownerDogs).toHaveLength(2);
    expect(ownerDogs.map((dog) => dog.name)).toStrictEqual(["First Dog", "Second Dog"]);
  });

  it("rejects inserting a dog for a nonexistent user", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = db.insert(dogs).values({ userId: "missing-user" });

    // Assert
    await expect(action).rejects.toMatchObject({
      cause: {
        message: expect.stringContaining("FOREIGN KEY constraint failed") as unknown,
      },
    });
  });

  it("cascades user deletion to owned dogs without affecting other users", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await db.insert(dogs).values([
      { name: "Owner A Dog", userId: "owner-a" },
      { name: "Owner B Dog", userId: "owner-b" },
    ]);

    // Act
    await db.delete(user).where(eq(user.id, "owner-a"));
    const remainingOwnerADogs = await db.select().from(dogs).where(eq(dogs.userId, "owner-a"));
    const remainingOwnerBDogs = await db.select().from(dogs).where(eq(dogs.userId, "owner-b"));

    // Assert
    expect(remainingOwnerADogs).toHaveLength(0);
    expect(remainingOwnerBDogs).toHaveLength(1);
  });
});
