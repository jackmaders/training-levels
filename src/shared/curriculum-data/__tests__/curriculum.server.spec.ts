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
import { CURRICULUM_SECTIONS, type CurriculumSectionMeta } from "../sections";

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

type LinkNode = Extract<InlineNode, { type: "link" }>;

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
    ...collectInlineNodesFromBlocks(page.introBlocks),
    ...collectInlineNodesFromBlocks(page.comebefores),
    ...page.whereWeAreGoing.steps.flatMap((step) => step.content),
    ...collectInlineNodesFromBlocks(page.whereWeAreGoing.extraBlocks),
    ...collectInlineNodesFromBlocks(page.equipment),
    ...page.thinkAbout.flatMap((section) => collectInlineNodesFromBlocks(section.blocks)),
    ...(page.aboutTheCues ? collectInlineNodesFromBlocks(page.aboutTheCues) : []),
    ...collectInlineNodesFromBlocks(page.stepsIntroBlocks),
    ...page.steps.flatMap((step) => [
      ...(step.tryItCold ? collectInlineNodesFromBlocks(step.tryItCold) : []),
      ...collectInlineNodesFromBlocks(step.instructions),
      ...(step.comeafters ? collectInlineNodesFromBlocks(step.comeafters) : []),
    ]),
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
  if (page.kind !== "behavior") {
    return countCalloutsInBlocks(page.blocks);
  }
  const sections: readonly ContentBlock[][] = [
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

const CANONICAL_PAGE_HREF_PATTERN = /^\/(?:theory|appendices|levels\/level-[1-4])\/[a-z0-9-]+$/u;
const CANONICAL_INTERNAL_LINK_PATTERN =
  /^\/(?:theory|appendices|levels\/level-[1-4])\/[a-z0-9-]+(?:#step-[1-5])?$/u;

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

function toSectionHeaderSummary(section: SyllabusSection) {
  const summary: {
    href: string;
    levelNumber?: CurriculumSectionMeta["levelNumber"];
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

function toExpectedSectionSummary(meta: CurriculumSectionMeta) {
  const summary: {
    href: string;
    levelNumber?: CurriculumSectionMeta["levelNumber"];
    sectionSlug: CurriculumSectionMeta["sectionSlug"];
    title: string;
  } = {
    href: meta.href,
    sectionSlug: meta.sectionSlug,
    title: meta.title,
  };
  if (meta.levelNumber !== undefined) {
    summary.levelNumber = meta.levelNumber;
  }
  return summary;
}

function isCanonicalSyllabusEntry(entry: SyllabusPageEntry): boolean {
  return (
    CANONICAL_PAGE_HREF_PATTERN.test(entry.href) &&
    entry.href === toCanonicalPageHref(entry.pageSlug)
  );
}

function isCanonicalCurriculumPage(page: CurriculumPage): boolean {
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

    // Arrange & Act
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

  it("exposes 16 unique behavior families with 5 step IDs each", () => {
    expect.assertions(2);

    // Arrange
    const syllabus = getCurriculumSyllabus();
    const behaviorEntries = syllabus.sections
      .flatMap((section) => section.pages)
      .filter((entry) => entry.kind === "behavior");

    // Act
    const uniqueFamilies = new Set(behaviorEntries.map((entry) => entry.behaviorFamily));
    const allHaveFiveSteps = behaviorEntries.every(
      (entry) => entry.stepIds?.length === STEPS_PER_BEHAVIOR,
    );

    // Assert
    expect(uniqueFamilies.size).toBe(BEHAVIOR_FAMILY_COUNT);
    expect(allHaveFiveSteps).toBe(true);
  });

  it("returns null for unknown page slugs", () => {
    expect.assertions(2);

    // Arrange & Act
    const unknownBehavior = getCurriculumPage("level-1/nonexistent");
    const unknownTheory = getCurriculumPage("theory/nonexistent");

    // Assert
    expect(unknownBehavior).toBeNull();
    expect(unknownTheory).toBeNull();
  });

  it("returns structured behavior pages with rewritten internal links and anchors", () => {
    expect.assertions(5);

    // Arrange
    const zen = requireBehaviorPage("level-1/zen");

    // Act
    const internalHrefs = getInternalHrefs(zen);

    // Assert
    expect(zen.previousPage?.pageSlug).toBe("level-1/00-overview");
    expect(zen.nextPage?.pageSlug).toBe("level-1/come");
    expect(internalHrefs).toContain("/theory/07-the-thinking-of-training");
    expect(internalHrefs).toContain("/levels/level-1/come#step-1");
    expect(zen.steps[STEP_ONE_INDEX]?.tryItCold).not.toBeNull();
  });

  it("handles level-2/tricks, level-2/go-to-mat, level-1/target callout, and level-4 dividers", () => {
    expect.assertions(5);

    // Arrange
    const target = requireBehaviorPage("level-1/target");
    const tricks = requireBehaviorPage("level-2/tricks");
    const goToMat = requireBehaviorPage("level-2/go-to-mat");
    const level4Zen = requireBehaviorPage("level-4/zen");

    // Act
    const allTricksStepsPlain = tricks.steps.every(isPlainInstructionStep);

    // Assert
    expect(target.whereWeAreGoing.extraBlocks[0]?.type).toBe("callout");
    expect(tricks.aboutTheCues).toBeNull();
    expect(allTricksStepsPlain).toBe(true);
    expect(goToMat.thinkAbout).toHaveLength(TWO_THINK_ABOUT_SECTIONS);
    expect(level4Zen.steps).toHaveLength(STEPS_PER_BEHAVIOR);
  });

  it("handles appendix-c title and appendix-d external resource links", () => {
    expect.assertions(3);

    // Arrange
    const tricks = requireBehaviorPage("level-2/tricks");
    const appendixC = getCurriculumPage("appendices/appendix-c-list-of-possible-tricks");
    const appendixD = requirePage("appendices/appendix-d-list-of-resources");

    // Act
    const appendixDLinks = flattenLinks(collectAllInlineNodes(appendixD));

    // Assert
    expect(tricks.steps[STEP_FIVE_INDEX]?.instructions.length).toBeGreaterThan(0);
    expect(appendixC?.title).toBe("Monkey in the Middle");
    expect(appendixDLinks.some((link) => isExternalLinkTo(link, "https://www.dogwise.com"))).toBe(
      true,
    );
  });

  it("preserves all 227 callouts and leaves zero unresolved .md links across all 69 pages", () => {
    expect.assertions(3);

    // Arrange
    const syllabus = getCurriculumSyllabus();
    const allSlugs = syllabus.sections.flatMap((section) =>
      section.pages.map((page) => page.pageSlug),
    );

    // Act
    const pages = allSlugs
      .map((slug) => getCurriculumPage(slug))
      .filter((page): page is CurriculumPage => page !== null);
    const totalCallouts = pages.reduce((sum, page) => sum + countPageCallouts(page), 0);
    const unresolvedLinks = pages
      .flatMap((page) => flattenLinks(collectAllInlineNodes(page)))
      .filter((link) => isUnresolvedMarkdownLink(link));

    // Assert
    expect(pages).toHaveLength(TOTAL_PAGE_COUNT);
    expect(totalCallouts).toBe(EXPECTED_CALLOUT_COUNT);
    expect(unresolvedLinks).toHaveLength(0);
  });

  it("validates canonical page slugs and step IDs", () => {
    expect.assertions(5);

    // Arrange & Act & Assert
    expect(isValidPageSlug("level-1/zen")).toBe(true);
    expect(isValidPageSlug("level-1/nonexistent")).toBe(false);
    expect(isValidStepId("level-1/zen:step-1")).toBe(true);
    expect(isValidStepId("level-1/zen:step-6")).toBe(false);
    expect(isValidStepId("level-1/00-overview:step-1")).toBe(false);
  });

  it("matches section metadata and canonical page hrefs across all 69 pages", () => {
    expect.assertions(3);

    // Arrange
    const syllabus = getCurriculumSyllabus();
    const syllabusPages = syllabus.sections.flatMap((section) => section.pages);
    const pages = syllabusPages
      .map((entry) => getCurriculumPage(entry.pageSlug))
      .filter((page): page is CurriculumPage => page !== null);

    // Act
    const sectionHeaders = syllabus.sections.map((section) => toSectionHeaderSummary(section));
    const expectedSections = CURRICULUM_SECTIONS.map((meta) => toExpectedSectionSummary(meta));
    const allSyllabusPagesCanonical = syllabusPages.every((entry) =>
      isCanonicalSyllabusEntry(entry),
    );
    const allPagesCanonical = pages.every((page) => isCanonicalCurriculumPage(page));

    // Assert
    expect(sectionHeaders).toStrictEqual(expectedSections);
    expect(allSyllabusPagesCanonical).toBe(true);
    expect(allPagesCanonical).toBe(true);
  });

  it("resolves adjacent navigation refs, internal links, and step IDs across all 69 pages", () => {
    expect.assertions(3);

    // Arrange
    const syllabus = getCurriculumSyllabus();
    const syllabusPages = syllabus.sections.flatMap((section) => section.pages);
    const pages = syllabusPages
      .map((entry) => getCurriculumPage(entry.pageSlug))
      .filter((page): page is CurriculumPage => page !== null);
    const hrefBySlug = new Map(pages.map((page) => [page.pageSlug, page.href]));
    const pageByHref = new Map(pages.map((page) => [page.href, page]));

    // Act
    const allNavRefsValid = pages.every((page) => hasValidAdjacentNavRefs(page, hrefBySlug));
    const allInternalLinksValid = pages
      .flatMap((page) => getInternalHrefs(page))
      .every((href) => isValidInternalLinkTarget(href, pageByHref));
    const allStepIdsValid = syllabusPages
      .flatMap((entry) => getEntryStepIds(entry))
      .every((stepId) => isValidStepId(stepId));

    // Assert
    expect(allNavRefsValid).toBe(true);
    expect(allInternalLinksValid).toBe(true);
    expect(allStepIdsValid).toBe(true);
  });
});
