# Web Audio API Research for F-BASIC PLAY Command

## Research Questions & Answers

### ✅ Can Web Audio API generate square waves with duty cycle control?

**YES** - Using `PeriodicWave` API with Fourier series.

**How it works:**
- `createPeriodicWave()` accepts real/imaginary coefficients for Fourier series
- Square waves are composed of odd harmonics: `sin(ωt) + 1/3·sin(3ωt) + 1/5·sin(5ωt) + ...`
- Duty cycle changes the harmonic content (phase shifts in Fourier series)

**Duty Cycle Math:**
- **50% duty cycle** (Y2): Standard square wave (odd harmonics only)
- **25% duty cycle** (Y1): Requires phase-shifted harmonics
- **12.5% duty cycle** (Y0): More complex harmonic content
- **75% duty cycle** (Y3): Inverse of 25%

**Implementation:**
```javascript
function createSquareWave(dutyCycle) {
  const harmonics = 32; // More harmonics = better approximation
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);

  for (let n = 1; n < harmonics; n++) {
    const harmonic = n;
    // Fourier coefficient for pulse wave with duty cycle
    const coefficient = (2 / (Math.PI * harmonic)) * Math.sin(Math.PI * harmonic * dutyCycle);
    imag[n] = coefficient; // Sine component
  }

  return audioContext.createPeriodicWave(real, imag, { disableNormalization: false });
}
```

**Limitations:**
- Limited to ~32-64 harmonics (browser performance)
- Not exact NES APU sound (which uses digital pulse width modulation)
- May have slight aliasing at high frequencies

---

### ✅ Can it play 3 simultaneous sounds (polyphony)?

**YES** - Web Audio API is designed for multiple simultaneous audio sources.

**How it works:**
- Each `OscillatorNode` is an independent sound source
- All nodes connect to `AudioContext.destination` (speakers)
- Browser mixes them automatically

**Implementation:**
```javascript
function playChord(frequencies, duration) {
  frequencies.forEach(freq => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
  });
}
```

**Performance:**
- Modern browsers easily handle 100+ simultaneous oscillators
- 3 channels is trivial
- No perceptible latency

**Limitations:**
- None for F-BASIC requirements

---

### ✅ Can it control ADSR envelope (attack/decay/sustain/release)?

**YES** - Using `GainNode.gain.setValueAtTime()` and ramp methods.

**How it works:**
- `GainNode` controls volume over time
- `setValueAtTime()` - Instant change
- `linearRampToValueAtTime()` - Linear fade
- `exponentialRampToValueAtTime()` - Natural-sounding decay

**F-BASIC Envelope:**
- **M0** (no envelope): Constant volume
- **M1** (envelope): Volume decays from V to 0 over note duration

**Implementation:**
```javascript
function applyEnvelope(gainNode, volume, duration, useEnvelope) {
  const now = audioContext.currentTime;

  if (useEnvelope) {
    // M1: Exponential decay
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
  } else {
    // M0: Constant volume
    gainNode.gain.setValueAtTime(volume, now);
  }
}
```

**Limitations:**
- F-BASIC envelope is simplified (only decay, no attack/sustain/release phases)
- Web Audio can do more complex ADSR if needed
- Exponential ramps cannot reach 0 (use 0.01 as minimum)

---

### ✅ Can it precisely control note duration/timing?

**YES** - Web Audio API has sample-accurate timing.

**How it works:**
- `AudioContext.currentTime` is in seconds (high precision)
- `start(when)` and `stop(when)` schedule events precisely
- Timing is handled by audio thread (not affected by main thread lag)

**Tempo Implementation:**
```javascript
// F-BASIC tempo T1-T8 (T1=fast, T8=slow)
const TEMPO_TO_BPM = {
  1: 200, 2: 175, 3: 150, 4: 125, 5: 100, 6: 80, 7: 60, 8: 40
};

function noteDuration(noteLength, tempo) {
  const bpm = TEMPO_TO_BPM[tempo];
  const beatsPerSecond = bpm / 60;
  const wholeDuration = 4 / beatsPerSecond; // 4 beats per whole note
  return wholeDuration / noteLength; // noteLength: 1=whole, 2=half, 4=quarter, 8=eighth
}
```

