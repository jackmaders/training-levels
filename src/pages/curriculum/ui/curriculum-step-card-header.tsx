import { ChevronDown } from "lucide-react";

import type { BehaviorStep } from "@/shared/curriculum-data";
import { Button } from "@/shared/ui/shadcn/button";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
import { CollapsibleTrigger } from "@/shared/ui/shadcn/collapsible";

import { formatStepSummary } from "../model/curriculum-levels";
import type { CurriculumStepTrainingState } from "../model/curriculum-training-state";
import type { StepProvenanceSummary } from "../model/step-provenance";
import { CurriculumStepProvenance } from "./curriculum-step-provenance";
import { StepActiveTrainingBadge } from "./curriculum-training-status-summary";

interface StepCardHeaderProps {
  isCompleted: boolean;
  onToggle: (stepId: string, completed: boolean) => void;
  provenanceSummary: StepProvenanceSummary;
  step: BehaviorStep;
  stepState?: CurriculumStepTrainingState | undefined;
}

function StepCardHeader({
  isCompleted,
  onToggle,
  provenanceSummary,
  step,
  stepState,
}: StepCardHeaderProps) {
  const summary = formatStepSummary(step.heading);

  return (
    <div className="flex items-start gap-3 px-4 py-3 sm:items-center">
      <Checkbox
        aria-label={`Toggle ${step.heading}`}
        checked={isCompleted}
        className="mt-0.5 sm:mt-0"
        onCheckedChange={(checked) => {
          onToggle(step.stepId, checked);
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <span className="font-semibold text-foreground">{summary}</span>
        <CurriculumStepProvenance summary={provenanceSummary} />
        {provenanceSummary.provenance === "unfinished" && stepState !== undefined ? (
          <StepActiveTrainingBadge stepState={stepState} />
        ) : null}
      </div>
      <CollapsibleTrigger
        aria-label={`Toggle details for ${summary}`}
        render={<Button className="group/step-trigger shrink-0" size="icon-sm" variant="ghost" />}
      >
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform group-aria-expanded/step-trigger:rotate-180"
        />
      </CollapsibleTrigger>
    </div>
  );
}

export { StepCardHeader };
