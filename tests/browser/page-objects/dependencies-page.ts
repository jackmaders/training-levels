import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

const LEVEL_TWO = 2;
const MOBILE_VIEWPORT_HEIGHT = 844;
const MOBILE_VIEWPORT_WIDTH = 390;

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
}

function createBehaviorCardPattern(title: string): RegExp {
  return new RegExp(`^${escapeRegExp(title)}\\s+\\d+ of \\d+ Steps complete`, "u");
}

class DependenciesPage {
  public readonly currentGoalBadge: Locator;
  public readonly dependencyList: Locator;
  public readonly levelScroller: Locator;
  public readonly relationshipConnectors: Locator;
  public readonly levelColumns: Locator;
  public readonly selectedDetails: Locator;
  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.currentGoalBadge = page.getByRole("main").getByText(/^Current goal: Level \d+$/u);
    this.dependencyList = page.getByRole("region", { name: "Dependency list" });
    this.levelScroller = page.getByRole("region", { name: "Curriculum dependency graph" });
    // eslint-disable-next-line playwright/no-raw-locators
    this.relationshipConnectors = this.levelScroller.locator('svg path[fill="none"]');
    this.selectedDetails = page.getByRole("region", { name: "Selected behavior" });
    this.levelColumns = page.getByRole("region", { name: /^Level [1-4]$/u });
  }

  public async goto() {
    await this.page.goto("/dependencies");
    await waitForHydration(this.page);
  }

  public async selectBehavior(name: string) {
    await this.levelColumn(LEVEL_TWO)
      .getByRole("button", { name: new RegExp(`^${name}\\b`, "u") })
      .click();
  }

  public async selectGraphBehavior(level: number, title: string) {
    await this.graphBehavior(level, title).click();
  }

  public async selectListBehavior(title: string, relationshipHint?: string) {
    await this.listBehavior(title, relationshipHint).click();
  }

  public async launchPracticeFromSelected(stepNumber: number) {
    await this.selectedDetails
      .getByRole("link", { exact: true, name: `Practice Step ${String(stepNumber)}` })
      .click();
    await waitForHydration(this.page);
  }

  public async launchTestFromSelected(stepNumber: number) {
    await this.selectedDetails
      .getByRole("link", { exact: true, name: `Test Step ${String(stepNumber)}` })
      .click();
    await waitForHydration(this.page);
  }

  public async setMobileViewport() {
    await this.page.setViewportSize({
      height: MOBILE_VIEWPORT_HEIGHT,
      width: MOBILE_VIEWPORT_WIDTH,
    });
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

  public graphBehavior(level: number, title: string): Locator {
    return this.levelColumn(level).getByRole("button", { name: createBehaviorCardPattern(title) });
  }

  public listBehavior(title: string, relationshipHint?: string): Locator {
    const button = this.dependencyList.getByRole("button", {
      name: createBehaviorCardPattern(title),
    });
    return relationshipHint === undefined ? button : button.filter({ hasText: relationshipHint });
  }

  public selectedStepItem(stepHeading: string): Locator {
    return this.selectedDetails.getByRole("listitem").filter({ hasText: stepHeading });
  }

  public levelColumn(level: number): Locator {
    return this.page.getByRole("region", { name: `Level ${String(level)}` });
  }
}

export { DependenciesPage };
