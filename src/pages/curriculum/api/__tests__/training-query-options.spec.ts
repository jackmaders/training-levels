import { describe, expect, it, vi } from "vite-plus/test";

import {
  PRACTICE_STEP_ID,
  practiceHistoryQueryOptions,
  practiceStepDecisionQueryOptions,
  practiceTotalsQueryOptions,
  stepTestHistoryQueryOptions,
} from "../training-query-options";
import {
  getPracticeHistoryFn,
  getPracticeStepDecisionFn,
  getPracticeTotalsFn,
  getStepTestHistoryFn,
} from "../training.functions";

vi.mock(import("../training.functions"));

describe("training query options", () => {
  it("configures practiceHistoryQueryOptions", async () => {
    expect.assertions(2);

    vi.mocked(getPracticeHistoryFn).mockResolvedValueOnce([]);
    const options = practiceHistoryQueryOptions();

    expect(options.queryKey).toStrictEqual(["training", "practice-history", PRACTICE_STEP_ID]);
    await options.queryFn?.({} as never);
    expect(getPracticeHistoryFn).toHaveBeenCalledWith({ data: { stepId: PRACTICE_STEP_ID } });
  });

  it("configures practiceTotalsQueryOptions", async () => {
    expect.assertions(2);

    vi.mocked(getPracticeTotalsFn).mockResolvedValueOnce([]);
    const options = practiceTotalsQueryOptions("level-1/zen:step-2");

    expect(options.queryKey).toStrictEqual(["training", "practice-totals", "level-1/zen:step-2"]);
    await options.queryFn?.({} as never);
    expect(getPracticeTotalsFn).toHaveBeenCalledWith({ data: { stepId: "level-1/zen:step-2" } });
  });

  it("configures practiceStepDecisionQueryOptions", async () => {
    expect.assertions(2);

    vi.mocked(getPracticeStepDecisionFn).mockResolvedValueOnce(null);
    const options = practiceStepDecisionQueryOptions();

    expect(options.queryKey).toStrictEqual([
      "training",
      "practice-step-decision",
      PRACTICE_STEP_ID,
    ]);
    await options.queryFn?.({} as never);
    expect(getPracticeStepDecisionFn).toHaveBeenCalledWith({
      data: { stepId: PRACTICE_STEP_ID },
    });
  });

  it("configures stepTestHistoryQueryOptions", async () => {
    expect.assertions(2);

    vi.mocked(getStepTestHistoryFn).mockResolvedValueOnce([]);
    const options = stepTestHistoryQueryOptions();

    expect(options.queryKey).toStrictEqual(["training", "step-test-history", PRACTICE_STEP_ID]);
    await options.queryFn?.({} as never);
    expect(getStepTestHistoryFn).toHaveBeenCalledWith({ data: { stepId: PRACTICE_STEP_ID } });
  });
});
