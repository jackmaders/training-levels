import { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  Check,
  X,
  Star,
  ArrowRight
} from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { getCriteriaConfig } from '../lib/criteriaHelper';
import { CalloutCard } from '../components/CalloutCard';
import { RepStatus } from '../components/RepMatrix';

export function VariantB() {
  const [view, setView] = useState<'select' | 'session'>('select');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [activeBehaviorKey, setActiveBehaviorKey] = useState('zen');
  const [activeStepNumber, setActiveStepNumber] = useState(1);
  const [expandedBehaviorKey, setExpandedBehaviorKey] = useState<string>('zen');

  // In-session state
  const [activeRepIndex, setActiveRepIndex] = useState(0);
  const [reps, setReps] = useState<RepStatus[]>(['empty', 'empty', 'empty', 'empty', 'empty']);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // In-session timer
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const levelData = getLevel(selectedLevel);
  const activeBehavior = levelData.behaviors.find((b) => b.behaviorKey === activeBehaviorKey) ?? levelData.behaviors[0];
  const activeStep = activeBehavior.steps.find((s) => s.stepNumber === activeStepNumber) ?? activeBehavior.steps[0];
  const criteriaConfig = getCriteriaConfig(activeStep.criterionSummary, activeStep.title);

  const startSession = (behaviorKey: string, stepNum: number) => {
    setActiveBehaviorKey(behaviorKey);
    setActiveStepNumber(stepNum);
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

    if (activeRepIndex < 4) {
      setActiveRepIndex(activeRepIndex + 1);
    }
  };

  const passCount = reps.filter((r) => r === 'pass' || r === 'cold').length;
  const isAllLogged = reps.every((r) => r !== 'empty');
  const isGoalMet = passCount >= 4;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between pb-32 max-w-md mx-auto border-x border-zinc-800">
      {/* =========================================================================
          PAGE 1: SELECTION (WORKOUT DRILL STREAM)
         ========================================================================= */}
      {view === 'select' && (
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 pt-3 pb-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-200">
                Level {selectedLevel} Workout Curriculum
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedLevel(lvl);
                      setActiveStepNumber(1);
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

            <div className="text-[11px] text-zinc-400">
              Select an exercise to launch a 5-minute training burst.
            </div>
          </header>

          <main className="px-4 py-3 flex-1 overflow-y-auto space-y-3 text-left">
            {levelData.behaviors.map((b) => {
              const isExpanded = b.behaviorKey === expandedBehaviorKey;

              return (
                <div
                  key={b.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition"
                >
                  <div
                    onClick={() => setExpandedBehaviorKey(isExpanded ? '' : b.behaviorKey)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/60"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{b.title}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">5 Progressive Steps</div>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>

                  {isExpanded && (
                    <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 space-y-2">
                      {b.steps.map((s) => {
                        const cfg = getCriteriaConfig(s.criterionSummary, s.title);

                        return (
                          <div
                            key={s.stepNumber}
                            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between gap-2"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-zinc-200">
                                  Step {s.stepNumber}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800">
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 line-clamp-1">
                                {s.criterionSummary}
                              </p>
                            </div>

                            <button
                              onClick={() => startSession(b.behaviorKey, s.stepNumber)}
                              className="px-3 py-1.5 bg-zinc-100 text-zinc-900 hover:bg-white text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <span>Train</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </main>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: IN-SESSION DRILL (PROGRESS STRIP + BOTTOM SPLIT DOCK)
         ========================================================================= */}
      {view === 'session' && (
        <div className="flex-1 flex flex-col justify-between">
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setView('select')}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Curriculum</span>
              </button>

              <span className="text-xs font-semibold text-zinc-200">
                {activeBehavior.title} (Step {activeStep.stepNumber})
              </span>

              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 flex items-center gap-1 cursor-pointer"
              >
                <BookOpen size={12} />
                <span>Ref</span>
              </button>
            </div>

            {/* 5 Rep Tabs Across Top */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {reps.map((status, idx) => {
                const isActive = idx === activeRepIndex;
                let statusLabel = '—';
                let style = 'bg-zinc-950 border-zinc-800 text-zinc-400';

                if (status === 'pass') {
                  style = 'bg-emerald-950/80 border-emerald-600 text-emerald-300';
                  statusLabel = '✓ Pass';
                } else if (status === 'miss') {
                  style = 'bg-rose-950/80 border-rose-600 text-rose-300';
                  statusLabel = '✕ Miss';
                } else if (status === 'cold') {
                  style = 'bg-amber-950/80 border-amber-500 text-amber-300';
                  statusLabel = '★ Cold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveRepIndex(idx)}
                    className={`py-1.5 px-1 rounded-lg border text-center cursor-pointer transition ${style} ${
                      isActive ? 'ring-2 ring-zinc-300 font-bold' : ''
                    }`}
                  >
                    <div className="text-[10px] font-mono text-zinc-400">R{idx + 1}</div>
                    <div className="text-[10px] font-mono font-semibold mt-0.5">{statusLabel}</div>
                  </button>
                );
              })}
            </div>
          </header>

          <main className="px-4 py-3 flex-1 text-left space-y-3">
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

            {/* Active Rep Target Card */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                  Target for Rep {activeRepIndex + 1} of 5
                </span>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                  Score: {passCount}/5
                </span>
              </div>

              <h2 className="text-sm font-semibold text-zinc-100 mb-2">
                {activeStep.title}
              </h2>

              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                {activeStep.criterionSummary}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200 block mb-1">Handling Cue:</span>
              {activeStep.instructionsMarkdown}
            </div>
          </main>

          {/* Fixed Bottom Dock with In-Session Actions */}
          <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-lg space-y-2">
              {/* Optional Timer Trigger Button if duration based */}
              {criteriaConfig.type === 'timing' && (
                <button
                  onClick={() => {
                    setIsTimerRunning(!isTimerRunning);
                    if (timerSecondsLeft === 0) setTimerSecondsLeft(criteriaConfig.durationSeconds || 5);
                  }}
                  className={`w-full py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-700 text-white'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  }`}
                >
                  <Clock size={14} />
                  <span>{isTimerRunning ? `Counting: ${timerSecondsLeft}s` : `Start ${criteriaConfig.durationSeconds || 5}s Timer`}</span>
                </button>
              )}

              {/* Rep Result Logging Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleLogRep('pass')}
                  className="py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check size={15} />
                  <span>Pass</span>
                </button>
                <button
                  onClick={() => handleLogRep('miss')}
                  className="py-2 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X size={15} />
                  <span>Miss</span>
                </button>
                <button
                  onClick={() => handleLogRep('cold')}
                  className="py-2 bg-amber-700 hover:bg-amber-600 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Star size={14} className="fill-black" />
                  <span>Cold</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Drawer */}
          {isFilterDrawerOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
              <div className="absolute inset-0" onClick={() => setIsFilterDrawerOpen(false)} />
              <div className="relative bg-zinc-900 border-t border-zinc-700 rounded-t-2xl p-4 max-h-[80vh] flex flex-col max-w-md mx-auto w-full z-10 text-left">
                <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3" onClick={() => setIsFilterDrawerOpen(false)} />

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-200">
                    Reference Drawer
                  </span>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 mb-2">
                  {['all', 'tips', 'warning', 'criteria', 'comebefores'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterType(tag)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase cursor-pointer ${
                        filterType === tag
                          ? 'bg-zinc-700 text-white font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto max-h-[50vh] space-y-2 text-xs text-left pr-1">
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <span className="font-semibold text-zinc-200 block mb-1">
                      {activeBehavior.title} - Step {activeStep.stepNumber}
                    </span>
                    <p className="text-zinc-400">{activeStep.instructionsMarkdown}</p>
                  </div>

                  {activeStep.callouts.map((c, idx) => (
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
