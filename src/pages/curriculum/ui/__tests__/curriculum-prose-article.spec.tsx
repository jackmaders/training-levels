import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import {
  TEST_HOMEWORK_PAGE,
  TEST_OVERVIEW_PAGE,
  TEST_SYLLABUS,
  TEST_THEORY_PAGE,
} from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { EMPTY_PAGE_GENERALIZATION } from "../../api/generalization-query-options";
import { getPageGeneralizationFn } from "../../api/generalization.functions";
import { CurriculumProseArticle } from "../curriculum-prose-article";

vi.mock(import("../../api/generalization.functions"));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPageGeneralizationFn).mockResolvedValue(EMPTY_PAGE_GENERALIZATION);
});

describe("curriculum prose article", () => {
  it("renders readiness summary on overview page with default empty completedStepIds", () => {
    expect.assertions(3);

    // Arrange & Act
    renderWithProviders(
      <CurriculumProseArticle page={TEST_OVERVIEW_PAGE} syllabus={TEST_SYLLABUS} />,
    );

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Level 1 Overview" })).toBeDefined();
    expect(screen.getByText(/0 of 10 Behavior steps completed \(10 remaining\)\./u)).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Homework Reflection" })).toBeNull();
  });

  it("renders readiness summary and homework reflection on homework pages", () => {
    expect.assertions(3);

    // Arrange & Act
    renderWithProviders(
      <CurriculumProseArticle
        completedStepIds={new Set(["level-1/zen:step-1"])}
        page={TEST_HOMEWORK_PAGE}
        syllabus={TEST_SYLLABUS}
      />,
    );

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Level 1 Homework" })).toBeDefined();
    expect(screen.getByText(/1 of 10 Behavior steps completed \(9 remaining\)\./u)).toBeDefined();
    expect(screen.getByRole("heading", { name: "Homework Reflection" })).toBeDefined();
  });

  it("omits readiness and homework reflection on non-level prose pages", () => {
    expect.assertions(3);

    // Arrange & Act
    renderWithProviders(
      <CurriculumProseArticle page={TEST_THEORY_PAGE} syllabus={TEST_SYLLABUS} />,
    );

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Foreword" })).toBeDefined();
    expect(screen.queryByLabelText("Level advancement readiness")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Homework Reflection" })).toBeNull();
  });
});
