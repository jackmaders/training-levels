import { useState } from 'react';
import { 
  BookOpen, 
  ChevronLeft,
  Check, 
  X, 
  Star, 
  Clock,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { getCriteriaConfig } from '../lib/criteriaHelper';
import { CalloutCard } from '../components/CalloutCard';
import { RepStatus } from '../components/RepMatrix';

export function VariantC() {
  const [view, setView] = useState<'select' | 'session'>('select');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedBehaviorIndex, setSelectedBehaviorIndex] = useState(0);
  const [selectedStepNumber, setSelectedStepNumber] = useState(1);

  // In-session state
  const [activeRepIndex, setActiveRepIndex] = useState(0);
  const [reps, setReps] = useState<RepStatus[]>(['empty', 'empty', 'empty', 'empty', 'empty']);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  // In-session timer
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(5);
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
          PAGE 1: SELECTION (STEP RIBBON HUD)
         ========================================================================= */}
      {view === 'select' && (
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-200">
                Level {selectedLevel} HUD Selector
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

          <main className="px-4 py-3 flex-1 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                {currentBehavior.title} Steps
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Step {selectedStepNumber} selected
              </span>
            </div>

            {/* Step Selection Grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {currentBehavior.steps.map((s) => (
                <button
                  key={s.stepNumber}
                  onClick={() => setSelectedStepNumber(s.stepNumber)}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center font-mono cursor-pointer ${
                    s.stepNumber === selectedStepNumber
                      ? 'bg-zinc-100 text-zinc-900 font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] uppercase">Step</span>
                  <span className="text-base leading-none font-bold">{s.stepNumber}</span>
                </button>
              ))}
            </div>

            {/* Selected Step Preview Card */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Step {currentStep.stepNumber}: {currentStep.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {criteriaConfig.label}
                </span>
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                {currentStep.criterionSummary}
              </div>

              <button
                onClick={() => startSession(currentStep.stepNumber)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Launch 5-Rep Session</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </main>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: IN-SESSION DRILL (STEP HUD + RIGHT EDGE DRAWER TAB)
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
                <span>Selector</span>
              </button>

              <span className="text-xs font-semibold text-zinc-200">
                {currentBehavior.title} (Step {currentStep.stepNumber})
              </span>

              <span className="text-[10px] font-mono text-zinc-400">
                Score: {passCount}/5
              </span>
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
                  Goal: 4/5 reps
                </span>
              </div>

              <h2 className="text-sm font-semibold text-zinc-100 mb-2">
                {currentStep.title}
              </h2>

              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                {currentStep.criterionSummary}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200 block mb-1">Method:</span>
              {currentStep.instructionsMarkdown}
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
              Ref Tab
            </span>
          </button>

          {/* Fixed Bottom Action Arc */}
          <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-2.5 shadow-lg space-y-2">
              {/* Optional Timer Trigger Button */}
              {criteriaConfig.type === 'timing' && (
                <div className="flex items-center justify-between gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                  <button
                    onClick={() => {
                      setIsTimerRunning(!isTimerRunning);
                      if (timerSecondsLeft === 0) setTimerSecondsLeft(criteriaConfig.durationSeconds || 5);
                    }}
                    className={`flex-1 py-1.5 rounded-md font-mono text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      isTimerRunning ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <Clock size={13} />
                    <span>{isTimerRunning ? `Hold: ${timerSecondsLeft}s` : `Start ${criteriaConfig.durationSeconds || 5}s Timer`}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTimerSecondsLeft(criteriaConfig.durationSeconds || 5);
                      setIsTimerRunning(false);
                    }}
                    className="p-1.5 bg-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              )}

              {/* Rep Logging Split Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleLogRep('pass')}
                  className="py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check size={16} />
                  <span>Pass</span>
                </button>
                <button
                  onClick={() => handleLogRep('miss')}
                  className="py-2.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X size={16} />
                  <span>Miss</span>
                </button>
                <button
                  onClick={() => handleLogRep('cold')}
                  className="py-2.5 bg-amber-700 hover:bg-amber-600 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Star size={15} className="fill-black" />
                  <span>Cold</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right-Side Slide-Over Drawer */}
          {isSideDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
              <div className="absolute inset-0" onClick={() => setIsSideDrawerOpen(false)} />
              <div className="relative bg-zinc-900 border-l border-zinc-700 p-4 max-w-xs w-full h-full flex flex-col justify-between shadow-xl z-10 text-left">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Side Reference
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

                    {currentBehavior.comebefores && (
                      <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
                        <span className="font-semibold text-zinc-200 block mb-1">Prerequisites:</span>
                        <p className="text-zinc-400">{currentBehavior.comebefores}</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsSideDrawerOpen(false)}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg cursor-pointer mt-2"
                >
                  Resume
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
