# Strategic Idea: Music Visualization & Playback Feedback

**Date**: 2026-02-06
**Turn**: 33
**Status**: Conceptual
**Focus Area**: User Experience & Features
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **real-time music visualization and playback feedback** for the F-BASIC PLAY command that shows which notes are playing across all 3 channels with animated indicators, piano roll display, and visual rhythm feedback—making the invisible audible experience visible and engaging.

## Problem Statement

### Current PLAY Command Experience Issues

1. **Invisible Audio Output**: Users can't see what's playing
   - PLAY command executes with no visual feedback
   - No indication of which channel is active
   - Can't tell if music is playing or if code is broken
   - Silent failures are indistinguishable from working code

2. **No Debugging Insight for Music**: Hard to understand music sequences
   - Can't see which note is currently playing
   - No way to visualize the melody structure
   - Difficult to sync music with sprite animations
   - Can't identify off-tempo or wrong notes without listening carefully

3. **Missing Learning Tool**: Music creation is inaccessible
   - Beginners can't see how PLAY commands map to sound
   - No visual reference for note durations or timing
   - Hard to understand polyphony (3 channels playing simultaneously)
   - Can't learn music composition by observation

4. **No Playback Status**: Can't tell if music is queued or playing
   - No play/pause indicator
   - Can't see remaining duration
   - No progress bar or time display
   - Unclear when multiple PLAY commands are queued

5. **Limited Creative Expression**: Music feels disconnected from visuals
   - Can't sync visual effects to musical beats
   - No way to create audio-reactive programs
   - Music and graphics operate in separate worlds
   - Missed opportunity for audiovisual creativity

## Proposed Solution

### 1. Piano Roll Visualization Panel

Real-time scrolling piano roll showing active notes across 3 channels:

```typescript
interface PianoRollNote {
  channel: number           // 0-2 (3 channels)
  noteName: string          // C, D, E, F, G, A, B
  octave: number            // 0-5
  startTime: number         // When note started (ms)
  duration: number          // Note duration (ms)
  frequency: number         // Hz frequency
  isActive: boolean         // Currently playing
}

interface PianoRollState {
  notes: PianoRollNote[]
  currentTime: number       // Current playback position (ms)
  totalDuration: number     // Total song length (ms)
  isPlaying: boolean
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Music Visualization                                [■] [□]   │
├─────────────────────────────────────────────────────────────┤
│ Channel 1 │ ▓▓▓▓     ▓▓▓   ░░░░   ▓▓▓▓▓▓▓▓                   │
│ Channel 2 │       ▓▓▓▓         ░░░░░░   ▓▓▓                   │
│ Channel 3 │ ▓▓▓         ▓▓▓▓▓▓         ░░░░░░                 │
├─────────────────────────────────────────────────────────────┤
│ Octave 5 │ C│ D│ E│ F│ G│ A│ B│                              │
│ Octave 4 │ C│ D│ E│ F│ G│ A│ B│                              │
│ Octave 3 │ C│ D│ E│ F│ G│ A│ B│                              │
└─────────────────────────────────────────────────────────────┘

Legend: ▓▓ Active Note  ░░ Rest/Silent  │ Current Playhead
```

### 2. Channel Status Indicators

Individual status blocks for each of 3 channels:

```vue
<template>
  <div class="channel-indicators">
    <div
      v-for="channel in 3"
      :key="channel"
      :class="[
        'channel-block',
        { active: isChannelActive(channel) }
      ]"
    >
      <span class="channel-label">CH {{ channel + 1 }}</span>
      <span v-if="isChannelActive(channel)" class="note-info">
        {{ getCurrentNote(channel) }}
      </span>
      <div v-if="isChannelActive(channel)" class="note-bar">
        <div
          :style="{
            height: getNoteHeight(channel),
            background: getChannelColor(channel)
          }"
        />
      </div>
    </div>
  </div>
</template>
```

**Visual Design:**
```
┌─────────┬─────────┬─────────┐
│ CH 1    │ CH 2    │ CH 3    │
│ C4      │ -       │ G4      │
│ ▆▆▆▆▆▆  │         │ ▆▆▆▆    │
│ [GREEN] │ [GRAY]  │ [BLUE]  │
└─────────┴─────────┴─────────┘
```

