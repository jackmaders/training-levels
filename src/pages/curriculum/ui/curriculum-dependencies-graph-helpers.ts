import {
  MAIN_QUEST_RELATIONSHIPS,
  type DependencyKind,
  type DependencyRelationship,
} from "../model/dependency-relationships";

const HALF_DIVISOR = 2;
const SAME_LEVEL_CURVE_OFFSET_PX = 20;

interface RelationshipPath {
  key: string;
  kind: DependencyKind;
  pathData: string;
}

interface GraphSize {
  height: number;
  width: number;
}

function formatRelationshipCurvePath({
  canvasRect,
  sameLevel,
  sourceRect,
  targetRect,
}: {
  canvasRect: DOMRect;
  sameLevel: boolean;
  sourceRect: DOMRect;
  targetRect: DOMRect;
}): string {
  const startX = (sameLevel ? sourceRect.right : sourceRect.left) - canvasRect.left;
  const endX = targetRect.right - canvasRect.left;
  const startY = sourceRect.top + sourceRect.height / HALF_DIVISOR - canvasRect.top;
  const endY = targetRect.top + targetRect.height / HALF_DIVISOR - canvasRect.top;
  const routeX = sameLevel
    ? Math.max(startX, endX) + SAME_LEVEL_CURVE_OFFSET_PX
    : (startX + endX) / HALF_DIVISOR;
  return `M ${String(startX)} ${String(startY)} C ${String(routeX)} ${String(startY)}, ${String(routeX)} ${String(endY)}, ${String(endX)} ${String(endY)}`;
}

function computeSingleRelationshipPath(
  relationship: DependencyRelationship,
  canvasRect: DOMRect,
  nodeRefs: ReadonlyMap<string, HTMLButtonElement>,
): RelationshipPath | null {
  const source = nodeRefs.get(relationship.sourcePageSlug);
  const target = nodeRefs.get(relationship.targetPageSlug);
  if (source === undefined || target === undefined) {
    return null;
  }

  const sameLevel =
    relationship.sourcePageSlug.split("/")[0] === relationship.targetPageSlug.split("/")[0];

  return {
    key: `${relationship.sourcePageSlug}:${relationship.targetPageSlug}:${relationship.kind}`,
    kind: relationship.kind,
    pathData: formatRelationshipCurvePath({
      canvasRect,
      sameLevel,
      sourceRect: source.getBoundingClientRect(),
      targetRect: target.getBoundingClientRect(),
    }),
  };
}

function buildRelationshipPaths(
  canvasRect: DOMRect,
  nodeRefs: ReadonlyMap<string, HTMLButtonElement>,
): RelationshipPath[] {
  const seenKeys = new Set<string>();
  const paths: RelationshipPath[] = [];

  for (const relationship of MAIN_QUEST_RELATIONSHIPS) {
    const path = computeSingleRelationshipPath(relationship, canvasRect, nodeRefs);
    if (path !== null && !seenKeys.has(path.key)) {
      seenKeys.add(path.key);
      paths.push(path);
    }
  }

  return paths;
}

function observeGraphCanvas({
  canvas,
  nodeRefs,
  onMeasure,
}: {
  canvas: HTMLDivElement | null;
  nodeRefs: ReadonlyMap<string, HTMLButtonElement>;
  onMeasure: (paths: RelationshipPath[], size: GraphSize) => void;
}): (() => void) | undefined {
  if (canvas === null) {
    return undefined;
  }

  const canvasElement = canvas;

  function measurePaths() {
    onMeasure(buildRelationshipPaths(canvasElement.getBoundingClientRect(), nodeRefs), {
      height: canvasElement.offsetHeight,
      width: canvasElement.offsetWidth,
    });
  }

  measurePaths();
  const observer = new ResizeObserver(measurePaths);
  observer.observe(canvas);
  for (const node of nodeRefs.values()) {
    observer.observe(node);
  }
  return () => {
    observer.disconnect();
  };
}

export { observeGraphCanvas, type GraphSize, type RelationshipPath };
