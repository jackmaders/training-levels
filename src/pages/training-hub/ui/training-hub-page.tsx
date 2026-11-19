import { cn } from "cn";
import type { ComponentProps } from "react";

import { BARNABY_TRAINING_HUB_DATA } from "../model/stub-data";
import type { TrainingVariant } from "../model/types";
import { VariantAccordionHub } from "./variant-accordion-hub";
import { VariantActionQueue } from "./variant-action-queue";
import { VariantLevelTabs } from "./variant-level-tabs";

interface TrainingHubPageProps extends ComponentProps<"div"> {
  levelId?: string | undefined;
  variant?: TrainingVariant;
}

function renderVariant(variant: TrainingVariant, levelId?: string) {
  switch (variant) {
    case "A":
      return <VariantAccordionHub data={BARNABY_TRAINING_HUB_DATA} levelId={levelId} />;
    case "B":
      return <VariantLevelTabs data={BARNABY_TRAINING_HUB_DATA} />;
    case "C":
      return <VariantActionQueue data={BARNABY_TRAINING_HUB_DATA} />;
  }
}

/** Training hub prototype page supporting layout variants A, B, and C. */
function TrainingHubPage({ className, levelId, variant = "A", ...props }: TrainingHubPageProps) {
  return (
    <div className={cn("pb-20", className)} {...props}>
      {renderVariant(variant, levelId)}
    </div>
  );
}

export { TrainingHubPage };
