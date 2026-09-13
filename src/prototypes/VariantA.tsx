import { useState } from 'react';
import { 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  Dog,
  Check
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
  
  // In-memory reps state for the prototype
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-36 max-w-md mx-auto shadow-2xl border-x border-slate-800/80">
      {/* 1. Top Minimal Header: Dog Profile & Level Switcher */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
              <Dog size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                Barnaby <span className="text-[10px] text-emerald-400 font-normal bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">Active</span>
              </div>
              <div className="text-[10px] text-slate-400">Level 1 • 3 of 5 Behaviors Passed</div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[1, 2, 3, 4].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevel(lvl);
                  setSelectedBehaviorIndex(0);
                  setSelectedStepNumber(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                L{lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Behavior Horizontal Pill Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {levelData.behaviors.map((b, idx) => {
            const isSelected = idx === selectedBehaviorIndex;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBehaviorIndex(idx);
                  setSelectedStepNumber(1);
                  setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-950/60'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200'
                }`}
              >
                {b.title}
                {idx === 0 && <Check size={12} className="text-emerald-300" />}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Main Active Behavior & Step Card */}
      <main className="px-4 py-3 flex-1 flex flex-col justify-start">
        {/* Behavior & Step Progress Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded-md">
              {currentBehavior.title}
            </span>
            <span className="text-xs text-slate-400">Step {currentStep.stepNumber} of 5</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevBehavior}
              disabled={selectedBehaviorIndex === 0}
              className="p-1 rounded-md bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextBehavior}
              disabled={selectedBehaviorIndex === levelData.behaviors.length - 1}
              className="p-1 rounded-md bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Step Tabs 1-5 */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {currentBehavior.steps.map((s) => {
            const isActive = s.stepNumber === selectedStepNumber;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStepNumber(s.stepNumber);
                  setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
                }}
                className={`py-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-950/80 ring-2 ring-indigo-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs">Step</span>
                <span className="text-base font-mono leading-none">{s.stepNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Big High-Contrast Criterion Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl mb-3 text-left">
          <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">
            CRITERION TARGET
          </div>
          <h2 className="text-lg font-bold text-white leading-snug mb-2">
            {currentStep.title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            {currentStep.criterionSummary}
          </p>

          {/* Quick instructions snippet */}
          <div className="mt-3 text-xs text-slate-400 line-clamp-2">
            {currentStep.instructionsMarkdown}
          </div>
        </div>

        {/* Inline Timer (if relevant for hold behaviors like Zen / Stay) */}
        <div className="mb-3">
          <HoldTimer durationSeconds={5} label={`${currentBehavior.title} 5s Hold Timer`} />
        </div>
      </main>

      {/* 3. Ergonomic Bottom Thumb-Zone Arc (100% reachable with single thumb) */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-3 z-40">
        <div className="bg-slate-900/95 border-2 border-indigo-500/50 rounded-3xl p-3.5 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5">
          {/* Drawer Pull Handle & Label */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-full py-1.5 px-3 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 rounded-xl text-xs font-semibold text-indigo-200 flex items-center justify-between cursor-pointer transition active:scale-98"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-400" />
              Sue's Quick Reference & Troubleshooting
            </span>
            <ChevronUp size={16} className="text-indigo-400 animate-bounce" />
          </button>

          {/* 5-Rep Thumb Matrix */}
          <div className="pt-1">
            <RepMatrix reps={reps} onRepChange={handleRepChange} size="lg" />
          </div>
        </div>
      </div>

      {/* 4. Slide-Over / Bottom Sheet Drawer (Vaul style) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setIsDrawerOpen(false)} 
          />
          <div className="relative bg-slate-900 border-t border-indigo-500/40 rounded-t-3xl p-5 max-h-[85vh] flex flex-col shadow-2xl max-w-md mx-auto w-full z-10 animate-in slide-in-from-bottom duration-300">
            {/* Grab Bar */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3 cursor-pointer" onClick={() => setIsDrawerOpen(false)} />

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                  {currentBehavior.title} • Reference Drawer
                </span>
                <h3 className="text-base font-bold text-white">
                  Step {currentStep.stepNumber}: {currentStep.title}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white text-xs px-3"
              >
                Close ✕
              </button>
            </div>

            {/* Tab selection */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3">
              <button
                onClick={() => setDrawerTab('tips')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  drawerTab === 'tips' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sue's Tips ({currentStep.callouts.length})
              </button>
              <button
                onClick={() => setDrawerTab('criteria')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  drawerTab === 'criteria' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Criteria Matrix
              </button>
              <button
                onClick={() => setDrawerTab('prep')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  drawerTab === 'prep' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Prep & Gear
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto max-h-[55vh] pr-1 text-left space-y-3">
              {drawerTab === 'tips' && (
                <div>
                  <div className="text-xs text-slate-300 mb-2 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-indigo-300 block mb-1">Detailed Method:</span>
                    {currentStep.instructionsMarkdown}
                  </div>

                  {currentStep.callouts.length > 0 ? (
                    currentStep.callouts.map((c, i) => <CalloutCard key={i} callout={c} />)
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-4">
                      No specific warning callouts for this step. Stick to 4/5 reps before moving forward!
                    </div>
                  )}

                  {currentStep.tryItCold && (
                    <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-200">
                      <span className="font-bold block mb-1">❄️ Try it Cold Test:</span>
                      {currentStep.tryItCold}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'criteria' && (
                <div className="space-y-2">
                  {currentBehavior.criteriaTable.map((row) => (
                    <div
                      key={row.step}
                      className={`p-3 rounded-xl border ${
                        row.step === selectedStepNumber
                          ? 'bg-indigo-950/60 border-indigo-500/80 ring-1 ring-indigo-400'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-300">Step {row.step}</span>
                        {row.step === selectedStepNumber && (
                          <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.2 rounded-full font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300">{row.criteria}</div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'prep' && (
                <div className="space-y-3">
                  {currentBehavior.equipment && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <span className="font-bold text-slate-200 block mb-1">🎒 Equipment:</span>
                      <p className="text-slate-300">{currentBehavior.equipment}</p>
                    </div>
                  )}
                  {currentBehavior.comebefores && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <span className="font-bold text-slate-200 block mb-1">🔗 Comebefores (Prerequisites):</span>
                      <p className="text-slate-300">{currentBehavior.comebefores}</p>
                    </div>
                  )}
                  {currentBehavior.thinkAbout && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <span className="font-bold text-slate-200 block mb-1">💡 Think About:</span>
                      <p className="text-slate-300">{currentBehavior.thinkAbout}</p>
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
