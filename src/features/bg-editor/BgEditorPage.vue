<script setup lang="ts">
/**
 * BgEditorPage component - Main page for the BG Graphic Editor
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │  [Toolbar: SELECT | COPY | MOVE | CHAR] [CLEAR]         │
 * ├─────────────────────────────────────────────────────────┤
 * │                                    │                    │
 * │         [28x21 Grid Canvas]        │  [Palette Tabs]    │
 * │                                    │  [Color Pattern]   │
 * └─────────────────────────────────────────────────────────┘
 */

import { GameLayout } from '@/shared/components/ui'

import BgColorPattern from './components/BgColorPattern.vue'
import BgGrid from './components/BgGrid.vue'
import BgPalette from './components/BgPalette.vue'
import BgToolbar from './components/BgToolbar.vue'

defineOptions({
  name: 'BgEditorPage',
})
</script>

<template>
  <GameLayout>
    <div class="bg-editor-container">
      <div class="bg-editor-header">
        <BgToolbar />
      </div>

      <div class="bg-editor-content">
        <div class="bg-editor-main">
          <BgGrid />
        </div>

        <div class="bg-editor-sidebar">
          <BgPalette />
          <div class="color-pattern-section">
            <BgColorPattern />
          </div>
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.bg-editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bg-editor-header {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--game-surface-border);
  background: var(--game-surface-bg-gradient);
}

.bg-editor-content {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
  min-height: 0;
}

.bg-editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: auto;
}

.bg-editor-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.color-pattern-section {
  flex-shrink: 0;
  padding: 0.75rem;
  background: var(--game-surface-bg-gradient);
  border: 1px solid var(--game-surface-border);
  border-radius: 8px;
}
</style>
