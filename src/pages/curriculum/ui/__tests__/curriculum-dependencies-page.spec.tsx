import { QueryClient } from "@tanstack/react-query";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import type { SyllabusPageEntry } from "@/shared/curriculum-data";
import {
  TEST_BEHAVIOR_PAGE,
  TEST_SYLLABUS,
  createBehaviorPageFixture,
  createBehaviorStepFixture,
  createSyllabusFixture,
} from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import {
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../../api/curriculum-query-options";
import { trainingOverviewQueryOptions } from "../../api/recommendation-query-options";
import type { TrainingOverview } from "../../api/recommendation-service";
import { EMPTY_TRAINING_OVERVIEW } from "../../model/curriculum-training-state";
import { observeGraphCanvas } from "../curriculum-dependencies-graph-helpers";
import { CurriculumDependenciesPage } from "../curriculum-dependencies-page";
import { BehaviorCardButton } from "../curriculum-dependencies-shared";

vi.mock(import("../../api/curriculum.functions"), async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    getCurriculumPageFn: vi
      .fn<() => Promise<typeof TEST_BEHAVIOR_PAGE>>()
      .mockResolvedValue(TEST_BEHAVIOR_PAGE),
    getCurriculumSyllabusFn: vi
      .fn<() => Promise<typeof TEST_SYLLABUS>>()
      .mockResolvedValue(TEST_SYLLABUS),
    getStepProgressFn: vi.fn<() => Promise<never[]>>().mockResolvedValue([]),
  } as never;
});

vi.mock(import("../../api/recommendation.functions"), async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    getTrainingOverviewFn: vi.fn<() => Promise<TrainingOverview>>().mockResolvedValue({
      activeDog: null,
      curriculumProgress: [],
      practiceAttempts: [],
      practiceTotals: [],
      stepDecisions: [],
      stepTests: [],
    }),
  } as never;
});

function getLastElement(elements: HTMLElement[]): HTMLElement {
  const element = elements.at(-1);
  if (!element) {
    throw new Error("Expected at least one element");
  }
  return element;
}

