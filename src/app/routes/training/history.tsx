import { createFileRoute } from "@tanstack/react-router";

import { type PrototypeVariant, TrainingHistoryPage } from "@/pages/training-history";
import { PrototypeSwitcher, type PrototypeVariantOption } from "@/shared/ui/prototype-switcher";

const PROTOTYPE_VARIANTS: readonly PrototypeVariantOption[] = [
  { id: "A", label: "Chronological Feed" },
  { id: "B", label: "Structured Table" },
  { id: "C", label: "Behavior Ledger" },
];

function parseVariant(value: unknown): PrototypeVariant {
  if (value === "A" || value === "B" || value === "C") {
    return value;
  }
  return "B";
}

export const Route = createFileRoute("/training/history")({
  validateSearch: (search: Record<string, unknown>): { variant: PrototypeVariant } => ({
    variant: parseVariant(search["variant"]),
  }),
  component: TrainingHistoryRoute,
});

function TrainingHistoryRoute() {
  const { variant } = Route.useSearch();
  const navigate = Route.useNavigate();

  function handleVariantChange(nextVariant: PrototypeVariant) {
    void navigate({
      search: (prev) => ({ ...prev, variant: nextVariant }),
      replace: true,
    });
  }

  return (
    <>
      <TrainingHistoryPage variant={variant} />
      <PrototypeSwitcher
        onVariantChange={handleVariantChange}
        variant={variant}
        variants={PROTOTYPE_VARIANTS}
      />
    </>
  );
}
