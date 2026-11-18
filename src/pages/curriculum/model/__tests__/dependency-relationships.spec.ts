import { describe, expect, it } from "vite-plus/test";

import syllabus from "@/shared/curriculum-data/data/syllabus.json";

import {
  getPrerequisiteChain,
  MAIN_QUEST_RELATIONSHIPS,
  validateDependencyRelationships,
} from "../dependency-relationships";

const CURRICULUM_PAGE_SLUGS = syllabus.sections.flatMap((section) =>
  section.pages.map((page) => page.pageSlug),
);

describe("curriculum dependency relationships", () => {
  it("keeps the documented Go To Mat and Relax co-practice relationship non-blocking", () => {
    expect.assertions(3);

    // Arrange
    // Act
    const valid = validateDependencyRelationships(CURRICULUM_PAGE_SLUGS);
    const goToMatPrerequisites = getPrerequisiteChain("level-2/go-to-mat");
    const goToMatRelaxGates = MAIN_QUEST_RELATIONSHIPS.filter(({ kind }) => kind === "prerequisite")
      .filter(({ sourcePageSlug }) =>
        ["level-2/go-to-mat", "level-2/relax"].includes(sourcePageSlug),
      )
      .filter(({ targetPageSlug }) =>
        ["level-2/go-to-mat", "level-2/relax"].includes(targetPageSlug),
      );

    // Assert
    expect(valid).toBe(true);
    expect(goToMatPrerequisites).toStrictEqual(["level-1/down", "level-2/down"]);
    expect(goToMatRelaxGates).toStrictEqual([]);
  });

  it("includes each linked foundation in Retrieve's prerequisite chain", () => {
    expect.assertions(1);
    // Arrange & Act
    const chain = getPrerequisiteChain("level-3/retrieve");

    // Assert
    expect(chain).toStrictEqual([
      "level-1/target",
      "level-2/target",
      "level-1/zen",
      "level-1/come",
      "level-1/sit",
    ]);
  });
});
