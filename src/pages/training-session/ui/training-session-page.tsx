import type { PrototypeVariant } from "../model/types";
import { useTrainingSession } from "../model/use-training-session";
import { VariantMinimalActionCard } from "./variant-focused-runner";
import { VariantGuidedProgressCard } from "./variant-split-studio";
import { VariantTapFirstMobileCard } from "./variant-step-strip";

interface TrainingSessionPageProps {
  variant: PrototypeVariant;
}

export function TrainingSessionPage({ variant }: TrainingSessionPageProps) {
  const session = useTrainingSession();

  switch (variant) {
    case "B":
      return <VariantGuidedProgressCard session={session} />;
    case "C":
      return <VariantTapFirstMobileCard session={session} />;
    case "A":
    default:
      return <VariantMinimalActionCard session={session} />;
  }
}