### 3. Real-Time Note Display

Large, prominent display of currently playing notes:

```typescript
interface NoteDisplay {
  noteName: string           // "C4", "G#5", etc.
  frequency: number          // Hz
  duration: number           // ms remaining
  channel: number            // 0-2
}

// Large centered display during playback
<div class="now-playing">
  <div v-for="note in activeNotes" :key="note.channel" class="note-bubble">
    <span class="note-name">{{ note.noteName }}</span>
    <span class="note-freq">{{ note.frequency }}Hz</span>
  </div>
</div>
```

**Example Display:**
```
     ╭─────────╮  ╭─────────╮
     │   C4    │  │   G4    │
     │ 262 Hz  │  │ 392 Hz  │
     ╰─────────╯  ╰─────────╯
        CH 1          CH 3
```

### 4. Playback Progress & Controls

Playback status and simple controls:

```typescript
interface PlaybackState {
  isPlaying: boolean
  currentTime: number        // Current position (ms)
  totalDuration: number      // Total length (ms)
  queueLength: number        // Pending PLAY commands
  currentTempo: number       // T1-T8
}

// Progress bar component
<ProgressBar
  :current="currentTime"
  :total="totalDuration"
  :color="progressColor"
/>

// Playback time display
<div class="time-display">
  {{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}
</div>

// Queue indicator
<div v-if="queueLength > 0" class="queue-badge">
  {{ queueLength }} queued
</div>
```

### 5. Beat & Rhythm Visualization

Visual feedback synchronized to note timing:

```vue
<template>
  <div class="rhythm-indicator">
    <!-- Beat pulse effect -->
    <div
      v-for="i in 4"
      :key="i"
      :class="['beat-marker', { active: currentBeat === i }]"
    />
  </div>
</template>
```

**Beat Animation:**
```
Quarter note beat:
  ● ○ ○ ○  →  ○ ● ○ ○  →  ○ ○ ● ○  →  ○ ○ ○ ●

Visual pulse on screen during active notes:
  ┌─────────────────────┐
  │   ▆▆▆▆▆▆▆▆▆▆▆       │  ← Expands on note start
  │       NOTE          │
  └─────────────────────┘
```

### 6. Sheet Music / Notation View

Traditional music notation display (optional, can be phase 2):

```typescript
interface NotationDisplay {
  measures: NotationMeasure[]
  timeSignature: string    // "4/4", "3/4", etc.
  keySignature: string     // "C Major", "G Minor", etc.
}

// Convert PLAY string to musical notation
function convertToNotation(playString: string): NotationDisplay {
  // Parse music DSL
  const parsed = parseMusic(playString, stateManager)

  // Convert to notation format
  return {
    measures: groupIntoMeasures(parsed),
    timeSignature: detectTimeSignature(parsed),
    keySignature: detectKey(parsed)
  }
}
```

## Implementation Priority

### Phase 1 (Channel Indicators & Note Display - Week 1)

**Goal**: Show which notes are currently playing

1. **Extend useWebAudioPlayer with State Tracking**
   - Emit events when notes start/stop
   - Track active notes per channel
   - Expose playback state
   - Calculate remaining duration

2. **Create Music Visualization Components**
   - `MusicVisualizer.vue` - Main container
   - `ChannelIndicator.vue` - Per-channel status block
   - `NoteDisplay.vue` - Current note names
   - `PlaybackControls.vue` - Play/pause/stop

3. **Integrate with IDE Layout**
   - Add music panel to IDE sidebar
   - Show when PLAY command executes
   - Auto-hide after playback completes
   - Persist across program runs

**Files to Create:**
- `src/features/music-visualization/` - New feature directory
- `src/features/music-visualization/components/MusicVisualizer.vue` - Main panel
- `src/features/music-visualization/components/ChannelIndicator.vue` - Channel status
- `src/features/music-visualization/components/NoteDisplay.vue` - Note info
- `src/features/music-visualization/components/PlaybackControls.vue` - Controls
- `src/features/music-visualization/composables/useMusicVisualization.ts` - Visualization logic
- `src/features/music-visualization/types.ts` - TypeScript types

