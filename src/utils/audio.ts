// Web Audio API Synthesizer for offline sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playBeadSound(volume: number = 0.5, soundType: 'bead' | 'click' | 'bell' = 'bead') {
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (soundType === 'bead') {
      // Wood bead contact sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } else if (soundType === 'click') {
      // Crisp mechanical click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } else {
      // Soft metallic bell tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.warn('Audio feedback failed:', err);
  }
}

export function playCompletionChime(volume: number = 0.6) {
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic arpeggio chime (C5 -> E5 -> G5 -> C6)
    const freqs = [523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  } catch (err) {
    console.warn('Completion chime failed:', err);
  }
}

import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function triggerVibration(vibrationEnabled: boolean, pattern: number | number[] = 25) {
  if (!vibrationEnabled) return;

  // Try Capacitor Haptics first
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
    // Fallback to standard web Vibration API
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Optional feature
      }
    }
  });
}
