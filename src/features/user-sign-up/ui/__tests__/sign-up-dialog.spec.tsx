import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { signUp } from "@/shared/auth";
import { TEST_AUTH_SUCCESS, TEST_SIGN_UP_CREDENTIALS } from "@test/vitest/fixtures/auth";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { SignUpDialog } from "../sign-up-dialog";

vi.mock(import("@/shared/auth"));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sign up dialog", () => {
  it("closes after a successful sign up", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(signUp.email).mockResolvedValue(TEST_AUTH_SUCCESS);
    const { user } = renderWithProviders(<SignUpDialog />);

    // Act
    await user.click(screen.getByRole("button", { name: "Sign up" }));
    await user.type(screen.getByLabelText("Name"), TEST_SIGN_UP_CREDENTIALS.name);
    await user.type(screen.getByLabelText("Email"), TEST_SIGN_UP_CREDENTIALS.email);
    await user.type(screen.getByLabelText("Password"), TEST_SIGN_UP_CREDENTIALS.password);
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Create account" }),
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(signUp.email).toHaveBeenCalledOnce();
  });
});
