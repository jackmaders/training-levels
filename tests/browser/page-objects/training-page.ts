import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class TrainingPage {
  public readonly startPractice: Locator;
  public readonly startButton: Locator;
  public readonly successButton: Locator;
  public readonly notYetButton: Locator;
  public readonly undoButton: Locator;
  public readonly finishLink: Locator;
  public readonly history: Locator;
  public readonly counts: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.startPractice = page.getByRole("link", { name: "Practice Step 1" });
    this.startButton = page.getByRole("button", { name: /^(?:Start|Resume) Practice$/u });
    this.successButton = page.getByRole("button", { exact: true, name: "Success" });
    this.notYetButton = page.getByRole("button", { exact: true, name: "Not yet" });
    this.undoButton = page.getByRole("button", { name: "Undo" });
    this.finishLink = page.getByRole("link", { name: "Finish Practice" });
    this.history = page.getByRole("list", { name: "Practice history" });
    this.counts = page.getByText(/\d+ Success · \d+ Not yet/u);
  }

  public async gotoBehavior() {
    await this.page.goto("/levels/level-1/zen");
    await waitForHydration(this.page);
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

export { TrainingPage };
