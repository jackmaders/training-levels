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

  // Reps state per behavior key for prototype
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-32 max-w-md mx-auto shadow-2xl border-x border-slate-800/80">
      {/* 1. Header: StrongLifts Level Completion Ring Grid */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black tracking-wider uppercase text-white">
              LEVEL {selectedLevel} WORKOUT DRILLS
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
            <span>Dog: <strong>Barnaby</strong></span>
          </div>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setActiveStepNumber(1);
              }}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              L{lvl}
            </button>
          ))}
        </div>

        {/* Behavior Progress Rings Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {levelData.behaviors.map((b) => {
            const isCurrent = b.behaviorKey === activeBehaviorKey;
            const bReps = repsState[b.behaviorKey] ?? ['empty', 'empty', 'empty', 'empty', 'empty'];
            const passes = bReps.filter((r) => r === 'pass' || r === 'cold').length;
            const isCompleted = passes >= 4;

            return (
              <button
                key={b.id}
                onClick={() => {
                  setActiveBehaviorKey(b.behaviorKey);
                  setActiveStepNumber(1);
                }}
                className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer min-w-[68px] ${
                  isCurrent
                    ? 'bg-indigo-600/30 border border-indigo-500 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative w-8 h-8 flex items-center justify-center mb-1">
                  <svg className="w-8 h-8 -rotate-90">
                    <circle cx="16" cy="16" r="13" className="stroke-slate-800" strokeWidth="2.5" fill="transparent" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      className={isCompleted ? 'stroke-emerald-400' : 'stroke-indigo-400'}
                      strokeWidth="2.5"
                      strokeDasharray={81.68}
                      strokeDashoffset={81.68 - (81.68 * (passes / 5))}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold">
                    {passes}/5
                  </span>
                </div>
                <span className={`text-[11px] font-medium truncate w-full text-center ${isCurrent ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                  {b.title}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Main Drill Stream / Active Workout View */}
      <main className="px-4 py-3 flex-1 overflow-y-auto space-y-3 text-left">
        {activeBottomTab === 'drills' && (
          <>
            {/* Active Drill Card (Expanded Workout View) */}
            <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
                    Active Drill
                  </span>
                  <span className="text-sm font-bold text-white">{activeBehavior.title}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs flex items-center gap-1 font-semibold"
                >
                  <BookOpen size={13} />
                  <span>Sue's Notes</span>
                </button>
              </div>

              {/* Step Navigation Pills */}
              <div className="flex items-center gap-1.5 my-2">
                {activeBehavior.steps.map((s) => (
                  <button
                    key={s.stepNumber}
                    onClick={() => setActiveStepNumber(s.stepNumber)}
                    className={`flex-1 py-1 text-xs font-mono font-bold rounded-lg transition ${
                      s.stepNumber === activeStepNumber
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    S{s.stepNumber}
                  </button>
                ))}
              </div>

              {/* Step Title & Criteria */}
              <div className="my-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 mb-1">
                  Step {activeStep.stepNumber}: {activeStep.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeStep.criterionSummary}
                </p>
              </div>

              {/* StrongLifts 5x5 Rep Counter Matrix */}
              <div className="my-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800/60">
                <RepMatrix
                  reps={repsState[activeBehaviorKey] ?? ['empty', 'empty', 'empty', 'empty', 'empty']}
                  onRepChange={(idx, next) => handleRepChange(activeBehaviorKey, idx, next)}
                  size="md"
                />
              </div>

              {/* Step Instructions Snippet */}
              <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                <span className="font-semibold text-slate-300">Handling cue: </span>
                {activeStep.instructionsMarkdown}
              </div>
            </div>

            {/* Inactive Behavior Summary Cards */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Other Level {selectedLevel} Drills
              </span>

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
                      className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200">{b.title}</div>
                        <div className="text-[11px] text-slate-400">{b.criteriaTable[0]?.criteria ?? '5 steps'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          {passes}/5 reps
                        </span>
                        <ChevronRight size={16} className="text-slate-500" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {activeBottomTab === 'timer' && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white">Outdoor Drill Timers</h3>
            <HoldTimer durationSeconds={5} label="Zen 5s Calm Hold" variant="prominent" />
            <HoldTimer durationSeconds={10} label="Sit-Stay 10s Hold" variant="prominent" />
            <HoldTimer durationSeconds={30} label="Down-Stay 30s Target" variant="prominent" />
          </div>
        )}

        {activeBottomTab === 'ref' && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white">Sue Ailsby Master Reference Library</h3>
            <p className="text-xs text-slate-400">Level {selectedLevel} Complete Curriculum</p>
            {activeBehavior.callouts.map((c, i) => (
              <CalloutCard key={i} callout={c} />
            ))}
          </div>
        )}

        {activeBottomTab === 'dog' && (
          <div className="space-y-3 pt-2">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <div className="w-14 h-14 bg-indigo-600/30 rounded-full flex items-center justify-center mx-auto text-indigo-300 border border-indigo-500/40 mb-2">
                <Dog size={28} />
              </div>
              <h3 className="text-base font-bold text-white">Barnaby</h3>
              <p className="text-xs text-slate-400">Golden Retriever • 1.5 yrs</p>
              <div className="mt-3 inline-block px-3 py-1 bg-emerald-950 border border-emerald-500/50 rounded-full text-xs text-emerald-300 font-semibold">
                Level 1 in Progress
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Fixed 4-Tab Bottom Navigation Dock (Thumb-first ergonomics) */}
      <nav className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
        <div className="grid grid-cols-4 gap-1 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setActiveBottomTab('drills')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeBottomTab === 'drills'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={18} />
            <span className="text-[10px]">Drills</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('timer')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeBottomTab === 'timer'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={18} />
            <span className="text-[10px]">Timers</span>
          </button>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="py-2 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-300 transition"
          >
            <BookOpen size={18} className="text-indigo-400" />
            <span className="text-[10px] text-indigo-300 font-semibold">Quick Ref</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('dog')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeBottomTab === 'dog'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dog size={18} />
            <span className="text-[10px]">Dog</span>
          </button>
        </div>
      </nav>

      {/* 4. Searchable Quick-Reference Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="relative bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 max-h-[80vh] flex flex-col shadow-2xl max-w-md mx-auto w-full z-10">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3" onClick={() => setIsFilterDrawerOpen(false)} />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Quick Field Lookup Drawer
              </span>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-md"
              >
                Done
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2">
              {['all', 'tips', 'warning', 'criteria', 'comebefores'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterType(tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase cursor-pointer ${
                    filterType === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[50vh] space-y-2 text-left pr-1">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-indigo-300 block mb-1">
                  {activeBehavior.title} - Step {activeStep.stepNumber}
                </span>
                <p className="text-xs text-slate-300">{activeStep.instructionsMarkdown}</p>
              </div>

              {activeStep.callouts.map((c, idx) => (
                <CalloutCard key={idx} callout={c} />
              ))}

              {activeBehavior.thinkAbout && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                  <span className="font-bold text-amber-300 block mb-1">💡 Sue's Advice:</span>
                  {activeBehavior.thinkAbout}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
