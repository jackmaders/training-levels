import { useState } from 'react';
import { 
  Zap, 
  Check, 
  X, 
  Star, 
  RotateCcw
} from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { RepStatus } from '../components/RepMatrix';
import { HoldTimer } from '../components/HoldTimer';
import { CalloutCard } from '../components/CalloutCard';

export function VariantC() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedBehaviorIndex, setSelectedBehaviorIndex] = useState(0);
  const [selectedStepNumber, setSelectedStepNumber] = useState(1);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isColdTestMode, setIsColdTestMode] = useState(false);

  // In-memory 5-rep state
  const [reps, setReps] = useState<RepStatus[]>(['pass', 'pass', 'pass', 'miss', 'empty']);

  const levelData = getLevel(selectedLevel);
  const currentBehavior = levelData.behaviors[selectedBehaviorIndex] ?? levelData.behaviors[0];
  const currentStep = currentBehavior.steps.find((s) => s.stepNumber === selectedStepNumber) ?? currentBehavior.steps[0];

  const handleRepTap = (index: number) => {
    const current = reps[index];
    let next: RepStatus = 'pass';
    if (isColdTestMode) {
      next = current === 'cold' ? 'miss' : current === 'miss' ? 'empty' : 'cold';
    } else {
      next = current === 'empty' ? 'pass' : current === 'pass' ? 'miss' : current === 'miss' ? 'cold' : 'empty';
    }

    if (navigator.vibrate) {
      navigator.vibrate(35);
    }
    const updated = [...reps];
    updated[index] = next;
    setReps(updated);
  };

  const passCount = reps.filter((r) => r === 'pass' || r === 'cold').length;
  const isPassed = passCount >= 4;

  return (
    <div className="relative min-h-screen bg-black text-amber-50 flex flex-col justify-between pb-32 max-w-md mx-auto shadow-2xl border-x-2 border-amber-500/30 font-sans">
      {/* 1. Tactical High-Vis Field Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 border-b-2 border-amber-500/80 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded">
              SUNLIGHT HUD
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              LEVEL {selectedLevel}
            </span>
          </div>

          {/* Level Switch Buttons */}
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
                className={`w-7 h-7 rounded-lg font-black text-xs transition cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Behavior Selector Ribbon (Giant tactile touch areas) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {levelData.behaviors.map((b, idx) => {
            const isCurrent = idx === selectedBehaviorIndex;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBehaviorIndex(idx);
                  setSelectedStepNumber(1);
                  setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer border-2 ${
                  isCurrent
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md ring-2 ring-amber-500/80'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {b.title}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Main Field HUD: Active Behavior, Step Ribbon, Reps */}
      <main className="px-4 py-3 flex-1 flex flex-col justify-start text-left">
        {/* Step Selector Ribbon (Oversized touch targets) */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
            {currentBehavior.title} • STEP {selectedStepNumber}/5
          </div>
          <button
            onClick={() => setIsColdTestMode(!isColdTestMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 border ${
              isColdTestMode
                ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-500 font-black'
                : 'bg-zinc-900 text-amber-400 border-amber-500/50'
            }`}
          >
            <Star size={13} className={isColdTestMode ? 'fill-black' : ''} />
            {isColdTestMode ? 'COLD TEST MODE ON' : 'Practice Mode'}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-3">
          {currentBehavior.steps.map((s) => {
            const isCurrent = s.stepNumber === selectedStepNumber;
            return (
              <button
                key={s.stepNumber}
                onClick={() => {
                  setSelectedStepNumber(s.stepNumber);
                  setReps(['empty', 'empty', 'empty', 'empty', 'empty']);
                }}
                className={`py-3 rounded-2xl flex flex-col items-center justify-center font-black transition cursor-pointer border-2 ${
                  isCurrent
                    ? 'bg-amber-400 text-black border-white shadow-xl scale-105 ring-2 ring-amber-500'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase font-mono opacity-80">STEP</span>
                <span className="text-xl font-mono leading-tight">{s.stepNumber}</span>
              </button>
            );
          })}
        </div>

        {/* High-Vis Criterion Box */}
        <div className="bg-zinc-950 border-2 border-amber-500/70 rounded-2xl p-4 shadow-2xl mb-3">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
            TARGET CRITERIA (4/5 REPS TO PASS)
          </div>
          <h2 className="text-lg font-black text-amber-50 leading-tight mb-2">
            {currentStep.title}
          </h2>
          <div className="bg-black/90 p-3 rounded-xl border border-amber-500/40 text-sm text-amber-100 font-medium leading-relaxed">
            {currentStep.criterionSummary}
          </div>
        </div>

        {/* Tactical Hold Timer */}
        <div className="mb-3">
          <HoldTimer durationSeconds={5} label={`${currentBehavior.title} 5-Second Hold`} variant="hud" />
        </div>

        {/* GIANT 64px 5-Rep Matrix for Outdoor Handling */}
        <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-3.5 shadow-2xl text-center">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              TAP BUBBLE TO CYCLE SCORE
            </span>
            <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
              isPassed ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {passCount}/5 {isPassed ? '✓ CERTIFIED' : 'REPS'}
            </span>
          </div>

          <div className="flex items-center justify-around gap-2 my-1">
            {reps.map((status, idx) => {
              let bgClass = 'bg-zinc-900 border-zinc-700 text-zinc-500';
              let icon = <span className="font-mono text-xl font-bold">{idx + 1}</span>;

              if (status === 'pass') {
                bgClass = 'bg-emerald-500 border-emerald-300 text-black ring-4 ring-emerald-600/50 shadow-lg';
                icon = <Check size={32} strokeWidth={4} />;
              } else if (status === 'miss') {
                bgClass = 'bg-rose-600 border-rose-400 text-white ring-4 ring-rose-600/50 shadow-lg';
                icon = <X size={32} strokeWidth={4} />;
              } else if (status === 'cold') {
                bgClass = 'bg-amber-400 border-amber-200 text-black ring-4 ring-amber-500/60 shadow-lg';
                icon = <Star size={32} className="fill-black" strokeWidth={3} />;
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleRepTap(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition active:scale-90 cursor-pointer ${bgClass}`}
                >
                  {icon}
                  <span className="text-[9px] font-mono font-bold opacity-80 -mt-1">
                    R{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-2 px-1">
            <span>Pass (✓) • Miss (✕) • Cold (★)</span>
            <button
              onClick={() => setReps(['empty', 'empty', 'empty', 'empty', 'empty'])}
              className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw size={12} /> Reset Reps
            </button>
          </div>
        </div>
      </main>

      {/* 3. Floating Right-Edge Drawer Pull Tab (Dominant Thumb Reach) */}
      <button
        type="button"
        onClick={() => setIsSideDrawerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-amber-400 text-black font-black text-xs py-5 px-2.5 rounded-l-2xl shadow-2xl border-l-2 border-y-2 border-amber-300 flex flex-col items-center gap-2 cursor-pointer hover:bg-amber-300 active:scale-95 transition"
      >
        <Zap size={18} className="fill-black" />
        <span className="[writing-mode:vertical-rl] tracking-wider uppercase font-mono text-[11px]">
          SUE'S TIPS
        </span>
      </button>

      {/* 4. Full-Height Slide-Over Drawer */}
      {isSideDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsSideDrawerOpen(false)} />
          <div className="relative bg-zinc-950 border-l-2 border-amber-500/80 p-5 max-w-sm w-full h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300 text-left">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                    FIELD REFERENCE
                  </span>
                  <h3 className="text-base font-black text-white">
                    {currentBehavior.title} (Step {currentStep.stepNumber})
                  </h3>
                </div>
                <button
                  onClick={() => setIsSideDrawerOpen(false)}
                  className="p-2 bg-amber-400 text-black font-bold text-xs rounded-xl"
                >
                  Close ✕
                </button>
              </div>

              <div className="overflow-y-auto max-h-[75vh] space-y-3 pr-1">
                <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl">
                  <span className="text-xs font-mono font-bold text-amber-400 block mb-1">
                    EXECUTION METHOD
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {currentStep.instructionsMarkdown}
                  </p>
                </div>

                {currentStep.tryItCold && (
                  <div className="p-3 bg-amber-950/60 border-2 border-amber-400 rounded-xl">
                    <span className="text-xs font-mono font-black text-amber-300 block mb-1">
                      ❄️ TRY IT COLD REQUIREMENT:
                    </span>
                    <p className="text-xs text-amber-100 font-medium">
                      {currentStep.tryItCold}
                    </p>
                  </div>
                )}

                {currentStep.callouts.map((c, i) => (
                  <CalloutCard key={i} callout={c} />
                ))}

                {currentBehavior.comebefores && (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                    <span className="font-bold text-amber-300 block mb-1">Prerequisites:</span>
                    {currentBehavior.comebefores}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsSideDrawerOpen(false)}
              className="w-full py-3 bg-amber-400 text-black font-black text-sm uppercase tracking-wider rounded-xl cursor-pointer hover:bg-amber-300"
            >
              Resume Drill HUD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
