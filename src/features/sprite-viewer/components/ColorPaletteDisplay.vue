<script setup lang="ts">
import ColorBox from './ColorBox.vue'
</script>

<template>
  <div class="palette-section">
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

