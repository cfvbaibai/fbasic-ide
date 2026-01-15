<script setup lang="ts">
import GameIcon from './GameIcon.vue'

interface Props {
  title: string
  description?: string
  icon?: any
  iconColor?: string
  actionText?: string
  clickable?: boolean
  floatOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  icon: null,
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
  <div
    :class="['game-card', { clickable, 'float-on-hover': floatOnHover }]"
    @click="handleClick"
  >
    <div
      v-if="icon"
      class="game-card-icon-wrapper"
      :style="{ '--icon-color': iconColor }"
    >
      <GameIcon :icon="icon" size="large" class="game-card-icon" />
    </div>
    <h3 v-if="title" class="game-card-title">{{ title }}</h3>
    <p v-if="description" class="game-card-description">{{ description }}</p>
    <div v-if="actionText && clickable" class="game-card-action">
      <span>{{ actionText }}</span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.game-card {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: var(--game-shadow-base);
}

.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--icon-color, var(--game-accent-color));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.game-card.clickable {
  cursor: pointer;
}

/* Glowing effects on hover for all cards (regardless of clickable or floatOnHover) */
.game-card:hover {
  border-color: var(--icon-color, var(--game-card-border-hover));
  box-shadow: var(--game-shadow-hover);
}

.game-card:hover::before {
  transform: scaleX(1);
}

/* Floating effect only when floatOnHover is true */
.game-card.float-on-hover:hover {
  transform: translateY(-8px);
}

.game-card-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--game-card-bg-start), var(--game-card-bg-end));
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
  margin: 0 0 1rem 0;
  text-align: center;
}

.game-card-description {
  font-size: 1rem;
  font-family: var(--game-font-family);
  color: var(--game-text-secondary);
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
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

.game-card:hover .game-card-action {
  opacity: 1;
  transform: translateX(4px);
}
</style>
