import { QueryClient } from "@tanstack/react-query";
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import type { CurriculumPage } from "@/shared/curriculum-data";
import {
  TEST_APPENDIX_PAGE,
  TEST_BEHAVIOR_PAGE,
  TEST_THEORY_PAGE,
  createProsePageFixture,
} from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import {
  curriculumPageQueryOptions,
  type ArticleSectionSlug,
} from "../../api/curriculum-query-options";
import { CurriculumArticlePage } from "../curriculum-article-page";

const TEST_THEORY_ARTICLE = createProsePageFixture({
  blocks: [
    { id: "getting-started", level: 2, text: "Getting Started", type: "heading" },
    {
      content: [
        { text: "Start with ", type: "text" },
        {
          children: [{ text: "Step 1 of Come", type: "text" }],
          external: false,
          href: "/levels/level-1/come#step-1",
          type: "link",
        },
      ],
      type: "paragraph",
    },
  ],
  href: "/theory/09-after-you-train",
  nextPage: {
    href: "/levels/level-1/00-overview",
    kind: "overview",
    pageSlug: "level-1/00-overview",
    sectionSlug: "level-1",
    title: "Level 1 Overview",
  },
  pageSlug: "theory/09-after-you-train",
  previousPage: {
    href: "/theory/08-solving-training-problems",
    kind: "theory",
    pageSlug: "theory/08-solving-training-problems",
    sectionSlug: "theory",
    title: "Solving Training Problems",
  },
  title: "After You Train",
});

const TEST_APPENDIX_ARTICLE = createProsePageFixture({
  ...TEST_APPENDIX_PAGE,
  blocks: [{ content: [{ text: "Appendix body copy.", type: "text" }], type: "paragraph" }],
  href: "/appendices/appendix-e-good-advice-from-a-friend",
  pageSlug: "appendices/appendix-e-good-advice-from-a-friend",
  title: "Advice from a Friend",
});

function createSeededQueryClient(
  sectionSlug: ArticleSectionSlug,
  page: string,
  data: CurriculumPage | null,
): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(curriculumPageQueryOptions(`${sectionSlug}/${page}`).queryKey, data);
  return queryClient;
}

