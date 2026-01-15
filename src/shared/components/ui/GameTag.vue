<script setup lang="ts">
import { computed } from 'vue'
import GameIcon from './GameIcon.vue'

interface Props {
  type?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'small' | 'medium' | 'large'
  effect?: 'light' | 'dark' | 'plain'
  icon?: any
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  effect: 'light',
  icon: null,
  closable: false
})

const emit = defineEmits<{
  close: []
}>()

const tagClasses = computed(() => {
  return {
    'game-tag': true,
    [`game-tag-${props.type}`]: true,
    [`game-tag-${props.size}`]: true,
    [`game-tag-${props.effect}`]: true
  }
})

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <span :class="tagClasses">
    <GameIcon
      v-if="icon"
      :icon="icon"
      :size="size === 'small' ? 'small' : 'medium'"
      class="game-tag-icon"
    />
    <span v-if="$slots.default" class="game-tag-content">
      <slot />
    </span>
    <button
      v-if="closable"
      type="button"
      class="game-tag-close"
      @click="handleClose"
      aria-label="Close"
    >
      ×
    </button>
  </span>
</template>

<style scoped>
.game-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-family: var(--game-font-family);
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.5;
  border-radius: 6px;
  border: 1px solid;
  white-space: nowrap;
  transition: all 0.2s ease;
}

/* Type variants - Light effect */
.game-tag-default.game-tag-light {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-color: var(--game-card-border);
  color: var(--game-text-secondary);
}

.game-tag-success.game-tag-light {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%);
  border-color: var(--game-accent-color);
  color: var(--game-accent-color);
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.2);
}

.game-tag-warning.game-tag-light {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
  border-color: var(--el-color-warning);
  color: var(--el-color-warning);
  box-shadow: 0 0 8px rgba(230, 162, 60, 0.2);
}

.game-tag-danger.game-tag-light {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.05) 100%);
  border-color: var(--el-color-danger);
  color: var(--el-color-danger);
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.2);
}

.game-tag-info.game-tag-light {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-color: var(--game-card-border);
  color: var(--game-text-secondary);
}

/* Type variants - Dark effect */
.game-tag-default.game-tag-dark {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-color: var(--game-card-border);
  color: var(--game-text-primary);
}

.game-tag-success.game-tag-dark {
  background: var(--el-color-success);
  border-color: var(--el-color-success);
  color: #ffffff;
}

.game-tag-warning.game-tag-dark {
  background: var(--el-color-warning);
  border-color: var(--el-color-warning);
  color: #ffffff;
}

.game-tag-danger.game-tag-dark {
  background: var(--el-color-danger);
  border-color: var(--el-color-danger);
  color: #ffffff;
}

.game-tag-info.game-tag-dark {
  background: var(--el-color-info);
  border-color: var(--el-color-info);
  color: #ffffff;
}

/* Type variants - Plain effect */
.game-tag-default.game-tag-plain {
  background: transparent;
  border-color: var(--game-card-border);
  color: var(--game-text-secondary);
}

.game-tag-success.game-tag-plain {
  background: transparent;
  border-color: var(--el-color-success);
  color: var(--el-color-success);
}

.game-tag-warning.game-tag-plain {
  background: transparent;
  border-color: var(--el-color-warning);
  color: var(--el-color-warning);
}

.game-tag-danger.game-tag-plain {
  background: transparent;
  border-color: var(--el-color-danger);
  color: var(--el-color-danger);
}

.game-tag-info.game-tag-plain {
  background: transparent;
  border-color: var(--el-color-info);
  color: var(--el-color-info);
}

/* Size variants */
.game-tag-small {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  gap: 0.25rem;
}

.game-tag-large {
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.game-tag-content {
  display: inline-flex;
  align-items: center;
}

.game-tag-icon {
  flex-shrink: 0;
}

.game-tag-close {
  margin-left: 0.25rem;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
}

.game-tag-close:hover {
  opacity: 1;
}

/* Fallback for browsers that don't support color-mix */
@supports not (background: color-mix(in srgb, red 20%, transparent)) {
  .game-tag-success.game-tag-light {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%);
  }
  .game-tag-warning.game-tag-light {
    background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
  }
  .game-tag-danger.game-tag-light {
    background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.05) 100%);
  }
  .game-tag-info.game-tag-light {
    background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  }
}
</style>
