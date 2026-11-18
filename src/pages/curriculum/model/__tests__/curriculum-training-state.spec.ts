import { describe, expect, it } from "vite-plus/test";

import type { CurriculumSyllabus } from "@/shared/curriculum-data";
import { TEST_SYLLABUS, createSyllabusFixture } from "@test/vitest/fixtures/curriculum";

import type { TrainingOverview } from "../../api/recommendation-service";
import {
  EMPTY_TRAINING_OVERVIEW,
  normalizeTrainingOverview,
  resolveCurriculumStepTrainingState,
  resolveCurriculumTrainingState,
  toTrainingLaunchSearch,
} from "../curriculum-training-state";

const STEP_ONE = 1;
const STEP_TWO = 2;
const STEP_FIVE = 5;
const LEVEL_TWO = 2;
const LEVEL_FOUR = 4;

const YESTERDAY = new Date("2026-06-14T10:00:00.000Z");
const TODAY = new Date("2026-06-15T14:00:00.000Z");

function createOverview(overrides: Partial<TrainingOverview> = {}): TrainingOverview {
  return {
    ...EMPTY_TRAINING_OVERVIEW,
    ...overrides,
  };
}

function createMultiLevelSyllabus(): CurriculumSyllabus {
  return createSyllabusFixture({
    sections: [
      {
        href: "/levels/level-1",
        levelNumber: 1,
        pages: [
          {
            href: "/levels/level-1/zen",
            kind: "behavior",
            levelNumber: 1,
            order: 1,
            pageSlug: "level-1/zen",
            sectionSlug: "level-1",
            stepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
            title: "Zen",
          },
          {
            href: "/levels/level-1/come",
            kind: "behavior",
            levelNumber: 1,
            order: 2,
            pageSlug: "level-1/come",
            sectionSlug: "level-1",
            stepIds: ["level-1/come:step-1"],
            title: "Come",
          },
          {
            href: "/levels/level-1/down",
            kind: "behavior",
            levelNumber: 1,
            order: 3,
            pageSlug: "level-1/down",
            sectionSlug: "level-1",
            stepIds: ["level-1/down:step-1"],
            title: "Down",
          },
        ],
        sectionSlug: "level-1",
        title: "Level 1",
      },
      {
        href: "/levels/level-2",
        levelNumber: 2,
        pages: [
          {
            href: "/levels/level-2/go-to-mat",
            kind: "behavior",
            levelNumber: 2,
            order: 1,
            pageSlug: "level-2/go-to-mat",
            sectionSlug: "level-2",
            stepIds: ["level-2/go-to-mat:step-1"],
            title: "Go to Mat",
          },
        ],
        sectionSlug: "level-2",
        title: "Level 2",
      },
    ],
  });
}

describe("training overview normalization", () => {
  it("returns empty overview when input is undefined and no completedStepIds are provided", () => {
    expect.assertions(1);

    const input: { overview?: TrainingOverview | undefined } = {};
    expect(normalizeTrainingOverview(input.overview)).toBe(EMPTY_TRAINING_OVERVIEW);
  });

  it("merges only missing completedStepIds without duplicating existing completions", () => {
    expect.assertions(2);

    const existing = createOverview({
      curriculumProgress: [{ completedAt: YESTERDAY, stepId: "level-1/zen:step-1" }],
    });

    const unchanged = normalizeTrainingOverview(existing, ["level-1/zen:step-1"]);
    const merged = normalizeTrainingOverview(existing, [
      "level-1/zen:step-1",
      "level-1/zen:step-2",
    ]);

    expect(unchanged).toBe(existing);
    expect(merged.curriculumProgress.map((item) => item.stepId)).toStrictEqual([
      "level-1/zen:step-1",
      "level-1/zen:step-2",
    ]);
  });
});

