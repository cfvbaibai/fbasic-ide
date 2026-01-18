<script setup lang="ts">
import ColorBox from './ColorBox.vue'
import GameCard from '../../../shared/components/ui/GameCard.vue'
</script>

<template>
  <GameCard 
    class="palette-section"
    title=""
    :float-on-hover="false"
    :clickable="false"
  >
    <h2 class="section-title">64 Color Palette (4×16 Grid)</h2>
    <div class="palette-container">
      <div
        v-for="row in 4"
        :key="row"
        class="palette-row"
      >
        <div
          v-for="col in 16"
          :key="col"
          class="palette-color-wrapper"
        >
          <ColorBox :color-code="(row - 1) * 16 + (col - 1)" />
        </div>
      </div>
    </div>
  </GameCard>
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
  text-shadow: 0 2px 4px rgb(0 0 0 / 50%);
}

.palette-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
  padding: 8px 0;
}

.palette-row {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 8px;
  min-width: fit-content;
}

.palette-color-wrapper {
  width: 60px;
  height: 60px;
}
</style>

