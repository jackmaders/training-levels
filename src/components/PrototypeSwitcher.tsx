import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface VariantOption {
  key: string;
  name: string;
  description: string;
}

interface PrototypeSwitcherProps {
  variants: VariantOption[];
  currentVariant: string;
  onSelectVariant: (key: string) => void;
}

export function PrototypeSwitcher({
  variants,
  currentVariant,
  onSelectVariant,
}: PrototypeSwitcherProps) {
  const currentIndex = Math.max(
    0,
    variants.findIndex((v) => v.key.toUpperCase() === currentVariant.toUpperCase())
  );

  const prev = () => {
    const nextIdx = (currentIndex - 1 + variants.length) % variants.length;
    onSelectVariant(variants[nextIdx].key);
  };

  const next = () => {
    const nextIdx = (currentIndex + 1) % variants.length;
    onSelectVariant(variants[nextIdx].key);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form controls
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, variants]);

  const activeOption = variants[currentIndex] ?? variants[0];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] w-auto">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/95 border border-indigo-500/50 text-white rounded-full shadow-2xl backdrop-blur-md transition-all">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous Variant (Left Arrow)"
          className="p-1.5 rounded-full hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-2 text-center min-w-[210px] justify-center select-none">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-[11px] font-bold text-white uppercase tracking-wider">
            {activeOption.key}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-100 tracking-tight leading-tight flex items-center gap-1">
              {activeOption.name}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              {activeOption.description}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next Variant (Right Arrow)"
          className="p-1.5 rounded-full hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
