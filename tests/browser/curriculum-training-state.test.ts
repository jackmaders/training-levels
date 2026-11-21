import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import {
  AuthClient,
  CurriculumLevelPage,
  CurriculumTrainingLinks,
  DependenciesPage,
  TrainingPage,
} from "./page-objects";

const LEVEL_ONE = 1;
const LEVEL_TWO = 2;
const STEP_ONE = 1;
const PRACTICE_SUCCESS_COUNT = 3;
const ZERO_OVERFLOW = 0;

const LEVEL_ONE_READING_HINT = "Reading suggestion: theory/07-the-thinking-of-training";
const LEVEL_ONE_DOWN_HINT = "Helpful background: Sit";
const LEVEL_TWO_DOWN_HINT = "Prerequisite: Down";
const LEVEL_ONE_TARGET_HINT = "Prerequisite: Sit";

const ZEN_STEP_ONE_HEADING =
  "Step 1: The dog moves off a treat held in your hand. You're sitting down.";
const ZEN_STEP_ONE_SUMMARY = "The dog moves off a treat held in your hand. You're sitting down.";
const ZEN_STEP_TWO_HEADING =
  "Step 2: The dog stays away from the treat in your closed fist for 5 seconds.";
const ZEN_STEP_THREE_HEADING =
  "Step 3: The dog stays away from the treat in your OPEN hand for 5 seconds.";
const ZEN_STEP_FOUR_HEADING =
  "Step 4: The dog moves away from a treat in her dog dish held in your hand.";
const ZEN_STEP_FIVE_HEADING = "Step 5: Practise with more hands, more treats, more places.";

async function signUpTestUser(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
}

async function openDependenciesForNewUser(page: Page, baseURL: string | undefined) {
  await signUpTestUser(page, baseURL);
  const dependenciesPage = new DependenciesPage(page);
  await dependenciesPage.goto();
  return dependenciesPage;
}

async function openGoToMatStepOneForNewUser(page: Page, baseURL: string | undefined) {
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevelPageAnchor("level-2", "go-to-mat", "step-1");
  await new CurriculumTrainingLinks(page).launchStepTest(STEP_ONE);
  return new TrainingPage(page);
}

async function recordZenPracticeKeepPracticing(page: Page) {
  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoTraining("level-1/zen:step-1");
  await trainingPage.startButton.click();
  await trainingPage.recordSuccesses(PRACTICE_SUCCESS_COUNT);
  await trainingPage.keepPracticing();
  await trainingPage.finishPractice();
}

async function openTargetThenZenInDependencies(page: Page, baseURL: string | undefined) {
  const dependenciesPage = await openDependenciesForNewUser(page, baseURL);
  await recordZenPracticeKeepPracticing(page);
  await dependenciesPage.goto();
  await dependenciesPage.selectListBehavior("Target", LEVEL_ONE_TARGET_HINT);
  return dependenciesPage;
}

async function confirmOverrideStartAndReturnToTraining(trainingPage: TrainingPage) {
  await trainingPage.confirmLaterLevelOverride();
  await trainingPage.startButton.click();
  await trainingPage.gotoTraining();
  await trainingPage.openUpNextFromHub();
}

async function passZenStepOneColdTest(page: Page) {
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevelPage("level-1", "zen");
  await new CurriculumTrainingLinks(page).launchBehaviorTest(STEP_ONE);

  const trainingPage = new TrainingPage(page);
  await trainingPage.startTestActivity();
  await trainingPage.recordTest("passed");
  await expect(trainingPage.testActivity).toContainText("Test passed. This Step is complete.");
  await trainingPage.finishTest();
}

async function completeAllZenSteps(page: Page) {
  await passZenStepOneColdTest(page);
  const curriculumPage = new CurriculumLevelPage(page);
  await expect(curriculumPage.getStepCheckbox(ZEN_STEP_ONE_HEADING)).toBeChecked();
  await curriculumPage.toggleStepCheckbox(ZEN_STEP_TWO_HEADING);
  await curriculumPage.toggleStepCheckbox(ZEN_STEP_THREE_HEADING);
  await curriculumPage.toggleStepCheckbox(ZEN_STEP_FOUR_HEADING);
  await curriculumPage.toggleStepCheckbox(ZEN_STEP_FIVE_HEADING);
  return curriculumPage;
}

