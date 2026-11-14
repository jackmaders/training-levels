import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import type {
  CurriculumPage,
  PageNavigationRef,
  ProseCurriculumPage,
} from "@/shared/curriculum-data";

import {
  curriculumPageQueryOptions,
  type ArticleSectionSlug,
} from "../api/curriculum-article-query-options";
import { CurriculumLink } from "./curriculum-link";
import { CurriculumProseBlocks } from "./curriculum-prose-blocks";

const SECTION_LINKS: Record<
  ArticleSectionSlug,
  { href: "/appendices" | "/theory"; label: string }
> = {
  appendices: { href: "/appendices", label: "Appendices" },
  theory: { href: "/theory", label: "Theory" },
};

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

  if (!isProseArticle(article, sectionSlug)) {
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
      <CurriculumProseBlocks blocks={article.blocks} />
      <ArticleFooterNavigation nextPage={article.nextPage} previousPage={article.previousPage} />
    </article>
  );
}

function isProseArticle(
  article: CurriculumPage | null,
  sectionSlug: ArticleSectionSlug,
): article is ProseCurriculumPage {
  return article !== null && article.kind !== "behavior" && article.sectionSlug === sectionSlug;
}

function ArticleNotFound({
  className,
  sectionSlug,
  ...props
}: ComponentProps<"article"> & { sectionSlug: ArticleSectionSlug }) {
  return (
    <article className={cn("mx-auto flex w-full max-w-4xl flex-col gap-6", className)} {...props}>
      <ArticleBreadcrumb sectionSlug={sectionSlug} />
      <section className="space-y-2 rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Article Not Found</h1>
        <p className="text-sm text-muted-foreground">
          The requested curriculum article could not be found.
        </p>
      </section>
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
  const section = SECTION_LINKS[sectionSlug];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
    >
      <CurriculumLink className="transition-colors hover:text-foreground" href={section.href}>
        {section.label}
      </CurriculumLink>
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
    <CurriculumLink
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50",
        isNext && "sm:col-start-2 sm:items-end sm:text-right",
      )}
      href={target.href}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {isNext ? null : <Icon aria-hidden="true" className="size-3.5" />}
        <span>{label}</span>
        {isNext ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      </span>
      <span className="font-medium text-foreground">{target.title}</span>
    </CurriculumLink>
  );
}

export { CurriculumArticlePage };
export type { CurriculumArticlePageProps };
