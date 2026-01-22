<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SpriteSelector from './SpriteSelector.vue'
import DisplayOptions from './DisplayOptions.vue'
import PaletteSelector from './PaletteSelector.vue'
import { GameBlock } from '../../../shared/components/ui'

const { t } = useI18n()
</script>

<template>
  <GameBlock :title="t('spriteViewer.controls.title')">
    <SpriteSelector />
    <DisplayOptions />
    <PaletteSelector />
  </GameBlock>
</template>

