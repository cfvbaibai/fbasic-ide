<script setup lang="ts">
import SpriteSelector from './SpriteSelector.vue'
import DisplayOptions from './DisplayOptions.vue'
import PaletteSelector from './PaletteSelector.vue'
import GameCard from '../../../shared/components/ui/GameCard.vue'
</script>

<template>
  <GameCard 
    class="controls-section"
    title=""
    :float-on-hover="false"
    :clickable="false"
  >
    <SpriteSelector />
    <DisplayOptions />
    <PaletteSelector />
  </GameCard>
</template>

<style scoped>
.controls-section {
  margin-bottom: 2rem;
  padding: 2rem;
}
</style>

