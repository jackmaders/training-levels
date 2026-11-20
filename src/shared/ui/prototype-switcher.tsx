import { cn } from "cn";
import { useEffect, type ComponentProps } from "react";

import { Button } from "./shadcn/button";

type PrototypeVariant = "A" | "B" | "C";

interface PrototypeVariantOption {
  id: PrototypeVariant;
  label: string;
}

interface PrototypeSwitcherProps extends Omit<ComponentProps<"aside">, "children"> {
  onVariantChange: (variant: PrototypeVariant) => void;
  variant: PrototypeVariant;
  variants?: readonly PrototypeVariantOption[];
}

const DEFAULT_VARIANTS: readonly PrototypeVariantOption[] = [
  { id: "A", label: "Variant A" },
  { id: "B", label: "Variant B" },
  { id: "C", label: "Variant C" },
];

const PREVIOUS_OFFSET = -1;
const NEXT_OFFSET = 1;

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}

function resolveSteppedVariant({
  currentVariant,
  direction,
  variants,
}: {
  currentVariant: PrototypeVariant;
  direction: typeof PREVIOUS_OFFSET | typeof NEXT_OFFSET;
  variants: readonly PrototypeVariantOption[];
}): PrototypeVariant | null {
  if (variants.length === 0) {
    return null;
  }
  const currentIndex = variants.findIndex((item) => item.id === currentVariant);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = (safeIndex + direction + variants.length) % variants.length;
  return variants[nextIndex]?.id ?? null;
}

/** Floating bottom-center dev-only variant switcher supporting ArrowLeft/ArrowRight navigation. */
function PrototypeSwitcher({
  className,
  onVariantChange,
  variant,
  variants = DEFAULT_VARIANTS,
  ...props
}: PrototypeSwitcherProps) {
  useEffect(() => {
    if (import.meta.env.PROD) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (isEditableElement(event.target)) {
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      const direction = event.key === "ArrowLeft" ? PREVIOUS_OFFSET : NEXT_OFFSET;
      const nextVariant = resolveSteppedVariant({
        currentVariant: variant,
        direction,
        variants,
      });
      if (nextVariant !== null && nextVariant !== variant) {
        event.preventDefault();
        onVariantChange(nextVariant);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onVariantChange, variant, variants]);

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <aside
      aria-label="Prototype variant switcher"
      className={cn(
        "fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      <span className="hidden px-2 text-xs font-medium text-muted-foreground sm:inline">
        Prototype
      </span>
      <div className="flex items-center gap-1" role="group">
        {variants.map((option) => {
          const isActive = option.id === variant;
          return (
            <Button
              aria-pressed={isActive}
              className="rounded-full"
              key={option.id}
              size="xs"
              type="button"
              variant={isActive ? "default" : "ghost"}
              onClick={() => {
                onVariantChange(option.id);
              }}
            >
              <span>{option.id}</span>
              <span className="hidden sm:inline">· {option.label}</span>
            </Button>
          );
        })}
      </div>
      <span className="hidden px-2 text-xs text-muted-foreground md:inline">←/→</span>
    </aside>
  );
}

export { PrototypeSwitcher };
export type { PrototypeVariant, PrototypeVariantOption };
