// 8-bit retro synthesizer audio engine using Web Audio API

let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function setSoundMuted(mute) {
  isMuted = mute;
}

export function getSoundMuted() {
  return isMuted;
}

// Low-level helper to synthesize synth waves
function playTone(
  frequency,
  type,
  duration,
  volumeStart = 0.1,
  frequencyEnd
) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (common browser security constraint)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    if (frequencyEnd) {
      osc.frequency.exponentialRampToValueAtTime(frequencyEnd, ctx.currentTime + duration);
    }

    gainNode.gain.setValueAtTime(volumeStart, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Web Audio play tone failed:", e);
  }
}

// Play simple retro bleep
export function playClickSound() {
  playTone(880, "square", 0.08, 0.05);
}

// Play lower slide tick
export function playTickSound() {
  playTone(440, "triangle", 0.05, 0.06, 220);
}

// Play classic retro power-up sound
export function playPowerupSound() {
  const ctx = getAudioContext();
  if (isMuted || !ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.setValueAtTime(329.63, now + 0.08); // E4
    osc.frequency.setValueAtTime(392.00, now + 0.16); // G4
    osc.frequency.setValueAtTime(523.25, now + 0.24); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.45); // C6

    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.45);
  } catch (e) {
    console.warn("Web Audio powerup failed:", e);
  }
}

// Play success chord bleeps
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (isMuted || !ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  try {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    const gainNode2 = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5

    gainNode1.gain.setValueAtTime(0.05, now);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    gainNode2.gain.setValueAtTime(0.04, now + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gainNode1);
    gainNode1.connect(ctx.destination);

    osc2.connect(gainNode2);
    gainNode2.connect(ctx.destination);

    osc1.start();
    osc2.start(now + 0.05);

    osc1.stop(now + 0.2);
    osc2.stop(now + 0.25);
  } catch (e) {
    console.warn("Web Audio success sound failed:", e);
  }
}
