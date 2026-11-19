import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export interface PrototypeVariantOption<T extends string = string> {
  id: T;
  label: string;
}

interface PrototypeSwitcherProps<T extends string> {
  variants: readonly PrototypeVariantOption<T>[];
  activeVariant: T;
  onSelect: (variant: T) => void;
  className?: string;
}

export function PrototypeSwitcher<T extends string>({
  variants,
  activeVariant,
  onSelect,
  className,
}: PrototypeSwitcherProps<T>) {
  useEffect(() => {
    if (import.meta.env.PROD || variants.length === 0) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      const currentIndex = variants.findIndex((variant) => variant.id === activeVariant);
      if (currentIndex === -1) {
        return;
      }

      event.preventDefault();
      const delta = event.key === "ArrowLeft" ? -1 : 1;
      const nextIndex = (currentIndex + delta + variants.length) % variants.length;
      const nextVariant = variants[nextIndex];
      if (nextVariant) {
        onSelect(nextVariant.id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [variants, activeVariant, onSelect]);

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div
      aria-label="Prototype variant switcher"
      className={cn(
        "fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background/95 p-1 shadow-lg backdrop-blur-sm",
        className,
      )}
      role="region"
    >
      <span className="hidden items-center gap-0.5 pl-2.5 pr-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
        <ChevronLeft className="size-3" />
        <ChevronRight className="size-3" />
      </span>
      {variants.map((variant) => {
        const isActive = variant.id === activeVariant;
        return (
          <button
            key={variant.id}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => onSelect(variant.id)}
            type="button"
          >
            <span
              className={cn(
                "inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {variant.id}
            </span>
            <span>{variant.label}</span>
          </button>
        );
      })}
    </div>
  );
}
