import { useState } from 'react';
import { ChevronRight, ArrowRight, Star } from 'lucide-react';
import { getLevel } from '../lib/curriculumData';
import { getCriteriaConfig } from '../lib/criteriaHelper';

interface CustomTrainingViewProps {
  onStartSession: (level: number, behaviorKey: string, stepNumber: number, sessionType: 'practice' | 'cold') => void;
}

export function CustomTrainingView({ onStartSession }: CustomTrainingViewProps) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [expandedBehaviorKey, setExpandedBehaviorKey] = useState<string>('zen');

  const levelData = getLevel(selectedLevel);

  return (
    <div className="flex-1 flex flex-col text-left">
      {/* Header Level Selector */}
      <div className="sticky top-11 z-20 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-200">
          Curriculum Explorer
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setExpandedBehaviorKey('zen');
              }}
              className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-zinc-100 text-zinc-900 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              L{lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="p-4 space-y-2.5">
        <div className="text-[11px] text-zinc-400">
          Select any exercise to launch a custom 5-minute training session.
        </div>

        {levelData.behaviors.map((b) => {
          const isExpanded = b.behaviorKey === expandedBehaviorKey;

          return (
            <div
              key={b.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
            >
              <div
                onClick={() => setExpandedBehaviorKey(isExpanded ? '' : b.behaviorKey)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-800/60"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-100">{b.title}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">5 Steps</div>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </div>

              {isExpanded && (
                <div className="p-2.5 border-t border-zinc-800 bg-zinc-950/60 space-y-2">
                  {b.steps.map((s) => {
                    const cfg = getCriteriaConfig(s.criterionSummary, s.title);

                    return (
                      <div
                        key={s.stepNumber}
                        className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200">
                            Step {s.stepNumber}: {s.title}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800">
                            {cfg.label}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {s.criterionSummary}
                        </p>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/60">
                          <button
                            onClick={() => onStartSession(selectedLevel, b.behaviorKey, s.stepNumber, 'practice')}
                            className="flex-1 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-md flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Practice (5 Reps)</span>
                            <ArrowRight size={12} />
                          </button>

                          <button
                            onClick={() => onStartSession(selectedLevel, b.behaviorKey, s.stepNumber, 'cold')}
                            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-600/50 text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer"
                            title="Attempt Cold Test Certification"
                          >
                            <Star size={12} className="fill-amber-300" />
                            <span>Cold Test</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
