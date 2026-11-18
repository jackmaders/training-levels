import { Badge } from "@/shared/ui/shadcn/badge";

import { CurriculumDependenciesGraph } from "./curriculum-dependencies-graph";
import { CurriculumDependenciesList } from "./curriculum-dependencies-list";
import { CurriculumDependenciesSelectedPanel } from "./curriculum-dependencies-selected-panel";
import { useDependenciesPageState } from "./use-dependencies-page-state";

function DependenciesPageHeader({ currentLevelNumber }: { currentLevelNumber: number }) {
  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Main Quest foundations</h1>
        <Badge variant="secondary">{`Current goal: Level ${String(currentLevelNumber)}`}</Badge>
      </div>
      <p className="max-w-3xl text-muted-foreground">
        Explore the source-backed foundations across all four Levels. Prerequisites, co-practice,
        helpful background, and reading suggestions are shown as separate relationships.
      </p>
    </header>
  );
}

function CurriculumDependenciesPage() {
  const {
    behaviors,
    behaviorsBySlug,
    chain,
    completed,
    currentLevelNumber,
    detail,
    sections,
    selected,
    selectedState,
    setSelectedPageSlug,
  } = useDependenciesPageState();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <DependenciesPageHeader currentLevelNumber={currentLevelNumber} />
      <CurriculumDependenciesGraph
        behaviors={behaviors}
        behaviorsBySlug={behaviorsBySlug}
        chain={chain}
        completed={completed}
        sections={sections}
        selectedPageSlug={selected.pageSlug}
        onSelectBehavior={setSelectedPageSlug}
      />
      <CurriculumDependenciesSelectedPanel
        behaviors={behaviors}
        completed={completed}
        currentLevelNumber={currentLevelNumber}
        detail={detail}
        selected={selected}
        selectedState={selectedState}
        onSelectBehavior={setSelectedPageSlug}
      />
      <CurriculumDependenciesList
        behaviors={behaviors}
        behaviorsBySlug={behaviorsBySlug}
        chain={chain}
        completed={completed}
        selectedPageSlug={selected.pageSlug}
        onSelectBehavior={setSelectedPageSlug}
      />
    </main>
  );
}

export { CurriculumDependenciesPage };
