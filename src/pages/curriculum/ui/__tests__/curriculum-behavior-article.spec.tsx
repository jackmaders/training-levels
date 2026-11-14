import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import {
  TEST_BEHAVIOR_PAGE,
  TEST_SYLLABUS,
  createBehaviorPageFixture,
} from "@test/vitest/fixtures/curriculum";
import { createDeferred } from "@test/vitest/helpers/deferred";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { stepProgressQueryOptions } from "../../api/curriculum-query-options";
import type { ToggleStepResult } from "../../api/curriculum-service";
import { toggleStepFn } from "../../api/curriculum.functions";
import { CurriculumBehaviorArticle } from "../curriculum-behavior-article";

vi.mock(import("../../api/curriculum.functions"));

const LEVEL_ROUTE_PATHS = ["/", "/levels/$section/$page"];

function renderBehaviorArticle({
  completedStepIds = [],
  initialOpenAnchor,
  page = TEST_BEHAVIOR_PAGE,
}: {
  completedStepIds?: readonly string[];
  initialOpenAnchor?: string | undefined;
  page?: typeof TEST_BEHAVIOR_PAGE;
} = {}) {
  const view = renderWithProviders(
    <CurriculumBehaviorArticle
      completedStepIds={new Set(completedStepIds)}
      initialOpenAnchor={initialOpenAnchor}
      page={page}
      syllabus={TEST_SYLLABUS}
    />,
    {
      initialLocation: "/levels/level-1/zen",
      routePaths: LEVEL_ROUTE_PATHS,
    },
  );
  view.queryClient.setQueryData(stepProgressQueryOptions().queryKey, [...completedStepIds]);
  return view;
}

describe("curriculum behavior article structure", () => {
  it("renders short syllabus leaf breadcrumb, behavior header, progress bar, and footer", () => {
    expect.assertions(5);

    // Arrange
    const prefixedTitlePage = createBehaviorPageFixture({
      title: "Level 1: Zen",
    });

    // Act
    renderBehaviorArticle({
      completedStepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
      page: prefixedTitlePage,
    });
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });

    // Assert
    expect(within(breadcrumb).getByRole("link", { name: "Level 1" }).getAttribute("href")).toBe(
      "/levels/level-1/00-overview",
    );
    expect(within(breadcrumb).getByText("Zen")).toBeDefined();
    expect(screen.getByRole("heading", { level: 1, name: "Level 1: Zen" })).toBeDefined();
    expect(screen.getByRole("progressbar", { name: "Step Progress" })).toBeDefined();
    expect(screen.getByText("2 of 5 steps")).toBeDefined();
  });

  it("renders optional content sections when populated and omits them when empty", () => {
    expect.assertions(5);

    // Arrange & Act
    const { rerender } = renderBehaviorArticle();
    expect(screen.getByRole("heading", { name: "Comebefores" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Where We Are Going" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "About the Cues" })).toBeDefined();

    const minimalPage = createBehaviorPageFixture({
      aboutTheCues: null,
      comebefores: [],
      equipment: [],
      introBlocks: [],
      stepsIntroBlocks: [],
      thinkAbout: [],
      whereWeAreGoing: { extraBlocks: [], steps: [] },
    });
    rerender(
      <CurriculumBehaviorArticle
        completedStepIds={new Set()}
        page={minimalPage}
        syllabus={TEST_SYLLABUS}
      />,
    );

    // Assert
    expect(screen.queryByRole("heading", { name: "Comebefores" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Where We Are Going" })).toBeNull();
  });

  it("renders whereWeAreGoing with extra blocks only when steps summary list is empty", () => {
    expect.assertions(2);

    // Arrange
    const extraOnlyPage = createBehaviorPageFixture({
      whereWeAreGoing: {
        extraBlocks: [
          {
            content: [{ text: "Summary overview note.", type: "text" }],
            type: "paragraph",
          },
        ],
        steps: [],
      },
    });

    // Act
    renderBehaviorArticle({ page: extraOnlyPage });

    // Assert
    expect(screen.getByRole("heading", { name: "Where We Are Going" })).toBeDefined();
    expect(screen.getByText("Summary overview note.")).toBeDefined();
  });
});

describe("curriculum behavior article step cards and toggling", () => {
  it("expands a collapsed step card to show instructions, try it cold, and comeafters", async () => {
    expect.assertions(4);

    // Arrange
    const { user } = renderBehaviorArticle();
    expect(screen.queryByText("Practice briefly in a quiet room.")).toBeNull();

    // Act
    await user.click(screen.getByRole("button", { name: /Open palm slightly without grabbing/u }));

    // Assert
    expect(screen.getByText("Hold a treat in your closed hand.")).toBeDefined();
    expect(screen.getByText("Comeafters")).toBeDefined();
    expect(screen.getByText("Practice briefly in a quiet room.")).toBeDefined();
  });

  it("pre-opens a step matching initialOpenAnchor", () => {
    expect.assertions(2);

    // Arrange & Act
    renderBehaviorArticle({ initialOpenAnchor: "step-1" });

    // Assert
    expect(screen.getByText("Hold a treat in your closed hand.")).toBeDefined();
    expect(screen.getByText("Present your closed fist at chest height.")).toBeDefined();
  });

  it("submits optimistic step toggle via useToggleStep and persists after resolution", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { queryClient, user } = renderBehaviorArticle();
    const progressKey = stepProgressQueryOptions().queryKey;
    const stepCheckbox = screen.getByRole("checkbox", {
      name: "Toggle Step 1: Wait for eye contact with closed fist",
    });

    // Act
    await user.click(stepCheckbox);

    // Assert optimistic cache & call
    await waitFor(() => {
      expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
    });
    expect(toggleStepFn).toHaveBeenCalledWith({
      data: { completed: true, stepId: "level-1/zen:step-1" },
    });

    // Act resolve
    deferred.resolve({ completed: true, stepId: "level-1/zen:step-1" });
    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  it("shows inline destructive alert when step toggle mutation fails", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(toggleStepFn).mockRejectedValueOnce(
      new ApplicationError("CURRICULUM_STEP_NOT_FOUND"),
    );
    const { user } = renderBehaviorArticle();
    const stepCheckbox = screen.getByRole("checkbox", {
      name: "Toggle Step 1: Wait for eye contact with closed fist",
    });

    // Act
    await user.click(stepCheckbox);

    // Assert
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Could not update step progress")).toBeDefined();
    expect(within(alert).getByText("Curriculum step not found.")).toBeDefined();
  });
});
