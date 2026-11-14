import { describe, expect, it } from "vite-plus/test";

import {
  getCurriculumPage,
  getCurriculumSyllabus,
  isValidPageSlug,
  isValidStepId,
} from "../curriculum.server";
import type {
  BehaviorCurriculumPage,
  BehaviorStep,
  ContentBlock,
  CurriculumPage,
  InlineNode,
  ProseBlock,
  SyllabusPageEntry,
  SyllabusSection,
} from "../curriculum.types";
import { CURRICULUM_SECTIONS } from "../sections";

const THEORY_PAGE_COUNT = 9;
const LEVEL_1_PAGE_COUNT = 7;
const LEVEL_2_PAGE_COUNT = 17;
const LEVEL_3_PAGE_COUNT = 17;
const LEVEL_4_PAGE_COUNT = 14;
const APPENDICES_PAGE_COUNT = 5;
const TOTAL_PAGE_COUNT = 69;
const TOTAL_BEHAVIOR_COUNT = 47;
const TOTAL_STEP_COUNT = 235;
const STEPS_PER_BEHAVIOR = 5;
const BEHAVIOR_FAMILY_COUNT = 16;
const EXPECTED_SECTION_COUNT = 6;
const EXPECTED_CALLOUT_COUNT = 227;
const STEP_ONE_INDEX = 0;
const STEP_FIVE_INDEX = 4;
const TWO_THINK_ABOUT_SECTIONS = 2;

