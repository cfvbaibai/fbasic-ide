<script setup lang="ts">
import SpriteSelector from './SpriteSelector.vue'
import DisplayOptions from './DisplayOptions.vue'
import PaletteSelector from './PaletteSelector.vue'
import { GameBlock } from '../../../shared/components/ui'
</script>

<template>
  <GameBlock title="Controls">
    <SpriteSelector />
    <DisplayOptions />
    <PaletteSelector />
  </GameBlock>
</template>

