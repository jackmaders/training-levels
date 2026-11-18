/* eslint-disable max-lines */
export type DependencyKind = "co-practice" | "helpful background" | "prerequisite" | "reading";

export interface DependencyRelationship {
  kind: DependencyKind;
  sourcePageSlug: string;
  targetPageSlug: string;
}

const MAIN_QUEST_RELATIONSHIPS: DependencyRelationship[] = [
  {
    kind: "reading",
    sourcePageSlug: "level-1/zen",
    targetPageSlug: "theory/07-the-thinking-of-training",
  },
  {
    kind: "reading",
    sourcePageSlug: "level-1/come",
    targetPageSlug: "theory/07-the-thinking-of-training",
  },
  { kind: "prerequisite", sourcePageSlug: "level-1/come", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-1/target", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-1/target", targetPageSlug: "level-1/come" },
  { kind: "prerequisite", sourcePageSlug: "level-1/target", targetPageSlug: "level-1/sit" },
  { kind: "helpful background", sourcePageSlug: "level-1/sit", targetPageSlug: "level-1/zen" },
  { kind: "helpful background", sourcePageSlug: "level-1/sit", targetPageSlug: "level-1/come" },
  { kind: "helpful background", sourcePageSlug: "level-1/down", targetPageSlug: "level-1/zen" },
  { kind: "helpful background", sourcePageSlug: "level-1/down", targetPageSlug: "level-1/come" },
  { kind: "helpful background", sourcePageSlug: "level-1/down", targetPageSlug: "level-1/sit" },
  { kind: "prerequisite", sourcePageSlug: "level-2/zen", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-2/focus", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-2/focus", targetPageSlug: "level-2/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-2/come", targetPageSlug: "level-1/come" },
  { kind: "prerequisite", sourcePageSlug: "level-2/down", targetPageSlug: "level-1/down" },
  { kind: "helpful background", sourcePageSlug: "level-2/down", targetPageSlug: "level-1/zen" },
  { kind: "helpful background", sourcePageSlug: "level-2/down", targetPageSlug: "level-2/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-2/target", targetPageSlug: "level-1/target" },
  { kind: "helpful background", sourcePageSlug: "level-2/crate", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-2/lazy-leash", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-2/lazy-leash", targetPageSlug: "level-2/zen" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/lazy-leash",
    targetPageSlug: "level-2/go-to-mat",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/lazy-leash",
    targetPageSlug: "level-2/come",
  },
  { kind: "prerequisite", sourcePageSlug: "level-2/go-to-mat", targetPageSlug: "level-1/down" },
  { kind: "prerequisite", sourcePageSlug: "level-2/go-to-mat", targetPageSlug: "level-2/down" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/go-to-mat",
    targetPageSlug: "level-1/target",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/go-to-mat",
    targetPageSlug: "level-2/distance",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/go-to-mat",
    targetPageSlug: "level-2/jump",
  },
  { kind: "reading", sourcePageSlug: "level-2/go-to-mat", targetPageSlug: "level-2/relax" },
  { kind: "co-practice", sourcePageSlug: "level-2/go-to-mat", targetPageSlug: "level-2/relax" },
  { kind: "co-practice", sourcePageSlug: "level-2/relax", targetPageSlug: "level-2/go-to-mat" },
  { kind: "co-practice", sourcePageSlug: "level-2/relax", targetPageSlug: "level-2/down" },
  { kind: "co-practice", sourcePageSlug: "level-2/relax", targetPageSlug: "level-2/lazy-leash" },
  { kind: "helpful background", sourcePageSlug: "level-2/relax", targetPageSlug: "level-1/zen" },
  { kind: "helpful background", sourcePageSlug: "level-2/relax", targetPageSlug: "level-1/down" },
  { kind: "co-practice", sourcePageSlug: "level-2/sit", targetPageSlug: "level-2/down" },
  { kind: "co-practice", sourcePageSlug: "level-2/sit", targetPageSlug: "level-2/go-to-mat" },
  { kind: "co-practice", sourcePageSlug: "level-2/sit", targetPageSlug: "level-2/crate" },
  { kind: "co-practice", sourcePageSlug: "level-2/sit", targetPageSlug: "level-2/relax" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/tricks",
    targetPageSlug: "level-1/target",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/distance",
    targetPageSlug: "level-1/target",
  },
  { kind: "co-practice", sourcePageSlug: "level-2/distance", targetPageSlug: "level-2/sit" },
  { kind: "co-practice", sourcePageSlug: "level-2/distance", targetPageSlug: "level-2/go-to-mat" },
  { kind: "co-practice", sourcePageSlug: "level-2/distance", targetPageSlug: "level-2/jump" },
  { kind: "helpful background", sourcePageSlug: "level-2/jump", targetPageSlug: "level-1/target" },
  { kind: "co-practice", sourcePageSlug: "level-2/jump", targetPageSlug: "level-2/sit" },
  { kind: "co-practice", sourcePageSlug: "level-2/jump", targetPageSlug: "level-2/crate" },
  { kind: "co-practice", sourcePageSlug: "level-2/jump", targetPageSlug: "level-2/go-to-mat" },
  { kind: "co-practice", sourcePageSlug: "level-2/jump", targetPageSlug: "level-2/distance" },
  { kind: "prerequisite", sourcePageSlug: "level-2/handling", targetPageSlug: "level-1/come" },
  { kind: "prerequisite", sourcePageSlug: "level-2/handling", targetPageSlug: "level-1/target" },
  { kind: "prerequisite", sourcePageSlug: "level-2/handling", targetPageSlug: "level-2/relax" },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-2/communication",
    targetPageSlug: "level-2/focus",
  },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-2/communication",
    targetPageSlug: "level-2/lazy-leash",
  },
  { kind: "prerequisite", sourcePageSlug: "level-3/zen", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-3/zen", targetPageSlug: "level-2/zen" },
  { kind: "helpful background", sourcePageSlug: "level-3/zen", targetPageSlug: "level-2/sit" },
  { kind: "helpful background", sourcePageSlug: "level-3/zen", targetPageSlug: "level-2/down" },
  { kind: "prerequisite", sourcePageSlug: "level-3/focus", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-3/focus", targetPageSlug: "level-2/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-3/focus", targetPageSlug: "level-2/focus" },
  { kind: "helpful background", sourcePageSlug: "level-3/focus", targetPageSlug: "level-2/sit" },
  { kind: "helpful background", sourcePageSlug: "level-3/focus", targetPageSlug: "level-2/down" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/focus",
    targetPageSlug: "level-2/distance",
  },
  { kind: "helpful background", sourcePageSlug: "level-3/focus", targetPageSlug: "level-2/jump" },
  { kind: "prerequisite", sourcePageSlug: "level-3/come", targetPageSlug: "level-1/come" },
  { kind: "prerequisite", sourcePageSlug: "level-3/come", targetPageSlug: "level-2/come" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/come",
    targetPageSlug: "level-2/lazy-leash",
  },
  { kind: "prerequisite", sourcePageSlug: "level-3/target", targetPageSlug: "level-1/target" },
  { kind: "prerequisite", sourcePageSlug: "level-3/target", targetPageSlug: "level-2/target" },
  { kind: "prerequisite", sourcePageSlug: "level-3/sit", targetPageSlug: "level-2/sit" },
  { kind: "prerequisite", sourcePageSlug: "level-3/sit", targetPageSlug: "level-2/down" },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-3/lazy-leash",
    targetPageSlug: "level-2/lazy-leash",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/lazy-leash",
    targetPageSlug: "level-1/zen",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/lazy-leash",
    targetPageSlug: "level-2/zen",
  },
  { kind: "prerequisite", sourcePageSlug: "level-3/retrieve", targetPageSlug: "level-1/target" },
  { kind: "prerequisite", sourcePageSlug: "level-3/retrieve", targetPageSlug: "level-2/target" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/retrieve",
    targetPageSlug: "level-2/distance",
  },
  { kind: "prerequisite", sourcePageSlug: "level-3/distance", targetPageSlug: "level-2/sit" },
  { kind: "prerequisite", sourcePageSlug: "level-3/distance", targetPageSlug: "level-2/go-to-mat" },
  { kind: "prerequisite", sourcePageSlug: "level-3/distance", targetPageSlug: "level-2/distance" },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-3/distance",
    targetPageSlug: "level-2/lazy-leash",
  },
  { kind: "prerequisite", sourcePageSlug: "level-3/jump", targetPageSlug: "level-2/jump" },
  { kind: "prerequisite", sourcePageSlug: "level-3/jump", targetPageSlug: "level-2/lazy-leash" },
  { kind: "prerequisite", sourcePageSlug: "level-3/jump", targetPageSlug: "level-2/zen" },
  { kind: "co-practice", sourcePageSlug: "level-3/down", targetPageSlug: "level-2/go-to-mat" },
  { kind: "co-practice", sourcePageSlug: "level-3/down", targetPageSlug: "level-2/crate" },
  { kind: "co-practice", sourcePageSlug: "level-3/down", targetPageSlug: "level-2/relax" },
  { kind: "co-practice", sourcePageSlug: "level-3/down", targetPageSlug: "level-2/sit" },
  { kind: "co-practice", sourcePageSlug: "level-3/down", targetPageSlug: "level-2/down" },
  { kind: "co-practice", sourcePageSlug: "level-3/go-to-mat", targetPageSlug: "level-2/go-to-mat" },
  { kind: "co-practice", sourcePageSlug: "level-3/go-to-mat", targetPageSlug: "level-2/crate" },
  { kind: "co-practice", sourcePageSlug: "level-3/go-to-mat", targetPageSlug: "level-2/relax" },
  { kind: "co-practice", sourcePageSlug: "level-3/go-to-mat", targetPageSlug: "level-2/jump" },
  { kind: "co-practice", sourcePageSlug: "level-3/go-to-mat", targetPageSlug: "level-3/crate" },
  { kind: "prerequisite", sourcePageSlug: "level-3/relax", targetPageSlug: "level-2/relax" },
  { kind: "prerequisite", sourcePageSlug: "level-3/relax", targetPageSlug: "level-2/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-3/relax", targetPageSlug: "level-2/go-to-mat" },
  { kind: "helpful background", sourcePageSlug: "level-3/relax", targetPageSlug: "level-2/down" },
  { kind: "prerequisite", sourcePageSlug: "level-3/crate", targetPageSlug: "level-2/crate" },
  { kind: "helpful background", sourcePageSlug: "level-3/crate", targetPageSlug: "level-2/zen" },
  { kind: "helpful background", sourcePageSlug: "level-3/crate", targetPageSlug: "level-2/sit" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/crate",
    targetPageSlug: "level-2/go-to-mat",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/crate",
    targetPageSlug: "level-2/distance",
  },
  { kind: "helpful background", sourcePageSlug: "level-3/crate", targetPageSlug: "level-2/relax" },
  { kind: "prerequisite", sourcePageSlug: "level-3/handling", targetPageSlug: "level-2/handling" },
  { kind: "helpful background", sourcePageSlug: "level-3/handling", targetPageSlug: "level-2/zen" },
  { kind: "helpful background", sourcePageSlug: "level-3/handling", targetPageSlug: "level-2/sit" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/handling",
    targetPageSlug: "level-2/down",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/handling",
    targetPageSlug: "level-2/crate",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/handling",
    targetPageSlug: "level-2/go-to-mat",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/handling",
    targetPageSlug: "level-2/jump",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/handling",
    targetPageSlug: "level-2/relax",
  },
  { kind: "prerequisite", sourcePageSlug: "level-3/communication", targetPageSlug: "level-1/sit" },
  { kind: "prerequisite", sourcePageSlug: "level-3/communication", targetPageSlug: "level-2/sit" },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-3/communication",
    targetPageSlug: "level-1/target",
  },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-3/communication",
    targetPageSlug: "level-2/target",
  },
  { kind: "prerequisite", sourcePageSlug: "level-4/zen", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-4/zen", targetPageSlug: "level-2/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-4/zen", targetPageSlug: "level-3/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-4/focus", targetPageSlug: "level-1/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-4/focus", targetPageSlug: "level-2/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-4/focus", targetPageSlug: "level-3/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-4/focus", targetPageSlug: "level-2/focus" },
  { kind: "prerequisite", sourcePageSlug: "level-4/focus", targetPageSlug: "level-3/focus" },
  { kind: "helpful background", sourcePageSlug: "level-4/focus", targetPageSlug: "level-2/relax" },
  { kind: "helpful background", sourcePageSlug: "level-4/focus", targetPageSlug: "level-2/sit" },
  { kind: "helpful background", sourcePageSlug: "level-4/focus", targetPageSlug: "level-2/down" },
  { kind: "prerequisite", sourcePageSlug: "level-4/retrieve", targetPageSlug: "level-1/target" },
  { kind: "prerequisite", sourcePageSlug: "level-4/retrieve", targetPageSlug: "level-2/target" },
  { kind: "prerequisite", sourcePageSlug: "level-4/retrieve", targetPageSlug: "level-3/retrieve" },
  { kind: "prerequisite", sourcePageSlug: "level-4/target", targetPageSlug: "level-1/target" },
  { kind: "prerequisite", sourcePageSlug: "level-4/target", targetPageSlug: "level-3/target" },
  { kind: "prerequisite", sourcePageSlug: "level-4/come", targetPageSlug: "level-1/come" },
  { kind: "prerequisite", sourcePageSlug: "level-4/come", targetPageSlug: "level-1/zen" },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-4/lazy-leash",
    targetPageSlug: "level-2/lazy-leash",
  },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-4/lazy-leash",
    targetPageSlug: "level-3/lazy-leash",
  },
  { kind: "prerequisite", sourcePageSlug: "level-4/crate", targetPageSlug: "level-2/crate" },
  { kind: "prerequisite", sourcePageSlug: "level-4/crate", targetPageSlug: "level-3/crate" },
  { kind: "prerequisite", sourcePageSlug: "level-4/crate", targetPageSlug: "level-3/down" },
  { kind: "prerequisite", sourcePageSlug: "level-4/crate", targetPageSlug: "level-3/jump" },
  { kind: "co-practice", sourcePageSlug: "level-4/crate", targetPageSlug: "level-4/go-to-mat" },
  { kind: "co-practice", sourcePageSlug: "level-4/crate", targetPageSlug: "level-4/relax" },
  { kind: "prerequisite", sourcePageSlug: "level-4/relax", targetPageSlug: "level-2/relax" },
  { kind: "prerequisite", sourcePageSlug: "level-4/relax", targetPageSlug: "level-3/relax" },
  { kind: "prerequisite", sourcePageSlug: "level-4/relax", targetPageSlug: "level-2/zen" },
  { kind: "prerequisite", sourcePageSlug: "level-4/relax", targetPageSlug: "level-3/zen" },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-4/go-to-mat",
    targetPageSlug: "level-2/go-to-mat",
  },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-4/go-to-mat",
    targetPageSlug: "level-3/go-to-mat",
  },
  { kind: "prerequisite", sourcePageSlug: "level-4/go-to-mat", targetPageSlug: "level-2/crate" },
  { kind: "prerequisite", sourcePageSlug: "level-4/go-to-mat", targetPageSlug: "level-3/crate" },
  { kind: "prerequisite", sourcePageSlug: "level-4/go-to-mat", targetPageSlug: "level-2/relax" },
  { kind: "prerequisite", sourcePageSlug: "level-4/go-to-mat", targetPageSlug: "level-3/relax" },
  { kind: "co-practice", sourcePageSlug: "level-4/go-to-mat", targetPageSlug: "level-4/crate" },
  { kind: "co-practice", sourcePageSlug: "level-4/go-to-mat", targetPageSlug: "level-4/relax" },
  {
    kind: "helpful background",
    sourcePageSlug: "level-4/distance",
    targetPageSlug: "level-1/come",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-4/distance",
    targetPageSlug: "level-3/handling",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-4/distance",
    targetPageSlug: "level-4/go-to-mat",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-4/distance",
    targetPageSlug: "level-4/crate",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-4/distance",
    targetPageSlug: "level-4/target",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-4/communication",
    targetPageSlug: "level-2/focus",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-4/handling",
    targetPageSlug: "level-2/lazy-leash",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-2/go-to-mat",
    targetPageSlug: "level-1/down",
  },
  {
    kind: "co-practice",
    sourcePageSlug: "level-2/go-to-mat",
    targetPageSlug: "level-2/relax",
  },
  {
    kind: "co-practice",
    sourcePageSlug: "level-2/relax",
    targetPageSlug: "level-2/go-to-mat",
  },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-3/retrieve",
    targetPageSlug: "level-1/target",
  },
  {
    kind: "prerequisite",
    sourcePageSlug: "level-3/retrieve",
    targetPageSlug: "level-2/target",
  },
  {
    kind: "helpful background",
    sourcePageSlug: "level-3/retrieve",
    targetPageSlug: "level-2/distance",
  },
  {
    kind: "reading",
    sourcePageSlug: "level-2/go-to-mat",
    targetPageSlug: "level-2/relax",
  },
];

