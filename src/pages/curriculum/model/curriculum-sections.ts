import {
  CURRICULUM_SECTIONS,
  type CurriculumSectionMeta,
  type SectionSlug,
} from "@/shared/curriculum-data";

function getCurriculumSectionMeta(sectionSlug: SectionSlug): CurriculumSectionMeta {
  const section = CURRICULUM_SECTIONS.find((entry) => entry.sectionSlug === sectionSlug);
  if (section === undefined) {
    throw new Error(`Unknown curriculum section: ${sectionSlug}`);
  }
  return section;
}

export { getCurriculumSectionMeta };
