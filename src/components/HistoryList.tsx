import { Check, X, Star, Clock } from 'lucide-react';
import { SessionHistoryItem } from '../types/session';

export function HistoryList({ history }: { history: SessionHistoryItem[] }) {
  if (history.length === 0) {
    return (
      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
        No training sessions logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono font-bold uppercase text-zinc-400">
          Recent Session History
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {history.length} logged
        </span>
      </div>

      <div className="space-y-1.5">
        {history.map((item) => {
          return (
            <div
              key={item.id}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-left"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.passed
                      ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                >
                  {item.passed ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <X size={14} strokeWidth={3} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-200">
                      Level {item.levelNumber} {item.behaviorTitle} • Step {item.stepNumber}
                    </span>
                    {item.sessionType === 'cold' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-600 text-amber-300 text-[9px] font-mono font-bold flex items-center gap-0.5">
                        <Star size={9} className="fill-amber-300" /> Cold
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{item.stepTitle}</p>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} /> {item.durationMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    item.passed
                      ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                >
                  {item.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
