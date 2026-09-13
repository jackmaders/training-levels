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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-full shadow-lg">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous Variant"
          className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-2 text-center min-w-[200px] justify-center select-none">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-700 text-xs font-bold text-white uppercase">
            {activeOption.key}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-100 leading-tight">
              {activeOption.name}
            </span>
            <span className="text-[10px] text-zinc-400 leading-tight">
              {activeOption.description}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next Variant"
          className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
