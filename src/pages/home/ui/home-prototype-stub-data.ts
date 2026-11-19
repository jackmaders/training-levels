type HomePrototypeVariantKey = "A" | "B" | "C";

const HOME_PROTOTYPE_VARIANTS = [
  { key: "A", label: "Split Hero" },
  { key: "B", label: "Split + Progress & Secondary Link" },
  { key: "C", label: "Split + Step Spotlight" },
] as const;

const STUB_HOME_DATA = {
  config: {
    activeDog: "Barnaby",
    currentLevel: "Level 2 — Distractions",
  },
  nextSession: {
    completedSteps: 12,
    lastPracticedLabel: "Last practiced 2 days ago",
    level: "Level 2",
    practiceAttempts: 34,
    progressSummary: "12 of 24 steps completed",
    sessionTitle: "Level 2: Stay",
    stepRepsSummary: "2/3 reps passed",
    stepTitle: "Stay with Distractions",
    steps: [
      { id: "hold-10s", label: "Hold 10-second sit-stay", status: "completed" },
      { id: "step-back", label: "Step back two paces", status: "completed" },
      { id: "release-cue", label: "Wait for release cue", status: "current" },
      { id: "mild-movement", label: "Hold stay with mild movement", status: "upcoming" },
      { id: "return-heel", label: "Return to heel before release", status: "upcoming" },
    ],
    testReadinessLabel: "Ready for step test",
    totalSteps: 24,
  },
  practiceSummary: {
    completedSteps: 12,
    passedTests: 4,
  },
} as const;

export { HOME_PROTOTYPE_VARIANTS, STUB_HOME_DATA, type HomePrototypeVariantKey };
