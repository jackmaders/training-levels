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
  createSyllabusFixture,
} from "@test/vitest/fixtures/curriculum";

import {
  curriculumKeys,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  isMatchingProseArticle,
  loadCurriculumArticle,
  loadFirstLevelBehaviorParams,
  loadLevelPage,
  normalizeCurriculumPageSlug,
  stepProgressQueryOptions,
} from "../curriculum-query-options";
import {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
} from "../curriculum.functions";
import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../generalization-query-options";
import { getPageGeneralizationFn } from "../generalization.functions";

vi.mock(import("../curriculum.functions"));
vi.mock(import("../generalization.functions"));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("curriculum query options", () => {
  it("constructs hierarchical curriculum query keys", () => {
    expect.assertions(4);

    // Assert
    expect(curriculumKeys.all).toStrictEqual(["curriculum"]);
    expect(curriculumKeys.syllabus()).toStrictEqual(["curriculum", "syllabus"]);
    expect(curriculumKeys.page("level-1/zen")).toStrictEqual(["curriculum", "page", "level-1/zen"]);
    expect(curriculumKeys.stepProgress()).toStrictEqual(["curriculum", "step-progress"]);
  });

  it("normalizes valid and invalid curriculum page slugs", () => {
    expect.assertions(2);

    // Assert
    expect(normalizeCurriculumPageSlug("theory/01-foreword ")).toBe("theory/01-foreword");
    expect(normalizeCurriculumPageSlug("  ../bad  ")).toBe("../bad");
  });

  it("builds curriculumSyllabusQueryOptions and delegates to getCurriculumSyllabusFn", async () => {
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

  it("builds curriculumPageQueryOptions and delegates to getCurriculumPageFn", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_BEHAVIOR_PAGE);
    const options = curriculumPageQueryOptions("level-1/zen");

    // Act
    const result = await options.queryFn?.({} as never);

    // Assert
    expect(options.queryKey).toStrictEqual(["curriculum", "page", "level-1/zen"]);
    expect(getCurriculumPageFn).toHaveBeenCalledWith({ data: { pageSlug: "level-1/zen" } });
    expect(result).toStrictEqual(TEST_BEHAVIOR_PAGE);
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

  it("builds stepProgressQueryOptions and delegates to getStepProgressFn", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getStepProgressFn).mockResolvedValueOnce(["level-1/zen:step-1"]);
    const options = stepProgressQueryOptions();

    // Act
    const result = await options.queryFn?.({} as never);

    // Assert
    expect(options.queryKey).toStrictEqual(["curriculum", "step-progress"]);
    expect(getStepProgressFn).toHaveBeenCalledOnce();
    expect(result).toStrictEqual(["level-1/zen:step-1"]);
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

describe("level page loader", () => {
  it("loads syllabus, level page, step progress, and generalization data for valid params", async () => {
    expect.assertions(5);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumSyllabusFn).mockResolvedValueOnce(TEST_SYLLABUS);
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_BEHAVIOR_PAGE);
    vi.mocked(getStepProgressFn).mockResolvedValueOnce(["level-1/zen:step-1"]);
    vi.mocked(getPageGeneralizationFn).mockResolvedValueOnce(EMPTY_PAGE_GENERALIZATION);

    // Act
    const loadedPage = await loadLevelPage({
      page: "zen",
      queryClient,
      section: "level-1",
    });

    // Assert
    expect(loadedPage).toStrictEqual(TEST_BEHAVIOR_PAGE);
    expect(queryClient.getQueryData(curriculumSyllabusQueryOptions().queryKey)).toStrictEqual(
      TEST_SYLLABUS,
    );
    expect(
      queryClient.getQueryData(curriculumPageQueryOptions("level-1/zen").queryKey),
    ).toStrictEqual(TEST_BEHAVIOR_PAGE);
    expect(queryClient.getQueryData(stepProgressQueryOptions().queryKey)).toStrictEqual([
      "level-1/zen:step-1",
    ]);
    expect(
      queryClient.getQueryData(pageGeneralizationQueryOptions("level-1/zen").queryKey),
    ).toStrictEqual(EMPTY_PAGE_GENERALIZATION);
  });

  it("throws notFound without calling server functions when route params are invalid", async () => {
    expect.assertions(4);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const caught = await loadLevelPage({
      page: "01-foreword",
      queryClient,
      section: "theory",
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
    expect(getCurriculumSyllabusFn).not.toHaveBeenCalled();
    expect(getCurriculumPageFn).not.toHaveBeenCalled();
    expect(getPageGeneralizationFn).not.toHaveBeenCalled();
  });

  it("throws notFound before fetching generalization when level page query resolves to null", async () => {
    expect.assertions(2);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumSyllabusFn).mockResolvedValueOnce(TEST_SYLLABUS);
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(null);
    vi.mocked(getStepProgressFn).mockResolvedValueOnce([]);

    // Act
    const caught = await loadLevelPage({
      page: "nonexistent",
      queryClient,
      section: "level-1",
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
    expect(getPageGeneralizationFn).not.toHaveBeenCalled();
  });
});

describe("first level behavior params loader", () => {
  it("returns route params for the first behavior page in Level 1", async () => {
    expect.assertions(1);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumSyllabusFn).mockResolvedValueOnce(TEST_SYLLABUS);

    // Act
    const params = await loadFirstLevelBehaviorParams(queryClient);

    // Assert
    expect(params).toStrictEqual({ page: "zen", section: "level-1" });
  });

  it("throws notFound when syllabus contains no Level 1 section", async () => {
    expect.assertions(1);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumSyllabusFn).mockResolvedValueOnce(
      createSyllabusFixture({ sections: [] }),
    );

    // Act
    const caught = await loadFirstLevelBehaviorParams(queryClient).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
  });

  it("throws notFound when Level 1 contains no behavior pages", async () => {
    expect.assertions(1);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumSyllabusFn).mockResolvedValueOnce(
      createSyllabusFixture({
        sections: [
          {
            href: "/levels/level-1",
            levelNumber: 1,
            pages: [
              {
                href: "/levels/level-1/00-overview",
                kind: "overview",
                levelNumber: 1,
                order: 0,
                pageSlug: "level-1/00-overview",
                sectionSlug: "level-1",
                title: "Level 1 Overview",
              },
            ],
            sectionSlug: "level-1",
            title: "Level 1",
          },
        ],
      }),
    );

    // Act
    const caught = await loadFirstLevelBehaviorParams(queryClient).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
  });

  it("throws notFound when first Level 1 behavior slug is not a valid level route target", async () => {
    expect.assertions(1);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumSyllabusFn).mockResolvedValueOnce(
      createSyllabusFixture({
        sections: [
          {
            href: "/levels/level-1",
            levelNumber: 1,
            pages: [
              {
                href: "/theory/invalid",
                kind: "behavior",
                order: 0,
                pageSlug: "invalid/slug",
                sectionSlug: "level-1",
                title: "Invalid",
              },
            ],
            sectionSlug: "level-1",
            title: "Level 1",
          },
        ],
      }),
    );

    // Act
    const caught = await loadFirstLevelBehaviorParams(queryClient).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
  });
});
