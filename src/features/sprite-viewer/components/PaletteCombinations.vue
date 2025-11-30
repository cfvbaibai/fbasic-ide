<script setup lang="ts">
import { SPRITE_PALETTES, BACKGROUND_PALETTES } from '../../../shared/data/palette'
import ColorBox from './ColorBox.vue'
</script>

<template>
  <div>
    <div class="palette-section">
      <h2 class="section-title">Sprite Palettes</h2>
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
    </div>

    <div class="palette-section">
      <h2 class="section-title">Background Palettes</h2>
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
    </div>
  </div>
</template>

<style scoped>
.palette-section {
  background: var(--app-bg-color-page);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
  margin-top: 2rem;
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: var(--app-text-color-primary);
  font-size: 1.25rem;
  font-weight: 600;
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
  background: var(--app-fill-color-light);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--app-border-color-light);
}

.palette-group-title {
  margin: 0 0 1rem 0;
  color: var(--app-text-color-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.color-combinations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.color-combination {
  background: var(--app-bg-color-page);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--app-border-color-light);
}

.combination-colors {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: stretch;
  flex-wrap: nowrap;
}

.combination-color-wrapper {
  flex: 1;
  min-width: 50px;
  height: 50px;
}
</style>

