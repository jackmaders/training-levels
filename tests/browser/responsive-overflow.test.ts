import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage, HomePage } from "./page-objects";

const DESKTOP_LIGHT = { height: 900, theme: "light", width: 1440 } as const;
const DESKTOP_DARK = { height: 900, theme: "dark", width: 1440 } as const;
const MOBILE_LIGHT = { height: 844, theme: "light", width: 390 } as const;
const MOBILE_DARK = { height: 844, theme: "dark", width: 390 } as const;
const ZEN_STEP_COUNT = 5;
interface ResponsiveLayout {
  height: number;
  theme: "light" | "dark";
  width: number;
}

test("desktop light forms and curriculum fit without horizontal overflow", async ({
  baseURL,
  page,
}) => {
  // Arrange and assert desktop light form and curriculum layout.
  const result = await exerciseResponsiveLayout(page, baseURL, DESKTOP_LIGHT);
  expect(result).toStrictEqual({
    curriculum: { heading: "Level 1: Zen", noOverflow: true, stepCount: ZEN_STEP_COUNT },
    forms: { noOverflow: true, signInVisible: true, signUpVisible: true },
  });
});

test("desktop dark forms and curriculum fit without horizontal overflow", async ({
  baseURL,
  page,
}) => {
  // Arrange and assert desktop dark form and curriculum layout.
  const result = await exerciseResponsiveLayout(page, baseURL, DESKTOP_DARK);
  expect(result).toStrictEqual({
    curriculum: { heading: "Level 1: Zen", noOverflow: true, stepCount: ZEN_STEP_COUNT },
    forms: { noOverflow: true, signInVisible: true, signUpVisible: true },
  });
});

test("mobile light forms and curriculum fit without horizontal overflow", async ({
  baseURL,
  page,
}) => {
  // Arrange and assert mobile light form and curriculum layout.
  const result = await exerciseResponsiveLayout(page, baseURL, MOBILE_LIGHT);
  expect(result).toStrictEqual({
    curriculum: { heading: "Level 1: Zen", noOverflow: true, stepCount: ZEN_STEP_COUNT },
    forms: { noOverflow: true, signInVisible: true, signUpVisible: true },
  });
});

test("mobile dark forms and curriculum fit without horizontal overflow", async ({
  baseURL,
  page,
}) => {
  // Arrange and assert mobile dark form and curriculum layout.
  const result = await exerciseResponsiveLayout(page, baseURL, MOBILE_DARK);
  expect(result).toStrictEqual({
    curriculum: { heading: "Level 1: Zen", noOverflow: true, stepCount: ZEN_STEP_COUNT },
    forms: { noOverflow: true, signInVisible: true, signUpVisible: true },
  });
});

test("mobile light curriculum drawer fits the viewport without overflow", async ({
  baseURL,
  page,
}) => {
  // Arrange and open the mobile light drawer.
  const curriculumPage = await openMobileDrawer(page, baseURL, MOBILE_LIGHT);
  // Assert settled panel bounds and page overflow.
  await expect.poll(async () => await curriculumPage.mobileDrawerFitsViewport()).toBe(true);
  await expect.poll(async () => await curriculumPage.horizontalOverflow()).toBeLessThanOrEqual(0);
});

test("mobile dark curriculum drawer fits the viewport without overflow", async ({
  baseURL,
  page,
}) => {
  // Arrange and open the mobile dark drawer.
  const curriculumPage = await openMobileDrawer(page, baseURL, MOBILE_DARK);
  // Assert settled panel bounds and page overflow.
  await expect.poll(async () => await curriculumPage.mobileDrawerFitsViewport()).toBe(true);
  await expect.poll(async () => await curriculumPage.horizontalOverflow()).toBeLessThanOrEqual(0);
});

async function exerciseResponsiveLayout(
  page: Page,
  baseURL: string | undefined,
  layout: ResponsiveLayout,
) {
  const forms = await inspectForms(page, layout);
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevels();
  await curriculumPage.setVisualLayout(layout);

  return {
    curriculum: await inspectCurriculum(curriculumPage),
    forms,
  };
}

async function inspectForms(page: Page, layout: ResponsiveLayout) {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.setVisualLayout(layout);
  const signInOverflow = await homePage.horizontalOverflow();
  const signInVisible = await homePage.emailInput.isVisible();
  await homePage.switchToSignUp();
  const signUpOverflow = await homePage.horizontalOverflow();
  const signUpVisible = await homePage.nameInput.isVisible();

  return {
    noOverflow: signInOverflow <= 0 && signUpOverflow <= 0,
    signInVisible,
    signUpVisible,
  };
}

async function inspectCurriculum(curriculumPage: CurriculumLevelPage) {
  return {
    heading: await curriculumPage.heading.textContent(),
    noOverflow: (await curriculumPage.horizontalOverflow()) <= 0,
    stepCount: await curriculumPage.stepTriggers.count(),
  };
}

async function openMobileDrawer(page: Page, baseURL: string | undefined, layout: ResponsiveLayout) {
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevels();
  await curriculumPage.setVisualLayout(layout);
  await curriculumPage.openMobileDrawer();
  return curriculumPage;
}

async function signUpTestUser(page: Page, baseURL: string | undefined) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
}
