import rawContent from '../data/training-content.json';
import { TrainingLevelsData, TrainingLevelsDataSchema } from '../types/curriculum';

export const trainingData: TrainingLevelsData = TrainingLevelsDataSchema.parse(rawContent);

export function getLevel(levelNumber: number) {
  return trainingData.levels.find((l) => l.level === levelNumber) ?? trainingData.levels[0];
}

export function getBehavior(levelNumber: number, behaviorKey: string) {
  const level = getLevel(levelNumber);
  return level.behaviors.find((b) => b.behaviorKey.toLowerCase() === behaviorKey.toLowerCase()) ?? level.behaviors[0];
}

export function getStep(levelNumber: number, behaviorKey: string, stepNumber: number) {
  const behavior = getBehavior(levelNumber, behaviorKey);
  return behavior.steps.find((s) => s.stepNumber === stepNumber) ?? behavior.steps[0];
}
