import fs from "fs";
import path from "path";
import {
  TrainingLevelsData,
  LevelData,
  FoundationItem,
  AppendixItem,
  BehaviorData,
} from "../types/curriculum";
import {
  parseBehaviorFile,
  parseFoundationFile,
  parseAppendixFile,
  parseOverviewFile,
  parseHomeworkFile,
} from "./content-parser";

/**
 * Compiles all markdown files in the docs directory into a structured TrainingLevelsData dataset.
 */
export function compileTrainingLevels(docsDir: string): TrainingLevelsData {
  // 1. Foundations (00-foundations)
  const foundationsDir = path.join(docsDir, "00-foundations");
  const foundationFiles = fs
    .readdirSync(foundationsDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const foundations: FoundationItem[] = foundationFiles.map((file, idx) => {
    const filePath = path.join(foundationsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    return parseFoundationFile(content, file, idx + 1);
  });

  // 2. Levels 1 - 4
  const levelDirs = [
    { level: 1, dir: "01-level-1", title: "Level 1" },
    { level: 2, dir: "02-level-2", title: "Level 2" },
    { level: 3, dir: "03-level-3", title: "Level 3" },
    { level: 4, dir: "04-level-4", title: "Level 4" },
  ];

  const levels: LevelData[] = levelDirs.map(({ level, dir, title }) => {
    const levelPath = path.join(docsDir, dir);
    const files = fs
      .readdirSync(levelPath)
      .filter((f) => f.endsWith(".md"))
      .sort();

    // Overview
    const overviewFile = files.find((f) => f.includes("overview")) || "00-overview.md";
    const overviewContent = fs.readFileSync(path.join(levelPath, overviewFile), "utf-8");
    const overview = parseOverviewFile(overviewContent, level);

    // Homework
    const homeworkFile = files.find((f) => f.includes("homework")) || "homework.md";
    const homeworkContent = fs.readFileSync(path.join(levelPath, homeworkFile), "utf-8");
    const homework = parseHomeworkFile(homeworkContent, level);

    // Behaviors
    const behaviorFiles = files.filter(
      (f) => !f.includes("overview") && !f.includes("homework")
    );

    const behaviors: BehaviorData[] = behaviorFiles.map((file, idx) => {
      const filePath = path.join(levelPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      return parseBehaviorFile(content, {
        level,
        filename: file,
        order: idx + 1,
      });
    });

    behaviors.sort((a, b) => a.order - b.order);

    return {
      level: level as 1 | 2 | 3 | 4,
      title,
      overview,
      behaviors,
      homework,
    };
  });

  // 3. Appendices (05-appendices)
  const appendicesDir = path.join(docsDir, "05-appendices");
  const appendixFiles = fs
    .readdirSync(appendicesDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const appendices: AppendixItem[] = appendixFiles.map((file, idx) => {
    const filePath = path.join(appendicesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    return parseAppendixFile(content, file, idx + 1);
  });

  return {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    foundations,
    levels: levels as [LevelData, LevelData, LevelData, LevelData],
    appendices,
  };
}
