import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import { createDeferred } from "@test/vitest/helpers/deferred";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { stepProgressQueryOptions } from "../curriculum-query-options";
import type { ToggleStepResult } from "../curriculum-service";
import { toggleStepFn } from "../curriculum.functions";
import { useToggleStep } from "../use-toggle-step";

vi.mock(import("../curriculum.functions"));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useToggleStep optimistic mutation hook", () => {
  it("optimistically adds a step ID and cancels active queries while mutation is pending", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, ["level-1/zen:step-1"]);
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries");
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-2" });
    });

    // Assert
    await waitFor(() => {
      expect(queryClient.getQueryData(progressKey)).toStrictEqual([
        "level-1/zen:step-1",
        "level-1/zen:step-2",
      ]);
    });
    expect(cancelSpy).toHaveBeenCalledWith({ queryKey: progressKey });
    expect(result.current.isPending).toBe(true);
  });

  it("calls toggleStepFn and invalidates step progress when mutation resolves", async () => {
    expect.assertions(2);

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, ["level-1/zen:step-1"]);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    await act(async () => {
      const pending = result.current.mutateAsync({ completed: true, stepId: "level-1/zen:step-2" });
      deferred.resolve({ completed: true, stepId: "level-1/zen:step-2" });
      await pending;
    });

    // Assert
    expect(toggleStepFn).toHaveBeenCalledWith({
      data: { completed: true, stepId: "level-1/zen:step-2" },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: progressKey });
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

  it("restores a completed step if its query cache is removed while the mutation is pending", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, []);
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-1" });
    });
    await waitFor(() => {
      expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
    });
    queryClient.removeQueries({ queryKey: progressKey });
    await act(async () => {
      deferred.resolve({ completed: true, stepId: "level-1/zen:step-1" });
      await deferred.promise;
    });

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

  it("preserves another step completed by a concurrent mutation when one mutation fails", async () => {
    expect.hasAssertions();

    // Arrange
    const firstMutation = createDeferred<ToggleStepResult>();
    const secondMutation = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn)
      .mockReturnValueOnce(firstMutation.promise)
      .mockReturnValueOnce(secondMutation.promise);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, []);
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-1" });
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-2" });
    });
    await waitFor(() => {
      expect(queryClient.getQueryData(progressKey)).toStrictEqual([
        "level-1/zen:step-1",
        "level-1/zen:step-2",
      ]);
    });
    await act(async () => {
      secondMutation.resolve({ completed: true, stepId: "level-1/zen:step-2" });
      await secondMutation.promise;
    });
    act(() => {
      firstMutation.reject(new ApplicationError("CURRICULUM_STEP_NOT_FOUND"));
    });

    // Assert
    await waitFor(() => {
      expect(queryClient.isMutating()).toBe(0);
    });
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-2"]);
  });

  it("does not roll back an earlier failed toggle over a later same-step toggle", async () => {
    expect.hasAssertions();

    // Arrange
    const firstMutation = createDeferred<ToggleStepResult>();
    const secondMutation = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn)
      .mockReturnValueOnce(firstMutation.promise)
      .mockReturnValueOnce(secondMutation.promise);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, []);
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-1" });
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-1" });
    });
    await act(async () => {
      secondMutation.resolve({ completed: true, stepId: "level-1/zen:step-1" });
      await secondMutation.promise;
    });
    act(() => {
      firstMutation.reject(new ApplicationError("CURRICULUM_STEP_NOT_FOUND"));
    });

    // Assert
    await waitFor(() => {
      expect(queryClient.isMutating()).toBe(0);
    });
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
  });

  it("restores the baseline when overlapping same-step toggles from separate hooks both fail", async () => {
    expect.hasAssertions();

    // Arrange
    const firstMutation = createDeferred<ToggleStepResult>();
    const secondMutation = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn)
      .mockReturnValueOnce(firstMutation.promise)
      .mockReturnValueOnce(secondMutation.promise);
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, []);
    const { result } = renderHook(() => [useToggleStep(), useToggleStep()] as const, { wrapper });

    // Act
    act(() => {
      result.current[0].mutate({ completed: true, stepId: "level-1/zen:step-1" });
      result.current[1].mutate({ completed: false, stepId: "level-1/zen:step-1" });
    });
    await waitFor(() => {
      expect(queryClient.getQueryData(progressKey)).toStrictEqual([]);
    });
    act(() => {
      secondMutation.reject(new ApplicationError("CURRICULUM_STEP_NOT_FOUND"));
    });
    act(() => {
      firstMutation.reject(new ApplicationError("CURRICULUM_STEP_NOT_FOUND"));
    });

    // Assert
    await waitFor(() => {
      expect(queryClient.isMutating()).toBe(0);
    });
    expect(queryClient.getQueryData(progressKey)).toStrictEqual([]);
  });

  it("keeps another same-step mutation registered when query cancellation fails", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const cancelError = new Error("Query cancel failed");
    const { queryClient, wrapper } = createTestingWrapper();
    const progressKey = stepProgressQueryOptions().queryKey;
    queryClient.setQueryData(progressKey, []);
    vi.spyOn(queryClient, "cancelQueries").mockRejectedValueOnce(cancelError);
    const { result } = renderHook(() => useToggleStep(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-1" });
      result.current.mutate({ completed: true, stepId: "level-1/zen:step-1" });
    });
    await waitFor(() => {
      expect(toggleStepFn).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
    });
    await act(async () => {
      deferred.resolve({ completed: true, stepId: "level-1/zen:step-1" });
      await deferred.promise;
    });

    // Assert
    expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
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
