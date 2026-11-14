import type { CurriculumSyllabus, ProseCurriculumPage } from "@/shared/curriculum-data";

import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import { CurriculumPageBreadcrumb } from "./curriculum-page-breadcrumb";
import { CurriculumPageFooter } from "./curriculum-page-footer";

interface CurriculumProseArticleProps {
  page: ProseCurriculumPage;
  syllabus: CurriculumSyllabus;
}

function CurriculumProseArticle({ page, syllabus }: CurriculumProseArticleProps) {
  return (
    <article className="space-y-6">
      <CurriculumPageBreadcrumb page={page} syllabus={syllabus} />
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <CurriculumContentBlocks blocks={page.blocks} />
      <CurriculumPageFooter pageSlug={page.pageSlug} syllabus={syllabus} />
    </article>
  );
}

export { CurriculumProseArticle };
