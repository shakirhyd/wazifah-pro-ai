import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Wazifah, UserSettings, WazifahSession } from '../types/wazifah';
import { playBeadSound, playCompletionChime, triggerVibration } from '../utils/audio';
import { RotateCcw, Undo2, CheckCircle2, Play, Pause, Plus, RefreshCw, Volume2, Sparkles } from 'lucide-react';

interface TasbeehCounterProps {
  wazifah: Wazifah;
  settings: UserSettings;
  onSaveSession: (session: WazifahSession) => void;
}

export const TasbeehCounter: React.FC<TasbeehCounterProps> = ({
  wazifah,
  settings,
  onSaveSession,
}) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(wazifah.recommendedTarget || 33);
  const [lap, setLap] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync target when wazifah changes
  useEffect(() => {
    setCount(0);
    setTarget(wazifah.recommendedTarget || 33);
    setLap(1);
    setTimerSeconds(0);
    setIsRunning(false);
    setShowCompletionModal(false);
    setSessionStartTime(null);
  }, [wazifah.id, wazifah.recommendedTarget]);

  // Session timer ticker
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Handle tap increment
  const handleIncrement = useCallback((amount: number = 1) => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
    if (!isRunning) {
      setIsRunning(true);
    }

    setCount(prev => {
      const newCount = prev + amount;

      // Audio & Vibration
      if (settings.soundEnabled) {
        playBeadSound(settings.soundVolume, settings.soundType);
      }
      if (settings.vibrationEnabled) {
        triggerVibration(settings.vibrationEnabled, 20);
      }

      // Check target completion
      if (newCount >= target && prev < target) {
        if (settings.soundEnabled) {
          playCompletionChime(settings.soundVolume);
        }
        if (settings.vibrationEnabled) {
          triggerVibration(settings.vibrationEnabled, [50, 100, 150]);
        }

        // Trigger Confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#3b82f6', '#fbbf24'],
          });
        } catch (e) {
          console.warn('Confetti burst failed', e);
        }

        setShowCompletionModal(true);
      }

      return newCount;
    });
  }, [isRunning, sessionStartTime, settings, target]);

  // Handle Undo
  const handleUndo = () => {
    if (count > 0) {
      setCount(prev => prev - 1);
      if (settings.soundEnabled) {
        playBeadSound(settings.soundVolume * 0.5, 'click');
      }
    }
  };

  // Handle Reset
  const handleReset = () => {
    if (count > 0 && !window.confirm('Reset current count and timer?')) return;
    setCount(0);
    setTimerSeconds(0);
    setIsRunning(false);
    setShowCompletionModal(false);
    setSessionStartTime(null);
  };

  // Handle Next Lap / Round
  const handleNextLap = () => {
    setLap(prev => prev + 1);
    setCount(0);
    setShowCompletionModal(false);
  };

  // Save session to history
  const handleCompleteAndSave = () => {
    if (count === 0) return;

    const completedAt = new Date().toISOString();
    const startedAt = sessionStartTime || completedAt;
    const duration = Math.max(1, timerSeconds);
    const speed = Math.round((count / duration) * 60);

    const session: WazifahSession = {
      id: 'session_' + Date.now(),
      wazifahId: wazifah.id,
      wazifahTitle: wazifah.title,
      arabicText: wazifah.arabicText,
      count,
      targetCount: target,
      durationSeconds: duration,
      startedAt,
      completedAt,
      speedCountPerMin: speed,
    };

    onSaveSession(session);

    // Reset counter for next time
    setCount(0);
    setLap(1);
    setTimerSeconds(0);
    setIsRunning(false);
    setShowCompletionModal(false);
    setSessionStartTime(null);
  };

  // Format timer string 00:00:00
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = Math.min(100, Math.round((count / target) * 100));
  const countsPerMin = timerSeconds > 0 ? Math.round((count / timerSeconds) * 60) : 0;

  // SVG Progress Ring calculations
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 py-2 select-none">
      {/* Target & Lap Header Status */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target:</span>
          <div className="flex items-center gap-1 font-bold text-amber-300">
            <input
              type="number"
              min="1"
              max="99999"
              value={target}
              onChange={e => setTarget(Math.max(1, parseInt(e.target.value) || 33))}
              className="w-14 bg-slate-900/80 text-amber-300 text-center rounded border border-slate-700 px-1 py-0.5 font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
            Round {lap}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-300 font-mono">
          <span>{formatTime(timerSeconds)}</span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1 hover:text-amber-300 transition-colors"
            title={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Tasbeeh Counter Circle */}
      <div className="relative flex items-center justify-center my-2">
        {/* SVG Circular Progress Ring */}
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xl">
          {/* Outer track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#emeraldGoldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
          <defs>
            <linearGradient id="emeraldGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Main Tap Button */}
        <button
          onClick={() => handleIncrement(1)}
          className="absolute w-52 h-52 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-slate-700/80 hover:border-amber-400/80 active:scale-95 transition-all shadow-2xl flex flex-col items-center justify-center p-4 cursor-pointer group hover:shadow-amber-500/10 active:border-emerald-400"
        >
          {/* Subtle Bead Ring Decorative Inner Border */}
          <div className="absolute inset-2 rounded-full border border-dashed border-amber-500/20 group-hover:border-amber-400/40 transition-colors pointer-events-none" />

          {/* Progress Percentage Badge */}
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/90 mb-1">
            {progressPercent}% Complete
          </span>

          {/* Large Counter Number */}
          <span className="text-5xl font-black text-slate-100 font-mono tracking-tight group-active:scale-110 transition-transform">
            {count}
          </span>

          {/* Target Denominator */}
          <span className="text-sm font-semibold text-slate-400 mt-1">
            of {target}
          </span>

          {/* Tap Prompt */}
          <span className="text-[10px] font-medium text-amber-300/80 mt-2 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
            TAP HERE
          </span>
        </button>
      </div>

      {/* Speed & Stats bar */}
      <div className="flex items-center justify-around w-full px-4 text-xs text-slate-400 bg-slate-800/30 py-2 rounded-xl border border-slate-700/30">
        <div>
          <span className="text-slate-500">Speed: </span>
          <span className="font-semibold text-slate-200">{countsPerMin}</span>
          <span className="text-[10px] text-slate-500"> /min</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div>
          <span className="text-slate-500">Remaining: </span>
          <span className="font-semibold text-amber-300">{Math.max(0, target - count)}</span>
        </div>
      </div>

      {/* Secondary Controls Bar */}
      <div className="w-full grid grid-cols-4 gap-2">
        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={count === 0}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-colors"
          title="Undo 1 count"
        >
          <Undo2 className="w-4 h-4 text-amber-400 mb-0.5" />
          <span>-1 Undo</span>
        </button>

        {/* +10 Quick Add */}
        <button
          onClick={() => handleIncrement(10)}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-colors"
          title="Add +10 counts"
        >
          <Plus className="w-4 h-4 text-emerald-400 mb-0.5" />
          <span>+10 Quick</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={count === 0 && timerSeconds === 0}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-colors"
          title="Reset counter"
        >
          <RotateCcw className="w-4 h-4 text-rose-400 mb-0.5" />
          <span>Reset</span>
        </button>

        {/* Save Session Button */}
        <button
          onClick={handleCompleteAndSave}
          disabled={count === 0}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-40 disabled:hover:from-emerald-600 text-white rounded-xl border border-emerald-500/40 text-xs font-bold transition-all shadow-md shadow-emerald-950/30"
          title="Save session to history log"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-300 mb-0.5" />
          <span>Save Session</span>
        </button>
      </div>

      {/* Target Reached Modal / Banner */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-sm w-full bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl shadow-amber-500/10">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl">
              🎉
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-100 font-sans">Target Reached!</h3>
              <p className="text-sm text-amber-300 font-semibold mt-1">
                Completed {count} of {target} counts!
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Time elapsed: {formatTime(timerSeconds)} ({countsPerMin} counts/min)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleNextLap}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Round ({lap + 1})</span>
              </button>

              <button
                onClick={handleCompleteAndSave}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl border border-emerald-400/30 transition-colors shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Save & Finish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
