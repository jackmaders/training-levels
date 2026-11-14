import { ChevronDown } from "lucide-react";

import type { BehaviorStep, ContentBlock } from "@/shared/curriculum-data";
import { Card } from "@/shared/ui/shadcn/card";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/shadcn/collapsible";

import { formatStepSummary } from "../model/curriculum-levels";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";

interface CurriculumStepCardProps {
  defaultOpen: boolean;
  isCompleted: boolean;
  onToggle: (stepId: string, completed: boolean) => void;
  step: BehaviorStep;
}

function CurriculumStepCard({ defaultOpen, isCompleted, onToggle, step }: CurriculumStepCardProps) {
  return (
    <Card className="scroll-mt-20 gap-0 py-0" id={step.anchor} size="sm">
      <Collapsible defaultOpen={defaultOpen}>
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
}: Omit<CurriculumStepCardProps, "defaultOpen">) {
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
      <CollapsibleTrigger className="group/step-trigger flex flex-1 items-center justify-between gap-3 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="font-semibold text-foreground">{summary}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded/step-trigger:rotate-180"
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
