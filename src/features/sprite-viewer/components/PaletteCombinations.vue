<script setup lang="ts">
import { SPRITE_PALETTES, BACKGROUND_PALETTES } from '../../../shared/data/palette'
import ColorBox from './ColorBox.vue'
import GameCard from '../../../shared/components/ui/GameCard.vue'
</script>

<template>
  <div>
    <GameCard 
      class="palette-section"
      title=""
      :float-on-hover="false"
      :clickable="false"
    >
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
    </GameCard>

    <GameCard 
      class="palette-section"
      title=""
      :float-on-hover="false"
      :clickable="false"
    >
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
    </GameCard>
  </div>
</template>

<style scoped>
.palette-section {
  margin-bottom: 2rem;
  padding: 2rem;
}

.section-title {
  margin: 0 0 1.5rem;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-heading);
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px var(--game-color-black-50);
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
  background: var(--game-surface-bg-gradient);
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid var(--game-surface-border);
  box-shadow: var(--game-shadow-base);
}

.palette-group-title {
  margin: 0 0 1rem;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-heading);
  font-size: 1.1rem;
  font-weight: 700;
  text-shadow: 0 2px 4px var(--game-color-black-50);
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
  box-shadow: var(--game-shadow-base);
  transition: all 0.2s ease;
}

.color-combination:hover {
  border-color: var(--game-accent-color);
  box-shadow: var(--game-shadow-hover);
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

