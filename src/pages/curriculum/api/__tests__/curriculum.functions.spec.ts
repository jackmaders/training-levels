import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { hasPermission } from "@/shared/auth/permissions";
import { ensureSession } from "@/shared/auth/session.server";
import type { CurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";
import { ApplicationError } from "@/shared/errors";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

import { getPage, getStepProgress, getSyllabus, toggleStep } from "../curriculum-service";
import {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
  toggleStepFn,
} from "../curriculum.functions";

vi.mock(import("@tanstack/react-start"));
vi.mock(import("@/shared/auth/session.server"));
vi.mock(import("@/shared/auth/permissions"), { spy: true });
vi.mock(import("../curriculum-service"));

const MOCK_SYLLABUS: CurriculumSyllabus = {
  sections: [],
  totalBehaviors: 0,
  totalPages: 0,
  totalSteps: 0,
};

const MOCK_PAGE: CurriculumPage = {
  blocks: [],
  href: "/theory/01-foreword",
  kind: "theory",
  nextPage: null,
  pageSlug: "theory/01-foreword",
  previousPage: null,
  sectionSlug: "theory",
  title: "Foreword",
};

beforeEach(() => {
  vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
});

describe("curriculum server functions", () => {
  it("delegates getCurriculumSyllabusFn after checking curriculum:read permission", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getSyllabus).mockReturnValueOnce(MOCK_SYLLABUS);

    // Act
    const result = await getCurriculumSyllabusFn();

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getSyllabus).toHaveBeenCalledOnce();
    expect(result).toStrictEqual(MOCK_SYLLABUS);
  });

  it("rejects unauthenticated or forbidden callers on getCurriculumSyllabusFn", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act & Assert
    await expect(getCurriculumSyllabusFn()).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });

    vi.mocked(hasPermission).mockReturnValueOnce(false);
    await expect(getCurriculumSyllabusFn()).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
  });

  it("validates pageSlug and delegates getCurriculumPageFn with curriculum:read permission", async () => {
    expect.assertions(5);

    // Arrange
    vi.mocked(getPage).mockReturnValueOnce(MOCK_PAGE);
    vi.mocked(getPage).mockReturnValueOnce(null);

    // Act
    const found = await getCurriculumPageFn({ data: { pageSlug: "  theory/01-foreword  " } });
    const missing = await getCurriculumPageFn({ data: { pageSlug: "level-1/nonexistent" } });

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getPage).toHaveBeenNthCalledWith(1, "theory/01-foreword");
    expect(getPage).toHaveBeenNthCalledWith(2, "level-1/nonexistent");
    expect(found).toStrictEqual(MOCK_PAGE);
    expect(missing).toBeNull();
  });

  it("rejects unauthorized and malformed requests on getCurriculumPageFn", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act & Assert
    await expect(
      getCurriculumPageFn({ data: { pageSlug: "theory/01-foreword" } }),
    ).rejects.toMatchObject({
      code: "USER_UNAUTHENTICATED",
    });

    vi.mocked(hasPermission).mockReturnValueOnce(false);
    await expect(
      getCurriculumPageFn({ data: { pageSlug: "theory/01-foreword" } }),
    ).rejects.toMatchObject({
      code: "USER_FORBIDDEN",
    });

    await expect(getCurriculumPageFn({ data: { pageSlug: "../bad" } })).rejects.toThrow(
      "Invalid curriculum page slug",
    );
  });

  it("delegates getStepProgressFn with authenticated userId after checking curriculum:read", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getStepProgress).mockResolvedValueOnce(["level-1/zen:step-1"]);

    // Act
    const result = await getStepProgressFn();

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getStepProgress).toHaveBeenCalledWith({ userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual(["level-1/zen:step-1"]);
  });

  it("rejects unauthenticated or forbidden callers on getStepProgressFn", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act & Assert
    await expect(getStepProgressFn()).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });

    vi.mocked(hasPermission).mockReturnValueOnce(false);
    await expect(getStepProgressFn()).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
  });

  it("validates and delegates toggleStepFn after checking progress:update permission", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(toggleStep).mockResolvedValueOnce({ completed: true, stepId: "level-1/zen:step-1" });

    // Act
    const result = await toggleStepFn({
      data: { completed: true, stepId: "  level-1/zen:step-1  " },
    });

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(toggleStep).toHaveBeenCalledWith(
      { completed: true, stepId: "level-1/zen:step-1" },
      { userId: TEST_SESSION.user.id },
    );
    expect(result).toStrictEqual({ completed: true, stepId: "level-1/zen:step-1" });
  });

  it("rejects unauthenticated, forbidden, and malformed requests on toggleStepFn", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act & Assert
    await expect(
      toggleStepFn({ data: { completed: true, stepId: "level-1/zen:step-1" } }),
    ).rejects.toMatchObject({
      code: "USER_UNAUTHENTICATED",
    });

    vi.mocked(hasPermission).mockReturnValueOnce(false);
    await expect(
      toggleStepFn({ data: { completed: true, stepId: "level-1/zen:step-1" } }),
    ).rejects.toMatchObject({
      code: "USER_FORBIDDEN",
    });

    await expect(toggleStepFn({ data: { completed: true, stepId: "   " } })).rejects.toThrow(
      "Step ID is required",
    );
  });
});