async function failColdRetestFromTrainingPrep(page: Page) {
  const trainingPage = new TrainingPage(page);
  await trainingPage.confirmColdness();
  await trainingPage.startTestActivity();
  await trainingPage.recordTest("not_yet");
  await expect(trainingPage.testActivity).toContainText(
    "Not yet. Needs practice; Practice is recommended.",
  );
  await trainingPage.finishTest();
}

async function completeAllZenStepsAndFailRetest(page: Page) {
  const curriculumPage = await completeAllZenSteps(page);
  const dependenciesPage = new DependenciesPage(page);
  await dependenciesPage.goto();
  await dependenciesPage.selectListBehavior("Zen", LEVEL_ONE_READING_HINT);
  await dependenciesPage.launchTestFromSelected(STEP_ONE);
  await failColdRetestFromTrainingPrep(page);
  return { curriculumPage, dependenciesPage };
}

async function openMobileZenWithStepOneExpanded(page: Page, baseURL: string | undefined) {
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  const trainingLinks = new CurriculumTrainingLinks(page);
  await trainingLinks.setMobileViewport();
  await curriculumPage.gotoLevelPage("level-1", "zen");
  await curriculumPage.expandStep(ZEN_STEP_ONE_SUMMARY);
  return { curriculumPage, trainingLinks };
}

test("shows unfinished, prerequisite chain, and eligibility across dependencies views", async ({
  baseURL,
  page,
}) => {
  const dependenciesPage = await openDependenciesForNewUser(page, baseURL);

  await expect(dependenciesPage.currentGoalBadge).toHaveText("Current goal: Level 1");
  await expect(dependenciesPage.graphBehavior(LEVEL_ONE, "Down")).toContainText(
    /In selected prerequisite chain[\s\S]*Eligible next option/u,
  );
  await expect(dependenciesPage.listBehavior("Down", LEVEL_ONE_DOWN_HINT)).toContainText(
    /In selected prerequisite chain[\s\S]*Eligible next option/u,
  );
  await expect(dependenciesPage.listBehavior("Down", LEVEL_TWO_DOWN_HINT)).toContainText(
    "In selected prerequisite chain",
  );

  await dependenciesPage.selectGraphBehavior(LEVEL_ONE, "Zen");
  await expect(dependenciesPage.selectedDetails).toContainText(
    /Unfinished[\s\S]*Recommended next/u,
  );
});

test("shows prerequisite chain for Target and syncs In practice across views", async ({
  baseURL,
  page,
}) => {
  const dependenciesPage = await openTargetThenZenInDependencies(page, baseURL);

  await expect(dependenciesPage.graphBehavior(LEVEL_ONE, "Zen")).toContainText(
    "In selected prerequisite chain",
  );
  await expect(dependenciesPage.listBehavior("Zen", LEVEL_ONE_READING_HINT)).toContainText(
    "In selected prerequisite chain",
  );

  await dependenciesPage.selectGraphBehavior(LEVEL_ONE, "Zen");
  await expect(dependenciesPage.graphBehavior(LEVEL_ONE, "Zen")).toContainText("In practice");
  await expect(dependenciesPage.listBehavior("Zen", LEVEL_ONE_READING_HINT)).toContainText(
    "In practice",
  );

  await new CurriculumLevelPage(page).gotoLevelPage("level-1", "zen");
  await expect(new CurriculumLevelPage(page).article).toContainText(
    /In practice[\s\S]*Recommended next[\s\S]*In practice/u,
  );
});

test("launches later-Level Practice from dependencies into Prep with override", async ({
  baseURL,
  page,
}) => {
  const dependenciesPage = await openDependenciesForNewUser(page, baseURL);
  const trainingPage = new TrainingPage(page);

  await dependenciesPage.selectGraphBehavior(LEVEL_TWO, "Go To Mat");
  await expect(dependenciesPage.selectedDetails).toContainText(
    /Unmet Comebefores: Down, Down\. Launching opens Prep with a manual override option\.[\s\S]*Later-Level selection \(Current goal: Level 1\)\. Launching into Prep does not change your Level goal\./u,
  );

  await dependenciesPage.launchPracticeFromSelected(STEP_ONE);
  await expect(trainingPage.stepSelect).toHaveValue("level-2/go-to-mat:step-1");
  await expect(trainingPage.unmetComebeforesList).toContainText("Down");
  await expect(trainingPage.startButton).toBeDisabled();

  await confirmOverrideStartAndReturnToTraining(trainingPage);
  await expect(trainingPage.recommendationPanel).toContainText("Current goal: Level 1");
});

