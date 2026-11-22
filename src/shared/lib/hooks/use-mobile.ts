import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const MAX_MOBILE_WIDTH = MOBILE_BREAKPOINT - 1;

// oxlint-disable-next-line promise/prefer-await-to-callbacks -- React useSyncExternalStore subscribe requires a callback
function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(`(max-width: ${MAX_MOBILE_WIDTH}px)`);
  mediaQueryList.addEventListener("change", callback);
  return () => {
    mediaQueryList.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