**Scheduling:**
```javascript
let currentTime = audioContext.currentTime;

notes.forEach(note => {
  playNoteAt(note.frequency, currentTime, note.duration);
  currentTime += note.duration; // Next note starts when previous ends
});
```

**Limitations:**
- None for F-BASIC requirements
- Can achieve timing precision better than NES hardware

---

### ✅ Can it generate musical note frequencies (A4=440Hz, 12-tone equal temperament)?

**YES** - Simple math calculation.

**How it works:**
- A4 = 440 Hz (standard tuning)
- Each semitone up: multiply by 2^(1/12) ≈ 1.05946
- Each octave up: multiply by 2

**Implementation:**
```javascript
function noteToFrequency(note, octave) {
  const NOTES = {
    'C': -9, 'C#': -8, 'D': -7, 'D#': -6,
    'E': -5, 'F': -4, 'F#': -3, 'G': -2,
    'G#': -1, 'A': 0, 'A#': 1, 'B': 2
  };

  const semitonesFromA4 = NOTES[note] + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// Examples:
// C4 = 261.63 Hz
// E4 = 329.63 Hz
// G4 = 392.00 Hz
```

**F-BASIC Note Support:**
- C, D, E, F, G, A, B (natural notes)
- #C, #D, #F, #G, #A (sharps)
- Octaves O0-O5

**Limitations:**
- None for F-BASIC requirements

---

### ⚠️ Browser Compatibility Issues

**Autoplay Policy (CRITICAL):**
- Modern browsers block audio until user interaction
- Requires user gesture (click, touch, keyboard)
- **Workaround**: Initialize `AudioContext` on first user action

**Browser Support:**
- ✅ Chrome 35+ (2014)
- ✅ Firefox 25+ (2013)
- ✅ Safari 14.1+ (2021) - required for `AudioContext.resume()`
- ✅ Edge 79+ (Chromium-based)

**API Availability:**
- ✅ `OscillatorNode` - Universal
- ✅ `GainNode` - Universal
- ✅ `createPeriodicWave()` - Chrome 30+, Firefox 25+, Safari 8+
- ⚠️ Safari requires `webkit` prefix for older versions

**Performance:**
- Modern devices: No issues
- Low-end mobile: May struggle with 10+ simultaneous oscillators (F-BASIC only needs 3)

---

### ⚠️ Autoplay Policy Workarounds

**Problem:**
- Cannot call `audioContext.resume()` or create oscillators until user gesture

**Solutions:**

**Option 1: IDE Play Button** (RECOMMENDED)
```javascript
// User clicks "Run" button in IDE
document.getElementById('run-button').addEventListener('click', async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  runBasicProgram();
});
```

**Option 2: Silent Audio on Startup**
```javascript
// Play silent sound on first interaction to unlock audio
async function unlockAudio() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  gain.gain.value = 0; // Silent
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.01);
  await audioContext.resume();
}
```

**Option 3: User Warning**
```javascript
// Show banner if audio is blocked
if (audioContext.state === 'suspended') {
  showWarning('Click anywhere to enable sound');
  document.addEventListener('click', () => audioContext.resume(), { once: true });
}
```

---

## Summary

| Requirement | Status | Notes |
|-------------|--------|-------|
| Square waves with duty cycle | ✅ YES | `createPeriodicWave()` with Fourier series |
| 3-channel polyphony | ✅ YES | Multiple `OscillatorNode` instances |
| ADSR envelope | ✅ YES | `GainNode` with ramps (F-BASIC uses simple decay) |
| Precise timing | ✅ YES | Sample-accurate scheduling |
| Musical note frequencies | ✅ YES | 12-tone equal temperament calculation |
| Browser compatibility | ⚠️ PARTIAL | Requires user gesture for autoplay policy |
| NES APU accuracy | ❌ NO | Web Audio is higher quality (not a limitation) |

**Verdict:** Web Audio API can implement **100% of F-BASIC PLAY requirements** with minor autoplay policy handling.
