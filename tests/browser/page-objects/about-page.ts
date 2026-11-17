import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class AboutPage {
  public readonly heading: Locator;
  public readonly description: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      level: 1,
      name: "About Dog Training Levels",
    });
    this.description = page.getByText(
      "A practical, progressive curriculum for everyday dog training.",
    );
  }

  public async goto() {
    await this.page.goto("/about");
    await waitForHydration(this.page);
  }
}

export { AboutPage };
