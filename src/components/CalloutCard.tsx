import { Callout } from '../types/curriculum';

export function CalloutCard({ callout }: { callout: Callout }) {
  return (
    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 my-2 text-left">
      <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400 mb-1">
        [{callout.type.toUpperCase()}] {callout.title || callout.rawType}
      </div>
      <div className="text-xs text-zinc-300 leading-relaxed">
        {callout.contentMarkdown}
      </div>
    </div>
  );
}
