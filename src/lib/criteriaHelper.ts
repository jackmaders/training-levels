export interface CriteriaConfig {
  type: 'timing' | 'discrete';
  durationSeconds?: number;
  label: string;
}

/**
 * Detects whether a step criterion is duration/timing based (e.g. 5s, 10s, 30s, 1min)
 * or discrete repetition based.
 */
export function getCriteriaConfig(criterionSummary: string, title: string): CriteriaConfig {
  const text = `${title} ${criterionSummary}`.toLowerCase();

  // Check for seconds
  const secMatch = text.match(/(\d+)\s*(?:seconds|second|sec|s\b)/);
  if (secMatch && secMatch[1]) {
    const sec = parseInt(secMatch[1], 10);
    if (sec > 0 && sec <= 300) {
      return {
        type: 'timing',
        durationSeconds: sec,
        label: `${sec}s Duration Hold`,
      };
    }
  }

  // Check for minutes
  const minMatch = text.match(/(\d+)\s*(?:minutes|minute|min|m\b)/);
  if (minMatch && minMatch[1]) {
    const min = parseInt(minMatch[1], 10);
    if (min > 0 && min <= 30) {
      return {
        type: 'timing',
        durationSeconds: min * 60,
        label: `${min}m Duration Hold`,
      };
    }
  }

  // Check for keywords like "settles for", "stays for", "watches for"
  if (text.includes('zen') || text.includes('stay') || text.includes('settle') || text.includes('hold')) {
    return {
      type: 'timing',
      durationSeconds: 5,
      label: '5s Hold Target',
    };
  }

  return {
    type: 'discrete',
    label: 'Standard Repetition',
  };
}
