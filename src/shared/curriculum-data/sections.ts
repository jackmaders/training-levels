import { LEVEL_NUMBERS } from "./curriculum.constants";
import type { LevelNumber, SectionSlug } from "./curriculum.types";

export interface CurriculumSectionMeta {
  folder: string;
  href: string;
  levelNumber?: LevelNumber;
  sectionSlug: SectionSlug;
  title: string;
}

const [LEVEL_ONE, LEVEL_TWO, LEVEL_THREE, LEVEL_FOUR] = LEVEL_NUMBERS;

export const CURRICULUM_SECTIONS: readonly CurriculumSectionMeta[] = [
  {
    folder: "00-theory",
    href: "/theory",
    sectionSlug: "theory",
    title: "Theory",
  },
  {
    folder: "level-1",
    href: "/levels/level-1",
    levelNumber: LEVEL_ONE,
    sectionSlug: "level-1",
    title: "Level 1",
  },
  {
    folder: "level-2",
    href: "/levels/level-2",
    levelNumber: LEVEL_TWO,
    sectionSlug: "level-2",
    title: "Level 2",
  },
  {
    folder: "level-3",
    href: "/levels/level-3",
    levelNumber: LEVEL_THREE,
    sectionSlug: "level-3",
    title: "Level 3",
  },
  {
    folder: "level-4",
    href: "/levels/level-4",
    levelNumber: LEVEL_FOUR,
    sectionSlug: "level-4",
    title: "Level 4",
  },
  {
    folder: "appendices",
    href: "/appendices",
    sectionSlug: "appendices",
    title: "Appendices",
  },
];
