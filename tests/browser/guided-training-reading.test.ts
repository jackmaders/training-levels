import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, TrainingPage, TrainingReading } from "./page-objects";

const TIMER_TARGET_DURATION_MILLISECONDS = 15_000;
const TIMER_INTERRUPTION_DURATION_MILLISECONDS = 5000;

async function signUpAndOpenPrep(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }

  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoBehavior();
  await trainingPage.startFromPrep();
  return { reading: new TrainingReading(page), trainingPage };
}

async function startCrateTimedHold(page: Page, trainingPage: TrainingPage) {
  await trainingPage.selectStep("Level 3 Crate · Step 2");
  await trainingPage.startButton.click();
  await trainingPage.chooseNextTarget();
  await trainingPage.startTimer();
  await page.clock.runFor(TIMER_INTERRUPTION_DURATION_MILLISECONDS);
}

async function readWhileTimerWouldRun(page: Page, reading: TrainingReading) {
  await reading.openExplanation();
  await page.clock.runFor(TIMER_TARGET_DURATION_MILLISECONDS);
  await reading.returnToTraining();
}

async function completeFreshTimedHold(page: Page, trainingPage: TrainingPage) {
  await trainingPage.startTimer();
  await page.clock.runFor(TIMER_TARGET_DURATION_MILLISECONDS);
  await trainingPage.confirmTimerSuccess.click();
}

test("reads source-backed FAQ from Prep and returns to the chosen Step", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const { reading, trainingPage } = await signUpAndOpenPrep(page, baseURL);

  // Act
  await reading.openFaq();
  await reading.openBehaviorFaqQuestion("When I drop the treat, she can't find it");

  // Assert
  await expect(reading.behaviorFaq.getByText(/^Use harder food/u)).toBeVisible();
  await expect(
    reading.behaviorFaq.getByRole("link", { name: "Level 1 Zen, Step 1" }),
  ).toBeVisible();
  await expect(reading.generalFaqQuestion("Think About Lumping")).toBeVisible();

  // Act
  await reading.returnToTraining();

  // Assert
  await expect(trainingPage.stepSelect).toHaveValue("level-1/zen:step-1");
  await expect(trainingPage.startButton).toBeVisible();
});

test("reads the Explanation during Practice without losing recorded attempts", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const { reading, trainingPage } = await signUpAndOpenPrep(page, baseURL);
  await trainingPage.startButton.click();
  await trainingPage.successButton.click();
  await expect(trainingPage.counts).toHaveText("1 Success · 0 Not yet");

  // Act
  await reading.openExplanation();

  // Assert
  await expect(
    reading.explanation.getByText("Present your closed fist with the treat inside."),
  ).toBeVisible();
  await expect(reading.explanation.getByRole("heading", { name: "Progression" })).toBeVisible();

  // Act
  await reading.returnToTraining();

  // Assert
  await expect(trainingPage.successButton).toBeVisible();
  await expect(trainingPage.counts).toHaveText("1 Success · 0 Not yet");
});

test("opening reading interrupts a running timed hold and requires a fresh attempt", async ({
  baseURL,
  page,
}) => {
  // Arrange
  await page.clock.install({ time: new Date("2026-01-01T09:00:00Z") });
  const { reading, trainingPage } = await signUpAndOpenPrep(page, baseURL);
  await startCrateTimedHold(page, trainingPage);

  // Act
  await readWhileTimerWouldRun(page, reading);

  // Assert
  await expect(reading.interruptedTimerNotice).toBeVisible();
  await expect(trainingPage.timerStartButton).toBeVisible();
  await expect(trainingPage.target).toHaveText("2 feet · 15 seconds");
  await expect(trainingPage.counts).toHaveText("0 Success · 0 Not yet");

  // Act
  await completeFreshTimedHold(page, trainingPage);

  // Assert
  await expect(trainingPage.counts).toHaveText("1 Success · 0 Not yet");
});
