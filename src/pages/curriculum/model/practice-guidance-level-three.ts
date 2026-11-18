import { PRACTICE_GUIDANCE_LEVEL_THREE_CONTROL } from "./practice-guidance-level-three-control";
import { PRACTICE_GUIDANCE_LEVEL_THREE_FOUNDATIONS } from "./practice-guidance-level-three-foundations";
import { PRACTICE_GUIDANCE_LEVEL_THREE_SKILLS } from "./practice-guidance-level-three-skills";
import { PRACTICE_GUIDANCE_LEVEL_THREE_STAYS } from "./practice-guidance-level-three-stays";
import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_THREE: Readonly<Record<string, BehaviorRule>> = {
  ...PRACTICE_GUIDANCE_LEVEL_THREE_CONTROL,
  ...PRACTICE_GUIDANCE_LEVEL_THREE_FOUNDATIONS,
  ...PRACTICE_GUIDANCE_LEVEL_THREE_SKILLS,
  ...PRACTICE_GUIDANCE_LEVEL_THREE_STAYS,
};

export { PRACTICE_GUIDANCE_LEVEL_THREE };
