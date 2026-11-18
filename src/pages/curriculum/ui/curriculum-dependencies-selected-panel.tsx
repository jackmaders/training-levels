import type { BehaviorStep, CurriculumPage, SyllabusPageEntry } from "@/shared/curriculum-data";

import type {
  CurriculumBehaviorTrainingState,
  CurriculumStepTrainingState,
} from "../model/curriculum-training-state";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import {
  CurriculumBehaviorTrainingSummary,
  StepActiveTrainingBadge,
  StepTrainingLinks,
} from "./curriculum-training-status-summary";
import {
  formatDependencyKind,
  getBehaviorRelationships,
  relationshipTargetTitle,
} from "./dependency-relationships-helpers";

interface CurriculumDependenciesSelectedPanelProps {
  behaviors: readonly SyllabusPageEntry[];
  completed: ReadonlySet<string>;
  currentLevelNumber: number;
  detail: CurriculumPage | null | undefined;
  onSelectBehavior: (pageSlug: string) => void;
  selected: SyllabusPageEntry;
  selectedState: CurriculumBehaviorTrainingState | undefined;
}

function SelectedStepDetailItem({
  isCompleted,
  step,
  stepState,
}: {
  isCompleted: boolean;
  step: BehaviorStep;
  stepState: CurriculumStepTrainingState | undefined;
}) {
  return (
    <li className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{step.heading}</p>
        <StepActiveTrainingBadge stepState={stepState} />
      </div>
      <p className="text-sm text-muted-foreground">{isCompleted ? "Completed" : "Not completed"}</p>
      <StepTrainingLinks stepId={step.stepId} stepNumber={step.stepNumber} stepState={stepState} />
    </li>
  );
}

function SelectedRelationshipsList({
  behaviors,
  onSelectBehavior,
  selectedPageSlug,
}: {
  behaviors: readonly SyllabusPageEntry[];
  onSelectBehavior: (pageSlug: string) => void;
  selectedPageSlug: string;
}) {
  const relationships = getBehaviorRelationships(selectedPageSlug);

  return (
    <ul className="mt-4 space-y-2">
      {relationships.map((item) => {
        const target = behaviors.find((page) => page.pageSlug === item.targetPageSlug);
        const key = `${item.sourcePageSlug}:${item.targetPageSlug}:${item.kind}`;

        if (target === undefined) {
          return (
            <li className="flex flex-wrap items-center gap-2 text-sm" key={key}>
              <span>{formatDependencyKind(item.kind)} →</span>
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
          <li className="flex flex-wrap items-center gap-2 text-sm" key={key}>
            <span>{formatDependencyKind(item.kind)} →</span>
            <button
              className="text-primary underline underline-offset-4"
              type="button"
              onClick={() => {
                onSelectBehavior(target.pageSlug);
              }}
            >
              {target.title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CurriculumDependenciesSelectedPanel({
  behaviors,
  completed,
  currentLevelNumber,
  detail,
  onSelectBehavior,
  selected,
  selectedState,
}: CurriculumDependenciesSelectedPanelProps) {
  return (
    <section aria-label="Selected behavior" className="rounded-xl border bg-card p-5">
      <h2 className="text-xl font-semibold">{selected.title}</h2>
      <div className="mt-3">
        <CurriculumBehaviorTrainingSummary
          behaviorState={selectedState}
          currentLevelNumber={currentLevelNumber}
        />
      </div>
      <h3 className="mt-4 font-semibold">Step details</h3>
      <ol className="mt-2 list-decimal space-y-2 pl-5">
        {detail?.kind === "behavior"
          ? detail.steps.map((step) => (
              <SelectedStepDetailItem
                isCompleted={completed.has(step.stepId)}
                key={step.stepId}
                step={step}
                stepState={selectedState?.stepsById.get(step.stepId)}
              />
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
      <SelectedRelationshipsList
        behaviors={behaviors}
        selectedPageSlug={selected.pageSlug}
        onSelectBehavior={onSelectBehavior}
      />
    </section>
  );
}

export { CurriculumDependenciesSelectedPanel };
