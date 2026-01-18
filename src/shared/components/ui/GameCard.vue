<script setup lang="ts">
import GameIcon from './GameIcon.vue'
import GameBlock from './GameBlock.vue'

interface Props {
  title: string
  description?: string
  icon?: string // Icon name in format "prefix:name" (e.g., "mdi:play")
  iconColor?: string
  actionText?: string
  clickable?: boolean
  floatOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  icon: undefined,
  iconColor: 'var(--game-accent-color)',
  actionText: '',
  clickable: true,
  floatOnHover: true
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <GameBlock
    :title="title"
    :hide-header="true"
    :float-on-hover="floatOnHover"
    :clickable="clickable"
    class="game-card"
    :style="{ '--icon-color': iconColor, padding: '2rem' }"
    @click="handleClick"
  >
    <div
      v-if="icon"
      class="game-card-icon-wrapper"
    >
      <GameIcon :icon="icon" size="large" class="game-card-icon" />
    </div>
    <h3 v-if="title" class="game-card-title">{{ title }}</h3>
    <p v-if="description" class="game-card-description">{{ description }}</p>
    <div v-if="actionText && clickable" class="game-card-action">
      <span>{{ actionText }}</span>
    </div>
    <slot />
  </GameBlock>
</template>

<style scoped>
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
  box-shadow: 0 0 20px var(--game-accent-glow);
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
  box-shadow: 0 0 30px var(--icon-color, var(--game-accent-color));
}

.game-card-icon {
  font-size: 2.5rem;
  color: var(--icon-color, var(--game-accent-color));
  filter: drop-shadow(0 0 8px var(--icon-color, var(--game-accent-color)));
}

.game-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  color: var(--game-text-primary);
  margin: 0 0 1rem;
  text-align: center;
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
  color: var(--icon-color, var(--game-accent-color));
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.8;
  transition: all 0.3s ease;
}
</style>
