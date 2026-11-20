import type { DogLevelSummary, ProfileDog, ProfileUser } from "./types";

export const STUB_USER: ProfileUser = {
  id: "user_01j9k8m2n3p4q5r6s7t8",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  emailVerified: true,
  role: "user",
  createdAt: new Date("2025-09-14T10:30:00Z"),
};

function buildLevels(completedCounts: [number, number, number, number]): DogLevelSummary[] {
  const definitions: Array<{ level: 1 | 2 | 3 | 4; title: string; totalSteps: number }> = [
    { level: 1, title: "Level 1 · Foundation", totalSteps: 8 },
    { level: 2, title: "Level 2 · Focus & Impulse", totalSteps: 8 },
    { level: 3, title: "Level 3 · Real-World Proofing", totalSteps: 8 },
    { level: 4, title: "Level 4 · Off-Leash Mastery", totalSteps: 6 },
  ];

  return definitions.map((def, index) => ({
    ...def,
    completedSteps: completedCounts[index],
  }));
}

function summarizeLevels(levels: DogLevelSummary[]) {
  const completedSteps = levels.reduce((sum, item) => sum + item.completedSteps, 0);
  const totalSteps = levels.reduce((sum, item) => sum + item.totalSteps, 0);
  const current = levels.find((item) => item.completedSteps < item.totalSteps);
  const activeLevel = current ? current.level : 4;
  return { activeLevel, completedSteps, totalSteps };
}

const barnabyLevels = buildLevels([8, 6, 2, 0]);
const mapleLevels = buildLevels([5, 0, 0, 0]);

export const STUB_DOGS: ProfileDog[] = [
  {
    id: "dog_barnaby_01",
    userId: STUB_USER.id,
    name: "Barnaby",
    createdAt: new Date("2025-09-15T14:00:00Z"),
    updatedAt: new Date("2026-02-10T18:20:00Z"),
    levels: barnabyLevels,
    ...summarizeLevels(barnabyLevels),
  },
  {
    id: "dog_maple_02",
    userId: STUB_USER.id,
    name: "Maple",
    createdAt: new Date("2026-01-08T09:15:00Z"),
    updatedAt: new Date("2026-02-18T11:45:00Z"),
    levels: mapleLevels,
    ...summarizeLevels(mapleLevels),
  },
];

export function createStubDog(userId: string, name: string): ProfileDog {
  const now = new Date();
  const levels = buildLevels([0, 0, 0, 0]);
  return {
    id: `dog_${Date.now().toString(36)}`,
    userId,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
    levels,
    ...summarizeLevels(levels),
  };
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
