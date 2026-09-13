import { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Layers, 
  Dog
} from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { RepMatrix, RepStatus } from '../components/RepMatrix';
import { HoldTimer } from '../components/HoldTimer';
import { CalloutCard } from '../components/CalloutCard';

export function VariantB() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [activeBehaviorKey, setActiveBehaviorKey] = useState('zen');
  const [activeStepNumber, setActiveStepNumber] = useState(1);
  const [activeBottomTab, setActiveBottomTab] = useState<'drills' | 'timer' | 'ref' | 'dog'>('drills');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const [repsState, setRepsState] = useState<Record<string, RepStatus[]>>({
    zen: ['pass', 'pass', 'pass', 'pass', 'empty'],
    come: ['pass', 'miss', 'pass', 'empty', 'empty'],
    sit: ['pass', 'pass', 'pass', 'pass', 'pass'],
    target: ['empty', 'empty', 'empty', 'empty', 'empty'],
    down: ['empty', 'empty', 'empty', 'empty', 'empty'],
  });

  const levelData = getLevel(selectedLevel);
  const activeBehavior = levelData.behaviors.find((b) => b.behaviorKey === activeBehaviorKey) ?? levelData.behaviors[0];
  const activeStep = activeBehavior.steps.find((s) => s.stepNumber === activeStepNumber) ?? activeBehavior.steps[0];

  const handleRepChange = (bKey: string, index: number, nextStatus: RepStatus) => {
    const current = repsState[bKey] ?? ['empty', 'empty', 'empty', 'empty', 'empty'];
    const updated = [...current];
    updated[index] = nextStatus;
    setRepsState({ ...repsState, [bKey]: updated });
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between pb-32 max-w-md mx-auto border-x border-zinc-800">
      {/* 1. Header: Level Switcher & Behavior Overview */}
      <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-200">
            Level {selectedLevel} Drill Stream
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

        {/* Behavior Status Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {levelData.behaviors.map((b) => {
            const isCurrent = b.behaviorKey === activeBehaviorKey;
            const bReps = repsState[b.behaviorKey] ?? ['empty', 'empty', 'empty', 'empty', 'empty'];
            const passes = bReps.filter((r) => r === 'pass' || r === 'cold').length;

            return (
              <button
                key={b.id}
                onClick={() => {
                  setActiveBehaviorKey(b.behaviorKey);
                  setActiveStepNumber(1);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{b.title}</span>
                <span className="font-mono text-[10px] opacity-70">({passes}/5)</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Main Drill Stream / Active Feed View */}
      <main className="px-4 py-3 flex-1 overflow-y-auto space-y-3 text-left">
        {activeBottomTab === 'drills' && (
          <>
            {/* Active Drill Card */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono text-zinc-400 uppercase font-bold">
                  {activeBehavior.title} (Active)
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen size={12} />
                  <span>Notes</span>
                </button>
              </div>

              {/* Step Navigation Pills */}
              <div className="flex items-center gap-1 my-2">
                {activeBehavior.steps.map((s) => (
                  <button
                    key={s.stepNumber}
                    onClick={() => setActiveStepNumber(s.stepNumber)}
                    className={`flex-1 py-1 text-xs font-mono font-semibold rounded cursor-pointer ${
                      s.stepNumber === activeStepNumber
                        ? 'bg-zinc-100 text-zinc-900 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    S{s.stepNumber}
                  </button>
                ))}
              </div>

              {/* Step Title & Criteria */}
              <div className="my-2.5 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs">
                <div className="font-semibold text-zinc-200 mb-1">
                  Step {activeStep.stepNumber}: {activeStep.title}
                </div>
                <div className="text-zinc-400 leading-relaxed">
                  {activeStep.criterionSummary}
                </div>
              </div>

              {/* 5-Rep Counter Matrix */}
              <div className="my-2.5 py-1">
                <RepMatrix
                  reps={repsState[activeBehaviorKey] ?? ['empty', 'empty', 'empty', 'empty', 'empty']}
                  onRepChange={(idx, next) => handleRepChange(activeBehaviorKey, idx, next)}
                />
              </div>

              <div className="text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Method: </span>
                {activeStep.instructionsMarkdown}
              </div>
            </div>

            {/* Other Behaviors in Level */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold">
                Other Level {selectedLevel} Behaviors
              </div>

              {levelData.behaviors
                .filter((b) => b.behaviorKey !== activeBehaviorKey)
                .map((b) => {
                  const bReps = repsState[b.behaviorKey] ?? ['empty', 'empty', 'empty', 'empty', 'empty'];
                  const passes = bReps.filter((r) => r === 'pass' || r === 'cold').length;

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setActiveBehaviorKey(b.behaviorKey);
                        setActiveStepNumber(1);
                      }}
                      className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-xs font-medium text-zinc-300">{b.title}</span>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                        <span>{passes}/5 reps</span>
                        <ChevronRight size={14} className="text-zinc-600" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {activeBottomTab === 'timer' && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-zinc-300">Timers</div>
            <HoldTimer durationSeconds={5} label="5s Hold Timer" />
            <HoldTimer durationSeconds={10} label="10s Stay Timer" />
            <HoldTimer durationSeconds={30} label="30s Down Timer" />
          </div>
        )}

        {activeBottomTab === 'ref' && (
          <div className="space-y-2 pt-1 text-xs">
            <div className="text-xs font-semibold text-zinc-300">Reference Notes</div>
            {activeBehavior.callouts.map((c, i) => (
              <CalloutCard key={i} callout={c} />
            ))}
          </div>
        )}

        {activeBottomTab === 'dog' && (
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <div className="text-sm font-semibold text-zinc-200">Barnaby</div>
            <div className="text-xs text-zinc-400">Level 1 • Golden Retriever</div>
          </div>
        )}
      </main>

      {/* 3. UX Feature: 4-Tab Bottom Navigation Dock */}
      <nav className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
        <div className="grid grid-cols-4 gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setActiveBottomTab('drills')}
            className={`py-1.5 rounded-lg flex flex-col items-center gap-0.5 cursor-pointer ${
              activeBottomTab === 'drills' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
            }`}
          >
            <Layers size={16} />
            <span className="text-[10px]">Drills</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('timer')}
            className={`py-1.5 rounded-lg flex flex-col items-center gap-0.5 cursor-pointer ${
              activeBottomTab === 'timer' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
            }`}
          >
            <Clock size={16} />
            <span className="text-[10px]">Timer</span>
          </button>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="py-1.5 rounded-lg flex flex-col items-center gap-0.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <BookOpen size={16} />
            <span className="text-[10px]">Ref</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('dog')}
            className={`py-1.5 rounded-lg flex flex-col items-center gap-0.5 cursor-pointer ${
              activeBottomTab === 'dog' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
            }`}
          >
            <Dog size={16} />
            <span className="text-[10px]">Dog</span>
          </button>
        </div>
      </nav>

      {/* 4. UX Feature: Tag Filter Quick-Reference Drawer */}
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

            {/* Quick Filter Tags */}
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
  );
}
