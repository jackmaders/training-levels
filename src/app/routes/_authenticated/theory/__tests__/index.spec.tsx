import type { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as TheoryIndexRoute } from "@/app/routes/_authenticated/theory/index";
import { curriculumSyllabusQueryOptions } from "@/pages/curriculum";
import { getRouteOption } from "@test/vitest/helpers/route";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

vi.mock(import("@/pages/curriculum"));

describe("theory index route", () => {
  it("configures private no-store cache headers", () => {
    expect.assertions(1);

    // Arrange
    const headersFn = getRouteOption(TheoryIndexRoute, "headers") as () => Record<string, string>;

    // Act
    const headers = headersFn();

    // Assert
    expect(headers).toStrictEqual({ "Cache-Control": "private, no-store" });
  });

  it("pre-fetches curriculum syllabus in loader", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(TheoryIndexRoute, "loader") as (ctx: {
      context: { queryClient: QueryClient };
    }) => Promise<unknown>;
    const queryClient = {
      query: vi.fn<() => Promise<unknown>>(),
    } as unknown as QueryClient;

    // Act
    await loader({
      context: { queryClient },
    });

    // Assert
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: curriculumSyllabusQueryOptions().queryKey,
      }),
    );
  });

  it("renders CurriculumSectionIndexPage for theory via Route component option", () => {
    expect.assertions(1);

    // Arrange
    const Component = getRouteOption(TheoryIndexRoute, "component") as React.ComponentType;

    // Act
    renderWithProviders(<Component />);

    // Assert
    expect(
      screen.getByRole("heading", { name: "Curriculum Section Index Page: theory" }),
    ).toBeDefined();
  });
});
