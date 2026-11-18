import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage, TrainingPage } from "./page-objects";

const PRACTICE_SUCCESS_COUNT = 3;
const ZEN_STEP_COUNT = 5;

async function signUpTestUser(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
}

async function signUpAndVisitTraining(page: Page, baseURL: string | undefined) {
  await signUpTestUser(page, baseURL);
  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoTraining();
  return trainingPage;
}

async function signUpWithTestReadyZenStepOne(page: Page, baseURL: string | undefined) {
  await signUpTestUser(page, baseURL);
  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoBehavior();
  await trainingPage.enterPractice();
  await trainingPage.recordSuccesses(PRACTICE_SUCCESS_COUNT);
  await trainingPage.recommendTestNextTime();
  await trainingPage.finishPractice();
  return trainingPage;
}

async function advanceClockOneDayAndReturn(page: Page, trainingPage: TrainingPage) {
  await page.clock.install({ time: new Date() });
  await page.clock.fastForward("24:00:00");
  await trainingPage.gotoTraining();
}

test("starts recommended Practice from header Start Training link", async ({ baseURL, page }) => {
  await signUpTestUser(page, baseURL);
  const trainingPage = new TrainingPage(page);
  await new CurriculumLevelPage(page).gotoLevels();

  await trainingPage.openFromHeader();

  await expect(page).toHaveURL(/\/training$/u);
  await expect(trainingPage.recommendationPanel).toContainText(
    /Current goal: Level 1[\s\S]*Recommended next: Practice · Zen — Step 1:[\s\S]*Recommended next in Level 1 because its prerequisites are complete and it has not been practiced yet\./u,
  );
  await expect(trainingPage.stepSelect).toHaveValue("level-1/zen:step-1");
  await trainingPage.startButton.click();
  await expect(trainingPage.successButton).toBeVisible();
});

test("rotates same-day Practice when a Test is waiting and unlocks Cold Test the next day", async ({
  baseURL,
  page,
}) => {
  const trainingPage = await signUpWithTestReadyZenStepOne(page, baseURL);
  await trainingPage.gotoTraining();

  await expect(trainingPage.recommendationPanel).toContainText(
    /Recommended next: Practice · Zen — Step 2:[\s\S]*Cold Test waiting: Zen · Step 1:[\s\S]*wait for a fresh day before testing cold\./u,
  );
  await expect(trainingPage.stepSelect).toHaveValue("level-1/zen:step-2");

  await advanceClockOneDayAndReturn(page, trainingPage);

  await expect(page).toHaveURL(/\/training$/u);
  await expect(trainingPage.recommendationPanel).toContainText(
    /Recommended next: Cold Test · Zen — Step 1:[\s\S]*You marked this step ready for a cold Test, and no practice or test has happened today\./u,
  );
  await expect(trainingPage.startTest).toBeEnabled();
});

test("opens a same-day waiting Test from the recommendation panel", async ({ baseURL, page }) => {
  const trainingPage = await signUpWithTestReadyZenStepOne(page, baseURL);
  await trainingPage.gotoTraining();

  await expect(trainingPage.openWaitingTestButton).toBeVisible();
  await trainingPage.openWaitingTest();

  await expect(trainingPage.stepSelect).toHaveValue("level-1/zen:step-1");
  await expect(trainingPage.startTest).toBeDisabled();
});

test("suggests another eligible activity and restores the original suggestion on reset", async ({
  baseURL,
  page,
}) => {
  const trainingPage = await signUpAndVisitTraining(page, baseURL);

  await expect(trainingPage.stepSelect).toHaveValue("level-1/zen:step-1");
  await expect(trainingPage.resetSuggestionsButton).toBeHidden();

  await trainingPage.suggestAnotherTimes(ZEN_STEP_COUNT);
  await expect(trainingPage.recommendationPanel).toContainText(
    /Recommended next: Practice · Sit — Step 1:/u,
  );
  await expect(trainingPage.resetSuggestionsButton).toBeVisible();

  await trainingPage.resetSuggestions();
  await expect(trainingPage.stepSelect).toHaveValue("level-1/zen:step-1");
});

test("flags unmet Comebefores on current-Level manual selection", async ({ baseURL, page }) => {
  const trainingPage = await signUpAndVisitTraining(page, baseURL);

  await trainingPage.selectStep("Level 1 Target · Step 1");

  await expect(trainingPage.recommendationPanel).toContainText(
    /Manual selection: Level 1 Target · Step 1[\s\S]*Unmet Comebefores/u,
  );
  await expect(trainingPage.unmetComebeforesList).toContainText(/Zen[\s\S]*Come[\s\S]*Sit/u);
  await expect(trainingPage.laterLevelOverrideCheckbox).toBeHidden();
  await expect(trainingPage.startButton).toBeEnabled();
});

test("requires temporary override for later-Level Behaviors without changing current goal", async ({
  baseURL,
  page,
}) => {
  const trainingPage = await signUpAndVisitTraining(page, baseURL);

  await trainingPage.selectStep("Level 2 Go To Mat · Step 1");
  await expect(trainingPage.unmetComebeforesList).toContainText("Down");
  await expect(trainingPage.startButton).toBeDisabled();

  await trainingPage.confirmLaterLevelOverride();
  await expect(trainingPage.startButton).toBeEnabled();
  await trainingPage.startButton.click();
  await expect(trainingPage.successButton).toBeVisible();

  await trainingPage.gotoTraining();
  await expect(trainingPage.recommendationPanel).toContainText("Current goal: Level 1");
});
