import yaml from "yaml";
import {
  Callout,
  CalloutType,
  CalloutTypeSchema,
  CriteriaTableRow,
  StepData,
  BehaviorData,
  FoundationItem,
  AppendixItem,
  LevelOverview,
  Homework,
} from "../types/curriculum";

export interface FrontmatterResult {
  data: Record<string, any>;
  body: string;
}

/**
 * Parses YAML frontmatter from markdown file.
 */
export function parseFrontmatter(markdown: string): FrontmatterResult {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: markdown };
  }

  const rawYaml = match[1];
  const body = match[2];
  let data: Record<string, any> = {};

  try {
    data = yaml.parse(rawYaml) || {};
  } catch {
    data = {};
  }

  return { data, body };
}

/**
 * Parses GitHub-style callouts (> [!TIP] Title) from markdown text.
 */
export function parseCallouts(markdown: string): Callout[] {
  const callouts: Callout[] = [];
  const regex = /(?:^[ \t]*>[ \t]*\[!([A-Z]+)\][ \t]*(.*?)\r?\n)((?:^[ \t]*>.*(?:\r?\n|$))*)/gm;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const rawType = match[1].trim();
    const titleLine = match[2].trim();
    const rawBody = match[3];

    // Normalize type
    const lowerType = rawType.toLowerCase();
    const parsedType = CalloutTypeSchema.safeParse(lowerType);
    const type: CalloutType = parsedType.success ? parsedType.data : "note";

    // Strip leading > from body lines
    const bodyLines = rawBody
      .split(/\r?\n/)
      .map((line) => line.replace(/^[ \t]*>[ \t]?/, ""))
      .filter((line, idx, arr) => {
        // remove trailing empty line caused by split
        if (idx === arr.length - 1 && line.trim() === "") return false;
        return true;
      });

    const contentMarkdown = bodyLines.join("\n").trim();
    const title = titleLine || rawType;

    callouts.push({
      type,
      rawType,
      title,
      contentMarkdown,
    });
  }

  return callouts;
}

/**
 * Extracts criteria from either markdown table (| Step | Criteria |)
 * or list format (- **Step 1:** ...).
 */
