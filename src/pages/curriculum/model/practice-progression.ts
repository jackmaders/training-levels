type PracticeOutcome = "success" | "not_yet";
type PracticeMethod =
  | "shape_approximation"
  | "duration_ladder"
  | "change_assistance_then_duration"
  | "repeat_then_duration";

interface PracticeProgression {
  appDefault: string;
  method: PracticeMethod;
  nextTarget: string;
  readinessQuestion: string;
  readyForTest: boolean;
  source: string;
}

interface PracticeProgressionProgress {
  consecutiveSuccesses?: number;
  lastOutcome?: PracticeOutcome;
}

interface ShapeApproximationSpec {
  appDefault: string;
  followUpTarget: string;
  initialTarget: string;
  readinessQuestion: string;
  source: string;
}

const STEP_ONE_SUCCESS_DEFAULT = 3;
const ZEN_DURATION_SECONDS = 5;
const ZEN_ONE_SECOND = 1;
const SECONDS_PER_SUCCESS = 1;
const RETRIEVE_DEFAULT_GRABS = 3;
const RETRIEVE_THREE_GRABS = 3;
const RETRIEVE_TWO_GRABS = 2;

const SHAPE_APPROXIMATION_SPECS: Readonly<Record<string, ShapeApproximationSpec>> = {
  "level-1/zen:step-1": {
    appDefault: `${String(STEP_ONE_SUCCESS_DEFAULT)} successful tries is a suggested point to check readiness; the curriculum does not set a count.`,
    followUpTarget: "Dog moves her nose away from the protected treat while you sit.",
    initialTarget: "Dog moves her nose away from the protected treat while you sit.",
    readinessQuestion: "Does your Dog move her nose away promptly on several tries while seated?",
    source: "Level 1 Zen, Step 1",
  },
  "level-3/retrieve:step-1": {
    appDefault: `${String(STEP_ONE_SUCCESS_DEFAULT)} successful tries is a suggested point to check readiness; the curriculum changes objects as the Dog understands each approximation.`,
    followUpTarget: "Dog puts her mouth around the spoon, then another object as she is ready.",
    initialTarget: "Dog puts her mouth around the pencil.",
    readinessQuestion:
      "Does your Dog willingly put her mouth around each presented object without tugging?",
    source: "Level 3 Retrieve, Step 1",
  },
  "level-3/retrieve:step-4": {
    appDefault: `${String(STEP_ONE_SUCCESS_DEFAULT)} successful tries is a suggested point to check readiness; shape the clockwise turn and step-back before raising criteria.`,
    followUpTarget:
      "Take a small step back as she reaches so she moves forward to put the object in her mouth from your hand.",
    initialTarget:
      "Present the object to your Dog's right so she turns clockwise to put it in her mouth.",
    readinessQuestion:
      "Does your Dog move forward with a clockwise turn to take the object cleanly from your hand?",
    source: "Level 3 Retrieve, Step 4",
  },
  "level-3/retrieve:step-5": {
    appDefault: `${String(STEP_ONE_SUCCESS_DEFAULT)} successful tries across varied items and rooms is a suggested point to check readiness; generalize gradually.`,
    followUpTarget: "Dog picks up and holds varied objects in new rooms and outdoor spaces.",
    initialTarget:
      "Dog puts varied household objects (keys, remote, hat, wallet) into her mouth calmly.",
    readinessQuestion:
      "Does your Dog eagerly pick up and hold different objects in new rooms and locations?",
    source: "Level 3 Retrieve, Step 5",
  },
};

function getPracticeProgression(
  stepId: string,
  progress: PracticeProgressionProgress = {},
): PracticeProgression | null {
  const consecutiveSuccesses =
    progress.lastOutcome === "not_yet" ? 0 : (progress.consecutiveSuccesses ?? 0);
  const shapeSpec = SHAPE_APPROXIMATION_SPECS[stepId];
  if (shapeSpec !== undefined) {
    return createShapeApproximationProgression(shapeSpec, consecutiveSuccesses);
  }

  switch (stepId) {
    case "level-1/zen:step-2": {
      return zenDurationProgression({
        consecutiveSuccesses,
        object: "the treat in your closed fist",
        readinessQuestion:
          "Can your Dog stay away from the closed fist for 5 seconds without touching it?",
        source: "Level 1 Zen, Step 2",
      });
    }
    case "level-1/zen:step-3": {
      return zenStepThreeProgression(consecutiveSuccesses);
    }
    case "level-3/retrieve:step-2": {
      return retrieveStepTwoProgression(consecutiveSuccesses, progress.lastOutcome);
    }
    case "level-3/retrieve:step-3": {
      return retrieveStepThreeProgression(consecutiveSuccesses);
    }
    default: {
      return null;
    }
  }
}

