/** @public Tracked in #11, #12. */
export {
  getCurriculumPageInputSchema,
  toggleStepInputSchema,
  type GetCurriculumPageInput,
  type ToggleStepInput,
} from "./api/curriculum-schema";

/** @public Tracked in #11, #12. */
export type { ToggleStepResult } from "./api/curriculum-service";

/** @public Tracked in #11, #12. */
export {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
  toggleStepFn,
} from "./api/curriculum.functions";
