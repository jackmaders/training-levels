import { describe, expect, it } from "vite-plus/test";

import { LEVEL_NUMBERS } from "../curriculum.constants";
import { CURRICULUM_SECTIONS } from "../sections";

describe("curriculum sections metadata", () => {
  it("lists sections in canonical book order", () => {
    expect.assertions(1);

    // Act
    const sectionSlugs = CURRICULUM_SECTIONS.map((section) => section.sectionSlug);

    // Assert
    expect(sectionSlugs).toStrictEqual([
      "theory",
      "level-1",
      "level-2",
      "level-3",
      "level-4",
      "appendices",
    ]);
  });

  it("derives level section metadata consistently from LEVEL_NUMBERS", () => {
    expect.assertions(1);

    // Arrange
    const expectedLevelSections = LEVEL_NUMBERS.map((levelNumber) => ({
      folder: `level-${levelNumber}`,
      href: `/levels/level-${levelNumber}`,
      levelNumber,
      sectionSlug: `level-${levelNumber}`,
      title: `Level ${levelNumber}`,
    }));

    // Act
    const levelSections = CURRICULUM_SECTIONS.filter(
      (section) => section.levelNumber !== undefined,
    );

    // Assert
    expect(levelSections).toStrictEqual(expectedLevelSections);
  });

  it.each([
    { folder: "00-theory", href: "/theory", sectionSlug: "theory", title: "Theory" },
    { folder: "appendices", href: "/appendices", sectionSlug: "appendices", title: "Appendices" },
  ] as const)(
    "defines non-level $sectionSlug section metadata without levelNumber",
    ({ folder, href, sectionSlug, title }) => {
      expect.assertions(1);

      // Act
      const section = CURRICULUM_SECTIONS.find((entry) => entry.sectionSlug === sectionSlug);

      // Assert
      expect(section).toStrictEqual({ folder, href, sectionSlug, title });
    },
  );
});
