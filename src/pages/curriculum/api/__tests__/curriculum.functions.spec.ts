import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { hasPermission } from "@/shared/auth/permissions";
import { ensureSession } from "@/shared/auth/session.server";
import { ApplicationError } from "@/shared/errors";
import { TEST_SYLLABUS, TEST_THEORY_PAGE } from "@test/vitest/fixtures/curriculum";
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

beforeEach(() => {
  vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
});

describe("curriculum functions getCurriculumSyllabusFn", () => {
  it("delegates to getSyllabus after checking curriculum:read permission", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getSyllabus).mockReturnValueOnce(TEST_SYLLABUS);

    // Act
    const result = await getCurriculumSyllabusFn();

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getSyllabus).toHaveBeenCalledOnce();
    expect(result).toStrictEqual(TEST_SYLLABUS);
  });

  it("rejects unauthenticated callers with USER_UNAUTHENTICATED without calling getSyllabus", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act
    const action = getCurriculumSyllabusFn();

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });
    expect(getSyllabus).not.toHaveBeenCalled();
  });

  it("rejects forbidden callers with USER_FORBIDDEN without calling getSyllabus", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(hasPermission).mockReturnValueOnce(false);

    // Act
    const action = getCurriculumSyllabusFn();

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
    expect(getSyllabus).not.toHaveBeenCalled();
  });
});

describe("curriculum functions getCurriculumPageFn", () => {
  it("trims pageSlug and delegates to getPage after checking curriculum:read permission", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getPage).mockReturnValueOnce(TEST_THEORY_PAGE);

    // Act
    const result = await getCurriculumPageFn({ data: { pageSlug: "  theory/01-foreword  " } });

    // Assert
    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getPage).toHaveBeenCalledWith("theory/01-foreword");
    expect(result).toStrictEqual(TEST_THEORY_PAGE);
  });

  it("returns null when getPage finds no matching page", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(getPage).mockReturnValueOnce(null);

    // Act
    const result = await getCurriculumPageFn({ data: { pageSlug: "level-1/nonexistent" } });

    // Assert
    expect(getPage).toHaveBeenCalledWith("level-1/nonexistent");
    expect(result).toBeNull();
  });

  it("rejects unauthenticated callers with USER_UNAUTHENTICATED without calling getPage", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act
    const action = getCurriculumPageFn({ data: { pageSlug: "theory/01-foreword" } });

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });
    expect(getPage).not.toHaveBeenCalled();
  });

  it("rejects forbidden callers with USER_FORBIDDEN without calling getPage", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(hasPermission).mockReturnValueOnce(false);

    // Act
    const action = getCurriculumPageFn({ data: { pageSlug: "theory/01-foreword" } });

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
    expect(getPage).not.toHaveBeenCalled();
  });

  it("rejects malformed page slugs during input validation without calling getPage", async () => {
    expect.assertions(2);

    // Act
    const action = getCurriculumPageFn({ data: { pageSlug: "../bad" } });

    // Assert
    await expect(action).rejects.toThrow("Invalid curriculum page slug");
    expect(getPage).not.toHaveBeenCalled();
  });
});

describe("curriculum functions getStepProgressFn", () => {
  it("delegates to getStepProgress with authenticated userId after checking curriculum:read", async () => {
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

  it("rejects unauthenticated callers with USER_UNAUTHENTICATED without calling getStepProgress", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act
    const action = getStepProgressFn();

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });
    expect(getStepProgress).not.toHaveBeenCalled();
  });

  it("rejects forbidden callers with USER_FORBIDDEN without calling getStepProgress", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(hasPermission).mockReturnValueOnce(false);

    // Act
    const action = getStepProgressFn();

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
    expect(getStepProgress).not.toHaveBeenCalled();
  });
});

describe("curriculum functions toggleStepFn", () => {
  it("validates and delegates to toggleStep after checking progress:update permission", async () => {
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

  it("rejects unauthenticated callers with USER_UNAUTHENTICATED without calling toggleStep", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new ApplicationError("USER_UNAUTHENTICATED"));

    // Act
    const action = toggleStepFn({ data: { completed: true, stepId: "level-1/zen:step-1" } });

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_UNAUTHENTICATED" });
    expect(toggleStep).not.toHaveBeenCalled();
  });

  it("rejects forbidden callers with USER_FORBIDDEN without calling toggleStep", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(hasPermission).mockReturnValueOnce(false);

    // Act
    const action = toggleStepFn({ data: { completed: true, stepId: "level-1/zen:step-1" } });

    // Assert
    await expect(action).rejects.toMatchObject({ code: "USER_FORBIDDEN" });
    expect(toggleStep).not.toHaveBeenCalled();
  });

  it("rejects blank step IDs during input validation without calling toggleStep", async () => {
    expect.assertions(2);

    // Act
    const action = toggleStepFn({ data: { completed: true, stepId: "   " } });

    // Assert
    await expect(action).rejects.toThrow("Step ID is required");
    expect(toggleStep).not.toHaveBeenCalled();
  });
});
