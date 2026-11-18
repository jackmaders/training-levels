import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { hasPermission } from "@/shared/auth/permissions";
import { ensureSession } from "@/shared/auth/session.server";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

import {
  correctPracticeTotals,
  getPracticeStepDecision,
  getPracticeTotals,
  recordPracticeTotals,
  savePracticeStepDecision,
} from "../practice-progress-service";
import { getStepTestHistory, recordStepTest } from "../step-test-service";
import {
  correctPracticeAttempt,
  getPracticeHistory,
  recordPracticeAttempt,
  undoPracticeAttempt,
} from "../training-service";
import {
  correctPracticeAttemptFn,
  correctPracticeTotalsFn,
  getPracticeHistoryFn,
  getPracticeStepDecisionFn,
  getPracticeTotalsFn,
  getStepTestHistoryFn,
  recordPracticeAttemptFn,
  recordPracticeTotalsFn,
  recordStepTestFn,
  savePracticeStepDecisionFn,
  undoPracticeAttemptFn,
} from "../training.functions";

vi.mock(import("@tanstack/react-start"));
vi.mock(import("@/shared/auth/session.server"));
vi.mock(import("@/shared/auth/permissions"), { spy: true });
vi.mock(import("../training-service"));
vi.mock(import("../practice-progress-service"));
vi.mock(import("../step-test-service"));

const TEST_UUID = "018f47ad-9d72-7a31-a50b-a11111111111";

beforeEach(() => {
  vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
});

describe("training functions", () => {
  it("delegates getPracticeHistoryFn with curriculum:read permission", async () => {
    expect.assertions(3);

    vi.mocked(getPracticeHistory).mockResolvedValueOnce([]);

    const result = await getPracticeHistoryFn({ data: { stepId: "level-1/zen:step-1" } });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getPracticeHistory).toHaveBeenCalledWith("level-1/zen:step-1", {
      userId: TEST_SESSION.user.id,
    });
    expect(result).toStrictEqual([]);
  });

  it("delegates recordPracticeAttemptFn with progress:update permission", async () => {
    expect.assertions(3);

    const payload = {
      attemptId: TEST_UUID,
      outcome: "success" as const,
      stepId: "level-1/zen:step-1",
      target: "First target",
    };
    vi.mocked(recordPracticeAttempt).mockResolvedValueOnce({} as never);

    const result = await recordPracticeAttemptFn({ data: payload });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(recordPracticeAttempt).toHaveBeenCalledWith(payload, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual({});
  });

  it("delegates correctPracticeAttemptFn with progress:update permission", async () => {
    expect.assertions(3);

    const payload = {
      attemptId: TEST_UUID,
      outcome: "not_yet" as const,
    };
    vi.mocked(correctPracticeAttempt).mockResolvedValueOnce({} as never);

    const result = await correctPracticeAttemptFn({ data: payload });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(correctPracticeAttempt).toHaveBeenCalledWith(payload, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual({});
  });

  it("delegates undoPracticeAttemptFn with progress:update permission", async () => {
    expect.assertions(3);

    vi.mocked(undoPracticeAttempt).mockResolvedValueOnce({
      attemptId: TEST_UUID,
      undone: true,
    });

    const result = await undoPracticeAttemptFn({ data: { attemptId: TEST_UUID } });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(undoPracticeAttempt).toHaveBeenCalledWith(TEST_UUID, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual({ attemptId: TEST_UUID, undone: true });
  });

  it("delegates getPracticeTotalsFn with curriculum:read permission", async () => {
    expect.assertions(3);

    vi.mocked(getPracticeTotals).mockResolvedValueOnce([]);

    const result = await getPracticeTotalsFn({ data: { stepId: "level-1/zen:step-1" } });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getPracticeTotals).toHaveBeenCalledWith("level-1/zen:step-1", {
      userId: TEST_SESSION.user.id,
    });
    expect(result).toBeNull();
  });

  it("delegates recordPracticeTotalsFn with progress:update permission", async () => {
    expect.assertions(3);

    const payload = {
      notYetCount: 0,
      recordId: TEST_UUID,
      stepId: "level-1/zen:step-1",
      successCount: 3,
      target: "First target",
    };
    vi.mocked(recordPracticeTotals).mockResolvedValueOnce({} as never);

    const result = await recordPracticeTotalsFn({ data: payload });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(recordPracticeTotals).toHaveBeenCalledWith(payload, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual({});
  });

  it("delegates correctPracticeTotalsFn with progress:update permission", async () => {
    expect.assertions(3);

    const payload = {
      notYetCount: 1,
      recordId: TEST_UUID,
      successCount: 2,
    };
    vi.mocked(correctPracticeTotals).mockResolvedValueOnce({} as never);

    const result = await correctPracticeTotalsFn({ data: payload });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(correctPracticeTotals).toHaveBeenCalledWith(payload, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual({});
  });

  it("delegates getPracticeStepDecisionFn with curriculum:read permission", async () => {
    expect.assertions(3);

    vi.mocked(getPracticeStepDecision).mockResolvedValueOnce(null);

    const result = await getPracticeStepDecisionFn({ data: { stepId: "level-1/zen:step-1" } });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getPracticeStepDecision).toHaveBeenCalledWith("level-1/zen:step-1", {
      userId: TEST_SESSION.user.id,
    });
    expect(result).toBeNull();
  });

  it("delegates savePracticeStepDecisionFn with progress:update permission", async () => {
    expect.assertions(3);

    const payload = {
      decision: "keep_practicing" as const,
      stepId: "level-1/zen:step-1",
    };
    vi.mocked(savePracticeStepDecision).mockResolvedValueOnce({} as never);

    const result = await savePracticeStepDecisionFn({ data: payload });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(savePracticeStepDecision).toHaveBeenCalledWith(payload, {
      userId: TEST_SESSION.user.id,
    });
    expect(result).toStrictEqual({});
  });

  it("delegates getStepTestHistoryFn with curriculum:read permission", async () => {
    expect.assertions(3);

    vi.mocked(getStepTestHistory).mockResolvedValueOnce([]);

    const result = await getStepTestHistoryFn({ data: { stepId: "level-1/zen:step-1" } });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getStepTestHistory).toHaveBeenCalledWith("level-1/zen:step-1", {
      userId: TEST_SESSION.user.id,
    });
    expect(result).toStrictEqual([]);
  });

  it("delegates recordStepTestFn with progress:update permission", async () => {
    expect.assertions(3);

    const payload = {
      coldOverride: true,
      outcome: "success" as const,
      stepId: "level-1/zen:step-1",
      testId: TEST_UUID,
    };
    vi.mocked(recordStepTest).mockResolvedValueOnce({} as never);

    const result = await recordStepTestFn({ data: payload });

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "progress:update");
    expect(recordStepTest).toHaveBeenCalledWith(payload, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual({});
  });
});
