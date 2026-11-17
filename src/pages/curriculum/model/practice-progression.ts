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

const STEP_ONE_SUCCESS_DEFAULT = 3;
const ZEN_DURATION_SECONDS = 5;
const ZEN_ONE_SECOND = 1;
const SECONDS_PER_SUCCESS = 1;
const RETRIEVE_DEFAULT_GRABS = 3;
const RETRIEVE_THREE_GRABS = 3;
const RETRIEVE_TWO_GRABS = 2;

function getPracticeProgression(
  stepId: string,
  progress: PracticeProgressionProgress = {},
): PracticeProgression | null {
  const consecutiveSuccesses =
    progress.lastOutcome === "not_yet" ? 0 : (progress.consecutiveSuccesses ?? 0);

  switch (stepId) {
    case "level-1/zen:step-1": {
      return zenStepOneProgression(consecutiveSuccesses);
    }
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
    case "level-3/retrieve:step-1": {
      return retrieveStepOneProgression(consecutiveSuccesses);
    }
    case "level-3/retrieve:step-2": {
      return retrieveStepTwoProgression(consecutiveSuccesses, progress.lastOutcome);
    }
    default: {
      return null;
    }
  }
}

function zenStepOneProgression(consecutiveSuccesses: number): PracticeProgression {
  return {
    appDefault: `${String(STEP_ONE_SUCCESS_DEFAULT)} successful tries is a suggested point to check readiness; the curriculum does not set a count.`,
    method: "shape_approximation",
    nextTarget: "Dog moves her nose away from the protected treat while you sit.",
    readinessQuestion: "Does your Dog move her nose away promptly on several tries while seated?",
    readyForTest: consecutiveSuccesses >= STEP_ONE_SUCCESS_DEFAULT,
    source: "Level 1 Zen, Step 1",
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
  const seconds = Math.min(
    ZEN_DURATION_SECONDS,
    ZEN_ONE_SECOND + consecutiveSuccesses * SECONDS_PER_SUCCESS,
  );

  return {
    appDefault:
      "The next duration starts at 1 second and adds 1 second after each recorded success, up to the 5-second criterion.",
    method: "duration_ladder",
    nextTarget: `Dog stays away from ${object} for ${String(seconds)} ${seconds === 1 ? "second" : "seconds"}.`,
    readinessQuestion,
    readyForTest: seconds === ZEN_DURATION_SECONDS && consecutiveSuccesses > 0,
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

function retrieveStepOneProgression(consecutiveSuccesses: number): PracticeProgression {
  return {
    appDefault: `${String(STEP_ONE_SUCCESS_DEFAULT)} successful tries is a suggested point to check readiness; the curriculum changes objects as the Dog understands each approximation.`,
    method: "shape_approximation",
    nextTarget:
      consecutiveSuccesses === 0
        ? "Dog puts her mouth around the pencil."
        : "Dog puts her mouth around the spoon, then another object as she is ready.",
    readinessQuestion:
      "Does your Dog willingly put her mouth around each presented object without tugging?",
    readyForTest: consecutiveSuccesses >= STEP_ONE_SUCCESS_DEFAULT,
    source: "Level 3 Retrieve, Step 1",
  };
}

function retrieveStepTwoProgression(
  consecutiveSuccesses: number,
  lastOutcome: PracticeOutcome | undefined,
): PracticeProgression {
  const requiredGrabs =
    lastOutcome === "not_yet" || consecutiveSuccesses >= RETRIEVE_DEFAULT_GRABS
      ? RETRIEVE_THREE_GRABS
      : RETRIEVE_TWO_GRABS;
  const seconds = Math.min(
    ZEN_DURATION_SECONDS,
    Math.max(0, consecutiveSuccesses - 1) * SECONDS_PER_SUCCESS,
  );
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

export { getPracticeProgression };
export type { PracticeProgression, PracticeProgressionProgress, PracticeMethod };
