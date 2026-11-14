import { useCallback, useState, useSyncExternalStore } from "react";

interface AnchorState {
  active: string | undefined;
  hash: string | undefined;
  openAnchors: ReadonlySet<string>;
}

function useStepAnchors(activeAnchor: string | undefined) {
  // Gate initial hash expansion behind post-hydration snapshot so SSR and hydration DOM match.
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrated,
    getServerHydrated,
  );
  const hashAnchor = useSyncExternalStore(
    subscribeToHashChange,
    getClientHashAnchor,
    getServerHashAnchor,
  );
  const [state, setState] = useState<AnchorState>(createInitialAnchorState);

  const nextState = syncTargetAnchors(
    state,
    isHydrated ? activeAnchor : undefined,
    isHydrated ? hashAnchor : undefined,
  );
  if (nextState !== state) {
    setState(nextState);
  }

  const setAnchorOpen = useCallback((anchor: string, open: boolean) => {
    setState((previous) => updateAnchorState(previous, anchor, open));
  }, []);

  return { openAnchors: nextState.openAnchors, setAnchorOpen };
}

function createInitialAnchorState(): AnchorState {
  return {
    active: undefined,
    hash: undefined,
    openAnchors: new Set(),
  };
}

function syncTargetAnchors(
  current: AnchorState,
  targetActive: string | undefined,
  targetHash: string | undefined,
): AnchorState {
  if (current.active === targetActive && current.hash === targetHash) {
    return current;
  }

  const nextOpenAnchors = new Set(current.openAnchors);
  if (current.active !== targetActive && targetActive !== undefined) {
    nextOpenAnchors.add(targetActive);
  }
  if (current.hash !== targetHash && targetHash !== undefined) {
    nextOpenAnchors.add(targetHash);
  }

  return {
    active: targetActive,
    hash: targetHash,
    openAnchors: nextOpenAnchors,
  };
}

function updateAnchorState(current: AnchorState, anchor: string, open: boolean): AnchorState {
  const nextOpenAnchors = new Set(current.openAnchors);
  if (open) {
    nextOpenAnchors.add(anchor);
  } else {
    nextOpenAnchors.delete(anchor);
  }
  return {
    ...current,
    openAnchors: nextOpenAnchors,
  };
}

function subscribeToHydration() {
  return () => {
    // Hydration state does not change after initial client mount.
  };
}

function getClientHydrated(): boolean {
  return true;
}

function getServerHydrated(): boolean {
  return false;
}

function subscribeToHashChange(onStoreChange: () => void): () => void {
  window.addEventListener("hashchange", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function getClientHashAnchor(): string | undefined {
  return normalizeAnchor(window.location.hash);
}

function getServerHashAnchor(): string | undefined {
  return undefined;
}

function normalizeAnchor(hash: string): string | undefined {
  const normalized = hash.replace(/^#/u, "");
  return normalized.length > 0 ? normalized : undefined;
}

export { useStepAnchors };
