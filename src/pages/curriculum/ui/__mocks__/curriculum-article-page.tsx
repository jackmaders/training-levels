import type { CurriculumArticlePageProps } from "../curriculum-article-page";

function CurriculumArticlePage({ page, sectionSlug }: CurriculumArticlePageProps) {
  return (
    <h1>
      Curriculum Article Page: {sectionSlug}/{page}
    </h1>
  );
}

export { CurriculumArticlePage };
