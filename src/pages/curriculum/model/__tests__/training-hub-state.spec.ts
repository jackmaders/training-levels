import { describe, expect, it } from "vite-plus/test";

import { getCurriculumSyllabus } from "@/shared/curriculum-data/index.server";

import type { TrainingOverview } from "../../api/recommendation-service";
import { buildTrainingHubData } from "../training-hub-state";

const FULL_SYLLABUS = getCurriculumSyllabus();
const LEVEL_1_PAGES =
  FULL_SYLLABUS.sections.find((section) => section.sectionSlug === "level-1")?.pages ?? [];
const MULTI_STEP_PAGE =
  LEVEL_1_PAGES.find((page) => (page.stepSummaries?.length ?? 0) > 1) ?? LEVEL_1_PAGES[0];

function getLevel1Progress(completedAt: Date) {
  return LEVEL_1_PAGES.flatMap((page) =>
    (page.stepSummaries ?? []).map((step) => ({
      completedAt,
      stepId: step.stepId,
    })),
  );
}

function getBehaviorSteps(
  data: ReturnType<typeof buildTrainingHubData>,
  pageSlug: string | undefined,
) {
  return data.levels[0]?.behaviors.find((behavior) => behavior.id === pageSlug)?.steps ?? [];
}

function createOverview(overrides: Partial<TrainingOverview> = {}): TrainingOverview {
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

describe("training hub state", () => {
  it("falls back to My Dog when activeDog is null and derives initial Hub state", () => {
    expect.assertions(5);

    const overview = createOverview();

    const data = buildTrainingHubData({ now: null, overview, syllabus: FULL_SYLLABUS });

    expect(data.dogName).toBe("My Dog");
    expect(data.activeLevelId).toBe("level-1");
    expect(data.recommended.mode).toBe("practice");
    expect(data.recommended.ctaLabel).toBe("Start Practice");
    expect(data.levels[0]?.status).toBe("in_progress");
  });

  it("uses activeDog.name and surfaces Test recommendations", () => {
    expect.assertions(4);

    const decidedAt = new Date("2026-04-01T10:00:00.000Z");
    const firstStepId = "level-1/zen:step-1";
    const overview = createOverview({
      activeDog: { id: "dog-1", name: "Biscuit" },
      stepDecisions: [{ decidedAt, decision: "recommend_test", stepId: firstStepId }],
    });

    const data = buildTrainingHubData({
      now: new Date("2026-04-02T10:00:00.000Z"),
      overview,
      syllabus: FULL_SYLLABUS,
    });

    expect(data.dogName).toBe("Biscuit");
    expect(data.recommended.mode).toBe("test");
    expect(data.recommended.modeBadgeLabel).toBe("Test");
    expect(data.recommended.ctaLabel).toBe("Start Test");
  });

  it("marks completed levels and sets behavior CTA to Practice", () => {
    expect.assertions(4);

    const completedAt = new Date("2026-04-01T10:00:00.000Z");
    const curriculumProgress = getLevel1Progress(completedAt);
    const overview = createOverview({ curriculumProgress });

    const data = buildTrainingHubData({ now: null, overview, syllabus: FULL_SYLLABUS });

    expect(data.levels[0]?.status).toBe("completed");
    expect(data.levels[0]?.behaviors[0]?.ctaLabel).toBe("Practice");
    expect(data.levels[0]?.behaviors[0]?.percentage).toBe(100);
    expect(data.levels[1]?.status).toBe("in_progress");
  });

  it("marks step statuses as completed, next, and ready with practice launch search", () => {
    expect.assertions(4);

    const firstStepId = `${MULTI_STEP_PAGE?.pageSlug}:step-1`;
    const overview = createOverview({
      curriculumProgress: [
        { completedAt: new Date("2026-04-01T10:00:00.000Z"), stepId: firstStepId },
      ],
    });

    const data = buildTrainingHubData({ now: null, overview, syllabus: FULL_SYLLABUS });
    const firstBehaviorSteps = getBehaviorSteps(data, MULTI_STEP_PAGE?.pageSlug);
    const nextStep = firstBehaviorSteps.find((step) => step.status === "next");

    expect(firstBehaviorSteps[0]?.status).toBe("completed");
    expect(nextStep).toBeDefined();
    expect(nextStep?.launchSearch.mode).toBe("practice");
    expect(data.levels[3]?.status).toBe("upcoming");
  });

  it("handles sections with unknown level slugs or empty step summaries", () => {
    expect.assertions(2);

    const customSyllabus = {
      ...FULL_SYLLABUS,
      sections: [
        ...FULL_SYLLABUS.sections,
        {
          pages: [
            {
              pageSlug: "custom/intro",
              title: "Intro",
            },
          ],
          sectionSlug: "custom-section",
          title: "Custom",
        },
      ],
    };

    const data = buildTrainingHubData({
      now: null,
      overview: createOverview(),
      syllabus: customSyllabus as unknown as typeof FULL_SYLLABUS,
    });

    expect(data.levels.length).toBeGreaterThan(0);
    expect(data.levels[0]?.levelNumber).toBe(1);
  });
});
