<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'
import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'
import { GameBlock, GameIcon, GameTabPane,GameTabs } from '@/shared/components/ui'
import { COLORS } from '@/shared/data/palette'
import { MoveCharacterCode } from '@/shared/data/types'

import ActivePaletteDisplay from './ActivePaletteDisplay.vue'

defineOptions({
  name: 'StateInspector',
})

const props = withDefaults(
  defineProps<{
    screenBuffer?: ScreenCell[][]
    cursorX?: number
    cursorY?: number
    bgPalette?: number
    spritePalette?: number
    backdropColor?: number
    cgenMode?: number
    spriteStates?: SpriteState[]
    spriteEnabled?: boolean
    /** @deprecated Use sharedAnimationView instead - local state will be removed */
    movementStates?: MovementState[]
    /** @deprecated All data now read from sharedDisplayBufferAccessor */
    movementPositionsFromBuffer?: Map<number, { x: number; y: number }>
    /** Shared display buffer accessor for reading sprite state */
    sharedDisplayBufferAccessor?: SharedDisplayBufferAccessor
  }>(),
  {
    screenBuffer: () => [],
    cursorX: 0,
    cursorY: 0,
    bgPalette: 1,
    spritePalette: 1,
    backdropColor: 0,
    cgenMode: 2,
    spriteStates: () => [],
    spriteEnabled: false,
    movementStates: () => [],
    movementPositionsFromBuffer: () => new Map(),
  }
)

const { t } = useI18n()
const activeTab = ref('palettes')

function hexFor(index: number): string {
  const i = Math.max(0, Math.min(index, COLORS.length - 1))
  return COLORS[i] ?? '#000000'
}

const MOVE_SLOT_COUNT = 8

/** Always 8 slots (action 0–7); each slot has movement data from shared buffer. */
const moveSlots = computed(() => {
  const accessor = props.sharedDisplayBufferAccessor
  const states = props.movementStates ?? []
  const byAction = new Map(states.map(m => [m.actionNumber, m]))
  return Array.from({ length: MOVE_SLOT_COUNT }, (_, actionNumber) => {
    // Read all animation state from shared buffer via accessor
    const pos = accessor?.readSpritePosition(actionNumber)
    const x = pos?.x ?? 0
    const y = pos?.y ?? 0
    const isActive = accessor?.readSpriteIsActive(actionNumber) ?? false
    const remainingDistance = accessor?.readSpriteRemainingDistance(actionNumber) ?? 0
    const totalDistance = accessor?.readSpriteTotalDistance(actionNumber) ?? 0
    const direction = accessor?.readSpriteDirection(actionNumber) ?? 0
    const speed = accessor?.readSpriteSpeed(actionNumber) ?? 0
    const priority = accessor?.readSpritePriority(actionNumber) ?? 0
    const characterType = accessor?.readSpriteCharacterType(actionNumber) ?? 0
    const colorCombination = accessor?.readSpriteColorCombination(actionNumber) ?? 0

    // Fall back to local state for definition if not in buffer yet
    const m = byAction.get(actionNumber)
    const hasData = isActive || (accessor && (x !== 0 || y !== 0))

    return {
      actionNumber,
      m: m ?? undefined,
      hasData,
      x: Math.round(x),
      y: Math.round(y),
      isActive,
      remainingDistance,
      totalDistance,
      direction,
      speed,
      priority,
      characterType,
      colorCombination,
    }
  })
})

/** Direction 0–8 as MDI arrow icon names (0=none, 1=up … 8=up-left). */
const DIRECTION_ICONS: Record<number, string> = {
  0: 'mdi:circle-outline',   // none
  1: 'mdi:arrow-up',         // up
  2: 'mdi:arrow-top-right',  // up-right
  3: 'mdi:arrow-right',     // right
  4: 'mdi:arrow-bottom-right', // down-right
  5: 'mdi:arrow-down',       // down
  6: 'mdi:arrow-bottom-left',  // down-left
  7: 'mdi:arrow-left',       // left
  8: 'mdi:arrow-top-left',   // up-left
}

const DIRECTION_NAMES: Record<number, string> = {
  0: 'none', 1: 'up', 2: 'up-right', 3: 'right', 4: 'down-right',
  5: 'down', 6: 'down-left', 7: 'left', 8: 'up-left',
}

