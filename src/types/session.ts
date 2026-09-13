export interface SessionHistoryItem {
  id: string;
  dogName: string;
  levelNumber: number;
  behaviorTitle: string;
  stepNumber: number;
  stepTitle: string;
  sessionType: 'practice' | 'cold';
  score: string; // e.g. "4/5" or "Passed"
  passed: boolean;
  date: string;
  durationMinutes: number;
}

export const INITIAL_SESSION_HISTORY: SessionHistoryItem[] = [
  {
    id: 's-1',
    dogName: 'Barnaby',
    levelNumber: 1,
    behaviorTitle: 'Zen',
    stepNumber: 1,
    stepTitle: 'Dog watches treat for 5s',
    sessionType: 'practice',
    score: '5/5',
    passed: true,
    date: 'Today, 2:15 PM',
    durationMinutes: 3,
  },
  {
    id: 's-2',
    dogName: 'Barnaby',
    levelNumber: 1,
    behaviorTitle: 'Come',
    stepNumber: 1,
    stepTitle: 'Runs between 2 people 10 feet',
    sessionType: 'practice',
    score: '4/5',
    passed: true,
    date: 'Yesterday, 5:30 PM',
    durationMinutes: 4,
  },
  {
    id: 's-3',
    dogName: 'Barnaby',
    levelNumber: 1,
    behaviorTitle: 'Sit',
    stepNumber: 1,
    stepTitle: 'Dog sits on cue 5 times',
    sessionType: 'practice',
    score: '3/5',
    passed: false,
    date: 'Yesterday, 9:00 AM',
    durationMinutes: 4,
  },
];
