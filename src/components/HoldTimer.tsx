import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface HoldTimerProps {
  durationSeconds?: number;
  label?: string;
  onComplete?: () => void;
}

export function HoldTimer({
  durationSeconds = 5,
  label = '5s Hold Timer',
  onComplete,
}: HoldTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setIsRunning(false);
  }, [durationSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onComplete]);

  const toggle = () => {
    if (timeLeft === 0) {
      setTimeLeft(durationSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(durationSeconds);
  };

  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-base font-bold text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
          {timeLeft}s
        </span>
        <span className="text-xs text-zinc-300 font-medium">{label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={reset}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          title="Reset"
        >
          <RotateCcw size={15} />
        </button>
        <button
          type="button"
          onClick={toggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
            isRunning
              ? 'bg-amber-700 text-white'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
          }`}
        >
          {isRunning ? <Pause size={13} /> : <Play size={13} />}
          <span>{isRunning ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Start'}</span>
        </button>
      </div>
    </div>
  );
}
