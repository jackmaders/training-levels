import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";

import { getCurriculumSyllabus } from "@/shared/curriculum-data/index.server";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { curriculumSyllabusQueryOptions } from "../../api/curriculum-query-options";
import { trainingOverviewQueryOptions } from "../../api/recommendation-query-options";
import type { TrainingOverview } from "../../api/recommendation-service";
import { CurriculumTrainingHubPage } from "../curriculum-training-hub";

const FULL_SYLLABUS = getCurriculumSyllabus();

function createSeededClient(overviewOverrides: Partial<TrainingOverview> = {}): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const overview: TrainingOverview = {
    activeDog: null,
    curriculumProgress: [],
    practiceAttempts: [],
    practiceTotals: [],
    stepDecisions: [],
    stepTests: [],
    ...overviewOverrides,
  };
  client.setQueryData(trainingOverviewQueryOptions().queryKey, overview);
  client.setQueryData(curriculumSyllabusQueryOptions().queryKey, FULL_SYLLABUS);
  return client;
}

function getLevel1Progress(completedAt: Date) {
  const level1Pages =
    FULL_SYLLABUS.sections.find((section) => section.sectionSlug === "level-1")?.pages ?? [];
  return level1Pages.flatMap((page) =>
    (page.stepSummaries ?? []).map((step) => ({
      completedAt,
      stepId: step.stepId,
    })),
  );
}

describe("curriculumTrainingHubPage", () => {
  it("renders My Dog fallback badge, Up Next card, and active level behaviors", () => {
    expect.assertions(4);

    const queryClient = createSeededClient();

    renderWithProviders(<CurriculumTrainingHubPage />, { queryClient });

    expect(screen.getByRole("heading", { level: 1, name: "Training" })).toBeDefined();
    expect(screen.getByText("My Dog")).toBeDefined();
    expect(screen.getByRole("button", { name: "Start Practice" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Read Theory" })).toBeDefined();
  });

  it("renders activeDog.name and switches displayed level via levelId prop", () => {
    expect.assertions(3);

    const queryClient = createSeededClient({
      activeDog: { id: "dog-1", name: "Biscuit" },
    });

    renderWithProviders(<CurriculumTrainingHubPage levelId="level-2" />, { queryClient });

    expect(screen.getByText("Biscuit")).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Level 2" })).toBeDefined();
    expect(screen.getByText("Upcoming")).toBeDefined();
  });

  it("expands collapsible Steps list to reveal individual step launch links", async () => {
    expect.assertions(2);

    const user = userEvent.setup();
    const queryClient = createSeededClient();

    renderWithProviders(<CurriculumTrainingHubPage />, { queryClient });

    const stepsButtons = screen.getAllByRole("button", { name: /Steps/u });
    const [firstStepsButton] = stepsButtons;
    expect(stepsButtons.length).toBeGreaterThan(0);

    // oxlint-disable-next-line typescript/non-nullable-type-assertion-style
    await user.click(firstStepsButton as HTMLElement);

    expect(screen.getAllByRole("button", { name: "Train" }).length).toBeGreaterThan(0);
  });

  it("renders completed level badge, step statuses, and comebefore notice", async () => {
    expect.assertions(3);

    const user = userEvent.setup();
    const completedAt = new Date("2026-04-01T10:00:00.000Z");
    const level1Progress = getLevel1Progress(completedAt);
    const queryClient = createSeededClient({ curriculumProgress: level1Progress });

    renderWithProviders(<CurriculumTrainingHubPage levelId="level-1" />, { queryClient });

    expect(screen.getByText("Completed")).toBeDefined();

    const stepsButtons = screen.getAllByRole("button", { name: /Steps/u });
    const [firstStepsButton] = stepsButtons;
    // oxlint-disable-next-line typescript/non-nullable-type-assertion-style
    await user.click(firstStepsButton as HTMLElement);
    expect(screen.getAllByRole("button", { name: "Practice" }).length).toBeGreaterThan(0);

    const emptyClient = createSeededClient();
    renderWithProviders(<CurriculumTrainingHubPage levelId="level-2" />, {
      queryClient: emptyClient,
    });
    expect(screen.getAllByText(/Comebefore:/u).length).toBeGreaterThan(0);
  });

  it("renders Start Test CTA when recommendation mode is test", () => {
    expect.assertions(1);

    const queryClient = createSeededClient({
      stepDecisions: [
        {
          decidedAt: new Date("2026-04-01T10:00:00.000Z"),
          decision: "recommend_test",
          stepId: "level-1/zen:step-1",
        },
      ],
    });
    renderWithProviders(<CurriculumTrainingHubPage />, { queryClient });

    expect(screen.getByRole("button", { name: "Start Test" })).toBeDefined();
  });

  it("falls back to active level when requested levelId does not exist", () => {
    expect.assertions(1);

    const queryClient = createSeededClient();
    renderWithProviders(<CurriculumTrainingHubPage levelId="level-99" />, {
      queryClient,
    });

    expect(screen.getByRole("heading", { level: 2, name: "Level 1" })).toBeDefined();
  });
});
