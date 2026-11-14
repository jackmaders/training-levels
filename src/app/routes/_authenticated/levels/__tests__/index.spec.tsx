import type { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as LevelsIndexRoute } from "@/app/routes/_authenticated/levels/index";
import { curriculumSyllabusQueryOptions } from "@/pages/curriculum";
import { NotFoundPage } from "@/pages/not-found";
import type { CurriculumSyllabus } from "@/shared/curriculum-data";
import { TEST_SYLLABUS, createSyllabusFixture } from "@test/vitest/fixtures/curriculum";
import { getRouteOption } from "@test/vitest/helpers/route";

vi.mock(import("@/pages/curriculum"));

type LevelsIndexLoader = (ctx: { context: { queryClient: QueryClient } }) => Promise<unknown>;

function createMockQueryClient(syllabus: CurriculumSyllabus = TEST_SYLLABUS) {
  return {
    query: vi.fn<() => Promise<CurriculumSyllabus>>().mockResolvedValue(syllabus),
  } as unknown as QueryClient;
}

describe("levels index route options", () => {
  it("configures private no-store cache headers", () => {
    expect.assertions(1);

    // Arrange
    const headersFn = getRouteOption(LevelsIndexRoute, "headers") as () => Record<string, string>;

    // Act
    const headers = headersFn();

    // Assert
    expect(headers).toStrictEqual({ "Cache-Control": "private, no-store" });
  });

  it("configures NotFoundPage as notFoundComponent", () => {
    expect.assertions(1);

    // Arrange
    const notFoundComponent = getRouteOption(LevelsIndexRoute, "notFoundComponent");

    // Assert
    expect(notFoundComponent).toBe(NotFoundPage);
  });
});

describe("levels index route loader", () => {
  it("redirects to the first behavior page of Level 1", async () => {
    expect.assertions(2);

    // Arrange
    const loader = getRouteOption(LevelsIndexRoute, "loader") as LevelsIndexLoader;
    const queryClient = createMockQueryClient();

    // Act
    const action = loader({ context: { queryClient } });

    // Assert
    await expect(action).rejects.toMatchObject({
      options: expect.objectContaining({
        params: { page: "zen", section: "level-1" },
        to: "/levels/$section/$page",
      }) as unknown,
    });
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: curriculumSyllabusQueryOptions().queryKey,
      }),
    );
  });

  it("throws notFound when syllabus contains no Level 1 section", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(LevelsIndexRoute, "loader") as LevelsIndexLoader;
    const emptySyllabus = createSyllabusFixture({ sections: [] });
    const queryClient = createMockQueryClient(emptySyllabus);

    // Act
    const action = loader({ context: { queryClient } });

    // Assert
    await expect(action).rejects.toMatchObject({
      isNotFound: true,
      message: "Not Found",
    });
  });

  it("throws notFound when Level 1 has no behavior pages", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(LevelsIndexRoute, "loader") as LevelsIndexLoader;
    const noBehaviorSyllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/00-overview",
              kind: "overview",
              levelNumber: 1,
              order: 0,
              pageSlug: "level-1/00-overview",
              sectionSlug: "level-1",
              title: "Level 1 Overview",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
    });
    const queryClient = createMockQueryClient(noBehaviorSyllabus);

    // Act
    const action = loader({ context: { queryClient } });

    // Assert
    await expect(action).rejects.toMatchObject({
      isNotFound: true,
      message: "Not Found",
    });
  });

  it("throws notFound when the first Level 1 behavior slug is not a valid level route target", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getRouteOption(LevelsIndexRoute, "loader") as LevelsIndexLoader;
    const invalidSlugSyllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/theory/invalid",
              kind: "behavior",
              order: 0,
              pageSlug: "invalid/slug",
              sectionSlug: "level-1",
              title: "Invalid",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
      ],
    });
    const queryClient = createMockQueryClient(invalidSlugSyllabus);

    // Act
    const action = loader({ context: { queryClient } });

    // Assert
    await expect(action).rejects.toMatchObject({
      isNotFound: true,
      message: "Not Found",
    });
  });
});
