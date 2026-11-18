import type { Locator, Page } from "@playwright/test";

class TrainingReading {
  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public get explanationButton(): Locator {
    return this.page.getByRole("button", { name: "Explanation" });
  }
  public get faqButton(): Locator {
    return this.page.getByRole("button", { name: "FAQ" });
  }
  public get returnButton(): Locator {
    return this.page.getByRole("button", { name: /^Back to (?:Prep|Practice)$/u });
  }
  public get explanation(): Locator {
    return this.page.getByRole("region", { name: "Explanation" });
  }
  public get behaviorFaq(): Locator {
    return this.page.getByRole("region", { name: /^Level \d .+ questions$/u });
  }
  public get generalFaq(): Locator {
    return this.page.getByRole("region", { name: "General training questions" });
  }
  public get interruptedTimerNotice(): Locator {
    return this.page.getByText(/^Timed hold interrupted/u);
  }

  public async openExplanation() {
    await this.explanationButton.click();
  }

  public async openFaq() {
    await this.faqButton.click();
  }

  public async returnToTraining() {
    await this.returnButton.click();
  }

  public behaviorFaqQuestion(question: string): Locator {
    return this.behaviorFaq.getByText(question, { exact: true });
  }

  public generalFaqQuestion(question: string): Locator {
    return this.generalFaq.getByText(question, { exact: true });
  }

  public async openBehaviorFaqQuestion(question: string) {
    await this.behaviorFaqQuestion(question).click();
  }
}

export { TrainingReading };
