import type { HEADING_LEVELS, LEVEL_NUMBERS, STEP_NUMBERS } from "./curriculum.constants";

export type SectionSlug = "theory" | "level-1" | "level-2" | "level-3" | "level-4" | "appendices";

export type LevelSectionSlug = "level-1" | "level-2" | "level-3" | "level-4";

export type LevelNumber = (typeof LEVEL_NUMBERS)[number];

export type StepNumber = (typeof STEP_NUMBERS)[number];

export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export type PageKind = "theory" | "overview" | "behavior" | "homework" | "appendix";

export type InlineNode =
  | { text: string; type: "text" }
  | { children: InlineNode[]; type: "strong" }
  | { children: InlineNode[]; type: "em" }
  | { text: string; type: "code" }
  | { children: InlineNode[]; external: boolean; href: string; type: "link" };

export type CalloutVariant = "note" | "tip" | "warning";

export interface ListItem {
  checked?: boolean;
  children?: ListBlock[];
  content: InlineNode[];
}

export interface ListBlock {
  items: ListItem[];
  ordered: boolean;
  style?: "decimal" | "lower-roman";
  type: "list";
}

export interface ParagraphBlock {
  content: InlineNode[];
  type: "paragraph";
}

export interface BlockquoteBlock {
  blocks: (ParagraphBlock | ListBlock)[];
  type: "blockquote";
}

export interface CalloutBlock {
  blocks: (ParagraphBlock | ListBlock)[];
  title?: InlineNode[];
  type: "callout";
  variant: CalloutVariant;
}

export type ContentBlock = ParagraphBlock | ListBlock | BlockquoteBlock | CalloutBlock;

export interface HeadingBlock {
  id: string;
  level: HeadingLevel;
  text: string;
  type: "heading";
}

export type ProseBlock = ContentBlock | HeadingBlock;

export interface PageNavigationRef {
  href: string;
  kind: PageKind;
  pageSlug: string;
  sectionSlug: SectionSlug;
  title: string;
}

export interface SyllabusStepSummary {
  label: string;
  stepId: string;
  stepNumber: StepNumber;
}

export interface SyllabusPageEntry {
  behaviorFamily?: string;
  href: string;
  kind: PageKind;
  levelNumber?: LevelNumber;
  order: number;
  pageSlug: string;
  sectionSlug: SectionSlug;
  stepIds?: string[];
  stepSummaries?: SyllabusStepSummary[];
  title: string;
}

export interface SyllabusSection {
  href: string;
  levelNumber?: LevelNumber;
  pages: SyllabusPageEntry[];
  sectionSlug: SectionSlug;
  title: string;
}

export interface CurriculumSyllabus {
  sections: SyllabusSection[];
  totalBehaviors: number;
  totalPages: number;
  totalSteps: number;
}

export interface ProseCurriculumPage {
  blocks: ProseBlock[];
  href: string;
  kind: "theory" | "overview" | "homework" | "appendix";
  levelNumber?: LevelNumber;
  nextPage: PageNavigationRef | null;
  pageSlug: string;
  previousPage: PageNavigationRef | null;
  sectionSlug: SectionSlug;
  title: string;
}

export interface BehaviorStepSummary {
  anchor: string;
  content: InlineNode[];
  stepId: string;
  stepNumber: StepNumber;
}

export interface BehaviorThinkAboutSection {
  blocks: ContentBlock[];
  heading: string;
  id: string;
}

export interface BehaviorStep {
  anchor: string;
  comeafters: ContentBlock[] | null;
  heading: string;
  instructions: ContentBlock[];
  stepId: string;
  stepNumber: StepNumber;
  tryItCold: ContentBlock[] | null;
}

export interface BehaviorCurriculumPage {
  aboutTheCues: ContentBlock[] | null;
  behaviorFamily: string;
  comebefores: ContentBlock[];
  equipment: ContentBlock[];
  href: string;
  introBlocks: ContentBlock[];
  kind: "behavior";
  levelNumber: LevelNumber;
  nextPage: PageNavigationRef | null;
  pageSlug: string;
  previousPage: PageNavigationRef | null;
  sectionSlug: LevelSectionSlug;
  steps: BehaviorStep[];
  stepsIntroBlocks: ContentBlock[];
  thinkAbout: BehaviorThinkAboutSection[];
  title: string;
  whereWeAreGoing: {
    extraBlocks: ContentBlock[];
    steps: BehaviorStepSummary[];
  };
}

export type CurriculumPage = ProseCurriculumPage | BehaviorCurriculumPage;
