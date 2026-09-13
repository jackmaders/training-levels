import { useState } from 'react';
import { 
  ChevronLeft,
  BookOpen,
  Check, 
  X, 
  Star, 
  RotateCcw,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getBehavior, getStep } from '../lib/curriculumData';
import { getCriteriaConfig } from '../lib/criteriaHelper';
import { HeaderNavDrawer } from '../components/HeaderNavDrawer';
import { HistoryList } from '../components/HistoryList';
import { CustomTrainingView } from '../components/CustomTrainingView';
import { CalloutCard } from '../components/CalloutCard';
import { INITIAL_SESSION_HISTORY, SessionHistoryItem } from '../types/session';

export function VariantC() {
  const [route, setRoute] = useState<'home' | 'custom' | 'session' | 'library' | 'dog'>('home');
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Selected session setup
  const [sessionLevel, setSessionLevel] = useState(1);
  const [sessionBehaviorKey, setSessionBehaviorKey] = useState('zen');
  const [sessionStepNumber, setSessionStepNumber] = useState(1);
  const [sessionType, setSessionType] = useState<'practice' | 'cold'>('practice');

  // Active session tracking state
  const [activeRepIndex, setActiveRepIndex] = useState(0);
  const [reps, setReps] = useState<('empty' | 'pass' | 'miss')[]>(['empty', 'empty', 'empty', 'empty', 'empty']);
  const [coldResult, setColdResult] = useState<'pending' | 'pass' | 'miss'>('pending');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  // Bottom timer state
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Session history
  const [history, setHistory] = useState<SessionHistoryItem[]>(INITIAL_SESSION_HISTORY);

  const currentBehavior = getBehavior(sessionLevel, sessionBehaviorKey);
  const currentStep = getStep(sessionLevel, sessionBehaviorKey, sessionStepNumber);
  const criteriaConfig = getCriteriaConfig(currentStep.criterionSummary, currentStep.title);

  const startSession = (lvl: number, bKey: string, stepNum: number, type: 'practice' | 'cold') => {
    setSessionLevel(lvl);
    setSessionBehaviorKey(bKey);
    setSessionStepNumber(stepNum);
    setSessionType(type);
    setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
    setActiveRepIndex(0);
    setColdResult('pending');
    const cfg = getCriteriaConfig(getStep(lvl, bKey, stepNum).criterionSummary, getStep(lvl, bKey, stepNum).title);
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

  const finishSession = () => {
    const passCount = reps.filter((r) => r === 'pass').length;
    const passed = sessionType === 'cold' ? coldResult === 'pass' : passCount >= 4;

    const newLog: SessionHistoryItem = {
      id: `s-${Date.now()}`,
      dogName: 'Barnaby',
      levelNumber: sessionLevel,
      behaviorTitle: currentBehavior.title,
      stepNumber: currentStep.stepNumber,
      stepTitle: currentStep.title,
      sessionType: sessionType,
      score: sessionType === 'cold' ? (passed ? 'Passed Cold' : 'Failed') : `${passCount}/5`,
      passed,
      date: 'Just now',
      durationMinutes: 3,
    };

    setHistory([newLog, ...history]);
    setRoute('home');
  };

  const passCount = reps.filter((r) => r === 'pass').length;
  const isPracticeDone = reps.every((r) => r !== 'empty');
  const isColdDone = coldResult !== 'pending';
  const isFinished = sessionType === 'cold' ? isColdDone : isPracticeDone;
  const isGoalMet = sessionType === 'cold' ? coldResult === 'pass' : passCount >= 4;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between pb-32 max-w-md mx-auto border-x border-zinc-800">
      {/* Header with Navigation Drawer */}
      {route !== 'session' && (
        <HeaderNavDrawer
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          onOpen={() => setIsNavOpen(true)}
          activeRoute={route}
          onNavigate={(r) => setRoute(r)}
        />
      )}

      {/* =========================================================================
          PAGE 1: MAIN HOMEPAGE (RECOMMENDED NEXT EXERCISE & HISTORY)
         ========================================================================= */}
      {route === 'home' && (
        <main className="p-4 flex-1 text-left space-y-4">
          <div className="bg-zinc-900 border-2 border-zinc-700 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300">
                <Sparkles size={14} className="text-amber-400" />
                <span>NEXT GUIDED EXERCISE</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Level 1 • Zen
              </span>
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              Zen: Watch Treat for 5 Seconds
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Dog watches food in open hand without lunging or moving forward for 5 seconds.
            </p>

            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSessionType('practice')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  sessionType === 'practice'
                    ? 'bg-zinc-800 text-white border-zinc-600 font-bold'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                Practice (5 Reps)
              </button>
              <button
                type="button"
                onClick={() => setSessionType('cold')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1 cursor-pointer ${
                  sessionType === 'cold'
                    ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                <Star size={12} className={sessionType === 'cold' ? 'fill-amber-300' : ''} />
                <span>Cold Test</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => startSession(1, 'zen', 1, sessionType)}
              className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <span>{sessionType === 'cold' ? 'Launch Cold Test' : 'Launch 5-Rep Practice'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <HistoryList history={history} />
        </main>
      )}

      {/* =========================================================================
          PAGE 1B: CUSTOM TRAINING (CURRICULUM ACCORDION)
         ========================================================================= */}
      {route === 'custom' && (
        <CustomTrainingView onStartSession={startSession} />
      )}

      {/* =========================================================================
          PAGE 1C: REFERENCE LIBRARY
         ========================================================================= */}
      {route === 'library' && (
        <main className="p-4 flex-1 text-left space-y-3">
          <div className="text-xs font-semibold text-zinc-200">Sue Ailsby Master Guidelines</div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-2">
            <span className="font-bold text-white block">Pre-Brief, Be Brief, Debrief:</span>
            <p>1. Count out 5-10 treats beforehand.</p>
            <p>2. Keep active drills under 5 minutes.</p>
            <p>3. 80% compliance rule (4/5 reps) to pass.</p>
          </div>
        </main>
      )}

      {/* =========================================================================
          PAGE 1D: DOG PROFILE
         ========================================================================= */}
      {route === 'dog' && (
        <main className="p-4 flex-1 text-left space-y-3">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <h2 className="text-sm font-bold text-white">Barnaby</h2>
            <p className="text-xs text-zinc-400">Level 1 • Golden Retriever</p>
          </div>
        </main>
      )}

      {/* =========================================================================
          PAGE 2: IN-SESSION DRILL (CLEAN VIEWPORT + GESTURE DRAWER TAB + BOTTOM BAR)
         ========================================================================= */}
      {route === 'session' && (
        <div className="flex-1 flex flex-col justify-between">
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setRoute('home')}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            <span className="text-xs font-semibold text-zinc-200">
              {currentBehavior.title} (Step {currentStep.stepNumber})
            </span>

            <span className="text-[10px] font-mono text-zinc-400">
              {sessionType === 'cold' ? 'Cold Test' : `Score: ${passCount}/5`}
            </span>
          </header>

          <main className="px-4 py-4 flex-1 text-left space-y-3">
            {isFinished && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                isGoalMet ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200' : 'bg-zinc-900 border-zinc-700 text-zinc-300'
              }`}>
                <div>
                  <span className="font-bold block">
                    {sessionType === 'cold'
                      ? isGoalMet ? '✓ Cold Test Certified!' : '✕ Cold Test Missed'
                      : isGoalMet ? '✓ Target Met (4/5 Passed)' : `Session Completed (${passCount}/5)`}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {isGoalMet ? 'Ready to log completion.' : 'Retry on next session.'}
                  </span>
                </div>
                <button
                  onClick={finishSession}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-900 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Save & Return
                </button>
              </div>
            )}

            {/* Target Card */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                  {sessionType === 'cold' ? 'Cold Test Criterion' : `Target (Rep ${activeRepIndex + 1} of 5)`}
                </span>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                  Goal: 4/5 reps
                </span>
              </div>

              <h2 className="text-sm font-semibold text-zinc-100 mb-2">
                {currentStep.title}
              </h2>

              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                {sessionType === 'cold' && currentStep.tryItCold ? currentStep.tryItCold : currentStep.criterionSummary}
              </div>
            </div>

            <div className="text-xs text-zinc-500 font-mono text-center">
              Tap right-edge tab anytime to view methodology & Sue's notes.
            </div>
          </main>

          {/* Floating Right-Edge Drawer Pull Tab */}
          <button
            type="button"
            onClick={() => setIsSideDrawerOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-zinc-800 border-l border-y border-zinc-600 text-zinc-200 text-xs py-4 px-2 rounded-l-xl shadow-lg flex flex-col items-center gap-1.5 cursor-pointer hover:bg-zinc-700"
          >
            <BookOpen size={15} />
            <span className="[writing-mode:vertical-rl] tracking-wider uppercase font-mono text-[10px]">
              Notes
            </span>
          </button>

          {/* Fixed Bottom Action Bar: Timer + Rep Matrix + Big Pass/Miss */}
          <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-2.5 shadow-xl space-y-2">
              {/* Timer Bar */}
              {criteriaConfig.type === 'timing' && (
                <div className="flex items-center justify-between gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                  <span className="font-mono text-xs font-bold text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">
                    {timerSecondsLeft}s
                  </span>
                  <span className="text-xs text-zinc-400">
                    {criteriaConfig.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTimerSecondsLeft(criteriaConfig.durationSeconds || 5);
                        setIsTimerRunning(false);
                      }}
                      className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                        isTimerRunning ? 'bg-amber-700 text-white' : 'bg-zinc-100 text-zinc-900'
                      }`}
                    >
                      {isTimerRunning ? 'Pause' : 'Start'}
                    </button>
                  </div>
                </div>
              )}

              {/* 5-Rep Progress Strip */}
              {sessionType === 'practice' && (
                <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                  {reps.map((status, idx) => {
                    const isActive = idx === activeRepIndex;
                    let label = '—';
                    let style = 'bg-zinc-900 text-zinc-500 border-zinc-800';

                    if (status === 'pass') {
                      style = 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold';
                      label = '✓';
                    } else if (status === 'miss') {
                      style = 'bg-rose-950 border-rose-600 text-rose-300 font-bold';
                      label = '✕';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveRepIndex(idx)}
                        className={`py-1 rounded border text-center cursor-pointer transition ${style} ${
                          isActive ? 'ring-2 ring-zinc-300' : ''
                        }`}
                      >
                        <div className="text-[9px] font-mono text-zinc-400">R{idx + 1}</div>
                        <div className="text-xs font-mono mt-0.5">{label}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pass / Miss Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLogRep('pass')}
                  className="py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Check size={16} />
                  <span>PASS REP</span>
                </button>
                <button
                  onClick={() => handleLogRep('miss')}
                  className="py-2.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <X size={16} />
                  <span>MISS REP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right-Side Slide-Over Methodology Drawer */}
          {isSideDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
              <div className="absolute inset-0" onClick={() => setIsSideDrawerOpen(false)} />
              <div className="relative bg-zinc-900 border-l border-zinc-700 p-4 max-w-xs w-full h-full flex flex-col justify-between shadow-xl z-10 text-left">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Methodology & Notes
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        {currentBehavior.title} (Step {currentStep.stepNumber})
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded cursor-pointer hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="overflow-y-auto max-h-[75vh] space-y-2 text-xs pr-1">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
                      <span className="font-semibold text-zinc-100 block mb-1">
                        Method:
                      </span>
                      <p className="text-zinc-400 leading-relaxed">
                        {currentStep.instructionsMarkdown}
                      </p>
                    </div>

                    {currentStep.tryItCold && (
                      <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
                        <span className="font-semibold text-zinc-100 block mb-1">
                          Cold Test:
                        </span>
                        <p className="text-zinc-400">
                          {currentStep.tryItCold}
                        </p>
                      </div>
                    )}

                    {currentStep.callouts.map((c, i) => (
                      <CalloutCard key={i} callout={c} />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsSideDrawerOpen(false)}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg cursor-pointer mt-2"
                >
                  Resume Drill
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
