import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";

import {
  TEST_BEHAVIOR_PAGE,
  TEST_SYLLABUS,
  createBehaviorPageFixture,
  createSyllabusFixture,
} from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../../api/curriculum-query-options";
import { CurriculumDependenciesPage } from "../curriculum-dependencies-page";

describe("curriculum dependencies page", () => {
  it("renders behaviors across levels and switches selection on click", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const matPage = createBehaviorPageFixture({
      ...TEST_BEHAVIOR_PAGE,
      pageSlug: "level-2/go-to-mat",
      slug: "level-2/go-to-mat",
      title: "Go to Mat",
    });
    const syllabus = createSyllabusFixture({
      sections: [
        ...TEST_SYLLABUS.sections,
        {
          href: "/levels/level-2",
          kind: "level",
          levelNumber: 2,
          pages: [
            {
              href: "/levels/level-2/go-to-mat",
              kind: "behavior",
              pageSlug: "level-2/go-to-mat",
              stepIds: ["level-2/go-to-mat#step-1"],
              title: "Go to Mat",
            },
            {
              href: "/levels/level-2/stay",
              kind: "behavior",
              pageSlug: "level-2/stay",
              stepIds: [],
              title: "Stay",
            },
          ],
          sectionSlug: "level-2",
          title: "Level 2",
        },
      ],
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
    queryClient.setQueryData(stepProgressQueryOptions().queryKey, ["level-1/zen#step-1"]);
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/zen").queryKey,
      TEST_BEHAVIOR_PAGE,
    );
    queryClient.setQueryData(curriculumPageQueryOptions("level-2/go-to-mat").queryKey, matPage);

    renderWithProviders(<CurriculumDependenciesPage />, {
      queryClient,
      routePaths: ["/"],
    });

    // Assert
    expect(screen.getByRole("heading", { name: "Main Quest foundations" })).toBeTruthy();

    // Act
    await user.click(screen.getAllByRole("button", { name: /^Zen\b/ })[0]);

    // Assert
    expect(screen.getByRole("heading", { name: "Zen" })).toBeTruthy();
  });

  it("handles dependency list clicks, relationship target clicks, and missing stepIds or detail", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const matPage = createBehaviorPageFixture({
      ...TEST_BEHAVIOR_PAGE,
      pageSlug: "level-2/go-to-mat",
      slug: "level-2/go-to-mat",
      title: "Go to Mat",
    });
    const syllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          kind: "level",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/zen",
              kind: "behavior",
              pageSlug: "level-1/zen",
              stepIds: ["level-1/zen#step-1"],
              title: "Zen",
            },
            {
              href: "/levels/level-1/come",
              kind: "behavior",
              pageSlug: "level-1/come",
              stepIds: undefined,
              title: "Come",
            },
            {
              href: "/levels/level-1/sit",
              kind: "behavior",
              pageSlug: "level-1/sit",
              stepIds: [],
              title: "Sit",
            },
            {
              href: "/levels/level-1/down",
              kind: "behavior",
              pageSlug: "level-1/down",
              stepIds: [],
              title: "Down",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
        {
          href: "/levels/level-2",
          kind: "level",
          levelNumber: 2,
          pages: [
            {
              href: "/levels/level-2/go-to-mat",
              kind: "behavior",
              pageSlug: "level-2/go-to-mat",
              stepIds: ["level-2/go-to-mat#step-1"],
              title: "Go to Mat",
            },
            {
              href: "/levels/level-2/down",
              kind: "behavior",
              pageSlug: "level-2/down",
              stepIds: [],
              title: "Level 2 Down",
            },
          ],
          sectionSlug: "level-2",
          title: "Level 2",
        },
      ],
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
    queryClient.setQueryData(stepProgressQueryOptions().queryKey, []);
    queryClient.setQueryData(curriculumPageQueryOptions("level-2/go-to-mat").queryKey, matPage);
    queryClient.setQueryData(curriculumPageQueryOptions("level-2/down").queryKey, null);
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/come").queryKey,
      TEST_BEHAVIOR_PAGE,
    );

    renderWithProviders(<CurriculumDependenciesPage />, {
      queryClient,
      routePaths: ["/"],
    });

    // Act: click target behavior button in Selected behavior section ("Level 2 Down")
    await user.click(screen.getByRole("button", { name: "Level 2 Down" }));

    // Assert: selected behavior switched to Level 2 Down (with null detail)
    expect(screen.getByRole("heading", { name: "Level 2 Down" })).toBeTruthy();

    // Act: click Come in the Dependency list section (last button matching Come)
    const comeButtons = screen.getAllByRole("button", { name: /^Come\b/ });
    await user.click(comeButtons.at(-1)!);

    // Assert
    expect(screen.getByRole("heading", { name: "Come" })).toBeTruthy();
  });

  it("throws when syllabus has no behavior pages", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(
      curriculumSyllabusQueryOptions().queryKey,
      createSyllabusFixture({ sections: [] }),
    );
    queryClient.setQueryData(stepProgressQueryOptions().queryKey, []);

    // Act & Assert
    expect(() =>
      renderWithProviders(<CurriculumDependenciesPage />, {
        queryClient,
        routePaths: ["/"],
      }),
    ).toThrow("No curriculum behaviors found.");
  });
});
