import type {
  BehaviorHistorySummary,
  CurriculumStepMetadata,
  EnrichedPracticeAttempt,
  GroupedTrainingSession,
  HistoryDateBucket,
  HistoryFeedItem,
  PracticeAttemptOutcome,
  PracticeAttemptRecord,
  StepCompletionMilestone,
  StepCompletionRecord,
  TrainingHistoryData,
} from "./types";

const BARNABY_DOG_ID = "dog-barnaby";
const BARNABY_DOG_NAME = "Barnaby";

/**
 * Deterministic reference timestamp so SSR and client hydration produce identical date buckets and
 * labels.
 */
const REFERENCE_NOW_MS = Date.UTC(2026, 10, 20, 18, 0, 0);

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const SESSION_GAP_WINDOW_MS = 30 * ONE_MINUTE_MS;
const PERCENT_SCALE = 100;

const STEP_METADATA_MAP: Record<string, CurriculumStepMetadata> = {
  "level-1/attention:step-2": {
    stepId: "level-1/attention:step-2",
    levelTitle: "Level 1",
    behaviorTitle: "Eye Contact",
    stepTitle: "Step 2: Check-in hold",
    sessionHref: "/training/session?step=level-1-attention-2",
  },
  "level-2/focus:step-2": {
    stepId: "level-2/focus:step-2",
    levelTitle: "Level 2",
    behaviorTitle: "Eye Contact",
    stepTitle: "Step 2: 2-second eye contact",
    sessionHref: "/training/session?step=level-2-focus-2",
  },
  "level-2/focus:step-3": {
    stepId: "level-2/focus:step-3",
    levelTitle: "Level 2",
    behaviorTitle: "Eye Contact",
    stepTitle: "Step 3: 6-second eye contact",
    sessionHref: "/training/session?step=level-2-focus-3",
  },
  "level-2/lazy-leash:step-1": {
    stepId: "level-2/lazy-leash:step-1",
    levelTitle: "Level 2",
    behaviorTitle: "Loose Leash Walking",
    stepTitle: "Step 1: Collar pressure yield",
    sessionHref: "/training/session?step=level-2-lazy-leash-1",
  },
  "level-2/lazy-leash:step-2": {
    stepId: "level-2/lazy-leash:step-2",
    levelTitle: "Level 2",
    behaviorTitle: "Loose Leash Walking",
    stepTitle: "Step 2: Five-step loose leash",
    sessionHref: "/training/session?step=level-2-lazy-leash-2",
  },
  "level-2/recall:step-1": {
    stepId: "level-2/recall:step-1",
    levelTitle: "Level 2",
    behaviorTitle: "Recall",
    stepTitle: "Step 1: Short-range recall",
    sessionHref: "/training/session?step=level-2-recall-1",
  },
  "level-2/recall:step-2": {
    stepId: "level-2/recall:step-2",
    levelTitle: "Level 2",
    behaviorTitle: "Recall",
    stepTitle: "Step 2: Distraction recall",
    sessionHref: "/training/session?step=level-2-recall-2",
  },
  "level-2/stay:step-1": {
    stepId: "level-2/stay:step-1",
    levelTitle: "Level 2",
    behaviorTitle: "Stay",
    stepTitle: "Step 1: Seated stay",
    sessionHref: "/training/session?step=level-2-stay-1",
  },
  "level-2/stay:step-2": {
    stepId: "level-2/stay:step-2",
    levelTitle: "Level 2",
    behaviorTitle: "Stay",
    stepTitle: "Step 2: Duration stay",
    sessionHref: "/training/session?step=level-2-stay-2",
  },
  "level-2/stay:step-3": {
    stepId: "level-2/stay:step-3",
    levelTitle: "Level 2",
    behaviorTitle: "Stay",
    stepTitle: "Step 3: Duration ladder at 3 paces",
    sessionHref: "/training/session",
  },
};

function getFallbackStepMetadata(stepId: string): CurriculumStepMetadata {
  return {
    stepId,
    levelTitle: "Level 2",
    behaviorTitle: "Training",
    stepTitle: stepId,
    sessionHref: "/training/session",
  };
}

function resolveStepMetadata(stepId: string): CurriculumStepMetadata {
  return STEP_METADATA_MAP[stepId] ?? getFallbackStepMetadata(stepId);
}

