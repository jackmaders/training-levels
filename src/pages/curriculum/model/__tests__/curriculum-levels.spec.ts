import { describe, expect, it } from "vite-plus/test";

import { TEST_SYLLABUS, createSyllabusFixture } from "@test/vitest/fixtures/curriculum";

import {
  formatStepSummary,
  getBehaviorProgress,
  getLevelAdjacentPages,
  getLevelSections,
  getSectionFirstPage,
  getSectionProgress,
  isLevelSectionSlug,
  parseInternalLevelHref,
  parseLevelRouteParams,
  toLevelRouteParams,
} from "../curriculum-levels";

function requireFirst<TItem>(items: readonly TItem[]): TItem {
  const [first] = items;
  if (first === undefined) {
    throw new Error("Expected at least one item");
  }
  return first;
}

describe("curriculum-levels model", () => {
  describe("level section slug guard", () => {
    it.each([
      ["level-1", true],
      ["level-2", true],
      ["level-3", true],
      ["level-4", true],
      ["theory", false],
      ["appendices", false],
      ["level-5", false],
    ] as const)("returns %s for section slug %s", (slug, expected) => {
      expect.assertions(1);

      // Act
      const result = isLevelSectionSlug(slug);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe("route parameter parsing", () => {
    it("returns normalized section and pageSlug for valid level route params", () => {
      expect.assertions(1);

      // Act
      const result = parseLevelRouteParams("level-1", "zen");

      // Assert
      expect(result).toStrictEqual({
        page: "zen",
        pageSlug: "level-1/zen",
        section: "level-1",
      });
    });

    it.each([
      ["theory", "01-foreword"],
      ["appendices", "appendix-a"],
      ["level-5", "zen"],
      ["level-1", "../bad"],
      ["level-1", ""],
    ] as const)("returns null for non-level or malformed params (%s, %s)", (section, page) => {
      expect.assertions(1);

      // Act
      const result = parseLevelRouteParams(section, page);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("pageSlug to route parameter conversion", () => {
    it("parses valid level pageSlug into section and page params", () => {
      expect.assertions(1);

      // Act
      const result = toLevelRouteParams("level-2/00-overview");

      // Assert
      expect(result).toStrictEqual({ page: "00-overview", section: "level-2" });
    });

    it.each(["theory/01-foreword", "level-1", "level-1/zen/extra", "level-1/"])(
      "returns null for non-level or malformed pageSlug %s",
      (pageSlug) => {
        expect.assertions(1);

        // Act
        const result = toLevelRouteParams(pageSlug);

        // Assert
        expect(result).toBeNull();
      },
    );
  });

  describe("internal level link parsing", () => {
    it("parses level href with step fragment into route params and hash", () => {
      expect.assertions(1);

      // Act
      const result = parseInternalLevelHref("/levels/level-1/come#step-2");

      // Assert
      expect(result).toStrictEqual({
        hash: "step-2",
        params: { page: "come", section: "level-1" },
      });
    });

    it("parses level href without fragment and omits empty hash", () => {
      expect.assertions(1);

      // Act
      const result = parseInternalLevelHref("/levels/level-1/zen#");

      // Assert
      expect(result).toStrictEqual({
        params: { page: "zen", section: "level-1" },
      });
    });

    it.each(["/theory/07-the-thinking-of-training", "/appendices/appendix-a", "/levels/level-5/a"])(
      "returns null for non-level href %s",
      (href) => {
        expect.assertions(1);

        // Act
        const result = parseInternalLevelHref(href);

        // Assert
        expect(result).toBeNull();
      },
    );
  });

  describe("level section filtering", () => {
    it("filters syllabus sections to Levels 1-4 and excludes Theory and Appendices", () => {
      expect.assertions(1);

      // Act
      const sections = getLevelSections(TEST_SYLLABUS);

      // Assert
      expect(sections.map((section) => section.sectionSlug)).toStrictEqual(["level-1", "level-2"]);
    });
  });

  describe("step summary formatting", () => {
    it("strips the Step N prefix from step heading", () => {
      expect.assertions(1);

      // Act
      const summary = formatStepSummary("Step 3:   Lower open hand toward floor");

      // Assert
      expect(summary).toBe("Lower open hand toward floor");
    });

    it("preserves heading when Step prefix is absent", () => {
      expect.assertions(1);

      // Act
      const summary = formatStepSummary("Hold steady for five seconds");

      // Assert
      expect(summary).toBe("Hold steady for five seconds");
    });
  });

  describe("behavior progress rollup", () => {
    it("computes completed count, total count, and rounded percentage", () => {
      expect.assertions(1);

      // Arrange
      const stepIds = [
        "level-1/zen:step-1",
        "level-1/zen:step-2",
        "level-1/zen:step-3",
        "level-1/zen:step-4",
        "level-1/zen:step-5",
      ];
      const completedStepIds = new Set(["level-1/zen:step-1", "level-1/zen:step-3"]);

      // Act
      const progress = getBehaviorProgress(stepIds, completedStepIds);

      // Assert
      expect(progress).toStrictEqual({
        completedCount: 2,
        percent: 40,
        totalCount: 5,
      });
    });

    it("returns zero percent when stepIds is empty", () => {
      expect.assertions(1);

      // Act
      const progress = getBehaviorProgress([], new Set(["level-1/zen:step-1"]));

      // Assert
      expect(progress).toStrictEqual({
        completedCount: 0,
        percent: 0,
        totalCount: 0,
      });
    });
  });

  describe("section progress rollup", () => {
    it("aggregates step progress across all behaviors in a Level section", () => {
      expect.assertions(1);

      // Arrange
      const level1 = requireFirst(getLevelSections(TEST_SYLLABUS));
      const completedStepIds = new Set([
        "level-1/zen:step-1",
        "level-1/zen:step-2",
        "level-1/come:step-1",
      ]);

      // Act
      const progress = getSectionProgress(level1, completedStepIds);

      // Assert
      expect(progress).toStrictEqual({
        completedCount: 3,
        percent: 30,
        totalCount: 10,
      });
    });
  });

  describe("level-scoped adjacent page lookup", () => {
    it("returns null previousPage at first Level 1 page and links forward to Zen", () => {
      expect.assertions(2);

      // Act
      const adjacent = getLevelAdjacentPages(TEST_SYLLABUS, "level-1/00-overview");

      // Assert
      expect(adjacent.previousPage).toBeNull();
      expect(adjacent.nextPage?.pageSlug).toBe("level-1/zen");
    });

    it("links across Level boundary from Level 1 homework to Level 2 overview", () => {
      expect.assertions(2);

      // Act
      const adjacent = getLevelAdjacentPages(TEST_SYLLABUS, "level-1/homework");

      // Assert
      expect(adjacent.previousPage?.pageSlug).toBe("level-1/come");
      expect(adjacent.nextPage?.pageSlug).toBe("level-2/00-overview");
    });

    it("returns null nextPage at the final Level page", () => {
      expect.assertions(2);

      // Act
      const adjacent = getLevelAdjacentPages(TEST_SYLLABUS, "level-2/zen");

      // Assert
      expect(adjacent.previousPage?.pageSlug).toBe("level-2/00-overview");
      expect(adjacent.nextPage).toBeNull();
    });

    it("returns null for both adjacent pages when pageSlug is not in Levels", () => {
      expect.assertions(1);

      // Act
      const adjacent = getLevelAdjacentPages(TEST_SYLLABUS, "theory/01-foreword");

      // Assert
      expect(adjacent).toStrictEqual({ nextPage: null, previousPage: null });
    });
  });

  describe("section landing page lookup", () => {
    it("returns the first page entry in a section", () => {
      expect.assertions(1);

      // Arrange
      const level1 = requireFirst(getLevelSections(TEST_SYLLABUS));

      // Act
      const firstPage = getSectionFirstPage(level1);

      // Assert
      expect(firstPage?.pageSlug).toBe("level-1/00-overview");
    });

    it("returns null when section has no pages", () => {
      expect.assertions(1);

      // Arrange
      const emptySyllabus = createSyllabusFixture({
        sections: [
          {
            href: "/levels/level-1",
            levelNumber: 1,
            pages: [],
            sectionSlug: "level-1",
            title: "Level 1",
          },
        ],
      });
      const emptySection = requireFirst(getLevelSections(emptySyllabus));

      // Act
      const firstPage = getSectionFirstPage(emptySection);

      // Assert
      expect(firstPage).toBeNull();
    });
  });
});
