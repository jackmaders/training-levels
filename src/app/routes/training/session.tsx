import { createFileRoute } from "@tanstack/react-router";

import { type PrototypeVariant, TrainingSessionPage } from "@/pages/training-session";
import { PrototypeSwitcher, type PrototypeVariantOption } from "@/shared/ui/prototype-switcher";

const PROTOTYPE_VARIANTS: readonly PrototypeVariantOption<PrototypeVariant>[] = [
  { id: "A", label: "Focused Runner" },
  { id: "B", label: "Split Studio" },
  { id: "C", label: "Step Strip & Quick-Log" },
];

function parseVariant(value: unknown): PrototypeVariant {
  if (value === "A" || value === "B" || value === "C") {
    return value;
  }
  return "A";
}

export const Route = createFileRoute("/training/session")({
  validateSearch: (search: Record<string, unknown>): { variant: PrototypeVariant } => ({
    variant: parseVariant(search["variant"]),
  }),
  component: TrainingSessionRoute,
});

function TrainingSessionRoute() {
  const { variant } = Route.useSearch();
  const navigate = Route.useNavigate();

  function handleSelectVariant(nextVariant: PrototypeVariant) {
    void navigate({
      search: (prev) => ({ ...prev, variant: nextVariant }),
      replace: true,
    });
  }

  return (
    <>
      <TrainingSessionPage variant={variant} />
      <PrototypeSwitcher
        activeVariant={variant}
        onSelect={handleSelectVariant}
        variants={PROTOTYPE_VARIANTS}
      />
    </>
  );
}
