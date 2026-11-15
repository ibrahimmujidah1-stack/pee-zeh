// Procedural Web Audio API & Praise Hailing Sound Engine for p-zeh
// Zero external dependencies, zero 404s, zero latency

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Crisp cash spray whoosh effect
 */
export function playSprayWhoosh(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.warn('Audio whoosh error:', err);
  }
}

/**
 * High-pitched crisp cash register / cha-ching sound
 */
export function playCashChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First bell chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second resonant bell chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2200, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(2600, now + 0.15);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.35, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}

/**
 * Afrobeats party brass horn fanfare ("TOOT TOOT!")
 */
export function playOwambeHorn(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 440, start: 0, duration: 0.12 },     // A4
      { freq: 554.37, start: 0.14, duration: 0.12 }, // C#5
      { freq: 659.25, start: 0.28, duration: 0.28 }, // E5
      { freq: 880, start: 0.42, duration: 0.45 },    // A5 (Climax!)
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.linearRampToValueAtTime(0.2, now + n.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.duration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now + n.start);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.duration);
    });
  } catch (err) {
    console.warn('Audio horn error:', err);
  }
}

/**
 * Authentic African Talking Drum (Gangan) Beats
 */
export function playTalkingDrum(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const drumBeats = [
      { start: 0, fStart: 260, fEnd: 150, dur: 0.15 },
      { start: 0.16, fStart: 320, fEnd: 180, dur: 0.18 },
      { start: 0.35, fStart: 280, fEnd: 140, dur: 0.14 },
      { start: 0.50, fStart: 380, fEnd: 210, dur: 0.25 },
    ];

    drumBeats.forEach((b) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(b.fStart, now + b.start);
      osc.frequency.exponentialRampToValueAtTime(b.fEnd, now + b.start + b.dur);

      gain.gain.setValueAtTime(0.4, now + b.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + b.start + b.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + b.start);
      osc.stop(now + b.start + b.dur);
    });
  } catch (err) {
    console.warn('Talking drum error:', err);
  }
}

/**
 * Royal Odogwu Hailing Praise Audio Engine
 * Plays royal brass fanfare + talking drums + browser speech praise hailing
 */
export function playOdogwuHailingSound(guestName?: string, amount?: number): void {
  // 1. Play Talking Drums
  playTalkingDrum();

  // 2. Play Royal Brass Chords
  setTimeout(() => {
    playOwambeHorn();
    playCashChime();
  }, 180);

  // 3. Spoken Yoruba/Nigerian Praise Hailing via Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const name = guestName || 'Odogwu';
      const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, '');
      const praises = [
        `Odogwu! ${cleanName} is spraying big! Owo ni koko! Clear the dance floor for Odogwu!`,
        `Otunba ${cleanName}! Billionaire spray! Soft life forever! Hail the chairman!`,
        `Odogwu na the boss! ${cleanName} is balling on the dance floor! More blessings!`,
      ];
      const selectedPraise = praises[Math.floor(Math.random() * praises.length)];

      const utterance = new SpeechSynthesisUtterance(selectedPraise);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      // Prefer English voice if available
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find((v) => v.lang.includes('en') || v.lang.includes('NG'));
      if (engVoice) utterance.voice = engVoice;

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 400);
    } catch (e) {
      console.warn('Speech synthesis praise bypassed:', e);
    }
  }
}

/**
 * Trigger celebration sound based on spray
 */
export function playCelebrationSound(isOdogwu: boolean = false, guestName?: string, amount?: number): void {
  if (isOdogwu || (amount && amount >= 50)) {
    playOdogwuHailingSound(guestName, amount);
  } else {
    playCashChime();
    setTimeout(() => {
      playOwambeHorn();
    }, 100);
  }
}
