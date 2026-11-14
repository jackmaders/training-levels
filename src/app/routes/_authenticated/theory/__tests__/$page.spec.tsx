import type { QueryClient } from "@tanstack/react-query";
import { isNotFound } from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Route as TheoryPageRoute } from "@/app/routes/_authenticated/theory/$page";
import { curriculumPageQueryOptions } from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";
import type { ProseCurriculumPage } from "@/shared/curriculum-data";
import { getRouteOption } from "@test/vitest/helpers/route";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

vi.mock(import("@/pages/curriculum"));

const TEST_THEORY_PAGE: ProseCurriculumPage = {
  blocks: [],
  href: "/theory/01-foreword",
  kind: "theory",
  nextPage: null,
  pageSlug: "theory/01-foreword",
  previousPage: null,
  sectionSlug: "theory",
  title: "Foreword",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("theory detail route", () => {
  it("configures private no-store cache headers and NotFoundPage", () => {
    expect.assertions(2);

    // Arrange
    const headersFn = getRouteOption(TheoryPageRoute, "headers") as () => Record<string, string>;
    const notFoundComponent = getRouteOption(TheoryPageRoute, "notFoundComponent");

    // Act
    const headers = headersFn();

    // Assert
    expect(headers).toStrictEqual({ "Cache-Control": "private, no-store" });
    expect(notFoundComponent).toBe(NotFoundPage);
  });

  it("loads matching theory article in loader", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(TheoryPageRoute, "loader") as (ctx: {
      context: { queryClient: QueryClient };
      params: { page: string };
    }) => Promise<unknown>;
    const queryClient = {
      query: vi.fn<() => Promise<unknown>>().mockResolvedValueOnce(TEST_THEORY_PAGE),
    } as unknown as QueryClient;

    // Act
    await loader({
      context: { queryClient },
      params: { page: "01-foreword" },
    });

    // Assert
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: curriculumPageQueryOptions("theory/01-foreword").queryKey,
      }),
    );
  });

  it("throws notFound from loader when theory article is missing", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(TheoryPageRoute, "loader") as (ctx: {
      context: { queryClient: QueryClient };
      params: { page: string };
    }) => Promise<unknown>;
    const queryClient = {
      query: vi.fn<() => Promise<unknown>>().mockResolvedValueOnce(null),
    } as unknown as QueryClient;

    // Act
    const caught = await loader({
      context: { queryClient },
      params: { page: "nonexistent" },
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
  });

  it("renders CurriculumArticlePage with route page param", () => {
    expect.assertions(1);

    // Arrange
    const Component = getRouteOption(TheoryPageRoute, "component") as React.ComponentType;
    vi.spyOn(TheoryPageRoute, "useParams").mockReturnValue({ page: "01-foreword" });

    // Act
    renderWithProviders(<Component />);

    // Assert
    expect(
      screen.getByRole("heading", { name: "Curriculum Article Page: theory/01-foreword" }),
    ).toBeDefined();
  });
});
