import { describe, expect, it } from "vite-plus/test";

import type { CurriculumSyllabus, LevelNumber } from "@/shared/curriculum-data";
import { getCurriculumSyllabus } from "@/shared/curriculum-data/index.server";

import type {
  TrainingOverview,
  TrainingOverviewAttempt,
  TrainingOverviewCompletion,
  TrainingOverviewDecision,
  TrainingOverviewStepTest,
  TrainingOverviewTotal,
} from "../../api/recommendation-service";
import {
  getCurrentLevelNumber,
  getTrainingFallbackGuidance,
  inspectManualStepSelection,
  isStepTestable,
  recommendNextTrainingActivity,
} from "../training-recommendation";

const FULL_SYLLABUS = getCurriculumSyllabus();
const LEVEL_TWO: LevelNumber = 2;
const LEVEL_THREE: LevelNumber = 3;
const LEVEL_FOUR: LevelNumber = 4;
const TOTAL_MAIN_QUEST_STEPS = 235;
const ONE_DAY_MS = 86_400_000;
const ONE_SECOND_MS = 1000;

function emptyOverview(overrides: Partial<TrainingOverview> = {}): TrainingOverview {
  return {
    activeDog: null,
    curriculumProgress: [],
    practiceAttempts: [],
    practiceTotals: [],
    stepDecisions: [],
    stepTests: [],
    ...overrides,
  };
}

function makeAttempt(
  stepId: string,
  createdAt: Date,
  overrides: Partial<TrainingOverviewAttempt> = {},
): TrainingOverviewAttempt {
  return {
    attemptId: `att-${stepId}-${String(createdAt.getTime())}`,
    createdAt,
    outcome: "success",
    stepId,
    target: "",
    undoneAt: null,
    ...overrides,
  };
}

function makeConsecutiveSuccessAttempts(
  stepId: string,
  startAt: Date,
  count: number,
): TrainingOverviewAttempt[] {
  const startMs = startAt.getTime();
  const attempts: TrainingOverviewAttempt[] = [];
  for (let index = 0; index < count; index += 1) {
    attempts.push(makeAttempt(stepId, new Date(startMs + index * ONE_SECOND_MS)));
  }
  return attempts;
}

function makeDecision(
  stepId: string,
  decidedAt: Date,
  decision: TrainingOverviewDecision["decision"],
): TrainingOverviewDecision {
  return { decidedAt, decision, stepId };
}

function makeStepTest(
  stepId: string,
  testedAt: Date,
  outcome: TrainingOverviewStepTest["outcome"],
): TrainingOverviewStepTest {
  return {
    coldOverride: false,
    outcome,
    stepId,
    testId: `test-${stepId}-${String(testedAt.getTime())}`,
    testedAt,
  };
}

function makeTotal(stepId: string, createdAt: Date): TrainingOverviewTotal {
  return {
    createdAt,
    notYetCount: 0,
    recordId: `tot-${stepId}-${String(createdAt.getTime())}`,
    stepId,
    successCount: 1,
    target: "",
  };
}

function getLevelStepIds(levelNumbers: readonly LevelNumber[]): string[] {
  const allowed = new Set(levelNumbers);
  return FULL_SYLLABUS.sections
    .filter((section) => section.levelNumber !== undefined && allowed.has(section.levelNumber))
    .flatMap((section) =>
      section.pages
        .filter((page) => page.kind === "behavior")
        .flatMap((page) => page.stepIds ?? []),
    );
}

function getNonLevelStepIds(): Set<string> {
  return new Set(
    FULL_SYLLABUS.sections
      .filter((section) => section.levelNumber === undefined)
      .flatMap((section) => section.pages.flatMap((page) => page.stepIds ?? [])),
  );
}

