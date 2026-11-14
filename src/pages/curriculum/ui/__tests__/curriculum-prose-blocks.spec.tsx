import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import type { ProseBlock } from "@/shared/curriculum-data";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { CurriculumProseBlocks } from "../curriculum-prose-blocks";

const HEADING_LEVEL_TWO = 2;
const HEADING_LEVEL_THREE = 3;
const HEADING_LEVEL_FOUR = 4;

describe("curriculum prose blocks headings", () => {
  it("renders headings at levels 2, 3, and 4 with matching ids", () => {
    expect.assertions(3);

    // Arrange
    const blocks: ProseBlock[] = [
      { id: "section-two", level: HEADING_LEVEL_TWO, text: "Section Two", type: "heading" },
      { id: "section-three", level: HEADING_LEVEL_THREE, text: "Section Three", type: "heading" },
      { id: "section-four", level: HEADING_LEVEL_FOUR, text: "Section Four", type: "heading" },
    ];

    // Act
    renderWithProviders(<CurriculumProseBlocks blocks={blocks} />);
    const headingTwo = screen.getByRole("heading", {
      level: HEADING_LEVEL_TWO,
      name: "Section Two",
    });
    const headingThree = screen.getByRole("heading", {
      level: HEADING_LEVEL_THREE,
      name: "Section Three",
    });
    const headingFour = screen.getByRole("heading", {
      level: HEADING_LEVEL_FOUR,
      name: "Section Four",
    });

    // Assert
    expect(headingTwo.id).toBe("section-two");
    expect(headingThree.id).toBe("section-three");
    expect(headingFour.id).toBe("section-four");
  });
});

describe("curriculum prose blocks inline nodes", () => {
  it("renders text, strong, emphasis, and inline code nodes", () => {
    expect.assertions(4);

    // Arrange
    const blocks: ProseBlock[] = [
      {
        content: [
          { text: "Start ", type: "text" },
          { children: [{ text: "bold", type: "text" }], type: "strong" },
          { text: " and ", type: "text" },
          { children: [{ text: "italic", type: "text" }], type: "em" },
          { text: " with ", type: "text" },
          { text: "cue()", type: "code" },
        ],
        type: "paragraph",
      },
    ];

    // Act
    renderWithProviders(<CurriculumProseBlocks blocks={blocks} />);

    // Assert
    expect(screen.getByText(/Start/u)).toBeDefined();
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
    expect(screen.getByText("cue()").tagName).toBe("CODE");
  });

  it("renders internal links with step fragments and external links with security attributes", () => {
    expect.assertions(5);

    // Arrange
    const blocks: ProseBlock[] = [
      {
        content: [
          {
            children: [{ text: "Come Step 1", type: "text" }],
            external: false,
            href: "/levels/level-1/come#step-1",
            type: "link",
          },
          { text: " and ", type: "text" },
          {
            children: [{ text: "Dogwise", type: "text" }],
            external: true,
            href: "https://www.dogwise.com",
            type: "link",
          },
        ],
        type: "paragraph",
      },
    ];

    // Act
    renderWithProviders(<CurriculumProseBlocks blocks={blocks} />, {
      routePaths: ["/", "/levels/level-1/come"],
    });
    const internalLink = screen.getByRole("link", { name: "Come Step 1" });
    const externalLink = screen.getByRole("link", { name: "Dogwise" });

    // Assert
    expect(internalLink.getAttribute("href")).toBe("/levels/level-1/come#step-1");
    expect(internalLink.getAttribute("target")).toBeNull();
    expect(externalLink.getAttribute("href")).toBe("https://www.dogwise.com");
    expect(externalLink.getAttribute("target")).toBe("_blank");
    expect(externalLink.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

describe("curriculum prose blocks lists", () => {
  it("renders ordered decimal, lower-roman, and nested unordered lists", () => {
    expect.assertions(5);

    // Arrange
    const blocks: ProseBlock[] = [
      {
        items: [
          {
            children: [
              {
                items: [{ content: [{ text: "Nested bullet", type: "text" }] }],
                ordered: false,
                type: "list",
              },
            ],
            content: [{ text: "First decimal", type: "text" }],
          },
        ],
        ordered: true,
        style: "decimal",
        type: "list",
      },
      {
        items: [{ content: [{ text: "Roman item", type: "text" }] }],
        ordered: true,
        style: "lower-roman",
        type: "list",
      },
    ];

    // Act
    renderWithProviders(<CurriculumProseBlocks blocks={blocks} />);
    const orderedLists = screen.getAllByRole("list").filter((element) => element.tagName === "OL");

    // Assert
    expect(orderedLists).toHaveLength(2);
    expect(orderedLists[0]?.getAttribute("type")).toBeNull();
    expect(orderedLists[1]?.getAttribute("type")).toBe("i");
    expect(screen.getByText("Nested bullet")).toBeDefined();
    expect(screen.getByText("Roman item")).toBeDefined();
  });

  it("renders checked and unchecked checklist items as disabled read-only checkboxes", () => {
    expect.assertions(4);

    // Arrange
    const blocks: ProseBlock[] = [
      {
        items: [
          { checked: true, content: [{ text: "Completed item", type: "text" }] },
          { checked: false, content: [{ text: "Pending item", type: "text" }] },
        ],
        ordered: false,
        type: "list",
      },
    ];

    // Act
    renderWithProviders(<CurriculumProseBlocks blocks={blocks} />);
    const completedCheckbox = screen.getByRole("checkbox", {
      name: "Completed item",
    }) as HTMLInputElement;
    const pendingCheckbox = screen.getByRole("checkbox", {
      name: "Pending item",
    }) as HTMLInputElement;

    // Assert
    expect(completedCheckbox.checked).toBe(true);
    expect(completedCheckbox.disabled).toBe(true);
    expect(pendingCheckbox.checked).toBe(false);
    expect(pendingCheckbox.disabled).toBe(true);
  });
});

describe("curriculum prose blocks blockquotes and callouts", () => {
  it("renders blockquotes and note, tip, and warning callouts", () => {
    expect.assertions(5);

    // Arrange
    const blocks: ProseBlock[] = [
      {
        blocks: [{ content: [{ text: "Quoted guidance", type: "text" }], type: "paragraph" }],
        type: "blockquote",
      },
      {
        blocks: [{ content: [{ text: "Note body", type: "text" }], type: "paragraph" }],
        type: "callout",
        variant: "note",
      },
      {
        blocks: [{ content: [{ text: "Tip body", type: "text" }], type: "paragraph" }],
        title: [{ text: "Helpful Hint", type: "text" }],
        type: "callout",
        variant: "tip",
      },
      {
        blocks: [{ content: [{ text: "Warning body", type: "text" }], type: "paragraph" }],
        type: "callout",
        variant: "warning",
      },
    ];

    // Act
    renderWithProviders(<CurriculumProseBlocks blocks={blocks} />);

    // Assert
    expect(screen.getByRole("blockquote").textContent).toBe("Quoted guidance");
    expect(screen.getByText("Note")).toBeDefined();
    expect(screen.getByText("Helpful Hint")).toBeDefined();
    expect(screen.getByText("Warning")).toBeDefined();
    expect(screen.getByText("Warning body")).toBeDefined();
  });
});
