import { createFileRoute } from "@tanstack/react-router";

import {
  CurriculumDependenciesPage,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
  trainingOverviewQueryOptions,
} from "@/pages/curriculum";

const Route = createFileRoute("/_authenticated/dependencies")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.query(curriculumSyllabusQueryOptions()),
      queryClient.query(stepProgressQueryOptions()),
      queryClient.query(trainingOverviewQueryOptions()),
    ]);
  },
  component: CurriculumDependenciesPage,
});

export { Route };
