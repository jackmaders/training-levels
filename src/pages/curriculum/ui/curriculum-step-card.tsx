import { cn } from "cn";
import type { ComponentProps } from "react";

import type { BehaviorStep } from "@/shared/curriculum-data";
import { Card } from "@/shared/ui/shadcn/card";
import { Collapsible } from "@/shared/ui/shadcn/collapsible";

import { StepCardBody } from "./curriculum-step-card-body";
import { StepCardHeader } from "./curriculum-step-card-header";

type HeaderProps = ComponentProps<typeof StepCardHeader>;
type BodyProps = ComponentProps<typeof StepCardBody>;

interface CurriculumStepCardProps extends Omit<ComponentProps<typeof Card>, "id" | "onToggle"> {
  comeafterRecord: BodyProps["comeafterRecord"];
  isCompleted: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveComeafter: BodyProps["onSaveComeafter"];
  onToggle: (stepId: string, completed: boolean) => void;
  open: boolean;
  provenanceSummary: HeaderProps["provenanceSummary"];
  step: BehaviorStep;
  stepState?: HeaderProps["stepState"];
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
  stepState,
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
          stepState={stepState}
          onToggle={onToggle}
        />
        <StepCardBody
          comeafterRecord={comeafterRecord}
          step={step}
          stepState={stepState}
          onSaveComeafter={onSaveComeafter}
        />
      </Collapsible>
    </Card>
  );
}

export { CurriculumStepCard };
