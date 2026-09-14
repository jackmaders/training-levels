export type AppNavTarget =
  | { type: 'dashboard' }
  | { type: 'level'; levelNumber: number }
  | { type: 'behavior'; levelNumber: number; behaviorKey: string }
  | { type: 'chapter'; chapterId: string; category: 'foundation' | 'appendix' }
  | { type: 'training'; stepId: string; mode: 'practice' | 'cold' }
