import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class ProfilePage {
  public readonly heading: Locator;
  public readonly main: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.main = page.getByRole("main");
    this.heading = this.main.getByRole("heading", { level: 1, name: "Your profile" });
  }

  public async goto() {
    await this.page.goto("/profile");
    await waitForHydration(this.page);
  }
}

export { ProfilePage };
