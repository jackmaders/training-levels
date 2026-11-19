import { cn } from "cn";
import { ArrowRight, BookOpen, CheckCircle2, History, Lock, Play, Sparkles } from "lucide-react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";
import { Separator } from "@/shared/ui/shadcn/separator";

import { countBehaviorProgress, formatStepStatusLabel } from "../model/stub-data";
import type {
  LevelStatus,
  RecommendedStep,
  StepStatus,
  TrainingBehavior,
  TrainingStep,
} from "../model/types";

const LEVEL_STATUS_META: Record<
  LevelStatus,
  { label: string; variant: "default" | "outline" | "secondary" }
> = {
  completed: { label: "Completed", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  upcoming: { label: "Upcoming", variant: "outline" },
};

const STEP_STATUS_VARIANT: Record<StepStatus, "default" | "outline" | "secondary"> = {
  completed: "outline",
  locked: "outline",
  next: "default",
  ready: "secondary",
};

function TopBarHeading({ dogName, subtitle }: { dogName: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Training</h1>
        <Badge variant="secondary">{dogName}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function TrainingHubTopBar({
  dogName,
  historyHref,
  subtitle,
}: {
  dogName: string;
  historyHref: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <TopBarHeading dogName={dogName} subtitle={subtitle} />
        <Button
          nativeButton={false}
          render={
            <a href={historyHref}>
              <History aria-hidden="true" className="size-4" />
              <span>Training History</span>
            </a>
          }
          size="sm"
          variant="outline"
        />
      </header>
      <Separator />
    </div>
  );
}

function LevelStatusBadge({ status }: { status: LevelStatus }) {
  const meta = LEVEL_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function StepStatusBadge({ step }: { step: TrainingStep }) {
  const label = formatStepStatusLabel(step);
  return (
    <Badge
      className={cn(step.status === "locked" && "text-muted-foreground")}
      variant={STEP_STATUS_VARIANT[step.status]}
    >
      {step.status === "completed" ? <CheckCircle2 aria-hidden="true" className="size-3" /> : null}
      {step.status === "next" ? <Sparkles aria-hidden="true" className="size-3" /> : null}
      {step.status === "locked" ? <Lock aria-hidden="true" className="size-3" /> : null}
      <span>{label}</span>
    </Badge>
  );
}

function TheoryLink({ href, label = "Theory" }: { href: string; label?: string }) {
  return (
    <Button
      nativeButton={false}
      render={
        <a href={href}>
          <BookOpen aria-hidden="true" className="size-3.5" />
          <span>{label}</span>
        </a>
      }
      size="xs"
      variant="ghost"
    />
  );
}

function TrainStepAction({ step }: { step: TrainingStep }) {
  if (step.status === "locked") {
    return (
      <Button disabled size="xs" type="button" variant="outline">
        <Lock aria-hidden="true" className="size-3" />
        <span>Locked</span>
      </Button>
    );
  }

  return (
    <Button
      nativeButton={false}
      render={
        <a href={step.sessionHref}>
          <Play aria-hidden="true" className="size-3" />
          <span>{step.status === "completed" ? "Practice" : "Train"}</span>
        </a>
      }
      size="xs"
      variant={step.status === "next" ? "default" : "outline"}
    />
  );
}

function StepRowDetails({
  behaviorName,
  showCue,
  step,
}: {
  behaviorName?: string | undefined;
  showCue: boolean;
  step: TrainingStep;
}) {
  return (
    <div className="min-w-0 flex-1 space-y-0.5">
      <div className="flex flex-wrap items-center gap-2">
        {behaviorName === undefined ? null : (
          <span className="text-xs font-medium text-muted-foreground">{behaviorName}</span>
        )}
        <span className="text-sm font-medium">{step.label}</span>
        <span className="text-xs text-muted-foreground">{step.target}</span>
      </div>
      {showCue ? <p className="text-xs text-muted-foreground">{step.cue}</p> : null}
    </div>
  );
}

function StepRow({
  behaviorName,
  showCue = false,
  step,
  theoryHref,
}: {
  behaviorName?: string;
  showCue?: boolean;
  step: TrainingStep;
  theoryHref?: string;
}) {
  const isLocked = step.status === "locked";

  return (
    <Card className={cn(isLocked && "bg-muted/40 text-muted-foreground")} size="sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <StepRowDetails behaviorName={behaviorName} showCue={showCue} step={step} />
        <div className="flex flex-wrap items-center gap-2">
          <StepStatusBadge step={step} />
          {theoryHref === undefined ? null : <TheoryLink href={theoryHref} />}
          <TrainStepAction step={step} />
        </div>
      </CardContent>
    </Card>
  );
}

interface BehaviorSummary {
  actionStep: TrainingStep | undefined;
  completed: number;
  isCompleted: boolean;
  isLocked: boolean;
  lockNote: string | undefined;
  percentage: number;
  total: number;
}

const PERCENTAGE_SCALE = 100;

function getBehaviorSummary(behavior: TrainingBehavior): BehaviorSummary {
  const { completed, total } = countBehaviorProgress(behavior);
  const actionStep =
    behavior.steps.find((step) => step.status === "next") ??
    behavior.steps.find((step) => step.status === "ready");
  const isCompleted = total > 0 && completed === total;
  const lockedStep = behavior.steps.find((step) => step.status === "locked");
  const isLocked = !isCompleted && actionStep === undefined;
  const lockNote =
    isLocked && lockedStep !== undefined
      ? lockedStep.prerequisiteLabel === undefined
        ? "Locked"
        : `Needs ${lockedStep.prerequisiteLabel}`
      : undefined;

  return {
    actionStep,
    completed,
    isCompleted,
    isLocked,
    lockNote,
    percentage: total === 0 ? 0 : Math.round((completed / total) * PERCENTAGE_SCALE),
    total,
  };
}

function UpNextHeaderMeta({ recommended }: { recommended: RecommendedStep }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Badge>
          <Sparkles aria-hidden="true" className="size-3" />
          <span>Up Next</span>
        </Badge>
        <span className="text-xs font-medium text-muted-foreground">
          {recommended.levelTitle} · {recommended.behaviorName}
        </span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{recommended.target}</span>
    </div>
  );
}

function UpNextCard({ recommended }: { recommended: RecommendedStep }) {
  return (
    <Card className="border-primary/40 bg-card shadow-sm">
      <CardHeader>
        <UpNextHeaderMeta recommended={recommended} />
        <CardTitle className="text-lg">{recommended.stepLabel}</CardTitle>
        <CardDescription>{recommended.cue}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Button
          nativeButton={false}
          render={
            <a href={recommended.sessionHref}>
              <span>Start Session</span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          }
          size="sm"
          variant="default"
        />
        <Button
          nativeButton={false}
          render={
            <a href={recommended.theoryHref}>
              <BookOpen aria-hidden="true" className="size-4" />
              <span>Read Theory</span>
            </a>
          }
          size="sm"
          variant="outline"
        />
      </CardContent>
    </Card>
  );
}

export {
  getBehaviorSummary,
  LevelStatusBadge,
  StepRow,
  StepStatusBadge,
  TheoryLink,
  TrainingHubTopBar,
  TrainStepAction,
  UpNextCard,
};
