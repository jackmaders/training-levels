import { useState } from 'react';
import { 
  ChevronUp, 
  ChevronLeft,
  BookOpen,
  Check,
  X,
  Star,
  RotateCcw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { getCriteriaConfig } from '../lib/criteriaHelper';
import { CalloutCard } from '../components/CalloutCard';
import { RepStatus } from '../components/RepMatrix';

export function VariantA() {
  const [view, setView] = useState<'select' | 'session'>('select');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedBehaviorIndex, setSelectedBehaviorIndex] = useState(0);
  const [selectedStepNumber, setSelectedStepNumber] = useState(1);

  // In-session state
  const [activeRepIndex, setActiveRepIndex] = useState(0);
  const [reps, setReps] = useState<RepStatus[]>(['empty', 'empty', 'empty', 'empty', 'empty']);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'tips' | 'criteria' | 'prep'>('tips');

  // In-session timer state
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const levelData = getLevel(selectedLevel);
  const currentBehavior = levelData.behaviors[selectedBehaviorIndex] ?? levelData.behaviors[0];
  const currentStep = currentBehavior.steps.find((s) => s.stepNumber === selectedStepNumber) ?? currentBehavior.steps[0];
  const criteriaConfig = getCriteriaConfig(currentStep.criterionSummary, currentStep.title);

  const startSession = (stepNum: number) => {
    setSelectedStepNumber(stepNum);
    setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
    setActiveRepIndex(0);
    setTimerSecondsLeft(criteriaConfig.durationSeconds || 5);
    setIsTimerRunning(false);
    setView('session');
  };

  const handleLogRep = (status: RepStatus) => {
    const updated = [...reps];
    updated[activeRepIndex] = status;
    setReps(updated);

    // Auto-advance to next empty rep if available
    if (activeRepIndex < 4) {
      setActiveRepIndex(activeRepIndex + 1);
    }
  };

  const handleToggleTimer = () => {
    if (timerSecondsLeft === 0) {
      setTimerSecondsLeft(criteriaConfig.durationSeconds || 5);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  // Timer countdown effect
  useState(() => {
    const interval = setInterval(() => {
      if (isTimerRunning) {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  const passCount = reps.filter((r) => r === 'pass' || r === 'cold').length;
  const isAllLogged = reps.every((r) => r !== 'empty');
  const isGoalMet = passCount >= 4;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between pb-36 max-w-md mx-auto border-x border-zinc-800">
      {/* =========================================================================
          PAGE 1: EXERCISE SELECTION (PRE-BRIEF)
         ========================================================================= */}
      {view === 'select' && (
        <div className="flex-1 flex flex-col">
          {/* Header: Level Tabs */}
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300">
                Select Training Exercise
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedLevel(lvl);
                      setSelectedBehaviorIndex(0);
                      setSelectedStepNumber(1);
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    L{lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Behavior Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {levelData.behaviors.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBehaviorIndex(idx);
                    setSelectedStepNumber(1);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                    idx === selectedBehaviorIndex
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {b.title}
                </button>
              ))}
            </div>
          </header>

          {/* Exercise Step Cards */}
          <main className="px-4 py-3 flex-1 text-left space-y-3">
            <div className="text-xs text-zinc-400 font-mono uppercase">
              {currentBehavior.title} Steps (Level {selectedLevel})
            </div>

            {currentBehavior.steps.map((s) => {
              const cfg = getCriteriaConfig(s.criterionSummary, s.title);
              const isCurrent = s.stepNumber === selectedStepNumber;

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStepNumber(s.stepNumber)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-zinc-900 border-zinc-500 ring-1 ring-zinc-500'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      Step {s.stepNumber}: {s.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {cfg.type === 'timing' ? `⏱️ ${cfg.label}` : '🎯 5 Reps'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {s.criterionSummary}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startSession(s.stepNumber);
                    }}
                    className="w-full py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Start 5-Rep Session</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </main>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: IN-SESSION DRILL (TABBED REPS + BOTTOM GOAL ACTION)
         ========================================================================= */}
      {view === 'session' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Top Session Bar */}
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setView('select')}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Exercises</span>
              </button>

              <div className="text-xs font-semibold text-zinc-200">
                Level {selectedLevel} • {currentBehavior.title}
              </div>

              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                Step {currentStep.stepNumber}
              </span>
            </div>

            {/* 5 Rep Tabs Along Top */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {reps.map((status, idx) => {
                const isActive = idx === activeRepIndex;
                let statusIcon = <span className="font-mono text-[10px] text-zinc-500">--</span>;
                let statusStyle = 'bg-zinc-950 border-zinc-800 text-zinc-400';

                if (status === 'pass') {
                  statusStyle = 'bg-emerald-950/80 border-emerald-600 text-emerald-300';
                  statusIcon = <Check size={14} className="text-emerald-400" strokeWidth={3} />;
                } else if (status === 'miss') {
                  statusStyle = 'bg-rose-950/80 border-rose-600 text-rose-300';
                  statusIcon = <X size={14} className="text-rose-400" strokeWidth={3} />;
                } else if (status === 'cold') {
                  statusStyle = 'bg-amber-950/80 border-amber-500 text-amber-300';
                  statusIcon = <Star size={14} className="fill-amber-400 text-amber-400" />;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveRepIndex(idx)}
                    className={`py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition ${statusStyle} ${
                      isActive ? 'ring-2 ring-zinc-300 font-bold' : ''
                    }`}
                  >
                    <span className="text-[10px] font-mono">Rep {idx + 1}</span>
                    <div className="h-4 flex items-center justify-center mt-0.5">
                      {statusIcon}
                    </div>
                  </button>
                );
              })}
            </div>
          </header>

          {/* Main: Active Rep Criterion & Method */}
          <main className="px-4 py-3 flex-1 text-left space-y-3">
            {/* Completion Banner if all reps logged */}
            {isAllLogged && (
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                isGoalMet
                  ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300'
              }`}>
                <div>
                  <span className="font-bold block">
                    {isGoalMet ? '✓ 4/5 Passed — Target Achieved!' : `Session Finished (${passCount}/5)`}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {isGoalMet ? 'Ready to attempt Cold Test tomorrow.' : 'Try another 5-rep burst to hit 80% compliance.'}
                  </span>
                </div>
                <button
                  onClick={() => setView('select')}
                  className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-bold rounded text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {/* Criterion Box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                  Active Goal (Rep {activeRepIndex + 1} of 5)
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Target: 4/5 reps
                </span>
              </div>
              <h2 className="text-sm font-semibold text-zinc-100 mb-1.5">
                {currentStep.title}
              </h2>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                {currentStep.criterionSummary}
              </div>
            </div>

            {/* Instruction Snippet */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200 block mb-1">Method:</span>
              {currentStep.instructionsMarkdown}
            </div>
          </main>

          {/* Fixed Bottom Arc: Goal Action (Timer/Reps) + Quick Ref Pull-up */}
          <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-3 flex flex-col gap-2.5 shadow-lg">
              {/* Quick Reference Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-xs font-semibold text-zinc-200 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-zinc-400" />
                  Quick Reference & Sue's Tips
                </span>
                <ChevronUp size={16} className="text-zinc-400" />
              </button>

              {/* Dynamic Goal Action based on criteria type */}
              {criteriaConfig.type === 'timing' && (
                <div className="flex items-center justify-between gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <button
                    onClick={handleToggleTimer}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isTimerRunning
                        ? 'bg-amber-700 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                    }`}
                  >
                    <Clock size={14} />
                    <span>{isTimerRunning ? `Holding: ${timerSecondsLeft}s` : `Start ${criteriaConfig.durationSeconds || 5}s Timer`}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTimerSecondsLeft(criteriaConfig.durationSeconds || 5);
                      setIsTimerRunning(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}

              {/* Rep Logging Split Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLogRep('pass')}
                  className="py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Check size={16} strokeWidth={3} />
                  <span>Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLogRep('miss')}
                  className="py-2.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <X size={16} strokeWidth={3} />
                  <span>Miss</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLogRep('cold')}
                  className="py-2.5 bg-amber-700 hover:bg-amber-600 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Star size={15} className="fill-black" />
                  <span>Cold Pass</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick-Reference Slide-Up Bottom Sheet */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
              <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
              <div className="relative bg-zinc-900 border-t border-zinc-700 rounded-t-2xl p-4 max-h-[80vh] flex flex-col max-w-md mx-auto w-full z-10 text-left">
                <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3" onClick={() => setIsDrawerOpen(false)} />

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                      {currentBehavior.title} Reference
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
                    Tips ({currentStep.callouts.length})
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
                        <span className="font-semibold text-zinc-100 block mb-1">Method:</span>
                        {currentStep.instructionsMarkdown}
                      </div>
                      {currentStep.callouts.map((c, i) => (
                        <CalloutCard key={i} callout={c} />
                      ))}
                      {currentStep.tryItCold && (
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
                          <span className="font-semibold text-zinc-100 block mb-1">Cold Test:</span>
                          {currentStep.tryItCold}
                        </div>
                      )}
                    </>
                  )}

                  {drawerTab === 'criteria' && (
                    <div className="space-y-1.5">
                      {currentBehavior.criteriaTable.map((row) => (
                        <div
                          key={row.step}
                          className={`p-2.5 rounded-lg border ${
                            row.step === selectedStepNumber
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
