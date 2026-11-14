import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { signIn } from "@/shared/auth";
import {
  TEST_AUTH_SUCCESS,
  TEST_SIGN_IN_CREDENTIALS,
  TEST_SIGN_IN_ERROR,
} from "@test/vitest/fixtures/auth";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { SignInDialog } from "../sign-in-dialog";

vi.mock(import("@/shared/auth"));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sign in dialog", () => {
  it("stays open on failure and closes after successful sign in", async () => {
    expect.assertions(4);

    // Arrange
    vi.mocked(signIn.email)
      .mockResolvedValueOnce(TEST_SIGN_IN_ERROR)
      .mockResolvedValueOnce(TEST_AUTH_SUCCESS);
    const { user } = renderWithProviders(<SignInDialog />);

    // Act
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await user.type(screen.getByLabelText("Email"), TEST_SIGN_IN_CREDENTIALS.email);
    await user.type(screen.getByLabelText("Password"), TEST_SIGN_IN_CREDENTIALS.password);
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Sign in" }));

    // Assert
    await expect(screen.findByText(TEST_SIGN_IN_ERROR.error.message)).resolves.toBeDefined();
    expect(screen.getByRole("dialog")).toBeDefined();

    // Act
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Sign in" }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(signIn.email).toHaveBeenCalledTimes(2);
  });
});
