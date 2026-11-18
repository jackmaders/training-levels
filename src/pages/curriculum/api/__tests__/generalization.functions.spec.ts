import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { hasPermission } from "@/shared/auth/permissions";
import { ensureSession } from "@/shared/auth/session.server";
import { ApplicationError } from "@/shared/errors";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

import {
  getPageGeneralization,
  saveComeafterRecord,
  saveHomeworkReflection,
} from "../generalization-service";
import {
  getPageGeneralizationFn,
  saveComeafterRecordFn,
  saveHomeworkReflectionFn,
} from "../generalization.functions";

vi.mock(import("@tanstack/react-start"));
vi.mock(import("@/shared/auth/session.server"));
vi.mock(import("@/shared/auth/permissions"), { spy: true });
vi.mock(import("../generalization-service"));

const UPDATED_AT = new Date("2026-03-01T12:00:00.000Z");

beforeEach(() => {
  vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
});

describe("generalization functions getPageGeneralizationFn", () => {
  it("validates pageSlug and delegates to getPageGeneralization after checking curriculum:read", async () => {
    expect.assertions(3);

    // Arrange
    const expected = { comeafters: {}, homeworkReflection: null, latestStepTests: {} };
    vi.mocked(getPageGeneralization).mockResolvedValueOnce(expected);

    // Act
    const result = await getPageGeneralizationFn({ data: { pageSlug: "  level-1/zen  " } });

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getPageGeneralization).toHaveBeenCalledWith("level-1/zen", {
      userId: TEST_SESSION.user.id,
    });
    expect(result).toStrictEqual(expected);
  });

  it("rejects unauthenticated and forbidden callers without calling getPageGeneralization", async () => {
    expect.assertions(4);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act & Assert unauthenticated
    await expect(
      getPageGeneralizationFn({ data: { pageSlug: "level-1/zen" } }),
    ).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });
    expect(getPageGeneralization).not.toHaveBeenCalled();

    // Arrange forbidden
    vi.mocked(hasPermission).mockReturnValueOnce(false);

    // Act & Assert forbidden
    await expect(
      getPageGeneralizationFn({ data: { pageSlug: "level-1/zen" } }),
    ).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
    expect(getPageGeneralization).not.toHaveBeenCalled();
  });
});

describe("generalization functions saveComeafterRecordFn", () => {
  it("validates input and delegates to saveComeafterRecord after checking progress:update", async () => {
    expect.assertions(3);

    // Arrange
    const saved = {
      note: "Standing up",
      status: "practicing" as const,
      stepId: "level-1/zen:step-1",
      updatedAt: UPDATED_AT,
    };
    vi.mocked(saveComeafterRecord).mockResolvedValueOnce(saved);

    // Act
    const result = await saveComeafterRecordFn({
      data: { note: "  Standing up  ", status: "practicing", stepId: "  level-1/zen:step-1  " },
    });

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(saveComeafterRecord).toHaveBeenCalledWith(
      { note: "Standing up", status: "practicing", stepId: "level-1/zen:step-1" },
      { userId: TEST_SESSION.user.id },
    );
    expect(result).toStrictEqual(saved);
  });

  it("rejects forbidden callers and invalid payloads without calling saveComeafterRecord", async () => {
    expect.assertions(4);

    // Arrange
    vi.mocked(hasPermission).mockReturnValueOnce(false);

    // Act & Assert forbidden
    await expect(
      saveComeafterRecordFn({
        data: { note: "Standing", status: "practicing", stepId: "level-1/zen:step-1" },
      }),
    ).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
    expect(saveComeafterRecord).not.toHaveBeenCalled();

    // Act & Assert invalid input
    await expect(
      saveComeafterRecordFn({
        data: { note: "Standing", status: "practicing", stepId: "   " },
      }),
    ).rejects.toThrow("Step ID is required");
    expect(saveComeafterRecord).not.toHaveBeenCalled();
  });
});

describe("generalization functions saveHomeworkReflectionFn", () => {
  it("validates input and delegates to saveHomeworkReflection after checking progress:update", async () => {
    expect.assertions(3);

    // Arrange
    const saved = {
      pageSlug: "level-1/homework",
      reflection: "Practiced daily.",
      updatedAt: UPDATED_AT,
    };
    vi.mocked(saveHomeworkReflection).mockResolvedValueOnce(saved);

    // Act
    const result = await saveHomeworkReflectionFn({
      data: { pageSlug: "  level-1/homework ", reflection: "  Practiced daily.  " },
    });

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(saveHomeworkReflection).toHaveBeenCalledWith(
      { pageSlug: "level-1/homework", reflection: "Practiced daily." },
      { userId: TEST_SESSION.user.id },
    );
    expect(result).toStrictEqual(saved);
  });

  it("rejects non-homework slugs and unauthenticated callers", async () => {
    expect.assertions(4);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act & Assert unauthenticated
    await expect(
      saveHomeworkReflectionFn({
        data: { pageSlug: "level-1/homework", reflection: "Notes" },
      }),
    ).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });
    expect(saveHomeworkReflection).not.toHaveBeenCalled();

    // Act & Assert invalid slug
    await expect(
      saveHomeworkReflectionFn({
        data: { pageSlug: "level-1/zen", reflection: "Notes" },
      }),
    ).rejects.toThrow("Invalid homework page slug");
    expect(saveHomeworkReflection).not.toHaveBeenCalled();
  });
});
