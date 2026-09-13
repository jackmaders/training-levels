import { useState } from 'react';
import { 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { RepMatrix, RepStatus } from '../components/RepMatrix';
import { HoldTimer } from '../components/HoldTimer';
import { CalloutCard } from '../components/CalloutCard';

export function VariantA() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedBehaviorIndex, setSelectedBehaviorIndex] = useState(0);
  const [selectedStepNumber, setSelectedStepNumber] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'tips' | 'criteria' | 'prep'>('tips');
  
  const [reps, setReps] = useState<RepStatus[]>(['pass', 'pass', 'pass', 'empty', 'empty']);
  
  const levelData = getLevel(selectedLevel);
  const currentBehavior = levelData.behaviors[selectedBehaviorIndex] ?? levelData.behaviors[0];
  const currentStep = currentBehavior.steps.find((s) => s.stepNumber === selectedStepNumber) ?? currentBehavior.steps[0];

  const handleRepChange = (index: number, nextStatus: RepStatus) => {
    const updated = [...reps];
    updated[index] = nextStatus;
    setReps(updated);
  };

  const nextBehavior = () => {
    if (selectedBehaviorIndex < levelData.behaviors.length - 1) {
      setSelectedBehaviorIndex(selectedBehaviorIndex + 1);
      setSelectedStepNumber(1);
      setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
    }
  };

  const prevBehavior = () => {
    if (selectedBehaviorIndex > 0) {
      setSelectedBehaviorIndex(selectedBehaviorIndex - 1);
      setSelectedStepNumber(1);
      setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between pb-36 max-w-md mx-auto border-x border-zinc-800">
      {/* 1. Header: Level Switcher & Behavior Selector */}
      <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-zinc-300">
            Level {selectedLevel} • {currentBehavior.title}
          </div>

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

        {/* Behavior Switcher */}
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

      {/* 2. Main: Single Active Step Card */}
      <main className="px-4 py-3 flex-1 flex flex-col text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-zinc-400 uppercase">
            Step {currentStep.stepNumber} of 5
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevBehavior}
              disabled={selectedBehaviorIndex === 0}
              className="p-1 rounded bg-zinc-800 text-zinc-400 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextBehavior}
              disabled={selectedBehaviorIndex === levelData.behaviors.length - 1}
              className="p-1 rounded bg-zinc-800 text-zinc-400 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Step Selector Pills */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {currentBehavior.steps.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedStepNumber(s.stepNumber);
                setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
              }}
              className={`py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                s.stepNumber === selectedStepNumber
                  ? 'bg-zinc-100 text-zinc-900 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
              }`}
            >
              S{s.stepNumber}
            </button>
          ))}
        </div>

        {/* Step Criterion Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 mb-3">
          <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
            Criteria
          </div>
          <h2 className="text-base font-semibold text-zinc-100 mb-2">
            {currentStep.title}
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
            {currentStep.criterionSummary}
          </p>
          <div className="mt-2 text-xs text-zinc-400 line-clamp-2">
            {currentStep.instructionsMarkdown}
          </div>
        </div>

        {/* Hold Timer */}
        <div className="mb-3">
          <HoldTimer durationSeconds={5} label={`${currentBehavior.title} 5s Timer`} />
        </div>
      </main>

      {/* 3. UX Feature: Bottom-Anchored Thumb Action Arc */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-3 flex flex-col gap-2 shadow-lg">
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

          <RepMatrix reps={reps} onRepChange={handleRepChange} />
        </div>
      </div>

      {/* 4. UX Feature: Bottom Slide-Up Sheet (Vaul style) */}
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
                      <span className="font-semibold block text-zinc-200 mb-1">Prerequisites (Comebefores):</span>
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
  );
}
