export type PrototypeVariant = "A" | "B" | "C";

export type SessionMode = "practice" | "try_it_cold";

export type AttemptOutcome = "success" | "not_yet";

export type StepStatus = "passed" | "active" | "upcoming";

export type AutomaticReadiness =
  | "try_it_cold"
  | "practicing"
  | "ready_for_cold_test"
  | "step_complete";

export interface SessionRep {
  id: string;
  outcome: AttemptOutcome;
  target: string;
  mode: SessionMode;
}

export interface PracticeAttempt {
  id: string;
  stepNumber: number;
  outcome: AttemptOutcome;
  target: string;
  loggedAt: string;
  undoneAt: string | null;
}

export interface PracticeTotals {
  success: number;
  notYet: number;
}

export interface StepTest {
  id: string;
  stepNumber: number;
  outcome: "passed" | "not_yet";
  target: string;
  coldOverride: boolean;
  testedAt: string;
}

export interface StepFaq {
  question: string;
  answer: string;
}

export interface TrainingStep {
  stepNumber: number;
  title: string;
  heading: string;
  summary: string;
  instructions: string;
  tryItColdCriteria: string;
  faqs: StepFaq[];
  notes: string;
  targets: string[];
  defaultTarget: string;
  status: StepStatus;
  practice_totals: PracticeTotals;
  step_tests: StepTest[];
}

export interface TrainingSessionStubData {
  dogName: string;
  levelNumber: number;
  levelName: string;
  activeStepNumber: number;
  steps: TrainingStep[];
  initialAttempts: PracticeAttempt[];
}
