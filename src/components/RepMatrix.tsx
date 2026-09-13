import { Check, X, Star } from 'lucide-react';

export type RepStatus = 'empty' | 'pass' | 'miss' | 'cold';

interface RepMatrixProps {
  reps: RepStatus[];
  onRepChange: (index: number, nextStatus: RepStatus) => void;
  showSummary?: boolean;
}

export function RepMatrix({
  reps,
  onRepChange,
  showSummary = true,
}: RepMatrixProps) {
  const cycleStatus = (current: RepStatus): RepStatus => {
    switch (current) {
      case 'empty':
        return 'pass';
      case 'pass':
        return 'miss';
      case 'miss':
        return 'cold';
      case 'cold':
        return 'empty';
      default:
        return 'empty';
    }
  };

  const passCount = reps.filter((r) => r === 'pass' || r === 'cold').length;
  const isPassed = passCount >= 4;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2">
        {reps.map((status, idx) => {
          let btnStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700';
          let icon = <span className="font-mono text-xs">{idx + 1}</span>;

          if (status === 'pass') {
            btnStyle = 'bg-emerald-700 text-white border-emerald-600';
            icon = <Check size={18} strokeWidth={2.5} />;
          } else if (status === 'miss') {
            btnStyle = 'bg-rose-700 text-white border-rose-600';
            icon = <X size={18} strokeWidth={2.5} />;
          } else if (status === 'cold') {
            btnStyle = 'bg-amber-600 text-black border-amber-500 font-bold';
            icon = <Star size={18} className="fill-black" />;
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onRepChange(idx, cycleStatus(status))}
              className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer active:scale-95 ${btnStyle}`}
              title={`Rep ${idx + 1}: ${status} (Tap to cycle)`}
            >
              {icon}
              <span className="text-[10px] font-mono leading-none mt-0.5">R{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {showSummary && (
        <div className="text-xs text-zinc-400 font-mono">
          <span>Score: <strong className={isPassed ? 'text-emerald-400' : 'text-zinc-200'}>{passCount}/5</strong> {isPassed ? '(Target met)' : '(Need 4/5)'}</span>
        </div>
      )}
    </div>
  );
}
