import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "../hydration";

const MOBILE_VIEWPORT_HEIGHT = 844;
const MOBILE_VIEWPORT_WIDTH = 390;

class CurriculumTrainingLinks {
  private readonly article: Locator;
  private readonly page: Page;
  private readonly stepsRegion: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.article = page.getByRole("article");
    this.stepsRegion = this.article.getByRole("region", { name: "Steps" });
  }

  public behaviorPracticeLink(stepNumber: number): Locator {
    return this.article.getByRole("link", {
      exact: true,
      name: `Practice Step ${String(stepNumber)}`,
    });
  }

  public behaviorTestLink(stepNumber: number): Locator {
    return this.article.getByRole("link", {
      exact: true,
      name: `Test Step ${String(stepNumber)}`,
    });
  }

  public openStepPracticeLink(stepNumber: number): Locator {
    return this.stepsRegion.getByRole("link", {
      exact: true,
      name: `Open Step ${String(stepNumber)} in Practice`,
    });
  }

  public openStepTestLink(stepNumber: number): Locator {
    return this.stepsRegion.getByRole("link", {
      exact: true,
      name: `Open Step ${String(stepNumber)} in Test`,
    });
  }

  public async launchBehaviorTest(stepNumber: number) {
    await this.behaviorTestLink(stepNumber).click();
    await waitForHydration(this.page);
  }

  public async launchStepTest(stepNumber: number) {
    await this.openStepTestLink(stepNumber).click();
    await waitForHydration(this.page);
  }

  public async setMobileViewport() {
    await this.page.setViewportSize({
      height: MOBILE_VIEWPORT_HEIGHT,
      width: MOBILE_VIEWPORT_WIDTH,
    });
  }
}

export { CurriculumTrainingLinks };
