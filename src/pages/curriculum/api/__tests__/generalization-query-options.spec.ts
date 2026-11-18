import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import {
  EMPTY_PAGE_GENERALIZATION,
  generalizationKeys,
  pageGeneralizationQueryOptions,
} from "../generalization-query-options";
import { getPageGeneralizationFn } from "../generalization.functions";

vi.mock(import("../generalization.functions"));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generalization query options", () => {
  it("constructs hierarchical generalization query keys", () => {
    expect.assertions(2);

    // Assert
    expect(generalizationKeys.all).toStrictEqual(["curriculum", "generalization"]);
    expect(generalizationKeys.page("level-1/zen")).toStrictEqual([
      "curriculum",
      "generalization",
      "level-1/zen",
    ]);
  });

  it("normalizes pageSlug and delegates to getPageGeneralizationFn", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getPageGeneralizationFn).mockResolvedValueOnce(EMPTY_PAGE_GENERALIZATION);
    const options = pageGeneralizationQueryOptions("  level-1/zen  ");

    // Act
    const result = await options.queryFn?.({} as never);

    // Assert
    expect(options.queryKey).toStrictEqual(["curriculum", "generalization", "level-1/zen"]);
    expect(getPageGeneralizationFn).toHaveBeenCalledWith({ data: { pageSlug: "level-1/zen" } });
    expect(result).toStrictEqual(EMPTY_PAGE_GENERALIZATION);
  });

  it("falls back to trimmed pageSlug when schema validation fails", () => {
    expect.assertions(1);

    // Act
    const options = pageGeneralizationQueryOptions("   ");

    // Assert
    expect(options.queryKey).toStrictEqual(["curriculum", "generalization", ""]);
  });
});
