import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { CurriculumSyllabus } from "@/shared/curriculum-data";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../api/curriculum-query-options";
import { trainingOverviewQueryOptions } from "../api/recommendation-query-options";
import { resolveCurriculumTrainingState } from "../model/curriculum-training-state";
import { getPrerequisiteChain } from "../model/dependency-relationships";
import { useHydratedNow } from "./use-hydrated-now";

const INITIAL_BEHAVIOR = "level-2/go-to-mat";

function selectSyllabusBehaviors(syllabus: CurriculumSyllabus, selectedPageSlug: string) {
  const sections = syllabus.sections.filter((section) => section.levelNumber !== undefined);
  const behaviors = sections.flatMap((section) =>
    section.pages.filter((page) => page.kind === "behavior"),
  );
  const selected = behaviors.find((page) => page.pageSlug === selectedPageSlug) ?? behaviors[0];
  if (selected === undefined) {
    throw new Error("No curriculum behaviors found.");
  }

  return { behaviors, sections, selected };
}

function useDependenciesPageState() {
  const [selectedPageSlug, setSelectedPageSlug] = useState(INITIAL_BEHAVIOR);
  const { data: syllabus } = useSuspenseQuery(curriculumSyllabusQueryOptions());
  const { data: completedStepIds } = useSuspenseQuery(stepProgressQueryOptions());
  const overviewQuery = useQuery({
    ...trainingOverviewQueryOptions(),
    staleTime: 1000,
  });
  const now = useHydratedNow();
  const { behaviors, sections, selected } = selectSyllabusBehaviors(syllabus, selectedPageSlug);
  const { data: detail } = useSuspenseQuery(curriculumPageQueryOptions(selected.pageSlug));
  const trainingState = resolveCurriculumTrainingState({
    completedStepIds,
    now,
    overview: overviewQuery.data,
    selectedPageSlug: selected.pageSlug,
    syllabus,
  });

  return {
    behaviors,
    behaviorsBySlug: trainingState.behaviorsBySlug,
    chain: new Set(getPrerequisiteChain(selected.pageSlug)),
    completed: new Set(completedStepIds),
    currentLevelNumber: trainingState.currentLevelNumber,
    detail,
    sections,
    selected,
    selectedState: trainingState.behaviorsBySlug.get(selected.pageSlug),
    setSelectedPageSlug,
  };
}

export { useDependenciesPageState };
