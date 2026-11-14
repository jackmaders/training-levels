import { describe, expect, it } from "vite-plus/test";

import { CURRICULUM_SECTIONS, type SectionSlug } from "@/shared/curriculum-data";

import { getCurriculumSectionMeta } from "../curriculum-sections";

describe("curriculum sections helper", () => {
  it.each(CURRICULUM_SECTIONS)(
    "returns shared CURRICULUM_SECTIONS metadata for $sectionSlug",
    (expectedSection) => {
      expect.assertions(1);

      // Act
      const sectionMeta = getCurriculumSectionMeta(expectedSection.sectionSlug);

      // Assert
      expect(sectionMeta).toStrictEqual(expectedSection);
    },
  );

  it("throws when asked for an unknown curriculum section slug", () => {
    expect.assertions(1);

    // Arrange
    const unknownSlug = "unknown" as SectionSlug;

    // Act
    function lookupUnknown() {
      getCurriculumSectionMeta(unknownSlug);
    }

    // Assert
    expect(lookupUnknown).toThrow("Unknown curriculum section: unknown");
  });
});