interface SessionAttemptSeed {
  idPrefix: string;
  stepId: string;
  startTimestampMs: number;
  repSpacingSeconds?: number;
  reps: readonly { target: string; outcome: PracticeAttemptOutcome }[];
}

function buildAttemptsFromSeeds(seeds: readonly SessionAttemptSeed[]): PracticeAttemptRecord[] {
  const rows: PracticeAttemptRecord[] = [];
  for (const seed of seeds) {
    const spacingMs = (seed.repSpacingSeconds ?? 35) * ONE_SECOND_MS;
    seed.reps.forEach((rep, index) => {
      rows.push({
        attemptId: `${seed.idPrefix}-rep-${String(index + 1).padStart(2, "0")}`,
        createdAt: seed.startTimestampMs + index * spacingMs,
        dogId: BARNABY_DOG_ID,
        stepId: seed.stepId,
        target: rep.target,
        outcome: rep.outcome,
        undoneAt: null,
      });
    });
  }
  return rows;
}

const SESSION_SEEDS: readonly SessionAttemptSeed[] = [
  // 6 days ago — Eye Contact (step 2)
  {
    idPrefix: "att-d6-eye",
    stepId: "level-2/focus:step-2",
    startTimestampMs: Date.UTC(2026, 10, 14, 9, 15, 0),
    reps: [
      { target: "2s", outcome: "success" },
      { target: "2s", outcome: "not_yet" },
      { target: "2s", outcome: "success" },
      { target: "2s", outcome: "success" },
      { target: "3s", outcome: "not_yet" },
      { target: "3s", outcome: "success" },
      { target: "3s", outcome: "success" },
      { target: "3s", outcome: "success" },
    ],
  },
  // 5 days ago — Stay (step 2, earlier session: 6/10)
  {
    idPrefix: "att-d5-stay",
    stepId: "level-2/stay:step-2",
    startTimestampMs: Date.UTC(2026, 10, 15, 10, 5, 0),
    reps: [
      { target: "5s", outcome: "success" },
      { target: "5s", outcome: "success" },
      { target: "10s", outcome: "not_yet" },
      { target: "5s", outcome: "success" },
      { target: "10s", outcome: "success" },
      { target: "10s", outcome: "not_yet" },
      { target: "10s", outcome: "success" },
      { target: "10s", outcome: "not_yet" },
      { target: "10s", outcome: "not_yet" },
      { target: "10s", outcome: "success" },
    ],
  },
  // 4 days ago — Loose Leash Walking (step 1)
  {
    idPrefix: "att-d4-llw",
    stepId: "level-2/lazy-leash:step-1",
    startTimestampMs: Date.UTC(2026, 10, 16, 16, 40, 0),
    reps: [
      { target: "3 steps", outcome: "success" },
      { target: "3 steps", outcome: "not_yet" },
      { target: "3 steps", outcome: "success" },
      { target: "5 steps", outcome: "success" },
      { target: "5 steps", outcome: "success" },
      { target: "5 steps", outcome: "success" },
    ],
  },
  // 3 days ago — Recall (step 1)
  {
    idPrefix: "att-d3-recall",
    stepId: "level-2/recall:step-1",
    startTimestampMs: Date.UTC(2026, 10, 17, 11, 20, 0),
    reps: [
      { target: "6 ft", outcome: "success" },
      { target: "6 ft", outcome: "success" },
      { target: "10 ft", outcome: "not_yet" },
      { target: "10 ft", outcome: "success" },
      { target: "10 ft", outcome: "success" },
      { target: "10 ft", outcome: "success" },
      { target: "10 ft", outcome: "success" },
    ],
  },
  // 2 days ago — Stay (step 2, progression: 8/10)
  {
    idPrefix: "att-d2-stay",
    stepId: "level-2/stay:step-2",
    startTimestampMs: Date.UTC(2026, 10, 18, 17, 10, 0),
    reps: [
      { target: "10s", outcome: "success" },
      { target: "10s", outcome: "success" },
      { target: "15s", outcome: "not_yet" },
      { target: "10s", outcome: "success" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "not_yet" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "success" },
    ],
  },
  // Yesterday morning — Eye Contact (step 3)
  {
    idPrefix: "att-yest-eye",
    stepId: "level-2/focus:step-3",
    startTimestampMs: Date.UTC(2026, 10, 19, 9, 30, 0),
    reps: [
      { target: "4s", outcome: "success" },
      { target: "6s", outcome: "not_yet" },
      { target: "4s", outcome: "success" },
      { target: "6s", outcome: "success" },
      { target: "6s", outcome: "success" },
      { target: "6s", outcome: "success" },
      { target: "6s", outcome: "success" },
    ],
  },
  // Yesterday afternoon — Recall (step 2)
  {
    idPrefix: "att-yest-recall",
    stepId: "level-2/recall:step-2",
    startTimestampMs: Date.UTC(2026, 10, 19, 15, 45, 0),
    reps: [
      { target: "12 ft", outcome: "success" },
      { target: "12 ft", outcome: "not_yet" },
      { target: "12 ft", outcome: "success" },
      { target: "12 ft", outcome: "not_yet" },
      { target: "12 ft", outcome: "success" },
      { target: "12 ft", outcome: "success" },
      { target: "15 ft", outcome: "success" },
      { target: "15 ft", outcome: "success" },
    ],
  },
  // Today morning — Loose Leash Walking (step 2)
  {
    idPrefix: "att-today-llw",
    stepId: "level-2/lazy-leash:step-2",
    startTimestampMs: Date.UTC(2026, 10, 20, 8, 50, 0),
    reps: [
      { target: "5s + 5 steps", outcome: "success" },
      { target: "5s + 5 steps", outcome: "success" },
      { target: "5s + 5 steps", outcome: "not_yet" },
      { target: "5s + 5 steps", outcome: "success" },
      { target: "8s + 5 steps", outcome: "success" },
      { target: "8s + 5 steps", outcome: "success" },
      { target: "8s + 5 steps", outcome: "success" },
    ],
  },
  // Today afternoon — Stay (step 3, progression: 9/10)
  {
    idPrefix: "att-today-stay",
    stepId: "level-2/stay:step-3",
    startTimestampMs: Date.UTC(2026, 10, 20, 14, 15, 0),
    reps: [
      { target: "10s", outcome: "success" },
      { target: "10s", outcome: "success" },
      { target: "10s", outcome: "success" },
      { target: "15s", outcome: "not_yet" },
      { target: "10s", outcome: "success" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "success" },
      { target: "15s", outcome: "success" },
    ],
  },
];

