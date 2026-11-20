export type PrototypeVariant = "A" | "B" | "C";

export type PracticeAttemptOutcome = "success" | "not_yet";

/** Grounded strictly in the `practice_attempts` SQLite schema. */
export interface PracticeAttemptRecord {
  attemptId: string;
  createdAt: number;
  dogId: string;
  stepId: string;
  target: string;
  outcome: PracticeAttemptOutcome;
  undoneAt: number | null;
}

/** Grounded strictly in the `step_completions` SQLite schema. */
export interface StepCompletionRecord {
  id: string;
  completedAt: number;
  dogId: string;
  stepId: string;
}

export interface CurriculumStepMetadata {
  stepId: string;
  levelTitle: string;
  behaviorTitle: string;
  stepTitle: string;
  sessionHref: string;
}

export type HistoryDateBucket = "Today" | "Yesterday" | "Earlier This Week";

export interface EnrichedPracticeAttempt extends PracticeAttemptRecord, CurriculumStepMetadata {}

export interface GroupedTrainingSession {
  sessionId: string;
  dogId: string;
  stepId: string;
  levelTitle: string;
  behaviorTitle: string;
  stepTitle: string;
  sessionHref: string;
  startedAt: number;
  endedAt: number;
  dateBucket: HistoryDateBucket;
  successCount: number;
  notYetCount: number;
  totalCount: number;
  successRate: number;
  targetProgression: string;
  attempts: readonly EnrichedPracticeAttempt[];
}

export interface StepCompletionMilestone {
  id: string;
  dogId: string;
  stepId: string;
  completedAt: number;
  dateBucket: HistoryDateBucket;
  levelTitle: string;
  behaviorTitle: string;
  stepTitle: string;
  sessionHref: string;
}

export type HistoryFeedItem =
  | {
      kind: "session";
      id: string;
      timestamp: number;
      dateBucket: HistoryDateBucket;
      session: GroupedTrainingSession;
    }
  | {
      kind: "milestone";
      id: string;
      timestamp: number;
      dateBucket: HistoryDateBucket;
      milestone: StepCompletionMilestone;
    };

export interface BehaviorHistorySummary {
  behaviorTitle: string;
  levelTitle: string;
  primarySessionHref: string;
  totalSessions: number;
  totalAttempts: number;
  totalSuccesses: number;
  overallSuccessRate: number;
  latestTarget: string;
  trendLabels: readonly string[];
  milestones: readonly StepCompletionMilestone[];
  sessions: readonly GroupedTrainingSession[];
}

export interface TrainingHistorySummaryMetrics {
  totalAttempts: number;
  totalSuccesses: number;
  overallSuccessRate: number;
  totalSessions: number;
  completedStepsCount: number;
}

export interface TrainingHistoryData {
  dogId: string;
  dogName: string;
  nowMs: number;
  practiceAttempts: readonly PracticeAttemptRecord[];
  stepCompletions: readonly StepCompletionRecord[];
  enrichedAttempts: readonly EnrichedPracticeAttempt[];
  sessions: readonly GroupedTrainingSession[];
  milestones: readonly StepCompletionMilestone[];
  feedItems: readonly HistoryFeedItem[];
  behaviors: readonly BehaviorHistorySummary[];
  summary: TrainingHistorySummaryMetrics;
}
