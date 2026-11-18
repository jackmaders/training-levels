import { useSyncExternalStore } from "react";

let cachedClientDateSnapshot: { date: Date; dayKey: string } | null = null;

function subscribeToClock() {
  return () => {
    // Wall-clock day check is evaluated on hydration; no live clock subscription.
  };
}

function getServerHydratedDate(): Date | null {
  return null;
}

function getClientHydratedDate(): Date {
  const now = new Date();
  const dayKey = now.toDateString();
  if (cachedClientDateSnapshot?.dayKey === dayKey) {
    return cachedClientDateSnapshot.date;
  }
  cachedClientDateSnapshot = { date: now, dayKey };
  return now;
}

function useHydratedNow(): Date | null {
  return useSyncExternalStore(subscribeToClock, getClientHydratedDate, getServerHydratedDate);
}

export { useHydratedNow };