const CANONICAL_PAGE_HREF_PATTERN = /^\/(?:theory|appendices|levels\/level-[1-4])\/[a-z0-9-]+$/u;
const CANONICAL_INTERNAL_LINK_PATTERN =
  /^\/(?:theory|appendices|levels\/level-[1-4])\/[a-z0-9-]+(?:#step-[1-5])?$/u;

type LinkNode = Extract<InlineNode, { type: "link" }>;

function getBehaviorContentBlockSections(page: BehaviorCurriculumPage): readonly ContentBlock[][] {
  return [
    page.introBlocks,
    page.comebefores,
    page.whereWeAreGoing.extraBlocks,
    page.equipment,
    ...page.thinkAbout.map((section) => section.blocks),
    page.aboutTheCues ?? [],
    page.stepsIntroBlocks,
    ...page.steps.flatMap((step) => [
      step.tryItCold ?? [],
      step.instructions,
      step.comeafters ?? [],
    ]),
  ];
}

function collectInlineNodesFromBlocks(
  blocks: readonly (ContentBlock | ProseBlock)[],
): InlineNode[] {
  const nodes: InlineNode[] = [];
  for (const block of blocks) {
    if (block.type === "paragraph") {
      nodes.push(...block.content);
    } else if (block.type === "list") {
      for (const item of block.items) {
        const childNodes = item.children ? collectInlineNodesFromBlocks(item.children) : [];
        nodes.push(...item.content, ...childNodes);
      }
    } else if (block.type === "blockquote") {
      nodes.push(...collectInlineNodesFromBlocks(block.blocks));
    } else if (block.type === "callout") {
      const titleNodes = block.title ?? [];
      nodes.push(...titleNodes, ...collectInlineNodesFromBlocks(block.blocks));
    }
  }
  return nodes;
}

function collectAllInlineNodes(page: CurriculumPage): InlineNode[] {
  if (page.kind !== "behavior") {
    return collectInlineNodesFromBlocks(page.blocks);
  }
  return [
    ...page.whereWeAreGoing.steps.flatMap((step) => step.content),
    ...getBehaviorContentBlockSections(page).flatMap((blocks) =>
      collectInlineNodesFromBlocks(blocks),
    ),
  ];
}

function flattenLinks(nodes: readonly InlineNode[]): LinkNode[] {
  const links: LinkNode[] = [];
  for (const node of nodes) {
    if (node.type === "link") {
      links.push(node, ...flattenLinks(node.children));
    } else if (node.type === "strong" || node.type === "em") {
      links.push(...flattenLinks(node.children));
    }
  }
  return links;
}

function countCalloutsInBlocks(blocks: readonly (ContentBlock | ProseBlock)[]): number {
  let count = 0;
  for (const block of blocks) {
    if (block.type === "callout") {
      count += 1;
    }
  }
  return count;
}

function countPageCallouts(page: CurriculumPage): number {
  const sections = page.kind === "behavior" ? getBehaviorContentBlockSections(page) : [page.blocks];
  return sections.reduce((total, sectionBlocks) => total + countCalloutsInBlocks(sectionBlocks), 0);
}

function requirePage(pageSlug: string): CurriculumPage {
  const page = getCurriculumPage(pageSlug);
  if (page === null) {
    throw new Error(`Expected curriculum page for ${pageSlug}`);
  }
  return page;
}

function requireBehaviorPage(pageSlug: string): BehaviorCurriculumPage {
  const page = getCurriculumPage(pageSlug);
  if (page?.kind !== "behavior") {
    throw new Error(`Expected behavior page for ${pageSlug}`);
  }
  return page;
}

function getSyllabusPageEntries(): SyllabusPageEntry[] {
  return getCurriculumSyllabus().sections.flatMap((section) => section.pages);
}

function getAllLoadedPages(): CurriculumPage[] {
  return getSyllabusPageEntries()
    .map((entry) => getCurriculumPage(entry.pageSlug))
    .filter((page): page is CurriculumPage => page !== null);
}

function getInternalHrefs(page: CurriculumPage): string[] {
  return flattenLinks(collectAllInlineNodes(page))
    .filter((link) => !link.external)
    .map((link) => link.href);
}

function isPlainInstructionStep(step: BehaviorStep): boolean {
  return step.tryItCold === null && step.comeafters === null && step.instructions.length > 0;
}

function isUnresolvedMarkdownLink(link: LinkNode): boolean {
  return !link.external && link.href.includes(".md");
}

function isExternalLinkTo(link: LinkNode, targetHref: string): boolean {
  return link.external && link.href === targetHref;
}

function toCanonicalPageHref(pageSlug: string): string {
  if (pageSlug.startsWith("level-")) {
    return `/levels/${pageSlug}`;
  }
  return `/${pageSlug}`;
}

function doesNavRefMatchTarget(
  ref: { href: string; pageSlug: string } | null,
  expectedHrefBySlug: ReadonlyMap<string, string>,
): boolean {
  if (ref === null) {
    return true;
  }
  return expectedHrefBySlug.get(ref.pageSlug) === ref.href;
}

function isValidInternalLinkTarget(
  href: string,
  pageByHref: ReadonlyMap<string, CurriculumPage>,
): boolean {
  if (!CANONICAL_INTERNAL_LINK_PATTERN.test(href)) {
    return false;
  }
  const [baseHref, fragment] = href.split("#");
  const targetPage = baseHref === undefined ? undefined : pageByHref.get(baseHref);
  if (targetPage === undefined) {
    return false;
  }
  if (fragment === undefined) {
    return true;
  }
  return (
    targetPage.kind === "behavior" && targetPage.steps.some((step) => step.anchor === fragment)
  );
}

function toSectionSummary(
  section: Pick<SyllabusSection, "href" | "levelNumber" | "sectionSlug" | "title">,
) {
  const summary: {
    href: string;
    levelNumber?: SyllabusSection["levelNumber"];
    sectionSlug: SyllabusSection["sectionSlug"];
    title: string;
  } = {
    href: section.href,
    sectionSlug: section.sectionSlug,
    title: section.title,
  };
  if (section.levelNumber !== undefined) {
    summary.levelNumber = section.levelNumber;
  }
  return summary;
}

function hasCanonicalPageHref(page: { href: string; pageSlug: string }): boolean {
  return (
    CANONICAL_PAGE_HREF_PATTERN.test(page.href) && page.href === toCanonicalPageHref(page.pageSlug)
  );
}

function hasValidAdjacentNavRefs(
  page: CurriculumPage,
  hrefBySlug: ReadonlyMap<string, string>,
): boolean {
  return (
    doesNavRefMatchTarget(page.previousPage, hrefBySlug) &&
    doesNavRefMatchTarget(page.nextPage, hrefBySlug)
  );
}

function getEntryStepIds(entry: SyllabusPageEntry): readonly string[] {
  return entry.stepIds ?? [];
}

describe("curriculum.server", () => {
  it("returns the canonical 69-page syllabus ordered by section and index.md", () => {
    expect.assertions(4);

    // Act
    const syllabus = getCurriculumSyllabus();
    const sectionCounts = syllabus.sections.map((section) => ({
      count: section.pages.length,
      sectionSlug: section.sectionSlug,
    }));

    // Assert
    expect(syllabus.sections).toHaveLength(EXPECTED_SECTION_COUNT);
    expect(syllabus).toMatchObject({
      totalBehaviors: TOTAL_BEHAVIOR_COUNT,
      totalPages: TOTAL_PAGE_COUNT,
      totalSteps: TOTAL_STEP_COUNT,
    });
    expect(sectionCounts).toStrictEqual([
      { count: THEORY_PAGE_COUNT, sectionSlug: "theory" },
      { count: LEVEL_1_PAGE_COUNT, sectionSlug: "level-1" },
      { count: LEVEL_2_PAGE_COUNT, sectionSlug: "level-2" },
      { count: LEVEL_3_PAGE_COUNT, sectionSlug: "level-3" },
      { count: LEVEL_4_PAGE_COUNT, sectionSlug: "level-4" },
      { count: APPENDICES_PAGE_COUNT, sectionSlug: "appendices" },
    ]);
    expect(syllabus.sections[0]?.pages[0]?.pageSlug).toBe("theory/01-foreword");
  });

  it("exposes 16 unique behavior families across behavior pages", () => {
    expect.assertions(1);

    // Arrange
    const behaviorEntries = getSyllabusPageEntries().filter((entry) => entry.kind === "behavior");

    // Act
    const uniqueFamilies = new Set(behaviorEntries.map((entry) => entry.behaviorFamily));

    // Assert
    expect(uniqueFamilies.size).toBe(BEHAVIOR_FAMILY_COUNT);
  });

  it("assigns 5 step IDs to every behavior page", () => {
    expect.assertions(1);

    // Arrange
    const behaviorEntries = getSyllabusPageEntries().filter((entry) => entry.kind === "behavior");

    // Act
    const allHaveFiveSteps = behaviorEntries.every(
      (entry) => entry.stepIds?.length === STEPS_PER_BEHAVIOR,
    );

    // Assert
    expect(allHaveFiveSteps).toBe(true);
  });

  it.each(["level-1/nonexistent", "theory/nonexistent"])(
    "returns null for unknown page slug %s",
    (pageSlug) => {
      expect.assertions(1);

      // Act
      const page = getCurriculumPage(pageSlug);

      // Assert
      expect(page).toBeNull();
    },
  );

  it("populates previousPage and nextPage navigation refs for behavior pages", () => {
    expect.assertions(2);

    // Act
    const zen = requireBehaviorPage("level-1/zen");

    // Assert
    expect(zen.previousPage?.pageSlug).toBe("level-1/00-overview");
    expect(zen.nextPage?.pageSlug).toBe("level-1/come");
  });

  it("rewrites internal markdown links to canonical route paths and step anchors", () => {
    expect.assertions(2);

    // Arrange
    const zen = requireBehaviorPage("level-1/zen");

    // Act
    const internalHrefs = getInternalHrefs(zen);

    // Assert
    expect(internalHrefs).toContain("/theory/07-the-thinking-of-training");
    expect(internalHrefs).toContain("/levels/level-1/come#step-1");
  });

  it("parses optional tryItCold sections on behavior steps", () => {
    expect.assertions(1);

    // Act
    const zen = requireBehaviorPage("level-1/zen");

    // Assert
    expect(zen.steps[STEP_ONE_INDEX]?.tryItCold).not.toBeNull();
  });

  it("preserves where-we-are-going callout blocks on level-1/target", () => {
    expect.assertions(1);

    // Act
    const target = requireBehaviorPage("level-1/target");

    // Assert
    expect(target.whereWeAreGoing.extraBlocks[0]?.type).toBe("callout");
  });

  it("handles missing optional blocks on level-2/tricks", () => {
    expect.assertions(3);

    // Act
    const tricks = requireBehaviorPage("level-2/tricks");
    const allTricksStepsPlain = tricks.steps.every(isPlainInstructionStep);

    // Assert
    expect(tricks.aboutTheCues).toBeNull();
    expect(allTricksStepsPlain).toBe(true);
    expect(tricks.steps[STEP_FIVE_INDEX]?.instructions.length).toBeGreaterThan(0);
  });

  it("parses multiple think-about sections on level-2/go-to-mat", () => {
    expect.assertions(1);

    // Act
    const goToMat = requireBehaviorPage("level-2/go-to-mat");

    // Assert
    expect(goToMat.thinkAbout).toHaveLength(TWO_THINK_ABOUT_SECTIONS);
  });

  it("parses all 5 steps when level-4 pages use thematic dividers", () => {
    expect.assertions(1);

    // Act
    const level4Zen = requireBehaviorPage("level-4/zen");

    // Assert
    expect(level4Zen.steps).toHaveLength(STEPS_PER_BEHAVIOR);
  });

  it("preserves the appendix-c title", () => {
    expect.assertions(1);

    // Act
    const appendixC = getCurriculumPage("appendices/appendix-c-list-of-possible-tricks");

    // Assert
    expect(appendixC?.title).toBe("Monkey in the Middle");
  });

  it("preserves external resource links on appendix-d", () => {
    expect.assertions(1);

    // Arrange
    const appendixD = requirePage("appendices/appendix-d-list-of-resources");

    // Act
    const appendixDLinks = flattenLinks(collectAllInlineNodes(appendixD));

    // Assert
    expect(appendixDLinks.some((link) => isExternalLinkTo(link, "https://www.dogwise.com"))).toBe(
      true,
    );
  });

  it("loads all 69 pages referenced in the syllabus", () => {
    expect.assertions(1);

    // Act
    const pages = getAllLoadedPages();

    // Assert
    expect(pages).toHaveLength(TOTAL_PAGE_COUNT);
  });

  it("preserves all 227 callouts across all 69 pages", () => {
    expect.assertions(1);

    // Arrange
    const pages = getAllLoadedPages();

    // Act
    const totalCallouts = pages.reduce((sum, page) => sum + countPageCallouts(page), 0);

    // Assert
    expect(totalCallouts).toBe(EXPECTED_CALLOUT_COUNT);
  });

  it("leaves zero unresolved .md links across all 69 pages", () => {
    expect.assertions(1);

    // Arrange
    const pages = getAllLoadedPages();

    // Act
    const unresolvedLinks = pages
      .flatMap((page) => flattenLinks(collectAllInlineNodes(page)))
      .filter((link) => isUnresolvedMarkdownLink(link));

    // Assert
    expect(unresolvedLinks).toHaveLength(0);
  });

  it.each([
    ["level-1/zen", true],
    ["level-1/nonexistent", false],
  ] as const)("isValidPageSlug(%s) returns %s", (pageSlug, expected) => {
    expect.assertions(1);

    // Act
    const result = isValidPageSlug(pageSlug);

    // Assert
    expect(result).toBe(expected);
  });

  it.each([
    ["level-1/zen:step-1", true],
    ["level-1/zen:step-6", false],
    ["level-1/00-overview:step-1", false],
  ] as const)("isValidStepId(%s) returns %s", (stepId, expected) => {
    expect.assertions(1);

    // Act
    const result = isValidStepId(stepId);

    // Assert
    expect(result).toBe(expected);
  });

  it("matches syllabus section headers against CURRICULUM_SECTIONS metadata", () => {
    expect.assertions(1);

    // Arrange
    const syllabus = getCurriculumSyllabus();
    const expectedSections = CURRICULUM_SECTIONS.map((meta) => toSectionSummary(meta));

    // Act
    const sectionHeaders = syllabus.sections.map((section) => toSectionSummary(section));

    // Assert
    expect(sectionHeaders).toStrictEqual(expectedSections);
  });

  it("uses canonical route hrefs on all syllabus page entries", () => {
    expect.assertions(1);

    // Arrange
    const syllabusPages = getSyllabusPageEntries();

    // Act
    const allSyllabusPagesCanonical = syllabusPages.every((entry) => hasCanonicalPageHref(entry));

    // Assert
    expect(allSyllabusPagesCanonical).toBe(true);
  });

  it("uses canonical route hrefs on all loaded curriculum pages", () => {
    expect.assertions(1);

    // Arrange
    const pages = getAllLoadedPages();

    // Act
    const allPagesCanonical = pages.every((page) => hasCanonicalPageHref(page));

    // Assert
    expect(allPagesCanonical).toBe(true);
  });

  it("resolves adjacent navigation refs across all 69 pages", () => {
    expect.assertions(1);

    // Arrange
    const pages = getAllLoadedPages();
    const hrefBySlug = new Map(pages.map((page) => [page.pageSlug, page.href]));

    // Act
    const allNavRefsValid = pages.every((page) => hasValidAdjacentNavRefs(page, hrefBySlug));

    // Assert
    expect(allNavRefsValid).toBe(true);
  });

  it("resolves every internal link and fragment anchor across all 69 pages", () => {
    expect.assertions(1);

    // Arrange
    const pages = getAllLoadedPages();
    const pageByHref = new Map(pages.map((page) => [page.href, page]));

    // Act
    const allInternalLinksValid = pages
      .flatMap((page) => getInternalHrefs(page))
      .every((href) => isValidInternalLinkTarget(href, pageByHref));

    // Assert
    expect(allInternalLinksValid).toBe(true);
  });

  it("validates every syllabus step ID with isValidStepId", () => {
    expect.assertions(1);

    // Arrange
    const syllabusPages = getSyllabusPageEntries();

    // Act
    const allStepIdsValid = syllabusPages
      .flatMap((entry) => getEntryStepIds(entry))
      .every((stepId) => isValidStepId(stepId));

    // Assert
    expect(allStepIdsValid).toBe(true);
  });
});
