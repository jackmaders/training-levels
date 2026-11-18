import type { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as DependenciesRoute } from "@/app/routes/_authenticated/dependencies";
import { CurriculumDependenciesPage } from "@/pages/curriculum";
import { getRouteOption } from "@test/vitest/helpers/route";

vi.mock(import("@/pages/curriculum"));

type DependenciesLoader = (ctx: { context: { queryClient: QueryClient } }) => Promise<unknown>;

describe("dependencies route", () => {
  it("loads syllabus and step progress in loader and uses CurriculumDependenciesPage", async () => {
    expect.assertions(2);

    const query = vi.fn<() => Promise<unknown>>().mockResolvedValue();
    const queryClient = { query } as unknown as QueryClient;
    const loader = getRouteOption(DependenciesRoute, "loader") as DependenciesLoader;

    await loader({ context: { queryClient } });

    expect(query).toHaveBeenCalledTimes(2);
    expect(getRouteOption(DependenciesRoute, "component")).toBe(CurriculumDependenciesPage);
  });
});
