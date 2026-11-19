import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect } from "react";

const NOT_FOUND_INDEX = -1;
const PREVIOUS_STEP = -1;
const NEXT_STEP = 1;

interface PrototypeVariantOption<TKey extends string = string> {
  key: TKey;
  label: string;
}

interface PrototypeSwitcherProps<TKey extends string = string> {
  current: TKey;
  variants: readonly PrototypeVariantOption<TKey>[];
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

function usePrototypeVariantStep<TKey extends string>(
  current: TKey,
  variants: readonly PrototypeVariantOption<TKey>[],
) {
  const navigate = useNavigate();

  return useCallback(
    (delta: number) => {
      if (variants.length === 0) {
        return;
      }
      const currentIndex = variants.findIndex((item) => item.key === current);
      const safeIndex = currentIndex === NOT_FOUND_INDEX ? 0 : currentIndex;
      const nextIndex = (safeIndex + delta + variants.length) % variants.length;
      const nextVariant = variants[nextIndex];
      if (!nextVariant) {
        return;
      }
      void navigate({
        replace: true,
        search: (prev) => ({
          ...prev,
          variant: nextVariant.key,
        }),
        to: ".",
      });
    },
    [current, navigate, variants],
  );
}

function SwitcherPill({
  label,
  onNext,
  onPrevious,
}: {
  label: string;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-background/20 bg-foreground px-1.5 py-1 text-background shadow-lg">
      <button
        aria-label="Previous variant"
        className="inline-flex size-7 items-center justify-center rounded-full transition-colors hover:bg-background/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={onPrevious}
        type="button"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="px-2.5 text-xs font-medium tracking-wide whitespace-nowrap">{label}</span>
      <button
        aria-label="Next variant"
        className="inline-flex size-7 items-center justify-center rounded-full transition-colors hover:bg-background/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={onNext}
        type="button"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function useArrowVariantShortcuts(stepVariant: (delta: number) => void) {
  useEffect(() => {
    if (import.meta.env.PROD) {
      return () => {
        // No shortcut listener is registered in production builds.
      };
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || isEditableElement(event.target)) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepVariant(PREVIOUS_STEP);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepVariant(NEXT_STEP);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [stepVariant]);
}

function PrototypeSwitcher<TKey extends string = string>({
  current,
  variants,
}: PrototypeSwitcherProps<TKey>) {
  const stepVariant = usePrototypeVariantStep(current, variants);
  useArrowVariantShortcuts(stepVariant);

  if (import.meta.env.PROD || variants.length === 0) {
    return null;
  }

  const activeVariant = variants.find((item) => item.key === current) ?? variants[0];
  if (!activeVariant) {
    return null;
  }

  return (
    <aside
      aria-label="Prototype variant switcher"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
    >
      <SwitcherPill
        label={`${activeVariant.key} (${activeVariant.label})`}
        onNext={() => {
          stepVariant(NEXT_STEP);
        }}
        onPrevious={() => {
          stepVariant(PREVIOUS_STEP);
        }}
      />
    </aside>
  );
}

export { PrototypeSwitcher, type PrototypeVariantOption };