function partitionMainQuestTestability(): {
  allSteps: string[];
  expectedTestable: string[];
  stepFiveIds: string[];
  tricksStepIds: string[];
} {
  const allSteps = getLevelStepIds([1, LEVEL_TWO, LEVEL_THREE, LEVEL_FOUR]);
  return {
    allSteps,
    expectedTestable: allSteps.filter(
      (stepId) => !stepId.endsWith(":step-5") && !stepId.startsWith("level-2/tricks:"),
    ),
    stepFiveIds: allSteps.filter((stepId) => stepId.endsWith(":step-5")),
    tricksStepIds: allSteps.filter((stepId) => stepId.startsWith("level-2/tricks:")),
  };
}

function buildRotationTotals(
  levelOneIds: readonly string[],
  earlier: Date,
  later: Date,
): TrainingOverviewTotal[] {
  return levelOneIds.map((stepId) =>
    makeTotal(stepId, stepId === "level-1/sit:step-1" ? earlier : later),
  );
}

function buildUntouchedExclusionTotals(
  levelOneIds: readonly string[],
  earlier: Date,
): TrainingOverviewTotal[] {
  return levelOneIds
    .filter((stepId) => stepId !== "level-1/sit:step-2")
    .map((stepId, index) => makeTotal(stepId, new Date(earlier.getTime() + index * ONE_SECOND_MS)));
}

function toCompletions(
  stepIds: readonly string[],
  completedAt: Date,
): TrainingOverviewCompletion[] {
  return stepIds.map((stepId) => ({ completedAt, stepId }));
}

describe("current level tracking", () => {
  it("progresses sequentially from Level 1 through Level 4 and stays at Level 4 when complete", () => {
    expect.assertions(5);
    const levelOneIds = getLevelStepIds([1]);
    const levelTwoIds = getLevelStepIds([LEVEL_TWO]);
    const levelThreeIds = getLevelStepIds([LEVEL_THREE]);
    const allMainQuestIds = getLevelStepIds([1, LEVEL_TWO, LEVEL_THREE, LEVEL_FOUR]);

    expect(getCurrentLevelNumber(FULL_SYLLABUS, new Set())).toBe(1);
    expect(getCurrentLevelNumber(FULL_SYLLABUS, new Set(levelOneIds))).toBe(LEVEL_TWO);
    expect(getCurrentLevelNumber(FULL_SYLLABUS, new Set([...levelOneIds, ...levelTwoIds]))).toBe(
      LEVEL_THREE,
    );
    expect(
      getCurrentLevelNumber(
        FULL_SYLLABUS,
        new Set([...levelOneIds, ...levelTwoIds, ...levelThreeIds]),
      ),
    ).toBe(LEVEL_FOUR);
    expect(getCurrentLevelNumber(FULL_SYLLABUS, new Set(allMainQuestIds))).toBe(LEVEL_FOUR);
  });

  it("ignores incomplete Homework and Comeafters sections when computing current level", () => {
    expect.assertions(1);
    const levelOneIds = getLevelStepIds([1]);
    const nonLevelIds = getNonLevelStepIds();
    const completedIds = new Set(levelOneIds.filter((id) => !nonLevelIds.has(id)));

    expect(getCurrentLevelNumber(FULL_SYLLABUS, completedIds)).toBe(LEVEL_TWO);
  });
});

describe("step testability checks", () => {
  it("matches testability rules across all 235 Main Quest steps and rejects invalid IDs", () => {
    expect.assertions(5);
    const { allSteps, expectedTestable, stepFiveIds, tricksStepIds } =
      partitionMainQuestTestability();

    expect(allSteps).toHaveLength(TOTAL_MAIN_QUEST_STEPS);
    expect(stepFiveIds.every((stepId) => !isStepTestable(stepId))).toBe(true);
    expect(tricksStepIds.every((stepId) => !isStepTestable(stepId))).toBe(true);
    expect(expectedTestable.every((stepId) => isStepTestable(stepId))).toBe(true);
    expect([
      isStepTestable(""),
      isStepTestable("unknown/behavior:step-1"),
      isStepTestable("level-1/zen:step-6"),
      isStepTestable("homework/overview:step-1"),
    ]).toStrictEqual([false, false, false, false]);
  });
});

