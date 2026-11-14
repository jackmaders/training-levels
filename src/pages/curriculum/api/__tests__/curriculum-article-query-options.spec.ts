import { QueryClient } from "@tanstack/react-query";
import { isNotFound } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { BehaviorCurriculumPage, CurriculumPage } from "@/shared/curriculum-data";
import {
  TEST_APPENDIX_PAGE,
  TEST_BEHAVIOR_PAGE,
  TEST_SYLLABUS,
  TEST_THEORY_PAGE,
  createBehaviorPageFixture,
} from "@test/vitest/fixtures/curriculum";

import {
  curriculumArticleKeys,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  isMatchingProseArticle,
  loadCurriculumArticle,
  normalizeCurriculumPageSlug,
} from "../curriculum-article-query-options";
import { getCurriculumPageFn, getCurriculumSyllabusFn } from "../curriculum.functions";

vi.mock(import("../curriculum.functions"));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("curriculum article query keys and options", () => {
  it("constructs hierarchical query keys for syllabus and pages", () => {
    expect.assertions(3);

    // Assert
    expect(curriculumArticleKeys.all).toStrictEqual(["curriculum"]);
    expect(curriculumArticleKeys.syllabus()).toStrictEqual(["curriculum", "syllabus"]);
    expect(curriculumArticleKeys.page("theory/01-foreword")).toStrictEqual([
      "curriculum",
      "page",
      "theory/01-foreword",
    ]);
  });

  it("normalizes valid and invalid curriculum page slugs", () => {
    expect.assertions(2);

    // Assert
    expect(normalizeCurriculumPageSlug("theory/01-foreword ")).toBe("theory/01-foreword");
    expect(normalizeCurriculumPageSlug("  ../bad  ")).toBe("../bad");
  });

  it("builds curriculumSyllabusQueryOptions delegating to getCurriculumSyllabusFn", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getCurriculumSyllabusFn).mockResolvedValueOnce(TEST_SYLLABUS);
    const options = curriculumSyllabusQueryOptions();

    // Act
    const result = await options.queryFn?.({} as never);

    // Assert
    expect(options.queryKey).toStrictEqual(["curriculum", "syllabus"]);
    expect(getCurriculumSyllabusFn).toHaveBeenCalledOnce();
    expect(result).toStrictEqual(TEST_SYLLABUS);
  });

  it("builds curriculumPageQueryOptions with normalized query key and trimmed pageSlug", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_THEORY_PAGE);
    const options = curriculumPageQueryOptions("theory/01-foreword ");

    // Act
    const result = await options.queryFn?.({} as never);

    // Assert
    expect(options.queryKey).toStrictEqual(["curriculum", "page", "theory/01-foreword"]);
    expect(getCurriculumPageFn).toHaveBeenCalledWith({
      data: { pageSlug: "theory/01-foreword" },
    });
    expect(result).toStrictEqual(TEST_THEORY_PAGE);
  });
});

describe("isMatchingProseArticle guard", () => {
  it("accepts a matching prose curriculum page and rejects null or mismatched pages", () => {
    expect.assertions(4);

    // Assert
    expect(isMatchingProseArticle(TEST_THEORY_PAGE, "theory")).toBe(true);
    expect(isMatchingProseArticle(null, "theory")).toBe(false);
    expect(isMatchingProseArticle(TEST_APPENDIX_PAGE, "theory")).toBe(false);
    expect(isMatchingProseArticle(TEST_BEHAVIOR_PAGE, "level-1")).toBe(false);
  });
});

describe("curriculum article loader", () => {
  it("loads and returns a matching prose curriculum article", async () => {
    expect.assertions(2);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_THEORY_PAGE);

    // Act
    const page = await loadCurriculumArticle({
      page: "01-foreword",
      queryClient,
      sectionSlug: "theory",
    });

    // Assert
    expect(page).toStrictEqual(TEST_THEORY_PAGE);
    expect(getCurriculumPageFn).toHaveBeenCalledWith({
      data: { pageSlug: "theory/01-foreword" },
    });
  });

  it("populates the same normalized query key for trailing whitespace slugs", async () => {
    expect.assertions(2);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_THEORY_PAGE);

    // Act
    await loadCurriculumArticle({
      page: "01-foreword ",
      queryClient,
      sectionSlug: "theory",
    });
    const componentOptions = curriculumPageQueryOptions("theory/01-foreword ");

    // Assert
    expect(componentOptions.queryKey).toStrictEqual(["curriculum", "page", "theory/01-foreword"]);
    expect(queryClient.getQueryData(componentOptions.queryKey)).toStrictEqual(TEST_THEORY_PAGE);
  });

  it("throws notFound without calling server function when page param fails slug validation", async () => {
    expect.assertions(3);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const caught = await loadCurriculumArticle({
      page: "../invalid",
      queryClient,
      sectionSlug: "theory",
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
    expect(caught).toBeInstanceOf(Error);
    expect(getCurriculumPageFn).not.toHaveBeenCalled();
  });

  it("throws notFound when curriculum page lookup returns null", async () => {
    expect.assertions(2);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(null);

    // Act
    const caught = await loadCurriculumArticle({
      page: "nonexistent",
      queryClient,
      sectionSlug: "theory",
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
    expect(getCurriculumPageFn).toHaveBeenCalledWith({
      data: { pageSlug: "theory/nonexistent" },
    });
  });

  it("throws notFound when returned page belongs to a different section", async () => {
    expect.assertions(1);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_APPENDIX_PAGE);

    // Act
    const caught = await loadCurriculumArticle({
      page: "appendix-a-leading-the-dance",
      queryClient,
      sectionSlug: "theory",
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
  });

  it("throws notFound when returned page is a behavior page matching the requested sectionSlug", async () => {
    expect.assertions(1);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const behaviorWithMatchingSection = createBehaviorPageFixture({
      pageSlug: "theory/zen",
      sectionSlug: "theory" as unknown as BehaviorCurriculumPage["sectionSlug"],
    }) as unknown as CurriculumPage;
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(behaviorWithMatchingSection);

    // Act
    const caught = await loadCurriculumArticle({
      page: "zen",
      queryClient,
      sectionSlug: "theory",
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
  });
});
