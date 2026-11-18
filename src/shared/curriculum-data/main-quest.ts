import rawSyllabus from "./data/syllabus.json";

const MAIN_QUEST_STEP_IDS: ReadonlySet<string> = new Set(
  rawSyllabus.sections.flatMap((section) =>
    section.pages.flatMap((page) => ("stepIds" in page ? page.stepIds : [])),
  ),
);

function isValidMainQuestStepId(stepId: string): boolean {
  return MAIN_QUEST_STEP_IDS.has(stepId);
}

export { isValidMainQuestStepId };
