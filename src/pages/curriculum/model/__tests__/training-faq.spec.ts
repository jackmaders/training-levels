import { describe, expect, it } from "vite-plus/test";

import type { CalloutBlock } from "@/shared/curriculum-data";
import {
  createBehaviorPageFixture,
  createBehaviorStepFixture,
  createProsePageFixture,
} from "@test/vitest/fixtures/curriculum";

import { getBehaviorFaq, getGeneralFaq } from "../training-faq";

function createCallout(title: string, answer: string): CalloutBlock {
  return {
    blocks: [{ content: [{ text: answer, type: "text" }], type: "paragraph" }],
    title: [{ text: title, type: "text" }],
    type: "callout",
    variant: "note",
  };
}

describe("behavior-specific FAQ", () => {
  it("collects source Problem and Question notes with their Step reference", () => {
    expect.hasAssertions();
    // Arrange
    const page = createBehaviorPageFixture({
      steps: [
        createBehaviorStepFixture({
          instructions: [
            createCallout("Problem: When I drop the treat, she can't find it", "Use harder food."),
            createCallout("Training Tip", "Hold your hand still."),
          ],
        }),
        createBehaviorStepFixture({
          anchor: "step-2",
          comeafters: [createCallout("Question: Should I accept sitting?", "Look at her nose.")],
          stepNumber: 2,
        }),
      ],
    });

    // Act
    const faq = getBehaviorFaq(page);

    // Assert
    expect(faq).toStrictEqual([
      {
        answer: [{ content: [{ text: "Use harder food.", type: "text" }], type: "paragraph" }],
        question: "When I drop the treat, she can't find it",
        source: { href: "/levels/level-1/zen#step-1", label: "Level 1 Zen, Step 1" },
      },
      {
        answer: [{ content: [{ text: "Look at her nose.", type: "text" }], type: "paragraph" }],
        question: "Should I accept sitting?",
        source: { href: "/levels/level-1/zen#step-2", label: "Level 1 Zen, Step 2" },
      },
    ]);
  });

  it("returns no answers when the Behavior source has no Problem or Question notes", () => {
    expect.hasAssertions();
    // Arrange
    const page = createBehaviorPageFixture();

    // Act
    const faq = getBehaviorFaq(page);

    // Assert
    expect(faq).toStrictEqual([]);
  });
});

describe("general training FAQ", () => {
  it("uses theory Question notes and each troubleshooting topic with its section reference", () => {
    expect.hasAssertions();
    // Arrange
    const thinkingPage = createProsePageFixture({
      blocks: [
        { id: "in-the-game", level: 2, text: "In The Game", type: "heading" },
        {
          blocks: [
            { content: [{ text: "What made the difference?", type: "text" }], type: "paragraph" },
            {
              content: [{ text: "The dog must be In The Game.", type: "text" }],
              type: "paragraph",
            },
          ],
          title: [{ text: "Question", type: "text" }],
          type: "callout",
          variant: "note",
        },
      ],
      href: "/theory/07-the-thinking-of-training",
      pageSlug: "theory/07-the-thinking-of-training",
      title: "The Thinking of Training",
    });
    const problemsPage = createProsePageFixture({
      blocks: [
        { id: "solving-by-thinking", level: 2, text: "Solving by Thinking", type: "heading" },
        { content: [{ text: "Sleep on it.", type: "text" }], type: "paragraph" },
        { id: "think-about-lumping", level: 3, text: "Think About Lumping", type: "heading" },
        { content: [{ text: "Back up.", type: "text" }], type: "paragraph" },
      ],
      href: "/theory/08-solving-training-problems",
      pageSlug: "theory/08-solving-training-problems",
      title: "Solving Training Problems",
    });

    // Act
    const faq = getGeneralFaq([thinkingPage, problemsPage]);

    // Assert
    expect(faq).toStrictEqual([
      {
        answer: [
          { content: [{ text: "The dog must be In The Game.", type: "text" }], type: "paragraph" },
        ],
        question: "What made the difference?",
        source: {
          href: "/theory/07-the-thinking-of-training#in-the-game",
          label: "The Thinking of Training",
        },
      },
      {
        answer: [{ content: [{ text: "Back up.", type: "text" }], type: "paragraph" }],
        question: "Think About Lumping",
        source: {
          href: "/theory/08-solving-training-problems#think-about-lumping",
          label: "Solving Training Problems",
        },
      },
    ]);
  });
});
