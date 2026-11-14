import type {
  BehaviorCurriculumPage,
  CurriculumSyllabus,
  ProseCurriculumPage,
} from "@/shared/curriculum-data";

const TEST_THEORY_PAGE: ProseCurriculumPage = {
  blocks: [{ content: [{ text: "Welcome", type: "text" }], type: "paragraph" }],
  href: "/theory/01-foreword",
  kind: "theory",
  nextPage: null,
  pageSlug: "theory/01-foreword",
  previousPage: null,
  sectionSlug: "theory",
  title: "Foreword",
};

const TEST_APPENDIX_PAGE: ProseCurriculumPage = {
  blocks: [{ content: [{ text: "Appendix text", type: "text" }], type: "paragraph" }],
  href: "/appendices/appendix-a-leading-the-dance",
  kind: "appendix",
  nextPage: null,
  pageSlug: "appendices/appendix-a-leading-the-dance",
  previousPage: null,
  sectionSlug: "appendices",
  title: "Leading the Dance",
};

const TEST_BEHAVIOR_PAGE: BehaviorCurriculumPage = {
  aboutTheCues: null,
  behaviorFamily: "zen",
  comebefores: [],
  equipment: [],
  href: "/levels/level-1/zen",
  introBlocks: [],
  kind: "behavior",
  levelNumber: 1,
  nextPage: null,
  pageSlug: "level-1/zen",
  previousPage: null,
  sectionSlug: "level-1",
  steps: [],
  stepsIntroBlocks: [],
  thinkAbout: [],
  title: "Level 1: Zen",
  whereWeAreGoing: { extraBlocks: [], steps: [] },
};

const TEST_SYLLABUS: CurriculumSyllabus = {
  sections: [
    {
      href: "/theory",
      pages: [
        {
          href: "/theory/01-foreword",
          kind: "theory",
          order: 0,
          pageSlug: "theory/01-foreword",
          sectionSlug: "theory",
          title: "Foreword",
        },
        {
          href: "/theory/02-welcome",
          kind: "theory",
          order: 1,
          pageSlug: "theory/02-welcome",
          sectionSlug: "theory",
          title: "Welcome! Come Into My Parlour...",
        },
      ],
      sectionSlug: "theory",
      title: "Theory",
    },
    {
      href: "/appendices",
      pages: [
        {
          href: "/appendices/appendix-a-leading-the-dance",
          kind: "appendix",
          order: 64,
          pageSlug: "appendices/appendix-a-leading-the-dance",
          sectionSlug: "appendices",
          title: "Appendix A: Leading the Dance",
        },
      ],
      sectionSlug: "appendices",
      title: "Appendices",
    },
  ],
  totalBehaviors: 0,
  totalPages: 3,
  totalSteps: 0,
};

function createProsePageFixture(overrides: Partial<ProseCurriculumPage> = {}): ProseCurriculumPage {
  return { ...TEST_THEORY_PAGE, ...overrides };
}

function createBehaviorPageFixture(
  overrides: Partial<BehaviorCurriculumPage> = {},
): BehaviorCurriculumPage {
  return { ...TEST_BEHAVIOR_PAGE, ...overrides };
}

function createSyllabusFixture(overrides: Partial<CurriculumSyllabus> = {}): CurriculumSyllabus {
  return { ...TEST_SYLLABUS, ...overrides };
}

export {
  TEST_APPENDIX_PAGE,
  TEST_BEHAVIOR_PAGE,
  TEST_SYLLABUS,
  TEST_THEORY_PAGE,
  createBehaviorPageFixture,
  createProsePageFixture,
  createSyllabusFixture,
};
