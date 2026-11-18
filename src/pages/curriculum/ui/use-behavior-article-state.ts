import { useQuery } from "@tanstack/react-query";

import type { BehaviorCurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";

import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../api/generalization-query-options";
import { trainingOverviewQueryOptions } from "../api/recommendation-query-options";
import { resolveCurriculumTrainingState } from "../model/curriculum-training-state";
import { useHydratedNow } from "./use-hydrated-now";
import { useStepAnchors } from "./use-step-anchors";

function useBehaviorArticleState({
  activeAnchor,
  completedStepIds,
  page,
  syllabus,
}: {
  activeAnchor?: string | undefined;
  completedStepIds: ReadonlySet<string>;
  page: BehaviorCurriculumPage;
  syllabus: CurriculumSyllabus;
}) {
  const { openAnchors, setAnchorOpen } = useStepAnchors(activeAnchor);
  const { data: generalization = EMPTY_PAGE_GENERALIZATION } = useQuery({
    ...pageGeneralizationQueryOptions(page.pageSlug),
    staleTime: 1000,
  });
  const overviewQuery = useQuery({
    ...trainingOverviewQueryOptions(),
    staleTime: 1000,
  });
  const now = useHydratedNow();
  const currentSection = syllabus.sections.find(
    (section) => section.sectionSlug === page.sectionSlug,
  );
  const trainingState = resolveCurriculumTrainingState({
    completedStepIds,
    now,
    overview: overviewQuery.data,
    selectedPageSlug: page.pageSlug,
    syllabus,
  });

  return {
    behaviorState: trainingState.behaviorsBySlug.get(page.pageSlug),
    currentLevelNumber: trainingState.currentLevelNumber,
    currentSection,
    generalization,
    openAnchors,
    setAnchorOpen,
  };
}

export { useBehaviorArticleState };
