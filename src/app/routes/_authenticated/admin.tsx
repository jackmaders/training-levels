import { createFileRoute } from "@tanstack/react-router";

import { AdminHubPage, type AdminVariant } from "@/pages/admin-hub";
import { PrototypeSwitcher, type PrototypeVariantOption } from "@/shared/ui/prototype-switcher";

interface AdminSearch {
  variant?: AdminVariant;
}

const ADMIN_VARIANTS: readonly PrototypeVariantOption[] = [
  { id: "A", label: "Tabs & Dialog" },
  { id: "B", label: "Split Inspector" },
  { id: "C", label: "Directory" },
];

function parseVariant(variant: unknown): AdminVariant {
  if (variant === "A" || variant === "C") {
    return variant;
  }
  return "B";
}

const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    variant: parseVariant(search["variant"]),
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const { variant = "B" } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <AdminHubPage variant={variant} />
      <PrototypeSwitcher
        variant={variant}
        variants={ADMIN_VARIANTS}
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