function directionIcon(dir: number): string {
  return DIRECTION_ICONS[dir] ?? 'mdi:circle-outline'
}

function directionTitle(dir: number): string {
  return DIRECTION_NAMES[dir] ?? `dir ${dir}`
}

function characterTypeLabel(code: number): string {
  const name = MoveCharacterCode[code as MoveCharacterCode]
  return name ?? String(code)
}
</script>

<template>
  <GameBlock :title="t('ide.stateInspector.title')" title-icon="mdi:eye" :hide-header="true" class="state-inspector">
    <div class="inspector-content">
      <GameTabs v-model="activeTab" type="border-card" class="inspector-tabs">
        <GameTabPane name="palettes" :label="t('ide.stateInspector.tabPalettes')">
          <div class="tab-pane horizontal palettes-tab">
            <div class="palettes-row">
              <ActivePaletteDisplay :bg-palette="bgPalette" :sprite-palette="spritePalette" />
              <div class="extras">
                <span class="label">{{ t('ide.stateInspector.backdrop') }}:</span>
                <span
                  class="dot"
                  :style="{ backgroundColor: hexFor(backdropColor ?? 0) }"
                  :title="`${backdropColor ?? 0}`"
                />
                {{ backdropColor ?? 0 }}
                <span class="label">{{ t('ide.stateInspector.cgen') }}:</span>
                {{ cgenMode ?? 2 }}
              </div>
            </div>
          </div>
        </GameTabPane>

        <GameTabPane name="sprite" :label="t('ide.stateInspector.tabSprite')">
          <div class="tab-pane horizontal sprite-tab">
            <div class="meta-line">{{ t('ide.stateInspector.spriteEnabled') }}: {{ spriteEnabled ? 'ON' : 'OFF' }}</div>
            <div v-if="(spriteStates ?? []).length === 0" class="empty">{{ t('ide.stateInspector.empty') }}</div>
            <div v-else class="grid-cards">
              <div
                v-for="s in (spriteStates ?? [])"
                :key="s.spriteNumber"
                class="card"
              >
                #{{ s.spriteNumber }} ({{ s.x }},{{ s.y }}) {{ s.visible ? 'on' : 'off' }} p={{ s.priority }}
              </div>
            </div>
          </div>
        </GameTabPane>

        <GameTabPane name="move" :label="t('ide.stateInspector.tabMove')">
          <div class="tab-pane horizontal move-tab">
            <div class="grid-cards move-cards">
              <div
                v-for="slot in moveSlots"
                :key="slot.actionNumber"
                class="card move-card"
              >
                <div class="move-card-header">
                  <span class="move-card-id" title="Action number">
                    <span>{{ slot.actionNumber }}</span>
                  </span>
                  <template v-if="slot.hasData || slot.m">
                    <span class="move-card-char" :title="characterTypeLabel(slot.characterType || slot.m?.definition.characterType || 0)">
                      {{ characterTypeLabel(slot.characterType || slot.m?.definition.characterType || 0).slice(0, 5) }}
                    </span>
                    <span class="move-card-status" :title="slot.isActive ? 'Active' : 'Paused'">
                      <GameIcon
                        :icon="slot.isActive ? 'mdi:play' : 'mdi:pause'"
                        size="small"
                        class="move-card-icon"
                      />
                    </span>
                    <span
                      class="move-card-dir"
                      :title="directionTitle(slot.direction || slot.m?.definition.direction || 0)"
                      aria-label="direction {{ directionTitle(slot.direction || slot.m?.definition.direction || 0) }}"
                    >
                      <GameIcon
                        :icon="directionIcon(slot.direction || slot.m?.definition.direction || 0)"
                        size="small"
                        class="move-card-icon"
                      />
                    </span>
                  </template>
                </div>
                <div class="move-card-body">
                  <div class="move-card-cell">
                    <GameIcon v-if="slot.hasData || slot.m" icon="mdi:crosshairs-gps" size="small" class="move-card-icon" />
                    <span class="move-card-value">{{ (slot.hasData || slot.m) ? `${slot.x},${slot.y}` : '' }}</span>
                  </div>
                  <div class="move-card-cell move-card-cell-left">
                    <GameIcon v-if="slot.hasData || slot.m" icon="mdi:ruler" size="small" class="move-card-icon" />
                    <span class="move-card-value">{{ (slot.hasData || slot.m) ? Math.round(slot.remainingDistance) : '' }}</span>
                  </div>
                  <div class="move-card-cell move-card-cell-right">
                    <GameIcon v-if="slot.hasData || slot.m" icon="mdi:speedometer" size="small" class="move-card-icon" />
                    <span class="move-card-value">{{ (slot.hasData || slot.m) ? slot.speed : '' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GameTabPane>
      </GameTabs>
    </div>
  </GameBlock>
</template>

<style scoped>
.state-inspector {
  height: 100%;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Let GameBlock content area fill remaining space below header */
.state-inspector :deep(.game-block-content) {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.inspector-content {
  flex: 1 1 0;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Match RuntimeOutput .output-tabs style */
.inspector-tabs {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.tab-pane.horizontal {
  padding: 0;
  min-height: 0;
}

/* Cards in a row, wrapping to use horizontal space */
.grid-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
}

.card {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  background: var(--game-surface-bg-start);
  border: 1px solid var(--game-surface-border);
  border-radius: 4px;
  white-space: nowrap;
}

.extras {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 1px;
  border: 1px solid var(--game-surface-border);
  vertical-align: middle;
}

.line,
.empty {
  margin-bottom: 0.2rem;
}

.empty {
  color: var(--game-text-tertiary);
  font-style: italic;
}

/* SPRITE tab: larger text for readability */
.sprite-tab .meta-line,
.sprite-tab .empty,
.sprite-tab .card {
  font-size: 1rem;
}

.sprite-tab .card {
  padding: 0.35rem 0.6rem;
}

/* MOVE tab: structured cards with icons */
.move-tab .card,
.move-tab .empty {
  font-size: 1rem;
}

.move-tab .empty {
  padding: 0.5rem;
}

.move-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 11rem));
  gap: 0.5rem;
  width: 100%;
}

.move-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem 0.5rem;
  font-variant-numeric: tabular-nums;
}

.move-card-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-bottom: 1px solid var(--game-surface-border);
}

