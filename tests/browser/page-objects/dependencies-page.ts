import type { Locator, Page } from "@playwright/test";

const LEVEL_TWO = 2;

class DependenciesPage {
  public readonly dependencyList: Locator;
  public readonly levelScroller: Locator;
  public readonly relationshipConnectors: Locator;
  public readonly levelColumns: Locator;
  public readonly selectedDetails: Locator;
  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.dependencyList = page.getByRole("region", { name: "Dependency list" });
    this.levelScroller = page.getByRole("region", { name: "Curriculum dependency graph" });
    // eslint-disable-next-line playwright/no-raw-locators
    this.relationshipConnectors = this.levelScroller.locator('svg path[fill="none"]');
    this.selectedDetails = page.getByRole("region", { name: "Selected behavior" });
    this.levelColumns = page.getByRole("region", { name: /^Level [1-4]$/u });
  }

  public async goto() {
    await this.page.goto("/dependencies");
  }

  public async selectBehavior(name: string) {
    await this.levelColumn(LEVEL_TWO)
      .getByRole("button", { name: new RegExp(`^${name}\\b`, "u") })
      .click();
  }

  public async setMobileViewport() {
    await this.page.setViewportSize({ height: 844, width: 390 });
  }

  public async tabFromLevelOneToLevelTwo() {
    await this.levelColumn(1)
      .getByRole("button", { name: /^Down\b/u })
      .focus();
    await this.page.keyboard.press("Tab");
  }

  public firstBehaviorInLevel(level: number): Locator {
    return this.levelColumn(level).getByRole("button", { name: /^Zen\b/u });
  }

  public levelColumn(level: number): Locator {
    return this.page.getByRole("region", { name: `Level ${String(level)}` });
  }
}

export { DependenciesPage };
