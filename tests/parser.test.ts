import { describe, it, expect } from "vitest";
import {
  parseFrontmatter,
  parseCallouts,
  parseCriteriaTable,
  parseBehaviorFile,
  parseFoundationFile,
  parseAppendixFile,
  parseOverviewFile,
  parseHomeworkFile,
} from "../src/parser/content-parser";
import {
  BehaviorDataSchema,
  FoundationItemSchema,
  AppendixItemSchema,
  LevelOverviewSchema,
  HomeworkSchema,
} from "../src/types/curriculum";

describe("Content Parsers", () => {
  describe("parseFrontmatter", () => {
    it("extracts YAML frontmatter and body", () => {
      const markdown = `---
title: "Level 1: Zen"
level: 1
pages: 65-75
---

# Level 1: Zen
Body content here.`;

      const { data, body } = parseFrontmatter(markdown);
      expect(data.title).toBe("Level 1: Zen");
      expect(data.level).toBe(1);
      expect(data.pages).toBe("65-75");
      expect(body.trim()).toContain("# Level 1: Zen");
    });
  });

  describe("parseCallouts", () => {
    it("parses github-style callout blockquotes", () => {
      const text = `Some normal text.

> [!TIP] TRAINING TIP
> First tip line.
> Second tip line.

More text.

> [!WARNING] PROBLEM: Too fast!
> Don't rush through steps.`;

      const callouts = parseCallouts(text);
      expect(callouts).toHaveLength(2);
      expect(callouts[0]).toEqual({
        type: "tip",
        rawType: "TIP",
        title: "TRAINING TIP",
        contentMarkdown: "First tip line.\nSecond tip line.",
      });
      expect(callouts[1]).toEqual({
        type: "warning",
        rawType: "WARNING",
        title: "PROBLEM: Too fast!",
        contentMarkdown: "Don't rush through steps.",
      });
    });
  });

  describe("parseCriteriaTable", () => {
    it("extracts step and criteria descriptions from markdown table", () => {
      const tableMarkdown = `
| Step | Criteria |
| :--- | :--- |
| **Step 1** | Dog moves away from a treat in your hand. |
| **Step 2** | Dog stays away from the treat for 5 seconds. |
`;
      const table = parseCriteriaTable(tableMarkdown);
      expect(table).toEqual([
        { step: 1, criteria: "Dog moves away from a treat in your hand." },
        { step: 2, criteria: "Dog stays away from the treat for 5 seconds." },
      ]);
    });
  });

  describe("parseBehaviorFile", () => {
    it("parses Level 1 Zen behavior file conforming to schema", () => {
      const markdown = `---
title: "Level 1: Zen"
level: 1
pages: 65-75
---

# Level 1: Zen

**Comebefores:** Read through the Tools section.

## Criteria

| Step | Criteria |
| :--- | :--- |
| **Step 1** | Dog moves away from treat. |
| **Step 2** | Dog stays away for 5 seconds. |
| **Step 3** | Dog stays away for 5s open hand. |
| **Step 4** | Dog stays away in dish. |
| **Step 5** | Practise with more hands. |

---

### Equipment
Basic equipment only.

### Think about Zen
Self control is key.

### About the cues
Leave it.

> [!TIP] TRAINING TIP
> Target before zen for shy dogs.

---

## Step 1: The dog moves away from a treat in your closed fist.

Start sitting in a chair.

> [!WARNING] PROBLEM: Dropped treat lost
> Use noisier floor.

- [ ] **Try It Cold**
  Say Leave It and put hand out.

- [ ] **Comeafters**
  Teach while standing.

---

## Step 2: Step 2 title

Step 2 instructions.

- [ ] **Try It Cold:**
  Test step 2.

- [ ] **Comeafters:**
  Generalize step 2.

---

## Step 3: Step 3 title

Step 3 instructions.

- [ ] **Try It Cold**
  Test step 3.

- [ ] **Comeafters**
  Generalize step 3.

---

## Step 4: Step 4 title

Step 4 instructions.

- [ ] **Try It Cold**
  Test step 4.

- [ ] **Comeafters**
  Generalize step 4.

---

## Step 5: Step 5 title

Step 5 generalization instructions.
`;

      const behavior = parseBehaviorFile(markdown, {
        level: 1,
        filename: "01-zen.md",
        order: 1,
      });

      expect(behavior.id).toBe("level-1-zen");
      expect(behavior.level).toBe(1);
      expect(behavior.behaviorKey).toBe("zen");
      expect(behavior.title).toBe("Zen");
      expect(behavior.comebefores).toContain("Read through the Tools section.");
      expect(behavior.equipment).toBe("Basic equipment only.");
      expect(behavior.thinkAbout).toBe("Self control is key.");
      expect(behavior.aboutCues).toBe("Leave it.");
      expect(behavior.criteriaTable).toHaveLength(5);
      expect(behavior.callouts).toHaveLength(1);
      expect(behavior.steps).toHaveLength(5);
      expect(behavior.steps[0].id).toBe("level-1-zen-step-1");
      expect(behavior.steps[0].stepNumber).toBe(1);
      expect(behavior.steps[0].tryItCold).toBe("Say Leave It and put hand out.");
      expect(behavior.steps[0].comeafters).toBe("Teach while standing.");
      expect(behavior.steps[0].callouts).toHaveLength(1);

      const parsed = BehaviorDataSchema.safeParse(behavior);
      expect(parsed.success).toBe(true);
    });
  });

  describe("parseFoundationFile", () => {
    it("parses foundation file into FoundationItem", () => {
      const markdown = `---
title: Foreword & Welcome
section: Foundations
volume: 1
pages: 8-12
---

# Foreword

Intro content.

> [!TIP] Training Tip
> Read tools section.
`;
      const item = parseFoundationFile(markdown, "01-foreword-and-welcome.md", 1);
      expect(item.id).toBe("01-foreword-and-welcome");
      expect(item.title).toBe("Foreword & Welcome");
      expect(item.order).toBe(1);
      expect(item.volume).toBe(1);
      expect(item.callouts).toHaveLength(1);

      const parsed = FoundationItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    });
  });

  describe("parseAppendixFile", () => {
    it("parses appendix file into AppendixItem", () => {
      const markdown = `---
title: "Appendix A: Leading the Dance"
volume: 1
section: "Appendices"
pages: "267-269"
---

# Appendix A: Leading the Dance

Dance content.
`;
      const item = parseAppendixFile(markdown, "appendix-a-leading-the-dance.md", 1);
      expect(item.id).toBe("appendix-a-leading-the-dance");
      expect(item.title).toBe("Appendix A: Leading the Dance");
      expect(item.order).toBe(1);

      const parsed = AppendixItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    });
  });

  describe("parseOverviewFile and parseHomeworkFile", () => {
    it("parses overview file into LevelOverview", () => {
      const markdown = `---
title: "Level 1: Overview"
level: 1
pages: 64
---

# Level 1 Overview
Overview content.
`;
      const overview = parseOverviewFile(markdown, 1);
      expect(overview.level).toBe(1);
      expect(overview.title).toBe("Level 1: Overview");
      const parsed = LevelOverviewSchema.safeParse(overview);
      expect(parsed.success).toBe(true);
    });

    it("parses homework file into Homework", () => {
      const markdown = `---
title: "Level 1: Homework"
level: 1
pages: 112-113
---

# Level 1 Homework
Homework content.
`;
      const homework = parseHomeworkFile(markdown, 1);
      expect(homework.level).toBe(1);
      expect(homework.title).toBe("Level 1: Homework");
      const parsed = HomeworkSchema.safeParse(homework);
      expect(parsed.success).toBe(true);
    });
  });
});
