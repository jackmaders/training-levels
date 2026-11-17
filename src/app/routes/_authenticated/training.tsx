import { createFileRoute } from "@tanstack/react-router";

import { CurriculumTrainingPage } from "@/pages/curriculum";

const Route = createFileRoute("/_authenticated/training")({
  component: CurriculumTrainingPage,
});

export { Route };
