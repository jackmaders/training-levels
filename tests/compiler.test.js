import { describe, it, expect } from "vitest";
import path from "path";
import { compileTrainingLevels } from "../src/parser/compile-curriculum";
import { TrainingLevelsDataSchema } from "../src/types/curriculum";
describe("compileTrainingLevels", () => {
    const docsDir = path.resolve(__dirname, "../docs");
    it("successfully parses and compiles all 70 markdown files into valid TrainingLevelsData", () => {
        const data = compileTrainingLevels(docsDir);
        // Validate with Zod schema
        const validation = TrainingLevelsDataSchema.safeParse(data);
        if (!validation.success) {
            console.error(JSON.stringify(validation.error.format(), null, 2));
        }
        expect(validation.success).toBe(true);
        // Validate foundations count
        expect(data.foundations).toHaveLength(8);
        // Validate 4 levels
        expect(data.levels).toHaveLength(4);
        // Level 1: 5 behaviors
        expect(data.levels[0].level).toBe(1);
        expect(data.levels[0].behaviors).toHaveLength(5);
        // Level 2: 15 behaviors
        expect(data.levels[1].level).toBe(2);
        expect(data.levels[1].behaviors).toHaveLength(15);
        // Level 3: 15 behaviors
        expect(data.levels[2].level).toBe(3);
        expect(data.levels[2].behaviors).toHaveLength(15);
        // Level 4: 12 behaviors
        expect(data.levels[3].level).toBe(4);
        expect(data.levels[3].behaviors).toHaveLength(12);
        // Total behaviors across all levels = 5 + 15 + 15 + 12 = 47 behaviors + tricks = 47? Wait: 5+15+15+12 = 47.
        // Total steps = 47 * 5 = 235 steps
        const totalSteps = data.levels.reduce((sum, lvl) => sum + lvl.behaviors.reduce((bSum, b) => bSum + b.steps.length, 0), 0);
        expect(totalSteps).toBe(235);
        // Validate appendices count
        expect(data.appendices).toHaveLength(7);
        // Verify canonical IDs
        expect(data.levels[0].behaviors[0].id).toBe("level-1-zen");
        expect(data.levels[0].behaviors[0].steps[0].id).toBe("level-1-zen-step-1");
    });
});
