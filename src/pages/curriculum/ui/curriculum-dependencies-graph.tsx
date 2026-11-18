import { useLayoutEffect, useRef, useState, type RefObject } from "react";

import type { SyllabusPageEntry, SyllabusSection } from "@/shared/curriculum-data";

import type { CurriculumBehaviorTrainingState } from "../model/curriculum-training-state";
import type { DependencyKind } from "../model/dependency-relationships";
import {
  observeGraphCanvas,
  type GraphSize,
  type RelationshipPath,
} from "./curriculum-dependencies-graph-helpers";
import { BehaviorCardButton } from "./curriculum-dependencies-shared";

const INITIAL_GRAPH_DIMENSION = 1;

const STROKE_DASH_ARRAY_BY_KIND: Record<DependencyKind, string | undefined> = {
  "co-practice": "7 4",
  "helpful background": "2 4",
  prerequisite: undefined,
  reading: "8 3 2 3",
};

interface CurriculumDependenciesGraphProps {
  behaviors: readonly SyllabusPageEntry[];
  behaviorsBySlug: ReadonlyMap<string, CurriculumBehaviorTrainingState>;
  chain: ReadonlySet<string>;
  completed: ReadonlySet<string>;
  onSelectBehavior: (pageSlug: string) => void;
  sections: readonly SyllabusSection[];
  selectedPageSlug: string;
}

function DependencyGraphSvg({
  graphSize,
  relationshipPaths,
}: {
  graphSize: GraphSize;
  relationshipPaths: readonly RelationshipPath[];
}) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-visible text-primary"
      viewBox={`0 0 ${String(graphSize.width)} ${String(graphSize.height)}`}
    >
      <defs>
        <marker
          id="dependency-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
        >
          <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
        </marker>
      </defs>
      {relationshipPaths.map((path) => (
        <path
          d={path.pathData}
          fill="none"
          key={path.key}
          markerEnd="url(#dependency-arrow)"
          stroke="currentColor"
          strokeDasharray={STROKE_DASH_ARRAY_BY_KIND[path.kind]}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function DependencyGraphLevelColumn({
  behaviors,
  behaviorsBySlug,
  chain,
  completed,
  nodeRefs,
  onSelectBehavior,
  section,
  selectedPageSlug,
}: {
  behaviors: readonly SyllabusPageEntry[];
  behaviorsBySlug: ReadonlyMap<string, CurriculumBehaviorTrainingState>;
  chain: ReadonlySet<string>;
  completed: ReadonlySet<string>;
  nodeRefs: RefObject<Map<string, HTMLButtonElement>>;
  onSelectBehavior: (pageSlug: string) => void;
  section: SyllabusSection;
  selectedPageSlug: string;
}) {
  return (
    <section
      aria-label={`Level ${String(section.levelNumber)}`}
      className="relative z-10 space-y-3"
    >
      <h2 className="text-lg font-semibold">{section.title}</h2>
      {section.pages
        .filter((page) => page.kind === "behavior")
        .map((page) => (
          <BehaviorCardButton
            behaviorState={behaviorsBySlug.get(page.pageSlug)}
            behaviors={behaviors}
            buttonRef={(node) => {
              if (node === null) {
                nodeRefs.current.delete(page.pageSlug);
              } else {
                nodeRefs.current.set(page.pageSlug, node);
              }
            }}
            chain={chain}
            completed={completed}
            includeBehaviorSlug
            isSelected={selectedPageSlug === page.pageSlug}
            key={page.pageSlug}
            page={page}
            onSelect={onSelectBehavior}
          />
        ))}
    </section>
  );
}

function useDependencyGraphLayout() {
  const graphCanvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [relationshipPaths, setRelationshipPaths] = useState<RelationshipPath[]>([]);
  const [graphSize, setGraphSize] = useState<GraphSize>({
    height: INITIAL_GRAPH_DIMENSION,
    width: INITIAL_GRAPH_DIMENSION,
  });

  useLayoutEffect(
    () =>
      observeGraphCanvas({
        canvas: graphCanvasRef.current,
        nodeRefs: nodeRefs.current,
        onMeasure: (paths, size) => {
          setRelationshipPaths(paths);
          setGraphSize(size);
        },
      }),
    [],
  );

  return { graphCanvasRef, graphSize, nodeRefs, relationshipPaths };
}

function CurriculumDependenciesGraph({
  behaviors,
  behaviorsBySlug,
  chain,
  completed,
  onSelectBehavior,
  sections,
  selectedPageSlug,
}: CurriculumDependenciesGraphProps) {
  const { graphCanvasRef, graphSize, nodeRefs, relationshipPaths } = useDependencyGraphLayout();

  return (
    <section aria-label="Curriculum dependency graph" className="overflow-x-auto pb-3">
      <div className="relative isolate grid min-w-208 grid-cols-4 gap-4" ref={graphCanvasRef}>
        <DependencyGraphSvg graphSize={graphSize} relationshipPaths={relationshipPaths} />
        {sections.map((section) => (
          <DependencyGraphLevelColumn
            behaviors={behaviors}
            behaviorsBySlug={behaviorsBySlug}
            chain={chain}
            completed={completed}
            key={section.sectionSlug}
            nodeRefs={nodeRefs}
            section={section}
            selectedPageSlug={selectedPageSlug}
            onSelectBehavior={onSelectBehavior}
          />
        ))}
      </div>
    </section>
  );
}

export { CurriculumDependenciesGraph };