**Files to Modify:**
- `src/features/ide/composables/useWebAudioPlayer.ts` - Add state tracking and events
- `src/features/ide/composables/useBasicIdeMessageHandlers.ts` - Handle PLAY messages
- `src/features/ide/IdePage.vue` - Add music visualization panel
- `src/features/ide/composables/useBasicIdeState.ts` - Track music state

### Phase 2 (Piano Roll & Progress - Week 2)

**Goal**: Add visual timeline and progress tracking

1. **Piano Roll Component**
   - Scrolling timeline display
   - Note blocks across 3 channels
   - Playhead indicator
   - Octave row markers

2. **Progress Tracking**
   - Progress bar component
   - Time display (current/total)
   - Queue indicator
   - Tempo display

3. **Enhanced Visual Feedback**
   - Beat pulse animation
   - Color-coded channels
   - Smooth transitions
   - Responsive layout

**Files to Create:**
- `src/features/music-visualization/components/PianoRoll.vue` - Timeline view
- `src/features/music-visualization/components/ProgressBar.vue` - Progress bar
- `src/features/music-visualization/components/BeatIndicator.vue` - Rhythm display
- `src/features/music-visualization/utils/noteUtils.ts` - Note conversion utilities
- `src/features/music-visualization/utils/colorUtils.ts` - Channel colors

**Files to Modify:**
- `src/features/music-visualization/components/MusicVisualizer.vue` - Add piano roll tab
- `src/features/ide/composables/useWebAudioPlayer.ts` - Track progress

## Technical Architecture

### Enhanced Audio Player with Events

```typescript
// src/features/ide/composables/useWebAudioPlayer.ts

export interface MusicState {
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  queueLength: number
  activeNotes: ActiveNote[]
}

export interface ActiveNote {
  channel: number
  noteName: string           // "C4", "G#5", etc.
  octave: number
  frequency: number
  startTime: number
  duration: number
  remainingMs: number
  duty: number
  envelope: number
  volume: number
}

// Event emitter for note changes
type NoteEventListener = (note: ActiveNote) => void

export function useWebAudioPlayer() {
  const audioContext = ref<AudioContext | null>(null)
  const musicState = ref<MusicState>({
    isPlaying: false,
    currentTime: 0,
    totalDuration: 0,
    queueLength: 0,
    activeNotes: []
  })

  const noteStartListeners = new Set<NoteEventListener>()
  const noteEndListeners = new Set<NoteEventListener>()

  // Register event listeners
  function onNoteStart(listener: NoteEventListener) {
    noteStartListeners.add(listener)
  }

  function onNoteEnd(listener: NoteEventListener) {
    noteEndListeners.add(listener)
  }

  // Enhanced playNote with events
  function playNote(note: Note): void {
    // ... existing audio code ...

    // Emit note start event
    const activeNote: ActiveNote = {
      channel: note.channel,
      noteName: formatNoteName(note.frequency),
      octave: calculateOctave(note.frequency),
      frequency: note.frequency,
      startTime: Date.now(),
      duration: note.duration,
      remainingMs: note.duration,
      duty: note.duty,
      envelope: note.envelope,
      volume: note.volumeOrLength
    }

    noteStartListeners.forEach(listener => listener(activeNote))

    // Schedule note end event
    setTimeout(() => {
      noteEndListeners.forEach(listener => listener(activeNote))
    }, note.duration)
  }

  // Update active notes tracker
  function updateActiveNotes(): void {
    const now = Date.now()
    musicState.value.activeNotes = musicState.value.activeNotes.filter(
      note => note.startTime + note.duration > now
    )
    musicState.value.currentTime = now - playbackStartTime
  }

  // Start update loop
  setInterval(updateActiveNotes, 50) // 20 FPS

  return {
    // ... existing returns ...
    musicState,
    onNoteStart,
    onNoteEnd
  }
}
```

### Music Visualization Composable

