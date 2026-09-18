import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Wazifah, UserSettings, WazifahSession, DhikrStepDetail } from '../types/wazifah';
import { playBeadSound, playCompletionChime, triggerVibration } from '../utils/audio';
import { RotateCcw, Undo2, CheckCircle2, Play, Pause, Plus, RefreshCw, ArrowRight } from 'lucide-react';

interface TasbeehCounterProps {
  wazifah: Wazifah;
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  settings: UserSettings;
  onUpdateSettings?: (settings: UserSettings) => void;
  onSaveSession: (session: WazifahSession) => void;
}

export const TasbeehCounter: React.FC<TasbeehCounterProps> = ({
  wazifah,
  activeStepIndex,
  onSelectStep,
  settings,
  onUpdateSettings,
  onSaveSession,
}) => {
  const steps = wazifah.steps && wazifah.steps.length > 0 ? wazifah.steps : [];
  const currentStep = steps[activeStepIndex] || steps[0] || {
    dhikrTitle: wazifah.title,
    targetCount: 33,
  };

  const [stepCountsCompleted, setStepCountsCompleted] = useState<Record<number, number>>({});
  const [stepDurations, setStepDurations] = useState<Record<number, number>>({});

  const [count, setCount] = useState(0);
  const [stepTarget, setStepTarget] = useState(currentStep.targetCount || 33);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showStepCompletionModal, setShowStepCompletionModal] = useState(false);
  const [showFullWazifahCompletionModal, setShowFullWazifahCompletionModal] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevWazifahIdRef = useRef(wazifah.id);

  // Sync state when active step or wazifah changes
  useEffect(() => {
    if (prevWazifahIdRef.current !== wazifah.id) {
      // User switched to a different Wazifah: reset entire session
      prevWazifahIdRef.current = wazifah.id;
      setCount(0);
      setStepTarget(currentStep.targetCount || 33);
      setTimerSeconds(0);
      setIsRunning(false);
      setShowStepCompletionModal(false);
      setShowFullWazifahCompletionModal(false);
      setSessionStartTime(null);
      setStepCountsCompleted({});
      setStepDurations({});
      return;
    }

    // User navigated to another step within the SAME Wazifah:
    // Retain and display the existing count for this step (or 0 if not started yet)
    const retained = stepCountsCompleted[activeStepIndex] || 0;
    setCount(retained);
    setStepTarget(currentStep.targetCount || 33);
  }, [wazifah.id, activeStepIndex, currentStep.targetCount]);

  // Timer ticker - increments overall timer & per-step duration
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
        setStepDurations(prev => ({
          ...prev,
          [activeStepIndex]: (prev[activeStepIndex] || 0) + 1,
        }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, activeStepIndex]);

  // Handle Increment
  const handleIncrement = useCallback((amount: number = 1) => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
    if (!isRunning) {
      setIsRunning(true);
    }

    setCount(prev => {
      const newCount = prev + amount;

      // Sound & Haptic
      if (settings.soundEnabled) {
        playBeadSound(settings.soundVolume, settings.soundType);
      }
      if (settings.vibrationEnabled) {
        triggerVibration(settings.vibrationEnabled, 20);
      }

      // Record count for active step
      setStepCountsCompleted(prevMap => ({
        ...prevMap,
        [activeStepIndex]: (prevMap[activeStepIndex] || 0) + amount,
      }));

      // Check step target completion
      if (newCount >= stepTarget && prev < stepTarget) {
        // Pause timer immediately when step/wazifah completion box appears
        setIsRunning(false);

        if (settings.soundEnabled) {
          playCompletionChime(settings.soundVolume);
        }
        if (settings.vibrationEnabled) {
          triggerVibration(settings.vibrationEnabled, [50, 100, 150]);
        }

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#3b82f6', '#fbbf24'],
          });
        } catch (e) {
          console.warn('Confetti failed', e);
        }

        const isLastStep = activeStepIndex >= steps.length - 1;
        if (isLastStep) {
          setShowFullWazifahCompletionModal(true);
        } else {
          setShowStepCompletionModal(true);
        }
      }

      return newCount;
    });
  }, [activeStepIndex, isRunning, sessionStartTime, settings, stepTarget, steps.length]);

  // Handle Proceed to Next Step inside Wazifah
  const handleProceedToNextStep = () => {
    setShowStepCompletionModal(false);
    if (activeStepIndex < steps.length - 1) {
      onSelectStep(activeStepIndex + 1);
    }
    // Resume timer when back on counter screen
    setIsRunning(true);
  };

  const handleKeepCountingStep = () => {
    setShowStepCompletionModal(false);
    // Resume timer when back on counter screen
    setIsRunning(true);
  };

  // Handle Undo
  const handleUndo = () => {
    if (count > 0) {
      setCount(prev => prev - 1);
      setStepCountsCompleted(prevMap => ({
        ...prevMap,
        [activeStepIndex]: Math.max(0, (prevMap[activeStepIndex] || 0) - 1),
      }));
      if (settings.soundEnabled) {
        playBeadSound(settings.soundVolume * 0.5, 'click');
      }
    }
  };

  // Handle Reset
  const handleReset = () => {
    const totalDone = Object.values(stepCountsCompleted).reduce((a, b) => a + b, 0);
    if ((count > 0 || totalDone > 0) && !window.confirm('Reset current count and session timer?')) return;
    setCount(0);
    setTimerSeconds(0);
    setIsRunning(false);
    setShowStepCompletionModal(false);
    setShowFullWazifahCompletionModal(false);
    setSessionStartTime(null);
    setStepCountsCompleted({});
    setStepDurations({});
    onSelectStep(0);
  };

  // Handle Repeat Routine
  const handleRepeatRoutine = () => {
    setCount(0);
    setStepCountsCompleted({});
    setStepDurations({});
    setShowStepCompletionModal(false);
    setShowFullWazifahCompletionModal(false);
    onSelectStep(0);
    setIsRunning(true);
  };

  // Calculate total counts across all steps in current session
  const totalCountAcrossAllSteps = Object.values(stepCountsCompleted).reduce((a, b) => a + b, 0);

  // Toggle speed unit
  const speedUnit = settings.speedUnit || 'cpm';
  const toggleSpeedUnit = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        speedUnit: speedUnit === 'cpm' ? 'sec_per_count' : 'cpm',
      });
    }
  };

  // Save session to history
  const handleCompleteAndSave = () => {
    if (totalCountAcrossAllSteps === 0 && count === 0) return;

    const finalCount = totalCountAcrossAllSteps > 0 ? totalCountAcrossAllSteps : count;
    const completedAt = new Date().toISOString();
    const startedAt = sessionStartTime || completedAt;
    const duration = Math.max(1, timerSeconds);
    const speed = Math.round((finalCount / duration) * 60);

    // Build steps summary string & dhikr breakdown details
    const summaryParts: string[] = [];
    const dhikrDetails: DhikrStepDetail[] = steps.map((s, idx) => {
      const stepCount = stepCountsCompleted[idx] || (idx === activeStepIndex ? count : 0);
      const stepTime = stepDurations[idx] || 0;
      summaryParts.push(`${s.dhikrTitle} (${stepCount}/${s.targetCount})`);
      return {
        dhikrId: s.dhikrId,
        dhikrTitle: s.dhikrTitle,
        count: stepCount,
        targetCount: s.targetCount,
        durationSeconds: stepTime,
      };
    });

    const session: WazifahSession = {
      id: 'session_' + Date.now(),
      wazifahId: wazifah.id,
      wazifahTitle: wazifah.title,
      stepsSummary: summaryParts.join(' • '),
      count: finalCount,
      targetCount: steps.reduce((acc, s) => acc + s.targetCount, 0),
      durationSeconds: duration,
      startedAt,
      completedAt,
      speedCountPerMin: speed,
      dhikrDetails,
    };

    onSaveSession(session);

    // Reset counter
    setCount(0);
    setTimerSeconds(0);
    setIsRunning(false);
    setShowStepCompletionModal(false);
    setShowFullWazifahCompletionModal(false);
    setSessionStartTime(null);
    setStepCountsCompleted({});
    setStepDurations({});
    onSelectStep(0);
  };

  // Calculate current Dhikr speed based ONLY on current active step count and step duration
  const currentDhikrSeconds = stepDurations[activeStepIndex] || 0;
  const currentDhikrCount = count;
  const countsPerMin = currentDhikrSeconds > 0 ? Math.round((currentDhikrCount / currentDhikrSeconds) * 60) : 0;
  const secPerCount = currentDhikrCount > 0 ? (currentDhikrSeconds / currentDhikrCount).toFixed(1) : '0.0';

  // Format timer
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percent for current step
  const progressPercent = Math.min(100, Math.round((count / stepTarget) * 100));

  // SVG Progress Ring calculations
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 py-2 select-none">
      {/* Top Status Bar: Speed (Left) | Dhikr Timer (Center) | Total Timer (Right) */}
      <div className="w-full grid grid-cols-3 items-center px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs gap-1">
        {/* Left: Speed Indicator */}
        <button
          onClick={toggleSpeedUnit}
          className="flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer justify-start min-w-0"
          title="Click to toggle between /min and s/count"
        >
          <span className="text-slate-400 font-medium truncate">Speed:</span>
          {speedUnit === 'sec_per_count' ? (
            <span className="font-bold text-amber-300 font-mono whitespace-nowrap">{secPerCount}s</span>
          ) : (
            <span className="font-bold text-amber-300 font-mono whitespace-nowrap">{countsPerMin}/m</span>
          )}
          <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-400 px-1 py-0.2 rounded font-mono shrink-0">
            ⇄
          </span>
        </button>

        {/* Center: Dhikr Timing */}
        <div className="flex items-center justify-center gap-1 text-amber-300 font-mono font-semibold">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Dhikr:</span>
          <span>{formatTime(currentDhikrSeconds)}</span>
        </div>

        {/* Right: Total Timer */}
        <div className="flex items-center justify-end gap-1 text-slate-300 font-mono">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Total:</span>
          <span className="font-semibold">{formatTime(timerSeconds)}</span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
            title={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Counter Ring */}
      <div className="relative flex items-center justify-center my-1">
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xl">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />
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
          <div className="absolute inset-2 rounded-full border border-dashed border-amber-500/20 group-hover:border-amber-400/40 transition-colors pointer-events-none" />

          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/90 mb-1">
            {progressPercent}% Complete
          </span>

          <span className="text-5xl font-black text-slate-100 font-mono tracking-tight group-active:scale-110 transition-transform">
            {count}
          </span>
        </button>
      </div>

      {/* Control Buttons Bar: Undo, Reset, Save Log */}
      <div className="w-full grid grid-cols-3 gap-2.5 pt-1">
        <button
          onClick={handleUndo}
          disabled={count === 0}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          title="Undo 1 count"
        >
          <Undo2 className="w-4 h-4 text-amber-400" />
          <span>-1 Undo</span>
        </button>

        <button
          onClick={handleReset}
          disabled={count === 0 && totalCountAcrossAllSteps === 0 && timerSeconds === 0}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          title="Reset counter"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Reset</span>
        </button>

        <button
          onClick={handleCompleteAndSave}
          disabled={count === 0 && totalCountAcrossAllSteps === 0}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl border border-emerald-500/40 text-xs font-bold transition-all shadow-md cursor-pointer"
          title="Save session to history log"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>Save Log</span>
        </button>
      </div>

      {/* Step Completion Modal (Timer is paused while shown) */}
      {showStepCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-sm w-full bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl shadow-amber-500/10">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto text-xl">
              ✨
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Dhikr Step Complete!</h3>
              <p className="text-sm text-amber-300 font-semibold mt-1">
                Completed {currentStep.dhikrTitle} ({count}/{stepTarget})!
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                ⏱️ Step Time: {formatTime(stepDurations[activeStepIndex] || 0)}
              </p>
              {steps[activeStepIndex + 1] && (
                <p className="text-xs text-slate-300 mt-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                  Next Step ({activeStepIndex + 2}/{steps.length}): <br />
                  <strong className="text-amber-300">{steps[activeStepIndex + 1].dhikrTitle}</strong> ({steps[activeStepIndex + 1].targetCount} times)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleKeepCountingStep}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Keep Counting
              </button>

              <button
                onClick={handleProceedToNextStep}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg flex items-center justify-center gap-1"
              >
                <span>Next Dhikr</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Wazifah Completion Modal (Timer is paused while shown) */}
      {showFullWazifahCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-sm w-full bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl shadow-amber-500/10">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl">
              👑
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-100">Full Wazifah Complete!</h3>
              <p className="text-sm text-amber-300 font-semibold mt-1">
                Completed all steps in "{wazifah.title}"!
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Total Recitations: {totalCountAcrossAllSteps || count} • Time: {formatTime(timerSeconds)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleRepeatRoutine}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Repeat Routine</span>
              </button>

              <button
                onClick={handleCompleteAndSave}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl border border-emerald-400/30 transition-colors shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

