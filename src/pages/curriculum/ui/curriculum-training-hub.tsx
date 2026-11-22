/* oxlint-disable eslint/max-lines, import/max-dependencies */
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Play, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadcn/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/shadcn/collapsible";
import { Progress } from "@/shared/ui/shadcn/progress";
import { Separator } from "@/shared/ui/shadcn/separator";

import { curriculumSyllabusQueryOptions } from "../api/curriculum-query-options";
import { trainingOverviewQueryOptions } from "../api/recommendation-query-options";
import {
  buildTrainingHubData,
  type LevelStatus,
  type StepStatus,
  type TheoryRouteParams,
  type TrainingHubBehavior,
  type TrainingHubData,
  type TrainingHubLevel,
  type TrainingHubRecommendation,
  type TrainingHubStep,
} from "../model/training-hub-state";
import { useHydratedNow } from "./use-hydrated-now";

const LEVEL_STATUS_META: Record<
  LevelStatus,
  { label: string; variant: "default" | "outline" | "secondary" }
> = {
  completed: { label: "Completed", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  upcoming: { label: "Upcoming", variant: "outline" },
};

const STEP_STATUS_META: Record<
  StepStatus,
  { label: string; variant: "default" | "outline" | "secondary" }
> = {
  completed: { label: "Completed", variant: "outline" },
  next: { label: "Next", variant: "default" },
  ready: { label: "Ready", variant: "secondary" },
};

interface CurriculumTrainingHubPageProps {
  levelId?: string | undefined;
}

function TrainingHubTopBar({ dogName }: { dogName: string }) {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Training</h1>
          <Badge variant="secondary">{dogName}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a level in the sidebar to view and launch its behaviors
        </p>
      </header>
      <Separator />
    </div>
  );
}

function UpNextHeaderMeta({ recommended }: { recommended: TrainingHubRecommendation }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          <Sparkles aria-hidden="true" className="size-3" />
          <span>Up Next</span>
        </Badge>
        <Badge variant="secondary">{recommended.modeBadgeLabel}</Badge>
        <span className="text-xs font-medium text-muted-foreground">
          {recommended.levelTitle} · {recommended.behaviorName}
        </span>
      </div>
    </div>
  );
}

