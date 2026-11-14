import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { CheckCircle2, Menu } from "lucide-react";
import { useState } from "react";

import type {
  CurriculumSyllabus,
  LevelSectionSlug,
  SyllabusPageEntry,
  SyllabusSection,
} from "@/shared/curriculum-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/shadcn/accordion";
import { Button } from "@/shared/ui/shadcn/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/shadcn/drawer";

import {
  getBehaviorProgress,
  getLevelSections,
  getSectionProgress,
  toLevelRouteParams,
} from "../model/curriculum-levels";

interface CurriculumSidebarProps {
  completedStepIds: ReadonlySet<string>;
  currentPageSlug: string;
  currentSectionSlug: LevelSectionSlug;
  syllabus: CurriculumSyllabus;
}

interface SidebarTreeProps extends CurriculumSidebarProps {
  onNavigate?: (() => void) | undefined;
}

function CurriculumSidebar(props: CurriculumSidebarProps) {
  return (
    <>
      <MobileSidebarDrawer {...props} />

      <aside aria-label="Curriculum navigation" className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-20 rounded-lg border bg-card p-3">
          <SidebarSectionTree {...props} />
        </div>
      </aside>
    </>
  );
}

function MobileSidebarDrawer(props: CurriculumSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Drawer open={drawerOpen} swipeDirection="left" onOpenChange={setDrawerOpen}>
        <DrawerTrigger render={<Button size="sm" variant="outline" />}>
          <Menu aria-hidden="true" className="size-4" />
          Levels menu
        </DrawerTrigger>
        <MobileSidebarDrawerContent
          {...props}
          onNavigate={() => {
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
}

function MobileSidebarDrawerContent(props: SidebarTreeProps) {
  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Curriculum Levels</DrawerTitle>
        <DrawerDescription>Browse levels and training behaviors</DrawerDescription>
      </DrawerHeader>
      <div className="overflow-y-auto p-4">
        <SidebarSectionTree {...props} />
      </div>
    </DrawerContent>
  );
}

function SidebarSectionTree({
  completedStepIds,
  currentPageSlug,
  currentSectionSlug,
  onNavigate,
  syllabus,
}: SidebarTreeProps) {
  const sections = getLevelSections(syllabus);

  return (
    <nav aria-label="Level sections">
      <Accordion defaultValue={[currentSectionSlug]} key={currentSectionSlug} multiple>
        {sections.map((section) => (
          <SidebarSectionItem
            completedStepIds={completedStepIds}
            currentPageSlug={currentPageSlug}
            key={section.sectionSlug}
            onNavigate={onNavigate}
            section={section}
          />
        ))}
      </Accordion>
    </nav>
  );
}

function SidebarSectionItem({
  completedStepIds,
  currentPageSlug,
  onNavigate,
  section,
}: {
  completedStepIds: ReadonlySet<string>;
  currentPageSlug: string;
  onNavigate: (() => void) | undefined;
  section: SyllabusSection;
}) {
  const progress = getSectionProgress(section, completedStepIds);

  return (
    <AccordionItem value={section.sectionSlug}>
      <AccordionTrigger className="p-2 hover:no-underline">
        <span className="flex flex-1 items-center justify-between gap-2 pr-2">
          <span className="font-medium text-foreground">{section.title}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {`${String(progress.completedCount)}/${String(progress.totalCount)}`}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-1">
          {section.pages.map((entry) => (
            <SidebarPageLink
              completedStepIds={completedStepIds}
              currentPageSlug={currentPageSlug}
              entry={entry}
              key={entry.pageSlug}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

function SidebarPageLink({
  completedStepIds,
  currentPageSlug,
  entry,
  onNavigate,
}: {
  completedStepIds: ReadonlySet<string>;
  currentPageSlug: string;
  entry: SyllabusPageEntry;
  onNavigate: (() => void) | undefined;
}) {
  const params = toLevelRouteParams(entry.pageSlug);
  if (params === null) {
    return null;
  }

  const isActive = entry.pageSlug === currentPageSlug;

  return (
    <li>
      <Link
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
        params={params}
        to="/levels/$section/$page"
        {...(onNavigate === undefined ? {} : { onClick: onNavigate })}
      >
        <span className="truncate">{entry.title}</span>
        <BehaviorProgressIndicator completedStepIds={completedStepIds} entry={entry} />
      </Link>
    </li>
  );
}

function BehaviorProgressIndicator({
  completedStepIds,
  entry,
}: {
  completedStepIds: ReadonlySet<string>;
  entry: SyllabusPageEntry;
}) {
  const stepIds = entry.stepIds ?? [];
  if (entry.kind !== "behavior" || stepIds.length === 0) {
    return null;
  }

  const progress = getBehaviorProgress(stepIds, completedStepIds);
  if (progress.completedCount === 0) {
    return null;
  }

  if (progress.completedCount === progress.totalCount) {
    return <CheckCircle2 aria-label="Completed" className="size-4 shrink-0 text-primary" />;
  }

  return (
    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
      {`${String(progress.completedCount)}/${String(progress.totalCount)}`}
    </span>
  );
}

export { CurriculumSidebar };
