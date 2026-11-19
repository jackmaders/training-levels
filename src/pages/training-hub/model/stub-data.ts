import type { TrainingBehavior, TrainingHubData, TrainingLevel, TrainingStep } from "./types";

const LEVEL_ONE = 1;
const LEVEL_TWO = 2;
const LEVEL_THREE = 3;
const LEVEL_FOUR = 4;
const PERCENTAGE_SCALE = 100;

const BARNABY_TRAINING_HUB_DATA: TrainingHubData = {
  activeLevelId: "level-2",
  dogName: "Barnaby",
  historyHref: "/training/history",
  levels: [
    {
      behaviors: [
        {
          id: "attention",
          levelId: "level-1",
          name: "Attention & Eye Contact",
          steps: [
            {
              cue: "Cue name once, reward eye contact",
              id: "level-1/attention:step-1",
              label: "Step 1: Name response",
              sessionHref: "/training/session?step=level-1-attention-1",
              status: "completed",
              target: "5 reps",
            },
            {
              cue: "Hold focus before marking",
              id: "level-1/attention:step-2",
              label: "Step 2: Check-in hold",
              sessionHref: "/training/session?step=level-1-attention-2",
              status: "completed",
              target: "3s hold · 5 reps",
            },
          ],
          theoryHref: "/theory/level-1/attention",
        },
        {
          id: "sit",
          levelId: "level-1",
          name: "Sit",
          steps: [
            {
              cue: "Lure upward to sit position",
              id: "level-1/sit:step-1",
              label: "Step 1: Lure to sit",
              sessionHref: "/training/session?step=level-1-sit-1",
              status: "completed",
              target: "5 reps",
            },
            {
              cue: "Fade lure to clear hand signal",
              id: "level-1/sit:step-2",
              label: "Step 2: Hand signal sit",
              sessionHref: "/training/session?step=level-1-sit-2",
              status: "completed",
              target: "3s hold · 5 reps",
            },
          ],
          theoryHref: "/theory/level-1/sit",
        },
        {
          id: "target-touch",
          levelId: "level-1",
          name: "Target Touch",
          steps: [
            {
              cue: "Present open palm near nose",
              id: "level-1/target-touch:step-1",
              label: "Step 1: Nose to palm",
              sessionHref: "/training/session?step=level-1-target-touch-1",
              status: "completed",
              target: "5 reps",
            },
          ],
          theoryHref: "/theory/level-1/target-touch",
        },
      ],
      id: "level-1",
      levelNumber: LEVEL_ONE,
      status: "completed",
      title: "Level 1 — Foundations",
    },
    {
      behaviors: [
        {
          id: "stay",
          levelId: "level-2",
          name: "Stay",
          steps: [
            {
              cue: "Stay seated until release cue",
              id: "level-2/stay:step-1",
              label: "Step 1: Seated stay",
              sessionHref: "/training/session?step=level-2-stay-1",
              status: "completed",
              target: "5s duration · 5 reps",
            },
            {
              cue: "Build duration in quiet room",
              id: "level-2/stay:step-2",
              label: "Step 2: Duration stay",
              sessionHref: "/training/session?step=level-2-stay-2",
              status: "next",
              target: "15s duration · 3 reps",
            },
            {
              cue: "Step one pace back and return",
              id: "level-2/stay:step-3",
              label: "Step 3: Step-back stay",
              prerequisiteLabel: "Stay Step 2",
              sessionHref: "/training/session?step=level-2-stay-3",
              status: "locked",
              target: "3 ft · 10s · 3 reps",
            },
          ],
          theoryHref: "/theory/level-2/stay",
        },
        {
          id: "recall",
          levelId: "level-2",
          name: "Recall",
          steps: [
            {
              cue: "Call once and reward at collar",
              id: "level-2/recall:step-1",
              label: "Step 1: Short-range recall",
              sessionHref: "/training/session?step=level-2-recall-1",
              status: "completed",
              target: "6 ft · 5 reps",
            },
            {
              cue: "Recall past low-value toy",
              id: "level-2/recall:step-2",
              label: "Step 2: Distraction recall",
              sessionHref: "/training/session?step=level-2-recall-2",
              status: "ready",
              target: "12 ft · 4 reps",
            },
            {
              cue: "Call from adjacent hallway",
              id: "level-2/recall:step-3",
              label: "Step 3: Hallway recall",
              prerequisiteLabel: "Recall Step 2",
              sessionHref: "/training/session?step=level-2-recall-3",
              status: "locked",
              target: "20 ft · 3 reps",
            },
          ],
          theoryHref: "/theory/level-2/recall",
        },
        {
          id: "loose-leash-walking",
          levelId: "level-2",
          name: "Loose Leash Walking",
          steps: [
            {
              cue: "Reinforce check-ins at your side",
              id: "level-2/loose-leash-walking:step-1",
              label: "Step 1: Reward zone check-in",
              sessionHref: "/training/session?step=level-2-llw-1",
              status: "ready",
              target: "10 steps · 3 reps",
            },
            {
              cue: "Maintain slack J-curve on leash",
              id: "level-2/loose-leash-walking:step-2",
              label: "Step 2: Slack leash walk",
              prerequisiteLabel: "Loose Leash Step 1",
              sessionHref: "/training/session?step=level-2-llw-2",
              status: "locked",
              target: "20 paces · 3 reps",
            },
          ],
          theoryHref: "/theory/level-2/loose-leash-walking",
        },
      ],
      id: "level-2",
      levelNumber: LEVEL_TWO,
      status: "in_progress",
      title: "Level 2 — Duration & Focus",
    },
    {
      behaviors: [
        {
          id: "crate",
          levelId: "level-3",
          name: "Crate",
          steps: [
            {
              cue: "Cue entry with calm settle inside",
              id: "level-3/crate:step-1",
              label: "Step 1: Calm crate entry",
              sessionHref: "/training/session?step=level-3-crate-1",
              status: "ready",
              target: "30s · 3 reps",
            },
            {
              cue: "Close latch quietly and pause",
              id: "level-3/crate:step-2",
              label: "Step 2: Door-closed settle",
              prerequisiteLabel: "Crate Step 1",
              sessionHref: "/training/session?step=level-3-crate-2",
              status: "locked",
              target: "60s · 2 reps",
            },
          ],
          theoryHref: "/theory/level-3/crate",
        },
        {
          id: "leave-it",
          levelId: "level-3",
          name: "Leave It",
          steps: [
            {
              cue: "Wait for turn away from closed fist",
              id: "level-3/leave-it:step-1",
              label: "Step 1: Closed-fist leave it",
              sessionHref: "/training/session?step=level-3-leave-it-1",
              status: "ready",
              target: "5s · 5 reps",
            },
          ],
          theoryHref: "/theory/level-3/leave-it",
        },
        {
          id: "stay",
          levelId: "level-3",
          name: "Stay",
          steps: [
            {
              cue: "Step briefly past doorway frame",
              id: "level-3/stay:step-1",
              label: "Step 1: Out-of-sight peek",
              prerequisiteLabel: "Level 2 Stay Step 3",
              sessionHref: "/training/session?step=level-3-stay-1",
              status: "locked",
              target: "10s · 3 reps",
            },
          ],
          theoryHref: "/theory/level-3/stay",
        },
      ],
      id: "level-3",
      levelNumber: LEVEL_THREE,
      status: "upcoming",
      title: "Level 3 — Distance & Proofing",
    },
    {
      behaviors: [
        {
          id: "calm-greeting",
          levelId: "level-4",
          name: "Calm Greeting",
          steps: [
            {
              cue: "Hold four paws down as helper approaches",
              id: "level-4/calm-greeting:step-1",
              label: "Step 1: Four-on-the-floor greeting",
              sessionHref: "/training/session?step=level-4-calm-greeting-1",
              status: "ready",
              target: "10s · 3 reps",
            },
            {
              cue: "Wait on mat while door opens",
              id: "level-4/calm-greeting:step-2",
              label: "Step 2: Doorway settle",
              prerequisiteLabel: "Calm Greeting Step 1",
              sessionHref: "/training/session?step=level-4-calm-greeting-2",
              status: "locked",
              target: "30s · 2 reps",
            },
          ],
          theoryHref: "/theory/level-4/calm-greeting",
        },
        {
          id: "recall",
          levelId: "level-4",
          name: "Recall",
          steps: [
            {
              cue: "Recall on long line in park",
              id: "level-4/recall:step-1",
              label: "Step 1: Long-line park recall",
              prerequisiteLabel: "Level 2 Recall Step 3",
              sessionHref: "/training/session?step=level-4-recall-1",
              status: "locked",
              target: "30 ft · 3 reps",
            },
          ],
          theoryHref: "/theory/level-4/recall",
        },
      ],
      id: "level-4",
      levelNumber: LEVEL_FOUR,
      status: "upcoming",
      title: "Level 4 — Real-World Reliability",
    },
  ],
  recommended: {
    behaviorId: "stay",
    behaviorName: "Stay",
    cue: "Build duration in quiet room — 2 of 3 reps complete",
    levelId: "level-2",
    levelTitle: "Level 2",
    sessionHref: "/training/session",
    stepId: "level-2/stay:step-2",
    stepLabel: "Step 2: Duration stay",
    target: "15s duration · 3 reps",
    theoryHref: "/theory/level-2/stay",
  },
};

function countBehaviorProgress(behavior: TrainingBehavior): { completed: number; total: number } {
  const completed = behavior.steps.filter((step) => step.status === "completed").length;
  return {
    completed,
    total: behavior.steps.length,
  };
}

function countLevelProgress(level: TrainingLevel): {
  completed: number;
  percentage: number;
  total: number;
} {
  let completed = 0;
  let total = 0;

  for (const behavior of level.behaviors) {
    const progress = countBehaviorProgress(behavior);
    completed += progress.completed;
    total += progress.total;
  }

  const percentage = total === 0 ? 0 : Math.round((completed / total) * PERCENTAGE_SCALE);

  return {
    completed,
    percentage,
    total,
  };
}

function formatStepStatusLabel(step: TrainingStep): string {
  switch (step.status) {
    case "completed":
      return "Completed";
    case "next":
      return "Next";
    case "ready":
      return "Ready";
    case "locked":
      return step.prerequisiteLabel === undefined
        ? "Locked"
        : `Locked: needs ${step.prerequisiteLabel}`;
  }
}

export {
  BARNABY_TRAINING_HUB_DATA,
  countBehaviorProgress,
  countLevelProgress,
  formatStepStatusLabel,
};