```typescript
// src/features/music-visualization/composables/useMusicVisualization.ts

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWebAudioPlayer } from '@/features/ide/composables/useWebAudioPlayer'
import type { ActiveNote } from '@/features/ide/composables/useWebAudioPlayer'

const CHANNEL_COLORS = [
  'var(--music-channel-1-color, #22c55e)',  // Green
  'var(--music-channel-2-color, #3b82f6)',  // Blue
  'var(--music-channel-3-color, #f59e0b)'   // Orange
]

export function useMusicVisualization() {
  const audioPlayer = useWebAudioPlayer()
  const activeNotes = ref<ActiveNote[]>([])
  const isPlaying = ref(false)

  // Format note name from frequency
  function formatNoteName(frequency: number): string {
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const midiNote = Math.round(12 * Math.log2(frequency / 440) + 69)
    const octave = Math.floor(midiNote / 12) - 1
    const noteName = NOTE_NAMES[midiNote % 12]
    return `${noteName}${octave}`
  }

  // Get active notes for a channel
  function getChannelNotes(channel: number): ActiveNote[] {
    return activeNotes.value.filter(n => n.channel === channel)
  }

  // Check if channel is active
  function isChannelActive(channel: number): boolean {
    return getChannelNotes(channel).length > 0
  }

  // Get channel color
  function getChannelColor(channel: number): string {
    return CHANNEL_COLORS[channel] || CHANNEL_COLORS[0]
  }

  // Calculate note height for visualization (based on octave)
  function getNoteHeight(note: ActiveNote): string {
    // Map octave 0-5 to height 20%-100%
    return `${20 + note.octave * 15}%`
  }

  // Format time as M:SS
  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Subscribe to note events
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    // Note start handler
    const handleNoteStart = (note: ActiveNote) => {
      activeNotes.value.push(note)
      isPlaying.value = true
    }

    // Note end handler
    const handleNoteEnd = (note: ActiveNote) => {
      const index = activeNotes.value.findIndex(
        n => n.channel === note.channel && n.frequency === note.frequency
      )
      if (index !== -1) {
        activeNotes.value.splice(index, 1)
      }
      if (activeNotes.value.length === 0) {
        isPlaying.value = false
      }
    }

    audioPlayer.onNoteStart(handleNoteStart)
    audioPlayer.onNoteEnd(handleNoteEnd)

    unsubscribe = () => {
      // Cleanup would need to be implemented in audio player
    }
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    activeNotes: computed(() => activeNotes.value),
    isPlaying: computed(() => isPlaying.value),
    musicState: computed(() => audioPlayer.musicState.value),
    formatNoteName,
    getChannelNotes,
    isChannelActive,
    getChannelColor,
    getNoteHeight,
    formatTime
  }
}
```

### Music Visualizer Component

```vue
<!-- src/features/music-visualization/components/MusicVisualizer.vue -->

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMusicVisualization } from '../composables/useMusicVisualization'
import ChannelIndicator from './ChannelIndicator.vue'
import NoteDisplay from './NoteDisplay.vue'
import PlaybackControls from './PlaybackControls.vue'

defineOptions({
  name: 'MusicVisualizer'
})

const { t } = useI18n()
const viz = useMusicVisualization()

const showPanel = computed(() => viz.isPlaying.value || viz.musicState.value.queueLength > 0)
</script>

<template>
  <Transition name="music-slide">
    <div v-if="showPanel" class="music-visualizer">
      <!-- Header -->
      <div class="music-header">
        <h3>{{ t('music.visualization.title') }}</h3>
        <PlaybackControls :is-playing="viz.isPlaying.value" />
      </div>

      <!-- Channel Indicators -->
      <div class="channel-row">
        <ChannelIndicator
          v-for="channel in 3"
          :key="channel"
          :channel="channel - 1"
          :is-active="viz.isChannelActive(channel - 1)"
          :notes="viz.getChannelNotes(channel - 1)"
          :color="viz.getChannelColor(channel - 1)"
        />
      </div>

      <!-- Current Notes Display -->
      <div v-if="viz.activeNotes.length > 0" class="notes-display">
        <NoteDisplay
          v-for="note in viz.activeNotes"
          :key="`${note.channel}-${note.frequency}`"
          :note="note"
        />
      </div>

      <!-- Progress Info -->
      <div v-if="viz.musicState.queueLength > 0" class="queue-info">
        {{ t('music.visualization.queued', { count: viz.musicState.queueLength }) }}
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.music-visualizer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--game-surface-bg-start);
  border-top: 2px solid var(--music-accent-color, #8b5cf6);
  padding: 1rem;
  z-index: 100;
}

.music-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.channel-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.notes-display {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.queue-info {
  text-align: center;
  font-size: 0.85rem;
  color: var(--game-text-secondary);
  margin-top: 0.5rem;
}

.music-slide-enter-active,
.music-slide-leave-active {
  transition: transform 0.3s ease;
}

.music-slide-enter-from,
.music-slide-leave-to {
  transform: translateY(100%);
}
</style>
```

