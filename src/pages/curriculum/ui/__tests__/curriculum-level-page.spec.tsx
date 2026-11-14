import { QueryClient } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import {
  TEST_BEHAVIOR_PAGE,
  TEST_HOMEWORK_PAGE,
  TEST_OVERVIEW_PAGE,
  TEST_SYLLABUS,
  createBehaviorPageFixture,
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

beforeEach(() => {
  vi.clearAllMocks();
});

function seedLevelQueries({
  initialLocation = "/levels/level-1/zen",
  page = TEST_BEHAVIOR_PAGE,
  pageSlug = "level-1/zen",
  progress = [] as string[],
  syllabus = TEST_SYLLABUS,
}: {
  initialLocation?: string;
  page?: typeof TEST_BEHAVIOR_PAGE | ReturnType<typeof createProsePageFixture> | null;
  pageSlug?: string;
  progress?: string[];
  syllabus?: typeof TEST_SYLLABUS;
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

  return renderWithProviders(<CurriculumLevelPage pageSlug={pageSlug} />, {
    initialLocation,
    queryClient,
    routePaths: LEVEL_ROUTE_PATHS,
  });
}

describe("curriculum level page behavior view and optimistic sync", () => {
  it("optimistically updates article and sidebar progress while step toggle is pending", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { user } = seedLevelQueries({
      initialLocation: "/levels/level-1/zen#step-2",
    });
    const checkbox = screen.getByRole("checkbox", {
      name: "Toggle Step 1: Wait for eye contact with closed fist",
    });

    // Act
    await user.click(checkbox);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("1 of 5 steps")).toBeDefined();
    });
    expect(screen.getByRole("button", { name: "Level 1 1/10" })).toBeDefined();
    expect(screen.getByText("Practice briefly in a quiet room.")).toBeDefined();
  });

  it("rolls back optimistic progress and displays destructive alert when toggle fails", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(toggleStepFn).mockRejectedValueOnce(new ApplicationError("INTERNAL_SERVER_ERROR"));
    const { user } = seedLevelQueries();
    const checkbox = screen.getByRole("checkbox", {
      name: "Toggle Step 1: Wait for eye contact with closed fist",
    });

    // Act
    await user.click(checkbox);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
    });
    expect(screen.getByText("0 of 5 steps")).toBeDefined();
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("keeps rendering resolved location while a client navigation is pending", async () => {
    expect.assertions(3);

    // Arrange
    const { queryClient, router, wrapper } = createTestingWrapper({
      initialLocation: "/levels/level-1/zen#step-2",
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
    render(<CurriculumLevelPage pageSlug="level-1/zen" />, { wrapper });

    // Act
    act(() => {
      router.stores.location.set((previous) => ({
        ...previous,
        hash: "",
        href: "/levels/level-1/nonexistent",
        pathname: "/levels/level-1/nonexistent",
      }));
    });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Zen" })).toBeDefined();
    expect(screen.getByText("Practice briefly in a quiet room.")).toBeDefined();
    expect(getCurriculumPageFn).not.toHaveBeenCalled();
  });
});

describe("curriculum level page prose views and fallbacks", () => {
  it("renders overview page without behavior navigation", () => {
    expect.assertions(3);

    // Arrange & Act
    seedLevelQueries({
      initialLocation: "/levels/level-1/00-overview",
      page: TEST_OVERVIEW_PAGE,
      pageSlug: "level-1/00-overview",
    });
    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Level 1 Overview" })).toBeDefined();
    expect(screen.getByText("Welcome to Level 1 foundations.")).toBeDefined();
    expect(screen.queryByRole("navigation", { name: "Page navigation" })).toBeNull();
  });

  it("renders homework page without behavior navigation", () => {
    expect.assertions(2);

    // Arrange & Act
    seedLevelQueries({
      initialLocation: "/levels/level-1/homework",
      page: TEST_HOMEWORK_PAGE,
      pageSlug: "level-1/homework",
    });
    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Level 1 Homework" })).toBeDefined();
    expect(screen.queryByRole("navigation", { name: "Page navigation" })).toBeNull();
  });

  it("renders final level page with previous link and omits next link", () => {
    expect.assertions(3);

    // Arrange
    const levelTwoZen = createBehaviorPageFixture({
      href: "/levels/level-2/zen",
      levelNumber: 2,
      nextPage: null,
      pageSlug: "level-2/zen",
      sectionSlug: "level-2",
      title: "Level 2: Zen",
    });

    // Act
    seedLevelQueries({
      initialLocation: "/levels/level-2/zen",
      page: levelTwoZen,
      pageSlug: "level-2/zen",
    });
    const footerNav = screen.getByRole("navigation", { name: "Page navigation" });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Level 2: Zen" })).toBeDefined();
    expect(within(footerNav).getByRole("link", { name: /Come/u }).getAttribute("href")).toBe(
      "/levels/level-1/come",
    );
    expect(within(footerNav).queryByText("Next")).toBeNull();
  });

  it("renders Page Not Found fallback with Return Home link when page is null", () => {
    expect.assertions(3);

    // Arrange & Act
    seedLevelQueries({
      page: null,
      pageSlug: "level-1/missing",
    });
    const homeLink = screen.getByRole("link", { name: "Return Home" });

    // Assert
    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeDefined();
    expect(homeLink.getAttribute("href")).toBe("/");
    expect(homeLink.className).toContain("bg-primary");
  });

  it("renders fallback breadcrumb without footer when syllabus section is missing", () => {
    expect.assertions(2);

    // Arrange
    const orphanPage = createProsePageFixture({
      kind: "theory",
      pageSlug: "theory/orphan",
      sectionSlug: "theory",
      title: "Orphan Theory",
    });
    const emptySyllabus = createSyllabusFixture({ sections: [] });

    // Act
    seedLevelQueries({
      page: orphanPage,
      pageSlug: "theory/orphan",
      syllabus: emptySyllabus,
    });
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });

    // Assert
    expect(within(breadcrumb).getByText("theory")).toBeDefined();
    expect(screen.queryByRole("navigation", { name: "Page navigation" })).toBeNull();
  });

  it("omits footer navigation when an adjacent behavior has an invalid level slug", () => {
    expect.assertions(1);

    // Arrange
    const invalidAdjacentSyllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 0,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              title: "Zen",
            },
            {
              href: "/theory/invalid",
              kind: "behavior",
              order: 1,
              pageSlug: "invalid/slug",
              sectionSlug: "level-1",
              title: "Invalid Target",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
    });

    // Act
    seedLevelQueries({
      initialLocation: "/levels/level-1/zen",
      page: TEST_BEHAVIOR_PAGE,
      pageSlug: "level-1/zen",
      syllabus: invalidAdjacentSyllabus,
    });

    // Assert
    expect(screen.queryByRole("navigation", { name: "Page navigation" })).toBeNull();
  });
});
