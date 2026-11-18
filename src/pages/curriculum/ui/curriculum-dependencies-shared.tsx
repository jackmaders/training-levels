import type { Ref } from "react";

import type { SyllabusPageEntry } from "@/shared/curriculum-data";
import { Badge } from "@/shared/ui/shadcn/badge";

import type { CurriculumBehaviorTrainingState } from "../model/curriculum-training-state";
import { TrainingStateBadge } from "./curriculum-training-status-summary";
import {
  formatDependencyKind,
  getBehaviorRelationships,
  relationshipTargetTitle,
} from "./dependency-relationships-helpers";

interface BehaviorCardButtonProps {
  behaviorState: CurriculumBehaviorTrainingState | undefined;
  behaviors: readonly SyllabusPageEntry[];
  buttonRef?: Ref<HTMLButtonElement> | undefined;
  chain: ReadonlySet<string>;
  completed: ReadonlySet<string>;
  includeBehaviorSlug?: boolean | undefined;
  isSelected: boolean;
  onSelect: (pageSlug: string) => void;
  page: SyllabusPageEntry;
}

function resolveBehaviorCardMetrics({
  behaviorState,
  chain,
  completed,
  page,
}: {
  behaviorState: CurriculumBehaviorTrainingState | undefined;
  chain: ReadonlySet<string>;
  completed: ReadonlySet<string>;
  page: SyllabusPageEntry;
}) {
  const stepIds = page.stepIds ?? [];
  const done =
    behaviorState?.completedStepCount ?? stepIds.filter((id) => completed.has(id)).length;
  const total = behaviorState?.totalStepCount ?? stepIds.length;
  const isInChain = behaviorState?.isInSelectedPrerequisiteChain ?? chain.has(page.pageSlug);
  const isRecommendedNext = behaviorState?.isRecommendedNext ?? false;
  const isEligibleNext = !isRecommendedNext && (behaviorState?.isEligibleNextOption ?? false);

  return { done, isEligibleNext, isInChain, isRecommendedNext, total };
}

function getBehaviorCardClassName({
  isInChain,
  isRecommendedNext,
  isSelected,
}: {
  isInChain: boolean;
  isRecommendedNext: boolean;
  isSelected: boolean;
}): string {
  const base =
    "w-full rounded-lg border p-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

  if (isSelected) {
    return `${base} border-primary bg-primary/10`;
  }
  if (isRecommendedNext) {
    return `${base} border-primary/70 bg-primary/5 hover:bg-primary/10`;
  }
  if (isInChain) {
    return `${base} border-primary/50 bg-primary/5 hover:bg-muted`;
  }
  return `${base} bg-card hover:bg-muted`;
}

function BehaviorCardBadges({
  behaviorState,
  isEligibleNext,
  isInChain,
  isRecommendedNext,
}: {
  behaviorState: CurriculumBehaviorTrainingState | undefined;
  isEligibleNext: boolean;
  isInChain: boolean;
  isRecommendedNext: boolean;
}) {
  if (behaviorState === undefined && !isInChain) {
    return null;
  }

  return (
    <span className="mt-2 flex flex-wrap gap-1.5">
      {behaviorState === undefined ? null : (
        <TrainingStateBadge label={behaviorState.stateLabel} stateKind={behaviorState.stateKind} />
      )}
      {isInChain ? <Badge variant="outline">In selected prerequisite chain</Badge> : null}
      {isRecommendedNext ? <Badge variant="default">Recommended next</Badge> : null}
      {isEligibleNext ? <Badge variant="outline">Eligible next option</Badge> : null}
    </span>
  );
}

function BehaviorRelationshipLines({
  behaviors,
  pageSlug,
}: {
  behaviors: readonly { pageSlug: string; title: string }[];
  pageSlug: string;
}) {
  const relationships = getBehaviorRelationships(pageSlug);
  if (relationships.length === 0) {
    return null;
  }

  return (
    <>
      {relationships.map((item) => (
        <span
          className="mt-1 flex items-center gap-2 border-l-2 border-primary/40 pl-2 text-xs text-muted-foreground"
          key={`${item.sourcePageSlug}:${item.targetPageSlug}:${item.kind}`}
        >
          <span aria-hidden="true" className="font-bold text-primary">
            →
          </span>
          <span>
            {formatDependencyKind(item.kind)}:{" "}
            {relationshipTargetTitle(behaviors, item.targetPageSlug)}
          </span>
        </span>
      ))}
    </>
  );
}

function BehaviorCardButton({
  behaviorState,
  behaviors,
  buttonRef,
  chain,
  completed,
  includeBehaviorSlug = false,
  isSelected,
  onSelect,
  page,
}: BehaviorCardButtonProps) {
  const { done, isEligibleNext, isInChain, isRecommendedNext, total } = resolveBehaviorCardMetrics({
    behaviorState,
    chain,
    completed,
    page,
  });

  return (
    <button
      aria-pressed={isSelected}
      className={getBehaviorCardClassName({ isInChain, isRecommendedNext, isSelected })}
      data-behavior-slug={includeBehaviorSlug ? page.pageSlug : undefined}
      data-eligible-next={isEligibleNext ? "true" : undefined}
      data-prerequisite-chain={isInChain ? "true" : undefined}
      data-recommended-next={isRecommendedNext ? "true" : undefined}
      ref={buttonRef}
      type="button"
      onClick={() => {
        onSelect(page.pageSlug);
      }}
    >
      <span className="block font-semibold">{page.title}</span>
      <span className="mt-1 block text-muted-foreground">
        {done} of {total} Steps complete
      </span>
      <BehaviorCardBadges
        behaviorState={behaviorState}
        isEligibleNext={isEligibleNext}
        isInChain={isInChain}
        isRecommendedNext={isRecommendedNext}
      />
      <BehaviorRelationshipLines behaviors={behaviors} pageSlug={page.pageSlug} />
    </button>
  );
}

export { BehaviorCardButton };
