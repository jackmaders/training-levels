import { Check, X, Star } from 'lucide-react';

export type RepStatus = 'empty' | 'pass' | 'miss' | 'cold';

interface RepMatrixProps {
  reps: RepStatus[];
  onRepChange: (index: number, nextStatus: RepStatus) => void;
  size?: 'sm' | 'md' | 'lg' | 'giant';
  showSummary?: boolean;
}

export function RepMatrix({
  reps,
  onRepChange,
  size = 'md',
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
  const coldCount = reps.filter((r) => r === 'cold').length;
  const isCertified = passCount >= 4;

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base',
    giant: 'w-16 h-16 text-lg',
  }[size];

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    giant: 28,
  }[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 touch-manipulation">
        {reps.map((status, idx) => {
          let bgClass = 'bg-slate-800/90 border-slate-700 text-slate-400 hover:border-slate-500';
          let icon = <span className="font-mono text-slate-500 font-bold">{idx + 1}</span>;

          if (status === 'pass') {
            bgClass = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-500/50 scale-105';
            icon = <Check size={iconSizes} strokeWidth={3} />;
          } else if (status === 'miss') {
            bgClass = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/40 ring-2 ring-rose-500/50 scale-105';
            icon = <X size={iconSizes} strokeWidth={3} />;
          } else if (status === 'cold') {
            bgClass = 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-900/50 ring-2 ring-amber-400/60 scale-105';
            icon = <Star size={iconSizes} className="fill-slate-950" strokeWidth={2.5} />;
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (navigator.vibrate) {
                  navigator.vibrate(25);
                }
                onRepChange(idx, cycleStatus(status));
              }}
              className={`relative rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-all active:scale-90 cursor-pointer ${sizeClasses} ${bgClass}`}
              title={`Rep ${idx + 1}: ${status} (Tap to cycle)`}
            >
              {icon}
              <span className="absolute -bottom-1.5 text-[9px] font-mono tracking-tighter opacity-70 bg-slate-950/80 px-1 rounded-full border border-slate-700">
                R{idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {showSummary && (
        <div className="flex items-center gap-2 text-xs mt-1">
          <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
            isCertified
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            Score: {passCount}/5 reps {isCertified ? '✓ Passed (4/5 target)' : '(Need 4/5)'}
          </span>
          {coldCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/70 text-amber-300 text-[11px] flex items-center gap-1 font-medium">
              <Star size={12} className="fill-amber-300" /> {coldCount} Cold
            </span>
          )}
        </div>
      )}
    </div>
  );
}
