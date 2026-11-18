import type { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as DependenciesRoute } from "@/app/routes/_authenticated/dependencies";
import {
  CurriculumDependenciesPage,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
  trainingOverviewQueryOptions,
} from "@/pages/curriculum";
import { getRouteOption } from "@test/vitest/helpers/route";

vi.mock(import("@/pages/curriculum"), async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    CurriculumDependenciesPage: () => null,
  } as never;
});

type DependenciesLoader = (ctx: { context: { queryClient: QueryClient } }) => Promise<unknown>;

describe("dependencies route", () => {
  it("loads syllabus, step progress, and training overview in loader and uses CurriculumDependenciesPage", async () => {
    expect.assertions(5);

    const query = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);
    const queryClient = { query } as unknown as QueryClient;
    const loader = getRouteOption(DependenciesRoute, "loader") as DependenciesLoader;

    await loader({ context: { queryClient } });

    expect(query).toHaveBeenCalledTimes(3);
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: curriculumSyllabusQueryOptions().queryKey }),
    );
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: stepProgressQueryOptions().queryKey }),
    );
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: trainingOverviewQueryOptions().queryKey }),
    );
    expect(getRouteOption(DependenciesRoute, "component")).toBe(CurriculumDependenciesPage);
  });
});
