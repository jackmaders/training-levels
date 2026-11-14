import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "cn";
import { type ComponentProps, useMemo } from "react";

import type { CurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";
import { buttonVariants } from "@/shared/ui/shadcn/button";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../api/curriculum-query-options";
import { CurriculumBehaviorArticle } from "./curriculum-behavior-article";
import { CurriculumProseArticle } from "./curriculum-prose-article";
import { CurriculumSidebar } from "./curriculum-sidebar";

interface CurriculumLevelPageProps extends ComponentProps<"div"> {
  pageSlug: string;
}

function CurriculumLevelPage({ className, pageSlug, ...props }: CurriculumLevelPageProps) {
  const hash = useRouterState({
    select: (state) => (state.resolvedLocation ?? state.location).hash,
  });
  const { data: syllabus } = useSuspenseQuery(curriculumSyllabusQueryOptions());
  const { data: page } = useSuspenseQuery(curriculumPageQueryOptions(pageSlug));
  const { data: completedSteps } = useSuspenseQuery(stepProgressQueryOptions());

  if (page === null) {
    return <MissingCurriculumPage className={className} {...props} />;
  }

  return (
    <CurriculumLevelContent
      className={className}
      completedSteps={completedSteps}
      hash={hash}
      page={page}
      syllabus={syllabus}
      {...props}
    />
  );
}

function CurriculumLevelContent({
  className,
  completedSteps,
  hash,
  page,
  syllabus,
  ...props
}: ComponentProps<"div"> & {
  completedSteps: readonly string[];
  hash: string;
  page: CurriculumPage;
  syllabus: CurriculumSyllabus;
}) {
  const completedStepIds = useMemo(() => new Set(completedSteps), [completedSteps]);
  const activeAnchor = hash.length > 0 ? hash.replace(/^#/u, "") : undefined;

  return (
    <div
      className={cn("flex flex-col gap-6 md:flex-row md:items-start md:gap-8", className)}
      {...props}
    >
      <CurriculumSidebar
        completedStepIds={completedStepIds}
        currentPageSlug={page.pageSlug}
        currentSectionSlug={page.sectionSlug}
        syllabus={syllabus}
      />
      <div className="min-w-0 flex-1">
        {page.kind === "behavior" ? (
          <CurriculumBehaviorArticle
            activeAnchor={activeAnchor}
            completedStepIds={completedStepIds}
            key={page.pageSlug}
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

function MissingCurriculumPage({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-2xl space-y-4 py-12 text-center", className)}
      {...props}
    >
      <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
      <p className="text-muted-foreground">
        The curriculum page you are looking for does not exist.
      </p>
      <div>
        <Link className={buttonVariants()} to="/">
          Return Home
        </Link>
      </div>
    </div>
  );
}

export { CurriculumLevelPage };
export type { CurriculumLevelPageProps };
