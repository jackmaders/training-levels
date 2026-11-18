import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

const RECTANGLE_CENTER_DIVISOR = 2;
const MAX_KEYBOARD_TABS_TO_FOCUS_CONTROL = 20;

class HomePage {
  public readonly heading: Locator;
  public readonly signUpHeading: Locator;
  public readonly signInTab: Locator;
  public readonly signUpTab: Locator;
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly nameInput: Locator;
  public readonly submitButton: Locator;
  public readonly skipLink: Locator;

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
    this.skipLink = page.getByRole("link", { name: "Skip to content" });
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

  public async setVisualLayout({
    width,
    height,
    theme,
  }: {
    width: number;
    height: number;
    theme: "light" | "dark";
  }) {
    await this.page.setViewportSize({ height, width });
    await this.page.evaluate((nextTheme) => {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    }, theme);
  }

  public async horizontalOverflow() {
    return await this.page.evaluate(() => {
      const documentWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const viewportWidth = document.documentElement.clientWidth;
      return Math.max(documentWidth, bodyWidth) - viewportWidth;
    });
  }

  public async focusSkipLink() {
    await this.page.keyboard.press("Tab");
  }

  public async activateSkipLink() {
    await this.page.keyboard.press("Enter");
  }

  public async isSkipLinkTopmost() {
    return await this.skipLink.evaluate((element, centerDivisor) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / centerDivisor;
      const centerY = rect.top + rect.height / centerDivisor;
      return document.elementFromPoint(centerX, centerY) === element;
    }, RECTANGLE_CENTER_DIVISOR);
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

  public async navigateToProfile() {
    const menu = this.page.getByRole("button", { name: "Open menu" });
    if (await menu.isVisible()) {
      await menu.click();
      await this.page.getByRole("dialog").getByRole("link", { name: "Profile" }).click();
      return;
    }
    await this.banner.getByRole("link", { name: "Profile" }).click();
  }

  public async navigateToProfileByKeyboard() {
    const menu = this.page.getByRole("button", { name: "Open menu" });
    let profileLink = this.banner.getByRole("link", { exact: true, name: "Profile" });
    if (await menu.isVisible()) {
      await this.focusControlByKeyboard(menu);
      await this.page.keyboard.press("Enter");
      profileLink = this.page
        .getByRole("dialog")
        .getByRole("link", { exact: true, name: "Profile" });
      await profileLink.waitFor({ state: "visible" });
    }

    await this.focusControlByKeyboard(profileLink);
    await this.page.keyboard.press("Enter");
  }

  private async focusControlByKeyboard(control: Locator, attempt = 0): Promise<void> {
    if (attempt >= MAX_KEYBOARD_TABS_TO_FOCUS_CONTROL) {
      throw new Error("Control was not reachable by keyboard tab navigation");
    }
    if (await control.evaluate((element) => element === document.activeElement)) {
      return;
    }
    await this.page.keyboard.press("Tab");
    await this.focusControlByKeyboard(control, attempt + 1);
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
