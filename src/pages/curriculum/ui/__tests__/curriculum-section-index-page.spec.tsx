import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import type { CurriculumSyllabus } from "@/shared/curriculum-data";
import { TEST_SYLLABUS, createSyllabusFixture } from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { curriculumSyllabusQueryOptions } from "../../api/curriculum-article-query-options";
import { CurriculumSectionIndexPage } from "../curriculum-section-index-page";

function createSeededQueryClient(syllabus: CurriculumSyllabus = TEST_SYLLABUS): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(curriculumSyllabusQueryOptions().queryKey, syllabus);
  return queryClient;
}

describe("curriculum section index page", () => {
  it("renders the theory section heading, description, and ordered article links", () => {
    expect.assertions(4);

    // Arrange
    const queryClient = createSeededQueryClient();

    // Act
    renderWithProviders(<CurriculumSectionIndexPage sectionSlug="theory" />, {
      queryClient,
      routePaths: ["/", "/theory", "/theory/$page"],
    });
    const forewordLink = screen.getByRole("link", { name: "Foreword" });
    const welcomeLink = screen.getByRole("link", { name: "Welcome! Come Into My Parlour..." });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Theory" })).toBeDefined();
    expect(screen.getByText(/Foundational concepts/u)).toBeDefined();
    expect(forewordLink.getAttribute("href")).toBe("/theory/01-foreword");
    expect(welcomeLink.getAttribute("href")).toBe("/theory/02-welcome");
  });

  it("filters to the appendices section and excludes theory articles", () => {
    expect.assertions(3);

    // Arrange
    const queryClient = createSeededQueryClient();

    // Act
    renderWithProviders(<CurriculumSectionIndexPage sectionSlug="appendices" />, {
      queryClient,
      routePaths: ["/", "/appendices", "/appendices/$page"],
    });
    const appendixLink = screen.getByRole("link", { name: "Appendix A: Leading the Dance" });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Appendices" })).toBeDefined();
    expect(appendixLink.getAttribute("href")).toBe("/appendices/appendix-a-leading-the-dance");
    expect(screen.queryByRole("link", { name: "Foreword" })).toBeNull();
  });

  it("renders a fallback title and empty message when the section is absent", () => {
    expect.assertions(2);

    // Arrange
    const emptySyllabus = createSyllabusFixture({ sections: [], totalPages: 0 });
    const queryClient = createSeededQueryClient(emptySyllabus);

    // Act
    renderWithProviders(<CurriculumSectionIndexPage sectionSlug="theory" />, {
      queryClient,
      routePaths: ["/", "/theory"],
    });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Theory" })).toBeDefined();
    expect(screen.getByText("No articles available in this section.")).toBeDefined();
  });
});
