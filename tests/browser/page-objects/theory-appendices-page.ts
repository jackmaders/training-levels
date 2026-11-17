import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

const MAX_KEYBOARD_TABS_TO_FOCUS_ARTICLE_LINK = 40;

type CurriculumSectionName = "Appendices" | "Theory";
type HeaderCurriculumLinkName = CurriculumSectionName | "Levels";

class TheoryAppendicesPage {
  public readonly articleNavigation: Locator;
  public readonly breadcrumbNavigation: Locator;
  public readonly main: Locator;
  public readonly notFoundHeading: Locator;
  public readonly sectionItems: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.main = page.getByRole("main");
    this.notFoundHeading = this.main.getByRole("heading", {
      level: 1,
      name: "Page Not Found",
    });
    this.sectionItems = this.main.getByRole("list").getByRole("listitem");
    this.breadcrumbNavigation = this.main.getByRole("navigation", {
      name: "Breadcrumb",
    });
    this.articleNavigation = this.main.getByRole("navigation", {
      name: "Article navigation",
    });
  }

  public async goto(path: string) {
    await this.page.goto(path);
    await waitForHydration(this.page);
  }

  public async focusLinkByKeyboard(link: Locator) {
    for (let attempt = 0; attempt < MAX_KEYBOARD_TABS_TO_FOCUS_ARTICLE_LINK; attempt += 1) {
      await this.page.keyboard.press("Tab");
      if (await link.evaluate((element) => element === document.activeElement)) {
        return;
      }
    }

    throw new Error("Link was not reachable by keyboard tab navigation");
  }

  /** Navigates via History API so TanStack Router handles 404s without a document 404 console error. */
  public async navigateClientSide(path: string) {
    await this.page.evaluate((targetPath) => {
      globalThis.history.pushState(null, "", targetPath);
      globalThis.dispatchEvent(new globalThis.PopStateEvent("popstate"));
    }, path);
  }

  public getArticleHeading(title: string): Locator {
    return this.main.getByRole("heading", { level: 1, name: title });
  }

  public getHeaderLink(name: HeaderCurriculumLinkName): Locator {
    return this.page.getByRole("banner").getByRole("link", { exact: true, name });
  }

  public async openSectionArticle(title: string) {
    await this.main.getByRole("list").getByRole("link", { name: title }).click();
  }

  public async openInlineLink(name: string) {
    await this.main.getByRole("link", { name }).click();
  }

  public async goToNextArticle(title: string) {
    await this.clickArticleNavLink("Next", title);
  }

  public async goToPreviousArticle(title: string) {
    await this.clickArticleNavLink("Previous", title);
  }

  public async clickBreadcrumbSection(section: CurriculumSectionName) {
    await this.breadcrumbNavigation.getByRole("link", { name: section }).click();
  }

  public async navigateFromHeader(section: CurriculumSectionName) {
    const menu = this.page.getByRole("button", { name: "Open menu" });
    if (await menu.isVisible()) {
      await menu.click();
      await this.page.getByRole("dialog").getByRole("link", { name: section }).click();
      return;
    }
    await this.getHeaderLink(section).click();
  }

  private async clickArticleNavLink(direction: "Next" | "Previous", title: string) {
    const pattern = direction === "Next" ? /Next/u : /Previous/u;
    await this.articleNavigation
      .getByRole("link", { name: pattern })
      .filter({ hasText: title })
      .click();
  }
}

export { TheoryAppendicesPage };
