import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, TrainingPage } from "./page-objects";

async function signUpTestUser(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
}

test("renders Training Hub with active Dog badge, Up Next CTA, and level switching", async ({
  baseURL,
  page,
}) => {
  await signUpTestUser(page, baseURL);

  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoTraining();

  await expect(page.getByText("My Dog")).toBeVisible();
  await expect(trainingPage.startUpNextLink).toBeVisible();

  await page.getByRole("link", { name: "Level 2" }).click();
  await expect(page).toHaveURL(/\/training\?level=level-2$/u);
});

async function openLevel2GoToMatStep1(page: Parameters<typeof signUpTestUser>[0]) {
  await page.getByRole("link", { name: "Level 2" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Level 2" })).toBeVisible();
  const goToMat = page.getByRole("region", { name: "Go To Mat" });
  await expect(goToMat.getByText("Comebefore: Down")).toBeVisible();
  await expect(goToMat.getByRole("button", { name: "Train" })).toBeEnabled();
  await goToMat.getByRole("button", { name: "Steps" }).click();
  await goToMat
    .getByRole("listitem")
    .filter({ hasText: "Dog goes to her mat." })
    .getByRole("button", { name: "Train" })
    .click();
}

test("shows Comebefore notice, launches from Steps, and returns via Back to Training", async ({
  baseURL,
  page,
}) => {
  await signUpTestUser(page, baseURL);

  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoTraining();
  await openLevel2GoToMatStep1(page);

  await expect(page).toHaveURL(/\/training\?mode=practice&stepId=level-2%2Fgo-to-mat%3Astep-1/u);
  const backLink = trainingPage.backToTrainingLink;
  await expect(backLink).toBeVisible();
  await backLink.click();

  await expect(page).toHaveURL(/\/training$/u);
});
