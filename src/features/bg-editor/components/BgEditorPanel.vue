<script setup lang="ts">
/**
 * BgEditorPanel component - BG Graphic Editor panel for embedding in IDE
 *
 * This is a panel version of BgEditorPage without GameLayout wrapper,
 * designed to be embedded in the IDE as a view toggle alongside the code editor.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │                                    │                    │
 * │         [28x21 Grid Canvas]        │  [Palette Tabs]    │
 * │         (with toolbar in header)   │  [Color Pattern]   │
 * │                                    │                    │
 * └─────────────────────────────────────────────────────────┘
 */

import BgColorPattern from './BgColorPattern.vue'
import BgGrid from './BgGrid.vue'
import BgPalette from './BgPalette.vue'

defineOptions({
  name: 'BgEditorPanel',
})
</script>

<template>
  <div class="bg-editor-panel">
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
</template>

<style scoped>
.bg-editor-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.bg-editor-content {
  flex: 1;
  display: flex;
  gap: 1rem;
  overflow: hidden;
  min-height: 0;
}

.bg-editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: auto;
  min-height: 0;
}

.bg-editor-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  min-height: 0;
}

.color-pattern-section {
  flex-shrink: 0;
  padding: 0.75rem;
  background: var(--game-surface-bg-gradient);
  border: 1px solid var(--game-surface-border);
  border-radius: 8px;
}
</style>
