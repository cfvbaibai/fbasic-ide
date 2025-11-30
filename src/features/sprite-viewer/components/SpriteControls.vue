<script setup lang="ts">
import SpriteSelector from './SpriteSelector.vue'
import DisplayOptions from './DisplayOptions.vue'
import AnimationControl from './AnimationControl.vue'
import PaletteSelector from './PaletteSelector.vue'
</script>

<template>
  <div class="controls-section">
    <SpriteSelector />
    <DisplayOptions />
    <AnimationControl />
    <PaletteSelector />
  </div>
</template>

<style scoped>
.controls-section {
  background: var(--app-bg-color-page);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
  margin-bottom: 2rem;
}
</style>

