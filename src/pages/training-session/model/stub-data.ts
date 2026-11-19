import type { TrainingSessionStubData } from "./types";

export const TRAINING_SESSION_STUB: TrainingSessionStubData = {
  dogName: "Barnaby",
  levelNumber: 2,
  levelName: "Stay",
  activeStepNumber: 3,
  steps: [
    {
      stepNumber: 1,
      title: "Cue & 5-second hold",
      heading: "Cue & 5-second hold",
      summary: "Ask for a sit or down, give your Stay cue once, and hold still for 5 calm seconds.",
      instructions:
        "Ask for a sit or down, give your Stay cue once, keep shoulders still, and mark before releasing.",
      tryItColdCriteria:
        "Hold a calm 5s Stay on the first cue of the session before any warm-up reps.",
      faqs: [
        {
          question: "Should I repeat the Stay cue if Barnaby looks away?",
          answer:
            "No—as long as he holds his position, looking around is fine. Only reset quietly if he moves out of position.",
        },
        {
          question: "When should I give the treat?",
          answer:
            "Mark and feed while he is still in the Stay position, then give your release cue a moment later.",
        },
      ],
      notes:
        "Keep your shoulders relaxed and reward in position before releasing. Next: Step 2 (One step back).",
      targets: ["5s", "10s"],
      defaultTarget: "5s",
      status: "passed",
      practice_totals: { success: 14, notYet: 2 },
      step_tests: [
        {
          id: "test-step-1",
          stepNumber: 1,
          outcome: "passed",
          target: "5s",
          coldOverride: false,
          testedAt: "Earlier this week",
        },
      ],
    },
    {
      stepNumber: 2,
      title: "One step back",
      heading: "One step back",
      summary: "Cue Stay, take one calm step back for the target hold, then return to reward.",
      instructions:
        "Give the Stay cue, take one calm step back, pause for the target duration, then return to reward in position.",
      tryItColdCriteria:
        "Hold steady for 10s after taking one calm step back on the first cold cue.",
      faqs: [
        {
          question: "What if Barnaby stands up as soon as I step back?",
          answer:
            "Log Not Yet, guide him gently back to the mat or spot, and shorten your step slightly so he succeeds next rep.",
        },
        {
          question: "Should I step back with a hand signal?",
          answer:
            "Keep your hand cue clear and still once given—avoid hovering your hand forward while stepping back.",
        },
      ],
      notes:
        "Previously: Step 1 (Cue & 5-second hold). If your dog breaks early, quietly reset without repeating the cue. Next: Step 3 (Duration ladder at 3 paces).",
      targets: ["5s", "10s", "15s"],
      defaultTarget: "10s",
      status: "passed",
      practice_totals: { success: 11, notYet: 3 },
      step_tests: [
        {
          id: "test-step-2",
          stepNumber: 2,
          outcome: "passed",
          target: "10s",
          coldOverride: false,
          testedAt: "2 days ago",
        },
      ],
    },
    {
      stepNumber: 3,
      title: "Duration ladder at 3 paces",
      heading: "Duration ladder at 3 paces",
      summary:
        "Cue Stay, step 3 paces back while facing Barnaby, and hold steady until you return to reward and release.",
      instructions:
        "Cue Stay, step 3 paces away while facing your dog, hold steady through the target count, then return and release.",
      tryItColdCriteria:
        "Pass one clean 10s Stay at 3 paces on your first cold attempt of the session.",
      faqs: [
        {
          question: "What if Barnaby breaks Stay before the timer finishes?",
          answer:
            "Stay neutral without repeating the cue. Quietly reset him to his spot, tap Not Yet, and let the automatic ladder step back to a shorter hold if needed.",
        },
        {
          question: "When should I mark and reward?",
          answer:
            "Wait until the countdown finishes, walk all the way back to Barnaby's side, mark and treat in position, and then release.",
        },
        {
          question: "How far should 3 paces be?",
          answer:
            "Use three relaxed walking steps straight back with soft shoulders—leaning forward or stepping too fast can pull him out of position.",
        },
      ],
      notes:
        "Came from: Step 2 (One step back at 10s). Aim for ~10 calm reps per session—stop while Barnaby is eager, or log extra reps if he is cruising. Next: Step 4 (Turn sideways & pause).",
      targets: ["5s", "10s", "15s", "20s"],
      defaultTarget: "10s",
      status: "active",
      practice_totals: { success: 7, notYet: 2 },
      step_tests: [],
    },
    {
      stepNumber: 4,
      title: "Turn sideways & pause",
      heading: "Turn sideways & pause",
      summary:
        "Step 3 paces back, turn 90 degrees sideways for the target hold, then face back and reward.",
      instructions:
        "Take 3 paces back, turn 90 degrees for the target duration without dropping posture, then face back and reward.",
      tryItColdCriteria:
        "Hold posture for 10s at 3 paces while turned 90 degrees sideways on a cold cue.",
      faqs: [
        {
          question: "Why does turning sideways make Stay harder?",
          answer:
            "Dogs read shoulder angle as movement toward a release, so turning smoothly without shifting weight toward him helps keep the picture clear.",
        },
        {
          question: "Which direction should I turn?",
          answer:
            "Alternate turning left and right across reps so Barnaby learns to hold steady regardless of which shoulder turns.",
        },
      ],
      notes:
        "Came from: Step 3 (Duration ladder at 3 paces). Keep the turn smooth so shoulder movement does not look like a release cue. Next: Step 5 (Light distraction hold).",
      targets: ["5s", "10s", "15s", "20s"],
      defaultTarget: "10s",
      status: "upcoming",
      practice_totals: { success: 0, notYet: 0 },
      step_tests: [],
    },
    {
      stepNumber: 5,
      title: "Light distraction hold",
      heading: "Light distraction hold",
      summary:
        "Hold a calm Stay at 3 paces during a low-level nearby movement or sound, then return to reward.",
      instructions:
        "Maintain the Stay at 3 paces while a low-level movement or sound occurs nearby, then return to reward and release.",
      tryItColdCriteria:
        "Maintain a 15s Stay at 3 paces during a mild nearby movement or sound on the first cue.",
      faqs: [
        {
          question: "What counts as a light distraction?",
          answer:
            "A soft footstep, tossing a cloth lightly to the side, or a quiet household sound—anything mildly interesting without startling him.",
        },
        {
          question: "What if he watches the distraction without moving?",
          answer:
            "Looking with ears or head while keeping paws and hips planted still counts as Success!",
        },
      ],
      notes:
        "Came from: Step 4 (Turn sideways & pause). Start with low-intensity distractions and reward in position before releasing. Completes Level 2 Stay.",
      targets: ["10s", "15s", "20s"],
      defaultTarget: "15s",
      status: "upcoming",
      practice_totals: { success: 0, notYet: 0 },
      step_tests: [],
    },
  ],
  initialAttempts: [],
};
