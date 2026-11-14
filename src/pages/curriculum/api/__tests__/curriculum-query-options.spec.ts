import { describe, expect, it, vi } from "vite-plus/test";

import { TEST_BEHAVIOR_PAGE, TEST_SYLLABUS } from "@test/vitest/fixtures/curriculum";

import {
  curriculumKeys,
  curriculumPageQueryOptions,
  curriculumSyllabusQueryOptions,
  stepProgressQueryOptions,
} from "../curriculum-query-options";
import {
  getCurriculumPageFn,
  getCurriculumSyllabusFn,
  getStepProgressFn,
} from "../curriculum.functions";

vi.mock(import("../curriculum.functions"));

describe("curriculum query options", () => {
  it("constructs hierarchical curriculum query keys", () => {
    expect.assertions(4);

    expect(curriculumKeys.all).toStrictEqual(["curriculum"]);
    expect(curriculumKeys.syllabus()).toStrictEqual(["curriculum", "syllabus"]);
    expect(curriculumKeys.page("level-1/zen")).toStrictEqual(["curriculum", "page", "level-1/zen"]);
    expect(curriculumKeys.stepProgress()).toStrictEqual(["curriculum", "step-progress"]);
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