function UpNextActions({ recommended }: { recommended: TrainingHubRecommendation }) {
  return (
    <CardContent className="flex flex-wrap items-center gap-2">
      <Button
        nativeButton={false}
        render={
          <Link search={{ mode: recommended.mode, stepId: recommended.stepId }} to="/training">
            <span>{recommended.ctaLabel}</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
        size="sm"
        variant="default"
      />
      <Button
        nativeButton={false}
        render={
          <Link params={recommended.theoryParams} to="/levels/$section/$page">
            <BookOpen aria-hidden="true" className="size-4" />
            <span>Read Theory</span>
          </Link>
        }
        size="sm"
        variant="outline"
      />
    </CardContent>
  );
}

function UpNextCard({ recommended }: { recommended: TrainingHubRecommendation }) {
  return (
    <section aria-label="Up Next">
      <Card className="border-primary/40 bg-card shadow-sm">
        <CardHeader>
          <UpNextHeaderMeta recommended={recommended} />
          <CardTitle className="text-lg">{recommended.stepLabel}</CardTitle>
          <CardDescription>{recommended.reason}</CardDescription>
        </CardHeader>
        <UpNextActions recommended={recommended} />
      </Card>
    </section>
  );
}

function LevelStatusBadge({ status }: { status: LevelStatus }) {
  const meta = LEVEL_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function StepStatusBadge({ status }: { status: StepStatus }) {
  const meta = STEP_STATUS_META[status];
  return (
    <Badge variant={meta.variant}>
      {status === "completed" ? <CheckCircle2 aria-hidden="true" className="size-3" /> : null}
      {status === "next" ? <Sparkles aria-hidden="true" className="size-3" /> : null}
      <span>{meta.label}</span>
    </Badge>
  );
}

function TheoryLink({ params }: { params: TheoryRouteParams }) {
  return (
    <Button
      nativeButton={false}
      render={
        <Link params={params} to="/levels/$section/$page">
          <BookOpen aria-hidden="true" className="size-3.5" />
          <span>Theory</span>
        </Link>
      }
      size="xs"
      variant="ghost"
    />
  );
}

function BehaviorCardStepItem({ step }: { step: TrainingHubStep }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{step.label}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <StepStatusBadge status={step.status} />
        <Button
          nativeButton={false}
          render={
            <Link search={step.launchSearch} to="/training">
              <Play aria-hidden="true" className="size-3" />
              <span>{step.status === "completed" ? "Practice" : "Train"}</span>
            </Link>
          }
          size="xs"
          variant={step.status === "next" ? "default" : "outline"}
        />
      </div>
    </li>
  );
}

function BehaviorCardStepsCollapsible({
  behavior,
  showSteps,
  onOpenChange,
}: {
  behavior: TrainingHubBehavior;
  onOpenChange: (open: boolean) => void;
  showSteps: boolean;
}) {
  return (
    <Collapsible open={showSteps} onOpenChange={onOpenChange}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          nativeButton={false}
          render={
            <Link search={{ mode: "practice", stepId: behavior.actionStepId }} to="/training">
              <Play aria-hidden="true" className="size-3.5" />
              <span>{behavior.ctaLabel}</span>
            </Link>
          }
          size="sm"
          variant={behavior.ctaVariant}
        />
        <CollapsibleTrigger
          render={
            <Button size="xs" type="button" variant="ghost">
              <span>Steps</span>
              <ChevronDown
                aria-hidden="true"
                className={cn("size-3.5 transition-transform", showSteps && "rotate-180")}
              />
            </Button>
          }
        />
      </div>

      <CollapsibleContent className="mt-3 space-y-2">
        <Separator />
        <ul className="divide-y divide-border">
          {behavior.steps.map((step) => (
            <BehaviorCardStepItem key={step.stepId} step={step} />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function BehaviorCard({ behavior }: { behavior: TrainingHubBehavior }) {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <section aria-label={behavior.name}>
      <Card className="flex h-full flex-col justify-between">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{behavior.name}</CardTitle>
          <CardDescription className="tabular-nums">
            {behavior.comebeforeNote ?? `${behavior.completedSteps}/${behavior.totalSteps} steps`}
          </CardDescription>
          <CardAction>
            <TheoryLink params={behavior.theoryParams} />
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-3">
          <Progress aria-label={`${behavior.name} progress`} value={behavior.percentage} />
          <BehaviorCardStepsCollapsible
            behavior={behavior}
            showSteps={showSteps}
            onOpenChange={setShowSteps}
          />
        </CardContent>
      </Card>
    </section>
  );
}

function SelectedLevelPane({ level }: { level: TrainingHubLevel }) {
  return (
    <section aria-label={level.title} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{level.title}</h2>
          <LevelStatusBadge status={level.status} />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {level.completedSteps}/{level.totalSteps} steps
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {level.behaviors.map((behavior) => (
          <BehaviorCard behavior={behavior} key={behavior.id} />
        ))}
      </div>
    </section>
  );
}

function TrainingHubView({
  data,
  levelId,
}: {
  data: TrainingHubData;
  levelId?: string | undefined;
}) {
  // oxlint-disable-next-line eslint/capitalized-comments
  /* v8 ignore next 3 -- @preserve */
  if (data.levels.length === 0) {
    return null;
  }

  const activeLevelId = levelId ?? data.activeLevelId;
  const selectedLevel = data.levels.find((level) => level.id === activeLevelId) ?? data.levels[0];

  // oxlint-disable-next-line eslint/capitalized-comments
  /* v8 ignore next 3 -- @preserve */
  if (selectedLevel === undefined) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <TrainingHubTopBar dogName={data.dogName} />
      <UpNextCard recommended={data.recommended} />
      <SelectedLevelPane level={selectedLevel} />
    </div>
  );
}

function CurriculumTrainingHubPage({ levelId }: CurriculumTrainingHubPageProps) {
  const { data: overview } = useSuspenseQuery(trainingOverviewQueryOptions());
  const { data: syllabus } = useSuspenseQuery(curriculumSyllabusQueryOptions());
  const now = useHydratedNow();
  const data = buildTrainingHubData({ now, overview, syllabus });

  return <TrainingHubView data={data} levelId={levelId} />;
}

export { CurriculumTrainingHubPage, type CurriculumTrainingHubPageProps };
