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
    return this.page.getByText(/\d+ Success · \d+ Not yet/u);
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

  public async startTimer() {
    await this.timerStartButton.click();
  }

  public async takeBreak() {
    await this.breakButton.click();
  }

  public async continuePractice() {
    await this.continueButton.click();
  }

  public async reload() {
    await this.page.reload();
    await waitForHydration(this.page);
  }
}

export { TrainingPage };
