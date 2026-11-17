import { createFileRoute } from "@tanstack/react-router";

import { CurriculumTrainingPage } from "@/pages/curriculum";

const Route = createFileRoute("/_authenticated/training")({
  validateSearch: (search: Record<string, unknown>) => ({
    stepId: typeof search.stepId === "string" ? search.stepId : undefined,
    target: typeof search.target === "string" ? search.target : undefined,
  }),
  component: TrainingRoute,
});

function TrainingRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <CurriculumTrainingPage
      selectedStepId={search.stepId}
      selectedTarget={search.target}
      onSelectionChange={(stepId, target) =>
        navigate({ search: { stepId, target }, replace: true })
      }
    />
  );
}

export { Route };