describe("curriculum article page", () => {
  it("renders breadcrumb, heading, and prose content with internal links", () => {
    expect.assertions(4);

    // Arrange
    const queryClient = createSeededQueryClient(
      "theory",
      "09-after-you-train",
      TEST_THEORY_ARTICLE,
    );

    // Act
    renderWithProviders(<CurriculumArticlePage page="09-after-you-train" sectionSlug="theory" />, {
      queryClient,
      routePaths: [
        "/",
        "/theory",
        "/theory/$page",
        "/levels/level-1/00-overview",
        "/levels/level-1/come",
      ],
    });
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });

    // Assert
    expect(within(breadcrumb).getByRole("link", { name: "Theory" }).getAttribute("href")).toBe(
      "/theory",
    );
    expect(screen.getByRole("heading", { level: 1, name: "After You Train" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Getting Started" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Step 1 of Come" }).getAttribute("href")).toBe(
      "/levels/level-1/come#step-1",
    );
  });

  it("renders previous and next article links including level cross-section targets", () => {
    expect.assertions(2);

    // Arrange
    const queryClient = createSeededQueryClient(
      "theory",
      "09-after-you-train",
      TEST_THEORY_ARTICLE,
    );

    // Act
    renderWithProviders(<CurriculumArticlePage page="09-after-you-train" sectionSlug="theory" />, {
      queryClient,
      routePaths: [
        "/",
        "/theory",
        "/theory/$page",
        "/levels/level-1/00-overview",
        "/levels/level-1/come",
      ],
    });
    const footerNav = screen.getByRole("navigation", { name: "Article navigation" });

    // Assert
    expect(
      within(footerNav)
        .getByRole("link", { name: /Previous Solving Training Problems/u })
        .getAttribute("href"),
    ).toBe("/theory/08-solving-training-problems");
    expect(
      within(footerNav)
        .getByRole("link", { name: /Next Level 1 Overview/u })
        .getAttribute("href"),
    ).toBe("/levels/level-1/00-overview");
  });

  it("renders only the next link when previousPage is null", () => {
    expect.assertions(2);

    // Arrange
    const queryClient = createSeededQueryClient("theory", "01-foreword", {
      ...TEST_THEORY_ARTICLE,
      href: "/theory/01-foreword",
      pageSlug: "theory/01-foreword",
      previousPage: null,
      title: "Foreword",
    });

    // Act
    renderWithProviders(<CurriculumArticlePage page="01-foreword" sectionSlug="theory" />, {
      queryClient,
      routePaths: ["/", "/theory", "/theory/$page", "/levels/level-1/00-overview"],
    });
    const footerNav = screen.getByRole("navigation", { name: "Article navigation" });

    // Assert
    expect(within(footerNav).queryByRole("link", { name: /Previous/u })).toBeNull();
    expect(
      within(footerNav)
        .getByRole("link", { name: /Next Level 1 Overview/u })
        .getAttribute("href"),
    ).toBe("/levels/level-1/00-overview");
  });

  it("renders only the previous link when nextPage is null", () => {
    expect.assertions(2);

    // Arrange
    const queryClient = createSeededQueryClient(
      "appendices",
      "appendix-e-good-advice-from-a-friend",
      {
        ...TEST_APPENDIX_ARTICLE,
        previousPage: {
          href: "/appendices/appendix-d-list-of-resources",
          kind: "appendix",
          pageSlug: "appendices/appendix-d-list-of-resources",
          sectionSlug: "appendices",
          title: "Appendix D: List of Resources",
        },
      },
    );

    // Act
    renderWithProviders(
      <CurriculumArticlePage
        page="appendix-e-good-advice-from-a-friend"
        sectionSlug="appendices"
      />,
      {
        queryClient,
        routePaths: ["/", "/appendices", "/appendices/$page"],
      },
    );
    const footerNav = screen.getByRole("navigation", { name: "Article navigation" });

    // Assert
    expect(
      within(footerNav)
        .getByRole("link", { name: /Previous Appendix D: List of Resources/u })
        .getAttribute("href"),
    ).toBe("/appendices/appendix-d-list-of-resources");
    expect(within(footerNav).queryByRole("link", { name: /Next/u })).toBeNull();
  });

  it("renders an appendix article without footer navigation when previous and next are null", () => {
    expect.assertions(4);

    // Arrange
    const queryClient = createSeededQueryClient(
      "appendices",
      "appendix-e-good-advice-from-a-friend",
      TEST_APPENDIX_ARTICLE,
    );

    // Act
    renderWithProviders(
      <CurriculumArticlePage
        page="appendix-e-good-advice-from-a-friend"
        sectionSlug="appendices"
      />,
      {
        queryClient,
        routePaths: ["/", "/appendices", "/appendices/$page"],
      },
    );
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });

    // Assert
    expect(within(breadcrumb).getByRole("link", { name: "Appendices" }).getAttribute("href")).toBe(
      "/appendices",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Advice from a Friend" })).toBeDefined();
    expect(screen.getByText("Appendix body copy.")).toBeDefined();
    expect(screen.queryByRole("navigation", { name: "Article navigation" })).toBeNull();
  });

  it("hits the trimmed query cache entry when page param contains trailing whitespace", () => {
    expect.assertions(1);

    // Arrange
    const queryClient = createSeededQueryClient("theory", "01-foreword", TEST_THEORY_PAGE);

    // Act
    renderWithProviders(<CurriculumArticlePage page="01-foreword " sectionSlug="theory" />, {
      queryClient,
      routePaths: ["/", "/theory", "/theory/$page"],
    });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Foreword" })).toBeDefined();
  });

  it("renders not-found fallback when the cached article is null", () => {
    expect.assertions(3);

    // Arrange
    const queryClient = createSeededQueryClient("theory", "nonexistent", null);

    // Act
    renderWithProviders(<CurriculumArticlePage page="nonexistent" sectionSlug="theory" />, {
      queryClient,
      routePaths: ["/", "/theory", "/theory/$page"],
    });
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });

    // Assert
    expect(within(breadcrumb).getByRole("link", { name: "Theory" }).getAttribute("href")).toBe(
      "/theory",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Article Not Found" })).toBeDefined();
    expect(screen.getByText("The requested curriculum article could not be found.")).toBeDefined();
  });

  it("renders not-found fallback when the cached page is a behavior page", () => {
    expect.assertions(1);

    // Arrange
    const queryClient = createSeededQueryClient("theory", "zen", TEST_BEHAVIOR_PAGE);

    // Act
    renderWithProviders(<CurriculumArticlePage page="zen" sectionSlug="theory" />, {
      queryClient,
      routePaths: ["/", "/theory", "/theory/$page"],
    });

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Article Not Found" })).toBeDefined();
  });

  it("renders not-found fallback when the cached prose page belongs to another section", () => {
    expect.assertions(1);

    // Arrange
    const queryClient = createSeededQueryClient(
      "theory",
      "appendix-e-good-advice-from-a-friend",
      TEST_APPENDIX_ARTICLE,
    );

    // Act
    renderWithProviders(
      <CurriculumArticlePage page="appendix-e-good-advice-from-a-friend" sectionSlug="theory" />,
      {
        queryClient,
        routePaths: ["/", "/theory", "/theory/$page"],
      },
    );

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Article Not Found" })).toBeDefined();
  });
});
