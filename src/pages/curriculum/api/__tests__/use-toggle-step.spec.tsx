import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import { createDeferred } from "@test/vitest/helpers/deferred";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { stepProgressQueryOptions } from "../curriculum-query-options";
import type { ToggleStepResult } from "../curriculum-service";
import { toggleStepFn } from "../curriculum.functions";
import { useToggleStep } from "../use-toggle-step";

vi.mock(import("../curriculum.functions"));

describe("useToggleStep optimistic mutation hook", () => {
  it("optimistically adds a step ID before server resolution and invalidates on settle", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, ["level-1/zen:step-1"]);
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-2" });
    });

    // Assert optimistic state
    await waitFor(() => {
      expect(queryClient.getQueryData(progressKey)).toStrictEqual([
        "level-1/zen:step-1",
        "level-1/zen:step-2",
      ]);
    });
    expect(cancelSpy).toHaveBeenCalledWith({ queryKey: progressKey });

    // Act resolve server call
    await act(async () => {
      deferred.resolve({ completed: true, stepId: "level-1/zen:step-2" });
      await deferred.promise;
    });

    // Assert settled state
    expect(toggleStepFn).toHaveBeenCalledWith({
      data: { completed: true, stepId: "level-1/zen:step-2" },
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: progressKey });
    });
  });

  it("keeps step IDs unique when optimistically checking an already completed step", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(toggleStepFn).mockResolvedValueOnce({
      completed: true,
      stepId: "level-1/zen:step-1",
    });
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, ["level-1/zen:step-1"]);
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    await result.current.mutateAsync({ completed: true, stepId: "level-1/zen:step-1" });

    // Assert
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
  });

  it("initializes cache array when previous step progress is undefined", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(toggleStepFn).mockResolvedValueOnce({
      completed: true,
      stepId: "level-1/zen:step-1",
    });
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    await result.current.mutateAsync({ completed: true, stepId: "level-1/zen:step-1" });

    // Assert
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
  });

  it("optimistically removes a step ID when unchecking", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(toggleStepFn).mockResolvedValueOnce({
      completed: false,
      stepId: "level-1/zen:step-1",
    });
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, ["level-1/zen:step-1", "level-1/zen:step-2"]);
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    await result.current.mutateAsync({ completed: false, stepId: "level-1/zen:step-1" });

    // Assert
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-2"]);
  });

  it("handles unchecking safely when previous step progress is undefined", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(toggleStepFn).mockResolvedValueOnce({
      completed: false,
      stepId: "level-1/zen:step-1",
    });
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    await result.current.mutateAsync({ completed: false, stepId: "level-1/zen:step-1" });

    // Assert
    expect(queryClient.getQueryData(progressKey)).toStrictEqual([]);
  });

  it("rolls back optimistic cache update and exposes error when toggleStepFn rejects", async () => {
    expect.hasAssertions();

    // Arrange
    const error = new ApplicationError("CURRICULUM_STEP_NOT_FOUND");
    vi.mocked(toggleStepFn).mockRejectedValueOnce(error);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, ["level-1/zen:step-1"]);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-2" });
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: progressKey });
  });

  it("handles onError gracefully when onMutate fails before returning rollback context", async () => {
    expect.hasAssertions();

    // Arrange
    const cancelError = new Error("Query cancel failed");
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, ["level-1/zen:step-1"]);
    vi.spyOn(queryClient, "cancelQueries").mockRejectedValueOnce(cancelError);
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-2" });
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(cancelError);
    expect(toggleStepFn).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
  });
});
