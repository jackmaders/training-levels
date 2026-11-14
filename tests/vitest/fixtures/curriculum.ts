import type {
  BehaviorCurriculumPage,
  BehaviorStep,
  CurriculumSyllabus,
  ProseCurriculumPage,
  SyllabusPageEntry,
  SyllabusSection,
} from "@/shared/curriculum-data";

function createBehaviorStepFixture(overrides: Partial<BehaviorStep> = {}): BehaviorStep {
  const stepNumber = overrides.stepNumber ?? 1;
  return {
    anchor: `step-${stepNumber}`,
    comeafters: null,
    heading: `Step ${stepNumber}: Look at trainer and ignore food`,
    instructions: [
      {
        content: [{ text: "Hold a treat in your closed hand.", type: "text" }],
        type: "paragraph",
      },
    ],
    stepId: `level-1/zen:step-${stepNumber}`,
    stepNumber,
    tryItCold: [
      {
        content: [{ text: "Present your closed fist at chest height.", type: "text" }],
        type: "paragraph",
      },
    ],
    ...overrides,
  };
}

const TEST_BEHAVIOR_STEPS: BehaviorStep[] = [
  createBehaviorStepFixture({
    heading: "Step 1: Wait for eye contact with closed fist",
    stepId: "level-1/zen:step-1",
    stepNumber: 1,
  }),
  createBehaviorStepFixture({
    comeafters: [
      {
        content: [{ text: "Practice briefly in a quiet room.", type: "text" }],
        type: "paragraph",
      },
    ],
    heading: "Step 2: Open palm slightly without grabbing",
    stepId: "level-1/zen:step-2",
    stepNumber: 2,
    tryItCold: null,
  }),
  createBehaviorStepFixture({
    heading: "Step 3: Lower open hand toward floor",
    stepId: "level-1/zen:step-3",
    stepNumber: 3,
  }),
  createBehaviorStepFixture({
    heading: "Step 4: Place treat on floor near foot",
    stepId: "level-1/zen:step-4",
    stepNumber: 4,
  }),
  createBehaviorStepFixture({
    heading: "Step 5: Release to take treat from floor",
    stepId: "level-1/zen:step-5",
    stepNumber: 5,
  }),
];

const TEST_BEHAVIOR_PAGE: BehaviorCurriculumPage = {
  aboutTheCues: [
    {
      content: [{ text: "Zen uses no verbal cue in Level 1.", type: "text" }],
      type: "paragraph",
    },
  ],
  behaviorFamily: "Impulse Control",
  comebefores: [
    {
      content: [
        {
          children: [{ text: "The Thinking of Training", type: "text" }],
          external: false,
          href: "/theory/07-the-thinking-of-training",
          type: "link",
        },
      ],
      type: "paragraph",
    },
  ],
  equipment: [
    {
      content: [{ text: "High-value training treats", type: "text" }],
      type: "paragraph",
    },
  ],
  href: "/levels/level-1/zen",
  introBlocks: [
    {
      content: [{ text: "Teaching impulse control around food.", type: "text" }],
      type: "paragraph",
    },
  ],
  kind: "behavior",
  levelNumber: 1,
  nextPage: {
    href: "/levels/level-1/come",
    kind: "behavior",
    pageSlug: "level-1/come",
    sectionSlug: "level-1",
    title: "Come",
  },
  pageSlug: "level-1/zen",
  previousPage: {
    href: "/levels/level-1/00-overview",
    kind: "overview",
    pageSlug: "level-1/00-overview",
    sectionSlug: "level-1",
    title: "Level 1 Overview",
  },
  sectionSlug: "level-1",
  steps: TEST_BEHAVIOR_STEPS,
  stepsIntroBlocks: [
    {
      content: [{ text: "Work through each step in sequence.", type: "text" }],
      type: "paragraph",
    },
  ],
  thinkAbout: [
    {
      blocks: [
        {
          content: [{ text: "Reward calm choices rather than grabbing.", type: "text" }],
          type: "paragraph",
        },
      ],
      heading: "Think About Impulse Control",
      id: "think-about-impulse-control",
    },
  ],
  title: "Zen",
  whereWeAreGoing: {
    extraBlocks: [
      {
        blocks: [
          {
            content: [{ text: "Keep sessions short and upbeat.", type: "text" }],
            type: "paragraph",
          },
        ],
        title: [{ text: "Tip", type: "text" }],
        type: "callout",
        variant: "tip",
      },
    ],
    steps: [
      {
        anchor: "step-1",
        content: [{ text: "Closed fist impulse check", type: "text" }],
        stepId: "level-1/zen:step-1",
        stepNumber: 1,
      },
    ],
  },
};

const TEST_OVERVIEW_PAGE: ProseCurriculumPage = {
  blocks: [
    {
      id: "getting-started",
      level: 2,
      text: "Getting Started",
      type: "heading",
    },
    {
      content: [{ text: "Welcome to Level 1 foundations.", type: "text" }],
      type: "paragraph",
    },
  ],
  href: "/levels/level-1/00-overview",
  kind: "overview",
  levelNumber: 1,
  nextPage: {
    href: "/levels/level-1/zen",
    kind: "behavior",
    pageSlug: "level-1/zen",
    sectionSlug: "level-1",
    title: "Zen",
  },
  pageSlug: "level-1/00-overview",
  previousPage: {
    href: "/theory/07-the-thinking-of-training",
    kind: "theory",
    pageSlug: "theory/07-the-thinking-of-training",
    sectionSlug: "theory",
    title: "The Thinking of Training",
  },
  sectionSlug: "level-1",
  title: "Level 1 Overview",
};

