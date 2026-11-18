import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage, TrainingPage } from "./page-objects";

const PRACTICE_SUCCESS_COUNT = 3;
const STEP_ONE_HEADING =
  "Step 1: The dog moves off a treat held in your hand. You're sitting down.";
const STEP_TWO_SUMMARY = "The dog stays away from the treat in your closed fist for 5 seconds.";
const STEP_TWO_HEADING = `Step 2: ${STEP_TWO_SUMMARY}`;
const HOMEWORK_NON_GATING_COPY =
  "Homework reflections support handler generalization and do not count toward or gate Level advancement.";

async function signUpAndVisitLevelOnePage(
  page: Page,
  baseURL: string | undefined,
  pageSlug: string,
) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }

  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevelPage("level-1", pageSlug);
  return curriculumPage;
}

async function prepareStepOneForColdTest(page: Page, trainingPage: TrainingPage) {
  await trainingPage.enterPractice();
  await trainingPage.recordSuccesses(PRACTICE_SUCCESS_COUNT);
  await trainingPage.recommendTestNextTime();
  await page.getByText("Saved: Recommend a Test next time.").waitFor({ state: "visible" });
  await trainingPage.finishPractice();
}

async function passStepOneColdTest(page: Page) {
  const trainingPage = new TrainingPage(page);
  await prepareStepOneForColdTest(page, trainingPage);
  await trainingPage.gotoTraining();
  await trainingPage.confirmColdness();
  await trainingPage.startTestActivity();
  await trainingPage.recordTest("passed");
  await expect(trainingPage.testActivity).toContainText("Test passed. This Step is complete.");
  await trainingPage.finishTest();
}

async function failStepOneSameDayRetest(page: Page, curriculumPage: CurriculumLevelPage) {
  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoTraining();
  await trainingPage.confirmColdness();
  await trainingPage.startTestActivity();
  await trainingPage.recordTest("not_yet");
  await expect(trainingPage.testActivity).toContainText(
    "Not yet. Needs practice; Practice is recommended.",
  );
  await trainingPage.finishTest();
  await curriculumPage.gotoLevelPage("level-1", "zen");
}

async function expectStepOneNeedsPracticeProvenance(curriculumPage: CurriculumLevelPage) {
  await expect(curriculumPage.article.getByText("Needs Practice", { exact: true })).toBeVisible();
  await expect(
    curriculumPage.article.getByText("Previously recorded; latest retest needs practice", {
      exact: true,
    }),
  ).toBeVisible();
}

async function expandStepAndExpectExpanded(curriculumPage: CurriculumLevelPage, summary: string) {
  await curriculumPage.expandStep(summary);
  await expect(curriculumPage.getStepTrigger(summary)).toHaveAttribute("aria-expanded", "true");
}

async function saveComeafterInExpandedStep(
  curriculumPage: CurriculumLevelPage,
  status: string,
  note: string,
) {
  await curriculumPage.article.getByLabel("Comeafter status").selectOption(status);
  await curriculumPage.article.getByLabel("Generalization note (optional)").fill(note);
  await curriculumPage.article.getByRole("button", { name: "Save Comeafter" }).click();
}

test("tracks step completion provenance across manual checks, cold tests, and failed retests", async ({
  baseURL,
  page,
}) => {
  const curriculumPage = await signUpAndVisitLevelOnePage(page, baseURL, "zen");

  await curriculumPage.toggleStepCheckbox(STEP_TWO_HEADING);
  await expect(
    curriculumPage.article.getByText("Previously recorded", { exact: true }),
  ).toBeVisible();

  await passStepOneColdTest(page);
  await expect(curriculumPage.getStepCheckbox(STEP_ONE_HEADING)).toBeChecked();
  await expect(curriculumPage.article.getByText("Passed Cold Test", { exact: true })).toBeVisible();

  await failStepOneSameDayRetest(page, curriculumPage);
  await expectStepOneNeedsPracticeProvenance(curriculumPage);
  await expect(curriculumPage.getStepCheckbox(STEP_ONE_HEADING)).toBeChecked();
  await expect(
    curriculumPage.article.getByRole("region", { name: "Level advancement readiness" }),
  ).toContainText("2 of 25 Behavior steps completed");
});

test("persists comeafter progress inside an expanded step without changing behavior step progress", async ({
  baseURL,
  page,
}) => {
  const curriculumPage = await signUpAndVisitLevelOnePage(page, baseURL, "zen");

  await expandStepAndExpectExpanded(curriculumPage, STEP_TWO_SUMMARY);
  await saveComeafterInExpandedStep(curriculumPage, "practicing", "Quiet hallway before dinner");
  await expect(curriculumPage.article.getByText("Comeafter saved.", { exact: true })).toBeVisible();

  await curriculumPage.reload();
  await expect(curriculumPage.getProgressText("0 of 5 steps")).toBeVisible();
  await expect(curriculumPage.getStepCheckbox(STEP_TWO_HEADING)).not.toBeChecked();

  await curriculumPage.expandStep(STEP_TWO_SUMMARY);
  await expect(curriculumPage.article.getByLabel("Comeafter status")).toHaveValue("practicing");
  await expect(curriculumPage.article.getByLabel("Generalization note (optional)")).toHaveValue(
    "Quiet hallway before dinner",
  );
});

test("persists homework reflections across reloads with non-gating guidance", async ({
  baseURL,
  page,
}) => {
  const curriculumPage = await signUpAndVisitLevelOnePage(page, baseURL, "homework");

  await expect(curriculumPage.getArticleText(HOMEWORK_NON_GATING_COPY)).toBeVisible();

  await curriculumPage.article
    .getByLabel("Homework reflection", { exact: true })
    .fill("Practiced doorway waits twice this week.");
  await curriculumPage.article.getByRole("button", { name: "Save reflection" }).click();
  await expect(
    curriculumPage.article.getByText("Reflection saved.", { exact: true }),
  ).toBeVisible();

  await curriculumPage.reload();
  await expect(
    curriculumPage.article.getByLabel("Homework reflection", { exact: true }),
  ).toHaveValue("Practiced doorway waits twice this week.");
});