### Channel Indicator Component

```vue
<!-- src/features/music-visualization/components/ChannelIndicator.vue -->

<script setup lang="ts">
import { computed } from 'vue'
import type { ActiveNote } from '@/features/ide/composables/useWebAudioPlayer'
import { useMusicVisualization } from '../composables/useMusicVisualization'

defineProps<{
  channel: number
  isActive: boolean
  notes: ActiveNote[]
  color: string
}>()

const viz = useMusicVisualization()

const currentNote = computed(() => {
  return viz.notes.find(n => n.channel === viz.channel)
})
</script>

<template>
  <div
    :class="['channel-indicator', { active }]"
    :style="{ '--channel-color': color }"
  >
    <span class="channel-label">CH {{ channel + 1 }}</span>

    <template v-if="isActive && currentNote">
      <span class="note-name">{{ viz.formatNoteName(currentNote.frequency) }}</span>

      <!-- Animated note bar -->
      <div class="note-bar-container">
        <div
          class="note-bar"
          :style="{
            height: viz.getNoteHeight(currentNote),
            background: `var(--channel-color)`
          }"
        />
      </div>

      <!-- Frequency display -->
      <span class="note-freq">{{ Math.round(currentNote.frequency) }}Hz</span>
    </template>

    <span v-else class="silent">—</span>
  </div>
</template>

<style scoped>
.channel-indicator {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--game-surface-bg-end);
  border: 2px solid var(--game-surface-border);
  text-align: center;
  transition: all 0.2s ease;
}

.channel-indicator.active {
  border-color: var(--channel-color);
  box-shadow: 0 0 12px var(--channel-color);
}

.channel-label {
  display: block;
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--game-text-secondary);
  margin-bottom: 0.25rem;
}

.note-name {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--game-text-primary);
}

.note-bar-container {
  height: 60px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 0.5rem 0;
}

.note-bar {
  width: 100%;
  min-height: 12px;
  border-radius: 4px 4px 0 0;
  transition: height 0.1s ease;
  animation: pulse 0.2s ease;
}

@keyframes pulse {
  0% { transform: scaleY(0.8); }
  50% { transform: scaleY(1.05); }
  100% { transform: scaleY(1); }
}

.note-freq {
  display: block;
  font-size: 0.7rem;
  font-family: var(--game-font-family-mono);
  color: var(--game-text-secondary);
}

.silent {
  display: block;
  font-size: 1rem;
  color: var(--game-text-tertiary);
}
</style>
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing Vue 3 composition API
- Existing Web Audio API integration
- TypeScript standard library
- CSS animations for visual effects

**Optional Enhancements:**
- Canvas API for smoother piano roll rendering
- Web Audio Analyzer API for waveform visualization (Phase 2+)
- SVG for music notation symbols (Phase 2+)

## Success Metrics

### User Engagement
- **Visibility**: % of PLAY commands that show visualization
- **Interaction**: # of times users open/close music panel
- **Learning**: Reduction in music-related help requests
- **Creation**: Increase in programs using PLAY command

### Technical Quality
- **Latency**: Delay between note start and visual update (<50ms)
- **Performance**: No frame drops during music playback
- **Accuracy**: Visual notes match audio exactly
- **Reliability**: No memory leaks from event listeners

### Developer Experience
- **Debugging**: Time saved debugging music code
- **Understanding**: % of users who can identify polyphony
- **Confidence**: Reduction in "is my music working?" questions

## Benefits

### Immediate Benefits
1. **Visible Audio**: See what you hear
2. **Better Debugging**: Identify which notes are wrong
3. **Learning Tool**: Understand music by visualization
4. **Engagement**: More fun to create music programs

### Long-Term Benefits
1. **Audiovisual Creativity**: Enable music-visual sync programs
2. **Education**: Teach music concepts visually
3. **Community**: Share music with visual references
4. **Platform**: Foundation for advanced music features

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Visual clutter during complex music | Collapsible panel; minimal mode option |
| Performance overhead from animations | CSS transforms only; no layout thrashing |
| Wrong note display if parsing errors | Validate against Web Audio actual output |
| Distraction from main IDE work | Auto-hide after playback; compact design |
| Not useful for non-musical users | Disable by default; opt-in feature |

## Open Questions

1. **Panel Position**: Bottom overlay vs sidebar panel vs modal?
2. **Animation Style**: Smooth vs snappy vs minimal?
3. **Color Scheme**: Per-channel colors vs rainbow vs monochrome?
4. **Persistence**: Remember panel state across runs?
5. **Mobile**: How to adapt visualization for small screens?

## Next Steps

1. **Prototype**: Build single-channel note indicator
2. **Test**: Verify event emission from Web Audio Player
3. **Design**: Finalize visual layout and animations
4. **Implement**: Phase 1 components (channel indicators)
5. **User Test**: Get feedback on visualization usefulness
6. **Expand**: Add Phase 2 features (piano roll, progress)

## Implementation Details

### Specific Code Changes

**1. Extend Note Type with Metadata:**

```typescript
// src/core/sound/types.ts

