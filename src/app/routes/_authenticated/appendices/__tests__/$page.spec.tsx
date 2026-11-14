import type { QueryClient } from "@tanstack/react-query";
import { isNotFound } from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Route as AppendicesPageRoute } from "@/app/routes/_authenticated/appendices/$page";
import { curriculumPageQueryOptions } from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";
import type { ProseCurriculumPage } from "@/shared/curriculum-data";
import { getRouteOption } from "@test/vitest/helpers/route";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

vi.mock(import("@/pages/curriculum"));

const TEST_APPENDIX_PAGE: ProseCurriculumPage = {
  blocks: [],
  href: "/appendices/appendix-a-leading-the-dance",
  kind: "appendix",
  nextPage: null,
  pageSlug: "appendices/appendix-a-leading-the-dance",
  previousPage: null,
  sectionSlug: "appendices",
  title: "Leading the Dance",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("appendices detail route", () => {
  it("configures private no-store cache headers and NotFoundPage", () => {
    expect.assertions(2);

    // Arrange
    const headersFn = getRouteOption(AppendicesPageRoute, "headers") as () => Record<
      string,
      string
    >;
    const notFoundComponent = getRouteOption(AppendicesPageRoute, "notFoundComponent");

    // Act
    const headers = headersFn();

    // Assert
    expect(headers).toStrictEqual({ "Cache-Control": "private, no-store" });
    expect(notFoundComponent).toBe(NotFoundPage);
  });

  it("loads matching appendix article in loader", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(AppendicesPageRoute, "loader") as (ctx: {
      context: { queryClient: QueryClient };
      params: { page: string };
    }) => Promise<unknown>;
    const queryClient = {
      query: vi.fn<() => Promise<unknown>>().mockResolvedValueOnce(TEST_APPENDIX_PAGE),
    } as unknown as QueryClient;

    // Act
    await loader({
      context: { queryClient },
      params: { page: "appendix-a-leading-the-dance" },
    });

    // Assert
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: curriculumPageQueryOptions("appendices/appendix-a-leading-the-dance").queryKey,
      }),
    );
  });

  it("throws notFound from loader when appendix article is missing", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(AppendicesPageRoute, "loader") as (ctx: {
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
    const Component = getRouteOption(AppendicesPageRoute, "component") as React.ComponentType;
    vi.spyOn(AppendicesPageRoute, "useParams").mockReturnValue({
      page: "appendix-a-leading-the-dance",
    });

    // Act
    renderWithProviders(<Component />);

    // Assert
    expect(
      screen.getByRole("heading", {
        name: "Curriculum Article Page: appendices/appendix-a-leading-the-dance",
      }),
    ).toBeDefined();
  });
});
