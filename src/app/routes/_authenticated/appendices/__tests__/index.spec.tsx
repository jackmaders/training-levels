import type { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as AppendicesIndexRoute } from "@/app/routes/_authenticated/appendices/index";
import { curriculumSyllabusQueryOptions } from "@/pages/curriculum";
import { getRouteOption } from "@test/vitest/helpers/route";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

vi.mock(import("@/pages/curriculum"));

describe("appendices index route", () => {
  it("configures private no-store cache headers", () => {
    expect.assertions(1);

    // Arrange
    const headersFn = getRouteOption(AppendicesIndexRoute, "headers") as () => Record<
      string,
      string
    >;

    // Act
    const headers = headersFn();

    // Assert
    expect(headers).toStrictEqual({ "Cache-Control": "private, no-store" });
  });

  it("pre-fetches curriculum syllabus in loader", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(AppendicesIndexRoute, "loader") as (ctx: {
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

  it("renders CurriculumSectionIndexPage for appendices via Route component option", () => {
    expect.assertions(1);

    // Arrange
    const Component = getRouteOption(AppendicesIndexRoute, "component") as React.ComponentType;

    // Act
    renderWithProviders(<Component />);

    // Assert
    expect(
      screen.getByRole("heading", { name: "Curriculum Section Index Page: appendices" }),
    ).toBeDefined();
  });
});
