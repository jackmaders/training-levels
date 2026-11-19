import { cn } from "cn";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/shadcn/accordion";

import type { TrainingStep } from "../model/types";

interface StepInfoAccordionProps {
  step: TrainingStep;
  mode: "single" | "multi";
  triggerLabel?: string;
  compact?: boolean;
}

function StepDetailSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold tracking-wide text-foreground">{label}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function StepMetaFooter({ step }: { step: TrainingStep }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
      <span>Ladder: {step.targets.join(" → ")}</span>
      <span>
        Lifetime: {step.practice_totals.success} success · {step.practice_totals.notYet} not yet
      </span>
    </div>
  );
}

function StepInstructionsBody({ step }: { step: TrainingStep }) {
  return (
    <div className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
      <p>{step.instructions}</p>
      <StepMetaFooter step={step} />
    </div>
  );
}

function MultiStepItems({ step }: { step: TrainingStep }) {
  return (
    <Accordion defaultValue={[]} multiple>
      <AccordionItem value="instructions">
        <AccordionTrigger className="py-2 text-xs">Step Instructions</AccordionTrigger>
        <AccordionContent>
          <StepInstructionsBody step={step} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="try-it-cold">
        <AccordionTrigger className="py-2 text-xs">Try It Cold criteria</AccordionTrigger>
        <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
          {step.tryItColdCriteria}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="notes">
        <AccordionTrigger className="py-2 text-xs">Notes &amp; what&apos;s next</AccordionTrigger>
        <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
          {step.notes}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function SingleStepInfoAccordion({
  step,
  triggerLabel,
  compact = false,
}: {
  step: TrainingStep;
  triggerLabel: string | undefined;
  compact: boolean | undefined;
}) {
  return (
    <Accordion
      className={cn("rounded-lg border bg-muted/20 px-3", compact ? "py-0.5" : "py-1")}
      defaultValue={[]}
    >
      <AccordionItem value="step-info">
        <AccordionTrigger className={cn("text-xs", compact ? "py-2" : "py-2.5")}>
          {triggerLabel ?? `More info on Step ${step.stepNumber}`}
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <StepDetailSection label="Step Instructions" text={step.instructions} />
          <StepDetailSection label="Try It Cold" text={step.tryItColdCriteria} />
          <StepDetailSection label="Notes & What's Next" text={step.notes} />
          <StepMetaFooter step={step} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function StepInfoAccordion({
  step,
  mode,
  triggerLabel,
  compact = false,
}: StepInfoAccordionProps) {
  if (mode === "multi") {
    return (
      <div className="rounded-lg border bg-muted/20 px-3 py-1">
        <p className="pt-2 text-xs font-semibold text-muted-foreground">
          Step {step.stepNumber} details
        </p>
        <MultiStepItems step={step} />
      </div>
    );
  }

  return <SingleStepInfoAccordion compact={compact} step={step} triggerLabel={triggerLabel} />;
}
