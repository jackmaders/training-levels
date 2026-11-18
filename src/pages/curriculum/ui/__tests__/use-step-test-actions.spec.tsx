import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { stepProgressQueryOptions } from "../../api/curriculum-query-options";
import { generalizationKeys } from "../../api/generalization-query-options";
import { stepTestHistoryQueryOptions } from "../../api/training-query-options";
import { recordStepTestFn } from "../../api/training.functions";
import { useStepTestActions } from "../use-step-test-actions";

vi.mock(import("../../api/training.functions"));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("use step test actions", () => {
  it("records a step test and invalidates test history and step progress queries", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(recordStepTestFn).mockResolvedValueOnce({
      coldOverride: true,
      outcome: "success",
      stepId: "level-1/zen#step-1",
      testId: "test-1",
      testedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const { queryClient, wrapper } = createTestingWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useStepTestActions(), { wrapper });

    // Act
    act(() => {
      result.current.record("success", true);
    });

    // Assert
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: stepTestHistoryQueryOptions().queryKey,
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: stepProgressQueryOptions().queryKey,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: generalizationKeys.all,
    });
    expect(result.current.errorMessage).toBeNull();
  });

  it("exposes errorMessage when recording fails", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(recordStepTestFn).mockRejectedValueOnce(new Error("Save failed"));
    const { wrapper } = createTestingWrapper();
    const { result } = renderHook(() => useStepTestActions(), { wrapper });

    // Act
    act(() => {
      result.current.record("not_yet", false);
    });

    // Assert
    await waitFor(() => {
      expect(result.current.errorMessage).toBe("Save failed");
    });
  });
});
