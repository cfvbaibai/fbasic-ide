<script setup lang="ts">
import { SPRITE_PALETTES, BACKGROUND_PALETTES } from '../../../shared/data/palette'
import ColorBox from './ColorBox.vue'
import { GameBlock } from '../../../shared/components/ui'
</script>

<template>
  <div class="palette-combinations-wrapper">
    <GameBlock title="Sprite Palettes">
      <div class="palettes-container palettes-container-sprite">
        <div
          v-for="(palette, paletteIndex) in SPRITE_PALETTES"
          :key="`sprite-${paletteIndex}`"
          class="palette-group"
        >
          <h3 class="palette-group-title">Sprite Palette {{ paletteIndex }}</h3>
          <div class="color-combinations">
            <div
              v-for="(combination, combIndex) in palette"
              :key="`sprite-${paletteIndex}-${combIndex}`"
              class="color-combination"
            >
              <div class="combination-colors">
                <template
                  v-for="(colorCode, colorIndex) in combination"
                  :key="`sprite-${paletteIndex}-${combIndex}-${colorIndex}`"
                >
                  <div
                    v-if="colorIndex > 0"
                    class="combination-color-wrapper"
                  >
                    <ColorBox :color-code="colorCode" />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameBlock>

    <GameBlock title="Background Palettes">
      <div class="palettes-container palettes-container-bg">
        <div
          v-for="(palette, paletteIndex) in BACKGROUND_PALETTES"
          :key="`bg-${paletteIndex}`"
          class="palette-group"
        >
          <h3 class="palette-group-title">Background Palette {{ paletteIndex }}</h3>
          <div class="color-combinations">
            <div
              v-for="(combination, combIndex) in palette"
              :key="`bg-${paletteIndex}-${combIndex}`"
              class="color-combination"
            >
              <div class="combination-colors">
                <template
                  v-for="(colorCode, colorIndex) in combination"
                  :key="`bg-${paletteIndex}-${combIndex}-${colorIndex}`"
                >
                  <div
                    v-if="colorIndex > 0"
                    class="combination-color-wrapper"
                  >
                    <ColorBox :color-code="colorCode" />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameBlock>
  </div>
</template>

<style scoped>
.palette-combinations-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.palettes-container {
  display: grid;
  gap: 1.5rem;
}

.palettes-container-sprite {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.palettes-container-bg {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.palette-group {
  background: var(--game-surface-bg-inset-gradient);
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid var(--game-surface-border);
  box-shadow: var(--game-shadow-inset);
}

.palette-group-title {
  margin: 0 0 1rem;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-heading);
  font-size: 1.1rem;
  font-weight: 700;
  text-shadow: none;
}

.color-combinations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.color-combination {
  background: var(--game-surface-bg-gradient);
  padding: 1rem;
  border-radius: 6px;
  border: 2px solid var(--game-surface-border);
  box-shadow: none;
  transition: all 0.2s ease;
}

.color-combination:hover {
  border-color: var(--base-solid-primary);
  box-shadow: none;
}

.combination-colors {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
  align-items: stretch;
}

.combination-color-wrapper {
  flex: 1;
  min-width: 50px;
  height: 50px;
}
</style>

