import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, TrainingPage } from "./page-objects";

async function signUpAndVisit(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }

  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoBehavior();
  await trainingPage.enterPractice();
  return trainingPage;
}

async function saveAndCorrectTotals(trainingPage: TrainingPage) {
  await trainingPage.enterTotals("5", "2");
  await expect(
    trainingPage.totalsRegion().getByText("Saved groups total: 5 Success · 2 Not yet"),
  ).toBeVisible();
  await trainingPage.correctTotals("4", "3");
  await expect(
    trainingPage.totalsRegion().getByText("Saved groups total: 4 Success · 3 Not yet"),
  ).toBeVisible();
}

test("corrects grouped totals without ordering attempts and retains the Test choice after reload", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const trainingPage = await signUpAndVisit(page, baseURL);

  // Act
  await saveAndCorrectTotals(trainingPage);
  await expect(trainingPage.history.getByRole("listitem")).toHaveCount(0);
  await trainingPage.successButton.click();
  await trainingPage.successButton.click();
  await trainingPage.successButton.click();
  await trainingPage.recommendTestNextTime();

  // Assert
  await expect(page.getByText("Saved: Recommend a Test next time.")).toBeVisible();

  // Act
  await trainingPage.reload();

  // Assert
  await expect(
    page.getByText("You chose to recommend a Test next time for this Step."),
  ).toBeVisible();
});
