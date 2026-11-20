import { createFileRoute } from "@tanstack/react-router";

import { ProfileHubPage, type ProfileVariant } from "@/pages/profile-hub";
import { PrototypeSwitcher, type PrototypeVariantOption } from "@/shared/ui/prototype-switcher";

interface ProfileSearch {
  variant?: ProfileVariant;
}

const PROFILE_VARIANTS: readonly PrototypeVariantOption[] = [
  { id: "A", label: "Stacked" },
  { id: "B", label: "Tabs" },
  { id: "C", label: "Split Roster" },
];

function parseVariant(variant: unknown): ProfileVariant {
  if (variant === "B" || variant === "C") {
    return variant;
  }
  return "A";
}

const Route = createFileRoute("/_authenticated/profile/")({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
    variant: parseVariant(search["variant"]),
  }),
  component: ProfileIndexRoute,
});

function ProfileIndexRoute() {
  const { variant = "A" } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <ProfileHubPage variant={variant} />
      <PrototypeSwitcher
        variant={variant}
        variants={PROFILE_VARIANTS}
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
