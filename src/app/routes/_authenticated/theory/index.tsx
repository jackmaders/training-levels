import { createFileRoute } from "@tanstack/react-router";

import { TheoryHubPage, type TheoryVariant } from "@/pages/theory-hub";
import { PrototypeSwitcher, type PrototypeVariantOption } from "@/shared/ui/prototype-switcher";

interface TheorySearch {
  variant?: TheoryVariant;
}

const THEORY_VARIANTS: readonly PrototypeVariantOption[] = [
  { id: "A", label: "Overview" },
  { id: "B", label: "Section Tabs" },
  { id: "C", label: "Directory" },
];

function parseVariant(variant: unknown): TheoryVariant {
  if (variant === "B" || variant === "C") {
    return variant;
  }
  return "A";
}

const Route = createFileRoute("/_authenticated/theory/")({
  validateSearch: (search: Record<string, unknown>): TheorySearch => ({
    variant: parseVariant(search["variant"]),
  }),
  component: TheoryIndexRoute,
});

function TheoryIndexRoute() {
  const { variant = "A" } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <TheoryHubPage variant={variant} />
      <PrototypeSwitcher
        variant={variant}
        variants={THEORY_VARIANTS}
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
