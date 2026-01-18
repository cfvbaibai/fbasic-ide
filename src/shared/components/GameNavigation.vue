<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import GameIcon from './ui/GameIcon.vue'
import GameSelect from './ui/GameSelect.vue'
import { useSkin } from '../composables/useSkin'

const { currentSkin, setSkin, availableSkins } = useSkin()

const route = useRoute()
const router = useRouter()

interface NavItem {
  name: string
  path: string
  icon: string
  description: string
}

const navItems: NavItem[] = [
  {
    name: 'Home',
    path: '/',
    icon: 'mdi:monitor',
    description: 'Main Menu'
  },
  {
    name: 'IDE',
    path: '/ide',
    icon: 'mdi:pencil',
    description: 'Family Basic IDE'
  },
  {
    name: 'Monaco Editor',
    path: '/monaco',
    icon: 'mdi:pencil',
    description: 'Advanced Code Editor'
  },
  {
    name: 'Image Analyzer',
    path: '/image-analyzer',
    icon: 'mdi:image',
    description: 'Analyze Images'
  },
  {
    name: 'Sprite Viewer',
    path: '/character-sprite-viewer',
    icon: 'mdi:grid',
    description: 'View Character Sprites'
  },
  {
    name: 'Canvas Performance',
    path: '/canvas-test',
    icon: 'mdi:speedometer',
    description: 'Canvas Performance Test'
  }
]

const isActive = (path: string) => {
  return route.path === path
}

const navigate = (path: string) => {
  router.push(path)
}

const skinOptions = computed(() => {
  return availableSkins.map(skin => ({
    label: skin.label,
    value: skin.name
  }))
})

const handleSkinChange = (skinValue: string | number) => {
  setSkin(skinValue as typeof currentSkin.value)
}
</script>

<template>
  <nav class="game-navigation">
    <div class="nav-container">
      <div class="nav-title">
        <GameIcon icon="mdi:monitor" :size="28" class="title-icon" />
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
        </button>
      </div>
      <div class="nav-skin-toggle">
        <GameSelect
          :model-value="currentSkin"
          :options="skinOptions"
          size="small"
          @update:model-value="handleSkinChange"
        />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.game-navigation {
  background: linear-gradient(135deg, var(--game-nav-bg-start) 0%, var(--game-nav-bg-end) 100%);
  border-bottom: 3px solid var(--game-nav-border);
  box-shadow: 0 4px 12px var(--base-color-black-40), inset 0 1px 0 var(--base-color-white-10);
  flex-shrink: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
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
    0 2px 4px var(--base-color-black-80);
  letter-spacing: 2px;
  white-space: nowrap;
}

.title-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 0 8px var(--game-accent-glow));
}

.nav-items {
  display: flex;
  gap: 0.375rem;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.nav-skin-toggle {
  display: flex;
  align-items: center;
  margin-left: 1rem;
  min-width: 120px;
  flex-shrink: 0;
}

.nav-button {
  position: relative;
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  padding: 0.5rem 0.875rem;
  color: var(--game-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 
    0 2px 4px var(--base-color-black-30),
    inset 0 1px 0 var(--base-color-white-10);
}

.nav-button:hover {
  background: var(--game-surface-hover-gradient);
  border-color: var(--game-accent-color);
  color: var(--game-text-primary);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px var(--game-accent-glow),
    0 2px 4px var(--base-color-black-40),
    inset 0 1px 0 var(--base-color-white-10);
}

.nav-button.active {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, var(--game-accent-color) 100%);
  border-color: var(--game-accent-color);
  color: var(--base-color-black);
  font-weight: 700;
  box-shadow: 
    var(--game-shadow-glow),
    0 4px 8px var(--base-color-black-40),
    inset 0 1px 0 var(--base-color-white-30);
}

.nav-button.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--base-color-black);
  border-radius: 8px 0 0 8px;
  box-shadow: 0 0 8px var(--base-color-black-50);
}

.nav-icon {
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.nav-button.active .nav-icon {
  color: var(--base-color-black);
  filter: drop-shadow(0 0 4px var(--base-color-black-30));
}

.nav-button:hover .nav-icon {
  transform: scale(1.1);
}

.nav-button-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.nav-button-name {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
}

.nav-button-desc {
  display: none;
}

/* Responsive design */
@media (width <= 768px) {
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
    min-width: auto;
    padding: 0.5rem 0.875rem;
  }

  .nav-button-content {
    align-items: center;
    text-align: center;
  }

  .nav-skin-toggle {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
    min-width: unset;
  }
}

@media (width <= 480px) {
  .nav-items {
    flex-direction: column;
  }

  .nav-button {
    width: 100%;
    min-width: unset;
  }
}
</style>
