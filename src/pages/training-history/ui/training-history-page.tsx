import { BARNABY_TRAINING_HISTORY_DATA } from "../model/stub-data";
import type { PrototypeVariant } from "../model/types";
import { VariantBehaviorLedger } from "./variant-behavior-ledger";
import { VariantDataTable } from "./variant-data-table";
import { VariantSessionFeed } from "./variant-session-feed";

interface TrainingHistoryPageProps {
  variant?: PrototypeVariant;
}

export function TrainingHistoryPage({ variant = "A" }: TrainingHistoryPageProps) {
  switch (variant) {
    case "B":
      return <VariantDataTable data={BARNABY_TRAINING_HISTORY_DATA} />;
    case "C":
      return <VariantBehaviorLedger data={BARNABY_TRAINING_HISTORY_DATA} />;
    case "A":
    default:
      return <VariantSessionFeed data={BARNABY_TRAINING_HISTORY_DATA} />;
  }
}
