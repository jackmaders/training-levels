import { Award, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent } from "@/shared/ui/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/shadcn/dropdown-menu";
import { Progress } from "@/shared/ui/shadcn/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/shadcn/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

import type { TrainingHistoryData } from "../model/types";
import {
  AttemptOutcomeBadge,
  formatHistoryDateTime,
  TrainActionButton,
  TrainingHistoryHeader,
} from "./training-history-shared";

type TableTab = "sessions" | "milestones" | "attempts";

const ALL_BEHAVIORS = "all";
const FULL_PERCENT = 100;

function BehaviorFilterMenu({
  behaviorTitles,
  selectedBehavior,
  onSelectBehavior,
}: {
  behaviorTitles: readonly string[];
  selectedBehavior: string;
  onSelectBehavior: (behavior: string) => void;
}) {
  const activeLabel = selectedBehavior === ALL_BEHAVIORS ? "All Behaviors" : selectedBehavior;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" type="button" variant="outline">
            <Filter aria-hidden="true" className="size-3.5" />
            <span>{activeLabel}</span>
            <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Filter by behavior</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedBehavior} onValueChange={onSelectBehavior}>
          <DropdownMenuRadioItem value={ALL_BEHAVIORS}>All Behaviors</DropdownMenuRadioItem>
          {behaviorTitles.map((title) => (
            <DropdownMenuRadioItem key={title} value={title}>
              {title}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyTableRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <TableRow>
      <TableCell className="py-8 text-center text-muted-foreground" colSpan={colSpan}>
        {message}
      </TableCell>
    </TableRow>
  );
}

/** Variant B: Structured Log Table. */
export function VariantDataTable({ data }: { data: TrainingHistoryData }) {
  const [activeTab, setActiveTab] = useState<TableTab>("sessions");
  const [selectedBehavior, setSelectedBehavior] = useState<string>(ALL_BEHAVIORS);

  const behaviorTitles = data.behaviors.map((behavior) => behavior.behaviorTitle);

  const filteredSessions =
    selectedBehavior === ALL_BEHAVIORS
      ? data.sessions
      : data.sessions.filter((session) => session.behaviorTitle === selectedBehavior);

  const filteredMilestones =
    selectedBehavior === ALL_BEHAVIORS
      ? data.milestones
      : data.milestones.filter((milestone) => milestone.behaviorTitle === selectedBehavior);

  const filteredAttempts =
    selectedBehavior === ALL_BEHAVIORS
      ? data.enrichedAttempts
      : data.enrichedAttempts.filter((attempt) => attempt.behaviorTitle === selectedBehavior);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-20">
      <TrainingHistoryHeader dogName={data.dogName} />

      <Tabs
        value={activeTab}
        onValueChange={(nextValue) => {
          if (nextValue === "sessions" || nextValue === "milestones" || nextValue === "attempts") {
            setActiveTab(nextValue);
          }
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="sessions">Grouped Sessions ({filteredSessions.length})</TabsTrigger>
            <TabsTrigger value="milestones">
              Completed Steps ({filteredMilestones.length})
            </TabsTrigger>
            <TabsTrigger value="attempts">Raw Attempts ({filteredAttempts.length})</TabsTrigger>
          </TabsList>

          <BehaviorFilterMenu
            behaviorTitles={behaviorTitles}
            selectedBehavior={selectedBehavior}
            onSelectBehavior={setSelectedBehavior}
          />
        </div>

        <TabsContent className="mt-4" value="sessions">
          <Card size="sm">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Date</TableHead>
                    <TableHead>Behavior &amp; Step</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <EmptyTableRow
                      colSpan={5}
                      message="No grouped sessions match the selected behavior filter."
                    />
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow key={session.sessionId}>
                        <TableCell className="pl-4 text-xs text-muted-foreground tabular-nums">
                          <div className="font-medium text-foreground">{session.dateBucket}</div>
                          <div>{formatHistoryDateTime(session.endedAt)}</div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="secondary">{session.behaviorTitle}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {session.levelTitle}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium">{session.stepTitle}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{session.targetProgression}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-36 space-y-1.5">
                            <div className="flex items-center justify-between text-xs tabular-nums">
                              <span className="font-medium">
                                {session.successCount}/{session.totalCount} Success
                              </span>
                              <span className="text-muted-foreground">{session.successRate}%</span>
                            </div>
                            <Progress
                              aria-label={`${session.behaviorTitle} ${session.stepTitle} success rate`}
                              value={session.successRate}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <TrainActionButton href={session.sessionHref} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-4" value="milestones">
          <Card size="sm">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Date</TableHead>
                    <TableHead>Behavior &amp; Step</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMilestones.length === 0 ? (
                    <EmptyTableRow
                      colSpan={5}
                      message="No completed steps match the selected behavior filter."
                    />
                  ) : (
                    filteredMilestones.map((milestone) => (
                      <TableRow key={milestone.id}>
                        <TableCell className="pl-4 text-xs text-muted-foreground tabular-nums">
                          <div className="font-medium text-foreground">{milestone.dateBucket}</div>
                          <div>{formatHistoryDateTime(milestone.completedAt)}</div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="secondary">{milestone.behaviorTitle}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {milestone.levelTitle}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium">{milestone.stepTitle}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Step milestone</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-36 space-y-1.5">
                            <Badge variant="default">
                              <Award aria-hidden="true" className="size-3" />
                              <span>Completed</span>
                            </Badge>
                            <Progress
                              aria-label={`${milestone.stepTitle} completed`}
                              value={FULL_PERCENT}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <TrainActionButton href={milestone.sessionHref} label="Practice" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-4" value="attempts">
          <Card size="sm">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Date</TableHead>
                    <TableHead>Behavior &amp; Step</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.length === 0 ? (
                    <EmptyTableRow
                      colSpan={5}
                      message="No practice attempts match the selected behavior filter."
                    />
                  ) : (
                    filteredAttempts.map((attempt) => {
                      const isSuccess = attempt.outcome === "success";
                      return (
                        <TableRow key={attempt.attemptId}>
                          <TableCell className="pl-4 text-xs text-muted-foreground tabular-nums">
                            {formatHistoryDateTime(attempt.createdAt)}
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="secondary">{attempt.behaviorTitle}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {attempt.levelTitle}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium">{attempt.stepTitle}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{attempt.target}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-36 space-y-1.5">
                              <AttemptOutcomeBadge outcome={attempt.outcome} />
                              <Progress
                                aria-label={`${attempt.stepTitle} attempt outcome`}
                                value={isSuccess ? FULL_PERCENT : 0}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <TrainActionButton href={attempt.sessionHref} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
