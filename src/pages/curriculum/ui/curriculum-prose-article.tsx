import { cn } from "cn";
import type { ComponentProps } from "react";

import type { CurriculumSyllabus, ProseCurriculumPage } from "@/shared/curriculum-data";

import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import { CurriculumPageBreadcrumb } from "./curriculum-page-breadcrumb";
import { CurriculumPageFooter } from "./curriculum-page-footer";

interface CurriculumProseArticleProps extends ComponentProps<"article"> {
  page: ProseCurriculumPage;
  syllabus: CurriculumSyllabus;
}

function CurriculumProseArticle({
  className,
  page,
  syllabus,
  ...props
}: CurriculumProseArticleProps) {
  return (
    <article className={cn("space-y-6", className)} {...props}>
      <CurriculumPageBreadcrumb page={page} syllabus={syllabus} />
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <CurriculumContentBlocks blocks={page.blocks} />
      <CurriculumPageFooter pageSlug={page.pageSlug} syllabus={syllabus} />
    </article>
  );
}

export { CurriculumProseArticle };
