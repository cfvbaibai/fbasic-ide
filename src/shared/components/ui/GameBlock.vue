<script setup lang="ts">
import GameIcon from './GameIcon.vue'

interface Props {
  title: string
  titleIcon?: string // Icon name in format "prefix:name" (e.g., "mdi:play")
  clickableHeader?: boolean
  hideHeader?: boolean
  floatOnHover?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  titleIcon: undefined,
  clickableHeader: false,
  hideHeader: false,
  floatOnHover: false,
  clickable: false
})

const emit = defineEmits<{
  'click-header': []
  click: []
}>()

const handleHeaderClick = () => {
  if (props.clickableHeader) {
    emit('click-header')
  }
}

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div 
    class="game-block bg-game-surface border-game-surface-2 shadow-game-base" 
    :class="{ 
      'no-header': hideHeader, 
      'float-on-hover': floatOnHover,
      'clickable': clickable
    }"
    @click="handleClick"
  >
    <div 
      v-if="!hideHeader"
      class="game-block-header" 
      :class="{ 'clickable': clickableHeader }"
      @click.stop="handleHeaderClick"
    >
      <h3 class="game-block-title text-game-heading text-shadow-glow-md">
        <GameIcon v-if="titleIcon" :icon="titleIcon" size="small" />
        {{ title }}
      </h3>
      <div v-if="$slots.right" class="game-block-header-right">
        <slot name="right" />
      </div>
    </div>
    <div class="game-block-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.game-block {
  border-radius: 12px;
  padding: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.game-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--game-accent-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.game-block:hover {
  border-color: var(--game-accent-color);
  box-shadow: var(--game-shadow-hover);
}

.game-block:hover::before {
  transform: scaleX(1);
}

.game-block.float-on-hover:hover {
  transform: translateY(-8px);
}

.game-block.clickable {
  cursor: pointer;
}

.game-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--game-surface-border);
  padding-bottom: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
}

.game-block-header.clickable {
  cursor: pointer;
  user-select: none;
}

.game-block-title {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}


.game-block-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.game-block-content {
  padding-top: 0.75rem;
  position: relative;
}

.game-block.no-header .game-block-content {
  padding-top: 0;
}

@keyframes border-shimmer {
  0%, 100% {
    background-position: -200% center;
    opacity: 0.6;
  }

  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}

@keyframes header-shimmer {
  0%, 100% {
    background-position: -200% center;
    opacity: 0.6;
  }

  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}
</style>
