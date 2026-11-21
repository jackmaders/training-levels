import type {
  CurriculumSyllabus,
  LevelNumber,
  SyllabusPageEntry,
  SyllabusSection,
} from "@/shared/curriculum-data";

import type { TrainingOverview } from "../api/recommendation-service";
import { getLevelSections } from "./curriculum-levels";
import { getPrerequisiteChain } from "./dependency-relationships";
import {
  recommendNextTrainingActivity,
  type TrainingRecommendation,
  type TrainingRecommendationMode,
} from "./training-recommendation";

const PERCENTAGE_SCALE = 100;

type LevelStatus = "completed" | "in_progress" | "upcoming";
type StepStatus = "completed" | "next" | "ready";

interface TheoryRouteParams {
  page: string;
  section: string;
}

interface TrainingStepLaunchSearch {
  mode: "practice";
  stepId: string;
}

interface TrainingHubStep {
  label: string;
  launchSearch: TrainingStepLaunchSearch;
  status: StepStatus;
  stepId: string;
}

interface TrainingHubBehavior {
  actionStepId: string;
  comebeforeNote: string | undefined;
  completedSteps: number;
  ctaLabel: "Practice" | "Train";
  ctaVariant: "default" | "outline";
  id: string;
  name: string;
  percentage: number;
  steps: TrainingHubStep[];
  theoryParams: TheoryRouteParams;
  totalSteps: number;
}

interface TrainingHubLevel {
  behaviors: TrainingHubBehavior[];
  completedSteps: number;
  id: string;
  levelNumber: LevelNumber;
  status: LevelStatus;
  title: string;
  totalSteps: number;
}

interface TrainingHubRecommendation {
  behaviorName: string;
  ctaLabel: "Start Practice" | "Start Test";
  levelTitle: string;
  mode: TrainingRecommendationMode;
  modeBadgeLabel: "Practice" | "Test";
  reason: string;
  stepId: string;
  stepLabel: string;
  theoryParams: TheoryRouteParams;
}

interface TrainingHubData {
  activeLevelId: string;
  dogName: string;
  levels: TrainingHubLevel[];
  recommended: TrainingHubRecommendation;
}

interface BuildTrainingHubDataInput {
  now?: Date | null;
  overview: TrainingOverview;
  syllabus: CurriculumSyllabus;
}

function parseTheoryParams(pageSlug: string): TheoryRouteParams {
  const [section = "level-1", page = ""] = pageSlug.split("/");
  return { page, section };
}

function parseLevelNumber(sectionSlug: string): LevelNumber {
  const parsed = Number(sectionSlug.replace("level-", ""));
  if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4) {
    return parsed;
  }
  return 1;
}

function deriveLevelStatus(
  completedSteps: number,
  totalSteps: number,
  levelNumber: LevelNumber,
  currentLevelNumber: LevelNumber,
): LevelStatus {
  if (totalSteps > 0 && completedSteps === totalSteps) {
    return "completed";
  }
  if (levelNumber === currentLevelNumber || completedSteps > 0) {
    return "in_progress";
  }
  return "upcoming";
}

function buildPageBySlugMap(sections: readonly SyllabusSection[]): Map<string, SyllabusPageEntry> {
  const map = new Map<string, SyllabusPageEntry>();
  for (const section of sections) {
    for (const page of section.pages) {
      map.set(page.pageSlug, page);
    }
  }
  return map;
}

function getUnmetComebeforeTitles(
  pageSlug: string,
  pageBySlug: ReadonlyMap<string, SyllabusPageEntry>,
  completedStepIds: ReadonlySet<string>,
): string[] {
  const prereqSlugs = getPrerequisiteChain(pageSlug);
  const unmetTitles: string[] = [];

  for (const prereqSlug of prereqSlugs) {
    const prereqPage = pageBySlug.get(prereqSlug);
    if (
      prereqPage === undefined ||
      prereqPage.stepSummaries === undefined ||
      prereqPage.stepSummaries.length === 0
    ) {
      continue;
    }
    const allCompleted = prereqPage.stepSummaries.every((step) =>
      completedStepIds.has(step.stepId),
    );
    if (!allCompleted) {
      unmetTitles.push(prereqPage.title);
    }
  }

  return unmetTitles;
}

function buildBehaviorSteps(
  page: SyllabusPageEntry,
  completedStepIds: ReadonlySet<string>,
  recommendedStepId: string,
): TrainingHubStep[] {
  return (page.stepSummaries ?? []).map((step) => {
    const { stepId } = step;
    let status: StepStatus = "ready";
    if (completedStepIds.has(stepId)) {
      status = "completed";
    } else if (stepId === recommendedStepId) {
      status = "next";
    }
    return {
      label: step.label,
      launchSearch: { mode: "practice", stepId },
      status,
      stepId,
    };
  });
}

