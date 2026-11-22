import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AboutPage, AuthClient, CurriculumLevelPage, HomePage, ProfilePage } from "./page-objects";

test("renders the curriculum landing page with sign in form", async ({ page }) => {
  // Arrange & Act
  const homePage = new HomePage(page);
  await homePage.goto();

  // Assert
  await expect(page).toHaveTitle("Dog Training Levels");
  await expect(homePage.pageHeading).toBeVisible();
  await expect(homePage.heading).toBeVisible();
  await expect(homePage.emailInput).toBeVisible();
  await expect(homePage.submitButton).toBeVisible();
});

test("shows the product wordmark and keeps Profile out of public navigation", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  await homePage.goto();

  // Assert
  await expect(page.getByRole("link", { name: "Dog Training Levels" })).toBeVisible();
  await expect(homePage.primaryNavigation.getByRole("link", { name: "Profile" })).toBeHidden();
});

test("keyboard users can skip the shared header to the main content", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  await homePage.goto();

  // Act
  await homePage.focusSkipLink();

  // Assert
  await expect(homePage.skipLink).toBeFocused();
  await expect(homePage.skipLink).toHaveAttribute("href", "#main-content");
  await expect(homePage.skipLink).toBeInViewport();
  await expect.poll(async () => await homePage.isSkipLinkTopmost()).toBe(true);

  // Act
  await homePage.activateSkipLink();

  // Assert
  await expect(homePage.main).toBeFocused();
});

test("omits legacy todo copy and links on the landing page", async ({ page }) => {
  // Arrange & Act
  const homePage = new HomePage(page);
  await homePage.goto();

  // Assert
  await expect(homePage.main).not.toContainText(/todo/iu);
  await expect(homePage.primaryNavigation).not.toContainText(/todo/iu);
});

test("switches between sign in and sign up tabs", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  await homePage.goto();

  // Act
  await homePage.switchToSignUp();

  // Assert
  await expect(homePage.signUpHeading).toBeVisible();
  await expect(homePage.signUpDescription).toBeVisible();
  await expect(homePage.nameInput).toBeVisible();

  // Act back
  await homePage.switchToSignIn();

  // Assert back
  await expect(homePage.heading).toBeVisible();
});

test("navigates to the about page from the navbar", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  const aboutPage = new AboutPage(page);
  await homePage.goto();

  // Act
  await homePage.navigateToAbout();

  // Assert
  await expect(page).toHaveURL(/\/about$/u);
  await expect(aboutPage.heading).toBeVisible();
  await expect(aboutPage.description).toBeVisible();
});

test("redirects authenticated visitors from root to level 1 zen", async ({ baseURL, page }) => {
  // Arrange
  await signUpTestUser(page, baseURL);
  const homePage = new HomePage(page);
  const curriculumPage = new CurriculumLevelPage(page);

  // Act
  await homePage.goto();

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-1\/zen$/u);
  await expect(curriculumPage.heading).toHaveText("Level 1: Zen");
});

test("lands on level 1 zen after signing up via the home form", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  const curriculumPage = new CurriculumLevelPage(page);
  await homePage.goto();

  // Act
  await homePage.signUp({
    email: `signup-${globalThis.crypto.randomUUID()}@example.com`,
    name: "Curriculum Reader",
    password: "curriculum-test-password",
  });

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-1\/zen$/u);
  await expect(curriculumPage.heading).toHaveText("Level 1: Zen");
});

test("lands on level 1 zen after signing in via the home form", async ({ baseURL, page }) => {
  // Arrange
  const email = `signin-${globalThis.crypto.randomUUID()}@example.com`;
  const password = "curriculum-test-password";
  const authClient = await signUpTestUser(page, baseURL, { email, password });
  await authClient.clearSession();
  const homePage = new HomePage(page);
  const curriculumPage = new CurriculumLevelPage(page);
  await homePage.goto();

  // Act
  await homePage.signIn({ email, password });

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-1\/zen$/u);
  await expect(curriculumPage.heading).toHaveText("Level 1: Zen");
});

test("authenticated users can open their protected profile from the header", async ({
  baseURL,
  page,
}) => {
  // Arrange
  await signUpTestUser(page, baseURL);
  const homePage = new HomePage(page);
  const profilePage = new ProfilePage(page);
  await homePage.goto();

  // Act
  await homePage.navigateToProfile();

  // Assert
  await expect(page).toHaveURL(/\/profile$/u);
  await expect(profilePage.heading).toBeVisible();
});

test("authenticated users can open their profile from the mobile navigation", async ({
  baseURL,
  page,
}) => {
  // Arrange
  await page.setViewportSize({ height: 844, width: 390 });
  await signUpTestUser(page, baseURL);
  const homePage = new HomePage(page);
  const profilePage = new ProfilePage(page);
  await homePage.goto();

  // Act
  await homePage.navigateToProfile();

  // Assert
  await expect(page).toHaveURL(/\/profile$/u);
  await expect(profilePage.heading).toBeVisible();
});

async function signUpTestUser(
  page: Page,
  baseURL: string | undefined,
  options?: { email?: string; password?: string },
): Promise<AuthClient> {
  const authClient = new AuthClient(page);
  const response = await authClient.signUp({ baseURL, ...options });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
  return authClient;
}
