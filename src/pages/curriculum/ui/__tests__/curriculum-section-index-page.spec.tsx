import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import type { CurriculumSyllabus } from "@/shared/curriculum-data";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { curriculumSyllabusQueryOptions } from "../../api/curriculum-article-query-options";
import { CurriculumSectionIndexPage } from "../curriculum-section-index-page";

const TEST_SYLLABUS: CurriculumSyllabus = {
  sections: [
    {
      href: "/theory",
      pages: [
        {
          href: "/theory/01-foreword",
          kind: "theory",
          order: 0,
          pageSlug: "theory/01-foreword",
          sectionSlug: "theory",
          title: "Foreword",
        },
        {
          href: "/theory/02-welcome",
          kind: "theory",
          order: 1,
          pageSlug: "theory/02-welcome",
          sectionSlug: "theory",
          title: "Welcome! Come Into My Parlour...",
        },
      ],
      sectionSlug: "theory",
      title: "Theory",
    },
    {
      href: "/appendices",
      pages: [
        {
          href: "/appendices/appendix-a-leading-the-dance",
          kind: "appendix",
          order: 64,
          pageSlug: "appendices/appendix-a-leading-the-dance",
          sectionSlug: "appendices",
          title: "Appendix A: Leading the Dance",
        },
      ],
      sectionSlug: "appendices",
      title: "Appendices",
    },
  ],
  totalBehaviors: 0,
  totalPages: 3,
  totalSteps: 0,
};

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
    const emptySyllabus: CurriculumSyllabus = {
      sections: [],
      totalBehaviors: 0,
      totalPages: 0,
      totalSteps: 0,
    };
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
