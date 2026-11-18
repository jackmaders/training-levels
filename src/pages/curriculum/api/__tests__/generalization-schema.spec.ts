import { describe, expect, it } from "vite-plus/test";

import {
  MAX_COMEAFTER_NOTE_LENGTH,
  MAX_HOMEWORK_REFLECTION_LENGTH,
  getPageGeneralizationInputSchema,
  saveComeafterInputSchema,
  saveHomeworkInputSchema,
} from "../generalization-schema";

describe("generalization-schema", () => {
  describe("get page generalization input schema", () => {
    it("trims and accepts valid curriculum page slugs", () => {
      expect.assertions(1);

      // Act
      const result = getPageGeneralizationInputSchema.parse({ pageSlug: "  level-1/zen  " });

      // Assert
      expect(result).toStrictEqual({ pageSlug: "level-1/zen" });
    });

    it.each(["", "   ", "../bad", "level-5/zen", "level-1/"])(
      "rejects invalid page slug %s",
      (pageSlug) => {
        expect.assertions(1);

        // Act
        const result = getPageGeneralizationInputSchema.safeParse({ pageSlug });

        // Assert
        expect(result.success).toBe(false);
      },
    );
  });

  describe("save comeafter input schema", () => {
    it("trims note and stepId and accepts empty notes", () => {
      expect.assertions(1);

      // Act
      const result = saveComeafterInputSchema.parse({
        note: "   ",
        status: "practicing",
        stepId: "  level-1/zen:step-1  ",
      });

      // Assert
      expect(result).toStrictEqual({
        note: "",
        status: "practicing",
        stepId: "level-1/zen:step-1",
      });
    });

    it("rejects invalid status, blank stepId, or overlong notes", () => {
      expect.assertions(3);

      // Act & Assert
      expect(
        saveComeafterInputSchema.safeParse({
          note: "Standing up",
          status: "skipped",
          stepId: "level-1/zen:step-1",
        }).success,
      ).toBe(false);
      expect(
        saveComeafterInputSchema.safeParse({
          note: "Standing up",
          status: "completed",
          stepId: "   ",
        }).success,
      ).toBe(false);
      expect(
        saveComeafterInputSchema.safeParse({
          note: "x".repeat(MAX_COMEAFTER_NOTE_LENGTH + 1),
          status: "completed",
          stepId: "level-1/zen:step-1",
        }).success,
      ).toBe(false);
    });
  });

  describe("save homework input schema", () => {
    it.each(["level-1/homework", "level-2/homework", "level-3/homework", "level-4/homework"])(
      "accepts homework page slug %s with trimmed reflection",
      (pageSlug) => {
        expect.assertions(1);

        // Act
        const result = saveHomeworkInputSchema.parse({
          pageSlug: ` ${pageSlug} `,
          reflection: "  Practiced in the kitchen before dinner.  ",
        });

        // Assert
        expect(result).toStrictEqual({
          pageSlug,
          reflection: "Practiced in the kitchen before dinner.",
        });
      },
    );

    it.each([
      "level-1/zen",
      "level-5/homework",
      "theory/01-foreword",
      "appendices/appendix-a-leading-the-dance",
    ])("rejects non-homework page slug %s", (pageSlug) => {
      expect.assertions(1);

      // Act
      const result = saveHomeworkInputSchema.safeParse({
        pageSlug,
        reflection: "Daily practice reflection.",
      });

      // Assert
      expect(result.success).toBe(false);
    });

    it("rejects blank or overlong reflections", () => {
      expect.assertions(2);

      // Act & Assert
      expect(
        saveHomeworkInputSchema.safeParse({
          pageSlug: "level-1/homework",
          reflection: "   ",
        }).success,
      ).toBe(false);
      expect(
        saveHomeworkInputSchema.safeParse({
          pageSlug: "level-1/homework",
          reflection: "y".repeat(MAX_HOMEWORK_REFLECTION_LENGTH + 1),
        }).success,
      ).toBe(false);
    });
  });
});
