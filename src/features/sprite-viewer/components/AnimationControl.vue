<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'

const store = useSpriteViewerStore()
</script>

<template>
  <div class="control-group">
    <el-button
      :type="store.isAnimating.value ? 'danger' : 'primary'"
      @click="store.toggleAnimation"
    >
      {{ store.isAnimating.value ? 'Stop Animation' : 'Animate Mario' }}
    </el-button>
  </div>
</template>

<style scoped>
.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>

