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
import { usePrototype } from '../context/PrototypeContext';

export function VariantB() {
  const {
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
  } = usePrototype();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const currentBehavior = getBehavior(sessionLevel, sessionBehaviorKey);
  const currentStep = getStep(sessionLevel, sessionBehaviorKey, sessionStepNumber);
  const criteriaConfig = getCriteriaConfig(currentStep.criterionSummary, currentStep.title);

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
          PAGE 1: MAIN HOMEPAGE (GUIDED RECOMMENDATION & HISTORY)
         ========================================================================= */}
      {route === 'home' && (
        <main className="p-4 flex-1 text-left space-y-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300">
                <Sparkles size={14} className="text-amber-400" />
                <span>RECOMMENDED EXERCISE</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Level 1 • Zen
              </span>
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              Zen: 5-Second Duration Hold
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Dog watches food in your open hand for 5s without reaching or moving forward.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSessionType('practice')}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
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
                className={`py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1 cursor-pointer ${
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
              className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{sessionType === 'cold' ? 'Start Cold Test' : 'Start 5-Minute Drill'}</span>
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
          <div className="text-xs font-semibold text-zinc-200">Sue Ailsby Rules & Guidelines</div>
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
          PAGE 2: IN-SESSION DRILL (SPLIT DOCK + INLINE BOTTOM TRACKER)
         ========================================================================= */}
      {route === 'session' && (
        <div className="flex-1 flex flex-col justify-between">
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setRoute('home')}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Exit</span>
            </button>

            <span className="text-xs font-semibold text-zinc-200">
              {currentBehavior.title} (Step {currentStep.stepNumber})
            </span>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="text-xs text-zinc-300 hover:text-white px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 flex items-center gap-1 cursor-pointer"
            >
              <BookOpen size={12} />
              <span>Notes</span>
            </button>
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
                  {sessionType === 'cold' ? 'Cold Test Attempt' : `Rep ${activeRepIndex + 1} of 5 Goal`}
                </span>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                  Score: {passCount}/5
                </span>
              </div>

              <h2 className="text-sm font-semibold text-zinc-100 mb-2">
                {currentStep.title}
              </h2>

              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                {sessionType === 'cold' && currentStep.tryItCold ? currentStep.tryItCold : currentStep.criterionSummary}
              </div>
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center justify-between px-3 cursor-pointer"
            >
              <span>View Sue's Detailed Notes</span>
              <BookOpen size={14} className="text-zinc-400" />
            </button>
          </main>

          {/* Fixed Bottom Dock with Tracker & Action Buttons Together */}
          <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-2.5 shadow-xl space-y-2">
              {/* Optional Timer */}
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
                      onClick={resetTimer}
                      className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button
                      onClick={handleToggleTimer}
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

          {/* Quick Reference Drawer */}
          {isFilterDrawerOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
              <div className="absolute inset-0" onClick={() => setIsFilterDrawerOpen(false)} />
              <div className="relative bg-zinc-900 border-t border-zinc-700 rounded-t-2xl p-4 max-h-[80vh] flex flex-col max-w-md mx-auto w-full z-10 text-left">
                <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3" onClick={() => setIsFilterDrawerOpen(false)} />

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-200">
                    Methodology & Notes
                  </span>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[50vh] space-y-2 text-xs text-left pr-1">
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <span className="font-semibold text-zinc-200 block mb-1">
                      {currentBehavior.title} - Step {currentStep.stepNumber} Method
                    </span>
                    <p className="text-zinc-400">{currentStep.instructionsMarkdown}</p>
                  </div>

                  {currentStep.callouts.map((c, idx) => (
                    <CalloutCard key={idx} callout={c} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
