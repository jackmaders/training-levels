import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage, TrainingPage } from "./page-objects";

const PRACTICE_SUCCESS_COUNT = 3;
const STEP_ONE_HEADING =
  "Step 1: The dog moves off a treat held in your hand. You're sitting down.";

async function signUpAndVisitBehavior(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }

  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoBehavior();
  return trainingPage;
}

async function prepareSameDayTest(trainingPage: TrainingPage) {
  await trainingPage.enterPractice();
  await trainingPage.recordSuccesses(PRACTICE_SUCCESS_COUNT);
  await trainingPage.recommendTestNextTime();
  await trainingPage.finishPractice();
  await trainingPage.gotoTraining();
  await expect(trainingPage.startTest).toBeDisabled();
  await trainingPage.confirmColdness();
  await trainingPage.startTestActivity();
  await expect(trainingPage.testActivity).toContainText(
    /Sitting down with a treat in your hand[\s\S]*She moves her nose away from your hand/u,
  );
}

async function recommendPracticeAfterFailure(trainingPage: TrainingPage) {
  await trainingPage.recordTest("not_yet");
  await expect(trainingPage.testActivity).toContainText(
    /coldness confirmed[\s\S]*Not yet\. Needs practice; Practice is recommended\./u,
  );
}

async function failSameDayRetest(trainingPage: TrainingPage) {
  await trainingPage.gotoTraining();
  await trainingPage.confirmColdness();
  await trainingPage.startTestActivity();
  await recommendPracticeAfterFailure(trainingPage);
  await trainingPage.finishTest();
  await trainingPage.gotoTraining();
  await expect(trainingPage.prep).toContainText(
    /Latest Test: Not yet — Needs practice[\s\S]*Passed[\s\S]*Not yet/u,
  );
}

test("cold Test uses the full criterion and allows a confirmed same-day override", async ({
  baseURL,
  page,
}) => {
  const trainingPage = await signUpAndVisitBehavior(page, baseURL);

  await prepareSameDayTest(trainingPage);
  await recommendPracticeAfterFailure(trainingPage);
  await page.clock.install({ time: new Date() });
  await page.clock.fastForward("24:00:00");
  await trainingPage.finishTest();
  await trainingPage.gotoTraining();

  await expect(trainingPage.startTest).toBeEnabled();
});

test("passing a cold Test completes the Step and a failed retest preserves that achievement", async ({
  baseURL,
  page,
}) => {
  const trainingPage = await signUpAndVisitBehavior(page, baseURL);

  await prepareSameDayTest(trainingPage);
  await trainingPage.recordTest("passed");
  await expect(trainingPage.testActivity).toContainText("Test passed. This Step is complete.");
  await trainingPage.finishTest();
  await expect(new CurriculumLevelPage(page).getStepCheckbox(STEP_ONE_HEADING)).toBeChecked();
  await failSameDayRetest(trainingPage);
  await trainingPage.gotoBehavior();

  await expect(new CurriculumLevelPage(page).getStepCheckbox(STEP_ONE_HEADING)).toBeChecked();
});

test("checking an untested Step cannot bypass the cold Test", async ({ baseURL, page }) => {
  await signUpAndVisitBehavior(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);

  await curriculumPage.toggleStepCheckbox(STEP_ONE_HEADING);

  await expect(curriculumPage.toggleErrorAlert).toBeVisible();
  await expect(curriculumPage.getStepCheckbox(STEP_ONE_HEADING)).not.toBeChecked();
});