function countTrailingSuccesses(attempts: readonly { outcome: PracticeOutcome }[]): number {
  let count = 0;
  for (const attempt of attempts.toReversed()) {
    if (attempt.outcome !== "success") {
      return count;
    }
    count += 1;
  }
  return count;
}

function clampSeconds(rawSeconds: number): number {
  return Math.min(ZEN_DURATION_SECONDS, Math.max(0, rawSeconds));
}

function createShapeApproximationProgression(
  spec: ShapeApproximationSpec,
  consecutiveSuccesses: number,
): PracticeProgression {
  return {
    appDefault: spec.appDefault,
    method: "shape_approximation",
    nextTarget: consecutiveSuccesses === 0 ? spec.initialTarget : spec.followUpTarget,
    readinessQuestion: spec.readinessQuestion,
    readyForTest: consecutiveSuccesses >= STEP_ONE_SUCCESS_DEFAULT,
    source: spec.source,
  };
}

function zenDurationProgression({
  consecutiveSuccesses,
  object,
  readinessQuestion,
  source,
}: {
  consecutiveSuccesses: number;
  object: string;
  readinessQuestion: string;
  source: string;
}): PracticeProgression {
  const seconds = clampSeconds(ZEN_ONE_SECOND + consecutiveSuccesses * SECONDS_PER_SUCCESS);

  return {
    appDefault:
      "The next duration starts at 1 second and adds 1 second after each recorded success, up to the 5-second criterion.",
    method: "duration_ladder",
    nextTarget: `Dog stays away from ${object} for ${String(seconds)} ${seconds === 1 ? "second" : "seconds"}.`,
    readinessQuestion,
    readyForTest: seconds === ZEN_DURATION_SECONDS,
    source,
  };
}

function zenStepThreeProgression(consecutiveSuccesses: number): PracticeProgression {
  const duration = zenDurationProgression({
    consecutiveSuccesses,
    object: "the treat in your open hand",
    readinessQuestion:
      "Can your Dog keep her nose away when the treat is visible in your open hand?",
    source: "Level 1 Zen, Step 3",
  });

  return { ...duration, method: "change_assistance_then_duration" };
}

function retrieveStepTwoProgression(
  consecutiveSuccesses: number,
  lastOutcome: PracticeOutcome | undefined,
): PracticeProgression {
  const requiredGrabs =
    lastOutcome === "not_yet" || consecutiveSuccesses >= RETRIEVE_DEFAULT_GRABS
      ? RETRIEVE_THREE_GRABS
      : RETRIEVE_TWO_GRABS;
  const seconds = clampSeconds((consecutiveSuccesses - 1) * SECONDS_PER_SUCCESS);
  const duration =
    seconds === 0
      ? "then build the hold toward 5 seconds"
      : `then hold for ${String(seconds)} seconds`;

  return {
    appDefault:
      "Start with two grabs, increase to three if the let-go is not shortening, then ladder the hold toward the 5-second criterion.",
    method: "repeat_then_duration",
    nextTarget: `Dog makes ${String(requiredGrabs)} grabs with you, ${duration}.`,
    readinessQuestion: "Can your Dog keep the pencil in her mouth with you for 5 seconds?",
    readyForTest: seconds === ZEN_DURATION_SECONDS,
    source: "Level 3 Retrieve, Step 2",
  };
}

function getStepThreeTarget(consecutiveSuccesses: number): {
  nextTarget: string;
  readyForTest: boolean;
} {
  if (consecutiveSuccesses === 0) {
    return {
      nextTarget: "You and the Dog hold the object together for 15 seconds.",
      readyForTest: false,
    };
  }
  if (consecutiveSuccesses === 1) {
    return {
      nextTarget:
        "Hold together 5 seconds, lift your finger for a quarter second, then hold together 5 seconds.",
      readyForTest: false,
    };
  }
  const soloSeconds = clampSeconds(consecutiveSuccesses - 1);
  return {
    nextTarget: `Hold together 5 seconds, Dog holds alone for ${String(soloSeconds)} ${soloSeconds === 1 ? "second" : "seconds"} with Thank You, then hold together 5 seconds.`,
    readyForTest: soloSeconds === ZEN_DURATION_SECONDS,
  };
}

function retrieveStepThreeProgression(consecutiveSuccesses: number): PracticeProgression {
  return {
    appDefault:
      "Reach a 15-second shared hold, lift a finger for a quarter second, then ladder solo hold from 1 to 5 seconds with Thank You.",
    method: "change_assistance_then_duration",
    ...getStepThreeTarget(consecutiveSuccesses),
    readinessQuestion:
      "Can your Dog hold the object together for 5 seconds, alone for 5 seconds on Thank You, and together for 5 more seconds?",
    source: "Level 3 Retrieve, Step 3",
  };
}

export { countTrailingSuccesses, getPracticeProgression };
export type { PracticeProgression, PracticeProgressionProgress, PracticeMethod };