const TEST_HOMEWORK_PAGE: ProseCurriculumPage = {
  blocks: [
    {
      content: [{ text: "Practice Zen and Come daily.", type: "text" }],
      type: "paragraph",
    },
  ],
  href: "/levels/level-1/homework",
  kind: "homework",
  levelNumber: 1,
  nextPage: {
    href: "/levels/level-2/00-overview",
    kind: "overview",
    pageSlug: "level-2/00-overview",
    sectionSlug: "level-2",
    title: "Level 2 Overview",
  },
  pageSlug: "level-1/homework",
  previousPage: {
    href: "/levels/level-1/come",
    kind: "behavior",
    pageSlug: "level-1/come",
    sectionSlug: "level-1",
    title: "Come",
  },
  sectionSlug: "level-1",
  title: "Level 1 Homework",
};

function createBehaviorPageFixture(
  overrides: Partial<BehaviorCurriculumPage> = {},
): BehaviorCurriculumPage {
  return { ...TEST_BEHAVIOR_PAGE, ...overrides };
}

function createProsePageFixture(overrides: Partial<ProseCurriculumPage> = {}): ProseCurriculumPage {
  return { ...TEST_OVERVIEW_PAGE, ...overrides };
}

const TEST_LEVEL_1_PAGES: SyllabusPageEntry[] = [
  {
    href: "/levels/level-1/00-overview",
    kind: "overview",
    levelNumber: 1,
    order: 0,
    pageSlug: "level-1/00-overview",
    sectionSlug: "level-1",
    title: "Level 1 Overview",
  },
  {
    behaviorFamily: "Impulse Control",
    href: "/levels/level-1/zen",
    kind: "behavior",
    levelNumber: 1,
    order: 1,
    pageSlug: "level-1/zen",
    sectionSlug: "level-1",
    stepIds: [
      "level-1/zen:step-1",
      "level-1/zen:step-2",
      "level-1/zen:step-3",
      "level-1/zen:step-4",
      "level-1/zen:step-5",
    ],
    stepSummaries: [
      {
        label: "Wait for eye contact with closed fist",
        stepId: "level-1/zen:step-1",
        stepNumber: 1,
      },
    ],
    title: "Zen",
  },
  {
    behaviorFamily: "Recall",
    href: "/levels/level-1/come",
    kind: "behavior",
    levelNumber: 1,
    order: 2,
    pageSlug: "level-1/come",
    sectionSlug: "level-1",
    stepIds: [
      "level-1/come:step-1",
      "level-1/come:step-2",
      "level-1/come:step-3",
      "level-1/come:step-4",
      "level-1/come:step-5",
    ],
    title: "Come",
  },
  {
    href: "/levels/level-1/homework",
    kind: "homework",
    levelNumber: 1,
    order: 3,
    pageSlug: "level-1/homework",
    sectionSlug: "level-1",
    title: "Level 1 Homework",
  },
];

const TEST_LEVEL_2_PAGES: SyllabusPageEntry[] = [
  {
    href: "/levels/level-2/00-overview",
    kind: "overview",
    levelNumber: 2,
    order: 0,
    pageSlug: "level-2/00-overview",
    sectionSlug: "level-2",
    title: "Level 2 Overview",
  },
  {
    behaviorFamily: "Impulse Control",
    href: "/levels/level-2/zen",
    kind: "behavior",
    levelNumber: 2,
    order: 1,
    pageSlug: "level-2/zen",
    sectionSlug: "level-2",
    stepIds: [
      "level-2/zen:step-1",
      "level-2/zen:step-2",
      "level-2/zen:step-3",
      "level-2/zen:step-4",
      "level-2/zen:step-5",
    ],
    title: "Zen",
  },
];

const TEST_SYLLABUS_SECTIONS: SyllabusSection[] = [
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
    ],
    sectionSlug: "theory",
    title: "Theory",
  },
  {
    href: "/levels/level-1",
    levelNumber: 1,
    pages: TEST_LEVEL_1_PAGES,
    sectionSlug: "level-1",
    title: "Level 1",
  },
  {
    href: "/levels/level-2",
    levelNumber: 2,
    pages: TEST_LEVEL_2_PAGES,
    sectionSlug: "level-2",
    title: "Level 2",
  },
  {
    href: "/appendices",
    pages: [
      {
        href: "/appendices/appendix-a",
        kind: "appendix",
        order: 0,
        pageSlug: "appendices/appendix-a",
        sectionSlug: "appendices",
        title: "Appendix A",
      },
    ],
    sectionSlug: "appendices",
    title: "Appendices",
  },
];

const TEST_SYLLABUS: CurriculumSyllabus = {
  sections: TEST_SYLLABUS_SECTIONS,
  totalBehaviors: 3,
  totalPages: 8,
  totalSteps: 15,
};

function createSyllabusFixture(overrides: Partial<CurriculumSyllabus> = {}): CurriculumSyllabus {
  return { ...TEST_SYLLABUS, ...overrides };
}

export {
  TEST_BEHAVIOR_PAGE,
  TEST_HOMEWORK_PAGE,
  TEST_OVERVIEW_PAGE,
  TEST_SYLLABUS,
  createBehaviorPageFixture,
  createBehaviorStepFixture,
  createProsePageFixture,
  createSyllabusFixture,
};
