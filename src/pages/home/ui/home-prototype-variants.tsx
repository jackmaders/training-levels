// THROWAWAY PROTOTYPE: Three variants of the homepage hero, switchable via ?variant=, on the existing / route.
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { buttonVariants } from "@/shared/ui/shadcn/button";

import {
  BrowseLevelsLink,
  CondensedStayStepsList,
  LastPracticedMeta,
  NextStepSpotlight,
  SplitHeroShell,
  StayProgressSummary,
  StayStepsSessionBody,
  UpNextSessionCard,
} from "./home-prototype-sections";
import { STUB_HOME_DATA, type HomePrototypeVariantKey } from "./home-prototype-stub-data";

function HomeVariantA() {
  return (
    <SplitHeroShell
      left={
        <>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Keep sessions short, consistent, and clear
            </h1>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              Pick up right where you left off with a guided 12-minute practice set.
            </p>
          </div>
          <Link className={buttonVariants({ variant: "outline" })} to="/levels">
            Browse all levels →
          </Link>
        </>
      }
      right={
        <UpNextSessionCard
          meta={
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Last practiced 2 days ago</span>
            </div>
          }
          showLevelBadge={false}
          title={STUB_HOME_DATA.nextSession.sessionTitle}
        >
          <StayStepsSessionBody />
        </UpNextSessionCard>
      }
    />
  );
}

function HomeVariantB() {
  return (
    <SplitHeroShell
      left={
        <>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Keep sessions short, consistent, and clear
            </h1>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              Pick up right where you left off with a guided 12-minute practice set.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BrowseLevelsLink />
            <Link className={buttonVariants({ variant: "ghost" })} to="/dependencies">
              View dependencies →
            </Link>
          </div>
        </>
      }
      right={
        <UpNextSessionCard
          meta={<LastPracticedMeta />}
          showLevelBadge={false}
          title={STUB_HOME_DATA.nextSession.sessionTitle}
        >
          <div className="flex flex-col gap-4">
            <StayProgressSummary />
            <StayStepsSessionBody />
          </div>
        </UpNextSessionCard>
      }
    />
  );
}

function HomeVariantC() {
  return (
    <SplitHeroShell
      left={
        <>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Keep sessions short, consistent, and clear
            </h1>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              Pick up right where you left off with a guided 12-minute practice set.
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              {STUB_HOME_DATA.nextSession.progressSummary}
            </p>
          </div>
          <BrowseLevelsLink />
        </>
      }
      right={
        <UpNextSessionCard
          meta={<LastPracticedMeta />}
          showLevelBadge={false}
          title={STUB_HOME_DATA.nextSession.sessionTitle}
        >
          <div className="flex flex-col gap-4">
            <NextStepSpotlight />
            <CondensedStayStepsList />
          </div>
        </UpNextSessionCard>
      }
    />
  );
}

function HomePrototypeView({ variant }: { variant: HomePrototypeVariantKey }) {
  if (variant === "B") {
    return <HomeVariantB />;
  }
  if (variant === "C") {
    return <HomeVariantC />;
  }
  return <HomeVariantA />;
}

export { HOME_PROTOTYPE_VARIANTS, type HomePrototypeVariantKey } from "./home-prototype-stub-data";
export { HomePrototypeView, HomeVariantA, HomeVariantB, HomeVariantC };
