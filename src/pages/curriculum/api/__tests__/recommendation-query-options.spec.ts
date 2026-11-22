import { describe, expect, it, vi } from "vite-plus/test";

import { trainingOverviewQueryOptions } from "../recommendation-query-options";
import { getTrainingOverviewFn } from "../recommendation.functions";

vi.mock(import("../recommendation.functions"));

describe("recommendation query options", () => {
  it("configures trainingOverviewQueryOptions", async () => {
    expect.assertions(3);

    const overview = {
      activeDog: null,
      curriculumProgress: [],
      practiceAttempts: [],
      practiceTotals: [],
      stepDecisions: [],
      stepTests: [],
    };
    vi.mocked(getTrainingOverviewFn).mockResolvedValueOnce(overview);
    const options = trainingOverviewQueryOptions();

    expect(options.queryKey).toStrictEqual(["training", "overview"]);
    const result = await options.queryFn?.({} as never);
    expect(getTrainingOverviewFn).toHaveBeenCalledWith();
    expect(result).toStrictEqual(overview);
  });
});
