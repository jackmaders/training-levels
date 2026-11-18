import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../../api/generalization-query-options";
import {
  saveComeafterRecordFn,
  saveHomeworkReflectionFn,
} from "../../api/generalization.functions";
import {
  useSaveComeafterAction,
  useSaveHomeworkReflectionAction,
} from "../use-generalization-actions";

vi.mock(import("../../api/generalization.functions"));

const UPDATED_AT = new Date("2026-04-01T12:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("save comeafter action", () => {
  it("saves a comeafter record when cache is empty and invalidates page generalization query", async () => {
    expect.hasAssertions();

    // Arrange
    const savedRecord = {
      note: "Practiced in yard",
      status: "practicing" as const,
      stepId: "level-1/zen:step-1",
      updatedAt: UPDATED_AT,
    };
    vi.mocked(saveComeafterRecordFn).mockResolvedValueOnce(savedRecord);
    const { queryClient, wrapper } = createTestingWrapper();
    const { queryKey } = pageGeneralizationQueryOptions("level-1/zen");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSaveComeafterAction("level-1/zen"), { wrapper });

    // Act
    await act(async () => {
      await result.current.mutateAsync({
        note: "Practiced in yard",
        status: "practicing",
        stepId: "level-1/zen:step-1",
      });
    });

    // Assert
    expect(saveComeafterRecordFn).toHaveBeenCalledWith({
      data: { note: "Practiced in yard", status: "practicing", stepId: "level-1/zen:step-1" },
    });
    expect(queryClient.getQueryData(queryKey)).toStrictEqual({
      ...EMPTY_PAGE_GENERALIZATION,
      comeafters: { "level-1/zen:step-1": savedRecord },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
  });

  it("merges saved comeafter into existing cached page generalization state", async () => {
    expect.hasAssertions();

    // Arrange
    const existingRecord = {
      note: "Standing up",
      status: "completed" as const,
      stepId: "level-1/zen:step-1",
      updatedAt: UPDATED_AT,
    };
    const nextRecord = {
      note: "Kitchen doorway",
      status: "practicing" as const,
      stepId: "level-1/zen:step-2",
      updatedAt: UPDATED_AT,
    };
    vi.mocked(saveComeafterRecordFn).mockResolvedValueOnce(nextRecord);
    const { queryClient, wrapper } = createTestingWrapper();
    const { queryKey } = pageGeneralizationQueryOptions("level-1/zen");
    queryClient.setQueryData(queryKey, {
      comeafters: { "level-1/zen:step-1": existingRecord },
      homeworkReflection: null,
      latestStepTests: { "level-1/zen:step-1": "success" },
    });
    const { result } = renderHook(() => useSaveComeafterAction("level-1/zen"), { wrapper });

    // Act
    await act(async () => {
      await result.current.mutateAsync({
        note: "Kitchen doorway",
        status: "practicing",
        stepId: "level-1/zen:step-2",
      });
    });

    // Assert
    expect(queryClient.getQueryData(queryKey)).toStrictEqual({
      comeafters: {
        "level-1/zen:step-1": existingRecord,
        "level-1/zen:step-2": nextRecord,
      },
      homeworkReflection: null,
      latestStepTests: { "level-1/zen:step-1": "success" },
    });
  });

  it("exposes mutation error when saving comeafter fails", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(saveComeafterRecordFn).mockRejectedValueOnce(new Error("Comeafter save failed"));
    const { wrapper } = createTestingWrapper();
    const { result } = renderHook(() => useSaveComeafterAction("level-1/zen"), { wrapper });

    // Act
    act(() => {
      result.current.mutate({
        note: "",
        status: "practicing",
        stepId: "level-1/zen:step-1",
      });
    });

    // Assert
    await waitFor(() => {
      expect(result.current.error?.message).toBe("Comeafter save failed");
    });
  });
});

describe("save homework reflection action", () => {
  it("saves homework reflection for empty and seeded caches and invalidates query", async () => {
    expect.hasAssertions();

    // Arrange
    const savedFirst = {
      pageSlug: "level-1/homework",
      reflection: "First reflection",
      updatedAt: UPDATED_AT,
    };
    const savedSecond = {
      pageSlug: "level-1/homework",
      reflection: "Updated reflection",
      updatedAt: UPDATED_AT,
    };
    vi.mocked(saveHomeworkReflectionFn)
      .mockResolvedValueOnce(savedFirst)
      .mockResolvedValueOnce(savedSecond);
    const { queryClient, wrapper } = createTestingWrapper();
    const { queryKey } = pageGeneralizationQueryOptions("level-1/homework");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSaveHomeworkReflectionAction("level-1/homework"), {
      wrapper,
    });

    // Act
    await act(async () => {
      await result.current.mutateAsync({
        pageSlug: "level-1/homework",
        reflection: "First reflection",
      });
    });
    await act(async () => {
      await result.current.mutateAsync({
        pageSlug: "level-1/homework",
        reflection: "Updated reflection",
      });
    });

    // Assert
    expect(saveHomeworkReflectionFn).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryData(queryKey)).toStrictEqual({
      ...EMPTY_PAGE_GENERALIZATION,
      homeworkReflection: savedSecond,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
  });

  it("exposes mutation error when saving homework reflection fails", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(saveHomeworkReflectionFn).mockRejectedValueOnce(new Error("Homework save failed"));
    const { wrapper } = createTestingWrapper();
    const { result } = renderHook(() => useSaveHomeworkReflectionAction("level-1/homework"), {
      wrapper,
    });

    // Act
    act(() => {
      result.current.mutate({
        pageSlug: "level-1/homework",
        reflection: "Notes",
      });
    });

    // Assert
    await waitFor(() => {
      expect(result.current.error?.message).toBe("Homework save failed");
    });
  });
});
