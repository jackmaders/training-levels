import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { AuthClient, CurriculumLevelPage } from "./page-objects";

test("shows a visible keyboard focus indicator on curriculum footer cards", async ({
  baseURL,
  page,
}) => {
  // Arrange
  const curriculumPage = await openLevelZen(page, baseURL);
  const cardLink = curriculumPage.getFooterNextLink("Come");

  // Act
  await curriculumPage.focusLinkByKeyboard(cardLink);
  const focusStyle = await readFocusIndicator(cardLink);

  // Assert
  expect(focusStyle.boxShadow).not.toBe("none");
  expect(focusStyle.content).not.toBe("none");
  expect(focusStyle.focusVisible).toBe(true);
  expect(focusStyle.inset).toBe("0px");
  expect(focusStyle.position).toBe("absolute");
});

async function openLevelZen(page: Page, baseURL?: string) {
  await signUpTestUser(page, baseURL);
  const curriculumPage = new CurriculumLevelPage(page);
  await curriculumPage.gotoLevelPage("level-1", "zen");
  return curriculumPage;
}

async function signUpTestUser(page: Page, baseURL?: string) {
  const response = await new AuthClient(page).signUp({ baseURL });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
}

async function readFocusIndicator(link: Locator) {
  return await link.evaluate((element) => {
    const style = globalThis.getComputedStyle(element, "::after");
    return {
      boxShadow: style.boxShadow,
      content: style.content,
      focusVisible: element.matches(":focus-visible"),
      inset: style.inset,
      position: style.position,
    };
  });
}
