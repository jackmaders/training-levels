import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SESSION_HISTORY, SessionHistoryItem } from '../types/session';
import { getStep } from '../lib/curriculumData';
import { getCriteriaConfig } from '../lib/criteriaHelper';

export type AppRoute = 'home' | 'custom' | 'session' | 'library' | 'dog';

interface PrototypeContextType {
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;

  // Selected session setup
  sessionLevel: number;
  sessionBehaviorKey: string;
  sessionStepNumber: number;
  sessionType: 'practice' | 'cold';
  setSessionType: (type: 'practice' | 'cold') => void;

  // In-session drill state
  activeRepIndex: number;
  setActiveRepIndex: (idx: number) => void;
  reps: ('empty' | 'pass' | 'miss')[];
  coldResult: 'pending' | 'pass' | 'miss';
  timerSecondsLeft: number;
  isTimerRunning: boolean;

  // Session history
  history: SessionHistoryItem[];

  // Actions
  startSession: (lvl: number, bKey: string, stepNum: number, type: 'practice' | 'cold') => void;
  handleLogRep: (status: 'pass' | 'miss') => void;
  handleToggleTimer: () => void;
  resetTimer: () => void;
  finishSession: () => void;
}

const PrototypeContext = createContext<PrototypeContextType | undefined>(undefined);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<AppRoute>('home');
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Selected session setup
  const [sessionLevel, setSessionLevel] = useState(1);
  const [sessionBehaviorKey, setSessionBehaviorKey] = useState('zen');
  const [sessionStepNumber, setSessionStepNumber] = useState(1);
  const [sessionType, setSessionType] = useState<'practice' | 'cold'>('practice');

  // In-session tracking state
  const [activeRepIndex, setActiveRepIndex] = useState(0);
  const [reps, setReps] = useState<('empty' | 'pass' | 'miss')[]>(['empty', 'empty', 'empty', 'empty', 'empty']);
  const [coldResult, setColdResult] = useState<'pending' | 'pass' | 'miss'>('pending');

  // Timer state
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Session history
  const [history, setHistory] = useState<SessionHistoryItem[]>(INITIAL_SESSION_HISTORY);

  const startSession = (lvl: number, bKey: string, stepNum: number, type: 'practice' | 'cold') => {
    setSessionLevel(lvl);
    setSessionBehaviorKey(bKey);
    setSessionStepNumber(stepNum);
    setSessionType(type);
    setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
    setActiveRepIndex(0);
    setColdResult('pending');
    const step = getStep(lvl, bKey, stepNum);
    const cfg = getCriteriaConfig(step.criterionSummary, step.title);
    setTimerSecondsLeft(cfg.durationSeconds || 5);
    setIsTimerRunning(false);
    setRoute('session');
  };

  const handleLogRep = (status: 'pass' | 'miss') => {
    if (sessionType === 'cold') {
      setColdResult(status);
      return;
    }

    const updated = [...reps];
    updated[activeRepIndex] = status;
    setReps(updated);

    if (activeRepIndex < 4) {
      setActiveRepIndex(activeRepIndex + 1);
    }
  };

  const handleToggleTimer = () => {
    if (timerSecondsLeft === 0) {
      const step = getStep(sessionLevel, sessionBehaviorKey, sessionStepNumber);
      const cfg = getCriteriaConfig(step.criterionSummary, step.title);
      setTimerSecondsLeft(cfg.durationSeconds || 5);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const resetTimer = () => {
    const step = getStep(sessionLevel, sessionBehaviorKey, sessionStepNumber);
    const cfg = getCriteriaConfig(step.criterionSummary, step.title);
    setTimerSecondsLeft(cfg.durationSeconds || 5);
    setIsTimerRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  const finishSession = () => {
    const step = getStep(sessionLevel, sessionBehaviorKey, sessionStepNumber);
    const passCount = reps.filter((r) => r === 'pass').length;
    const passed = sessionType === 'cold' ? coldResult === 'pass' : passCount >= 4;

    const newLog: SessionHistoryItem = {
      id: `s-${Date.now()}`,
      dogName: 'Barnaby',
      levelNumber: sessionLevel,
      behaviorTitle: sessionBehaviorKey.charAt(0).toUpperCase() + sessionBehaviorKey.slice(1),
      stepNumber: sessionStepNumber,
      stepTitle: step.title,
      sessionType: sessionType,
      score: sessionType === 'cold' ? (passed ? 'Passed Cold' : 'Failed') : `${passCount}/5`,
      passed,
      date: 'Just now',
      durationMinutes: 3,
    };

    setHistory([newLog, ...history]);
    setRoute('home');
  };

  return (
    <PrototypeContext.Provider
      value={{
        route,
        setRoute,
        isNavOpen,
        setIsNavOpen,
        sessionLevel,
        sessionBehaviorKey,
        sessionStepNumber,
        sessionType,
        setSessionType,
        activeRepIndex,
        setActiveRepIndex,
        reps,
        coldResult,
        timerSecondsLeft,
        isTimerRunning,
        history,
        startSession,
        handleLogRep,
        handleToggleTimer,
        resetTimer,
        finishSession,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
}

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error('usePrototype must be used within a PrototypeProvider');
  }
  return context;
}
