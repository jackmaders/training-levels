import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage, HomePage, waitForHydration } from "./page-objects";

const LEVEL_SECTION_COUNT = 4;
const MOBILE_VIEWPORT = { height: 844, width: 390 };
const ZEN_STEP_COUNT = 5;

const STEP_ONE_SUMMARY = "The dog moves off a treat held in your hand. You're sitting down.";
const STEP_ONE_HEADING = `Step 1: ${STEP_ONE_SUMMARY}`;

async function signUpTestUser(page: Page, baseURL: string | undefined) {
  const authClient = new AuthClient(page);
  const response = await authClient.signUp({
    baseURL,
    email: `curriculum-${globalThis.crypto.randomUUID()}@example.com`,
    name: "Curriculum reader",
    password: "curriculum-test-password",
  });

  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
}

async function signUpAndVisitLevels(
  page: Page,
  baseURL: string | undefined,
): Promise<CurriculumLevelPage> {
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevels();
  return curriculumPage;
}

test("redirects unauthenticated visitors from /levels to sign in", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  const curriculumPage = new CurriculumLevelPage(page);

  // Act
  await curriculumPage.gotoLevels();

  // Assert
  await expect(page).toHaveURL(/\/$/u);
  await expect(homePage.heading).toBeVisible();
});

test("redirects authenticated visitors from /levels to level 1 zen with level-only sidebar", async ({
  baseURL,
  page,
}) => {
  // Arrange & Act
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-1\/zen$/u);
  await expect(curriculumPage.sidebarSectionButtons).toHaveCount(LEVEL_SECTION_COUNT);
  await expect(curriculumPage.getSidebarSectionButton("Level 1")).toContainText("0/25");
  await expect(curriculumPage.desktopSidebar.getByRole("button", { name: /Theory/u })).toBeHidden();
  await expect(
    curriculumPage.desktopSidebar.getByRole("button", { name: /Appendices/u }),
  ).toBeHidden();
});

test("displays level 1 through 4 sections and toggles level 2 in the sidebar", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act
  await curriculumPage.toggleSection("Level 2");

  // Assert
  await expect(curriculumPage.getSidebarSectionButton("Level 2")).toBeVisible();
  await expect(curriculumPage.getSidebarSectionButton("Level 3")).toBeVisible();
  await expect(curriculumPage.getSidebarSectionButton("Level 4")).toBeVisible();
  await expect(curriculumPage.getSidebarLink("Level 2 Overview")).toBeVisible();
});

test("renders zen breadcrumb, progress bar, and footer navigation", async ({ baseURL, page }) => {
  // Arrange & Act
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Assert
  await expect(curriculumPage.getBreadcrumbLink("Level 1")).toBeVisible();
  await expect(curriculumPage.getBreadcrumbCurrent("Zen")).toBeVisible();
  await expect(curriculumPage.getProgressText("0 of 5 steps")).toBeVisible();
  await expect(curriculumPage.getFooterPreviousLink("Level 1 Overview")).toBeVisible();
  await expect(curriculumPage.getFooterNextLink("Come")).toBeVisible();
});

test("renders five collapsed step cards with bold summaries and no step prefix", async ({
  baseURL,
  page,
}) => {
  // Arrange & Act
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Assert
  await expect(curriculumPage.stepTriggers).toHaveCount(ZEN_STEP_COUNT);
  await expect(curriculumPage.article.getByRole("button", { expanded: false })).toHaveCount(
    ZEN_STEP_COUNT,
  );
  await expect(curriculumPage.getStepTrigger(STEP_ONE_SUMMARY)).toBeVisible();
  await expect(curriculumPage.article.getByRole("button", { name: /^Step \d+/u })).toHaveCount(0);
  await expect(curriculumPage.getArticleText(/Start sitting in a chair\./u)).toBeHidden();
});

