import { PRACTICE_GUIDANCE_LEVEL_FOUR_ADVANCED } from "./practice-guidance-level-four-advanced";
import { PRACTICE_GUIDANCE_LEVEL_FOUR_FOUNDATIONS } from "./practice-guidance-level-four-foundations";
import { PRACTICE_GUIDANCE_LEVEL_FOUR_SKILLS } from "./practice-guidance-level-four-skills";
import { PRACTICE_GUIDANCE_LEVEL_FOUR_STAYS } from "./practice-guidance-level-four-stays";
import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_FOUR: Readonly<Record<string, BehaviorRule>> = {
  ...PRACTICE_GUIDANCE_LEVEL_FOUR_ADVANCED,
  ...PRACTICE_GUIDANCE_LEVEL_FOUR_FOUNDATIONS,
  ...PRACTICE_GUIDANCE_LEVEL_FOUR_SKILLS,
  ...PRACTICE_GUIDANCE_LEVEL_FOUR_STAYS,
};

export { PRACTICE_GUIDANCE_LEVEL_FOUR };
