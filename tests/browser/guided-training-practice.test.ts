import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, TrainingPage } from "./page-objects";

const PREP_HEADING_COUNT = 3;

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
