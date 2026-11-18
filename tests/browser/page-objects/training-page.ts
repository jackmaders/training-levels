import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class TrainingPage {
  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public get startPractice(): Locator {
    return this.page.getByRole("link", { name: "Practice Step 1" });
  }
  public get startButton(): Locator {
    return this.page.getByRole("button", { name: /^(?:Start|Resume) Practice$/u });
  }
  public get successButton(): Locator {
    return this.page.getByRole("button", { exact: true, name: "Success" });
  }
  public get notYetButton(): Locator {
    return this.page.getByRole("button", { exact: true, name: "Not yet" });
  }
  public get undoButton(): Locator {
    return this.page.getByRole("button", { name: "Undo" });
  }
  public get finishLink(): Locator {
    return this.page.getByRole("link", { name: "Finish Practice" });
  }
  public get history(): Locator {
    return this.page.getByRole("list", { name: "Practice history" });
  }
  public get counts(): Locator {
    return this.page.getByText(/^\d+ Success · \d+ Not yet$/u);
  }
  public get stepSelect(): Locator {
    return this.page.getByLabel("Behavior and Step");
  }
  public get target(): Locator {
    return this.page.getByRole("status", { name: "Current practice target" });
  }
  public get nextTargetButton(): Locator {
    return this.page.getByRole("button", { name: "Next ladder target" });
  }
  public get targetSelect(): Locator {
    return this.page.getByLabel("Choose target");
  }
  public get guidance(): Locator {
    return this.page.getByRole("region", { name: "Practice guidance" });
  }
  public get recommendTestButton(): Locator {
    return this.page.getByRole("button", { name: "Recommend a Test next time" });
  }
  public get timerStartButton(): Locator {
    return this.page.getByRole("button", { name: "Start timer" });
  }
  public get confirmTimerSuccess(): Locator {
    return this.page.getByRole("button", { name: "Confirm Success" });
  }
  public get breakButton(): Locator {
    return this.page.getByRole("button", { name: "Take a break" });
  }
  public get continueButton(): Locator {
    return this.page.getByRole("button", { name: "Continue" });
  }
  public get breakHeading(): Locator {
    return this.page.getByRole("heading", { name: "Take a break" });
  }
  public get prep(): Locator {
    return this.page.getByRole("region", { name: "Prep" });
  }
  public get startTest(): Locator {
    return this.page.getByRole("button", { name: "Start Test" });
  }
  public get coldnessOverride(): Locator {
    return this.page.getByRole("checkbox", {
      name: "I confirm I can test this Behavior cold without warming it up now.",
    });
  }
  public get testActivity(): Locator {
    return this.page.getByRole("region", { name: "Test the full Step criterion cold" });
  }
  public get passTestButton(): Locator {
    return this.page.getByRole("button", { name: "Test passed" });
  }
  public get failTestButton(): Locator {
    return this.page.getByRole("button", { exact: true, name: "Not yet" });
  }

  public async gotoTraining() {
    await this.page.goto("/training");
    await waitForHydration(this.page);
  }

  public async confirmColdness() {
    await this.coldnessOverride.check();
  }

  public async startTestActivity() {
    await this.startTest.click();
    await this.passTestButton.waitFor({ state: "visible" });
  }

  public async recordTest(outcome: "passed" | "not_yet") {
    const button = outcome === "passed" ? this.passTestButton : this.failTestButton;
    await button.click();
  }

  public async finishTest() {
    await this.page.getByRole("link", { name: "Finish Test" }).click();
  }

  public async recordSuccesses(count: number) {
    if (count === 0) {
      return;
    }
    await this.successButton.click();
    await this.recordSuccesses(count - 1);
  }

  public async finishPractice() {
    await this.finishLink.click();
  }

  public async gotoBehavior() {
    await this.page.goto("/levels/level-1/zen");
    await waitForHydration(this.page);
  }

  public async startFromPrep() {
    await this.startPractice.click();
    await waitForHydration(this.page);
  }

  public async selectStep(label: string) {
    await this.stepSelect.selectOption({ label });
  }

  public async chooseNextTarget() {
    await this.nextTargetButton.click();
  }

  public async chooseTarget(label: string) {
    await this.targetSelect.selectOption({ label });
  }

  public async startTimer() {
    await this.timerStartButton.click();
  }

  public async takeBreak() {
    await this.breakButton.click();
  }

  public async continuePractice() {
    await this.continueButton.click();
  }

  public async enterPractice(stepLabel?: string) {
    await this.startFromPrep();
    if (stepLabel !== undefined) {
      await this.selectStep(stepLabel);
    }
    await this.startButton.click();
    await this.successButton.waitFor({ state: "visible" });
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
    await this.recommendTestButton.click();
    await this.page.getByText("Saved: Recommend a Test next time.").waitFor({ state: "visible" });
  }

  public totalsRegion() {
    return this.page.getByRole("region", { name: "Enter totals" });
  }
}

export { TrainingPage };