test("expands step 1 card to reveal instructions and try it cold content", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act
  await curriculumPage.expandStep(STEP_ONE_SUMMARY);

  // Assert
  await expect(curriculumPage.getStepTrigger(STEP_ONE_SUMMARY)).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(curriculumPage.getArticleText(/Start sitting in a chair\./u)).toBeVisible();
  await expect(curriculumPage.getArticleText(/Great! Check it off!/u)).toBeVisible();
  await expect(curriculumPage.getArticleText("Comeafters")).toBeVisible();
});

test("updates progress on step check and persists across reload", async ({ baseURL, page }) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act
  await curriculumPage.toggleStepCheckbox(STEP_ONE_HEADING);

  // Assert
  await expect(curriculumPage.getProgressText("1 of 5 steps")).toBeVisible();
  await expect(curriculumPage.getSidebarSectionButton("Level 1")).toContainText("1/25");
  await expect(curriculumPage.getSidebarLink("Zen")).toContainText("1/5");

  // Act
  await page.reload();
  await waitForHydration(page);

  // Assert
  await expect(curriculumPage.getProgressText("1 of 5 steps")).toBeVisible();
  await expect(curriculumPage.getSidebarSectionButton("Level 1")).toContainText("1/25");
});

test("restores zero progress across reload when unchecking a completed step", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);
  await curriculumPage.toggleStepCheckbox(STEP_ONE_HEADING);
  await curriculumPage.getProgressText("1 of 5 steps").waitFor({ state: "visible" });

  // Act
  await curriculumPage.toggleStepCheckbox(STEP_ONE_HEADING);
  await page.reload();
  await waitForHydration(page);

  // Assert
  await expect(curriculumPage.getProgressText("0 of 5 steps")).toBeVisible();
  await expect(curriculumPage.getSidebarSectionButton("Level 1")).toContainText("0/25");
  await expect(curriculumPage.getStepCheckbox(STEP_ONE_HEADING)).not.toBeChecked();
});

test("navigates between level 1 pages via footer and sidebar links", async ({ baseURL, page }) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act & Assert overview via footer
  await curriculumPage.openFooterPrevious("Level 1 Overview");
  await expect(curriculumPage.heading).toHaveText("Level 1");
  await expect(curriculumPage.getBreadcrumbCurrent("Level 1 Overview")).toBeVisible();

  // Act & Assert come via sidebar
  await curriculumPage.openSidebarLink("Come");
  await expect(curriculumPage.heading).toHaveText("Level 1: Come");

  // Act & Assert homework via sidebar
  await curriculumPage.openSidebarLink("Level 1 Homework");
  await expect(page).toHaveURL(/\/levels\/level-1\/homework$/u);
  await expect(curriculumPage.heading).toHaveText("Level 1: Homework");
});

test("navigates directly to a level page and advances via footer next link", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = new CurriculumLevelPage(page);
  await signUpTestUser(page, baseURL);
  await curriculumPage.gotoLevelPage("level-1", "zen");

  // Act
  await curriculumPage.openFooterNext("Come");

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-1\/come$/u);
  await expect(curriculumPage.heading).toHaveText("Level 1: Come");
});

test("navigates via mobile drawer menu on narrow viewports", async ({ baseURL, page }) => {
  // Arrange
  await page.setViewportSize(MOBILE_VIEWPORT);
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act
  await curriculumPage.openMobileDrawer();
  await curriculumPage.openSidebarLink("Come");

  // Assert
  await expect(curriculumPage.mobileDrawer).toBeHidden();
  await expect(page).toHaveURL(/\/levels\/level-1\/come$/u);
  await expect(curriculumPage.heading).toHaveText("Level 1: Come");
});

test("renders page not found on client-side navigation to a missing level page", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = await signUpAndVisitLevels(page, baseURL);

  // Act
  await curriculumPage.navigateClientSide("/levels/level-1/nonexistent");

  // Assert
  await expect(page).toHaveURL(/\/levels\/level-1\/nonexistent$/u);
  await expect(curriculumPage.pageNotFoundHeading).toBeVisible();
});
