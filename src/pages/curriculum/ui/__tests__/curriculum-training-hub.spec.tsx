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

describe(CurriculumTrainingHubPage, () => {
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
    const firstStepsButton = stepsButtons[0];
    expect(stepsButtons.length).toBeGreaterThan(0);

    await user.click(firstStepsButton as HTMLElement);

    expect(screen.getAllByRole("button", { name: "Train" }).length).toBeGreaterThan(0);
  });
});
