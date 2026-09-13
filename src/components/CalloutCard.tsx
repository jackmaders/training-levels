import { Lightbulb, AlertTriangle, Quote, Info, ShieldAlert } from 'lucide-react';
import { Callout } from '../types/curriculum';

export function CalloutCard({ callout }: { callout: Callout }) {
  const getStyle = () => {
    switch (callout.type) {
      case 'tip':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-400',
          icon: <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
      case 'warning':
      case 'caution':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-amber-950/20',
          text: 'text-amber-400',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'important':
        return {
          border: 'border-rose-500/40',
          bg: 'bg-rose-950/20',
          text: 'text-rose-400',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        };
      case 'quote':
        return {
          border: 'border-indigo-500/40',
          bg: 'bg-indigo-950/20',
          text: 'text-indigo-400',
          icon: <Quote className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />,
          badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        };
      case 'note':
      default:
        return {
          border: 'border-sky-500/40',
          bg: 'bg-sky-950/20',
          text: 'text-sky-400',
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
          badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`p-3.5 rounded-xl border ${style.border} ${style.bg} flex flex-col gap-2 my-2 text-left`}>
      <div className="flex items-start gap-2">
        {style.icon}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${style.badge}`}>
              {callout.title || callout.rawType || callout.type}
            </span>
          </div>
          <div className="text-xs leading-relaxed text-slate-200">
            {callout.contentMarkdown}
          </div>
        </div>
      </div>
    </div>
  );
}
