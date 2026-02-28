<script setup lang="ts">
/**
 * Sound Test Page for PLAY Command Verification
 *
 * Human testers can listen to PLAY command outputs and record results.
 * The results can be copied and shared with AI for analysis.
 */

import { computed, onBeforeUnmount, ref } from 'vue'

import { parseMusic } from '@/core/sound/MusicDSLParser'
import { SoundStateManager } from '@/core/sound/SoundStateManager'
import type { Note, Rest } from '@/core/sound/types'
import { useWebAudioPlayer } from '@/features/ide/composables/useWebAudioPlayer'
import { GameBlock, GameButton, GameLayout } from '@/shared/components/ui'

import { getTestCasesByCategory } from './soundTestCases'
import { useSoundTestResults } from './useSoundTestResults'

defineOptions({
  name: 'SoundTestPage',
})

// Audio player
const { initialize, playMusic, stopAll, cleanup } = useWebAudioPlayer()

// Test results management
const {
  stats,
  copySuccess,
  setResult,
  setNotes,
  getResult,
  markAllPass,
  resetAll,
  copyResults,
} = useSoundTestResults()

// Playback state
const currentlyPlaying = ref<string | null>(null)

// ============================================
// TEMPO CALIBRATION
// ============================================
const calibrationPlayString = ref('M1V7Y2T3O2A6G3F5GA5AA7')
const speedFactor = ref(1.0)
const isCalibrationPlaying = ref(false)
let calibrationLoopTimeout: ReturnType<typeof setTimeout> | null = null

// Current tempo mapping for reference (T1=fastest, T8=slowest per F-BASIC manual)
const TEMPO_MS_PER_WHOLE_NOTE: Record<number, number> = {
  1: 1100,
  2: 1375,
  3: 1650,
  4: 2200, // Default
  5: 2750,
  6: 3300,
  7: 3850,
  8: 4400,
}

// Scale durations by a factor
function scaleDurations(
  channels: Array<Array<Note | Rest>>,
  factor: number
): Array<Array<Note | Rest>> {
  return channels.map((channel) =>
    channel.map((event) => ({
      ...event,
      duration: event.duration * factor,
    }))
  )
}

// Play calibration test with speed factor (loops infinitely)
function playCalibrationTest() {
  stopCalibrationLoop()

  initialize()
  stopAll()

  const stateManager = new SoundStateManager()
  const musicCommand = parseMusic(calibrationPlayString.value, stateManager)

  // Scale durations by speed factor
  const scaledChannels = scaleDurations(musicCommand.channels, speedFactor.value)

  playMusic(scaledChannels)
  isCalibrationPlaying.value = true
  currentlyPlaying.value = 'calibration'

  const totalDuration = Math.max(
    ...scaledChannels.map((ch) => ch.reduce((sum, e) => sum + e.duration, 0))
  )

  // Schedule next loop iteration
  calibrationLoopTimeout = setTimeout(() => {
    if (isCalibrationPlaying.value) {
      playCalibrationTest()
    }
  }, totalDuration + 200) // Small gap between loops
}

// Stop the calibration loop
function stopCalibrationLoop() {
  if (calibrationLoopTimeout) {
    clearTimeout(calibrationLoopTimeout)
    calibrationLoopTimeout = null
  }
}

// Group test cases by category
const testCasesByCategory = computed(() => getTestCasesByCategory())

// Play a test case
function playTestCase(musicString: string, testId: string) {
  initialize()
  stopAll()

  const stateManager = new SoundStateManager()
  const musicCommand = parseMusic(musicString, stateManager)

  playMusic(musicCommand.channels)
  currentlyPlaying.value = testId

  const totalDuration = Math.max(
    ...musicCommand.channels.map((ch) =>
      ch.reduce((sum, e) => sum + e.duration, 0)
    )
  )
  setTimeout(() => {
    if (currentlyPlaying.value === testId) {
      currentlyPlaying.value = null
    }
  }, totalDuration + 100)
}

// Stop playback
function stopPlayback() {
  stopCalibrationLoop()
  stopAll()
  currentlyPlaying.value = null
  isCalibrationPlaying.value = false
}