describe("curriculum dependencies page", () => {
  it("renders behaviors across levels and switches selection on click", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const matPage = createBehaviorPageFixture({
      ...TEST_BEHAVIOR_PAGE,
      pageSlug: "level-2/go-to-mat",
      title: "Go to Mat",
    });
    const syllabus = createSyllabusFixture({
      sections: [
        ...TEST_SYLLABUS.sections,
        {
          href: "/levels/level-3",
          levelNumber: 3,
          pages: [
            {
              href: "/levels/level-2/go-to-mat",
              kind: "behavior",
              order: 1,
              pageSlug: "level-2/go-to-mat",
              sectionSlug: "level-2",
              stepIds: ["level-2/go-to-mat#step-1"],
              title: "Go to Mat",
            },
            {
              href: "/levels/level-2/stay",
              kind: "behavior",
              order: 2,
              pageSlug: "level-2/stay",
              sectionSlug: "level-2",
              stepIds: [],
              title: "Stay",
            },
          ],
          sectionSlug: "level-3",
          title: "Level 3",
        },
      ],
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
    queryClient.setQueryData(stepProgressQueryOptions().queryKey, ["level-1/zen:step-1"]);
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
    expect(screen.getByRole("heading", { name: "Main Quest foundations" })).toBeDefined();

    // Act
    await Promise.all(
      screen
        .getAllByRole("button", { name: /^Zen\b/u })
        .slice(0, 1)
        .map(async (button) => {
          await user.click(button);
        }),
    );
    await user.click(getLastElement(screen.getAllByRole("button", { name: /^Zen\b/u })));

    // Assert
    expect(screen.getByRole("heading", { name: "Zen" })).toBeDefined();
    expect(screen.getByText("Completed")).toBeDefined();
    expect(screen.getAllByText("Not completed")).toHaveLength(4);
  });

  it("handles dependency list clicks, relationship target clicks, and missing stepIds or detail", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const matPage = createBehaviorPageFixture({
      ...TEST_BEHAVIOR_PAGE,
      pageSlug: "level-2/go-to-mat",
      title: "Go to Mat",
    });
    const syllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/zen",
              kind: "behavior",
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: ["level-1/zen#step-1"],
              title: "Zen",
            },
            {
              href: "/levels/level-1/come",
              kind: "behavior",
              order: 2,
              pageSlug: "level-1/come",
              sectionSlug: "level-1",
              title: "Come",
            },
            {
              href: "/levels/level-1/sit",
              kind: "behavior",
              order: 3,
              pageSlug: "level-1/sit",
              sectionSlug: "level-1",
              stepIds: [],
              title: "Sit",
            },
            {
              href: "/levels/level-1/down",
              kind: "behavior",
              order: 4,
              pageSlug: "level-1/down",
              sectionSlug: "level-1",
              stepIds: [],
              title: "Down",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
        {
          href: "/levels/level-3",
          levelNumber: 3,
          pages: [
            {
              href: "/levels/level-2/go-to-mat",
              kind: "behavior",
              order: 1,
              pageSlug: "level-2/go-to-mat",
              sectionSlug: "level-2",
              stepIds: ["level-2/go-to-mat#step-1"],
              title: "Go to Mat",
            },
            {
              href: "/levels/level-2/down",
              kind: "behavior",
              order: 2,
              pageSlug: "level-2/down",
              sectionSlug: "level-2",
              stepIds: [],
              title: "Level 2 Down",
            },
          ],
          sectionSlug: "level-3",
          title: "Level 3",
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
    expect(screen.getByRole("heading", { name: "Level 2 Down" })).toBeDefined();

    // Act: click Come in the Dependency list section (last button matching Come)
    const comeButtons = screen.getAllByRole("button", { name: /^Come\b/u });
    await user.click(getLastElement(comeButtons));

    // Assert
    expect(screen.getByRole("heading", { name: "Come" })).toBeDefined();
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

  it("shows current goal and synchronized training badges in graph and dependency list", () => {
    expect.assertions(5);

    // Arrange
    const yesterday = new Date("2020-01-01T10:00:00.000Z");
    const matPage = createBehaviorPageFixture({
      pageSlug: "level-2/go-to-mat",
      steps: [
        createBehaviorStepFixture({
          heading: "Step 1: Go to mat",
          stepId: "level-2/go-to-mat:step-1",
          stepNumber: 1,
        }),
      ],
      title: "Go to Mat",
    });
    const syllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: ["level-1/zen:step-1"],
              title: "Zen",
            },
            {
              href: "/levels/level-1/down",
              kind: "behavior",
              levelNumber: 1,
              order: 2,
              pageSlug: "level-1/down",
              sectionSlug: "level-1",
              stepIds: ["level-1/down:step-1"],
              title: "Down",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
        {
          href: "/levels/level-2",
          levelNumber: 2,
          pages: [
            {
              href: "/levels/level-2/go-to-mat",
              kind: "behavior",
              levelNumber: 2,
              order: 1,
              pageSlug: "level-2/go-to-mat",
              sectionSlug: "level-2",
              stepIds: ["level-2/go-to-mat:step-1"],
              title: "Go to Mat",
            },
          ],
          sectionSlug: "level-2",
          title: "Level 2",
        },
      ],
    });
    const overview: TrainingOverview = {
      ...EMPTY_TRAINING_OVERVIEW,
      stepDecisions: [
        {
          decidedAt: yesterday,
          decision: "recommend_test",
          stepId: "level-1/zen:step-1",
        },
      ],
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
    queryClient.setQueryData(stepProgressQueryOptions().queryKey, []);
    queryClient.setQueryData(trainingOverviewQueryOptions().queryKey, overview);
    queryClient.setQueryData(curriculumPageQueryOptions("level-2/go-to-mat").queryKey, matPage);

    // Act
    renderWithProviders(<CurriculumDependenciesPage />, {
      queryClient,
      routePaths: ["/", "/training"],
    });

    const graph = screen.getByRole("region", { name: "Curriculum dependency graph" });
    const list = screen.getByRole("region", { name: "Dependency list" });
    const graphZen = within(graph).getByRole("button", { name: /^Zen\b/u });
    const listZen = within(list).getByRole("button", { name: /^Zen\b/u });

    // Assert
    expect(screen.getByText("Current goal: Level 1")).toBeDefined();
    expect(graphZen.dataset["recommendedNext"]).toBe("true");
    expect(listZen.dataset["recommendedNext"]).toBe("true");
    expect(within(graphZen).getByText("Test ready")).toBeDefined();
    expect(within(listZen).getByText("Recommended next")).toBeDefined();
  });

  it("highlights prerequisite chain and eligible next options and renders selected warnings and links", async () => {
    expect.assertions(5);

    // Arrange
    const user = userEvent.setup();
    const yesterday = new Date("2020-01-01T10:00:00.000Z");
    const zenStep1 = createBehaviorStepFixture({
      heading: "Step 1: Wait for eye contact",
      stepId: "level-1/zen:step-1",
      stepNumber: 1,
    });
    const matPage = createBehaviorPageFixture({
      pageSlug: "level-2/go-to-mat",
      steps: [
        createBehaviorStepFixture({
          heading: "Step 1: Go to mat",
          stepId: "level-2/go-to-mat:step-1",
          stepNumber: 1,
        }),
      ],
      title: "Go to Mat",
    });
    const syllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/zen",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/zen",
              sectionSlug: "level-1",
              stepIds: ["level-1/zen:step-1"],
              title: "Zen",
            },
            {
              href: "/levels/level-1/down",
              kind: "behavior",
              levelNumber: 1,
              order: 2,
              pageSlug: "level-1/down",
              sectionSlug: "level-1",
              stepIds: ["level-1/down:step-1"],
              title: "Down",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
        {
          href: "/levels/level-2",
          levelNumber: 2,
          pages: [
            {
              href: "/levels/level-2/go-to-mat",
              kind: "behavior",
              levelNumber: 2,
              order: 1,
              pageSlug: "level-2/go-to-mat",
              sectionSlug: "level-2",
              stepIds: ["level-2/go-to-mat:step-1"],
              title: "Go to Mat",
            },
          ],
          sectionSlug: "level-2",
          title: "Level 2",
        },
      ],
    });
    const overview: TrainingOverview = {
      ...EMPTY_TRAINING_OVERVIEW,
      stepDecisions: [
        {
          decidedAt: yesterday,
          decision: "recommend_test",
          stepId: "level-1/zen:step-1",
        },
      ],
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
    queryClient.setQueryData(stepProgressQueryOptions().queryKey, []);
    queryClient.setQueryData(trainingOverviewQueryOptions().queryKey, overview);
    queryClient.setQueryData(curriculumPageQueryOptions("level-2/go-to-mat").queryKey, matPage);
    queryClient.setQueryData(
      curriculumPageQueryOptions("level-1/zen").queryKey,
      createBehaviorPageFixture({ steps: [zenStep1] }),
    );

    // Act
    renderWithProviders(<CurriculumDependenciesPage />, {
      queryClient,
      routePaths: ["/", "/training"],
    });

    const graph = screen.getByRole("region", { name: "Curriculum dependency graph" });
    const list = screen.getByRole("region", { name: "Dependency list" });
    const selectedPanel = screen.getByRole("region", { name: "Selected behavior" });
    const graphDown = within(graph).getByRole("button", { name: /^Down\b/u });
    const listDown = within(list).getByRole("button", { name: /^Down\b/u });

    // Assert prerequisite chain + eligible highlights and selected panel warnings
    expect(graphDown.dataset["prerequisiteChain"]).toBe("true");
    expect(graphDown.dataset["eligibleNext"]).toBe("true");
    expect(within(listDown).getByText("Eligible next option")).toBeDefined();
    expect(
      within(selectedPanel).getByText(
        "Unmet Comebefores: Down. Launching opens Prep with a manual override option.",
      ),
    ).toBeDefined();

    // Act: select Zen from graph and verify Test Step 1 primary link
    await user.click(within(graph).getByRole("button", { name: /^Zen\b/u }));
    expect(
      within(selectedPanel).getByRole("link", { name: "Test Step 1" }).getAttribute("href"),
    ).toBe("/training?mode=test&stepId=level-1%2Fzen%3Astep-1");
  });

  it("renders per-step practice and test links and handles null graph canvas", () => {
    expect.assertions(5);

    // Arrange
    const matPage = createBehaviorPageFixture({
      pageSlug: "level-2/go-to-mat",
      steps: [
        createBehaviorStepFixture({
          heading: "Step 1: Go to mat",
          stepId: "level-2/go-to-mat:step-1",
          stepNumber: 1,
        }),
      ],
      title: "Go to Mat",
    });
    const syllabus = createSyllabusFixture({
      sections: [
        {
          href: "/levels/level-1",
          levelNumber: 1,
          pages: [
            {
              href: "/levels/level-1/down",
              kind: "behavior",
              levelNumber: 1,
              order: 1,
              pageSlug: "level-1/down",
              sectionSlug: "level-1",
              stepIds: ["level-1/down:step-1"],
              title: "Down",
            },
          ],
          sectionSlug: "level-1",
          title: "Level 1",
        },
        {
          href: "/levels/level-2",
          levelNumber: 2,
          pages: [
            {
              href: "/levels/level-2/go-to-mat",
              kind: "behavior",
              levelNumber: 2,
              order: 1,
              pageSlug: "level-2/go-to-mat",
              sectionSlug: "level-2",
              stepIds: ["level-2/go-to-mat:step-1"],
              title: "Go to Mat",
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
    queryClient.setQueryData(trainingOverviewQueryOptions().queryKey, EMPTY_TRAINING_OVERVIEW);
    queryClient.setQueryData(curriculumPageQueryOptions("level-2/go-to-mat").queryKey, matPage);

    // Act
    renderWithProviders(<CurriculumDependenciesPage />, {
      queryClient,
      routePaths: ["/", "/training"],
    });
    const selectedPanel = screen.getByRole("region", { name: "Selected behavior" });

    // Assert
    expect(
      within(selectedPanel).getByText(
        "Later-Level selection (Current goal: Level 1). Launching into Prep does not change your Level goal.",
      ),
    ).toBeDefined();
    expect(
      within(selectedPanel).getByRole("link", { name: "Practice Step 1" }).getAttribute("href"),
    ).toBe("/training?stepId=level-2%2Fgo-to-mat%3Astep-1");
    expect(
      within(selectedPanel)
        .getByRole("link", { name: "Open Step 1 in Practice" })
        .getAttribute("href"),
    ).toBe("/training?mode=practice&stepId=level-2%2Fgo-to-mat%3Astep-1");
    expect(
      within(selectedPanel).getByRole("link", { name: "Open Step 1 in Test" }).getAttribute("href"),
    ).toBe("/training?mode=test&stepId=level-2%2Fgo-to-mat%3Astep-1");
    expect(
      observeGraphCanvas({
        canvas: null,
        nodeRefs: new Map(),
        onMeasure: vi.fn<() => void>(),
      }),
    ).toBeUndefined();
  });

  it("renders prerequisite chain badge on BehaviorCardButton when behaviorState is absent", () => {
    expect.assertions(2);

    const missingState: { value?: undefined } = {};
    const comePage: SyllabusPageEntry = {
      href: "/levels/level-1/come",
      kind: "behavior",
      order: 2,
      pageSlug: "level-1/come",
      sectionSlug: "level-1",
      title: "Come",
    };
    renderWithProviders(
      <BehaviorCardButton
        behaviorState={missingState.value}
        behaviors={[comePage]}
        chain={new Set(["level-1/come"])}
        completed={new Set()}
        isSelected={false}
        page={comePage}
        onSelect={vi.fn<() => void>()}
      />,
      { routePaths: ["/"] },
    );

    const comeButton = screen.getByRole("button", { name: /^Come\b/u });
    expect(comeButton.dataset["prerequisiteChain"]).toBe("true");
    expect(within(comeButton).getByText("In selected prerequisite chain")).toBeDefined();
  });

  it("falls back to page stepIds completion count when behaviorState is absent", () => {
    expect.assertions(1);

    const missingState: { value?: undefined } = {};
    const sitPage: SyllabusPageEntry = {
      href: "/levels/level-1/sit",
      kind: "behavior",
      order: 3,
      pageSlug: "level-1/sit",
      sectionSlug: "level-1",
      stepIds: ["level-1/sit:step-1", "level-1/sit:step-2"],
      title: "Sit",
    };
    renderWithProviders(
      <BehaviorCardButton
        behaviorState={missingState.value}
        behaviors={[sitPage]}
        chain={new Set()}
        completed={new Set(["level-1/sit:step-1"])}
        isSelected={false}
        page={sitPage}
        onSelect={vi.fn<() => void>()}
      />,
      { routePaths: ["/"] },
    );

    const sitButton = screen.getByRole("button", { name: /^Sit\b/u });
    expect(within(sitButton).getByText("1 of 2 Steps complete")).toBeDefined();
  });
});
