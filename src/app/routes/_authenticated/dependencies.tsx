import { createFileRoute } from "@tanstack/react-router";

import {
  CurriculumDependenciesPage,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "@/pages/curriculum";

const Route = createFileRoute("/_authenticated/dependencies")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(curriculumSyllabusQueryOptions()),
      queryClient.ensureQueryData(stepProgressQueryOptions()),
    ]);
  },
  component: CurriculumDependenciesPage,
});

export { Route };