// Cleanup
onBeforeUnmount(() => {
  stopCalibrationLoop()
  cleanup()
})
</script>

<template>
  <GameLayout>
    <div class="sound-test-container">
      <GameBlock title="PLAY Command Sound Test" title-icon="mdi:music" class="header-panel">
        <div class="header-content">
          <p class="description">
            Test F-BASIC PLAY command features by listening and recording results.
            After testing, copy results to share with AI for analysis.
          </p>
          <div class="stats-grid">
            <div class="stat-item pass">
              <span class="stat-value">{{ stats.pass }}</span>
              <span class="stat-label">Passed</span>
            </div>
            <div class="stat-item fail">
              <span class="stat-value">{{ stats.fail }}</span>
              <span class="stat-label">Failed</span>
            </div>
            <div class="stat-item untested">
              <span class="stat-value">{{ stats.untested }}</span>
              <span class="stat-label">Untested</span>
            </div>
          </div>
          <div class="header-actions">
            <GameButton type="primary" @click="copyResults">
              {{ copySuccess ? 'Copied!' : 'Copy Results' }}
            </GameButton>
            <GameButton type="default" @click="markAllPass">Mark All Pass</GameButton>
            <GameButton type="default" @click="resetAll">Reset All</GameButton>
            <GameButton v-if="currentlyPlaying" type="danger" @click="stopPlayback">
              Stop Sound
            </GameButton>
          </div>
        </div>
      </GameBlock>

      <!-- Tempo Calibration Section -->
      <GameBlock title="Tempo Calibration" title-icon="mdi:speedometer" class="calibration-panel">
        <div class="calibration-content">
          <p class="calibration-description">
            Compare IDE playback speed against real F-BASIC hardware.
            Adjust the speed factor until the tempo matches your reference.
          </p>

          <div class="calibration-controls">
            <div class="control-group">
              <label class="control-label">PLAY String:</label>
              <input
                v-model="calibrationPlayString"
                type="text"
                class="play-string-input"
                placeholder="Enter PLAY string..."
              />
            </div>

            <div class="control-group">
              <label class="control-label">Speed Factor: {{ speedFactor.toFixed(2) }}x</label>
              <div class="slider-container">
                <span class="slider-label">0.25x</span>
                <input
                  v-model.number="speedFactor"
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.05"
                  class="speed-slider"
                />
                <span class="slider-label">4x</span>
              </div>
              <p class="slider-hint">
                &lt; 1.0 = slower | 1.0 = current | &gt; 1.0 = faster
              </p>
            </div>

            <div class="calibration-actions">
              <GameButton
                :type="isCalibrationPlaying ? 'danger' : 'primary'"
                @click="isCalibrationPlaying ? stopPlayback() : playCalibrationTest()"
              >
                {{ isCalibrationPlaying ? 'Stop' : 'Play' }}
              </GameButton>
            </div>
          </div>

          <div class="tempo-reference">
            <h4 class="reference-title">Current Tempo Mapping (ms per whole note):</h4>
            <div class="tempo-grid">
              <div v-for="(ms, tempo) in TEMPO_MS_PER_WHOLE_NOTE" :key="tempo" class="tempo-item">
                <span class="tempo-key">T{{ tempo }}</span>
                <span class="tempo-value">{{ ms }}ms</span>
                <span class="tempo-scaled">{{ (ms * speedFactor).toFixed(0) }}ms*</span>
              </div>
            </div>
            <p class="reference-note">
              * Scaled values with current speed factor.
              T1 = fastest, T8 = slowest (per F-BASIC manual).
              If IDE plays too fast, use factor &gt; 1.0 to slow down.
            </p>
          </div>
        </div>
      </GameBlock>

      <div class="test-cases-container">
        <div v-for="[category, cases] in testCasesByCategory" :key="category" class="category-section">
          <h2 class="category-title">{{ category }}</h2>
          <div class="test-cases-grid">
            <div
              v-for="tc in cases"
              :key="tc.id"
              class="test-case-card"
              :class="{
                playing: currentlyPlaying === tc.id,
                pass: getResult(tc.id)?.result === 'pass',
                fail: getResult(tc.id)?.result === 'fail',
              }"
            >
              <div class="test-header">
                <span class="test-name">{{ tc.name }}</span>
                <button
                  class="play-button"
                  :class="{ playing: currentlyPlaying === tc.id }"
                  @click="playTestCase(tc.musicString, tc.id)"
                  :title="tc.description"
                >
                  {{ currentlyPlaying === tc.id ? 'Playing...' : 'Play' }}
                </button>
              </div>
              <div class="test-info">
                <code class="music-string">{{ tc.musicString }}</code>
                <p class="expected">{{ tc.expectedBehavior }}</p>
              </div>
              <div class="test-result">
                <div class="result-buttons">
                  <button
                    class="result-btn pass"
                    :class="{ active: getResult(tc.id)?.result === 'pass' }"
                    @click="setResult(tc.id, 'pass')"
                  >
                    Pass
                  </button>
                  <button
                    class="result-btn fail"
                    :class="{ active: getResult(tc.id)?.result === 'fail' }"
                    @click="setResult(tc.id, 'fail')"
                  >
                    Fail
                  </button>
                  <button
                    class="result-btn skip"
                    :class="{ active: getResult(tc.id)?.result === 'untested' }"
                    @click="setResult(tc.id, 'untested')"
                  >
                    Skip
                  </button>
                </div>
                <input
                  type="text"
                  class="notes-input"
                  placeholder="Notes (optional)..."
                  :value="getResult(tc.id)?.notes ?? ''"
                  @input="setNotes(tc.id, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.sound-test-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.header-panel {
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.description {
  margin: 0;
  color: var(--game-text-secondary);
  font-size: var(--game-font-size-base);
}

