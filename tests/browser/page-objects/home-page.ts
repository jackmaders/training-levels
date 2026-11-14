import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class HomePage {
  public readonly heading: Locator;
  public readonly signUpHeading: Locator;
  public readonly signInTab: Locator;
  public readonly signUpTab: Locator;
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly nameInput: Locator;
  public readonly submitButton: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.heading = this.main.getByRole("heading", { name: "Sign In" });
    this.signUpHeading = this.main.getByRole("heading", { name: "Sign Up" });
    this.signInTab = page.getByRole("tab", { name: "Sign In" });
    this.signUpTab = page.getByRole("tab", { name: "Sign Up" });
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.nameInput = page.getByLabel("Name");
    this.submitButton = this.main.getByRole("button", { name: /sign in|create account/iu });
  }

  public get banner(): Locator {
    return this.page.getByRole("banner");
  }

  public get main(): Locator {
    return this.page.getByRole("main");
  }

  public get pageHeading(): Locator {
    return this.main.getByRole("heading", { level: 1, name: "Dog Training Levels" });
  }

  public get signUpDescription(): Locator {
    return this.main.getByText("Create an account to start the Dog Training Levels curriculum");
  }

  public async goto() {
    await this.page.goto("/");
    await waitForHydration(this.page);
  }

  public async navigateToAbout() {
    const menu = this.page.getByRole("button", { name: "Open menu" });
    if (await menu.isVisible()) {
      await menu.click();
      await this.page.getByRole("dialog").getByRole("link", { name: "About" }).click();
      return;
    }
    await this.banner.getByRole("link", { name: "About" }).click();
  }

  public async signIn({ email, password }: { email: string; password: string }) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  public async signUp({
    email,
    name,
    password,
  }: {
    email: string;
    name: string;
    password: string;
  }) {
    await this.switchToSignUp();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  public async switchToSignUp() {
    await this.signUpTab.click();
  }

  public async switchToSignIn() {
    await this.signInTab.click();
  }
}

export { HomePage };
