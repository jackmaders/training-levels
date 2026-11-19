import { cn } from "cn";
import { ChevronDown, Lock, Play } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

import { countLevelProgress } from "../model/stub-data";
import type { TrainingBehavior, TrainingHubData, TrainingLevel } from "../model/types";
import {
  getBehaviorSummary,
  LevelStatusBadge,
  StepStatusBadge,
  TheoryLink,
  TrainingHubTopBar,
  TrainStepAction,
  UpNextCard,
} from "./training-hub-shared";

function BehaviorCardPrimaryAction({
  isCompleted,
  isLocked,
  targetStep,
}: {
  isCompleted: boolean;
  isLocked: boolean;
  targetStep: TrainingBehavior["steps"][number] | undefined;
}) {
  if (isLocked || targetStep === undefined) {
    return (
      <Button disabled size="sm" type="button" variant="outline">
        <Lock aria-hidden="true" className="size-3.5" />
        <span>Locked</span>
      </Button>
    );
  }

  return (
    <Button
      nativeButton={false}
      render={
        <a href={targetStep.sessionHref}>
          <Play aria-hidden="true" className="size-3.5" />
          <span>{isCompleted ? "Practice" : "Train"}</span>
        </a>
      }
      size="sm"
      variant={targetStep.status === "next" ? "default" : "outline"}
    />
  );
}

function BehaviorCardStepItem({ step }: { step: TrainingBehavior["steps"][number] }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{step.label}</p>
        <p className="text-xs text-muted-foreground">{step.target}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <StepStatusBadge step={step} />
        <TrainStepAction step={step} />
      </div>
    </li>
  );
}

function BehaviorGridCard({ behavior }: { behavior: TrainingBehavior }) {
  const [showSteps, setShowSteps] = useState(false);
  const summary = getBehaviorSummary(behavior);
  const targetStep = summary.actionStep ?? behavior.steps[0];

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{behavior.name}</CardTitle>
        <CardDescription className="tabular-nums">
          {summary.lockNote ?? `${summary.completed}/${summary.total} steps`}
        </CardDescription>
        <CardAction>
          <TheoryLink href={behavior.theoryHref} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        <Progress aria-label={`${behavior.name} progress`} value={summary.percentage} />

        <Collapsible open={showSteps} onOpenChange={setShowSteps}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <BehaviorCardPrimaryAction
              isCompleted={summary.isCompleted}
              isLocked={summary.isLocked}
              targetStep={targetStep}
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
                <BehaviorCardStepItem key={step.id} step={step} />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function LevelTabPanel({ level }: { level: TrainingLevel }) {
  const progress = countLevelProgress(level);

  return (
    <TabsContent className="space-y-4 pt-3" value={level.id}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{level.title}</h2>
            <LevelStatusBadge status={level.status} />
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {progress.completed}/{progress.total} steps ({progress.percentage}%)
          </span>
        </div>
        <Progress aria-label={`${level.title} progress`} value={progress.percentage} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {level.behaviors.map((behavior) => (
          <BehaviorGridCard behavior={behavior} key={behavior.id} />
        ))}
      </div>
    </TabsContent>
  );
}

/** Variant B: Shadcn Tabs + Concise Behavior Cards. */
function VariantLevelTabs({ data }: { data: TrainingHubData }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <TrainingHubTopBar
        dogName={data.dogName}
        historyHref={data.historyHref}
        subtitle="Switch between Levels 1–4 and jump straight into any behavior"
      />
      <UpNextCard recommended={data.recommended} />
      <Tabs defaultValue={data.activeLevelId}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          {data.levels.map((level) => {
            const progress = countLevelProgress(level);
            return (
              <TabsTrigger className="px-3 py-1.5" key={level.id} value={level.id}>
                <span>Level {level.levelNumber}</span>
                <Badge className="ml-1 tabular-nums" variant="secondary">
                  {progress.completed}/{progress.total}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {data.levels.map((level) => (
          <LevelTabPanel key={level.id} level={level} />
        ))}
      </Tabs>
    </div>
  );
}

export { VariantLevelTabs };
