import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { TEST_SYLLABUS, createSyllabusFixture } from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { CurriculumSidebar } from "../curriculum-sidebar";

const LEVEL_ROUTE_PATHS = ["/", "/levels/$section/$page"];

function renderSidebar({
  completedStepIds = [],
  currentPageSlug = "level-1/zen",
  currentSectionSlug = "level-1" as const,
  syllabus = TEST_SYLLABUS,
}: {
  completedStepIds?: readonly string[];
  currentPageSlug?: string;
  currentSectionSlug?: "level-1" | "level-2" | "level-3" | "level-4";
  syllabus?: typeof TEST_SYLLABUS;
} = {}) {
  return renderWithProviders(
    <CurriculumSidebar
      completedStepIds={new Set(completedStepIds)}
      currentPageSlug={currentPageSlug}
      currentSectionSlug={currentSectionSlug}
      syllabus={syllabus}
    />,
    {
      initialLocation: "/levels/level-1/zen",
      routePaths: LEVEL_ROUTE_PATHS,
    },
  );
}

function createSyllabusWithInvalidEntry() {
  const [, levelOne, levelTwo] = TEST_SYLLABUS.sections;
  if (levelOne === undefined || levelTwo === undefined) {
    throw new TypeError("Expected level-1 and level-2 sections in TEST_SYLLABUS");
  }

  return createSyllabusFixture({
    sections: [
      {
        ...levelOne,
        pages: [
          ...levelOne.pages,
          {
            href: "/theory/invalid",
            kind: "overview",
            order: 99,
            pageSlug: "invalid/slug",
            sectionSlug: "level-1",
            title: "Invalid Entry",
          },
        ],
      },
      levelTwo,
    ],
  });
}

describe("curriculum sidebar section hierarchy and progress", () => {
  it("renders only level sections with section completed/total counts", () => {
    expect.assertions(4);

    // Arrange & Act
    renderSidebar({
      completedStepIds: ["level-1/zen:step-1", "level-1/zen:step-2"],
    });
    const nav = screen.getByRole("complementary", { name: "Curriculum navigation" });

    // Assert
    expect(within(nav).getByRole("button", { name: "Level 1 2/10" })).toBeDefined();
    expect(within(nav).getByRole("button", { name: "Level 2 0/5" })).toBeDefined();
    expect(within(nav).queryByRole("button", { name: /Theory/u })).toBeNull();
    expect(within(nav).queryByRole("button", { name: /Appendices/u })).toBeNull();
  });

  it("shows check icon at 5/5, muted X/5 in progress, and no indicator at 0/5", () => {
    expect.assertions(5);

    // Arrange & Act
    renderSidebar({
      completedStepIds: [
        "level-1/zen:step-1",
        "level-1/zen:step-2",
        "level-1/zen:step-3",
        "level-1/zen:step-4",
        "level-1/zen:step-5",
        "level-1/come:step-1",
        "level-1/come:step-2",
      ],
    });
    const nav = screen.getByRole("complementary", { name: "Curriculum navigation" });
    const zenLink = within(nav).getByRole("link", { name: /Zen/u });
    const comeLink = within(nav).getByRole("link", { name: /Come/u });
    const overviewLink = within(nav).getByRole("link", { name: "Level 1 Overview" });

    // Assert
    expect(within(zenLink).getByLabelText("Completed")).toBeDefined();
    expect(within(comeLink).getByText("2/5")).toBeDefined();
    expect(zenLink.getAttribute("aria-current")).toBe("page");
    expect(within(overviewLink).queryByText(/\d+\/\d+/u)).toBeNull();
    expect(within(nav).queryByText("0/5", { selector: "a span" })).toBeNull();
  });

  it("renders no indicator on a behavior link when 0 of 5 steps are completed", () => {
    expect.assertions(1);

    // Arrange & Act
    renderSidebar({ completedStepIds: [] });
    const nav = screen.getByRole("complementary", { name: "Curriculum navigation" });
    const zenLink = within(nav).getByRole("link", { name: /Zen/u });

    // Assert
    expect(within(zenLink).queryByText("0/5")).toBeNull();
  });

  it("ignores syllabus entries with invalid level slugs and expands collapsed sections", async () => {
    expect.assertions(2);

    // Arrange
    const customSyllabus = createSyllabusWithInvalidEntry();
    const { user } = renderSidebar({ syllabus: customSyllabus });
    const nav = screen.getByRole("complementary", { name: "Curriculum navigation" });

    // Act
    await user.click(within(nav).getByRole("button", { name: "Level 2 0/5" }));

    // Assert
    expect(within(nav).queryByRole("link", { name: "Invalid Entry" })).toBeNull();
    expect(within(nav).getByRole("link", { name: "Level 2 Overview" }).getAttribute("href")).toBe(
      "/levels/level-2/00-overview",
    );
  });
});

describe("curriculum sidebar mobile drawer", () => {
  it("opens from the mobile trigger and closes when a level link is clicked", async () => {
    expect.hasAssertions();

    // Arrange
    const { user } = renderSidebar();

    // Act
    await user.click(screen.getByRole("button", { name: "Levels menu" }));
    const dialog = await screen.findByRole("dialog", { name: "Curriculum Levels" });
    const comeLink = within(dialog).getByRole("link", { name: "Come" });
    expect(comeLink.getAttribute("href")).toBe("/levels/level-1/come");

    await user.click(comeLink);

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
