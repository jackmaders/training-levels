import { AlertCircle } from "lucide-react";

import type { BehaviorCurriculumPage } from "@/shared/curriculum-data";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/shadcn/alert";

import { useToggleStep } from "../api/use-toggle-step";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";
import { CurriculumStepCard } from "./curriculum-step-card";

interface CurriculumBehaviorStepsProps {
  completedStepIds: ReadonlySet<string>;
  onStepOpenChange: (anchor: string, open: boolean) => void;
  openAnchors: ReadonlySet<string>;
  page: BehaviorCurriculumPage;
}

function CurriculumBehaviorSteps({
  completedStepIds,
  onStepOpenChange,
  openAnchors,
  page,
}: CurriculumBehaviorStepsProps) {
  const { error, mutate: toggleStep } = useToggleStep();

  return (
    <section aria-labelledby="steps-heading" className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight" id="steps-heading">
        Steps
      </h2>
      {page.stepsIntroBlocks.length > 0 ? (
        <CurriculumContentBlocks blocks={page.stepsIntroBlocks} />
      ) : null}
      {error === null ? null : (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" className="size-4" />
          <AlertTitle>Could not update step progress</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-3">
        {page.steps.map((step) => (
          <CurriculumStepCard
            isCompleted={completedStepIds.has(step.stepId)}
            key={step.stepId}
            open={openAnchors.has(step.anchor)}
            step={step}
            onOpenChange={(open) => {
              onStepOpenChange(step.anchor, open);
            }}
            onToggle={(stepId, completed) => {
              toggleStep({ completed, stepId });
            }}
          />
        ))}
      </div>
    </section>
  );
}

export { CurriculumBehaviorSteps };