function buildBehaviorItem(
  page: SyllabusPageEntry,
  pageBySlug: ReadonlyMap<string, SyllabusPageEntry>,
  completedStepIds: ReadonlySet<string>,
  recommendedStepId: string,
): TrainingHubBehavior {
  const steps = buildBehaviorSteps(page, completedStepIds, recommendedStepId);
  const completedSteps = steps.filter((step) => step.status === "completed").length;
  const totalSteps = steps.length;
  const percentage =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * PERCENTAGE_SCALE);
  const isCompleted = totalSteps > 0 && completedSteps === totalSteps;
  const unmetTitles = getUnmetComebeforeTitles(page.pageSlug, pageBySlug, completedStepIds);
  const comebeforeNote =
    unmetTitles.length > 0 ? `Comebefore: ${unmetTitles.join(", ")}` : undefined;
  const actionStep =
    steps.find((step) => step.status === "next") ??
    steps.find((step) => step.status === "ready") ??
    steps[0];
  const actionStepId = actionStep?.stepId ?? `${page.pageSlug}:step-1`;
  const isRecommendedNext = actionStepId === recommendedStepId && comebeforeNote === undefined;

  return {
    actionStepId,
    comebeforeNote,
    completedSteps,
    ctaLabel: isCompleted ? "Practice" : "Train",
    ctaVariant: isRecommendedNext ? "default" : "outline",
    id: page.pageSlug,
    name: page.title,
    percentage,
    steps,
    theoryParams: parseTheoryParams(page.pageSlug),
    totalSteps,
  };
}

function buildRecommendedSummary(
  recommendation: TrainingRecommendation,
  levelSections: readonly SyllabusSection[],
): TrainingHubRecommendation {
  const levelId = `level-${recommendation.levelNumber}`;
  const matchingSection = levelSections.find((section) => section.sectionSlug === levelId);
  const levelTitle = matchingSection?.title ?? `Level ${recommendation.levelNumber}`;
  const isTest = recommendation.mode === "test";

  return {
    behaviorName: recommendation.behaviorTitle,
    ctaLabel: isTest ? "Start Test" : "Start Practice",
    levelTitle,
    mode: recommendation.mode,
    modeBadgeLabel: isTest ? "Test" : "Practice",
    reason: recommendation.reason,
    stepId: recommendation.stepId,
    stepLabel: recommendation.stepLabel,
    theoryParams: parseTheoryParams(recommendation.pageSlug),
  };
}

function buildTrainingHubData({
  now,
  overview,
  syllabus,
}: BuildTrainingHubDataInput): TrainingHubData {
  const recommendation = recommendNextTrainingActivity({ now, overview, syllabus });
  const completedStepIds = new Set(overview.curriculumProgress.map((item) => item.stepId));
  const levelSections = getLevelSections(syllabus);
  const pageBySlug = buildPageBySlugMap(levelSections);

  const levels: TrainingHubLevel[] = levelSections.map((section) => {
    const levelNumber = parseLevelNumber(section.sectionSlug);
    const behaviors = section.pages
      .filter((page) => page.stepSummaries !== undefined && page.stepSummaries.length > 0)
      .map((page) => buildBehaviorItem(page, pageBySlug, completedStepIds, recommendation.stepId));
    const completedSteps = behaviors.reduce((sum, behavior) => sum + behavior.completedSteps, 0);
    const totalSteps = behaviors.reduce((sum, behavior) => sum + behavior.totalSteps, 0);

    return {
      behaviors,
      completedSteps,
      id: section.sectionSlug,
      levelNumber,
      status: deriveLevelStatus(
        completedSteps,
        totalSteps,
        levelNumber,
        recommendation.currentLevelNumber,
      ),
      title: section.title,
      totalSteps,
    };
  });

  return {
    activeLevelId: `level-${recommendation.currentLevelNumber}`,
    dogName: overview.activeDog?.name ?? "My Dog",
    levels,
    recommended: buildRecommendedSummary(recommendation, levelSections),
  };
}

export {
  buildTrainingHubData,
  type BuildTrainingHubDataInput,
  type LevelStatus,
  type StepStatus,
  type TheoryRouteParams,
  type TrainingHubBehavior,
  type TrainingHubData,
  type TrainingHubLevel,
  type TrainingHubRecommendation,
  type TrainingHubStep,
};
