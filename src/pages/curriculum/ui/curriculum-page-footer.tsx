import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import type { CurriculumSyllabus, SyllabusPageEntry } from "@/shared/curriculum-data";
import { Card, CardContent } from "@/shared/ui/shadcn/card";

import {
  getLevelAdjacentPages,
  toLevelRouteParams,
  type LevelRouteParams,
} from "../model/curriculum-levels";

interface CurriculumPageFooterProps extends ComponentProps<"nav"> {
  pageSlug: string;
  syllabus: CurriculumSyllabus;
}

interface AdjacentTarget {
  params: LevelRouteParams;
  title: string;
}

function CurriculumPageFooter({
  className,
  pageSlug,
  syllabus,
  ...props
}: CurriculumPageFooterProps) {
  const { nextPage, previousPage } = getLevelAdjacentPages(syllabus, pageSlug);
  const previousTarget = toAdjacentTarget(previousPage);
  const nextTarget = toAdjacentTarget(nextPage);

  if (previousTarget === null && nextTarget === null) {
    return null;
  }

  return (
    <nav
      aria-label="Page navigation"
      className={cn("mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-2", className)}
      {...props}
    >
      {previousTarget === null ? null : (
        <AdjacentLink direction="previous" target={previousTarget} />
      )}
      {nextTarget === null ? null : <AdjacentLink direction="next" target={nextTarget} />}
    </nav>
  );
}

function toAdjacentTarget(entry: SyllabusPageEntry | null): AdjacentTarget | null {
  if (entry === null) {
    return null;
  }

  const params = toLevelRouteParams(entry.pageSlug);
  return params === null ? null : { params, title: entry.title };
}

function AdjacentLink({
  direction,
  target,
}: {
  direction: "next" | "previous";
  target: AdjacentTarget;
}) {
  const isNext = direction === "next";
  const Icon = isNext ? ChevronRight : ChevronLeft;
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
          params={target.params}
          to="/levels/$section/$page"
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

export { CurriculumPageFooter };
