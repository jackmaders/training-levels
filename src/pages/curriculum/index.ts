/** @public Tracked in #11, #12. */
export { getCurriculumPageInputSchema, toggleStepInputSchema } from "./api/curriculum-schema";

export type { GetCurriculumPageInput, ToggleStepInput } from "./api/curriculum-schema";

export type { ToggleStepResult } from "./api/curriculum-service";

/** @public Tracked in #11, #12. */
export {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
  toggleStepFn,
} from "./api/curriculum.functions";
