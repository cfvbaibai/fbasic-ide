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
  stopAll()
  currentlyPlaying.value = null
}

// Cleanup
onBeforeUnmount(() => {
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
</style>
