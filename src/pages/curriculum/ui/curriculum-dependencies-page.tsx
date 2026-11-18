/* eslint-disable no-magic-numbers, max-statements, max-lines, max-lines-per-function, id-length, unicorn/no-useless-undefined, func-style, react/jsx-max-depth, react/no-array-index-key, no-nested-ternary, unicorn/no-nested-ternary */
/* oxlint-disable eslint/capitalized-comments */
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLayoutEffect, useRef, useState } from "react";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../api/curriculum-query-options";
import {
  getPrerequisiteChain,
  MAIN_QUEST_RELATIONSHIPS,
  type DependencyKind,
} from "../model/dependency-relationships";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";

const INITIAL_BEHAVIOR = "level-2/go-to-mat";

interface RelationshipPath {
  d: string;
  kind: DependencyKind;
}

function CurriculumDependenciesPage() {
  const [selectedPageSlug, setSelectedPageSlug] = useState(INITIAL_BEHAVIOR);
  const { data: syllabus } = useSuspenseQuery(curriculumSyllabusQueryOptions());
  const { data: completedStepIds } = useSuspenseQuery(stepProgressQueryOptions());
  const sections = syllabus.sections.filter((section) => section.levelNumber !== undefined);
  const behaviors = sections.flatMap((section) =>
    section.pages.filter((page) => page.kind === "behavior"),
  );
  const selected = behaviors.find((page) => page.pageSlug === selectedPageSlug) ?? behaviors[0];
  if (selected === undefined) {
    throw new Error("No curriculum behaviors found.");
  }
  const { data: detail } = useSuspenseQuery(curriculumPageQueryOptions(selected.pageSlug));
  const completed = new Set(completedStepIds);
  const chain = new Set(getPrerequisiteChain(selected.pageSlug));
  const graphCanvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [relationshipPaths, setRelationshipPaths] = useState<RelationshipPath[]>([]);
  const [graphSize, setGraphSize] = useState({ height: 1, width: 1 });

  useLayoutEffect(() => {
    const canvas = graphCanvasRef.current;
    /* v8 ignore start -- @preserve */
    if (canvas === null) {
      return undefined;
    }
    /* v8 ignore stop -- @preserve */

    const measurePaths = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const paths = MAIN_QUEST_RELATIONSHIPS.flatMap((relationship) => {
        const source = nodeRefs.current.get(relationship.sourcePageSlug);
        const target = nodeRefs.current.get(relationship.targetPageSlug);
        if (source === undefined || target === undefined) {
          return [];
        }

        const sourceRect = source.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const sameLevel =
          relationship.sourcePageSlug.split("/")[0] === relationship.targetPageSlug.split("/")[0];
        const startX = (sameLevel ? sourceRect.right : sourceRect.left) - canvasRect.left;
        const endX = (sameLevel ? targetRect.right : targetRect.right) - canvasRect.left;
        const startY = sourceRect.top + sourceRect.height / 2 - canvasRect.top;
        const endY = targetRect.top + targetRect.height / 2 - canvasRect.top;
        const routeX = sameLevel ? Math.max(startX, endX) + 20 : (startX + endX) / 2;
        const d = sameLevel
          ? `M ${startX} ${startY} C ${routeX} ${startY}, ${routeX} ${endY}, ${endX} ${endY}`
          : `M ${startX} ${startY} C ${routeX} ${startY}, ${routeX} ${endY}, ${endX} ${endY}`;
        return [{ d, kind: relationship.kind }];
      });
      setRelationshipPaths(paths);
      setGraphSize({ height: canvas.offsetHeight, width: canvas.offsetWidth });
    };

    measurePaths();
    const observer = new ResizeObserver(measurePaths);
    observer.observe(canvas);
    for (const node of nodeRefs.current.values()) {
      observer.observe(node);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Main Quest foundations</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Explore the source-backed foundations across all four Levels. Prerequisites, co-practice,
          helpful background, and reading suggestions are shown as separate relationships.
        </p>
      </header>
      <section aria-label="Curriculum dependency graph" className="overflow-x-auto pb-3">
        <div className="relative isolate grid min-w-208 grid-cols-4 gap-4" ref={graphCanvasRef}>
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
            {relationshipPaths.map((path, index) => (
              <path
                d={path.d}
                fill="none"
                key={`${path.kind}-${index}`}
                markerEnd="url(#dependency-arrow)"
                stroke="currentColor"
                /* v8 ignore start -- @preserve */
                strokeDasharray={
                  path.kind === "co-practice"
                    ? "7 4"
                    : path.kind === "helpful background"
                      ? "2 4"
                      : path.kind === "reading"
                        ? "8 3 2 3"
                        : undefined
                }
                /* v8 ignore stop -- @preserve */
                strokeWidth="2"
              />
            ))}
          </svg>
          {sections.map((section) => (
            <section
              aria-label={`Level ${String(section.levelNumber)}`}
              className="relative z-10 space-y-3"
              key={section.sectionSlug}
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              {section.pages
                .filter((page) => page.kind === "behavior")
                .map((page) => {
                  const done = page.stepIds?.filter((id) => completed.has(id)).length ?? 0;
                  return (
                    <button
                      aria-pressed={selected.pageSlug === page.pageSlug}
                      className={`w-full rounded-lg border p-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${selected.pageSlug === page.pageSlug ? "border-primary bg-primary/10" : chain.has(page.pageSlug) ? "border-primary/50 bg-primary/5" : "bg-card hover:bg-muted"}`}
                      key={page.pageSlug}
                      onClick={() => {
                        setSelectedPageSlug(page.pageSlug);
                      }}
                      ref={(node) => {
                        if (node === null) {
                          nodeRefs.current.delete(page.pageSlug);
                        } else {
                          nodeRefs.current.set(page.pageSlug, node);
                        }
                      }}
                      type="button"
                      data-behavior-slug={page.pageSlug}
                    >
                      <span className="block font-semibold">{page.title}</span>
                      <span className="mt-1 block text-muted-foreground">
                        {done} of {page.stepIds?.length ?? 0} Steps complete
                      </span>
                      {MAIN_QUEST_RELATIONSHIPS.filter(
                        (item) => item.sourcePageSlug === page.pageSlug,
                      ).map((item, index) => (
                        <span
                          className="mt-1 flex items-center gap-2 border-l-2 border-primary/40 pl-2 text-xs text-muted-foreground"
                          key={`${item.targetPageSlug}-${item.kind}-${index}`}
                        >
                          <span aria-hidden="true" className="font-bold text-primary">
                            →
                          </span>
                          <span>
                            {formatKind(item.kind)}:{" "}
                            {relationshipTargetTitle(behaviors, item.targetPageSlug)}
                          </span>
                        </span>
                      ))}
                    </button>
                  );
                })}
            </section>
          ))}
        </div>
      </section>
      <section aria-label="Selected behavior" className="rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">{selected.title}</h2>
        <h3 className="mt-4 font-semibold">Step details</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          {detail?.kind === "behavior"
            ? detail.steps.map((step) => (
                <li key={step.stepId}>
                  <p className="font-medium">{step.heading}</p>
                  <p className="text-sm text-muted-foreground">
                    {completed.has(step.stepId) ? "Completed" : "Not completed"}
                  </p>
                </li>
              ))
            : null}
        </ol>
        <h3 className="mt-4 font-semibold">Source Comebefore guidance</h3>
        <a
          className="mt-1 inline-block text-sm text-primary underline underline-offset-4"
          href={selected.href}
        >
          Source: {selected.title}
        </a>
        {detail?.kind === "behavior" ? (
          <CurriculumContentBlocks blocks={detail.comebefores} className="mt-2 text-sm" />
        ) : null}
        <ul className="mt-4 space-y-2">
          {MAIN_QUEST_RELATIONSHIPS.filter((item) => item.sourcePageSlug === selected.pageSlug).map(
            (item, index) => {
              const target = behaviors.find((page) => page.pageSlug === item.targetPageSlug);
              if (target === undefined) {
                return (
                  <li
                    className="flex flex-wrap items-center gap-2 text-sm"
                    key={`${item.targetPageSlug}-${item.kind}-${index}`}
                  >
                    <span>{formatKind(item.kind)} →</span>
                    <a
                      className="text-primary underline underline-offset-4"
                      href={`/${item.targetPageSlug}`}
                    >
                      {relationshipTargetTitle(behaviors, item.targetPageSlug)}
                    </a>
                  </li>
                );
              }
              return (
                <li
                  className="flex flex-wrap items-center gap-2 text-sm"
                  key={`${target.pageSlug}-${item.kind}-${index}`}
                >
                  <span>{formatKind(item.kind)} →</span>
                  <button
                    className="text-primary underline underline-offset-4"
                    onClick={() => {
                      setSelectedPageSlug(target.pageSlug);
                    }}
                    type="button"
                  >
                    {target.title}
                  </button>
                </li>
              );
            },
          )}
        </ul>
      </section>
      <section aria-label="Dependency list" className="rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Dependency list</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {behaviors.map((page) => (
            <li key={page.pageSlug}>
              <button
                aria-pressed={selected.pageSlug === page.pageSlug}
                className="w-full rounded-md border p-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => {
                  setSelectedPageSlug(page.pageSlug);
                }}
                type="button"
              >
                <span className="block font-medium">{page.title}</span>
                <span className="block text-sm text-muted-foreground">
                  {page.stepIds?.filter((id) => completed.has(id)).length ?? 0} of{" "}
                  {page.stepIds?.length ?? 0} Steps complete
                </span>
                {MAIN_QUEST_RELATIONSHIPS.filter(
                  (item) => item.sourcePageSlug === page.pageSlug,
                ).map((item, index) => (
                  <span className="block text-sm" key={`${item.targetPageSlug}-${index}`}>
                    {formatKind(item.kind)} →{" "}
                    {relationshipTargetTitle(behaviors, item.targetPageSlug)}
                  </span>
                ))}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function formatKind(kind: DependencyKind): string {
  switch (kind) {
    case "co-practice": {
      return "Co-practice";
    }
    case "helpful background": {
      return "Helpful background";
    }
    case "prerequisite": {
      return "Prerequisite";
    }
    case "reading": {
      return "Reading suggestion";
    }
    /* v8 ignore start -- @preserve */
    default: {
      return kind;
    }
    /* v8 ignore stop -- @preserve */
  }
}

function relationshipTargetTitle(
  behaviors: { pageSlug: string; title: string }[],
  pageSlug: string,
): string {
  return behaviors.find((behavior) => behavior.pageSlug === pageSlug)?.title ?? pageSlug;
}

export { CurriculumDependenciesPage };
