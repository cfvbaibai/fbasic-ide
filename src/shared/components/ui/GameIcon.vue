<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface Props {
  icon?: any // Icon component from Element Plus or custom
  size?: 'small' | 'medium' | 'large' | number
  color?: string
  rotate?: boolean
  pulse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: null,
  size: 'medium',
  color: 'currentColor',
  rotate: false,
  pulse: false
})

const iconContainer = ref<HTMLElement>()

const iconSize = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}px`
  }
  const sizeMap = {
    small: '16px',
    medium: '20px',
    large: '24px'
  }
  return sizeMap[props.size]
})

const iconClasses = computed(() => {
  return {
    'game-icon': true,
    'game-icon-rotate': props.rotate,
    'game-icon-pulse': props.pulse
  }
})

// Remove width/height attributes from SVG elements (Element Plus sets them to 96px)
onMounted(() => {
  if (iconContainer.value) {
    const svg = iconContainer.value.querySelector('svg')
    if (svg) {
      svg.removeAttribute('width')
      svg.removeAttribute('height')
    }
  }
})
</script>

<template>
  <span
    v-if="icon"
    ref="iconContainer"
    :class="iconClasses"
    :style="{
      fontSize: iconSize,
      color: color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: iconSize,
      height: iconSize
    }"
  >
    <component :is="icon" />
  </span>
  <span v-else class="game-icon-placeholder" :style="{ fontSize: iconSize }">
    <slot />
  </span>
</template>

<style scoped>
.game-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* Override SVG width and height attributes - target SVG elements directly */
/* Element Plus icons render as SVG with game-icon class */
svg.game-icon {
  width: 1em !important;
  height: 1em !important;
  font-size: inherit !important;
  max-width: 100% !important;
  max-height: 100% !important;
}

/* Also handle nested SVG case */
.game-icon svg {
  width: 1em !important;
  height: 1em !important;
  font-size: inherit !important;
  max-width: 100% !important;
  max-height: 100% !important;
}

.game-icon-rotate {
  animation: icon-rotate 1s linear infinite;
}

.game-icon-pulse {
  animation: icon-pulse 1.5s ease-in-out infinite;
}

@keyframes icon-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes icon-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.game-icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