.move-card-id {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-weight: 700;
}

.move-card-char {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--game-text-secondary);
  padding: 0.1rem 0.25rem;
  background: var(--game-surface-bg-start);
  border-radius: 3px;
}

.move-card-dir {
  font-size: 1.1em;
  font-weight: 700;
  min-width: 1em;
  text-align: center;
  display: flex;
  align-items: center;
}

.move-card-header .move-card-status {
  flex: 1;
  display: flex;
  justify-content: center;
  font-weight: 600;
}

.move-card-body {
  display: grid;
  grid-template-columns: 3fr 2fr 2fr;
  gap: 0.25rem 0.5rem;
}

.move-card-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.2rem;
}

.move-card-cell-center {
  justify-content: center;
}

.move-card-cell-right {
  justify-content: flex-end;
}

.move-card-icon {
  flex-shrink: 0;
  color: var(--game-text-secondary);
}

.move-card-value {
  font-size: 0.85rem;
  min-width: 0;
}

/* Palettes tab: larger labels, swatches, and extras for readability */
.palettes-tab :deep(.active-palette-display) {
  gap: 1.25rem;
}

.palettes-tab :deep(.palette-section) {
  gap: 0.5rem;
}

.palettes-tab :deep(.palette-label) {
  font-size: 1rem;
  font-weight: 600;
}

.palettes-tab :deep(.palette-combos) {
  gap: 0.5rem;
}

.palettes-tab :deep(.combo-strip) {
  gap: 2px;
}

.palettes-tab :deep(.color-swatch) {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.palettes-tab .extras {
  font-size: 1rem;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.palettes-tab .dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.tab-pane.compact {
  padding: 0.35rem 0.5rem;
  font-size: 11px;
}

.tab-pane.compact :deep(.active-palette-display) {
  gap: 0.5rem;
}

.tab-pane.compact :deep(.palette-label) {
  font-size: 10px;
}

.tab-pane.compact :deep(.color-swatch) {
  width: 6px;
  height: 6px;
}

.label {
  color: var(--game-text-secondary);
}

.list {
  margin: 0;
  padding-left: 1rem;
}

.item {
  margin-bottom: 0.1rem;
  font-variant-numeric: tabular-nums;
}
</style>
