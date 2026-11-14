/** @public Tracked in #11. */
export { getCurriculumPageInputSchema, toggleStepInputSchema } from "./api/curriculum-schema";

export type { GetCurriculumPageInput, ToggleStepInput } from "./api/curriculum-schema";

export type { ToggleStepResult } from "./api/curriculum-service";

/** @public Tracked in #11. */
export {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
  toggleStepFn,
} from "./api/curriculum.functions";

export {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  loadCurriculumArticle,
} from "./api/curriculum-article-query-options";

export type {
  ArticleSectionSlug,
  LoadCurriculumArticleOptions,
} from "./api/curriculum-article-query-options";

export { CurriculumArticlePage } from "./ui/curriculum-article-page";
export type { CurriculumArticlePageProps } from "./ui/curriculum-article-page";
export { CurriculumSectionIndexPage } from "./ui/curriculum-section-index-page";
export type { CurriculumSectionIndexPageProps } from "./ui/curriculum-section-index-page";
