import { QueryClient } from "@tanstack/react-query";
import { act, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createDeferred } from "@test/vitest/helpers/deferred";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../../api/generalization-query-options";
import type { HomeworkReflectionState } from "../../api/generalization-service";
import {
  getPageGeneralizationFn,
  saveHomeworkReflectionFn,
} from "../../api/generalization.functions";
import { CurriculumHomeworkReflection } from "../curriculum-homework-reflection";

vi.mock(import("../../api/generalization.functions"));

const UPDATED_AT = new Date("2026-04-01T12:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPageGeneralizationFn).mockResolvedValue(EMPTY_PAGE_GENERALIZATION);
});

describe("curriculum homework reflection", () => {
  it("renders non-gating guidance and empty reflection form when none is saved", () => {
    expect.assertions(4);

    // Arrange & Act
    renderWithProviders(<CurriculumHomeworkReflection pageSlug="level-1/homework" />);

    // Assert
    expect(screen.getByRole("heading", { name: "Homework Reflection" })).toBeDefined();
    expect(
      screen.getByText(
        "Homework reflections support handler generalization and do not count toward or gate Level advancement.",
      ),
    ).toBeDefined();
    expect(screen.getByLabelText<HTMLTextAreaElement>("Homework reflection").value).toBe("");
    expect(screen.getByRole("button", { name: "Save reflection" })).toBeDefined();
  });

  it("pre-fills saved reflection from generalization query cache", () => {
    expect.assertions(2);

    // Arrange
    const { queryKey } = pageGeneralizationQueryOptions("level-1/homework");
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    queryClient.setQueryDefaults(["curriculum"], { staleTime: Infinity });
    queryClient.setQueryData(queryKey, {
      ...EMPTY_PAGE_GENERALIZATION,
      homeworkReflection: {
        pageSlug: "level-1/homework",
        reflection: "Focus on doorways this week.",
        updatedAt: UPDATED_AT,
      },
    });
    renderWithProviders(<CurriculumHomeworkReflection pageSlug="level-1/homework" />, {
      queryClient,
    });

    // Assert
    expect(screen.getByLabelText<HTMLTextAreaElement>("Homework reflection").value).toBe(
      "Focus on doorways this week.",
    );
    expect(screen.getByText("Saved reflection loaded.")).toBeDefined();
  });

  it("shows validation error when submitting blank reflection", async () => {
    expect.hasAssertions();

    // Arrange
    const { user } = renderWithProviders(
      <CurriculumHomeworkReflection pageSlug="level-1/homework" />,
    );

    // Act
    await user.type(screen.getByLabelText("Homework reflection"), "   ");
    await user.click(screen.getByRole("button", { name: "Save reflection" }));

    // Assert
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Reflection is required.")).toBeDefined();
    expect(saveHomeworkReflectionFn).not.toHaveBeenCalled();
  });

  it("submits trimmed reflection, displays pending state, and persists saved feedback", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<HomeworkReflectionState>();
    vi.mocked(saveHomeworkReflectionFn).mockReturnValueOnce(deferred.promise);
    const { user } = renderWithProviders(
      <CurriculumHomeworkReflection pageSlug="level-1/homework" />,
    );

    // Act
    await user.type(screen.getByLabelText("Homework reflection"), "  Calm eye contact near park  ");
    await user.click(screen.getByRole("button", { name: "Save reflection" }));

    // Assert pending
    expect(screen.getByRole("button", { name: "Saving..." }).hasAttribute("disabled")).toBe(true);
    expect(saveHomeworkReflectionFn).toHaveBeenCalledWith({
      data: {
        pageSlug: "level-1/homework",
        reflection: "Calm eye contact near park",
      },
    });

    // Act settle
    await act(async () => {
      deferred.resolve({
        pageSlug: "level-1/homework",
        reflection: "Calm eye contact near park",
        updatedAt: UPDATED_AT,
      });
      await deferred.promise;
    });

    // Assert saved
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toBe("Reflection saved.");
    });
  });

  it("displays server error alert when saving reflection fails and clears on edit", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(saveHomeworkReflectionFn).mockRejectedValueOnce(new Error("Save failed"));
    const { user } = renderWithProviders(
      <CurriculumHomeworkReflection pageSlug="level-1/homework" />,
    );

    // Act
    await user.type(screen.getByLabelText("Homework reflection"), "Working on recall");
    await user.click(screen.getByRole("button", { name: "Save reflection" }));

    // Assert error
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Save failed")).toBeDefined();

    // Act clear on edit
    await user.type(screen.getByLabelText("Homework reflection"), " daily");
    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });
});