.stats-grid {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background: var(--base-solid-gray-20);
  border-radius: var(--game-radius-lg);
  min-width: 80px;
}

.stat-item.pass { border-left: 3px solid var(--semantic-solid-success); }
.stat-item.fail { border-left: 3px solid var(--semantic-solid-danger); }
.stat-item.untested { border-left: 3px solid var(--semantic-solid-neutral); }

.stat-value {
  font-size: var(--game-font-size-lg);
  font-weight: var(--game-font-weight-bold);
  font-family: var(--game-font-family-mono);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--game-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.test-cases-container {
  flex: 1 1 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-title {
  margin: 0;
  font-size: var(--game-font-size-lg);
  font-weight: var(--game-font-weight-semibold);
  color: var(--base-solid-primary);
  border-bottom: 1px solid var(--game-surface-border);
  padding-bottom: 0.5rem;
}

.test-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.test-case-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--game-surface-bg-gradient);
  border: 1px solid var(--game-surface-border);
  border-radius: var(--game-radius-lg);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.test-case-card:hover {
  border-color: var(--game-surface-border-hover);
}

.test-case-card.playing {
  border-color: var(--base-solid-primary);
  box-shadow: var(--game-shadow-glow-sm);
}

.test-case-card.pass {
  border-left: 3px solid var(--semantic-solid-success);
}

.test-case-card.fail {
  border-left: 3px solid var(--semantic-solid-danger);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.test-name {
  font-weight: var(--game-font-weight-semibold);
  color: var(--game-text-primary);
}

.play-button {
  padding: 0.25rem 0.75rem;
  font-size: var(--game-font-size-sm);
  font-weight: var(--game-font-weight-medium);
  background: var(--base-solid-primary-20);
  color: var(--base-solid-primary);
  border: 1px solid var(--base-solid-primary-30);
  border-radius: var(--game-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.play-button:hover {
  background: var(--base-solid-primary-30);
}

.play-button.playing {
  background: var(--base-solid-primary);
  color: var(--base-solid-gray-00);
}

.test-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.music-string {
  font-family: var(--game-font-family-mono);
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background: var(--base-solid-gray-20);
  border-radius: var(--game-radius-sm);
  color: var(--base-solid-primary);
}

.expected {
  margin: 0;
  font-size: var(--game-font-size-sm);
  color: var(--game-text-secondary);
}

.test-result {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-buttons {
  display: flex;
  gap: 0.25rem;
}

.result-btn {
  flex: 1;
  padding: 0.25rem 0.5rem;
  font-size: var(--game-font-size-sm);
  font-weight: var(--game-font-weight-medium);
  background: var(--base-solid-gray-20);
  color: var(--game-text-secondary);
  border: 1px solid transparent;
  border-radius: var(--game-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.result-btn:hover { background: var(--base-solid-gray-30); }

.result-btn.pass.active {
  background: var(--semantic-alpha-success-30);
  color: var(--semantic-solid-success);
  border-color: var(--semantic-solid-success);
}

.result-btn.fail.active {
  background: var(--semantic-alpha-danger-30);
  color: var(--semantic-solid-danger);
  border-color: var(--semantic-solid-danger);
}

.result-btn.skip.active {
  background: var(--semantic-alpha-neutral-30);
  color: var(--semantic-solid-neutral);
  border-color: var(--semantic-solid-neutral);
}

.notes-input {
  padding: 0.4rem 0.5rem;
  font-size: var(--game-font-size-sm);
  background: var(--base-solid-gray-20);
  border: 1px solid var(--game-surface-border);
  border-radius: var(--game-radius-sm);
  color: var(--game-text-primary);
  transition: border-color 0.2s;
}

.notes-input:focus {
  outline: none;
  border-color: var(--base-solid-primary);
}

.notes-input::placeholder {
  color: var(--game-text-tertiary);
}

/* Tempo Calibration Styles */
.calibration-panel {
  flex-shrink: 0;
}

.calibration-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calibration-description {
  margin: 0;
  color: var(--game-text-secondary);
  font-size: var(--game-font-size-base);
}

.calibration-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-weight: var(--game-font-weight-semibold);
  color: var(--game-text-primary);
  font-size: var(--game-font-size-sm);
}

.play-string-input {
  padding: 0.5rem 0.75rem;
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-base);
  background: var(--base-solid-gray-20);
  border: 1px solid var(--game-surface-border);
  border-radius: var(--game-radius-sm);
  color: var(--game-text-primary);
  transition: border-color 0.2s;
}

.play-string-input:focus {
  outline: none;
  border-color: var(--base-solid-primary);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.speed-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--base-solid-gray-30);
  appearance: none;
  cursor: pointer;
}

.speed-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--base-solid-primary);
  cursor: pointer;
  transition: transform 0.2s;
}

.speed-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-label {
  font-size: var(--game-font-size-sm);
  color: var(--game-text-tertiary);
  min-width: 2.5rem;
}

.slider-hint {
  margin: 0;
  font-size: var(--game-font-size-sm);
  color: var(--game-text-tertiary);
}

.calibration-actions {
  display: flex;
  gap: 0.5rem;
}

.tempo-reference {
  padding: 1rem;
  background: var(--base-solid-gray-20);
  border-radius: var(--game-radius-md);
}

.reference-title {
  margin: 0 0 0.75rem 0;
  font-size: var(--game-font-size-sm);
  font-weight: var(--game-font-weight-semibold);
  color: var(--game-text-primary);
}

.tempo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.tempo-item {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  background: var(--base-solid-gray-30);
  border-radius: var(--game-radius-sm);
  text-align: center;
}

.tempo-key {
  font-weight: var(--game-font-weight-bold);
  color: var(--base-solid-primary);
  font-size: var(--game-font-size-sm);
}

.tempo-value {
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-sm);
  color: var(--game-text-secondary);
}

.tempo-scaled {
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-sm);
  color: var(--semantic-solid-warning);
}

.reference-note {
  margin: 0.75rem 0 0 0;
  font-size: var(--game-font-size-sm);
  color: var(--game-text-tertiary);
}

.reference-note.warning {
  color: var(--semantic-solid-warning);
  padding: 0.5rem;
  background: var(--semantic-alpha-warning-20);
  border-radius: var(--game-radius-sm);
  border-left: 3px solid var(--semantic-solid-warning);
}
</style>
