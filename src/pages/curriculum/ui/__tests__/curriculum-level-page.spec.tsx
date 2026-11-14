import { QueryClient } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import {
  TEST_BEHAVIOR_PAGE,
  TEST_HOMEWORK_PAGE,
  TEST_OVERVIEW_PAGE,
  TEST_SYLLABUS,
  createProsePageFixture,
  createSyllabusFixture,
} from "@test/vitest/fixtures/curriculum";
import { createDeferred } from "@test/vitest/helpers/deferred";
import { createTestingWrapper, renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../../api/curriculum-query-options";
import type { ToggleStepResult } from "../../api/curriculum-service";
import {
  getCurriculumPageFn,
  getStepProgressFn,
  toggleStepFn,
} from "../../api/curriculum.functions";
import { CurriculumLevelPage } from "../curriculum-level-page";

vi.mock(import("../../api/curriculum.functions"));

const LEVEL_ROUTE_PATHS = ["/", "/levels/$section/$page"];

function seedLevelQueries({
  initialLocation = "/levels/level-1/zen",
  page = TEST_BEHAVIOR_PAGE,
  pageSlug = "level-1/zen",
  progress = [] as string[],
  syllabus = TEST_SYLLABUS,
  useRouteLocationOnly = false,
}: {
  initialLocation?: string;
  page?: typeof TEST_BEHAVIOR_PAGE | ReturnType<typeof createProsePageFixture> | null;
  pageSlug?: string;
  progress?: string[];
  syllabus?: typeof TEST_SYLLABUS;
  useRouteLocationOnly?: boolean;
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  queryClient.setQueryDefaults(["curriculum"], { staleTime: Infinity });
  queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
  queryClient.setQueryData(curriculumPageQueryOptions(pageSlug).queryKey, page);
  queryClient.setQueryData(stepProgressQueryOptions().queryKey, progress);
  vi.mocked(getStepProgressFn).mockResolvedValue(progress);
  const ui = useRouteLocationOnly ? (
    <CurriculumLevelPage />
  ) : (
    <CurriculumLevelPage pageSlug={pageSlug} />
  );
  return renderWithProviders(ui, {
    initialLocation,
    queryClient,
    routePaths: LEVEL_ROUTE_PATHS,
  });
}

describe("curriculum level page behavior view and optimistic sync", () => {
  it("optimistically updates sidebar and article progress and rolls back on failure", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { user } = seedLevelQueries({
      initialLocation: "/levels/level-1/zen#step-2",
      useRouteLocationOnly: true,
    });
    const checkbox = screen.getByRole("checkbox", {
      name: "Toggle Step 1: Wait for eye contact with closed fist",
    });

    // Act toggle on
    await user.click(checkbox);

    // Assert optimistic state across article + sidebar
    await waitFor(() => {
      expect(screen.getByText("1 of 5 steps")).toBeDefined();
    });
    expect(screen.getByRole("button", { name: "Level 1 1/10" })).toBeDefined();

    // Act fail mutation
    deferred.reject(new ApplicationError("INTERNAL_SERVER_ERROR"));

    // Assert rollback + destructive alert
    await expect(screen.findByRole("alert")).resolves.toBeDefined();
    expect(screen.getByText("0 of 5 steps")).toBeDefined();
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("renders fallback page when route location is not a level page", () => {
    expect.assertions(1);

    // Arrange & Act
    seedLevelQueries({
      initialLocation: "/",
      page: null,
      pageSlug: "",
      useRouteLocationOnly: true,
    });

    // Assert
    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeDefined();
  });

  it("keeps rendering resolved location while a client navigation is pending", async () => {
    expect.hasAssertions();

    // Arrange
    const { queryClient, router, wrapper } = createTestingWrapper({
      initialLocation: "/levels/level-1/zen",
      routePaths: LEVEL_ROUTE_PATHS,
    });
    queryClient.setQueryDefaults(["curriculum"], { staleTime: Infinity });
    queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, TEST_SYLLABUS);
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/zen").queryKey,
      TEST_BEHAVIOR_PAGE,
    );
    queryClient.setQueryData(stepProgressQueryOptions().queryKey, []);
    await router.load();
    render(<CurriculumLevelPage />, { wrapper });

    // Act
    act(() => {
      router.stores.location.set((previous) => ({
        ...previous,
        href: "/levels/level-1/nonexistent",
        pathname: "/levels/level-1/nonexistent",
      }));
    });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Zen" })).toBeDefined();
    expect(getCurriculumPageFn).not.toHaveBeenCalled();
  });
});

describe("curriculum level page prose views and fallbacks", () => {
  it("renders overview page with breadcrumb and next link only", () => {
    expect.assertions(4);

    // Arrange & Act
    seedLevelQueries({
      initialLocation: "/levels/level-1/00-overview",
      page: TEST_OVERVIEW_PAGE,
      pageSlug: "level-1/00-overview",
    });
    const footerNav = screen.getByRole("navigation", { name: "Page navigation" });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Level 1 Overview" })).toBeDefined();
    expect(screen.getByText("Welcome to Level 1 foundations.")).toBeDefined();
    expect(within(footerNav).queryByText("Previous")).toBeNull();
    expect(within(footerNav).getByRole("link", { name: /Zen/u }).getAttribute("href")).toBe(
      "/levels/level-1/zen",
    );
  });

  it("renders homework page with previous and next level links", () => {
    expect.assertions(3);

    // Arrange & Act
    seedLevelQueries({
      initialLocation: "/levels/level-1/homework",
      page: TEST_HOMEWORK_PAGE,
      pageSlug: "level-1/homework",
    });
    const footerNav = screen.getByRole("navigation", { name: "Page navigation" });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Level 1 Homework" })).toBeDefined();
    expect(within(footerNav).getByRole("link", { name: /Come/u }).getAttribute("href")).toBe(
      "/levels/level-1/come",
    );
    expect(
      within(footerNav)
        .getByRole("link", { name: /Level 2 Overview/u })
        .getAttribute("href"),
    ).toBe("/levels/level-2/00-overview");
  });

  it("renders fallback page when page is null and fallback breadcrumb when section is missing", () => {
    expect.assertions(4);

    // Arrange & Act missing page
    const { rerender, queryClient } = seedLevelQueries({
      page: null,
      pageSlug: "level-1/missing",
    });
    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Return Home" }).getAttribute("href")).toBe("/");

    // Act missing syllabus section for prose page
    const orphanPage = createProsePageFixture({
      kind: "theory",
      pageSlug: "theory/orphan",
      sectionSlug: "theory",
      title: "Orphan Theory",
    });
    const emptySyllabus = createSyllabusFixture({ sections: [] });
    queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, emptySyllabus);
    queryClient.setQueryData(curriculumPageQueryOptions("theory/orphan").queryKey, orphanPage);
    rerender(<CurriculumLevelPage pageSlug="theory/orphan" />);

    // Assert
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(within(breadcrumb).getByText("theory")).toBeDefined();
    expect(screen.queryByRole("navigation", { name: "Page navigation" })).toBeNull();
  });
});
