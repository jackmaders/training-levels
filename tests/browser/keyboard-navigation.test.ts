import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage, HomePage, ProfilePage } from "./page-objects";

const MOBILE_VIEWPORT = { height: 844, width: 390 };
const STEP_TWO_HEADING =
  "Step 2: The dog stays away from the treat in your closed fist for 5 seconds.";

test("keyboard users can toggle a curriculum step and keep progress after reload", async ({
  baseURL,
  page,
}) => {
  // Arrange
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevels();

  // Act
  await curriculumPage.toggleStepCheckboxByKeyboard(STEP_TWO_HEADING);
  await expect(curriculumPage.getStepCheckbox(STEP_TWO_HEADING)).toBeChecked();
  await expect(curriculumPage.progressBar).toHaveAttribute("aria-valuenow", "20");

  await curriculumPage.reload();

  // Assert
  await expect(curriculumPage.getStepCheckbox(STEP_TWO_HEADING)).toBeChecked();
  await expect(curriculumPage.progressBar).toHaveAttribute("aria-valuenow", "20");
});

test("keyboard users can open mobile navigation and reach Profile", async ({ baseURL, page }) => {
  // Arrange
  await page.setViewportSize(MOBILE_VIEWPORT);
  await signUpTestUser(page, baseURL);
  const homePage = new HomePage(page);
  const profilePage = new ProfilePage(page);
  await homePage.goto();

  // Act
  await homePage.navigateToProfileByKeyboard();

  // Assert
  await expect(page).toHaveURL(/\/profile$/u);
  await expect(profilePage.heading).toBeVisible();
});

test("keyboard users can close the mobile curriculum drawer with Escape", async ({
  baseURL,
  page,
}) => {
  // Arrange
  await page.setViewportSize(MOBILE_VIEWPORT);
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevels();
  await curriculumPage.setDarkTheme();

  // Act
  await curriculumPage.openMobileDrawerByKeyboard();
  await curriculumPage.closeMobileDrawerWithEscape();

  // Assert
  await expect(curriculumPage.mobileDrawer).toBeHidden();
  await expect(curriculumPage.mobileMenuButton).toBeFocused();
});

test("keyboard users can reach Profile from desktop navigation", async ({ baseURL, page }) => {
  // Arrange
  await signUpTestUser(page, baseURL);
  const homePage = new HomePage(page);
  const profilePage = new ProfilePage(page);
  await homePage.goto();

  // Act
  await homePage.navigateToProfileByKeyboard();

  // Assert
  await expect(page).toHaveURL(/\/profile$/u);
  await expect(profilePage.heading).toBeVisible();
});

async function signUpTestUser(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
}