export interface Note {
  frequency: number
  duration: number
  channel: number
  duty: number
  envelope: number
  volumeOrLength: number

  // New: Visualization metadata
  noteName?: string        // "C4", "G#5", etc.
  octave?: number          // 0-5
  semitone?: number        // 0-11
}

// Helper to add metadata
export function enrichNote(note: Note): Note {
  const semitone = Math.round(12 * Math.log2(note.frequency / 440) + 57)
  const octave = Math.floor(semitone / 12)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const noteName = noteNames[semitone % 12]

  return {
    ...note,
    noteName,
    octave,
    semitone
  }
}
```

**2. Add Music State to IDE State:**

```typescript
// src/features/ide/composables/useBasicIdeState.ts

export interface BasicIdeState {
  // ... existing state ...

  // Music visualization state
  musicVisualization: {
    enabled: boolean
    panelOpen: boolean
    showPianoRoll: boolean
    showNotes: boolean
  }
}

// Initialize with defaults
const defaultState: BasicIdeState = {
  // ... existing defaults ...
  musicVisualization: {
    enabled: true,
    panelOpen: false,
    showPianoRoll: false,
    showNotes: true
  }
}
```

**3. Internationalization Keys:**

```typescript
// src/shared/i18n/en.ts

export default {
  music: {
    visualization: {
      title: 'Music Playback',
      queued: '{count} queued',
      channel: 'Channel',
      note: 'Note',
      frequency: 'Hz',
      duration: 'Duration',
      progress: 'Progress',
      togglePianoRoll: 'Piano Roll',
      toggleNotes: 'Note Display'
    }
  }
}
```

**4. CSS Variables for Theming:**

```css
/* src/shared/styles/theme.css */

:root {
  /* Music visualization colors */
  --music-accent-color: #8b5cf6;
  --music-channel-1-color: #22c55e;
  --music-channel-2-color: #3b82f6;
  --music-channel-3-color: #f59e0b;
  --music-note-active: #fbbf24;
  --music-note-silent: #374151;
  --music-progress-bg: #1f2937;
  --music-progress-fill: #8b5cf6;
}
```

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] Channel indicators show for all 3 channels
- [ ] Active notes display note name and frequency
- [ ] Visual feedback appears within 50ms of note start
- [ ] Panel auto-shows on PLAY command
- [ ] Panel auto-hides after playback completes
- [ ] No performance degradation during music playback
- [ ] Works with polyphonic music (3 channels simultaneously)

**Phase 2 (Week 2):**
- [ ] Piano roll displays note timeline
- [ ] Progress bar shows current position
- [ ] Time display shows current/total duration
- [ ] Queue indicator shows pending PLAY commands
- [ ] Beat indicator visualizes rhythm
- [ ] Smooth animations (60fps)
- [ ] Responsive layout for different screen sizes

**Test Coverage:**
- [ ] Unit test for note name formatting
- [ ] Unit test for octave calculation
- [ ] Integration test for note events
- [ ] Visual regression test for panel layout
- [ ] Performance test for animation frame rate

---

*"Make the invisible visible—turn the PLAY command's audio output into an engaging visual experience that helps users learn, debug, and create music with confidence."*