describe("training fallback guidance", () => {
  it("prefers formatted heading, falls back to trimmed label, then fallbackLabel", () => {
    expect.assertions(4);
    expect(
      getTrainingFallbackGuidance(
        { heading: "Step 1: Nose moves away  ", label: "Ignored label" },
        "Fallback",
      ),
    ).toBe("Nose moves away");
    expect(
      getTrainingFallbackGuidance(
        { heading: "Step 2:", label: "  Hold closed fist  " },
        "Fallback",
      ),
    ).toBe("Hold closed fist");
    expect(getTrainingFallbackGuidance({ label: "   " }, "Fallback")).toBe("Fallback");
    expect(getTrainingFallbackGuidance(undefined, "Fallback")).toBe("Fallback");
  });
});

describe("manual step selection inspection", () => {
  it("flags unmet prerequisites and later-level picks while treating co-practice as non-blocking", () => {
    expect.assertions(5);
    const levelOneIds = getLevelStepIds([1]);
    const completedLevelOne = new Set(levelOneIds);

    expect(
      inspectManualStepSelection({
        completedStepIds: new Set(),
        currentLevelNumber: 1,
        pageSlug: "level-1/target",
        syllabus: FULL_SYLLABUS,
      }),
    ).toStrictEqual({
      hasWarning: true,
      isLaterLevel: false,
      selectedLevelNumber: 1,
      unmetPrerequisites: [
        { pageSlug: "level-1/zen", title: "Zen" },
        { pageSlug: "level-1/come", title: "Come" },
        { pageSlug: "level-1/sit", title: "Sit" },
      ],
    });

    expect(
      inspectManualStepSelection({
        completedStepIds: completedLevelOne,
        currentLevelNumber: LEVEL_TWO,
        pageSlug: "level-2/relax",
        syllabus: FULL_SYLLABUS,
      }),
    ).toStrictEqual({
      hasWarning: false,
      isLaterLevel: false,
      selectedLevelNumber: LEVEL_TWO,
      unmetPrerequisites: [],
    });

    const goToMatMissingDown = inspectManualStepSelection({
      completedStepIds: completedLevelOne,
      currentLevelNumber: LEVEL_TWO,
      pageSlug: "level-2/go-to-mat",
      syllabus: FULL_SYLLABUS,
    });
    expect(goToMatMissingDown.unmetPrerequisites).toStrictEqual([
      { pageSlug: "level-2/down", title: "Down" },
    ]);

    expect(
      inspectManualStepSelection({
        completedStepIds: completedLevelOne,
        currentLevelNumber: 1,
        pageSlug: "level-2/zen",
        syllabus: FULL_SYLLABUS,
      }),
    ).toStrictEqual({
      hasWarning: true,
      isLaterLevel: true,
      selectedLevelNumber: LEVEL_TWO,
      unmetPrerequisites: [],
    });

    expect(
      inspectManualStepSelection({
        completedStepIds: new Set(),
        currentLevelNumber: 1,
        pageSlug: "unknown/page",
        syllabus: FULL_SYLLABUS,
      }),
    ).toStrictEqual({
      hasWarning: false,
      isLaterLevel: false,
      selectedLevelNumber: null,
      unmetPrerequisites: [],
    });
  });
});

