import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useAuth } from "@/shared/auth";
import { SidebarProvider } from "@/shared/ui/shadcn/sidebar";
import { TEST_SESSION } from "@test/vitest/fixtures/session";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { AppSidebar } from "../app-sidebar";

const mockUseLocation = vi.fn<() => { pathname: string; search: Record<string, unknown> }>(() => ({
  pathname: "/",
  search: {},
}));

vi.mock(import("@tanstack/react-router"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Link: ({
      children,
      to,
      search,
      ...props
    }: {
      children?: React.ReactNode;
      search?: Record<string, unknown>;
      to: string;
    }) => {
      const level = typeof search?.["level"] === "string" ? `?level=${search["level"]}` : "";
      return (
        <a href={`${to}${level}`} {...props}>
          {children}
        </a>
      );
    },
    useLocation: () => mockUseLocation(),
  };
});

vi.mock(import("@/shared/auth"));
vi.mock(import("@/features/user-sign-in"), () => ({
  SignInDialog: () => <button type="button">Sign In</button>,
}));
vi.mock(import("@/features/user-sign-up"), () => ({
  SignUpDialog: () => <button type="button">Sign Up</button>,
}));

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn<() => unknown>(() => ({
      addEventListener: vi.fn<() => void>(),
      matches: false,
      media: "(max-width: 767px)",
      removeEventListener: vi.fn<() => void>(),
    })),
  );
  mockUseLocation.mockReturnValue({ pathname: "/", search: {} });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockAuthState(session: typeof TEST_SESSION | null) {
  vi.mocked(useAuth).mockReturnValue({
    session,
    signIn: vi.fn<() => Promise<void>>(),
    signOut: vi.fn<() => Promise<void>>(),
    signUp: vi.fn<() => Promise<void>>(),
  });
}

function renderSidebar() {
  const { wrapper } = createTestingWrapper();
  return render(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
    { wrapper },
  );
}

describe("app sidebar", () => {
  it("renders public navigation and auth dialogs when signed out", () => {
    expect.hasAssertions();
    mockAuthState(null);

    renderSidebar();

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Dog Training Levels" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
    expect(screen.getByRole("link", { name: "About" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();

    expect(screen.queryByRole("link", { name: "Theory" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Training" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Levels" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Foundations" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Appendices" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign Out" })).toBeNull();
  });

  it("renders authenticated curriculum navigation and toggles Training group", async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    mockAuthState(TEST_SESSION);

    renderSidebar();

    expect(screen.getByRole("link", { name: "Theory" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Up Next / Overview" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Level 1" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Level 2" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Level 3" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Level 4" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Levels" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Foundations" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Appendices" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Profile" })).toBeDefined();
    expect(screen.getByRole("link", { name: "About" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Sign In" })).toBeNull();

    const trainingToggle = screen.getByRole("button", { name: "Training" });
    expect(trainingToggle.getAttribute("aria-expanded")).toBe("true");

    await user.click(trainingToggle);
    expect(trainingToggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: "Up Next / Overview" })).toBeNull();

    await user.click(trainingToggle);
    expect(trainingToggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "Up Next / Overview" })).toBeDefined();
  });

  it("highlights active /training and ?level=level-2 links", () => {
    expect.hasAssertions();
    mockAuthState(TEST_SESSION);
    mockUseLocation.mockReturnValue({
      pathname: "/training",
      search: { level: "level-2" },
    });

    renderSidebar();

    expect(screen.getByRole("link", { name: "Level 2" }).dataset.active).toBe("");
    expect(screen.getByRole("link", { name: "Up Next / Overview" }).dataset.active).toBeUndefined();
  });

  it("hides curriculum links when user lacks curriculum:read permission", () => {
    expect.hasAssertions();
    mockAuthState({
      ...TEST_SESSION,
      user: { ...TEST_SESSION.user, role: "guest" as typeof TEST_SESSION.user.role },
    });

    renderSidebar();

    expect(screen.queryByRole("link", { name: "Theory" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Training" })).toBeNull();
    expect(screen.getByRole("link", { name: "Profile" })).toBeDefined();
    expect(screen.getByRole("link", { name: "About" })).toBeDefined();
  });
});
