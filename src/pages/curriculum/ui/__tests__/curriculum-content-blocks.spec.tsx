import { screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vite-plus/test";

import type { ProseBlock } from "@/shared/curriculum-data";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { CurriculumContentBlocks } from "../curriculum-content-blocks";

const LEVEL_ROUTE_PATHS = ["/", "/levels/$section/$page", "/theory/$page", "/appendices/$page"];
const HEADING_LEVEL_TWO = 2;
const HEADING_LEVEL_THREE = 3;
const HEADING_LEVEL_FOUR = 4;

function renderBlocks(
  blocks: readonly ProseBlock[],
  props: Omit<ComponentProps<typeof CurriculumContentBlocks>, "blocks"> = {},
) {
  return renderWithProviders(<CurriculumContentBlocks blocks={blocks} {...props} />, {
    routePaths: LEVEL_ROUTE_PATHS,
  });
}

describe("curriculum content blocks headings and paragraphs", () => {
  it("renders headings at levels 2, 3, and 4 with matching IDs and forwards div props", () => {
    expect.assertions(5);

    // Arrange & Act
    renderBlocks(
      [
        { id: "overview-h2", level: HEADING_LEVEL_TWO, text: "Overview Section", type: "heading" },
        {
          id: "details-h3",
          level: HEADING_LEVEL_THREE,
          text: "Detail Subsection",
          type: "heading",
        },
        { id: "notes-h4", level: HEADING_LEVEL_FOUR, text: "Fine Notes", type: "heading" },
      ],
      { "aria-label": "Curriculum article blocks", className: "custom-prose" },
    );
    const wrapper = screen.getByLabelText("Curriculum article blocks");
    const headingTwo = screen.getByRole("heading", {
      level: HEADING_LEVEL_TWO,
      name: "Overview Section",
    });

    // Assert
    expect(wrapper.className).toContain("custom-prose");
    expect(headingTwo.id).toBe("overview-h2");
    expect(headingTwo.className).toContain("first:mt-0");
    expect(
      screen.getByRole("heading", { level: HEADING_LEVEL_THREE, name: "Detail Subsection" }).id,
    ).toBe("details-h3");
    expect(screen.getByRole("heading", { level: HEADING_LEVEL_FOUR, name: "Fine Notes" }).id).toBe(
      "notes-h4",
    );
  });

  it("renders inline text, bold, italic, and code nodes in paragraphs", () => {
    expect.assertions(4);

    // Arrange & Act
    renderBlocks([
      {
        content: [
          { text: "Start ", type: "text" },
          { children: [{ text: "bold term", type: "text" }], type: "strong" },
          { text: " and ", type: "text" },
          { children: [{ text: "italic phrase", type: "text" }], type: "em" },
          { text: " with ", type: "text" },
          { text: "level-1/zen", type: "code" },
        ],
        type: "paragraph",
      },
    ]);

    // Assert
    expect(screen.getByText(/Start/u)).toBeDefined();
    expect(screen.getByText("bold term").tagName).toBe("STRONG");
    expect(screen.getByText("italic phrase").tagName).toBe("EM");
    expect(screen.getByText("level-1/zen").tagName).toBe("CODE");
  });
});

describe("curriculum content blocks links", () => {
  it("renders internal level, theory, and appendix links with and without hashes", () => {
    expect.assertions(5);

    // Arrange & Act
    renderBlocks([
      {
        content: [
          {
            children: [{ text: "Zen behavior", type: "text" }],
            external: false,
            href: "/levels/level-1/zen",
            type: "link",
          },
          {
            children: [{ text: "Come step 1", type: "text" }],
            external: false,
            href: "/levels/level-1/come#step-1",
            type: "link",
          },
          {
            children: [{ text: "Thinking of Training", type: "text" }],
            external: false,
            href: "/theory/07-the-thinking-of-training",
            type: "link",
          },
          {
            children: [{ text: "Leading the Dance", type: "text" }],
            external: false,
            href: "/appendices/appendix-a-leading-the-dance",
            type: "link",
          },
        ],
        type: "paragraph",
      },
    ]);

    // Assert
    const comeLink = screen.getByRole("link", { name: "Come step 1" });
    expect(screen.getByRole("link", { name: "Zen behavior" }).getAttribute("href")).toBe(
      "/levels/level-1/zen",
    );
    expect(comeLink.getAttribute("href")).toBe("/levels/level-1/come#step-1");
    expect(comeLink.getAttribute("target")).toBeNull();
    expect(screen.getByRole("link", { name: "Thinking of Training" }).getAttribute("href")).toBe(
      "/theory/07-the-thinking-of-training",
    );
    expect(screen.getByRole("link", { name: "Leading the Dance" }).getAttribute("href")).toBe(
      "/appendices/appendix-a-leading-the-dance",
    );
  });

  it("renders external links with target and rel attributes", () => {
    expect.assertions(3);

    // Arrange & Act
    renderBlocks([
      {
        content: [
          {
            children: [{ text: "External Guide", type: "text" }],
            external: true,
            href: "https://example.com/guide",
            type: "link",
          },
        ],
        type: "paragraph",
      },
    ]);

    // Assert
    const externalLink = screen.getByRole("link", { name: "External Guide" });
    expect(externalLink.getAttribute("href")).toBe("https://example.com/guide");
    expect(externalLink.getAttribute("target")).toBe("_blank");
    expect(externalLink.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

describe("curriculum content blocks lists, blockquotes, and callouts", () => {
  it("renders unordered and nested lists", () => {
    expect.assertions(2);

    // Arrange & Act
    renderBlocks([
      {
        items: [
          {
            children: [
              {
                items: [{ content: [{ text: "Nested item", type: "text" }] }],
                ordered: false,
                type: "list",
              },
            ],
            content: [{ text: "Bullet item", type: "text" }],
          },
        ],
        ordered: false,
        type: "list",
      },
    ]);

    // Assert
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(screen.getByText("Nested item")).toBeDefined();
  });

  it("renders decimal and lower-roman ordered lists", () => {
    expect.assertions(5);

    // Arrange & Act
    renderBlocks([
      {
        items: [{ content: [{ text: "Roman item", type: "text" }] }],
        ordered: true,
        style: "lower-roman",
        type: "list",
      },
      {
        items: [{ content: [{ text: "Decimal item", type: "text" }] }],
        ordered: true,
        style: "decimal",
        type: "list",
      },
    ]);

    // Assert
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(lists[0]?.style.listStyleType).toBe("lower-roman");
    expect(lists[0]?.getAttribute("type")).toBe("i");
    expect(lists[1]?.className).toContain("list-decimal");
    expect(lists[1]?.getAttribute("type")).toBeNull();
  });

  it("renders static read-only checklist items with aria state", () => {
    expect.assertions(5);

    // Arrange & Act
    renderBlocks([
      {
        items: [
          {
            checked: true,
            content: [{ text: "Completed item", type: "text" }],
          },
          {
            checked: false,
            content: [{ text: "Pending item", type: "text" }],
          },
        ],
        ordered: false,
        type: "list",
      },
    ]);

    // Assert
    const checkboxes = screen.getAllByRole("checkbox");
    const completedCheckbox = screen.getByRole("checkbox", { name: "Completed item" });
    const pendingCheckbox = screen.getByRole("checkbox", { name: "Pending item" });
    expect(checkboxes).toHaveLength(2);
    expect(completedCheckbox.getAttribute("aria-checked")).toBe("true");
    expect(completedCheckbox.getAttribute("aria-disabled")).toBe("true");
    expect(pendingCheckbox.getAttribute("aria-checked")).toBe("false");
    expect(pendingCheckbox.getAttribute("aria-disabled")).toBe("true");
  });

  it("renders nested child lists inside checklist items", () => {
    expect.assertions(2);

    // Arrange & Act
    renderBlocks([
      {
        items: [
          {
            checked: true,
            children: [
              {
                items: [{ content: [{ text: "Sub-task detail", type: "text" }] }],
                ordered: false,
                type: "list",
              },
            ],
            content: [{ text: "Completed item", type: "text" }],
          },
        ],
        ordered: false,
        type: "list",
      },
    ]);

    // Assert
    expect(screen.getByRole("checkbox", { name: "Completed item" })).toBeDefined();
    expect(screen.getByText("Sub-task detail")).toBeDefined();
  });

  it("renders blockquotes", () => {
    expect.assertions(1);

    // Arrange & Act
    renderBlocks([
      {
        blocks: [{ content: [{ text: "Quoted advice", type: "text" }], type: "paragraph" }],
        type: "blockquote",
      },
    ]);

    // Assert
    expect(screen.getByRole("blockquote").textContent).toBe("Quoted advice");
  });

  it("renders note, tip, and warning callout content", () => {
    expect.assertions(3);

    // Arrange & Act
    renderBlocks([
      {
        blocks: [{ content: [{ text: "Untitled note text", type: "text" }], type: "paragraph" }],
        type: "callout",
        variant: "note",
      },
      {
        blocks: [{ content: [{ text: "Tip body text", type: "text" }], type: "paragraph" }],
        title: [{ text: "Training Tip", type: "text" }],
        type: "callout",
        variant: "tip",
      },
      {
        blocks: [{ content: [{ text: "Warning body text", type: "text" }], type: "paragraph" }],
        type: "callout",
        variant: "warning",
      },
    ]);

    // Assert
    expect(screen.getByText("Untitled note text")).toBeDefined();
    expect(screen.getByText("Training Tip")).toBeDefined();
    expect(screen.getByText("Warning body text")).toBeDefined();
  });

  it("omits synthetic labels and role=alert on callouts", () => {
    expect.assertions(3);

    // Arrange & Act
    renderBlocks([
      {
        blocks: [{ content: [{ text: "Untitled note text", type: "text" }], type: "paragraph" }],
        type: "callout",
        variant: "note",
      },
      {
        blocks: [{ content: [{ text: "Tip body text", type: "text" }], type: "paragraph" }],
        title: [{ text: "Training Tip", type: "text" }],
        type: "callout",
        variant: "tip",
      },
      {
        blocks: [{ content: [{ text: "Warning body text", type: "text" }], type: "paragraph" }],
        type: "callout",
        variant: "warning",
      },
    ]);

    // Assert
    expect(screen.queryByText("Note")).toBeNull();
    expect(screen.queryByText("Warning")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
