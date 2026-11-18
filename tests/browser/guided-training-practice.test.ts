import type { Page } from "@playwright/test";

/* eslint-disable playwright/max-expects, max-statements, no-magic-numbers */
import { expect, test } from "./fixtures";
import { AuthClient, TrainingPage } from "./page-objects";

const PREP_HEADING_COUNT = 3;
const TIMER_TARGET_DURATION_MILLISECONDS = 15_000;
const TIMER_INTERRUPTION_DURATION_MILLISECONDS = TIMER_TARGET_DURATION_MILLISECONDS / 3;

async function signUpAndVisit(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }

  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoBehavior();
  return trainingPage;
}

async function expectPrep(page: Page) {
  await expect(
    page.getByRole("heading", { name: /^(?:Prep|Equipment|Observable success)$/u }),
  ).toHaveCount(PREP_HEADING_COUNT);
}

async function expectRecorded(trainingPage: TrainingPage) {
  await expect(trainingPage.counts).toHaveText("1 Success · 1 Not yet");
}

async function expectRestored(trainingPage: TrainingPage) {
  await expect(trainingPage.counts).toHaveText("1 Success · 1 Not yet");
}

async function expectUndone(trainingPage: TrainingPage) {
  await expect(trainingPage.counts).toHaveText("1 Success · 0 Not yet");
}

async function recordOutcomes(trainingPage: TrainingPage) {
  await trainingPage.startButton.click();
  await trainingPage.successButton.click();
  await trainingPage.notYetButton.click();
  await expectRecorded(trainingPage);
}

async function reloadAndCheckHistory(trainingPage: TrainingPage) {
  await trainingPage.reload();
  await expectRestored(trainingPage);
}

test("records Practice attempts, retains history, and leaves the Step incomplete", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const trainingPage = await signUpAndVisit(page, baseURL);

  // Act
  await trainingPage.startFromPrep();
  await expectPrep(page);
  await recordOutcomes(trainingPage);

  // Act
  await reloadAndCheckHistory(trainingPage);
  await trainingPage.startButton.click();

  // Act
  await trainingPage.undoButton.click();

  // Assert
  await expectUndone(trainingPage);

  // Act
  await trainingPage.finishLink.click();

  // Assert
  await expect(page.getByRole("checkbox", { name: /^Toggle Step 1:/u })).not.toBeChecked();
});

test("guides a Level 2 duration Step from Prep through a recorded Practice", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const trainingPage = await signUpAndVisit(page, baseURL);

  // Act
  await trainingPage.enterPractice("Level 2 Zen · Step 2");

  // Assert
  await expect(trainingPage.target).toContainText("1 second");
  await expect(
    page.getByText(/Build the floor Zen hold from 1 second toward 10 seconds/u),
  ).toBeVisible();
  await expect(page.getByText(/restart the count at 1 second/u)).toBeVisible();

  // Act
  await trainingPage.successButton.click();
  await expect(trainingPage.target).toContainText("2 seconds");
  await trainingPage.notYetButton.click();
  await expect(trainingPage.target).toContainText("1 second");
  await trainingPage.finishLink.click();

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-2\/zen$/u);
  await expect(page.getByRole("checkbox", { name: /^Toggle Step 2:/u })).not.toBeChecked();
});

test("uses the Crate Step 2 ladder, restarts after a miss, and offers break choices", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const trainingPage = await signUpAndVisit(page, baseURL);
  await trainingPage.startFromPrep();
  await trainingPage.selectStep("Level 3 Crate · Step 2");
  await expect(trainingPage.target).toHaveText("2 feet · 0 seconds");

  // Act
  await trainingPage.startButton.click();
  await trainingPage.chooseNextTarget();
  await expect(trainingPage.target).toHaveText("2 feet · 15 seconds");
  await trainingPage.successButton.click();
  await expect(trainingPage.target).toHaveText("3 feet · 30 seconds");
  await trainingPage.notYetButton.click();
  await expect(trainingPage.target).toHaveText("2 feet · 0 seconds");

  // Assert
  await expect(page.getByText("Prior achievement: 2 feet · 15 seconds")).toBeVisible();
  await expect(page.getByText(/Restart suggestion: 2 feet · 0 seconds/u)).toBeVisible();

  // Act
  await trainingPage.takeBreak();

  // Assert
  await expect(trainingPage.breakHeading).toBeVisible();

  // Act
  await trainingPage.continuePractice();
  await trainingPage.finishLink.click();

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-3\/crate$/u);
});

test("timer completion waits for the handler to confirm success", async ({ baseURL, page }) => {
  // Arrange
  await page.clock.install({ time: new Date("2026-01-01T09:00:00Z") });
  const trainingPage = await signUpAndVisit(page, baseURL);
  await trainingPage.startFromPrep();
  await trainingPage.selectStep("Level 3 Crate · Step 2");
  await trainingPage.startButton.click();
  await trainingPage.chooseNextTarget();

  // Act
  await trainingPage.startTimer();
  await page.clock.runFor(TIMER_INTERRUPTION_DURATION_MILLISECONDS);
  await trainingPage.reload();

  // Assert
  await expect(trainingPage.stepSelect).toHaveValue("level-3/crate:step-2");
  await expect(trainingPage.target).toHaveText("2 feet · 15 seconds");

  // Act
  await trainingPage.startButton.click();
  await expect(trainingPage.timerStartButton).toBeVisible();
  await trainingPage.startTimer();
  await page.clock.runFor(TIMER_TARGET_DURATION_MILLISECONDS);

  // Assert
  await expect(page.getByText("Timer complete.")).toBeVisible();
  await expect(trainingPage.counts).toHaveText("0 Success · 0 Not yet");

  // Act
  await trainingPage.confirmTimerSuccess.click();

  // Assert
  await expect(trainingPage.counts).toHaveText("1 Success · 0 Not yet");
});
