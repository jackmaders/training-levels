import type { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Route as LevelPageRoute } from "@/app/routes/_authenticated/levels/$section.$page";
import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";
import type { CurriculumPage } from "@/shared/curriculum-data";
import { TEST_BEHAVIOR_PAGE, TEST_SYLLABUS } from "@test/vitest/fixtures/curriculum";
import { getRouteOption } from "@test/vitest/helpers/route";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

vi.mock(import("@/pages/curriculum"));

afterEach(() => {
  vi.restoreAllMocks();
});

type LevelPageLoader = (ctx: {
  context: { queryClient: QueryClient };
  params: { page: string; section: string };
}) => Promise<unknown>;

function createMockQueryClient(pageResult: CurriculumPage | null = TEST_BEHAVIOR_PAGE) {
  const responses = new Map<string, unknown>([
    ["page", pageResult],
    ["step-progress", ["level-1/zen:step-1"]],
    ["syllabus", TEST_SYLLABUS],
  ]);

  return {
    query: vi.fn<(options: { queryKey: readonly unknown[] }) => Promise<unknown>>(
      async (options) => await Promise.resolve(responses.get(String(options.queryKey[1]))),
    ),
  } as unknown as QueryClient;
}

describe("level page route options", () => {
  it("configures private no-store cache headers", () => {
    expect.assertions(1);

    // Arrange
    const headersFn = getRouteOption(LevelPageRoute, "headers") as () => Record<string, string>;

    // Act
    const headers = headersFn();

    // Assert
    expect(headers).toStrictEqual({ "Cache-Control": "private, no-store" });
  });

  it("configures NotFoundPage as notFoundComponent", () => {
    expect.assertions(1);

    // Arrange
    const notFoundComponent = getRouteOption(LevelPageRoute, "notFoundComponent");

    // Assert
    expect(notFoundComponent).toBe(NotFoundPage);
  });

  it("renders CurriculumLevelPage with section and page route params", () => {
    expect.assertions(1);

    // Arrange
    const Component = getRouteOption(LevelPageRoute, "component") as React.ComponentType;
    vi.spyOn(LevelPageRoute, "useParams").mockReturnValue({ page: "zen", section: "level-1" });

    // Act
    renderWithProviders(<Component />);

    // Assert
    expect(
      screen.getByRole("heading", { name: "Curriculum Level Page: level-1/zen" }),
    ).toBeDefined();
  });
});

describe("level page route loader", () => {
  it("pre-fetches syllabus, page, and step progress in parallel for valid params", async () => {
    expect.assertions(4);

    // Arrange
    const loader = getRouteOption(LevelPageRoute, "loader") as LevelPageLoader;
    const queryClient = createMockQueryClient(TEST_BEHAVIOR_PAGE);

    // Act
    await loader({
      context: { queryClient },
      params: { page: "zen", section: "level-1" },
    });

    // Assert
    expect(queryClient.query).toHaveBeenCalledTimes(3);
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: curriculumSyllabusQueryOptions().queryKey,
      }),
    );
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: curriculumPageQueryOptions("level-1/zen").queryKey,
      }),
    );
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: stepProgressQueryOptions().queryKey,
      }),
    );
  });

  it("throws notFound before querying when route params are invalid", async () => {
    expect.assertions(2);

    // Arrange
    const loader = getRouteOption(LevelPageRoute, "loader") as LevelPageLoader;
    const queryClient = createMockQueryClient();

    // Act
    const action = loader({
      context: { queryClient },
      params: { page: "01-foreword", section: "theory" },
    });

    // Assert
    await expect(action).rejects.toMatchObject({
      isNotFound: true,
      message: "Not Found",
    });
    expect(queryClient.query).not.toHaveBeenCalled();
  });

  it("throws notFound when curriculum page query resolves to null", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(LevelPageRoute, "loader") as LevelPageLoader;
    const queryClient = createMockQueryClient(null);

    // Act
    const action = loader({
      context: { queryClient },
      params: { page: "nonexistent", section: "level-1" },
    });

    // Assert
    await expect(action).rejects.toMatchObject({
      isNotFound: true,
      message: "Not Found",
    });
  });
});
