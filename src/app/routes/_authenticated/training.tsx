import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  CurriculumTrainingPage,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  practiceHistoryQueryOptions,
  practiceStepDecisionQueryOptions,
  practiceTotalsQueryOptions,
  recommendNextTrainingActivity,
  stepTestHistoryQueryOptions,
  trainingOverviewQueryOptions,
  type TrainingRecommendationMode,
} from "@/pages/curriculum";
import { isValidMainQuestStepId } from "@/shared/curriculum-data";

type TrainingLevelFilter = "level-1" | "level-2" | "level-3" | "level-4";

interface TrainingSearch {
  level?: TrainingLevelFilter | undefined;
  mode?: TrainingRecommendationMode | undefined;
  stepId?: string | undefined;
  target?: string | undefined;
}

function parseLevel(level: unknown): TrainingLevelFilter | undefined {
  return level === "level-1" || level === "level-2" || level === "level-3" || level === "level-4"
    ? level
    : undefined;
}

function parseMode(mode: unknown): TrainingRecommendationMode | undefined {
  return mode === "practice" || mode === "test" ? mode : undefined;
}

function parseStepId(stepId: unknown): string | undefined {
  return typeof stepId === "string" && isValidMainQuestStepId(stepId) ? stepId : undefined;
}

async function prefetchStepQueries(queryClient: QueryClient, stepId: string): Promise<void> {
  const pageSlug = stepId.split(":", 1).join("");
  await Promise.all([
    queryClient.query(curriculumPageQueryOptions(pageSlug)),
    queryClient.query(practiceHistoryQueryOptions(stepId)),
    queryClient.query(practiceTotalsQueryOptions(stepId)),
    queryClient.query(practiceStepDecisionQueryOptions(stepId)),
    queryClient.query(stepTestHistoryQueryOptions(stepId)),
  ]);
}

const Route = createFileRoute("/_authenticated/training")({
  validateSearch: (search: Record<string, unknown>): TrainingSearch => {
    const level = parseLevel(search["level"]);
    return {
      ...(level ? { level } : {}),
      mode: parseMode(search["mode"]),
      stepId: parseStepId(search["stepId"]),
      target: typeof search["target"] === "string" ? search["target"] : undefined,
    };
  },
  loaderDeps: ({ search }) => ({
    mode: search.mode,
    stepId: search.stepId,
  }),
  loader: async ({ context: { queryClient }, deps }) => {
    const [overview, syllabus] = await Promise.all([
      queryClient.query(trainingOverviewQueryOptions()),
      queryClient.query(curriculumSyllabusQueryOptions()),
    ]);
    const ssrRecommendation = recommendNextTrainingActivity({
      now: null,
      overview,
      preferredMode: deps.mode,
      syllabus,
    });
    const clientRecommendation = recommendNextTrainingActivity({
      overview,
      preferredMode: deps.mode,
      syllabus,
    });
    const stepIds = new Set([ssrRecommendation.stepId, clientRecommendation.stepId]);
    if (deps.stepId !== undefined) {
      stepIds.add(deps.stepId);
    }
    await Promise.all(
      [...stepIds].map(async (stepId) => {
        await prefetchStepQueries(queryClient, stepId);
      }),
    );
  },
  component: TrainingRoute,
});

function TrainingRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <CurriculumTrainingPage
      selectedMode={search.mode}
      selectedStepId={search.stepId}
      selectedTarget={search.target}
      onModeChange={(mode) => {
        void navigate({ replace: true, search: { mode } });
      }}
      onSelectionChange={(stepId, target) => {
        void navigate({
          replace: true,
          search: {
            ...(search.mode === undefined ? {} : { mode: search.mode }),
            stepId,
            target,
          },
        });
      }}
    />
  );
}

export { Route };
