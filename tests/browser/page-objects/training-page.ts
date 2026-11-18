import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class TrainingPage {
  public readonly startPractice!: Locator;
  public readonly startTest!: Locator;
  public readonly coldnessOverride!: Locator;
  public readonly passTestButton!: Locator;
  public readonly failTestButton!: Locator;
  public readonly testHistory!: Locator;
  public readonly testActivity!: Locator;
  public readonly prep!: Locator;
  public readonly startButton!: Locator;
  public readonly successButton!: Locator;
  public readonly notYetButton!: Locator;
  public readonly undoButton!: Locator;
  public readonly finishLink!: Locator;
  public readonly history!: Locator;
  public readonly counts!: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    Object.assign(this, createTrainingPageLocators(page));
  }

  public async gotoBehavior() {
    await this.page.goto("/levels/level-1/zen");
    await waitForHydration(this.page);
  }

  public async gotoTraining() {
    await this.page.goto("/training");
    await waitForHydration(this.page);
  }

  public async startTestActivity() {
    await this.startTest.click();
    await this.passTestButton.waitFor({ state: "visible" });
  }

  public async confirmColdness() {
    await this.coldnessOverride.check();
  }

  public async finishTest() {
    await this.page.getByRole("link", { name: "Finish Test" }).click();
  }

  public async startFromPrep() {
    await this.startPractice.click();
    await waitForHydration(this.page);
  }

  public async enterPractice() {
    await this.startFromPrep();
    await this.startButton.click();
    await this.successButton.waitFor({ state: "visible" });
  }

  public async recordSuccess() {
    await this.successButton.click();
  }

  public async recordSuccesses(count: number) {
    if (count === 0) {
      return;
    }
    await this.recordSuccess();
    await this.recordSuccesses(count - 1);
  }

  public async recordTest(outcome: "passed" | "not_yet") {
    const button = outcome === "passed" ? this.passTestButton : this.failTestButton;
    await button.click();
  }

  public async finishPractice() {
    await this.finishLink.click();
  }

  public async reload() {
    await this.page.reload();
    await waitForHydration(this.page);
  }

  public async enterTotals(success: string, notYet: string) {
    const entryForm = this.totalsRegion().getByRole("form", { name: "Enter practice totals" });
    await entryForm.getByLabel("Success count").fill(success);
    await entryForm.getByLabel("Not yet count").fill(notYet);
    await entryForm.getByRole("button", { name: "Save totals" }).click();
  }

  public async correctTotals(success: string, notYet: string) {
    const correctionForm = this.totalsRegion().getByRole("form", { name: "Correct saved totals" });
    await correctionForm.getByLabel("Success count").fill(success);
    await correctionForm.getByLabel("Not yet count").fill(notYet);
    await correctionForm.getByRole("button", { name: "Correct totals" }).click();
  }

  public async recommendTestNextTime() {
    await this.page.getByRole("button", { name: "Recommend a Test next time" }).click();
  }

  public totalsRegion() {
    return this.page.getByRole("region", { name: "Enter totals" });
  }
}

function createTrainingPageLocators(page: Page) {
  return {
    coldnessOverride: page.getByRole("checkbox", {
      name: "I confirm I can test this Behavior cold without warming it up now.",
    }),
    counts: page.getByText(/\d+ Success · \d+ Not yet/u),
    failTestButton: page.getByRole("button", { exact: true, name: "Not yet" }),
    finishLink: page.getByRole("link", { name: "Finish Practice" }),
    history: page.getByRole("list", { name: "Practice history" }),
    notYetButton: page.getByRole("button", { exact: true, name: "Not yet" }),
    passTestButton: page.getByRole("button", { name: "Test passed" }),
    prep: page.getByRole("region", { name: "Prep" }),
    startButton: page.getByRole("button", { name: /^(?:Start|Resume) Practice$/u }),
    startPractice: page.getByRole("link", { name: "Practice Step 1" }),
    startTest: page.getByRole("button", { name: "Start Test" }),
    successButton: page.getByRole("button", { exact: true, name: "Success" }),
    testActivity: page.getByRole("region", { name: "Test the full Step criterion cold" }),
    testHistory: page.getByRole("list", { name: "Test history" }),
    undoButton: page.getByRole("button", { name: "Undo" }),
  };
}

export { TrainingPage };
