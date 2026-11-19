type TrainingVariant = "A" | "B" | "C";

type StepStatus = "completed" | "next" | "ready" | "locked";

type LevelStatus = "completed" | "in_progress" | "upcoming";

interface TrainingStep {
  cue: string;
  id: string;
  label: string;
  prerequisiteLabel?: string;
  sessionHref: string;
  status: StepStatus;
  target: string;
}

interface TrainingBehavior {
  id: string;
  levelId: string;
  name: string;
  steps: readonly TrainingStep[];
  theoryHref: string;
}

interface TrainingLevel {
  behaviors: readonly TrainingBehavior[];
  id: string;
  levelNumber: number;
  status: LevelStatus;
  title: string;
}

interface RecommendedStep {
  behaviorId: string;
  behaviorName: string;
  cue: string;
  levelId: string;
  levelTitle: string;
  sessionHref: string;
  stepId: string;
  stepLabel: string;
  target: string;
  theoryHref: string;
}

interface TrainingHubData {
  activeLevelId: string;
  dogName: string;
  historyHref: string;
  levels: readonly TrainingLevel[];
  recommended: RecommendedStep;
}

export type {
  LevelStatus,
  RecommendedStep,
  StepStatus,
  TrainingBehavior,
  TrainingHubData,
  TrainingLevel,
  TrainingStep,
  TrainingVariant,
};
