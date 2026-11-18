import {
  MAIN_QUEST_RELATIONSHIPS,
  type DependencyKind,
  type DependencyRelationship,
} from "../model/dependency-relationships";

const DEPENDENCY_KIND_LABELS: Record<DependencyKind, string> = {
  "co-practice": "Co-practice",
  "helpful background": "Helpful background",
  prerequisite: "Prerequisite",
  reading: "Reading suggestion",
};

function formatDependencyKind(kind: DependencyKind): string {
  return DEPENDENCY_KIND_LABELS[kind];
}

function relationshipTargetTitle(
  behaviors: readonly { pageSlug: string; title: string }[],
  pageSlug: string,
): string {
  return behaviors.find((behavior) => behavior.pageSlug === pageSlug)?.title ?? pageSlug;
}

function getBehaviorRelationships(pageSlug: string): readonly DependencyRelationship[] {
  const seen = new Set<string>();
  return MAIN_QUEST_RELATIONSHIPS.filter((item) => {
    if (item.sourcePageSlug !== pageSlug) {
      return false;
    }
    const key = `${item.targetPageSlug}:${item.kind}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export { formatDependencyKind, getBehaviorRelationships, relationshipTargetTitle };
