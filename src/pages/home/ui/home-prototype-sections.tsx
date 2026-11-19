import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, CircleDot, Clock, Play } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { buttonVariants } from "@/shared/ui/shadcn/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";
import { Progress } from "@/shared/ui/shadcn/progress";

import { STUB_HOME_DATA } from "./home-prototype-stub-data";

function BrowseLevelsLink({ className }: { className?: string }) {
  return (
    <Link className={buttonVariants({ className, variant: "outline" })} to="/levels">
      Browse all levels →
    </Link>
  );
}

function LastPracticedMeta() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="size-3.5" />
      <span>{STUB_HOME_DATA.nextSession.lastPracticedLabel}</span>
    </div>
  );
}

function UpNextSessionCard({
  children,
  className = "lg:col-span-5",
  meta,
  showLevelBadge = true,
  title = STUB_HOME_DATA.nextSession.stepTitle,
}: {
  children?: ReactNode;
  className?: string;
  meta?: ReactNode;
  showLevelBadge?: boolean;
  title?: string;
}) {
  return (
    <Card className={`w-full shadow-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>{meta}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{STUB_HOME_DATA.config.activeDog}</Badge>
            {showLevelBadge ? (
              <Badge variant="secondary">{STUB_HOME_DATA.nextSession.level}</Badge>
            ) : null}
          </div>
        </div>
        <CardTitle className="pt-1 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children ?? (
          <p className="text-sm text-muted-foreground">
            {STUB_HOME_DATA.nextSession.progressSummary}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Link
          className={buttonVariants({ className: "w-full", size: "lg", variant: "default" })}
          to="/training"
        >
          <Play className="size-4" />
          <span>Start Next Session</span>
        </Link>
      </CardFooter>
    </Card>
  );
}

function StayStepsSessionBody() {
  const { steps } = STUB_HOME_DATA.nextSession;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1.5 text-sm">
        {steps.map((step) => {
          if (step.status === "completed") {
            return (
              <li
                className="flex items-center gap-2.5 px-2 py-1 text-muted-foreground"
                key={step.id}
              >
                <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
                <span className="line-through">{step.label}</span>
              </li>
            );
          }

          if (step.status === "current") {
            return (
              <li
                className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 font-medium text-foreground"
                key={step.id}
              >
                <span className="flex items-center gap-2.5">
                  <CircleDot className="size-4 shrink-0 text-primary" />
                  <span>{step.label}</span>
                </span>
                <span className="text-xs font-medium text-primary">Next</span>
              </li>
            );
          }

          return (
            <li className="flex items-center gap-2.5 px-2 py-1 text-muted-foreground" key={step.id}>
              <Circle className="size-4 shrink-0 text-muted-foreground/60" />
              <span>{step.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StayProgressSummary() {
  const { steps } = STUB_HOME_DATA.nextSession;
  const activeStepIndex = steps.findIndex((step) => step.status === "current");
  const currentCount = activeStepIndex >= 0 ? activeStepIndex + 1 : steps.length;
  const percentage = Math.round((currentCount / steps.length) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Current focus</span>
        <span className="tabular-nums">
          {currentCount} / {steps.length} steps
        </span>
      </div>
      <Progress
        aria-label={`Stay progress: ${currentCount} of ${steps.length} steps`}
        value={percentage}
      />
    </div>
  );
}

function NextStepSpotlight() {
  const { steps } = STUB_HOME_DATA.nextSession;
  const currentStep = steps.find((step) => step.status === "current") ?? steps[0];

  if (!currentStep) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3.5">
      <CircleDot className="mt-0.5 size-4.5 shrink-0 text-primary" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium tracking-wide text-primary uppercase">Next step</span>
        <span className="text-sm font-semibold text-foreground">{currentStep.label}</span>
      </div>
    </div>
  );
}

function CondensedStayStepsList() {
  const otherSteps = STUB_HOME_DATA.nextSession.steps.filter((step) => step.status !== "current");

  return (
    <ul className="grid grid-cols-1 gap-x-3 gap-y-1.5 text-xs sm:grid-cols-2">
      {otherSteps.map((step) => {
        if (step.status === "completed") {
          return (
            <li className="flex items-center gap-1.5 text-muted-foreground" key={step.id}>
              <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate line-through">{step.label}</span>
            </li>
          );
        }

        return (
          <li className="flex items-center gap-1.5 text-muted-foreground" key={step.id}>
            <Circle className="size-3.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate">{step.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function SplitHeroShell({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <section className="flex flex-1 items-center py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col items-start gap-5 lg:col-span-7">{left}</div>
        {right}
      </div>
    </section>
  );
}

export {
  BrowseLevelsLink,
  CondensedStayStepsList,
  LastPracticedMeta,
  NextStepSpotlight,
  SplitHeroShell,
  StayProgressSummary,
  StayStepsSessionBody,
  UpNextSessionCard,
};
