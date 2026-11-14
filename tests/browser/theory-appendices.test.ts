import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, HomePage, TheoryAppendicesPage } from "./page-objects";

const THEORY_ARTICLE_COUNT = 9;
const APPENDICES_ARTICLE_COUNT = 5;

test("redirects unauthenticated visitors from theory to sign in", async ({ page }) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  const homePage = new HomePage(page);

  // Act
  await curriculumPage.goto("/theory");

  // Assert
  await expect(page).toHaveURL(/\/$/u);
  await expect(homePage.heading).toBeVisible();
});

test("redirects unauthenticated visitors from appendices to sign in", async ({ page }) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  const homePage = new HomePage(page);

  // Act
  await curriculumPage.goto("/appendices");

  // Assert
  await expect(page).toHaveURL(/\/$/u);
  await expect(homePage.heading).toBeVisible();
});

test("displays levels, theory, and appendices links in header for authenticated users", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  await signUpAndVisitPath(page, baseURL, "/levels");

  // Assert
  await expect(curriculumPage.getHeaderLink("Levels")).toBeVisible();
  await expect(curriculumPage.getHeaderLink("Levels")).toHaveAttribute("href", "/levels");
  await expect(curriculumPage.getHeaderLink("Theory")).toBeVisible();
  await expect(curriculumPage.getHeaderLink("Appendices")).toBeVisible();
});

test("navigates via header to theory index, opens an article, and advances with next link", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  await signUpAndVisitPath(page, baseURL, "/levels");

  // Act
  await curriculumPage.navigateFromHeader("Theory");

  // Assert
  await expect(page).toHaveURL(/\/theory$/u);
  await expect(curriculumPage.sectionItems).toHaveCount(THEORY_ARTICLE_COUNT);

  // Act
  await curriculumPage.openSectionArticle("Why Are You Here?");

  // Assert
  await expect(page).toHaveURL(/\/theory\/03-why-are-you-here$/u);

  // Act
  await curriculumPage.goToNextArticle("The People of Training");

  // Assert
  await expect(page).toHaveURL(/\/theory\/04-the-people-of-training$/u);
  await expect(curriculumPage.getArticleHeading("The People of Training")).toBeVisible();
});

test("follows inline cross-link to appendix a, next link to appendix b, and header to appendices", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  await signUpAndVisitPath(page, baseURL, "/theory/04-the-people-of-training");

  // Act
  await curriculumPage.openInlineLink("Leading The Dance on page 267");

  // Assert
  await expect(page).toHaveURL(/\/appendices\/appendix-a-leading-the-dance$/u);

  // Act
  await curriculumPage.goToNextArticle("Appendix B: Teaching Your Dog to Eat");

  // Assert
  await expect(page).toHaveURL(/\/appendices\/appendix-b-teaching-your-dog-to-eat$/u);
  await expect(curriculumPage.getArticleHeading("Teaching Your Dog to Eat")).toBeVisible();

  // Act
  await curriculumPage.navigateFromHeader("Appendices");

  // Assert
  await expect(page).toHaveURL(/\/appendices$/u);
  await expect(curriculumPage.sectionItems).toHaveCount(APPENDICES_ARTICLE_COUNT);
});

test("returns to previous article via footer link and to section index via breadcrumb", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  await signUpAndVisitPath(page, baseURL, "/appendices/appendix-b-teaching-your-dog-to-eat");

  // Act
  await curriculumPage.goToPreviousArticle("Appendix A: Leading the Dance");

  // Assert
  await expect(page).toHaveURL(/\/appendices\/appendix-a-leading-the-dance$/u);
  await expect(
    curriculumPage.getArticleHeading("Leading the Dance: Building a Better Relationship"),
  ).toBeVisible();

  // Act
  await curriculumPage.clickBreadcrumbSection("Appendices");

  // Assert
  await expect(page).toHaveURL(/\/appendices$/u);
  await expect(curriculumPage.sectionItems).toHaveCount(APPENDICES_ARTICLE_COUNT);
});

test("renders page not found for unknown theory slug", async ({ baseURL, page }) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  await signUpAndVisitPath(page, baseURL, "/theory");

  // Act
  await curriculumPage.navigateClientSide("/theory/nonexistent");

  // Assert
  await expect(page).toHaveURL(/\/theory\/nonexistent$/u);
  await expect(curriculumPage.notFoundHeading).toBeVisible();
});

test("renders page not found for unknown appendices slug", async ({ baseURL, page }) => {
  // Arrange
  const curriculumPage = new TheoryAppendicesPage(page);
  await signUpAndVisitPath(page, baseURL, "/appendices");

  // Act
  await curriculumPage.navigateClientSide("/appendices/nonexistent");

  // Assert
  await expect(page).toHaveURL(/\/appendices\/nonexistent$/u);
  await expect(curriculumPage.notFoundHeading).toBeVisible();
});

async function signUpAndVisitPath(page: Page, baseURL: string | undefined, path: string) {
  const authClient = new AuthClient(page);
  const response = await authClient.signUp({
    baseURL,
    email: `curriculum-${globalThis.crypto.randomUUID()}@example.com`,
    name: "Curriculum Test User",
    password: "curriculum-test-password",
  });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
  const curriculumPage = new TheoryAppendicesPage(page);
  await curriculumPage.goto(path);
}
