import { cn } from "cn";
import type { ComponentProps } from "react";

import type { CurriculumSyllabus, ProseCurriculumPage } from "@/shared/curriculum-data";

import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import { CurriculumHomeworkReflection } from "./curriculum-homework-reflection";
import { CurriculumLevelReadiness } from "./curriculum-level-readiness";
import { CurriculumPageBreadcrumb } from "./curriculum-page-breadcrumb";
import { CurriculumPageFooter } from "./curriculum-page-footer";

interface CurriculumProseArticleProps extends ComponentProps<"article"> {
  completedStepIds?: ReadonlySet<string>;
  page: ProseCurriculumPage;
  syllabus: CurriculumSyllabus;
}

const EMPTY_COMPLETED_STEP_IDS: ReadonlySet<string> = new Set();

function CurriculumProseArticle({
  className,
  completedStepIds = EMPTY_COMPLETED_STEP_IDS,
  page,
  syllabus,
  ...props
}: CurriculumProseArticleProps) {
  const currentSection = syllabus.sections.find(
    (section) => section.sectionSlug === page.sectionSlug,
  );
  const showReadiness = page.kind === "overview" || page.kind === "homework";

  return (
    <article className={cn("space-y-6", className)} {...props}>
      <CurriculumPageBreadcrumb page={page} syllabus={syllabus} />
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      {showReadiness ? (
        <CurriculumLevelReadiness completedStepIds={completedStepIds} section={currentSection} />
      ) : null}
      <CurriculumContentBlocks blocks={page.blocks} />
      {page.kind === "homework" ? (
        <CurriculumHomeworkReflection key={page.pageSlug} pageSlug={page.pageSlug} />
      ) : null}
      <CurriculumPageFooter pageSlug={page.pageSlug} syllabus={syllabus} />
    </article>
  );
}

export { CurriculumProseArticle };
