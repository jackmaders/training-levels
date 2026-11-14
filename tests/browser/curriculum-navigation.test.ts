import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage } from "./page-objects";

async function signUpAndVisitLevels(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }

  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevels();
  return curriculumPage;
}

test("opens the level overview via the sidebar", async ({ baseURL, page }) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act
  await curriculumPage.openSidebarLink("Level 1 Overview");

  // Assert
  await expect(curriculumPage.heading).toHaveText("Level 1");
  await expect(curriculumPage.getBreadcrumbCurrent("Level 1 Overview")).toBeVisible();
});

test("opens level 1 homework via the sidebar", async ({ baseURL, page }) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act
  await curriculumPage.openSidebarLink("Level 1 Homework");

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-1\/homework$/u);
  await expect(curriculumPage.heading).toHaveText("Level 1: Homework");
});
