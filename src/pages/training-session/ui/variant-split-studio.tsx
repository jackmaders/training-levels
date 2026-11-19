import { cn } from "cn";
import { ArrowLeft, Check, Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/shadcn/accordion";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";
import { Separator } from "@/shared/ui/shadcn/separator";

import type { TrainingSessionController } from "../model/use-training-session";

interface VariantGuidedProgressCardProps {
  session: TrainingSessionController;
}

const DEFAULT_TARGET_SECONDS = 10;
const SECONDS_PER_MINUTE = 60;
const TIMER_INTERVAL_MS = 1000;

function parseTargetSeconds(target: string): number {
  const parsed = Number.parseInt(target, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TARGET_SECONDS;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function VariantGuidedProgressCard({ session }: VariantGuidedProgressCardProps) {
  const {
    dogName,
    levelNumber,
    levelName,
    activeStep,
    selectedTarget,
    readiness,
    sessionReps,
    recommendedReps,
    recommendedCompleted,
    extraReps,
    canUndo,
    logOutcome,
    undoAttempt,
  } = session;

  const targetSeconds = parseTargetSeconds(selectedTarget);
  const [secondsLeft, setSecondsLeft] = useState(targetSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsRunning(false);
    setSecondsLeft(targetSeconds);
  }, [targetSeconds]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, TIMER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const handleToggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (secondsLeft === 0) {
      setSecondsLeft(targetSeconds);
    }
    setIsRunning(true);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(targetSeconds);
  };

  const timerStatus =
    secondsLeft === 0
      ? "Done!"
      : isRunning
        ? "Running"
        : secondsLeft < targetSeconds
          ? "Paused"
          : "Ready";

  const currentTargetIndex = Math.max(0, activeStep.targets.indexOf(selectedTarget));
  const nextTarget =
    readiness === "step_complete" ? undefined : activeStep.targets[currentTargetIndex + 1];

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="gap-3 border-b">
        <div className="flex items-center justify-between gap-2">
          <Button nativeButton={false} render={<a href="/training" />} size="sm" variant="ghost">
            <ArrowLeft />
            Exit
          </Button>
          <Badge variant="outline">{dogName}</Badge>
        </div>

        <div className="grid gap-1">
          <CardTitle className="text-xl">
            Step {activeStep.stepNumber}: {activeStep.heading}
          </CardTitle>
          <CardDescription>
            Level {levelNumber}: {levelName}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-foreground">{activeStep.summary}</p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-xs font-semibold text-foreground">
                {recommendedCompleted} / {recommendedReps}
              </span>
              {extraReps > 0 ? (
                <Badge className="tabular-nums" variant="secondary">
                  +{extraReps} extra
                </Badge>
              ) : null}
            </div>
            <Button
              disabled={!canUndo}
              onClick={undoAttempt}
              size="sm"
              type="button"
              variant="ghost"
            >
              <RotateCcw />
              Undo
            </Button>
          </div>
          <div className="grid h-2 w-full grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }).map((_, index) => {
              const isLogged = index < sessionReps.length;
              return (
                <div
                  key={index}
                  className={cn(
                    "h-full rounded-sm transition-colors",
                    isLogged ? "bg-secondary" : "bg-muted",
                  )}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3.5 py-2.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <Timer className="size-4 text-muted-foreground" />
              <span className="font-mono text-base font-semibold text-foreground tabular-nums">
                {formatCountdown(secondsLeft)}
              </span>
              <Badge
                className={secondsLeft === 0 ? "bg-emerald-600 text-white" : undefined}
                variant={secondsLeft === 0 ? "default" : "outline"}
              >
                {timerStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              Target: {selectedTarget} · Next: {nextTarget ?? "Complete"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleToggleTimer} size="sm" type="button" variant="secondary">
              {isRunning ? (
                <>
                  <Pause />
                  Pause
                </>
              ) : (
                <>
                  <Play />
                  Start
                </>
              )}
            </Button>
            <Button
              disabled={!isRunning && secondsLeft === targetSeconds}
              onClick={handleResetTimer}
              size="sm"
              type="button"
              variant="ghost"
            >
              <RotateCcw />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            className="h-12 text-base"
            onClick={() => logOutcome("success")}
            size="lg"
            type="button"
            variant="default"
          >
            <Check className="size-5" />
            Success
          </Button>
          <Button
            className="h-12 text-base"
            onClick={() => logOutcome("not_yet")}
            size="lg"
            type="button"
            variant="outline"
          >
            <X className="size-5 text-amber-600" />
            Not Yet
          </Button>
        </div>

        <Accordion defaultValue={[]} multiple>
          <AccordionItem value="more-info">
            <AccordionTrigger>More info on this step</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3 text-muted-foreground">
              <div className="flex flex-col gap-1">
                <h4 className="font-medium text-foreground">Instructions</h4>
                <p>{activeStep.instructions}</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-medium text-foreground">Try It Cold criteria</h4>
                <p>{activeStep.tryItColdCriteria}</p>
              </div>
              <Separator />
              <p className="text-xs">Target ladder: {activeStep.targets.join(" → ")}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq">
            <AccordionTrigger>FAQ &amp; troubleshooting</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3 text-muted-foreground">
              {activeStep.faqs.map((item) => (
                <div key={item.question} className="flex flex-col gap-1">
                  <h4 className="font-medium text-foreground">{item.question}</h4>
                  <p>{item.answer}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes">
            <AccordionTrigger>Notes &amp; what&apos;s next</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3 text-muted-foreground">
              <p>{activeStep.notes}</p>
              <Separator />
              <p className="text-xs">
                Lifetime totals: {activeStep.practice_totals.success} success ·{" "}
                {activeStep.practice_totals.notYet} not yet
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
