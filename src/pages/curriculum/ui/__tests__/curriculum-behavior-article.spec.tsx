import { QueryClient } from "@tanstack/react-query";
import { act, screen, waitFor, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import {
  TEST_BEHAVIOR_PAGE,
  TEST_SYLLABUS,
  createBehaviorPageFixture,
  createBehaviorStepFixture,
} from "@test/vitest/fixtures/curriculum";
import { createDeferred } from "@test/vitest/helpers/deferred";
import { createTestingWrapper, renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { stepProgressQueryOptions } from "../../api/curriculum-query-options";
import type { ToggleStepResult } from "../../api/curriculum-service";
import { toggleStepFn } from "../../api/curriculum.functions";
import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../../api/generalization-query-options";
import type { PageGeneralizationState } from "../../api/generalization-service";
import { getPageGeneralizationFn, saveComeafterRecordFn } from "../../api/generalization.functions";
import { CurriculumBehaviorArticle } from "../curriculum-behavior-article";

vi.mock(import("../../api/curriculum.functions"));
vi.mock(import("../../api/generalization.functions"));

const LEVEL_ROUTE_PATHS = ["/", "/levels/$section/$page"];

afterEach(() => {
  window.location.hash = "";
  vi.clearAllMocks();
});

function renderBehaviorArticle({
  activeAnchor,
  completedStepIds = [],
  generalization,
  page = TEST_BEHAVIOR_PAGE,
}: {
  activeAnchor?: string | undefined;
  completedStepIds?: readonly string[];
  generalization?: PageGeneralizationState;
  page?: typeof TEST_BEHAVIOR_PAGE;
} = {}) {
  vi.mocked(getPageGeneralizationFn).mockResolvedValue(generalization ?? EMPTY_PAGE_GENERALIZATION);
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  queryClient.setQueryDefaults(["curriculum"], { staleTime: Infinity });
  queryClient.setQueryData(stepProgressQueryOptions().queryKey, [...completedStepIds]);
  queryClient.setQueryData(
    pageGeneralizationQueryOptions(page.pageSlug).queryKey,
    generalization ?? EMPTY_PAGE_GENERALIZATION,
  );
  return renderWithProviders(
    <CurriculumBehaviorArticle
      activeAnchor={activeAnchor}
      completedStepIds={new Set(completedStepIds)}
      page={page}
      syllabus={TEST_SYLLABUS}
    />,
    {
      initialLocation: "/levels/level-1/zen",
      queryClient,
      routePaths: LEVEL_ROUTE_PATHS,
    },
  );
}

describe("curriculum behavior article structure", () => {
  it("renders short syllabus leaf breadcrumb, behavior header without family eyebrow, and progress", () => {
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
    expect(screen.queryByText("Impulse Control")).toBeNull();
    expect(screen.getByText("2 of 5 steps")).toBeDefined();
  });

  it("renders populated optional sections and steps intro blocks", () => {
    expect.assertions(5);

    // Arrange & Act
    renderBehaviorArticle();

    // Assert
    expect(screen.getByRole("heading", { name: "Comebefores" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Where We Are Going" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "About the Cues" })).toBeDefined();
    expect(screen.getByText("Work through each step in sequence.")).toBeDefined();
    expect(screen.getByRole("progressbar", { name: "Step Progress" })).toBeDefined();
  });

  it("omits optional content sections when their block arrays are empty or null", () => {
    expect.assertions(5);

    // Arrange
    const minimalPage = createBehaviorPageFixture({
      aboutTheCues: null,
      comebefores: [],
      equipment: [],
      introBlocks: [],
      stepsIntroBlocks: [],
      thinkAbout: [],
      whereWeAreGoing: { extraBlocks: [], steps: [] },
    });

    // Act
    renderBehaviorArticle({ page: minimalPage });

    // Assert
    expect(screen.queryByRole("heading", { name: "Comebefores" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Where We Are Going" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "About the Cues" })).toBeNull();
    expect(screen.queryByText("Teaching impulse control around food.")).toBeNull();
    expect(screen.queryByText("Work through each step in sequence.")).toBeNull();
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

  it("renders whereWeAreGoing step items without duplicating the Step N prefix", () => {
    expect.assertions(3);

    // Arrange
    const stepsOnlyPage = createBehaviorPageFixture({
      whereWeAreGoing: {
        extraBlocks: [],
        steps: TEST_BEHAVIOR_PAGE.whereWeAreGoing.steps,
      },
    });

    // Act
    renderBehaviorArticle({ page: stepsOnlyPage });
    const region = screen.getByRole("region", { name: "Where We Are Going" });
    const items = within(region).getAllByRole("listitem");

    // Assert
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toBe("Step 1: Closed fist impulse check");
    expect(items[1]?.textContent).toBe("Step 2: Open palm calmly");
  });
});

describe("curriculum behavior article step anchors and SSR", () => {
  it("expands and collapses a step card via its Toggle details trigger", async () => {
    expect.assertions(4);

    // Arrange
    const { user } = renderBehaviorArticle();
    const stepTwoTrigger = screen.getByRole("button", {
      name: "Toggle details for Open palm slightly without grabbing",
    });

    // Act
    await user.click(stepTwoTrigger);
    const expandedAfterFirstClick = stepTwoTrigger.getAttribute("aria-expanded");
    const comebacksVisible = screen.queryByText("Practice briefly in a quiet room.") !== null;
    await user.click(stepTwoTrigger);

    // Assert
    expect(expandedAfterFirstClick).toBe("true");
    expect(comebacksVisible).toBe(true);
    expect(stepTwoTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Practice briefly in a quiet room.")).toBeNull();
  });

  it("omits empty tryItCold and comeafters arrays when an open step card has empty sections", () => {
    expect.assertions(2);

    // Arrange
    const emptyExtrasStep = createBehaviorStepFixture({
      comeafters: [],
      heading: "Step 1: Bare step",
      stepId: "level-1/zen:step-1",
      stepNumber: 1,
      tryItCold: [],
    });
    const page = createBehaviorPageFixture({
      steps: [emptyExtrasStep],
    });

    // Act
    renderBehaviorArticle({ activeAnchor: "step-1", page });

    // Assert
    expect(screen.getByText("Hold a treat in your closed hand.")).toBeDefined();
    expect(screen.queryByText("Comeafters")).toBeNull();
  });

  it("pre-opens a step matching activeAnchor and opens updated activeAnchor on rerender", () => {
    expect.assertions(4);

    // Arrange
    const { rerender } = renderBehaviorArticle({ activeAnchor: "step-1" });

    // Act
    rerender(
      <CurriculumBehaviorArticle
        activeAnchor="step-2"
        completedStepIds={new Set()}
        page={TEST_BEHAVIOR_PAGE}
        syllabus={TEST_SYLLABUS}
      />,
    );

    // Assert
    expect(
      screen
        .getByRole("button", { name: "Toggle details for Wait for eye contact with closed fist" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Toggle details for Open palm slightly without grabbing" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(screen.getByText("Present your closed fist at chest height.")).toBeDefined();
    expect(screen.getByText("Practice briefly in a quiet room.")).toBeDefined();
  });

  it("opens a collapsed step card when clicking its Step N anchor link in Where We Are Going", async () => {
    expect.assertions(2);

    // Arrange
    const { user } = renderBehaviorArticle();
    const whereSection = screen.getByRole("region", { name: "Where We Are Going" });
    const stepTwoTrigger = screen.getByRole("button", {
      name: "Toggle details for Open palm slightly without grabbing",
    });

    // Act
    await user.click(within(whereSection).getByRole("link", { name: "Step 2" }));

    // Assert
    expect(stepTwoTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Practice briefly in a quiet room.")).toBeDefined();
  });

  it("opens and tracks step anchors when window hashchange events fire", () => {
    expect.assertions(2);

    // Arrange
    renderBehaviorArticle();
    const stepTwoTrigger = screen.getByRole("button", {
      name: "Toggle details for Open palm slightly without grabbing",
    });

    // Act
    act(() => {
      window.location.hash = "#step-2";
      window.dispatchEvent(new Event("hashchange"));
    });
    const expandedOnHash = stepTwoTrigger.getAttribute("aria-expanded");

    act(() => {
      window.location.hash = "";
      window.dispatchEvent(new Event("hashchange"));
    });

    // Assert
    expect(expandedOnHash).toBe("true");
    expect(screen.getByText("Practice briefly in a quiet room.")).toBeDefined();
  });

  it("renders all step cards collapsed during SSR regardless of activeAnchor or window hash", () => {
    expect.assertions(3);

    // Arrange
    window.location.hash = "#step-2";
    const { wrapper: Wrapper } = createTestingWrapper({
      initialLocation: "/levels/level-1/zen#step-2",
      routePaths: LEVEL_ROUTE_PATHS,
    });

    // Act
    const view = renderToString(
      <Wrapper>
        <CurriculumBehaviorArticle
          activeAnchor="step-1"
          completedStepIds={new Set()}
          page={TEST_BEHAVIOR_PAGE}
          syllabus={TEST_SYLLABUS}
        />
      </Wrapper>,
    );

    // Assert
    expect(view).toContain('aria-expanded="false"');
    expect(view).not.toContain('aria-expanded="true"');
    expect(view).not.toContain("Practice briefly in a quiet room.");
  });
});

describe("curriculum behavior article step toggling", () => {
  it("submits optimistic step toggle while server mutation is pending", async () => {
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

    // Assert
    await waitFor(() => {
      expect(queryClient.getQueryData(progressKey)).toStrictEqual(["level-1/zen:step-1"]);
    });
    expect(toggleStepFn).toHaveBeenCalledWith({
      data: { completed: true, stepId: "level-1/zen:step-1" },
    });
  });

  it("renders without an error alert after step toggle mutation settles", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<ToggleStepResult>();
    vi.mocked(toggleStepFn).mockReturnValueOnce(deferred.promise);
    const { user } = renderBehaviorArticle();
    const stepCheckbox = screen.getByRole("checkbox", {
      name: "Toggle Step 1: Wait for eye contact with closed fist",
    });

    // Act
    await user.click(stepCheckbox);
    await act(async () => {
      deferred.resolve({ completed: true, stepId: "level-1/zen:step-1" });
      await deferred.promise;
    });

    // Assert
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

describe("curriculum behavior article provenance and comeafter tracking", () => {
  it("renders step provenance badges in collapsed headers without adding buttons", () => {
    expect.assertions(5);

    // Arrange
    const generalization: PageGeneralizationState = {
      comeafters: {},
      homeworkReflection: null,
      latestStepTests: {
        "level-1/zen:step-1": "success",
        "level-1/zen:step-3": "not_yet",
      },
    };

    // Act
    renderBehaviorArticle({
      completedStepIds: ["level-1/zen:step-1", "level-1/zen:step-2", "level-1/zen:step-3"],
      generalization,
    });
    const article = screen.getByRole("article");

    // Assert
    expect(within(article).getAllByRole("button")).toHaveLength(5);
    expect(screen.getByText("Passed Cold Test")).toBeDefined();
    expect(screen.getByText("Previously recorded")).toBeDefined();
    expect(screen.getByText("Needs Practice")).toBeDefined();
    expect(screen.getByText("Previously recorded; latest retest needs practice")).toBeDefined();
  });

  it("keeps level advancement readiness anchored to completed behavior steps", () => {
    expect.assertions(1);

    // Arrange
    const generalization: PageGeneralizationState = {
      comeafters: {},
      homeworkReflection: null,
      latestStepTests: {
        "level-1/zen:step-1": "success",
        "level-1/zen:step-3": "not_yet",
      },
    };

    // Act
    renderBehaviorArticle({
      completedStepIds: ["level-1/zen:step-1", "level-1/zen:step-2", "level-1/zen:step-3"],
      generalization,
    });

    // Assert
    expect(screen.getByText(/3 of 10 Behavior steps completed \(7 remaining\)\./u)).toBeDefined();
  });

  it("saves comeafter tracking inside expanded step without changing behavior step progress", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(saveComeafterRecordFn).mockResolvedValueOnce({
      note: "Quiet hallway",
      status: "practicing",
      stepId: "level-1/zen:step-2",
      updatedAt: new Date("2026-04-01T12:00:00.000Z"),
    });
    const { user } = renderBehaviorArticle({
      activeAnchor: "step-2",
      generalization: EMPTY_PAGE_GENERALIZATION,
    });

    // Act
    await user.selectOptions(screen.getByLabelText("Comeafter status"), "practicing");
    await user.type(screen.getByLabelText("Generalization note (optional)"), "Quiet hallway");
    await user.click(screen.getByRole("button", { name: "Save Comeafter" }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toBe("Comeafter saved.");
    });
    expect(saveComeafterRecordFn).toHaveBeenCalledWith({
      data: {
        note: "Quiet hallway",
        status: "practicing",
        stepId: "level-1/zen:step-2",
      },
    });
    expect(screen.getByText("0 of 5 steps")).toBeDefined();
  });
});