test("launches later-Level Test from behavior step into Prep with manual override", async ({
  baseURL,
  page,
}) => {
  const trainingPage = await openGoToMatStepOneForNewUser(page, baseURL);

  await expect(trainingPage.stepSelect).toHaveValue("level-2/go-to-mat:step-1");
  await expect(trainingPage.unmetComebeforesList).toContainText("Down");
  await expect(trainingPage.startTest).toBeDisabled();

  await trainingPage.confirmLaterLevelOverride();
  await expect(trainingPage.startTest).toBeEnabled();
});

test("shows completion provenance and satisfies Come Comebefore across views", async ({
  baseURL,
  page,
}) => {
  await signUpTestUser(page, baseURL);
  const curriculumPage = await completeAllZenSteps(page);
  const dependenciesPage = new DependenciesPage(page);

  await expect(curriculumPage.article).toContainText(
    /5 of 5 steps[\s\S]*Completed · Previously recorded[\s\S]*Passed Cold Test[\s\S]*Previously recorded/u,
  );

  await dependenciesPage.goto();
  await expect(dependenciesPage.graphBehavior(LEVEL_ONE, "Zen")).toContainText(
    /5 of 5 Steps complete[\s\S]*Completed · Previously recorded/u,
  );
  await expect(dependenciesPage.listBehavior("Zen", LEVEL_ONE_READING_HINT)).toContainText(
    /5 of 5 Steps complete[\s\S]*Completed · Previously recorded/u,
  );

  await dependenciesPage.selectGraphBehavior(LEVEL_ONE, "Come");
  await expect(dependenciesPage.graphBehavior(LEVEL_ONE, "Come")).toContainText("Recommended next");
  await expect(dependenciesPage.selectedDetails).not.toContainText("Unmet Comebefores");
});

test("retains completion and downstream Comebefore satisfaction after failed retest", async ({
  baseURL,
  page,
}) => {
  await signUpTestUser(page, baseURL);
  const { curriculumPage, dependenciesPage } = await completeAllZenStepsAndFailRetest(page);

  await expect(curriculumPage.getStepCheckbox(ZEN_STEP_ONE_HEADING)).toBeChecked();
  await expect(curriculumPage.article).toContainText(
    /5 of 5 steps[\s\S]*Needs practice · Completion retained[\s\S]*Downstream achievements intact: completed Steps still satisfy Comebefores\.[\s\S]*Needs Practice[\s\S]*Previously recorded; latest retest needs practice/u,
  );

  await dependenciesPage.goto();
  await dependenciesPage.selectGraphBehavior(LEVEL_ONE, "Zen");
  await expect(dependenciesPage.selectedDetails).toContainText(
    /Needs practice · Completion retained[\s\S]*Downstream achievements intact: completed Steps still satisfy Comebefores\.[\s\S]*Needs practice \(Previously recorded\)/u,
  );
  await expect(dependenciesPage.graphBehavior(LEVEL_ONE, "Zen")).toContainText(
    /5 of 5 Steps complete[\s\S]*Needs practice · Completion retained[\s\S]*Eligible next option/u,
  );

  await dependenciesPage.selectListBehavior("Come", LEVEL_ONE_READING_HINT);
  await expect(dependenciesPage.selectedDetails).not.toContainText("Unmet Comebefores");
});

test("renders behavior and step training launch links cleanly on mobile viewports", async ({
  baseURL,
  page,
}) => {
  const { curriculumPage, trainingLinks } = await openMobileZenWithStepOneExpanded(page, baseURL);

  await expect(trainingLinks.behaviorPracticeLink(STEP_ONE)).toBeVisible();
  await expect(trainingLinks.behaviorTestLink(STEP_ONE)).toBeVisible();
  await expect(trainingLinks.openStepPracticeLink(STEP_ONE)).toBeVisible();
  await expect(trainingLinks.openStepTestLink(STEP_ONE)).toBeVisible();
  expect(await curriculumPage.horizontalOverflow()).toBe(ZERO_OVERFLOW);
});
