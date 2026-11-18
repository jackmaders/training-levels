import type {
  BehaviorCurriculumPage,
  ContentBlock,
  HeadingBlock,
  InlineNode,
  ProseBlock,
  ProseCurriculumPage,
} from "@/shared/curriculum-data";

interface TrainingFaqSource {
  href: string;
  label: string;
}

interface TrainingFaqEntry {
  answer: ContentBlock[];
  question: string;
  source: TrainingFaqSource;
}

const FAQ_TITLE_PATTERN = /^(?:Problem|Question)\b[:\s—-]*/u;
const LEVEL_TITLE_PREFIX_PATTERN = /^Level \d+:\s*/u;
const LAST_GROUP_INDEX = -1;
const SOLVING_TRAINING_PROBLEMS_SLUG = "theory/08-solving-training-problems";
const TROUBLESHOOTING_TOPIC_HEADING_LEVEL = 3;
/** Theory pages whose questions and troubleshooting topics form the general FAQ. */
const GENERAL_FAQ_PAGE_SLUGS = [
  "theory/07-the-thinking-of-training",
  SOLVING_TRAINING_PROBLEMS_SLUG,
] as const;

/**
 * Collects the Behavior's own "Problem" and "Question" notes as FAQ answers, keeping the source
 * wording and a link back to the Step that contains them.
 */
function getBehaviorFaq(page: BehaviorCurriculumPage): TrainingFaqEntry[] {
  const behaviorLabel = getBehaviorLabel(page);
  const pageSource = { href: page.href, label: behaviorLabel };
  const pageBlocks = [
    ...page.introBlocks,
    ...page.comebefores,
    ...page.equipment,
    ...page.thinkAbout.flatMap((section) => section.blocks),
    ...(page.aboutTheCues ?? []),
    ...page.stepsIntroBlocks,
  ];

  return [
    ...collectFaqEntries(pageBlocks, pageSource),
    ...page.steps.flatMap((step) =>
      collectFaqEntries(
        [...step.instructions, ...(step.tryItCold ?? []), ...(step.comeafters ?? [])],
        {
          href: `${page.href}#${step.anchor}`,
          label: `${behaviorLabel}, Step ${String(step.stepNumber)}`,
        },
      ),
    ),
  ];
}

/** Names a Behavior chapter the way Training references it, such as "Level 1 Zen". */
function getBehaviorLabel(page: BehaviorCurriculumPage): string {
  const behaviorName = page.title.replace(LEVEL_TITLE_PREFIX_PATTERN, "");
  return `Level ${String(page.levelNumber)} ${behaviorName}`;
}

/**
 * Builds the general FAQ from theory reading: every "Question"/"Problem" note, plus each
 * troubleshooting topic in Solving Training Problems.
 */
function getGeneralFaq(pages: readonly ProseCurriculumPage[]): TrainingFaqEntry[] {
  return pages.flatMap((page) =>
    groupBlocksByHeading(page.blocks).flatMap(({ blocks, heading }) => {
      const source = {
        href: heading === null ? page.href : `${page.href}#${heading.id}`,
        label: page.title,
      };
      const isTroubleshootingTopic =
        page.pageSlug === SOLVING_TRAINING_PROBLEMS_SLUG &&
        heading?.level === TROUBLESHOOTING_TOPIC_HEADING_LEVEL;

      return isTroubleshootingTopic
        ? [{ answer: blocks, question: heading.text, source }]
        : collectFaqEntries(blocks, source);
    }),
  );
}

function groupBlocksByHeading(
  blocks: readonly ProseBlock[],
): { blocks: ContentBlock[]; heading: HeadingBlock | null }[] {
  const groups: { blocks: ContentBlock[]; heading: HeadingBlock | null }[] = [
    { blocks: [], heading: null },
  ];
  for (const block of blocks) {
    if (block.type === "heading") {
      groups.push({ blocks: [], heading: block });
    } else {
      groups.at(LAST_GROUP_INDEX)?.blocks.push(block);
    }
  }

  return groups;
}

function collectFaqEntries(
  blocks: readonly ContentBlock[],
  source: TrainingFaqSource,
): TrainingFaqEntry[] {
  return blocks.flatMap((block) => {
    if (block.type !== "callout" || block.title === undefined) {
      return [];
    }
    const title = getInlineText(block.title);
    if (!FAQ_TITLE_PATTERN.test(title)) {
      return [];
    }

    return [createFaqEntry(title.replace(FAQ_TITLE_PATTERN, ""), block.blocks, source)];
  });
}

function createFaqEntry(
  titleQuestion: string,
  blocks: readonly ContentBlock[],
  source: TrainingFaqSource,
): TrainingFaqEntry {
  const [firstBlock, ...remainingBlocks] = blocks;
  if (titleQuestion === "" && firstBlock?.type === "paragraph") {
    return { answer: remainingBlocks, question: getInlineText(firstBlock.content), source };
  }

  return { answer: [...blocks], question: titleQuestion, source };
}

function getInlineText(nodes: readonly InlineNode[]): string {
  return nodes
    .map((node) =>
      node.type === "text" || node.type === "code" ? node.text : getInlineText(node.children),
    )
    .join("")
    .trim();
}

export { GENERAL_FAQ_PAGE_SLUGS, getBehaviorFaq, getBehaviorLabel, getGeneralFaq };
export type { TrainingFaqEntry };
