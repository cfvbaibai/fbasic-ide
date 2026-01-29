<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  BACKGROUND_PALETTES,
  COLORS,
  SPRITE_PALETTES,
} from '@/shared/data/palette'

defineOptions({
  name: 'ActivePaletteDisplay',
})

const props = withDefaults(
  defineProps<{
    /** Background palette index (0–1). */
    bgPalette?: number
    /** Sprite palette index (0–2). */
    spritePalette?: number
  }>(),
  {
    bgPalette: 1,
    spritePalette: 1,
  }
)

const { t } = useI18n()

/** Safe color hex for a palette color index (0–60). */
function hexFor(index: number): string {
  const i = Math.max(0, Math.min(index, COLORS.length - 1))
  return COLORS[i] ?? '#000000'
}

const bgPaletteData = computed(() => {
  const idx = Math.max(0, Math.min(props.bgPalette ?? 1, BACKGROUND_PALETTES.length - 1))
  return BACKGROUND_PALETTES[idx] ?? BACKGROUND_PALETTES[1]
})

const spritePaletteData = computed(() => {
  const idx = Math.max(0, Math.min(props.spritePalette ?? 1, SPRITE_PALETTES.length - 1))
  return SPRITE_PALETTES[idx] ?? SPRITE_PALETTES[1]
})
</script>

<template>
  <div class="active-palette-display">
    <div class="palette-section">
      <span class="palette-label" :title="t('ide.output.paletteBgTitle')">
        {{ t('ide.output.paletteBg') }} {{ bgPalette }}
      </span>
      <div class="palette-combos">
        <div
          v-for="(combo, comboIndex) in bgPaletteData"
          :key="`bg-${comboIndex}`"
          class="combo-strip"
          :title="`${t('ide.output.paletteBg')} ${bgPalette} – ${t('ide.output.combo')} ${comboIndex}`"
        >
          <span
            v-for="(colorIndex, i) in combo"
            :key="`bg-${comboIndex}-${i}`"
            class="color-swatch"
            :style="{ backgroundColor: hexFor(colorIndex) }"
            :title="`${colorIndex} (0x${colorIndex.toString(16)})`"
          />
        </div>
      </div>
    </div>
    <div class="palette-section">
      <span class="palette-label" :title="t('ide.output.paletteSpriteTitle')">
        {{ t('ide.output.paletteSprite') }} {{ spritePalette }}
      </span>
      <div class="palette-combos">
        <div
          v-for="(combo, comboIndex) in spritePaletteData"
          :key="`sprite-${comboIndex}`"
          class="combo-strip"
          :title="`${t('ide.output.paletteSprite')} ${spritePalette} – ${t('ide.output.combo')} ${comboIndex}`"
        >
          <span
            v-for="(colorIndex, i) in combo"
            :key="`sprite-${comboIndex}-${i}`"
            class="color-swatch"
            :style="{ backgroundColor: hexFor(colorIndex) }"
            :title="`${colorIndex} (0x${colorIndex.toString(16)})`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-palette-display {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.palette-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.palette-label {
  font-size: var(--game-font-size-sm);
  font-weight: var(--game-font-weight-medium);
  color: var(--game-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.palette-combos {
  display: flex;
  flex-flow: row nowrap;
  gap: 6px;
  align-items: center;
}

.combo-strip {
  display: flex;
  align-items: center;
  gap: 1px;
}

.color-swatch {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 1px;
  border: 1px solid var(--game-surface-border);
  flex-shrink: 0;
}
</style>
