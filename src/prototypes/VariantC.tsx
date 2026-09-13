import { useState } from 'react';
import { 
  BookOpen, 
  Star, 
  RotateCcw
} from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { RepMatrix, RepStatus } from '../components/RepMatrix';
import { HoldTimer } from '../components/HoldTimer';
import { CalloutCard } from '../components/CalloutCard';

export function VariantC() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedBehaviorIndex, setSelectedBehaviorIndex] = useState(0);
  const [selectedStepNumber, setSelectedStepNumber] = useState(1);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isColdTestMode, setIsColdTestMode] = useState(false);

  const [reps, setReps] = useState<RepStatus[]>(['pass', 'pass', 'pass', 'miss', 'empty']);

  const levelData = getLevel(selectedLevel);
  const currentBehavior = levelData.behaviors[selectedBehaviorIndex] ?? levelData.behaviors[0];
  const currentStep = currentBehavior.steps.find((s) => s.stepNumber === selectedStepNumber) ?? currentBehavior.steps[0];

  const handleRepChange = (index: number, nextStatus: RepStatus) => {
    const updated = [...reps];
    updated[index] = nextStatus;
    setReps(updated);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between pb-32 max-w-md mx-auto border-x border-zinc-800">
      {/* 1. Header: Level & Behavior Ribbon */}
      <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-200">
            Level {selectedLevel} HUD
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevel(lvl);
                  setSelectedBehaviorIndex(0);
                  setSelectedStepNumber(1);
                  setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
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

        {/* Behavior Selector Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {levelData.behaviors.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBehaviorIndex(idx);
                setSelectedStepNumber(1);
                setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
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

      {/* 2. Main Body: Step Selector Ribbon, Criterion, Timer, Reps */}
      <main className="px-4 py-3 flex-1 flex flex-col text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono text-zinc-400 uppercase font-bold">
            {currentBehavior.title} • Step {selectedStepNumber}
          </div>
          <button
            onClick={() => setIsColdTestMode(!isColdTestMode)}
            className={`px-2 py-0.5 rounded text-xs font-mono transition flex items-center gap-1 cursor-pointer ${
              isColdTestMode
                ? 'bg-amber-600 text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
            }`}
          >
            <Star size={12} className={isColdTestMode ? 'fill-black' : ''} />
            {isColdTestMode ? 'Cold Test' : 'Practice'}
          </button>
        </div>

        {/* Step Selector Ribbon */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {currentBehavior.steps.map((s) => (
            <button
              key={s.stepNumber}
              onClick={() => {
                setSelectedStepNumber(s.stepNumber);
                setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
              }}
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

        {/* Criterion Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 mb-3">
          <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
            Target Criteria (4/5 reps)
          </div>
          <h2 className="text-base font-semibold text-zinc-100 mb-2">
            {currentStep.title}
          </h2>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
            {currentStep.criterionSummary}
          </div>
        </div>

        {/* Hold Timer */}
        <div className="mb-3">
          <HoldTimer durationSeconds={5} label={`${currentBehavior.title} 5s Hold`} />
        </div>

        {/* 5-Rep Matrix */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
          <RepMatrix reps={reps} onRepChange={handleRepChange} />
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-2 px-1">
            <span>Cycle: Pass (✓) • Miss (✕) • Cold (★)</span>
            <button
              onClick={() => setReps(['empty', 'empty', 'empty', 'empty', 'empty'])}
              className="text-zinc-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        </div>
      </main>

      {/* 3. UX Feature: Floating Right-Edge Drawer Pull Tab */}
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

      {/* 4. UX Feature: Right-Side Slide-Over Drawer */}
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
                    {currentBehavior.comebefores}
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
  );
}
