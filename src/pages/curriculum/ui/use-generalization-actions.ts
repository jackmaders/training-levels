import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../api/generalization-query-options";
import type { SaveComeafterInput, SaveHomeworkInput } from "../api/generalization-schema";
import type {
  ComeafterRecordState,
  HomeworkReflectionState,
  PageGeneralizationState,
} from "../api/generalization-service";
import { saveComeafterRecordFn, saveHomeworkReflectionFn } from "../api/generalization.functions";

function applySavedComeafter(
  current: PageGeneralizationState | undefined,
  saved: ComeafterRecordState,
): PageGeneralizationState {
  const base = current ?? EMPTY_PAGE_GENERALIZATION;
  return {
    ...base,
    comeafters: {
      ...base.comeafters,
      [saved.stepId]: saved,
    },
  };
}

function applySavedHomework(
  current: PageGeneralizationState | undefined,
  saved: HomeworkReflectionState,
): PageGeneralizationState {
  const base = current ?? EMPTY_PAGE_GENERALIZATION;
  return {
    ...base,
    homeworkReflection: saved,
  };
}

function useSaveComeafterAction(pageSlug: string) {
  const queryClient = useQueryClient();
  const { queryKey } = pageGeneralizationQueryOptions(pageSlug);
  const saveComeafter = useServerFn(saveComeafterRecordFn);

  return useMutation({
    mutationFn: async (data: SaveComeafterInput) => await saveComeafter({ data }),
    onSuccess: async (saved) => {
      queryClient.setQueryData<PageGeneralizationState>(queryKey, (current) =>
        applySavedComeafter(current, saved),
      );
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}

function useSaveHomeworkReflectionAction(pageSlug: string) {
  const queryClient = useQueryClient();
  const { queryKey } = pageGeneralizationQueryOptions(pageSlug);
  const saveHomework = useServerFn(saveHomeworkReflectionFn);

  return useMutation({
    mutationFn: async (data: SaveHomeworkInput) => await saveHomework({ data }),
    onSuccess: async (saved) => {
      queryClient.setQueryData<PageGeneralizationState>(queryKey, (current) =>
        applySavedHomework(current, saved),
      );
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}

export { useSaveComeafterAction, useSaveHomeworkReflectionAction };