const STUB_PRACTICE_ATTEMPTS: readonly PracticeAttemptRecord[] =
  buildAttemptsFromSeeds(SESSION_SEEDS);

const STUB_STEP_COMPLETIONS: readonly StepCompletionRecord[] = [
  {
    id: "comp-stay-step-2",
    completedAt: Date.UTC(2026, 10, 18, 17, 22, 0),
    dogId: BARNABY_DOG_ID,
    stepId: "level-2/stay:step-2",
  },
  {
    id: "comp-recall-step-1",
    completedAt: Date.UTC(2026, 10, 17, 11, 28, 0),
    dogId: BARNABY_DOG_ID,
    stepId: "level-2/recall:step-1",
  },
  {
    id: "comp-llw-step-1",
    completedAt: Date.UTC(2026, 10, 16, 16, 48, 0),
    dogId: BARNABY_DOG_ID,
    stepId: "level-2/lazy-leash:step-1",
  },
  {
    id: "comp-eye-step-2",
    completedAt: Date.UTC(2026, 10, 14, 9, 25, 0),
    dogId: BARNABY_DOG_ID,
    stepId: "level-2/focus:step-2",
  },
];

function getUtcDayStartMs(timestampMs: number): number {
  const date = new Date(timestampMs);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function resolveDateBucket(timestampMs: number, nowMs: number): HistoryDateBucket {
  const dayDiff = Math.round(
    (getUtcDayStartMs(nowMs) - getUtcDayStartMs(timestampMs)) / ONE_DAY_MS,
  );
  if (dayDiff <= 0) {
    return "Today";
  }
  if (dayDiff === 1) {
    return "Yesterday";
  }
  return "Earlier This Week";
}

function buildTargetProgression(attempts: readonly EnrichedPracticeAttempt[]): string {
  const uniqueTargets: string[] = [];
  for (const attempt of attempts) {
    if (!uniqueTargets.includes(attempt.target)) {
      uniqueTargets.push(attempt.target);
    }
  }
  if (uniqueTargets.length === 0) {
    return "—";
  }
  if (uniqueTargets.length === 1) {
    return uniqueTargets[0] ?? "—";
  }
  const first = uniqueTargets[0];
  const last = uniqueTargets[uniqueTargets.length - 1];
  return first === last ? (first ?? "—") : `${first} → ${last}`;
}

function toGroupedSession(
  attempts: readonly EnrichedPracticeAttempt[],
  sessionIndex: number,
  nowMs: number,
): GroupedTrainingSession {
  const first = attempts[0];
  const last = attempts[attempts.length - 1];
  if (first === undefined || last === undefined) {
    throw new Error("Cannot create a grouped training session from empty attempts.");
  }

  let successCount = 0;
  let notYetCount = 0;
  for (const attempt of attempts) {
    if (attempt.outcome === "success") {
      successCount += 1;
    } else {
      notYetCount += 1;
    }
  }

  const totalCount = attempts.length;
  const successRate =
    totalCount === 0 ? 0 : Math.round((successCount / totalCount) * PERCENT_SCALE);

  return {
    sessionId: `session-${String(sessionIndex + 1).padStart(2, "0")}-${first.stepId}`,
    dogId: first.dogId,
    stepId: first.stepId,
    levelTitle: first.levelTitle,
    behaviorTitle: first.behaviorTitle,
    stepTitle: first.stepTitle,
    sessionHref: first.sessionHref,
    startedAt: first.createdAt,
    endedAt: last.createdAt,
    dateBucket: resolveDateBucket(last.createdAt, nowMs),
    successCount,
    notYetCount,
    totalCount,
    successRate,
    targetProgression: buildTargetProgression(attempts),
    attempts,
  };
}

function groupContiguousPracticeAttempts(
  attempts: readonly PracticeAttemptRecord[],
  nowMs: number,
): {
  enrichedAttempts: EnrichedPracticeAttempt[];
  sessions: GroupedTrainingSession[];
} {
  const activeChronological = attempts
    .filter((attempt) => attempt.undoneAt === null)
    .toSorted((left, right) => left.createdAt - right.createdAt)
    .map((attempt) => ({
      ...attempt,
      ...resolveStepMetadata(attempt.stepId),
    }));

  const groups: EnrichedPracticeAttempt[][] = [];
  for (const attempt of activeChronological) {
    const currentGroup = groups[groups.length - 1];
    const previousAttempt =
      currentGroup === undefined ? undefined : currentGroup[currentGroup.length - 1];

    const isSameSession =
      previousAttempt !== undefined &&
      previousAttempt.dogId === attempt.dogId &&
      previousAttempt.stepId === attempt.stepId &&
      attempt.createdAt - previousAttempt.createdAt <= SESSION_GAP_WINDOW_MS;

    if (isSameSession && currentGroup !== undefined) {
      currentGroup.push(attempt);
    } else {
      groups.push([attempt]);
    }
  }

  const sessions = groups
    .map((group, index) => toGroupedSession(group, index, nowMs))
    .toSorted((left, right) => right.endedAt - left.endedAt);

  return {
    enrichedAttempts: activeChronological.toSorted(
      (left, right) => right.createdAt - left.createdAt,
    ),
    sessions,
  };
}

function enrichStepCompletions(
  completions: readonly StepCompletionRecord[],
  nowMs: number,
): StepCompletionMilestone[] {
  return completions
    .toSorted((left, right) => right.completedAt - left.completedAt)
    .map((completion) => {
      const metadata = resolveStepMetadata(completion.stepId);
      return {
        id: completion.id,
        dogId: completion.dogId,
        stepId: completion.stepId,
        completedAt: completion.completedAt,
        dateBucket: resolveDateBucket(completion.completedAt, nowMs),
        levelTitle: metadata.levelTitle,
        behaviorTitle: metadata.behaviorTitle,
        stepTitle: metadata.stepTitle,
        sessionHref: metadata.sessionHref,
      };
    });
}

function buildBehaviorSummaries(
  sessions: readonly GroupedTrainingSession[],
  milestones: readonly StepCompletionMilestone[],
): BehaviorHistorySummary[] {
  const behaviorOrder = ["Stay", "Recall", "Loose Leash Walking", "Eye Contact"];
  const byBehavior = new Map<string, GroupedTrainingSession[]>();

  for (const session of sessions) {
    const existing = byBehavior.get(session.behaviorTitle) ?? [];
    existing.push(session);
    byBehavior.set(session.behaviorTitle, existing);
  }

  const behaviorNames = [...byBehavior.keys()].toSorted((left, right) => {
    const leftIdx = behaviorOrder.indexOf(left);
    const rightIdx = behaviorOrder.indexOf(right);
    if (leftIdx === -1 && rightIdx === -1) {
      return left.localeCompare(right);
    }
    if (leftIdx === -1) {
      return 1;
    }
    if (rightIdx === -1) {
      return -1;
    }
    return leftIdx - rightIdx;
  });

  return behaviorNames.map((behaviorTitle) => {
    const behaviorSessions = (byBehavior.get(behaviorTitle) ?? []).toSorted(
      (left, right) => right.endedAt - left.endedAt,
    );
    const chronologicalSessions = behaviorSessions.toSorted(
      (left, right) => left.endedAt - right.endedAt,
    );
    const behaviorMilestones = milestones.filter(
      (milestone) => milestone.behaviorTitle === behaviorTitle,
    );

    let totalAttempts = 0;
    let totalSuccesses = 0;
    for (const session of behaviorSessions) {
      totalAttempts += session.totalCount;
      totalSuccesses += session.successCount;
    }

    const latestSession = behaviorSessions[0];
    const latestAttempt = latestSession?.attempts[latestSession.attempts.length - 1];

    return {
      behaviorTitle,
      levelTitle: latestSession?.levelTitle ?? "Level 2",
      primarySessionHref: latestSession?.sessionHref ?? "/training/session",
      totalSessions: behaviorSessions.length,
      totalAttempts,
      totalSuccesses,
      overallSuccessRate:
        totalAttempts === 0 ? 0 : Math.round((totalSuccesses / totalAttempts) * PERCENT_SCALE),
      latestTarget: latestAttempt?.target ?? "—",
      trendLabels: chronologicalSessions.map(
        (session) => `${session.successCount}/${session.totalCount}`,
      ),
      milestones: behaviorMilestones,
      sessions: behaviorSessions,
    };
  });
}

function buildTrainingHistoryData(): TrainingHistoryData {
  const { enrichedAttempts, sessions } = groupContiguousPracticeAttempts(
    STUB_PRACTICE_ATTEMPTS,
    REFERENCE_NOW_MS,
  );
  const milestones = enrichStepCompletions(STUB_STEP_COMPLETIONS, REFERENCE_NOW_MS);

  const feedItems: HistoryFeedItem[] = [
    ...sessions.map((session): HistoryFeedItem => ({
      kind: "session",
      id: session.sessionId,
      timestamp: session.endedAt,
      dateBucket: session.dateBucket,
      session,
    })),
    ...milestones.map((milestone): HistoryFeedItem => ({
      kind: "milestone",
      id: milestone.id,
      timestamp: milestone.completedAt,
      dateBucket: milestone.dateBucket,
      milestone,
    })),
  ].toSorted((left, right) => right.timestamp - left.timestamp);

  const totalAttempts = enrichedAttempts.length;
  const totalSuccesses = enrichedAttempts.filter((attempt) => attempt.outcome === "success").length;
  const overallSuccessRate =
    totalAttempts === 0 ? 0 : Math.round((totalSuccesses / totalAttempts) * PERCENT_SCALE);

  return {
    dogId: BARNABY_DOG_ID,
    dogName: BARNABY_DOG_NAME,
    nowMs: REFERENCE_NOW_MS,
    practiceAttempts: STUB_PRACTICE_ATTEMPTS,
    stepCompletions: STUB_STEP_COMPLETIONS,
    enrichedAttempts,
    sessions,
    milestones,
    feedItems,
    behaviors: buildBehaviorSummaries(sessions, milestones),
    summary: {
      totalAttempts,
      totalSuccesses,
      overallSuccessRate,
      totalSessions: sessions.length,
      completedStepsCount: milestones.length,
    },
  };
}

export const BARNABY_TRAINING_HISTORY_DATA = buildTrainingHistoryData();
