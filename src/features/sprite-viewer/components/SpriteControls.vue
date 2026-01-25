<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { GameBlock } from '@/shared/components/ui'

import DisplayOptions from './DisplayOptions.vue'
import PaletteSelector from './PaletteSelector.vue'
import SpriteSelector from './SpriteSelector.vue'

/**
 * SpriteControls component - Container for sprite viewer controls (selector, display options, palette).
 */
defineOptions({
  name: 'SpriteControls',
})

const { t } = useI18n()
</script>

<template>
  <GameBlock :title="t('spriteViewer.controls.title')">
    <SpriteSelector />
    <DisplayOptions />
    <PaletteSelector />
  </GameBlock>
</template>
