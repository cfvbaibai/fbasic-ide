<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Monitor, Edit, Picture, Grid } from '@element-plus/icons-vue'
import GameIcon from './ui/GameIcon.vue'

const route = useRoute()
const router = useRouter()

interface NavItem {
  name: string
  path: string
  icon: any
  description: string
}

const navItems: NavItem[] = [
  {
    name: 'Home',
    path: '/',
    icon: Monitor,
    description: 'Main Menu'
  },
  {
    name: 'IDE',
    path: '/ide',
    icon: Edit,
    description: 'Family Basic IDE'
  },
  {
    name: 'Monaco Editor',
    path: '/monaco',
    icon: Edit,
    description: 'Advanced Code Editor'
  },
  {
    name: 'Image Analyzer',
    path: '/image-analyzer',
    icon: Picture,
    description: 'Analyze Images'
  },
  {
    name: 'Sprite Viewer',
    path: '/character-sprite-viewer',
    icon: Grid,
    description: 'View Character Sprites'
  }
]

const isActive = (path: string) => {
  return route.path === path
}

const navigate = (path: string) => {
  router.push(path)
}
</script>

<template>
  <nav class="game-navigation">
    <div class="nav-container">
      <div class="nav-title">
        <GameIcon :icon="Monitor" size="medium" class="title-icon" />
        <span>F-BASIC EMU</span>
      </div>
      <div class="nav-items">
        <button
          v-for="item in navItems"
          :key="item.path"
          :class="['nav-button', { active: isActive(item.path) }]"
          @click="navigate(item.path)"
        >
          <GameIcon :icon="item.icon" size="small" class="nav-icon" />
          <div class="nav-button-content">
            <span class="nav-button-name">{{ item.name }}</span>
            <span class="nav-button-desc">{{ item.description }}</span>
          </div>
          <div v-if="isActive(item.path)" class="nav-indicator">▶</div>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.game-navigation {
  background: linear-gradient(135deg, var(--game-nav-bg-start) 0%, var(--game-nav-bg-end) 100%);
  border-bottom: 3px solid var(--game-nav-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  color: var(--game-accent-color);
  text-shadow: 
    0 0 10px var(--game-accent-glow),
    0 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
  white-space: nowrap;
}

.title-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 0 8px var(--game-accent-glow));
}

.nav-items {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.nav-button {
  position: relative;
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  color: var(--game-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--game-font-family);
  min-width: 140px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.nav-button:hover {
  background: linear-gradient(135deg, #3a3a4e 0%, #2a2a3e 100%);
  border-color: var(--game-accent-color);
  color: var(--game-text-primary);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px var(--game-accent-glow),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-button.active {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-accent-color);
  color: #000000;
  font-weight: 700;
  box-shadow: 
    var(--game-shadow-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.nav-button.active .nav-icon {
  color: #000000;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
}

.nav-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.nav-button:hover .nav-icon {
  transform: scale(1.1);
}

.nav-button-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.nav-button-name {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
}

.nav-button-desc {
  font-size: 0.7rem;
  opacity: 0.7;
  line-height: 1;
}

.nav-button.active .nav-button-desc {
  opacity: 0.8;
}

.nav-indicator {
  position: absolute;
  right: 0.5rem;
  font-size: 0.9rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translateX(0);
  }
  50% {
    opacity: 0.6;
    transform: translateX(3px);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-title {
    font-size: 1.25rem;
  }

  .nav-items {
    width: 100%;
    justify-content: center;
  }

  .nav-button {
    flex: 1;
    min-width: 120px;
    padding: 0.625rem 1rem;
  }

  .nav-button-content {
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav-items {
    flex-direction: column;
  }

  .nav-button {
    width: 100%;
    min-width: unset;
  }
}
</style>
