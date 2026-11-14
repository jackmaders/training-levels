import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import type { PageNavigationRef } from "@/shared/curriculum-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";

import {
  curriculumPageQueryOptions,
  isMatchingProseArticle,
  type ArticleSectionSlug,
} from "../api/curriculum-query-options";
import { getCurriculumSectionMeta } from "../model/curriculum-sections";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";

interface CurriculumArticlePageProps extends ComponentProps<"article"> {
  page: string;
  sectionSlug: ArticleSectionSlug;
}

/** Displays a Theory or Appendices curriculum article with breadcrumb and reading navigation. */
function CurriculumArticlePage({
  className,
  page,
  sectionSlug,
  ...props
}: CurriculumArticlePageProps) {
  const { data: article } = useSuspenseQuery(curriculumPageQueryOptions(`${sectionSlug}/${page}`));

  if (!isMatchingProseArticle(article, sectionSlug)) {
    return <ArticleNotFound className={className} sectionSlug={sectionSlug} {...props} />;
  }

  return (
    <article className={cn("mx-auto flex w-full max-w-4xl flex-col gap-8", className)} {...props}>
      <ArticleBreadcrumb sectionSlug={sectionSlug} title={article.title} />
      <header className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {article.title}
        </h1>
      </header>
      <CurriculumContentBlocks blocks={article.blocks} />
      <ArticleFooterNavigation nextPage={article.nextPage} previousPage={article.previousPage} />
    </article>
  );
}

function ArticleNotFound({
  className,
  sectionSlug,
  ...props
}: ComponentProps<"article"> & { sectionSlug: ArticleSectionSlug }) {
  return (
    <article className={cn("mx-auto flex w-full max-w-4xl flex-col gap-6", className)} {...props}>
      <ArticleBreadcrumb sectionSlug={sectionSlug} />
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Article Not Found</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The requested curriculum article could not be found.
          </p>
        </CardContent>
      </Card>
    </article>
  );
}

function ArticleBreadcrumb({
  sectionSlug,
  title,
}: {
  sectionSlug: ArticleSectionSlug;
  title?: string;
}) {
  const section = getCurriculumSectionMeta(sectionSlug);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Link className="transition-colors hover:text-foreground" to={section.href}>
        {section.title}
      </Link>
      {title === undefined ? null : (
        <>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
          <span aria-current="page" className="font-medium text-foreground">
            {title}
          </span>
        </>
      )}
    </nav>
  );
}

function ArticleFooterNavigation({
  nextPage,
  previousPage,
}: {
  nextPage: PageNavigationRef | null;
  previousPage: PageNavigationRef | null;
}) {
  if (previousPage === null && nextPage === null) {
    return null;
  }

  return (
    <nav
      aria-label="Article navigation"
      className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {previousPage ? <ArticleNavLink direction="previous" target={previousPage} /> : null}
      {nextPage ? <ArticleNavLink direction="next" target={nextPage} /> : null}
    </nav>
  );
}

function ArticleNavLink({
  direction,
  target,
}: {
  direction: "next" | "previous";
  target: PageNavigationRef;
}) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;
  const label = isNext ? "Next" : "Previous";

  return (
    <Card
      className={cn(
        "relative transition-colors hover:bg-muted/50",
        isNext && "sm:col-start-2 sm:text-right",
      )}
    >
      <CardContent>
        <Link
          className={cn(
            "flex flex-col gap-1 after:absolute after:inset-0 focus-visible:outline-none",
            isNext && "sm:items-end",
          )}
          to={target.href}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {isNext ? null : <Icon aria-hidden="true" className="size-3.5" />}
            <span>{label}</span>
            {isNext ? <Icon aria-hidden="true" className="size-3.5" /> : null}
          </span>
          <span className="font-medium text-foreground">{target.title}</span>
        </Link>
      </CardContent>
    </Card>
  );
}

export { CurriculumArticlePage };
export type { CurriculumArticlePageProps };
