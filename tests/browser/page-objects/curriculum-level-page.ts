import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

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

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.article = page.getByRole("article");
    this.breadcrumb = page.getByRole("navigation", { name: "breadcrumb" });
    this.desktopSidebar = page.getByRole("complementary", { name: "Curriculum navigation" });
    this.mobileDrawer = page.getByRole("dialog", { name: "Curriculum Levels" });
    this.mobileMenuButton = page.getByRole("button", { name: "Levels menu" });
    this.pageFooterNav = page.getByRole("navigation", { name: "Page navigation" });
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

  public async gotoLevelPage(section: string, page: string) {
    await this.page.goto(`/levels/${section}/${page}`);
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

  public async toggleStepCheckbox(stepHeading: string) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes("/_serverFn/") && response.request().method() === "POST",
    );
    await this.getStepCheckbox(stepHeading).click();
    await responsePromise;
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

  public getStepTrigger(summary: string): Locator {
    return this.article.getByRole("button", { exact: true, name: summary });
  }

  public getStepCheckbox(stepHeading: string): Locator {
    return this.article.getByRole("checkbox", {
      exact: true,
      name: `Toggle ${stepHeading}`,
    });
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
