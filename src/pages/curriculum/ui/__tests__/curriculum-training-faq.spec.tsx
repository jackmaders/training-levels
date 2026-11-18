import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import {
  TEST_BEHAVIOR_PAGE,
  createBehaviorPageFixture,
  createProsePageFixture,
} from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { curriculumPageQueryOptions } from "../../api/curriculum-query-options";
import { GENERAL_FAQ_PAGE_SLUGS } from "../../model/training-faq";
import { TrainingFaq } from "../curriculum-training-faq";

function createFaqQueryClient(withGeneralEntries: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  });

  for (const pageSlug of GENERAL_FAQ_PAGE_SLUGS) {
    const page = withGeneralEntries
      ? createProsePageFixture({
          blocks: [
            {
              items: [
                {
                  checked: false,
                  content: [{ text: "Q: What if my dog is distracted?", type: "text" }],
                },
                {
                  checked: false,
                  content: [{ text: "A: Increase distance.", type: "text" }],
                },
              ],
              ordered: false,
              type: "list",
            },
          ],
          pageSlug,
          title: `FAQ ${pageSlug}`,
        })
      : null;

    queryClient.setQueryData(curriculumPageQueryOptions(pageSlug).queryKey, page);
  }

  return queryClient;
}

describe("curriculum training faq", () => {
  it("renders empty messages when neither behavior nor general pages have faq entries", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createFaqQueryClient(false);
    const page = createBehaviorPageFixture({
      steps: [],
      title: "Zen",
    });

    // Act
    renderWithProviders(<TrainingFaq page={page} />, {
      queryClient,
      routePaths: ["/"],
    });

    // Assert
    expect(
      screen.getByText(
        "The Level 1 Zen chapter has no Problem or Question notes. Use the Explanation for its full Step instructions.",
      ),
    ).toBeDefined();
    expect(screen.getByText("General answers are unavailable.")).toBeDefined();
  });

  it("renders behavior and general faq entries when available", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = createFaqQueryClient(true);
    const page = createBehaviorPageFixture({
      ...TEST_BEHAVIOR_PAGE,
      introBlocks: [
        {
          blocks: [
            {
              content: [{ text: "Wait for four paws on the floor.", type: "text" as const }],
              type: "paragraph" as const,
            },
          ],
          title: [{ text: "Problem: My dog jumps up.", type: "text" as const }],
          type: "callout" as const,
          variant: "note" as const,
        },
      ],
    });

    // Act
    renderWithProviders(<TrainingFaq page={page} />, {
      queryClient,
      routePaths: ["/"],
    });

    // Assert
    expect(screen.getByRole("heading", { name: "Level 1 Zen questions" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "General training questions" })).toBeDefined();
  });

  it("ignores behavior pages in general faq queries", () => {
    expect.hasAssertions();

    // Arrange
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    for (const pageSlug of GENERAL_FAQ_PAGE_SLUGS) {
      queryClient.setQueryData(
        curriculumPageQueryOptions(pageSlug).queryKey,
        createBehaviorPageFixture({ pageSlug, title: "Ignored Behavior" }),
      );
    }

    // Act
    renderWithProviders(
      <TrainingFaq
        page={createBehaviorPageFixture({
          steps: [],
          title: "Zen",
        })}
      />,
      {
        queryClient,
        routePaths: ["/"],
      },
    );

    // Assert
    expect(screen.getByText("General answers are unavailable.")).toBeDefined();
  });
});
