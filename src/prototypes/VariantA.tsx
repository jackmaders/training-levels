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

export function VariantA() {
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'tips' | 'criteria' | 'prep'>('tips');

  const currentBehavior = getBehavior(sessionLevel, sessionBehaviorKey);
  const currentStep = getStep(sessionLevel, sessionBehaviorKey, sessionStepNumber);
  const criteriaConfig = getCriteriaConfig(currentStep.criterionSummary, currentStep.title);

  const passCount = reps.filter((r) => r === 'pass').length;
  const isPracticeDone = reps.every((r) => r !== 'empty');
  const isColdDone = coldResult !== 'pending';
  const isFinished = sessionType === 'cold' ? isColdDone : isPracticeDone;
  const isGoalMet = sessionType === 'cold' ? coldResult === 'pass' : passCount >= 4;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between pb-36 max-w-md mx-auto border-x border-zinc-800">
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
          {/* Primary Recommended Next Exercise Card */}
          <div className="bg-zinc-900 border-2 border-zinc-700 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300">
                <Sparkles size={14} className="text-amber-400" />
                <span>RECOMMENDED NEXT DRILL</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Level 1 • Step 1
              </span>
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              Zen: Watch Treat for 5 Seconds
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Dog watches treat in open hand without moving towards it for 5 seconds. Builds impulse foundation.
            </p>

            {/* Session Type Switcher */}
            <div className="bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex items-center gap-1 mb-3">
              <button
                type="button"
                onClick={() => setSessionType('practice')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                  sessionType === 'practice' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Practice (5 Reps)
              </button>
              <button
                type="button"
                onClick={() => setSessionType('cold')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                  sessionType === 'cold' ? 'bg-amber-950 text-amber-300 border border-amber-600/70 font-bold' : 'text-zinc-400 hover:text-zinc-200'
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
              <span>{sessionType === 'cold' ? 'Start Cold Test Certification' : 'Start 5-Minute Practice Session'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Session History */}
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
          PAGE 1C: REFERENCE LIBRARY (SUE'S GENERAL RULES)
         ========================================================================= */}
      {route === 'library' && (
        <main className="p-4 flex-1 text-left space-y-3">
          <div className="text-xs font-semibold text-zinc-200">Sue Ailsby Master Guidelines</div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-2">
            <span className="font-bold text-white block">Pre-Brief, Be Brief, Debrief:</span>
            <p>1. Count out 5-10 treats beforehand.</p>
            <p>2. Keep active drills under 5 minutes.</p>
            <p>3. Aim for 80% compliance (4/5 reps) before advancing.</p>
            <p>4. Cold tests must be attempted on a separate day with zero warm-up.</p>
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
          PAGE 2: IN-SESSION DRILL (CLEAN CENTER + ALL-IN-ONE BOTTOM BAR)
         ========================================================================= */}
      {route === 'session' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Minimal Session Header */}
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setRoute('home')}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Exit</span>
            </button>

            <div className="text-xs font-semibold text-zinc-200">
              Level {sessionLevel} {currentBehavior.title} • Step {currentStep.stepNumber}
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              {sessionType === 'cold' ? 'Cold Test' : 'Practice'}
            </span>
          </header>

          {/* Clean Main Viewport: Criterion & Methodology Button */}
          <main className="px-4 py-4 flex-1 text-left space-y-3">
            {/* Session Finished Card */}
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
                    {isGoalMet ? 'Ready to log completion into history.' : 'Review method in drawer and retry in next session.'}
                  </span>
                </div>
                <button
                  onClick={finishSession}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-900 font-bold rounded-lg text-xs cursor-pointer shadow"
                >
                  Save & Return
                </button>
              </div>
            )}

            {/* Step Target Box with Info Button */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                  {sessionType === 'cold' ? 'COLD TEST CRITERION (1 ATTEMPT)' : `CRITERION TARGET (REP ${activeRepIndex + 1} OF 5)`}
                </span>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  aria-label="View Exercise Methodology and Notes"
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-100 px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition cursor-pointer"
                  title="View Exercise Methodology and Tips"
                >
                  <BookOpen size={13} />
                  <span>Info</span>
                </button>
              </div>

              <h2 className="text-sm font-semibold text-zinc-100 mb-2">
                {currentStep.title}
              </h2>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                {sessionType === 'cold' && currentStep.tryItCold ? currentStep.tryItCold : currentStep.criterionSummary}
              </div>
            </div>
          </main>

          {/* =========================================================================
              ALL-IN-ONE BOTTOM BAR: TIMER + 5-REP TRACKER + PASS/MISS BUTTONS
             ========================================================================= */}
          <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-3 flex flex-col gap-2.5 shadow-xl">
              {/* 1. Timer if duration based */}
              {criteriaConfig.type === 'timing' && (
                <div className="flex items-center justify-between gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                  <span className="font-mono text-xs font-bold text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    {timerSecondsLeft}s
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
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
                      className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                        isTimerRunning ? 'bg-amber-700 text-white' : 'bg-zinc-100 text-zinc-900'
                      }`}
                    >
                      {isTimerRunning ? 'Pause' : timerSecondsLeft === 0 ? 'Restart' : 'Start'}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Rep Tracker */}
              {sessionType === 'practice' && (
                <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                  {reps.map((status, idx) => {
                    const isActive = idx === activeRepIndex;
                    let icon = <span className="text-[10px] font-mono text-zinc-500">{idx + 1}</span>;
                    let style = 'bg-zinc-900 border-zinc-800 text-zinc-400';

                    if (status === 'pass') {
                      style = 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold';
                      icon = <Check size={13} className="text-emerald-400" strokeWidth={3} />;
                    } else if (status === 'miss') {
                      style = 'bg-rose-950 border-rose-600 text-rose-300 font-bold';
                      icon = <X size={13} className="text-rose-400" strokeWidth={3} />;
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveRepIndex(idx)}
                        className={`py-1 rounded border flex flex-col items-center justify-center cursor-pointer transition ${style} ${
                          isActive ? 'ring-2 ring-zinc-300 font-bold' : ''
                        }`}
                      >
                        <span className="text-[9px] font-mono leading-none">R{idx + 1}</span>
                        <div className="h-3.5 flex items-center justify-center mt-0.5">{icon}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Pass / Miss Action Buttons (Miss on left, Pass on right) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLogRep('miss')}
                  className="py-2.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow"
                >
                  <X size={16} strokeWidth={3} />
                  <span>MISS REP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLogRep('pass')}
                  className="py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow"
                >
                  <Check size={16} strokeWidth={3} />
                  <span>PASS REP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slide-Up Methodology Drawer */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
              <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
              <div className="relative bg-zinc-900 border-t border-zinc-700 rounded-t-2xl p-4 max-h-[80vh] flex flex-col max-w-md mx-auto w-full z-10 text-left">
                <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3" onClick={() => setIsDrawerOpen(false)} />

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                      {currentBehavior.title} Methodology
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      Step {currentStep.stepNumber}: {currentStep.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 mb-3">
                  <button
                    onClick={() => setDrawerTab('tips')}
                    className={`flex-1 py-1 text-xs font-semibold rounded cursor-pointer ${
                      drawerTab === 'tips' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
                    }`}
                  >
                    Instructions & Tips
                  </button>
                  <button
                    onClick={() => setDrawerTab('criteria')}
                    className={`flex-1 py-1 text-xs font-semibold rounded cursor-pointer ${
                      drawerTab === 'criteria' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
                    }`}
                  >
                    Criteria Table
                  </button>
                  <button
                    onClick={() => setDrawerTab('prep')}
                    className={`flex-1 py-1 text-xs font-semibold rounded cursor-pointer ${
                      drawerTab === 'prep' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
                    }`}
                  >
                    Prerequisites
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1 text-xs">
                  {drawerTab === 'tips' && (
                    <>
                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-300">
                        <span className="font-semibold text-zinc-100 block mb-1">Step Method:</span>
                        {currentStep.instructionsMarkdown}
                      </div>
                      {currentStep.callouts.map((c, i) => (
                        <CalloutCard key={i} callout={c} />
                      ))}
                    </>
                  )}

                  {drawerTab === 'criteria' && (
                    <div className="space-y-1.5">
                      {currentBehavior.criteriaTable.map((row) => (
                        <div
                          key={row.step}
                          className={`p-2.5 rounded-lg border ${
                            row.step === currentStep.stepNumber
                              ? 'bg-zinc-800 border-zinc-600'
                              : 'bg-zinc-950 border-zinc-800'
                          }`}
                        >
                          <span className="font-semibold block mb-0.5 text-zinc-200">Step {row.step}</span>
                          <p className="text-zinc-400">{row.criteria}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {drawerTab === 'prep' && (
                    <div className="space-y-2">
                      {currentBehavior.equipment && (
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                          <span className="font-semibold block text-zinc-200 mb-1">Equipment:</span>
                          <p className="text-zinc-400">{currentBehavior.equipment}</p>
                        </div>
                      )}
                      {currentBehavior.comebefores && (
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                          <span className="font-semibold block text-zinc-200 mb-1">Prerequisites:</span>
                          <p className="text-zinc-400">{currentBehavior.comebefores}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
