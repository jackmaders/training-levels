import { QueryClient } from "@tanstack/react-query";
import { isNotFound } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type {
  BehaviorCurriculumPage,
  CurriculumSyllabus,
  ProseCurriculumPage,
} from "@/shared/curriculum-data";

import {
  curriculumArticleKeys,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  loadCurriculumArticle,
} from "../curriculum-article-query-options";
import { getCurriculumPageFn, getCurriculumSyllabusFn } from "../curriculum.functions";

vi.mock(import("../curriculum.functions"));

const TEST_SYLLABUS: CurriculumSyllabus = {
  sections: [
    {
      href: "/theory",
      pages: [
        {
          href: "/theory/01-foreword",
          kind: "theory",
          order: 1,
          pageSlug: "theory/01-foreword",
          sectionSlug: "theory",
          title: "Foreword",
        },
      ],
      sectionSlug: "theory",
      title: "Theory",
    },
  ],
  totalBehaviors: 0,
  totalPages: 1,
  totalSteps: 0,
};

const TEST_THEORY_PAGE: ProseCurriculumPage = {
  blocks: [{ content: [{ text: "Welcome", type: "text" }], type: "paragraph" }],
  href: "/theory/01-foreword",
  kind: "theory",
  nextPage: null,
  pageSlug: "theory/01-foreword",
  previousPage: null,
  sectionSlug: "theory",
  title: "Foreword",
};

const TEST_APPENDIX_PAGE: ProseCurriculumPage = {
  blocks: [{ content: [{ text: "Appendix text", type: "text" }], type: "paragraph" }],
  href: "/appendices/appendix-a-leading-the-dance",
  kind: "appendix",
  nextPage: null,
  pageSlug: "appendices/appendix-a-leading-the-dance",
  previousPage: null,
  sectionSlug: "appendices",
  title: "Leading the Dance",
};

const TEST_BEHAVIOR_PAGE: BehaviorCurriculumPage = {
  aboutTheCues: null,
  behaviorFamily: "zen",
  comebefores: [],
  equipment: [],
  href: "/levels/level-1/zen",
  introBlocks: [],
  kind: "behavior",
  levelNumber: 1,
  nextPage: null,
  pageSlug: "level-1/zen",
  previousPage: null,
  sectionSlug: "level-1",
  steps: [],
  stepsIntroBlocks: [],
  thinkAbout: [],
  title: "Level 1: Zen",
  whereWeAreGoing: { extraBlocks: [], steps: [] },
};

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

  it("builds curriculumPageQueryOptions delegating to getCurriculumPageFn with pageSlug", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_THEORY_PAGE);
    const options = curriculumPageQueryOptions("theory/01-foreword");

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

  it("throws notFound when returned page is a behavior page instead of prose", async () => {
    expect.assertions(1);

    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getCurriculumPageFn).mockResolvedValueOnce(TEST_BEHAVIOR_PAGE);

    // Act
    const caught = await loadCurriculumArticle({
      page: "zen",
      queryClient,
      sectionSlug: "appendices",
    }).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(caught)).toBe(true);
  });
});
