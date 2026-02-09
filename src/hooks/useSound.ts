/**
 * Sound effects system using Web Audio API
 * No external audio files needed — generates tones programmatically.
 */
import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playSequence(notes: { freq: number; time: number; duration: number; type?: OscillatorType }[], volume = 0.15) {
  notes.forEach(n => {
    setTimeout(() => playTone(n.freq, n.duration, n.type || 'sine', volume), n.time * 1000);
  });
}

export function useSound() {
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const lastComboRef = useRef(0);

  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    playSequence([
      { freq: 523, time: 0, duration: 0.12 },      // C5
      { freq: 659, time: 0.08, duration: 0.12 },    // E5
      { freq: 784, time: 0.16, duration: 0.2 },     // G5
    ]);
  }, [soundEnabled]);

  const playWrong = useCallback(() => {
    if (!soundEnabled) return;
    playSequence([
      { freq: 330, time: 0, duration: 0.15, type: 'triangle' },
      { freq: 277, time: 0.12, duration: 0.25, type: 'triangle' },
    ]);
  }, [soundEnabled]);

  const playCombo = useCallback((comboCount: number) => {
    if (!soundEnabled || comboCount <= lastComboRef.current) return;
    lastComboRef.current = comboCount;
    // Rising arpeggio — higher pitch for bigger combos
    const base = 523 + (comboCount * 50);
    playSequence([
      { freq: base, time: 0, duration: 0.1 },
      { freq: base * 1.25, time: 0.06, duration: 0.1 },
      { freq: base * 1.5, time: 0.12, duration: 0.1 },
      { freq: base * 2, time: 0.18, duration: 0.25 },
    ], 0.12);
  }, [soundEnabled]);

  const playBossWin = useCallback(() => {
    if (!soundEnabled) return;
    playSequence([
      { freq: 523, time: 0, duration: 0.15 },
      { freq: 659, time: 0.1, duration: 0.15 },
      { freq: 784, time: 0.2, duration: 0.15 },
      { freq: 1047, time: 0.35, duration: 0.4 },
    ]);
  }, [soundEnabled]);

  const playBossLose = useCallback(() => {
    if (!soundEnabled) return;
    playSequence([
      { freq: 392, time: 0, duration: 0.2, type: 'triangle' },
      { freq: 330, time: 0.15, duration: 0.2, type: 'triangle' },
      { freq: 262, time: 0.3, duration: 0.4, type: 'triangle' },
    ]);
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    playTone(880, 0.05, 'sine', 0.08);
  }, [soundEnabled]);

  const playAchievement = useCallback(() => {
    if (!soundEnabled) return;
    playSequence([
      { freq: 523, time: 0, duration: 0.1 },
      { freq: 659, time: 0.08, duration: 0.1 },
      { freq: 784, time: 0.16, duration: 0.1 },
      { freq: 1047, time: 0.24, duration: 0.15 },
      { freq: 1319, time: 0.36, duration: 0.3 },
    ]);
  }, [soundEnabled]);

  return { playCorrect, playWrong, playCombo, playBossWin, playBossLose, playClick, playAchievement };
}