function getPrerequisiteChain(pageSlug: string): string[] {
  const chain = new Set<string>();
  const pending = [pageSlug];

  for (let current = pending.pop(); current !== undefined; current = pending.pop()) {
    const nextTargets = MAIN_QUEST_RELATIONSHIPS.filter(
      (relationship) =>
        relationship.sourcePageSlug === current &&
        relationship.kind === "prerequisite" &&
        !chain.has(relationship.targetPageSlug),
    ).map((relationship) => relationship.targetPageSlug);
    for (const target of nextTargets) {
      chain.add(target);
      pending.push(target);
    }
  }

  return [...chain];
}

function validateDependencyRelationships(pageSlugs: readonly string[]): boolean {
  const pages = new Set(pageSlugs);
  if (
    MAIN_QUEST_RELATIONSHIPS.some(
      ({ sourcePageSlug, targetPageSlug }) =>
        !pages.has(sourcePageSlug) ||
        !pages.has(targetPageSlug) ||
        sourcePageSlug === targetPageSlug,
    )
  ) {
    return false;
  }

  return pageSlugs.every((pageSlug) => !getPrerequisiteChain(pageSlug).includes(pageSlug));
}

export { getPrerequisiteChain, MAIN_QUEST_RELATIONSHIPS, validateDependencyRelationships };