export function parseCriteriaTable(markdown: string): CriteriaTableRow[] {
  const rows: CriteriaTableRow[] = [];

  // Table match: | **Step 1** | ... |
  const tableRowRegex = /\|\s*\*{0,2}Step\s+(\d+)\*{0,2}\s*\|\s*([^|]+)\|/gi;
  let match: RegExpExecArray | null;
  while ((match = tableRowRegex.exec(markdown)) !== null) {
    const stepNum = parseInt(match[1], 10);
    const criteria = match[2].trim();
    if (stepNum >= 1 && stepNum <= 5) {
      rows.push({ step: stepNum, criteria });
    }
  }

  if (rows.length === 5) {
    return rows;
  }

  // List match: - **Step 1:** ...
  const listRowRegex = /-\s+\*{0,2}Step\s+(\d+):?\*{0,2}\s*(.*?)(?=\n-\s+\*{0,2}Step|\n\n|\n#{1,4}|\Z)/gis;
  while ((match = listRowRegex.exec(markdown)) !== null) {
    const stepNum = parseInt(match[1], 10);
    const criteria = match[2].replace(/^:?\s*/, "").trim();
    if (stepNum >= 1 && stepNum <= 5 && !rows.some((r) => r.step === stepNum)) {
      rows.push({ step: stepNum, criteria });
    }
  }

  rows.sort((a, b) => a.step - b.step);
  return rows;
}

/**
 * Helper to clean title from "Level X: " or quotes.
 */
function cleanTitle(rawTitle: string): string {
  return rawTitle.replace(/^Level\s+\d+:\s*/i, "").replace(/^["']|["']$/g, "").trim();
}

/**
 * Helper to extract a section by markdown heading.
 */
function extractSectionByHeading(markdown: string, headingPattern: RegExp): string | null {
  const match = markdown.match(headingPattern);
  if (!match) return null;
  let text = match[1].trim();
  // Strip trailing dividers if any
  text = text.replace(/\n---\s*$/g, "").trim();
  return text;
}

/**
 * Parses a behavior markdown file.
 */
export function parseBehaviorFile(
  markdown: string,
  meta: { level: number; filename: string; order: number }
): BehaviorData {
  const { data, body } = parseFrontmatter(markdown);
  const behaviorKey = meta.filename.replace(/^\d+-/, "").replace(/\.md$/, "");
  const id = `level-${meta.level}-${behaviorKey}`;

  const rawTitle = (data.title || data.topic || behaviorKey).toString();
  const title = cleanTitle(rawTitle);
  const pages = data.pages || "";
  const order = typeof data.order === "number" ? data.order : meta.order;

  // Split into intro and 5 step sections
  const stepSplits = body.split(/\n(?=##\s+Step\s+\d+)/i);
  const introText = stepSplits[0] || "";
  const stepSections = stepSplits.slice(1);

  // Parse intro subsections
  const sectionDelimiter = "(?=\\n###?|\\n##|\\n---\\n|\\n>[ \\t]*\\[!|\\Z)";

  const comebefores =
    extractSectionByHeading(
      introText,
      new RegExp(`(?:^|\\n)(?:###?\\s+Comebefores|\\*\\*Comebefores:?\\*\\*)([\\s\\S]*?)${sectionDelimiter}`, "i")
    ) || null;

  const equipment =
    extractSectionByHeading(
      introText,
      new RegExp(`(?:^|\\n)###?\\s+Equipment([\\s\\S]*?)${sectionDelimiter}`, "i")
    ) || null;

  const thinkAbout =
    extractSectionByHeading(
      introText,
      new RegExp(`(?:^|\\n)###?\\s+Think [Aa]bout[^\\n]*([\\s\\S]*?)${sectionDelimiter}`, "i")
    ) || null;

  const aboutCues =
    extractSectionByHeading(
      introText,
      new RegExp(`(?:^|\\n)###?\\s+About the cues([\\s\\S]*?)${sectionDelimiter}`, "i")
    ) || null;

  const criteriaTable = parseCriteriaTable(introText);
  const introCallouts = parseCallouts(introText);

  // Parse each step
  const steps: StepData[] = [];
  for (let i = 1; i <= 5; i++) {
    const stepSection = stepSections[i - 1] || "";
    const stepId = `${id}-step-${i}`;

    // Extract step header
    const headerMatch = stepSection.match(/^##\s+Step\s+\d+:?\s*(.*?)(?:\r?\n|$)/i);
    let stepTitle = headerMatch ? headerMatch[1].trim() : `Step ${i}`;

    // Look for subtitle if present e.g. *(The dog moves off...)*
    const subtitleMatch = stepSection.match(/^##\s+Step\s+\d+[^\n]*\r?\n\s*\*\((.*?)\)\*/m);
    const subtitle = subtitleMatch ? subtitleMatch[1].trim() : "";

    // Criteria summary: from table row or subtitle or stepTitle
    const tableRow = criteriaTable.find((r) => r.step === i);
    const criterionSummary = tableRow ? tableRow.criteria : subtitle || stepTitle;

    // Extract Try It Cold
    const tryItColdMatch = stepSection.match(
      /-\s*\[\s*\]\s*\*\*Try It Cold:?\*\*:?\s*(.*?)(?=\n-\s*\[\s*\]|\n---|\n##|\Z)/is
    );
    const tryItCold = tryItColdMatch ? tryItColdMatch[1].trim() : null;

    // Extract Comeafters
    const comeaftersMatch = stepSection.match(
      /-\s*\[\s*\]\s*\*\*Comeafters:?\*\*:?\s*(.*?)(?=\n-\s*\[\s*\]|\n---|\n##|\Z)/is
    );
    const comeafters = comeaftersMatch ? comeaftersMatch[1].trim() : null;

    // Parse step callouts
    const stepCallouts = parseCallouts(stepSection);

    // Clean instructions markdown
    let instructions = stepSection
      .replace(/^##\s+Step\s+\d+[^\n]*\r?\n?/i, "")
      .replace(/^\s*\*\((.*?)\)\*\r?\n?/m, "");

    // Remove Try It Cold & Comeafters blocks from instructions
    if (tryItColdMatch) {
      instructions = instructions.replace(tryItColdMatch[0], "");
    }
    if (comeaftersMatch) {
      instructions = instructions.replace(comeaftersMatch[0], "");
    }

    instructions = instructions.trim();

    steps.push({
      id: stepId,
      stepNumber: i,
      title: stepTitle,
      criterionSummary,
      instructionsMarkdown: instructions,
      tryItCold,
      comeafters,
      callouts: stepCallouts,
    });
  }

  return {
    id,
    level: meta.level,
    behaviorKey,
    title,
    order,
    pages,
    comebefores: comebefores ? comebefores.trim() : null,
    equipment: equipment ? equipment.trim() : null,
    thinkAbout: thinkAbout ? thinkAbout.trim() : null,
    aboutCues: aboutCues ? aboutCues.trim() : null,
    introMarkdown: introText.trim(),
    criteriaTable,
    callouts: introCallouts,
    steps: steps as [StepData, StepData, StepData, StepData, StepData],
  };
}

/**
 * Shared helper for parsing foundation/appendix section markdown files.
 */
function parseSectionFile(
  markdown: string,
  filename: string,
  order: number,
  defaultSection: string
) {
  const { data, body } = parseFrontmatter(markdown);
  const id = filename.replace(/\.md$/, "");
  const title = (data.title || id).toString();
  const section = (data.section || defaultSection).toString();
  const volume = typeof data.volume === "number" ? data.volume : 1;
  const pages = data.pages || "";
  const callouts = parseCallouts(body);

  return {
    id,
    title,
    order,
    section,
    volume,
    pages,
    contentMarkdown: body.trim(),
    callouts,
  };
}

/**
 * Parses a foundation markdown file.
 */
export function parseFoundationFile(
  markdown: string,
  filename: string,
  order: number
): FoundationItem {
  return parseSectionFile(markdown, filename, order, "Foundations");
}

/**
 * Parses an appendix markdown file.
 */
export function parseAppendixFile(
  markdown: string,
  filename: string,
  order: number
): AppendixItem {
  return parseSectionFile(markdown, filename, order, "Appendices");
}

/**
 * Shared helper for parsing level-scoped overview/homework markdown files.
 */
function parseLevelDocFile(markdown: string, level: number, docType: "Overview" | "Homework") {
  const { data, body } = parseFrontmatter(markdown);
  const title = (data.title || `Level ${level}: ${docType}`).toString();
  const pages = data.pages || "";
  const callouts = parseCallouts(body);

  return {
    level,
    title,
    pages,
    contentMarkdown: body.trim(),
    callouts,
  };
}

/**
 * Parses an overview markdown file.
 */
export function parseOverviewFile(markdown: string, level: number): LevelOverview {
  return parseLevelDocFile(markdown, level, "Overview");
}

/**
 * Parses a homework markdown file.
 */
export function parseHomeworkFile(markdown: string, level: number): Homework {
  return parseLevelDocFile(markdown, level, "Homework");
}
