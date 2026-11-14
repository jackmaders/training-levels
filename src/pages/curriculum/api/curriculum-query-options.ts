import { queryOptions } from "@tanstack/react-query";

import {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
} from "./curriculum.functions";

const curriculumKeys = {
  all: ["curriculum"] as const,
  page: (pageSlug: string) => [...curriculumKeys.all, "page", pageSlug] as const,
  stepProgress: () => [...curriculumKeys.all, "step-progress"] as const,
  syllabus: () => [...curriculumKeys.all, "syllabus"] as const,
};

function curriculumSyllabusQueryOptions() {
  return queryOptions({
    queryFn: getCurriculumSyllabusFn,
    queryKey: curriculumKeys.syllabus(),
    staleTime: Infinity,
  });
}

function curriculumPageQueryOptions(pageSlug: string) {
  return queryOptions({
    queryFn: () => getCurriculumPageFn({ data: { pageSlug } }),
    queryKey: curriculumKeys.page(pageSlug),
    staleTime: Infinity,
  });
}

function stepProgressQueryOptions() {
  return queryOptions({
    queryFn: getStepProgressFn,
    queryKey: curriculumKeys.stepProgress(),
  });
}

export {
  curriculumKeys,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
};
