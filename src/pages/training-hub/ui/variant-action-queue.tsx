import { cn } from "cn";
import { CheckCircle2, ChevronDown, Circle, Lock, Play } from "lucide-react";
import { useState } from "react";

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

function SidebarLevelButton({
  isSelected,
  level,
  onSelect,
}: {
  isSelected: boolean;
  level: TrainingLevel;
  onSelect: () => void;
}) {
  const progress = countLevelProgress(level);
  const isCompleted = progress.total > 0 && progress.completed === progress.total;

  return (
    <Button
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "h-auto w-full flex-col items-stretch gap-2 px-3 py-2.5 text-left",
        isSelected ? "font-semibold text-foreground" : "font-normal text-muted-foreground",
      )}
      onClick={onSelect}
      type="button"
      variant={isSelected ? "secondary" : "ghost"}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
          ) : (
            <Circle
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0",
                isSelected ? "text-primary" : "text-muted-foreground",
              )}
            />
          )}
          <span className="truncate">{level.title}</span>
        </span>
        <span className="shrink-0 text-xs tabular-nums">
          {progress.completed}/{progress.total}
        </span>
      </div>
      <Progress
        aria-label={`${level.title} progress`}
        className="h-1"
        value={progress.percentage}
      />
    </Button>
  );
}

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

function SelectedLevelPane({ level }: { level: TrainingLevel }) {
  const progress = countLevelProgress(level);

  return (
    <section aria-label={level.title} className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{level.title}</h2>
            <LevelStatusBadge status={level.status} />
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {progress.completed}/{progress.total} steps completed
          </span>
        </div>
        <Progress aria-label={`${level.title} progress`} value={progress.percentage} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {level.behaviors.map((behavior) => (
          <BehaviorGridCard behavior={behavior} key={behavior.id} />
        ))}
      </div>
    </section>
  );
}

/** Variant C: Level Sidebar + Behavior Grid. */
function VariantActionQueue({ data }: { data: TrainingHubData }) {
  const initialLevel =
    data.levels.find((level) => level.id === data.activeLevelId) ?? data.levels[0];

  const [selectedLevelId, setSelectedLevelId] = useState(initialLevel?.id ?? data.activeLevelId);

  const selectedLevel = data.levels.find((level) => level.id === selectedLevelId) ?? data.levels[0];

  if (selectedLevel === undefined) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <TrainingHubTopBar
        dogName={data.dogName}
        historyHref={data.historyHref}
        subtitle="Select a level in the sidebar to view and launch its behaviors"
      />
      <UpNextCard recommended={data.recommended} />

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside aria-label="Training levels">
          <nav aria-label="Levels" className="space-y-1.5">
            {data.levels.map((level) => (
              <SidebarLevelButton
                isSelected={level.id === selectedLevel.id}
                key={level.id}
                level={level}
                onSelect={() => {
                  setSelectedLevelId(level.id);
                }}
              />
            ))}
          </nav>
        </aside>

        <SelectedLevelPane level={selectedLevel} />
      </div>
    </div>
  );
}

export { VariantActionQueue };
