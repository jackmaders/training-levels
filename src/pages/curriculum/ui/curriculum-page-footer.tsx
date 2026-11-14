import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { CurriculumSyllabus, SyllabusPageEntry } from "@/shared/curriculum-data";

import { getLevelAdjacentPages, toLevelRouteParams } from "../model/curriculum-levels";

interface CurriculumPageFooterProps {
  pageSlug: string;
  syllabus: CurriculumSyllabus;
}

function CurriculumPageFooter({ pageSlug, syllabus }: CurriculumPageFooterProps) {
  const { nextPage, previousPage } = getLevelAdjacentPages(syllabus, pageSlug);

  if (previousPage === null && nextPage === null) {
    return null;
  }

  return (
    <nav
      aria-label="Page navigation"
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
    >
      <AdjacentLink direction="previous" entry={previousPage} />
      <AdjacentLink direction="next" entry={nextPage} />
    </nav>
  );
}

function AdjacentLink({
  direction,
  entry,
}: {
  direction: "next" | "previous";
  entry: SyllabusPageEntry | null;
}) {
  const params = entry === null ? null : toLevelRouteParams(entry.pageSlug);
  if (entry === null || params === null) {
    return <div />;
  }

  if (direction === "previous") {
    return (
      <Link
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        params={params}
        to="/levels/$section/$page"
      >
        <ChevronLeft aria-hidden="true" className="size-4 text-muted-foreground" />
        <span className="flex flex-col text-left">
          <span className="text-xs font-normal text-muted-foreground">Previous</span>
          <span>{entry.title}</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      className="ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
      params={params}
      to="/levels/$section/$page"
    >
      <span className="flex flex-col text-right">
        <span className="text-xs font-normal text-muted-foreground">Next</span>
        <span>{entry.title}</span>
      </span>
      <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
    </Link>
  );
}

export { CurriculumPageFooter };
