import { ArrowLeft, CheckCircle2, Play, Sparkles, XCircle } from "lucide-react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent } from "@/shared/ui/shadcn/card";
import { Separator } from "@/shared/ui/shadcn/separator";

import type { PracticeAttemptOutcome, TrainingHistorySummaryMetrics } from "../model/types";

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatHistoryTime(timestampMs: number): string {
  return TIME_FORMATTER.format(new Date(timestampMs));
}

export function formatHistoryShortDate(timestampMs: number): string {
  return SHORT_DATE_FORMATTER.format(new Date(timestampMs));
}

export function formatHistoryDateTime(timestampMs: number): string {
  return DATE_TIME_FORMATTER.format(new Date(timestampMs));
}

export function TrainActionButton({
  href,
  label = "Train",
  variant = "outline",
}: {
  href: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}) {
  return (
    <Button
      nativeButton={false}
      render={
        <a href={href}>
          <Play aria-hidden="true" className="size-3" />
          <span>{label}</span>
        </a>
      }
      size="xs"
      variant={variant}
    />
  );
}

export function AttemptOutcomeBadge({ outcome }: { outcome: PracticeAttemptOutcome }) {
  if (outcome === "success") {
    return (
      <Badge variant="secondary">
        <CheckCircle2 aria-hidden="true" className="size-3" />
        <span>Success</span>
      </Badge>
    );
  }

  return (
    <Badge className="text-muted-foreground" variant="outline">
      <XCircle aria-hidden="true" className="size-3" />
      <span>Not Yet</span>
    </Badge>
  );
}

export function TrainingHistoryHeader({
  dogName,
  subtitle = "Practice sessions, target progressions, and completed steps over the past 7 days.",
}: {
  dogName: string;
  subtitle?: string;
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div>
            <Button
              className="-ml-2 text-muted-foreground"
              nativeButton={false}
              render={
                <a href="/training">
                  <ArrowLeft aria-hidden="true" className="size-3.5" />
                  <span>Back to Training</span>
                </a>
              }
              size="sm"
              variant="ghost"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Training History</h1>
            <Badge variant="outline">{dogName}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Button
          nativeButton={false}
          render={
            <a href="/training/session">
              <Sparkles aria-hidden="true" className="size-3.5" />
              <span>Start Session</span>
            </a>
          }
          size="sm"
          variant="default"
        />
      </div>
      <Separator />
    </header>
  );
}

interface SummaryStatItem {
  label: string;
  value: string;
  detail: string;
}

export function TrainingHistorySummaryBar({ summary }: { summary: TrainingHistorySummaryMetrics }) {
  const items: readonly SummaryStatItem[] = [
    {
      label: "Practice Reps",
      value: String(summary.totalAttempts),
      detail: `${summary.totalSuccesses} successful`,
    },
    {
      label: "Success Rate",
      value: `${summary.overallSuccessRate}%`,
      detail: "Across active reps",
    },
    {
      label: "Sessions",
      value: String(summary.totalSessions),
      detail: "Past 7 days",
    },
    {
      label: "Completed Steps",
      value: String(summary.completedStepsCount),
      detail: "Milestones earned",
    },
  ];

  return (
    <section aria-label="7-day training summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardContent className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            <p className="text-xl font-semibold tracking-tight tabular-nums">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
