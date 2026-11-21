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
  await expect(page.getByRole("link", { name: /^Practice Zen/u })).toBeVisible();

  await page.getByRole("link", { name: "Level 2" }).click();
  await expect(page).toHaveURL(/\/training\?level=level-2$/u);
});

test("shows Comebefore notice, launches from Steps, and returns via Back to Training", async ({
  baseURL,
  page,
}) => {
  await signUpTestUser(page, baseURL);

  const trainingPage = new TrainingPage(page);
  await trainingPage.gotoTraining();
  await page.getByRole("link", { name: "Level 2" }).click();

  await expect(page.getByText(/Comebefore/iu)).toBeVisible();
  await expect(page.getByRole("link", { name: "Train Go To Mat" })).toBeEnabled();

  await page.getByRole("button", { name: /Steps for Go To Mat/iu }).click();
  await page.getByRole("link", { name: /Go To Mat · Step 1/iu }).click();

  await expect(page).toHaveURL(/\/training\?stepId=level-2%2Fgo-to-mat%3Astep-1/u);
  const backLink = page.getByRole("link", { name: "Back to Training" });
  await expect(backLink).toBeVisible();
  await backLink.click();

  await expect(page).toHaveURL(/\/training$/u);
});
