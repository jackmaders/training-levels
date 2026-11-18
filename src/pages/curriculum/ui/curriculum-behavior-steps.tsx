import { AlertCircle } from "lucide-react";

import type { BehaviorCurriculumPage } from "@/shared/curriculum-data";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/shadcn/alert";

import type { PageGeneralizationState } from "../api/generalization-service";
import { useToggleStep } from "../api/use-toggle-step";
import { resolveStepProvenance } from "../model/step-provenance";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import { CurriculumStepCard } from "./curriculum-step-card";
import { useSaveComeafterAction } from "./use-generalization-actions";

interface CurriculumBehaviorStepsProps {
  completedStepIds: ReadonlySet<string>;
  generalization: PageGeneralizationState;
  onStepOpenChange: (anchor: string, open: boolean) => void;
  openAnchors: ReadonlySet<string>;
  page: BehaviorCurriculumPage;
}

function CurriculumBehaviorSteps({
  completedStepIds,
  generalization,
  onStepOpenChange,
  openAnchors,
  page,
}: CurriculumBehaviorStepsProps) {
  const { error, mutate: toggleStep } = useToggleStep();
  const { mutateAsync: saveComeafter } = useSaveComeafterAction(page.pageSlug);

  return (
    <section aria-labelledby="steps-heading" className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight" id="steps-heading">
        Steps
      </h2>
      {page.stepsIntroBlocks.length > 0 ? (
        <CurriculumContentBlocks blocks={page.stepsIntroBlocks} />
      ) : null}
      <StepToggleErrorAlert error={error} />
      <div className="space-y-3">
        {page.steps.map((step) => {
          const isCompleted = completedStepIds.has(step.stepId);
          return (
            <CurriculumStepCard
              comeafterRecord={generalization.comeafters[step.stepId] ?? null}
              isCompleted={isCompleted}
              key={step.stepId}
              open={openAnchors.has(step.anchor)}
              provenanceSummary={resolveStepProvenance({
                isCompleted,
                latestTestOutcome: generalization.latestStepTests[step.stepId] ?? null,
              })}
              step={step}
              onOpenChange={(open) => {
                onStepOpenChange(step.anchor, open);
              }}
              onSaveComeafter={saveComeafter}
              onToggle={(stepId, completed) => {
                toggleStep({ completed, stepId });
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

function StepToggleErrorAlert({ error }: { error: Error | null }) {
  if (error === null) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" className="size-4" />
      <AlertTitle>Could not update step progress</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}

export { CurriculumBehaviorSteps };
