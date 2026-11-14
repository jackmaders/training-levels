import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";

import type { CurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../api/curriculum-query-options";
import { isLevelSectionSlug, parseInternalLevelHref } from "../model/curriculum-levels";
import { CurriculumBehaviorArticle } from "./curriculum-behavior-article";
import { CurriculumProseArticle } from "./curriculum-prose-article";
import { CurriculumSidebar } from "./curriculum-sidebar";

interface CurriculumLevelPageProps {
  pageSlug?: string | undefined;
}

function CurriculumLevelPage({ pageSlug }: CurriculumLevelPageProps) {
  const { hash, pathname } = useRouterState({
    select: (state) => {
      const location = state.resolvedLocation ?? state.location;
      return { hash: location.hash, pathname: location.pathname };
    },
  });
  const resolvedPageSlug = resolvePageSlug(pageSlug, pathname);
  const { data: syllabus } = useSuspenseQuery(curriculumSyllabusQueryOptions());
  const { data: page } = useSuspenseQuery(curriculumPageQueryOptions(resolvedPageSlug));
  const { data: completedSteps } = useSuspenseQuery(stepProgressQueryOptions());

  if (page === null) {
    return <MissingCurriculumPage />;
  }

  return (
    <CurriculumLevelContent
      completedSteps={completedSteps}
      hash={hash}
      page={page}
      syllabus={syllabus}
    />
  );
}

function resolvePageSlug(explicitPageSlug: string | undefined, pathname: string): string {
  if (explicitPageSlug !== undefined) {
    return explicitPageSlug;
  }

  const target = parseInternalLevelHref(pathname);
  if (target === null) {
    return "";
  }

  return `${target.params.section}/${target.params.page}`;
}

function CurriculumLevelContent({
  completedSteps,
  hash,
  page,
  syllabus,
}: {
  completedSteps: readonly string[];
  hash: string;
  page: CurriculumPage;
  syllabus: CurriculumSyllabus;
}) {
  const completedStepIds = useMemo(() => new Set(completedSteps), [completedSteps]);
  const initialOpenAnchor = hash.length > 0 ? hash.replace(/^#/u, "") : undefined;
  const currentSectionSlug = isLevelSectionSlug(page.sectionSlug) ? page.sectionSlug : "level-1";

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
      <CurriculumSidebar
        completedStepIds={completedStepIds}
        currentPageSlug={page.pageSlug}
        currentSectionSlug={currentSectionSlug}
        syllabus={syllabus}
      />
      <div className="min-w-0 flex-1">
        {page.kind === "behavior" ? (
          <CurriculumBehaviorArticle
            completedStepIds={completedStepIds}
            initialOpenAnchor={initialOpenAnchor}
            page={page}
            syllabus={syllabus}
          />
        ) : (
          <CurriculumProseArticle page={page} syllabus={syllabus} />
        )}
      </div>
    </div>
  );
}

function MissingCurriculumPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
      <p className="text-muted-foreground">
        The curriculum page you are looking for does not exist.
      </p>
      <div>
        <Link
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          to="/"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export { CurriculumLevelPage };
