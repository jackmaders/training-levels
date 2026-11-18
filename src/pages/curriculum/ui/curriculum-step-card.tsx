import { cn } from "cn";
import type { ComponentProps } from "react";

import type { BehaviorStep } from "@/shared/curriculum-data";
import { Card } from "@/shared/ui/shadcn/card";
import { Collapsible } from "@/shared/ui/shadcn/collapsible";

import type { SaveComeafterInput } from "../api/generalization-schema";
import type { ComeafterRecordState } from "../api/generalization-service";
import type { StepProvenanceSummary } from "../model/step-provenance";
import { StepCardBody } from "./curriculum-step-card-body";
import { StepCardHeader } from "./curriculum-step-card-header";

interface CurriculumStepCardProps extends Omit<ComponentProps<typeof Card>, "id" | "onToggle"> {
  comeafterRecord: ComeafterRecordState | null;
  isCompleted: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveComeafter: (input: SaveComeafterInput) => Promise<unknown>;
  onToggle: (stepId: string, completed: boolean) => void;
  open: boolean;
  provenanceSummary: StepProvenanceSummary;
  step: BehaviorStep;
}

function CurriculumStepCard({
  className,
  comeafterRecord,
  isCompleted,
  onOpenChange,
  onSaveComeafter,
  onToggle,
  open,
  provenanceSummary,
  step,
  ...props
}: CurriculumStepCardProps) {
  return (
    <Card
      className={cn("scroll-mt-20 gap-0 py-0", className)}
      id={step.anchor}
      size="sm"
      {...props}
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <StepCardHeader
          isCompleted={isCompleted}
          provenanceSummary={provenanceSummary}
          step={step}
          onToggle={onToggle}
        />
        <StepCardBody
          comeafterRecord={comeafterRecord}
          step={step}
          onSaveComeafter={onSaveComeafter}
        />
      </Collapsible>
    </Card>
  );
}

export { CurriculumStepCard };
