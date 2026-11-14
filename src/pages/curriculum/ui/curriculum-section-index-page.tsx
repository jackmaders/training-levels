import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import type { SyllabusPageEntry } from "@/shared/curriculum-data";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";

import {
  curriculumSyllabusQueryOptions,
  type ArticleSectionSlug,
} from "../api/curriculum-article-query-options";
import { getCurriculumSectionMeta } from "../model/curriculum-sections";

const SECTION_DETAILS: Record<ArticleSectionSlug, { description: string; itemLabel: string }> = {
  appendices: {
    description: "Reference materials, feeding guidance, trick ideas, and further reading.",
    itemLabel: "Appendix",
  },
  theory: {
    description: "Foundational concepts behind force-free clicker training and The Levels.",
    itemLabel: "Chapter",
  },
};

const INDEX_PAD_WIDTH = 2;

interface CurriculumSectionIndexPageProps extends ComponentProps<"div"> {
  sectionSlug: ArticleSectionSlug;
}

/** Displays an ordered index of Theory or Appendices curriculum articles. */
function CurriculumSectionIndexPage({
  className,
  sectionSlug,
  ...props
}: CurriculumSectionIndexPageProps) {
  const { data: syllabus } = useSuspenseQuery(curriculumSyllabusQueryOptions());
  const section = syllabus.sections.find((item) => item.sectionSlug === sectionSlug);
  const sectionMeta = getCurriculumSectionMeta(sectionSlug);
  const details = SECTION_DETAILS[sectionSlug];
  const pages = section?.pages ?? [];
  const title = section?.title ?? sectionMeta.title;

  return (
    <div className={cn("mx-auto flex w-full max-w-4xl flex-col gap-6", className)} {...props}>
      <header className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="text-base text-muted-foreground">{details.description}</p>
      </header>

      {pages.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">No articles available in this section.</p>
          </CardContent>
        </Card>
      ) : (
        <SectionPageList itemLabel={details.itemLabel} pages={pages} />
      )}
    </div>
  );
}

function SectionPageList({
  itemLabel,
  pages,
}: {
  itemLabel: string;
  pages: readonly SyllabusPageEntry[];
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {pages.map((entry, index) => (
        <li key={entry.pageSlug}>
          <SectionPageCard entry={entry} itemLabel={itemLabel} position={index + 1} />
        </li>
      ))}
    </ol>
  );
}

function SectionPageCard({
  entry,
  itemLabel,
  position,
}: {
  entry: SyllabusPageEntry;
  itemLabel: string;
  position: number;
}) {
  const formattedPosition = String(position).padStart(INDEX_PAD_WIDTH, "0");

  return (
    <Card className="relative h-full transition-colors hover:bg-muted/50">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">
            {itemLabel} {formattedPosition}
          </Badge>
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-hover/card:translate-x-0.5"
          />
        </div>
        <CardTitle>
          <Link className="after:absolute after:inset-0 focus-visible:outline-none" to={entry.href}>
            {entry.title}
          </Link>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export { CurriculumSectionIndexPage };
export type { CurriculumSectionIndexPageProps };
