import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class TrainingPage {
  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public get startTrainingHeaderLink(): Locator {
    return this.page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { exact: true, name: "Up Next / Overview" });
  }
  public get recommendationPanel(): Locator {
    return this.page.getByRole("region", { name: "Recommended next activity" });
  }
  public get suggestAnotherButton(): Locator {
    return this.recommendationPanel.getByRole("button", { name: "Suggest another activity" });
  }
  public get resetSuggestionsButton(): Locator {
    return this.recommendationPanel.getByRole("button", { name: "Reset suggestions" });
  }
  public get openWaitingTestButton(): Locator {
    return this.recommendationPanel.getByRole("button", { name: "Open waiting Test" });
  }
  public get laterLevelOverrideCheckbox(): Locator {
    return this.recommendationPanel.getByRole("checkbox", {
      name: /^Train this Level \d+ Behavior for this Training only/u,
    });
  }
  public get unmetComebeforesList(): Locator {
    return this.recommendationPanel.getByRole("list");
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
  public get keepPracticingButton(): Locator {
    return this.page.getByRole("button", { name: "Keep practicing" });
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

  public async gotoTraining(stepId?: string) {
    const path =
      stepId === undefined ? "/training" : `/training?stepId=${encodeURIComponent(stepId)}`;
    await this.page.goto(path);
    await waitForHydration(this.page);
  }

  public async openFromHeader() {
    const menu = this.page.getByRole("button", { name: "Open menu" });
    if (await menu.isVisible()) {
      await menu.click();
      await this.page.getByRole("dialog").getByRole("link", { name: "Start Training" }).click();
      return;
    }
    await this.startTrainingHeaderLink.click();
  }

  public async confirmLaterLevelOverride() {
    await this.laterLevelOverrideCheckbox.check();
  }

  public async suggestAnotherActivity() {
    await this.suggestAnotherButton.click();
  }

  public async suggestAnotherTimes(count: number) {
    if (count === 0) {
      return;
    }
    const previousStepId = await this.stepSelect.inputValue();
    await this.suggestAnotherActivity();
    await this.page.waitForFunction((prev) => {
      const element = document.querySelector("#practice-step");
      return element !== null && "value" in element && element.value !== prev;
    }, previousStepId);
    await this.suggestAnotherTimes(count - 1);
  }

  public async resetSuggestions() {
    await this.resetSuggestionsButton.click();
  }

  public async openWaitingTest() {
    await this.openWaitingTestButton.click();
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
    await this.page
      .getByRole("button", { disabled: false, exact: true, name: "Undo" })
      .waitFor({ state: "visible" });
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

  public async enterPractice(stepLabel?: string, options?: { confirmLaterLevel?: boolean }) {
    await this.startFromPrep();
    if (stepLabel !== undefined) {
      await this.selectStep(stepLabel);
    }
    if (options?.confirmLaterLevel === true) {
      await this.confirmLaterLevelOverride();
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

  public async keepPracticing() {
    await this.keepPracticingButton.click();
    await this.page.getByText("Saved: Keep practicing.").waitFor({ state: "visible" });
  }

  public totalsRegion() {
    return this.page.getByRole("region", { name: "Enter totals" });
  }
}

export { TrainingPage };
