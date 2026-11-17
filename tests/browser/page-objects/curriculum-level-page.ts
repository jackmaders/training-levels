import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

const MAX_KEYBOARD_TABS_TO_FOCUS_LEVEL_LINK = 60;

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
}

function createSectionButtonPattern(title: string): RegExp {
  return new RegExp(`^${escapeRegExp(title)}\\s+\\d+/\\d+$`, "u");
}

function createSidebarLinkPattern(title: string): RegExp {
  return new RegExp(`^${escapeRegExp(title)}(?:\\s+\\d+/\\d+|\\s+Completed)?$`, "u");
}

class CurriculumLevelPage {
  public readonly article: Locator;
  public readonly breadcrumb: Locator;
  public readonly desktopSidebar: Locator;
  public readonly mobileDrawer: Locator;
  public readonly mobileMenuButton: Locator;
  public readonly pageFooterNav: Locator;
  public readonly whereWeAreGoingSection: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.article = page.getByRole("article");
    this.breadcrumb = page.getByRole("navigation", { name: "breadcrumb" });
    this.desktopSidebar = page.getByRole("complementary", { name: "Curriculum navigation" });
    this.mobileDrawer = page.getByRole("dialog", { name: "Curriculum Levels" });
    this.mobileMenuButton = page.getByRole("button", { name: "Levels menu" });
    this.pageFooterNav = page.getByRole("navigation", { name: "Page navigation" });
    this.whereWeAreGoingSection = this.article.getByRole("region", { name: "Where We Are Going" });
  }

  public get heading(): Locator {
    return this.article.getByRole("heading", { level: 1 });
  }

  public get progressBar(): Locator {
    return this.article.getByRole("progressbar", { name: "Step Progress" });
  }

  public get sidebarSectionButtons(): Locator {
    return this.desktopSidebar.getByRole("button");
  }

  public get stepTriggers(): Locator {
    return this.article.getByRole("button");
  }

  public get collapsedStepTriggers(): Locator {
    return this.article.getByRole("button", { expanded: false });
  }

  public get stepPrefixedTriggers(): Locator {
    return this.article.getByRole("button", { name: /^Step \d+/u });
  }

  public get stepCheckboxes(): Locator {
    return this.article.getByRole("checkbox");
  }

  public get toggleErrorAlert(): Locator {
    return this.article.getByRole("alert");
  }

  public get pageNotFoundHeading(): Locator {
    return this.page.getByRole("heading", { level: 1, name: "Page Not Found" });
  }

  public async gotoLevels() {
    await this.page.goto("/levels");
    await waitForHydration(this.page);
  }

  public async focusLinkByKeyboard(link: Locator) {
    await this.focusControlByKeyboard(link);
  }

  public async focusControlByKeyboard(control: Locator) {
    for (let attempt = 0; attempt < MAX_KEYBOARD_TABS_TO_FOCUS_LEVEL_LINK; attempt += 1) {
      await this.page.keyboard.press("Tab");
      if (await control.evaluate((element) => element === document.activeElement)) {
        return;
      }
    }

    throw new Error("Control was not reachable by keyboard tab navigation");
  }

  public async gotoLevelPage(section: string, page: string) {
    await this.page.goto(`/levels/${section}/${page}`);
    await waitForHydration(this.page);
  }

  public async setVisualLayout({
    width,
    height,
    theme,
  }: {
    width: number;
    height: number;
    theme: "light" | "dark";
  }) {
    await this.page.setViewportSize({ height, width });
    await this.page.evaluate((nextTheme) => {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    }, theme);
  }

  public horizontalOverflow() {
    return this.page.evaluate(() => {
      const documentWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const viewportWidth = document.documentElement.clientWidth;
      return Math.max(documentWidth, bodyWidth) - viewportWidth;
    });
  }

  public async gotoLevelPageAnchor(section: string, page: string, anchor: string) {
    await this.page.goto(`/levels/${section}/${page}#${anchor}`);
    await waitForHydration(this.page);
  }

  public async reload() {
    await this.page.reload();
    await waitForHydration(this.page);
  }

  public async navigateClientSide(path: string) {
    await this.page.evaluate((targetPath) => {
      globalThis.history.pushState(null, "", targetPath);
      globalThis.dispatchEvent(new globalThis.PopStateEvent("popstate"));
    }, path);
  }

  public async openMobileDrawer() {
    await this.mobileMenuButton.click();
    await this.mobileDrawer.waitFor({ state: "visible" });
  }

  public mobileDrawerFitsViewport() {
    return this.mobileDrawer.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      return bounds.left >= 0 && bounds.right <= viewportWidth;
    });
  }

  public async openMobileDrawerByKeyboard() {
    await this.focusControlByKeyboard(this.mobileMenuButton);
    await this.page.keyboard.press("Enter");
    await this.mobileDrawer.waitFor({ state: "visible" });
  }

  public async closeMobileDrawerWithEscape() {
    await this.page.keyboard.press("Escape");
  }

  public async setDarkTheme() {
    await this.page.evaluate(() => document.documentElement.classList.add("dark"));
  }

  public async toggleStepCheckboxByKeyboard(stepHeading: string) {
    await this.focusControlByKeyboard(this.getStepCheckbox(stepHeading));
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes("/_serverFn/") && response.request().method() === "POST",
    );
    await this.page.keyboard.press("Space");
    await responsePromise;
  }

  public async toggleSection(title: string) {
    const container = await this.getSidebarContainer();
    await container.getByRole("button", { name: createSectionButtonPattern(title) }).click();
  }

  public async openSidebarLink(title: string) {
    const container = await this.getSidebarContainer();
    await container.getByRole("link", { name: createSidebarLinkPattern(title) }).click();
  }

  public async expandStep(summary: string) {
    await this.getStepTrigger(summary).click();
  }

  public async collapseStep(summary: string) {
    await this.getStepTrigger(summary).click();
  }

  public async openWhereWeAreGoingStep(stepNumber: number) {
    await this.whereWeAreGoingSection
      .getByRole("link", { exact: true, name: `Step ${String(stepNumber)}` })
      .click();
  }

  public async toggleStepCheckbox(stepHeading: string) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes("/_serverFn/") && response.request().method() === "POST",
    );
    await this.getStepCheckbox(stepHeading).click();
    await responsePromise;
  }

  public async waitForProgressVisible(text: string) {
    await this.getProgressText(text).waitFor({ state: "visible" });
  }

  public async openFooterPrevious(title: string) {
    await this.getFooterPreviousLink(title).click();
  }

  public async openFooterNext(title: string) {
    await this.getFooterNextLink(title).click();
  }

  public getSidebarSectionButton(title: string): Locator {
    return this.desktopSidebar.getByRole("button", { name: createSectionButtonPattern(title) });
  }

  public getSidebarSectionButtonByName(pattern: RegExp): Locator {
    return this.desktopSidebar.getByRole("button", { name: pattern });
  }

  public getSidebarLink(title: string): Locator {
    return this.desktopSidebar.getByRole("link", { name: createSidebarLinkPattern(title) });
  }

  public getBreadcrumbLink(title: string): Locator {
    return this.breadcrumb.getByRole("link", { exact: true, name: title });
  }

  public getBreadcrumbCurrent(title: string): Locator {
    return this.breadcrumb.getByText(title, { exact: true });
  }

  public getFooterPreviousLink(title: string): Locator {
    return this.pageFooterNav.getByRole("link", {
      name: new RegExp(`^Previous\\s+${escapeRegExp(title)}$`, "u"),
    });
  }

  public getFooterNextLink(title: string): Locator {
    return this.pageFooterNav.getByRole("link", {
      name: new RegExp(`^Next\\s+${escapeRegExp(title)}$`, "u"),
    });
  }

  public getStepSummary(summary: string): Locator {
    return this.article.getByText(summary, { exact: true });
  }

  public getStepTrigger(summary: string): Locator {
    return this.article.getByRole("button", {
      exact: true,
      name: `Toggle details for ${summary}`,
    });
  }

  public getStepCheckbox(stepHeading: string): Locator {
    return this.article.getByRole("checkbox", {
      exact: true,
      name: `Toggle ${stepHeading}`,
    });
  }

  public getWhereWeAreGoingItem(stepNumber: number): Locator {
    return this.whereWeAreGoingSection
      .getByRole("listitem")
      .filter({ hasText: new RegExp(`^Step ${String(stepNumber)}:`, "u") });
  }

  public getProgressText(text: string): Locator {
    return this.article.getByText(text, { exact: true });
  }

  public getArticleText(pattern: string | RegExp): Locator {
    return this.article.getByText(pattern);
  }

  private async getSidebarContainer(): Promise<Locator> {
    if (await this.mobileDrawer.isVisible()) {
      return this.mobileDrawer;
    }

    return this.desktopSidebar;
  }
}

export { CurriculumLevelPage };
