import { cn } from "cn";
import { Award, ChevronDown, Clock, Target } from "lucide-react";
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
import { Separator } from "@/shared/ui/shadcn/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

import type {
  GroupedTrainingSession,
  HistoryDateBucket,
  HistoryFeedItem,
  StepCompletionMilestone,
  TrainingHistoryData,
} from "../model/types";
import {
  AttemptOutcomeBadge,
  formatHistoryTime,
  TrainActionButton,
  TrainingHistoryHeader,
  TrainingHistorySummaryBar,
} from "./training-history-shared";

type FeedFilterTab = "all" | "sessions" | "milestones";

const DATE_BUCKET_ORDER: readonly HistoryDateBucket[] = ["Today", "Yesterday", "Earlier This Week"];

function SessionFeedCard({ session }: { session: GroupedTrainingSession }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card size="sm">
      <CardHeader className="gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{session.behaviorTitle}</Badge>
          <span className="text-xs text-muted-foreground">{session.levelTitle}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <Clock aria-hidden="true" className="size-3" />
            {formatHistoryTime(session.endedAt)}
          </span>
        </div>
        <CardTitle className="text-base">{session.stepTitle}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2 pt-0.5">
          <Badge variant="outline">
            <span className="tabular-nums">
              {session.successCount} / {session.totalCount} Success
            </span>
          </Badge>
          <Badge variant="outline">
            <Target aria-hidden="true" className="size-3" />
            <span>{session.targetProgression}</span>
          </Badge>
        </CardDescription>
        <CardAction>
          <TrainActionButton href={session.sessionHref} />
        </CardAction>
      </CardHeader>

      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger
            render={
              <Button
                className="-ml-2 text-muted-foreground"
                size="xs"
                type="button"
                variant="ghost"
              >
                <span>
                  {isOpen ? "Hide" : "Show"} {session.totalCount} practice attempts
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                />
              </Button>
            }
          />
          <CollapsibleContent className="mt-2.5 space-y-2">
            <Separator />
            <ul className="divide-y divide-border">
              {session.attempts.map((attempt, index) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs first:pt-0 last:pb-0"
                  key={attempt.attemptId}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 font-medium text-muted-foreground tabular-nums">
                      Rep {index + 1}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatHistoryTime(attempt.createdAt)}
                    </span>
                    <Badge variant="outline">{attempt.target}</Badge>
                  </div>
                  <AttemptOutcomeBadge outcome={attempt.outcome} />
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function MilestoneFeedCard({ milestone }: { milestone: StepCompletionMilestone }) {
  return (
    <Card className="border-primary/30 bg-primary/5" size="sm">
      <CardHeader className="gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">
            <Award aria-hidden="true" className="size-3" />
            <span>Step Completed</span>
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {milestone.levelTitle} · {milestone.behaviorTitle}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <Clock aria-hidden="true" className="size-3" />
            {formatHistoryTime(milestone.completedAt)}
          </span>
        </div>
        <CardTitle className="text-base">{milestone.stepTitle}</CardTitle>
        <CardDescription>
          Passed step completion criteria and unlocked the next stage.
        </CardDescription>
        <CardAction>
          <TrainActionButton href={milestone.sessionHref} label="Practice" />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

function DateGroupedFeedList({ items }: { items: readonly HistoryFeedItem[] }) {
  if (items.length === 0) {
    return (
      <Card size="sm">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No training history entries in this view yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {DATE_BUCKET_ORDER.map((bucket) => {
        const bucketItems = items.filter((item) => item.dateBucket === bucket);
        if (bucketItems.length === 0) {
          return null;
        }
        return (
          <section aria-label={bucket} className="space-y-3" key={bucket}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {bucket}
              </h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {bucketItems.length} {bucketItems.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="space-y-3">
              {bucketItems.map((item) =>
                item.kind === "session" ? (
                  <SessionFeedCard key={item.id} session={item.session} />
                ) : (
                  <MilestoneFeedCard key={item.id} milestone={item.milestone} />
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Variant A: Chronological Session Feed. */
export function VariantSessionFeed({ data }: { data: TrainingHistoryData }) {
  const [activeTab, setActiveTab] = useState<FeedFilterTab>("all");

  const sessionOnlyItems = data.feedItems.filter((item) => item.kind === "session");
  const milestoneOnlyItems = data.feedItems.filter((item) => item.kind === "milestone");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-20">
      <TrainingHistoryHeader dogName={data.dogName} />
      <TrainingHistorySummaryBar summary={data.summary} />

      <Tabs
        value={activeTab}
        onValueChange={(nextValue) => {
          if (nextValue === "all" || nextValue === "sessions" || nextValue === "milestones") {
            setActiveTab(nextValue);
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All ({data.feedItems.length})</TabsTrigger>
          <TabsTrigger value="sessions">Practice Sessions ({sessionOnlyItems.length})</TabsTrigger>
          <TabsTrigger value="milestones">
            Completed Steps ({milestoneOnlyItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="all">
          <DateGroupedFeedList items={data.feedItems} />
        </TabsContent>
        <TabsContent className="mt-4" value="sessions">
          <DateGroupedFeedList items={sessionOnlyItems} />
        </TabsContent>
        <TabsContent className="mt-4" value="milestones">
          <DateGroupedFeedList items={milestoneOnlyItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
