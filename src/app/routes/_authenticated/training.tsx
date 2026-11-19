import { createFileRoute } from "@tanstack/react-router";

import { TrainingHubPage, type TrainingVariant } from "@/pages/training-hub";
import { PrototypeSwitcher, type PrototypeVariantOption } from "@/shared/ui/prototype-switcher";

interface TrainingSearch {
  level?: string;
  variant?: TrainingVariant;
}

const TRAINING_VARIANTS: readonly PrototypeVariantOption[] = [
  { id: "A", label: "Accordion Hub" },
  { id: "B", label: "Level Tabs" },
  { id: "C", label: "Focused Queue" },
];

function parseLevel(level: unknown): string | undefined {
  if (typeof level === "string" && level.length > 0) {
    return level;
  }
  return undefined;
}

function parseVariant(variant: unknown): TrainingVariant {
  if (variant === "B" || variant === "C") {
    return variant;
  }
  return "A";
}

const Route = createFileRoute("/_authenticated/training")({
  validateSearch: (search: Record<string, unknown>): TrainingSearch => ({
    level: parseLevel(search["level"]),
    variant: parseVariant(search["variant"]),
  }),
  component: TrainingRoute,
});

function TrainingRoute() {
  const { level, variant = "A" } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <TrainingHubPage levelId={level} variant={variant} />
      <PrototypeSwitcher
        variant={variant}
        variants={TRAINING_VARIANTS}
        onVariantChange={(nextVariant) => {
          void navigate({
            replace: true,
            search: (prev) => ({ ...prev, variant: nextVariant }),
          });
        }}
      />
    </>
  );
}

export { Route };
