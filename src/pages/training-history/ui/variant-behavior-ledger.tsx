import { ArrowRight, Award, Clock, TrendingUp } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/shadcn/accordion";
import { Badge } from "@/shared/ui/shadcn/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadcn/card";
import { Progress } from "@/shared/ui/shadcn/progress";
import { Separator } from "@/shared/ui/shadcn/separator";

import type {
  BehaviorHistorySummary,
  GroupedTrainingSession,
  StepCompletionMilestone,
  TrainingHistoryData,
} from "../model/types";
import {
  formatHistoryDateTime,
  formatHistoryShortDate,
  TrainActionButton,
  TrainingHistoryHeader,
  TrainingHistorySummaryBar,
} from "./training-history-shared";

function SessionTrendStrip({ trendLabels }: { trendLabels: readonly string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <TrendingUp aria-hidden="true" className="size-3.5" />
        <span>Session trend:</span>
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {trendLabels.map((label, index) => (
          <span className="inline-flex items-center gap-1" key={`${label}-${index}`}>
            {index > 0 ? (
              <ArrowRight aria-hidden="true" className="size-3 text-muted-foreground" />
            ) : null}
            <Badge variant={index === trendLabels.length - 1 ? "default" : "outline"}>
              <span className="tabular-nums">{label}</span>
            </Badge>
          </span>
        ))}
      </div>
    </div>
  );
}

function BehaviorMilestonesBlock({
  milestones,
}: {
  milestones: readonly StepCompletionMilestone[];
}) {
  if (milestones.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Completed Steps</p>
      <div className="flex flex-wrap gap-2">
        {milestones.map((milestone) => (
          <div
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs"
            key={milestone.id}
          >
            <Award aria-hidden="true" className="size-3.5 text-primary" />
            <span className="font-medium">{milestone.stepTitle}</span>
            <span className="text-muted-foreground tabular-nums">
              · {formatHistoryShortDate(milestone.completedAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BehaviorSessionRow({ session }: { session: GroupedTrainingSession }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{session.stepTitle}</span>
          <Badge variant="outline">{session.targetProgression}</Badge>
        </div>
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <Clock aria-hidden="true" className="size-3" />
          <span>
            {session.dateBucket} · {formatHistoryDateTime(session.endedAt)}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <span className="tabular-nums">
            {session.successCount}/{session.totalCount}
          </span>
        </Badge>
        <TrainActionButton href={session.sessionHref} />
      </div>
    </li>
  );
}

function BehaviorLedgerCard({ behavior }: { behavior: BehaviorHistorySummary }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{behavior.behaviorTitle}</CardTitle>
          <Badge variant="outline">{behavior.levelTitle}</Badge>
        </div>
        <CardDescription className="tabular-nums">
          {behavior.totalSessions} {behavior.totalSessions === 1 ? "session" : "sessions"} ·{" "}
          {behavior.totalSuccesses}/{behavior.totalAttempts} reps ({behavior.overallSuccessRate}%) ·
          Latest target: {behavior.latestTarget}
        </CardDescription>
        <CardAction>
          <TrainActionButton href={behavior.primarySessionHref} label="Train" variant="default" />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <Progress
          aria-label={`${behavior.behaviorTitle} overall success rate`}
          value={behavior.overallSuccessRate}
        />

        <SessionTrendStrip trendLabels={behavior.trendLabels} />

        <BehaviorMilestonesBlock milestones={behavior.milestones} />

        <Separator />

        <Accordion defaultValue={[behavior.behaviorTitle]} multiple>
          <AccordionItem className="border-none" value={behavior.behaviorTitle}>
            <AccordionTrigger className="py-1 text-xs font-medium text-muted-foreground hover:no-underline">
              Session log ({behavior.sessions.length})
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-0">
              <ul className="divide-y divide-border">
                {behavior.sessions.map((session) => (
                  <BehaviorSessionRow key={session.sessionId} session={session} />
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

/** Variant C: By-Behavior Progress Ledger. */
export function VariantBehaviorLedger({ data }: { data: TrainingHistoryData }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-20">
      <TrainingHistoryHeader
        dogName={data.dogName}
        subtitle="Session-over-session progression and completed milestones grouped by behavior."
      />
      <TrainingHistorySummaryBar summary={data.summary} />

      <section aria-label="Behavior progress ledger" className="grid grid-cols-1 gap-4">
        {data.behaviors.map((behavior) => (
          <BehaviorLedgerCard behavior={behavior} key={behavior.behaviorTitle} />
        ))}
      </section>
    </div>
  );
}
