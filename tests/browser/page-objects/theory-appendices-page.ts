import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class TheoryAppendicesPage {
  public readonly articleNavigation: Locator;
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
    this.articleNavigation = this.main.getByRole("navigation", {
      name: "Article navigation",
    });
  }

  public async goto(path: string) {
    await this.page.goto(path);
    await waitForHydration(this.page);
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

  public getInlineLink(name: string): Locator {
    return this.main.getByRole("link", { name });
  }

  public getNextArticleLink(title: string): Locator {
    return this.articleNavigation.getByRole("link", { name: /Next/u }).filter({ hasText: title });
  }

  public getSectionArticleLink(title: string): Locator {
    return this.main.getByRole("link", { name: title });
  }

  public async navigateFromHeader(section: "Appendices" | "Theory") {
    const menu = this.page.getByRole("button", { name: "Open menu" });
    if (await menu.isVisible()) {
      await menu.click();
      await this.page.getByRole("dialog").getByRole("link", { name: section }).click();
      return;
    }
    await this.page.getByRole("banner").getByRole("link", { name: section }).click();
  }
}

export { TheoryAppendicesPage };