describe("next training activity recommendation", () => {
  const dayOne = new Date("2026-04-01T10:00:00Z");
  const dayOneEarlier = new Date(dayOne.getTime() - ONE_SECOND_MS);
  const dayTwo = new Date("2026-04-02T10:00:00Z");
  const dayTwoSecond = new Date(dayTwo.getTime() + ONE_SECOND_MS);
  const dayThree = new Date("2026-04-03T10:00:00Z");
  const dayFour = new Date("2026-04-04T10:00:00Z");

  it("recommends Level 1 Zen Step 1 practice for a never-trained user", () => {
    expect.assertions(1);
    const recommendation = recommendNextTrainingActivity({
      overview: emptyOverview(),
      syllabus: FULL_SYLLABUS,
    });

    expect(recommendation).toStrictEqual({
      behaviorTitle: "Zen",
      currentLevelNumber: 1,
      fallbackMode: "none",
      levelNumber: 1,
      mode: "practice",
      pageSlug: "level-1/zen",
      reason:
        "Recommended next in Level 1 because its prerequisites are complete and it has not been practiced yet.",
      stepId: "level-1/zen:step-1",
      stepLabel: "Step 1: Dog moves away from a treat in your hand. You're sitting down.",
      waitingTestNotice: null,
    });
  });

  it("prioritizes cold Test from recommend_test decisions on testable steps and ignores non-testable steps", () => {
    expect.assertions(2);
    const recommendation = recommendNextTrainingActivity({
      now: dayTwo,
      overview: emptyOverview({
        stepDecisions: [
          makeDecision("level-1/zen:step-5", dayOne, "recommend_test"),
          makeDecision("level-1/zen:step-1", dayOne, "recommend_test"),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });

    expect(recommendation.mode).toBe("test");
    expect(recommendation).toMatchObject({
      pageSlug: "level-1/zen",
      reason:
        "You marked this step ready for a cold Test, and no practice or test has happened today.",
      stepId: "level-1/zen:step-1",
      waitingTestNotice: null,
    });
  });

  it("defers a ready Test made today with waitingTestNotice, rotates Practice, and surfaces Test the next day", () => {
    expect.assertions(4);
    const overview = emptyOverview({
      practiceAttempts: [makeAttempt("level-1/zen:step-1", dayOne)],
    });

    const sameDay = recommendNextTrainingActivity({
      now: dayOne,
      overview,
      syllabus: FULL_SYLLABUS,
    });
    expect(sameDay.mode).toBe("practice");
    expect(sameDay.stepId).toBe("level-1/zen:step-2");
    expect(sameDay.waitingTestNotice).toStrictEqual({
      behaviorTitle: "Zen",
      pageSlug: "level-1/zen",
      reason:
        "This step is ready for a cold Test, but Practice or a Test already happened today—wait for a fresh day before testing cold.",
      stepId: "level-1/zen:step-1",
      stepLabel: "Step 1: Dog moves away from a treat in your hand. You're sitting down.",
    });

    const nextDay = recommendNextTrainingActivity({
      now: new Date(dayOne.getTime() + ONE_DAY_MS),
      overview,
      syllabus: FULL_SYLLABUS,
    });
    expect(nextDay).toMatchObject({
      mode: "test",
      reason:
        "Recent Practice reached the readiness target on an earlier day, so this step is ready for a cold Test today.",
      stepId: "level-1/zen:step-1",
      waitingTestNotice: null,
    });
  });

  it("suppresses Test readiness on keep_practicing or not_yet test until re-earned", () => {
    expect.assertions(5);
    const keepPracticing = recommendNextTrainingActivity({
      now: dayThree,
      overview: emptyOverview({
        practiceAttempts: [
          makeAttempt("level-1/zen:step-1", dayOne),
          makeAttempt("level-1/zen:step-1", dayOne, {
            attemptId: "att-undone",
            undoneAt: dayOne,
          }),
        ],
        stepDecisions: [makeDecision("level-1/zen:step-1", dayTwo, "keep_practicing")],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(keepPracticing.mode).toBe("practice");

    const reEarnedAfterKeepPracticing = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        practiceAttempts: [
          makeAttempt("level-1/zen:step-1", dayOne),
          makeAttempt("level-1/zen:step-1", dayThree),
        ],
        stepDecisions: [makeDecision("level-1/zen:step-1", dayTwo, "keep_practicing")],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(reEarnedAfterKeepPracticing).toMatchObject({
      mode: "test",
      stepId: "level-1/zen:step-1",
    });

    const suppressedByNotYetTest = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        practiceAttempts: [
          makeAttempt("level-1/zen:step-1", dayOne),
          makeAttempt("level-1/zen:step-1", dayOneEarlier),
        ],
        stepDecisions: [
          makeDecision("level-1/zen:step-1", dayTwo, "recommend_test"),
          makeDecision("level-1/zen:step-1", dayOne, "keep_practicing"),
        ],
        stepTests: [makeStepTest("level-1/zen:step-1", dayTwo, "not_yet")],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(suppressedByNotYetTest.mode).toBe("practice");

    const suppressedAttemptOnlyByNotYetTest = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        practiceAttempts: [makeAttempt("level-1/zen:step-1", dayOne)],
        stepTests: [
          makeStepTest("level-1/zen:step-1", dayTwo, "not_yet"),
          makeStepTest("level-1/zen:step-1", dayOne, "success"),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(suppressedAttemptOnlyByNotYetTest.mode).toBe("practice");

    const reEarnedAfterNotYetTest = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        practiceAttempts: [
          makeAttempt("level-1/zen:step-1", dayOne),
          makeAttempt("level-1/zen:step-1", dayThree),
        ],
        stepTests: [
          makeStepTest("level-1/zen:step-1", dayOne, "success"),
          makeStepTest("level-1/zen:step-1", dayTwo, "not_yet"),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(reEarnedAfterNotYetTest).toMatchObject({
      mode: "test",
      stepId: "level-1/zen:step-1",
    });
  });

  it("evaluates ladder readiness across Level 3 Crate steps", () => {
    expect.assertions(5);
    const priorLevels = toCompletions(getLevelStepIds([1, LEVEL_TWO]), dayOne);

    const crateEmptyTarget = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [makeAttempt("level-3/crate:step-2", dayOne, { target: "" })],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(crateEmptyTarget.mode).toBe("practice");

    const crateEarlierTarget = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/crate:step-2", dayOne, { target: "2 feet · 15 seconds" }),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(crateEarlierTarget.mode).toBe("practice");

    const cratePenultimateTarget = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/crate:step-2", dayOne, { target: "4 feet · 45 seconds" }),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(cratePenultimateTarget.mode).toBe("practice");

    const crateFinalTarget = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/crate:step-2", dayOne, { target: "5 feet · 60 seconds" }),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(crateFinalTarget).toMatchObject({
      mode: "test",
      stepId: "level-3/crate:step-2",
    });

    const crateFinalMissed = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/crate:step-2", dayOne, {
            outcome: "not_yet",
            target: "5 feet · 60 seconds",
          }),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(crateFinalMissed.mode).toBe("practice");
  });

  it("evaluates progression readiness and not_yet resets across Level 3 Retrieve and non-progression steps", () => {
    expect.assertions(3);
    const priorLevels = toCompletions(getLevelStepIds([1, LEVEL_TWO]), dayOne);

    const retrieveProgressionReady = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/zen:step-1", dayOne),
          makeAttempt("level-3/retrieve:step-1", dayOne, { outcome: "not_yet" }),
          makeAttempt("level-3/retrieve:step-1", dayTwo, {
            target: "Put her mouth calmly around the pen or pencil on Yes.",
          }),
          makeAttempt("level-3/retrieve:step-1", dayTwoSecond, {
            target: "Put her mouth calmly around the spoon on Yes.",
          }),
          makeAttempt("level-3/retrieve:step-1", dayThree, {
            target: "Put her mouth calmly around a third safe object on Yes without tugging.",
          }),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(retrieveProgressionReady).toMatchObject({
      mode: "test",
      stepId: "level-3/retrieve:step-1",
    });

    const zenThreeNoProgression = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [makeAttempt("level-3/zen:step-1", dayOne)],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(zenThreeNoProgression.mode).toBe("practice");

    const retrieveResetAfterNotYet = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/retrieve:step-1", dayOne),
          makeAttempt("level-3/retrieve:step-1", dayOneEarlier),
        ],
        stepTests: [makeStepTest("level-3/retrieve:step-1", dayTwo, "not_yet")],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(retrieveResetAfterNotYet.mode).toBe("practice");
  });

  it("aligns Level 3 Retrieve Step 2 test readiness across guidance rungs and progression successes", () => {
    expect.assertions(4);
    const priorLevels = toCompletions(getLevelStepIds([1, LEVEL_TWO]), dayOne);

    const readyFromFinalGuidanceRung = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/retrieve:step-2", dayOne, {
            target: "Complete 2 to 3 calm shared grabs on Get It without tugging.",
          }),
          makeAttempt("level-3/retrieve:step-2", dayTwo, {
            target: "Hold the object together for 1 second, then 2 seconds on Get It.",
          }),
          makeAttempt("level-3/retrieve:step-2", dayTwoSecond, {
            target: "Hold the object together for 3 seconds, then 4 seconds on Get It.",
          }),
          makeAttempt("level-3/retrieve:step-2", dayThree, {
            target: "Hold the object together for 5 seconds on Get It.",
          }),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(readyFromFinalGuidanceRung).toMatchObject({
      mode: "test",
      stepId: "level-3/retrieve:step-2",
    });

    const fiveSuccessesAfterNotYet = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/retrieve:step-2", dayOne, { outcome: "not_yet" }),
          ...makeConsecutiveSuccessAttempts("level-3/retrieve:step-2", dayTwo, 5),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(fiveSuccessesAfterNotYet.mode).toBe("practice");

    const sixSuccessesAfterNotYet = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/retrieve:step-2", dayOne, { outcome: "not_yet" }),
          ...makeConsecutiveSuccessAttempts("level-3/retrieve:step-2", dayTwo, 6),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(sixSuccessesAfterNotYet).toMatchObject({
      mode: "test",
      stepId: "level-3/retrieve:step-2",
    });

    const trailingNotYetNotReady = recommendNextTrainingActivity({
      now: dayFour,
      overview: emptyOverview({
        curriculumProgress: priorLevels,
        practiceAttempts: [
          makeAttempt("level-3/retrieve:step-2", dayOne),
          makeAttempt("level-3/retrieve:step-2", dayTwo),
          makeAttempt("level-3/retrieve:step-2", dayThree, { outcome: "not_yet" }),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(trailingNotYetNotReady.mode).toBe("practice");
  });

  it("rotates Practice to untouched and least recently trained eligible Behavior steps", () => {
    expect.assertions(2);
    const levelOneIds = getLevelStepIds([1]);
    const practicedEarlier = new Date("2026-04-01T08:00:00Z");
    const practicedLater = new Date("2026-04-01T12:00:00Z");

    const untouchedFirst = recommendNextTrainingActivity({
      now: dayTwo,
      overview: emptyOverview({
        practiceTotals: buildUntouchedExclusionTotals(levelOneIds, practicedEarlier),
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(untouchedFirst).toMatchObject({
      mode: "practice",
      stepId: "level-1/sit:step-2",
    });

    const oldestTrainedNext = recommendNextTrainingActivity({
      now: dayTwo,
      overview: emptyOverview({
        practiceTotals: [
          makeTotal("level-1/zen:step-1", practicedLater),
          makeTotal("level-1/zen:step-1", practicedEarlier),
          ...buildRotationTotals(levelOneIds, practicedEarlier, practicedLater),
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(oldestTrainedNext).toMatchObject({
      mode: "practice",
      reason:
        "Recommended next in Level 1 to rotate Practice across Behaviors using the least recently trained eligible step.",
      stepId: "level-1/sit:step-1",
    });
  });

  it("handles all_complete, all_blocked, empty syllabus, and malformed syllabus metadata", () => {
    expect.assertions(5);
    const allMainQuestIds = getLevelStepIds([1, LEVEL_TWO, LEVEL_THREE, LEVEL_FOUR]);
    const allComplete = recommendNextTrainingActivity({
      now: dayThree,
      overview: emptyOverview({
        curriculumProgress: toCompletions(allMainQuestIds, dayOne),
        practiceTotals: [makeTotal("level-1/zen:step-1", dayTwo)],
      }),
      syllabus: FULL_SYLLABUS,
    });
    expect(allComplete).toMatchObject({
      currentLevelNumber: LEVEL_FOUR,
      levelNumber: 1,
      mode: "practice",
      reason: "All Main Quest levels are complete; revisit this step to maintain fluency.",
      stepId: "level-1/zen:step-2",
    });

    const blockedSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-2",
          levelNumber: LEVEL_TWO,
          pages: [
            {
              href: "/curriculum/level-2/zen",
              kind: "behavior",
              levelNumber: LEVEL_TWO,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-2",
              stepIds: ["level-1/zen:step-1"],
              title: "Zen",
            },
          ],
          sectionSlug: "level-2",
          title: "Level 2",
        },
        {
          href: "/curriculum/level-1",
          pages: [],
          sectionSlug: "level-1",
          title: "Missing level number",
        },
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/overview",
              kind: "overview",
              levelNumber: 1,
              order: 0,
              pageSlug: "level-1/overview",
              sectionSlug: "level-1",
              title: "Overview",
            },
            {
              href: "/curriculum/level-1/come",
              kind: "behavior",
              levelNumber: 1,
              order: 2,
              pageSlug: "level-1/come",
              sectionSlug: "level-1",
              stepIds: ["level-1/come:step-3", "custom-step-without-suffix"],
              title: "Come",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 2,
      totalPages: 3,
      totalSteps: 3,
    };

    const allBlocked = recommendNextTrainingActivity({
      now: dayTwo,
      overview: emptyOverview(),
      syllabus: blockedSyllabus,
    });
    expect(allBlocked).toStrictEqual({
      behaviorTitle: "Come",
      currentLevelNumber: 1,
      fallbackMode: "all_blocked",
      levelNumber: 1,
      mode: "practice",
      pageSlug: "level-1/come",
      reason:
        "All remaining steps in Level 1 have unmet prerequisites, so Practice rotates to the least recently trained step.",
      stepId: "custom-step-without-suffix",
      stepLabel: "Step 1",
      waitingTestNotice: null,
    });

    const partialSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/come",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/come",
              sectionSlug: "level-1",
              stepIds: ["level-1/come:step-1"],
              title: "Come",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 1,
      totalPages: 1,
      totalSteps: 1,
    };
    expect(
      recommendNextTrainingActivity({
        now: dayTwo,
        overview: emptyOverview(),
        syllabus: partialSyllabus,
      }).stepId,
    ).toBe("level-1/come:step-1");

    const allCompleteMultiLevel = recommendNextTrainingActivity({
      now: dayTwo,
      overview: emptyOverview({
        curriculumProgress: toCompletions(
          ["level-1/come:step-3", "custom-step-without-suffix", "level-1/zen:step-1"],
          dayOne,
        ),
      }),
      syllabus: blockedSyllabus,
    });
    expect(allCompleteMultiLevel.stepId).toBe("custom-step-without-suffix");

    const emptySyllabus: CurriculumSyllabus = {
      sections: [],
      totalBehaviors: 0,
      totalPages: 0,
      totalSteps: 0,
    };
    expect(() =>
      recommendNextTrainingActivity({
        now: dayOne,
        overview: emptyOverview(),
        syllabus: emptySyllabus,
      }),
    ).toThrow("No Main Quest Behavior steps are available to recommend.");
  });

  it("returns practice when a testable step has blank criterion without guidance", () => {
    expect.assertions(1);

    const blankCriterionSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/come",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/come",
              sectionSlug: "level-1",
              stepIds: ["level-1/come:step-1"],
              stepSummaries: [
                {
                  label: "   ",
                  stepId: "level-1/come:step-1",
                  stepNumber: 1,
                },
              ],
              title: "Come",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 1,
      totalPages: 1,
      totalSteps: 1,
    };

    const overview = emptyOverview({
      practiceAttempts: [makeAttempt("level-1/come:step-1", dayOne)],
    });
    expect(
      recommendNextTrainingActivity({
        now: dayTwo,
        overview,
        syllabus: blankCriterionSyllabus,
      }).mode,
    ).toBe("practice");
  });

  it("defers same-day cold Test eligibility when now is null (SSR snapshot)", () => {
    expect.assertions(2);

    const ssrRecommendation = recommendNextTrainingActivity({
      now: null,
      overview: emptyOverview({
        stepDecisions: [
          { decidedAt: dayOne, decision: "recommend_test", stepId: "level-1/zen:step-1" },
        ],
      }),
      syllabus: FULL_SYLLABUS,
    });

    expect(ssrRecommendation.mode).toBe("practice");
    expect(ssrRecommendation.waitingTestNotice?.stepId).toBe("level-1/zen:step-1");
  });

  it("respects excludedStepIds and preferredMode across test and level pools", () => {
    expect.assertions(4);

    const readyOverview = emptyOverview({
      stepDecisions: [
        { decidedAt: dayOne, decision: "recommend_test", stepId: "level-1/zen:step-1" },
      ],
    });

    const preferredPractice = recommendNextTrainingActivity({
      now: dayTwo,
      overview: readyOverview,
      preferredMode: "practice",
      syllabus: FULL_SYLLABUS,
    });
    expect(preferredPractice.mode).toBe("practice");

    const skippedTestAndStepOne = recommendNextTrainingActivity({
      excludedStepIds: ["level-1/zen:step-1"],
      now: dayTwo,
      overview: readyOverview,
      syllabus: FULL_SYLLABUS,
    });
    expect(skippedTestAndStepOne.mode).toBe("practice");
    expect(skippedTestAndStepOne.stepId).not.toBe("level-1/zen:step-1");

    const singleLevelSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: ["level-1/zen:step-1"],
              title: "Zen",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 1,
      totalPages: 1,
      totalSteps: 1,
    };

    expect(
      recommendNextTrainingActivity({
        excludedStepIds: ["level-1/zen:step-1"],
        now: dayTwo,
        overview: emptyOverview(),
        syllabus: singleLevelSyllabus,
      }).stepId,
    ).toBe("level-1/zen:step-1");
  });

  it("respects excludedStepIds in all_complete pools", () => {
    expect.assertions(2);

    const singleLevelSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: ["level-1/zen:step-1"],
              title: "Zen",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 1,
      totalPages: 1,
      totalSteps: 1,
    };

    const completeOverview = emptyOverview({
      curriculumProgress: [{ completedAt: dayOne, stepId: "level-1/zen:step-1" }],
    });
    expect(
      recommendNextTrainingActivity({
        excludedStepIds: ["level-1/zen:step-1"],
        now: dayTwo,
        overview: completeOverview,
        syllabus: singleLevelSyllabus,
      }).fallbackMode,
    ).toBe("all_complete");

    const twoStepCompleteSyllabus: CurriculumSyllabus = {
      sections: [
        {
          href: "/curriculum/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/curriculum/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
              title: "Zen",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
      totalBehaviors: 1,
      totalPages: 1,
      totalSteps: 2,
    };
    expect(
      recommendNextTrainingActivity({
        excludedStepIds: ["level-1/zen:step-1"],
        now: dayTwo,
        overview: emptyOverview({
          curriculumProgress: [
            { completedAt: dayOne, stepId: "level-1/zen:step-1" },
            { completedAt: dayOne, stepId: "level-1/zen:step-2" },
          ],
        }),
        syllabus: twoStepCompleteSyllabus,
      }).stepId,
    ).toBe("level-1/zen:step-2");
  });
});
