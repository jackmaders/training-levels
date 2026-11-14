import { describe, expect, it } from "vite-plus/test";

import { CURRICULUM_SECTIONS } from "../sections";

const EXPECTED_SECTIONS = [
  {
    folder: "00-theory",
    href: "/theory",
    sectionSlug: "theory",
    title: "Theory",
  },
  {
    folder: "level-1",
    href: "/levels/level-1",
    levelNumber: 1,
    sectionSlug: "level-1",
    title: "Level 1",
  },
  {
    folder: "level-2",
    href: "/levels/level-2",
    levelNumber: 2,
    sectionSlug: "level-2",
    title: "Level 2",
  },
  {
    folder: "level-3",
    href: "/levels/level-3",
    levelNumber: 3,
    sectionSlug: "level-3",
    title: "Level 3",
  },
  {
    folder: "level-4",
    href: "/levels/level-4",
    levelNumber: 4,
    sectionSlug: "level-4",
    title: "Level 4",
  },
  {
    folder: "appendices",
    href: "/appendices",
    sectionSlug: "appendices",
    title: "Appendices",
  },
] as const;

describe("curriculum sections metadata", () => {
  it("defines canonical folders, slugs, titles, level numbers, and hrefs in book order", () => {
    expect.assertions(1);

    // Arrange & Act
    const sections = CURRICULUM_SECTIONS;

    // Assert
    expect(sections).toStrictEqual(EXPECTED_SECTIONS);
  });
});
