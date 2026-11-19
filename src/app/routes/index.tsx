import { createFileRoute } from "@tanstack/react-router";

import {
  HOME_PROTOTYPE_VARIANTS,
  HomePrototypeView,
  type HomePrototypeVariantKey,
} from "@/pages/home";
import { PrototypeSwitcher } from "@/shared/ui/prototype-switcher";

interface HomeSearch {
  variant?: string | undefined;
}

function parseVariant(variant: unknown): HomePrototypeVariantKey {
  if (variant === "A" || variant === "B" || variant === "C") {
    return variant;
  }
  return "A";
}

function HomePrototypeRoute() {
  const { variant } = Route.useSearch();
  const activeVariant = parseVariant(variant);

  return (
    <>
      <HomePrototypeView variant={activeVariant} />
      <PrototypeSwitcher current={activeVariant} variants={HOME_PROTOTYPE_VARIANTS} />
    </>
  );
}

export const Route = createFileRoute("/")({
  component: HomePrototypeRoute,
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    variant: parseVariant(search["variant"]),
  }),
});
