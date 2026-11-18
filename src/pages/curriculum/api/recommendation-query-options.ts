import { queryOptions } from "@tanstack/react-query";

import { getTrainingOverviewFn } from "./recommendation.functions";

function trainingOverviewQueryOptions() {
  return queryOptions({
    queryFn: async () => await getTrainingOverviewFn(),
    queryKey: ["training", "overview"],
  });
}

export { trainingOverviewQueryOptions };
