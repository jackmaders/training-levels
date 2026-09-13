import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface HoldTimerProps {
  durationSeconds?: number;
  label?: string;
  onComplete?: () => void;
  variant?: 'compact' | 'prominent' | 'hud';
}

export function HoldTimer({
  durationSeconds = 5,
  label = 'Zen Hold Target',
  onComplete,
  variant = 'compact',
}: HoldTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setIsRunning(false);
    setHasFinished(false);
  }, [durationSeconds]);

  const triggerChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio might be restricted
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasFinished(true);
            triggerChime();
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
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
      setHasFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(durationSeconds);
    setHasFinished(false);
  };

  const progressPercent = ((durationSeconds - timeLeft) / durationSeconds) * 100;

  if (variant === 'hud') {
    return (
      <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-3 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            {label} ({durationSeconds}s)
          </span>
          <span className="text-3xl font-black font-mono tracking-tight text-amber-300">
            00:0{timeLeft}.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-slate-700 active:scale-90"
            title="Reset timer"
          >
            <RotateCcw size={20} />
          </button>
          <button
            type="button"
            onClick={toggle}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition active:scale-95 ${
              isRunning
                ? 'bg-amber-600 text-slate-950'
                : hasFinished
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
            }`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="fill-slate-950" />}
            <span>{isRunning ? 'Pause' : hasFinished ? 'Restart' : 'Start'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2">
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="13"
              className="stroke-slate-800"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="16"
              cy="16"
              r="13"
              className={`transition-all duration-300 ${
                hasFinished ? 'stroke-emerald-400' : 'stroke-indigo-400'
              }`}
              strokeWidth="3"
              strokeDasharray={81.68}
              strokeDashoffset={81.68 - (81.68 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-xs font-mono font-bold text-slate-200">
            {timeLeft}s
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-200">{label}</span>
          <span className="text-[10px] text-slate-400">
            {hasFinished ? '🎉 Hold Complete!' : isRunning ? 'Counting down...' : 'Tap start to time hold'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={reset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:scale-90 transition"
          title="Reset"
        >
          <RotateCcw size={15} />
        </button>
        <button
          type="button"
          onClick={toggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition active:scale-95 ${
            isRunning
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
              : hasFinished
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} className={hasFinished ? '' : 'fill-white'} />}
          <span>{isRunning ? 'Pause' : hasFinished ? 'Repeat' : 'Start'}</span>
        </button>
      </div>
    </div>
  );
}