describe("curriculum step training state selector", () => {
  it("resolves unfinished and all in_practice activity sources", () => {
    expect.assertions(5);

    const unfinished = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    const fromAttempt = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      overview: createOverview({
        practiceAttempts: [
          {
            attemptId: "a-1",
            createdAt: TODAY,
            outcome: "not_yet",
            stepId: "level-1/zen:step-1",
            target: "1s",
            undoneAt: null,
          },
        ],
      }),
      stepId: "level-1/zen:step-1",
      stepLabel: "Step 1: Closed fist",
      stepNumber: STEP_ONE,
    });
    const fromTotal = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      overview: createOverview({
        practiceTotals: [
          {
            createdAt: TODAY,
            notYetCount: 0,
            recordId: "t-1",
            stepId: "level-1/zen:step-1",
            successCount: 1,
            target: "1s",
          },
        ],
      }),
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    const fromDecision = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      overview: createOverview({
        stepDecisions: [
          {
            decidedAt: TODAY,
            decision: "keep_practicing",
            stepId: "level-1/zen:step-1",
          },
        ],
      }),
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });

    expect(unfinished.stateKind).toBe("unfinished");
    expect(unfinished.stepLabel).toBe("Step 1");
    expect(fromAttempt.stateKind).toBe("in_practice");
    expect(fromTotal.stateKind).toBe("in_practice");
    expect(fromDecision.stateKind).toBe("in_practice");
  });

  it("resolves cold_test_waiting vs test_ready based on hydrated day and activity", () => {
    expect.assertions(3);

    const readyOverview = createOverview({
      practiceAttempts: [
        {
          attemptId: "a-2",
          createdAt: YESTERDAY,
          outcome: "success",
          stepId: "level-1/zen:step-1",
          target: "1s",
          undoneAt: null,
        },
      ],
      stepDecisions: [
        {
          decidedAt: YESTERDAY,
          decision: "recommend_test",
          stepId: "level-1/zen:step-1",
        },
      ],
    });
    const waitingNoNow = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      now: null,
      overview: readyOverview,
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    const waitingSameDay = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      now: YESTERDAY,
      overview: readyOverview,
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    const testReady = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      now: TODAY,
      overview: readyOverview,
      recommendation: { mode: "test", stepId: "level-1/zen:step-1" },
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });

    expect(waitingNoNow.stateKind).toBe("cold_test_waiting");
    expect(waitingSameDay.stateKind).toBe("cold_test_waiting");
    expect(testReady.stateKind).toBe("test_ready");
  });

  it("resolves previously_recorded, test_passed, needs_practice variants", () => {
    expect.assertions(4);

    const previouslyRecorded = resolveCurriculumStepTrainingState({
      completedStepIds: ["level-1/zen:step-1"],
      criterion: "Closed fist",
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    const testPassed = resolveCurriculumStepTrainingState({
      completedStepIds: ["level-1/zen:step-1"],
      criterion: "Closed fist",
      overview: createOverview({
        stepTests: [
          {
            coldOverride: false,
            outcome: "success",
            stepId: "level-1/zen:step-1",
            testId: "test-1",
            testedAt: TODAY,
          },
        ],
      }),
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    const needsPracticeFresh = resolveCurriculumStepTrainingState({
      criterion: "Closed fist",
      overview: createOverview({
        stepTests: [
          {
            coldOverride: false,
            outcome: "not_yet",
            stepId: "level-1/zen:step-1",
            testId: "test-2",
            testedAt: TODAY,
          },
        ],
      }),
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    const needsPracticeRetained = resolveCurriculumStepTrainingState({
      completedStepIds: ["level-1/zen:step-1"],
      criterion: "Closed fist",
      overview: createOverview({
        stepTests: [
          {
            coldOverride: false,
            outcome: "not_yet",
            stepId: "level-1/zen:step-1",
            testId: "test-3",
            testedAt: TODAY,
          },
        ],
      }),
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });

    expect(previouslyRecorded.stateLabel).toBe("Previously recorded");
    expect(testPassed.stateLabel).toBe("Passed Cold Test");
    expect(needsPracticeFresh.stateLabel).toBe("Needs practice");
    expect(needsPracticeRetained.stateLabel).toBe("Needs practice (Previously recorded)");
  });

  it("marks non-testable step 5 as non-testable even with test decision", () => {
    expect.assertions(2);

    const stepFive = resolveCurriculumStepTrainingState({
      criterion: "Release",
      overview: createOverview({
        stepDecisions: [
          {
            decidedAt: YESTERDAY,
            decision: "recommend_test",
            stepId: "level-1/zen:step-5",
          },
        ],
      }),
      stepId: "level-1/zen:step-5",
      stepNumber: STEP_FIVE,
    });

    expect(stepFive.canTest).toBe(false);
    expect(stepFive.stateKind).toBe("in_practice");
  });
});

describe("curriculum training state selector", () => {
  it("handles empty step pools and behaviors with zero steps", () => {
    expect.assertions(4);

    const emptyStepsSyllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: [],
              title: "Zen",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
    });

    const state = resolveCurriculumTrainingState({ syllabus: emptyStepsSyllabus });
    const zen = state.behaviorsBySlug.get("level-1/zen");

    expect(state.recommendation).toBeNull();
    expect(state.currentLevelNumber).toBe(LEVEL_FOUR);
    expect(zen?.primaryLaunch).toBeNull();
    expect(zen?.secondaryTestLaunch).toBeNull();
  });

  it("resolves recommended next behavior and launch links", () => {
    expect.assertions(5);

    const state = resolveCurriculumTrainingState({
      now: TODAY,
      selectedPageSlug: "level-2/go-to-mat",
      syllabus: createMultiLevelSyllabus(),
    });
    const zen = state.behaviorsBySlug.get("level-1/zen");

    expect(state.currentLevelNumber).toBe(STEP_ONE);
    expect(zen?.isRecommendedNext).toBe(true);
    expect(zen?.isEligibleNextOption).toBe(true);
    expect(zen?.primaryLaunch).toStrictEqual({
      label: "Practice Step 1",
      mode: "practice",
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    expect(zen?.secondaryTestLaunch).toStrictEqual({
      label: "Test Step 1",
      mode: "test",
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
  });

  it("resolves prerequisite chain, unmet Comebefores, and later-Level flags", () => {
    expect.assertions(5);

    const state = resolveCurriculumTrainingState({
      now: TODAY,
      selectedPageSlug: "level-2/go-to-mat",
      syllabus: createMultiLevelSyllabus(),
    });
    const down = state.behaviorsBySlug.get("level-1/down");
    const mat = state.behaviorsBySlug.get("level-2/go-to-mat");

    expect(down?.isInSelectedPrerequisiteChain).toBe(true);
    expect(down?.isEligibleNextOption).toBe(true);
    expect(mat?.inspection.isLaterLevel).toBe(true);
    expect(mat?.inspection.unmetPrerequisites.map((item) => item.pageSlug)).toStrictEqual([
      "level-1/down",
    ]);
    expect(mat?.levelNumber).toBe(LEVEL_TWO);
  });

  it("keeps downstream Comebefores intact on retest failure and handles fresh needs_practice", () => {
    expect.assertions(5);

    const syllabus = createMultiLevelSyllabus();
    const retainedNeedsPractice = resolveCurriculumTrainingState({
      completedStepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
      now: TODAY,
      overview: createOverview({
        stepTests: [
          {
            coldOverride: false,
            outcome: "not_yet",
            stepId: "level-1/zen:step-1",
            testId: "t-fail",
            testedAt: YESTERDAY,
          },
        ],
      }),
      syllabus,
    });
    const zenRetained = retainedNeedsPractice.behaviorsBySlug.get("level-1/zen");
    const comeAfterRetained = retainedNeedsPractice.behaviorsBySlug.get("level-1/come");
    const freshNeedsPractice = resolveCurriculumTrainingState({
      now: TODAY,
      overview: createOverview({
        stepTests: [
          {
            coldOverride: false,
            outcome: "not_yet",
            stepId: "level-1/zen:step-1",
            testId: "t-fail-2",
            testedAt: YESTERDAY,
          },
        ],
      }),
      syllabus,
    });

    expect(zenRetained?.stateKind).toBe("needs_practice");
    expect(zenRetained?.stateLabel).toBe("Needs practice · Completion retained");
    expect(zenRetained?.activeStep?.stepNumber).toBe(STEP_ONE);
    expect(comeAfterRetained?.inspection.unmetPrerequisites).toStrictEqual([]);
    expect(freshNeedsPractice.behaviorsBySlug.get("level-1/zen")?.stateLabel).toBe(
      "Needs practice",
    );
  });

  it("resolves completed behavior variants for test_passed and previously_recorded", () => {
    expect.assertions(3);

    const syllabus = createMultiLevelSyllabus();
    const testPassedBehavior = resolveCurriculumTrainingState({
      completedStepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
      now: TODAY,
      overview: createOverview({
        stepTests: [
          {
            coldOverride: false,
            outcome: "success",
            stepId: "level-1/zen:step-1",
            testId: "t-pass-1",
            testedAt: YESTERDAY,
          },
          {
            coldOverride: false,
            outcome: "success",
            stepId: "level-1/zen:step-2",
            testId: "t-pass-2",
            testedAt: YESTERDAY,
          },
        ],
      }),
      syllabus,
    });
    const mixedCompletedBehavior = resolveCurriculumTrainingState({
      completedStepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
      now: TODAY,
      overview: createOverview({
        stepTests: [
          {
            coldOverride: false,
            outcome: "success",
            stepId: "level-1/zen:step-1",
            testId: "t-pass-3",
            testedAt: YESTERDAY,
          },
        ],
      }),
      syllabus,
    });

    expect(testPassedBehavior.behaviorsBySlug.get("level-1/zen")?.stateLabel).toBe(
      "Completed · Passed Cold Test",
    );
    expect(testPassedBehavior.behaviorsBySlug.get("level-1/zen")?.activeStep?.stepNumber).toBe(
      STEP_ONE,
    );
    expect(mixedCompletedBehavior.behaviorsBySlug.get("level-1/zen")?.stateLabel).toBe(
      "Completed · Previously recorded",
    );
  });

  it("resolves test_ready and cold_test_waiting behavior states and launches", () => {
    expect.assertions(4);

    const syllabus = createMultiLevelSyllabus();
    const testReadyBehavior = resolveCurriculumTrainingState({
      now: TODAY,
      overview: createOverview({
        stepDecisions: [
          {
            decidedAt: YESTERDAY,
            decision: "recommend_test",
            stepId: "level-1/zen:step-1",
          },
        ],
      }),
      syllabus,
    });
    const waitingBehavior = resolveCurriculumTrainingState({
      now: TODAY,
      overview: createOverview({
        practiceAttempts: [
          {
            attemptId: "a-today",
            createdAt: TODAY,
            outcome: "success",
            stepId: "level-1/zen:step-1",
            target: "1s",
            undoneAt: null,
          },
        ],
        stepDecisions: [
          {
            decidedAt: TODAY,
            decision: "recommend_test",
            stepId: "level-1/zen:step-1",
          },
        ],
      }),
      syllabus,
    });
    const readyZen = testReadyBehavior.behaviorsBySlug.get("level-1/zen");

    expect(readyZen?.stateKind).toBe("test_ready");
    expect(readyZen?.primaryLaunch).toStrictEqual({
      label: "Test Step 1",
      mode: "test",
      stepId: "level-1/zen:step-1",
      stepNumber: STEP_ONE,
    });
    expect(readyZen?.secondaryTestLaunch).toBeNull();
    expect(waitingBehavior.behaviorsBySlug.get("level-1/zen")?.stateKind).toBe("cold_test_waiting");
  });

  it("handles partially completed behaviors and non-testable active steps", () => {
    expect.assertions(4);

    const partialZen = resolveCurriculumTrainingState({
      completedStepIds: ["level-1/zen:step-1"],
      now: TODAY,
      syllabus: TEST_SYLLABUS,
    });
    const zen = partialZen.behaviorsBySlug.get("level-1/zen");
    expect(zen?.stateKind).toBe("in_practice");
    expect(zen?.activeStep?.stepNumber).toBe(STEP_TWO);

    const stepFiveOnly = resolveCurriculumTrainingState({
      completedStepIds: [
        "level-1/zen:step-1",
        "level-1/zen:step-2",
        "level-1/zen:step-3",
        "level-1/zen:step-4",
      ],
      now: TODAY,
      syllabus: TEST_SYLLABUS,
    });
    const zenStepFive = stepFiveOnly.behaviorsBySlug.get("level-1/zen");
    expect(zenStepFive?.activeStep?.stepNumber).toBe(STEP_FIVE);
    expect(zenStepFive?.secondaryTestLaunch).toBeNull();
  });

  it("picks recommendation step even when an earlier step needs practice", () => {
    expect.assertions(2);

    const syllabus = createMultiLevelSyllabus();
    const state = resolveCurriculumTrainingState({
      now: TODAY,
      overview: createOverview({
        stepDecisions: [
          {
            decidedAt: YESTERDAY,
            decision: "recommend_test",
            stepId: "level-1/zen:step-2",
          },
        ],
        stepTests: [
          {
            coldOverride: false,
            outcome: "not_yet",
            stepId: "level-1/zen:step-1",
            testId: "t-old",
            testedAt: YESTERDAY,
          },
        ],
      }),
      syllabus,
    });

    const zen = state.behaviorsBySlug.get("level-1/zen");
    expect(zen?.activeStep?.stepNumber).toBe(STEP_TWO);
    expect(zen?.stateKind).toBe("needs_practice");
  });

  it("builds training launch search objects for practice and test modes", () => {
    expect.assertions(2);

    expect(toTrainingLaunchSearch("level-1/zen:step-1", "practice")).toStrictEqual({
      stepId: "level-1/zen:step-1",
    });
    expect(toTrainingLaunchSearch("level-1/zen:step-1", "test")).toStrictEqual({
      mode: "test",
      stepId: "level-1/zen:step-1",
    });
  });
});
