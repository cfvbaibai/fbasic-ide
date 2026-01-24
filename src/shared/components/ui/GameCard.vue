<script setup lang="ts">
import { computed } from 'vue'
import GameIcon from './GameIcon.vue'
import GameBlock from './GameBlock.vue'
import type { GameCardProps, GameCardEmits } from './GameCard.types'

/**
 * GameCard component - A card component with icon, title, description, and action.
 * 
 * @example
 * ```vue
 * <GameCard
 *   title="Card Title"
 *   description="Card description"
 *   icon="mdi:play"
 *   action-text="Click me"
 *   @click="handleClick"
 * />
 * ```
 */
defineOptions({
  name: 'GameCard'
})

const props = withDefaults(defineProps<GameCardProps>(), {
  description: '',
  icon: undefined,
  iconColor: 'var(--base-solid-primary)',
  actionText: '',
  clickable: true,
  floatOnHover: true
})

const emit = defineEmits<GameCardEmits>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const iconColorValue = computed(() => props.iconColor)
</script>

<template>
  <GameBlock
    :title="title"
    :hide-header="true"
    :float-on-hover="floatOnHover"
    :clickable="clickable"
    class="game-card"
    :style="{ padding: '2rem' }"
    @click="handleClick"
  >
    <div
      v-if="icon"
      class="game-card-icon-wrapper"
    >
      <GameIcon :icon="icon" size="large" class="game-card-icon" />
    </div>
    <h3 v-if="title" class="game-card-title text-game-heading">{{ title }}</h3>
    <p v-if="description" class="game-card-description">{{ description }}</p>
    <div v-if="actionText && clickable" class="game-card-action">
      <span>{{ actionText }}</span>
    </div>
    <slot />
  </GameBlock>
</template>

<style scoped>
.game-card {
  --icon-color: v-bind(iconColorValue);
}

.game-card-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--icon-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 20px color-mix(in srgb, var(--icon-color) 50%, transparent);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.game-card-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: var(--icon-color);
  opacity: 0.15;
  pointer-events: none;
}

.game-card:hover .game-card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 30px color-mix(in srgb, var(--icon-color, var(--base-solid-primary)) 50%, transparent);
}

.game-card-icon {
  font-size: 2.5rem;
  color: var(--icon-color, var(--base-solid-primary));
  filter: drop-shadow(0 0 8px var(--icon-color, var(--base-solid-primary)));
}

.game-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  margin: 0 0 1rem;
  text-align: center;
  text-shadow: 0 0 8px var(--game-accent-glow);
}

/* Light theme: use accent color, no glow */
.light-theme .game-card-title {
  color: var(--base-solid-primary);
  text-shadow: none;
}

.game-card-description {
  font-size: 1rem;
  color: var(--game-text-secondary);
  line-height: 1.6;
  margin: 0 0 1.5rem;
  text-align: center;
}

.game-card-action {
  text-align: center;
  color: var(--icon-color, var(--base-solid-primary));
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.8;
  transition: all 0.3s ease;
}

</style>
