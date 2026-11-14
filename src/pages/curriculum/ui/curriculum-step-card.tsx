import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import type { BehaviorStep, ContentBlock } from "@/shared/curriculum-data";
import { Button } from "@/shared/ui/shadcn/button";
import { Card } from "@/shared/ui/shadcn/card";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/shadcn/collapsible";

import { formatStepSummary } from "../model/curriculum-levels";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";

interface CurriculumStepCardProps extends Omit<ComponentProps<typeof Card>, "id" | "onToggle"> {
  isCompleted: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (stepId: string, completed: boolean) => void;
  open: boolean;
  step: BehaviorStep;
}

function CurriculumStepCard({
  className,
  isCompleted,
  onOpenChange,
  onToggle,
  open,
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
        <StepCardHeader isCompleted={isCompleted} onToggle={onToggle} step={step} />
        <StepCardBody step={step} />
      </Collapsible>
    </Card>
  );
}

function StepCardHeader({
  isCompleted,
  onToggle,
  step,
}: Pick<CurriculumStepCardProps, "isCompleted" | "onToggle" | "step">) {
  const summary = formatStepSummary(step.heading);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Checkbox
        aria-label={`Toggle ${step.heading}`}
        checked={isCompleted}
        onCheckedChange={(checked) => {
          onToggle(step.stepId, checked);
        }}
      />
      <span className="flex-1 font-semibold text-foreground">{summary}</span>
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

function StepCardBody({ step }: { step: BehaviorStep }) {
  const { comeafters, instructions, tryItCold } = step;

  return (
    <CollapsibleContent className="space-y-4 border-t bg-muted/40 p-4">
      <CurriculumContentBlocks blocks={instructions} />
      {tryItCold !== null && tryItCold.length > 0 ? (
        <CurriculumContentBlocks blocks={tryItCold} />
      ) : null}
      {comeafters !== null && comeafters.length > 0 ? <StepComeafters blocks={comeafters} /> : null}
    </CollapsibleContent>
  );
}

function StepComeafters({ blocks }: { blocks: readonly ContentBlock[] }) {
  return (
    <div className="space-y-2 border-t border-border/60 pt-3">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Comeafters
      </p>
      <CurriculumContentBlocks blocks={blocks} />
    </div>
  );
}

export { CurriculumStepCard };
