<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useLocale } from '@/shared/composables/useLocale'
import { useSkin } from '@/shared/composables/useSkin'

import GameIcon from './ui/GameIcon.vue'
import GameSelect from './ui/GameSelect.vue'

/**
 * GameNavigation component - Main navigation component with route navigation, skin switcher, and locale switcher.
 *
 * @example
 * ```vue
 * <GameNavigation />
 * ```
 */
defineOptions({
  name: 'GameNavigation',
})

const { t } = useI18n()
const { currentSkin, setSkin, availableSkins } = useSkin()
const { currentLocale, setLocale, availableLocales } = useLocale()

const route = useRoute()
const router = useRouter()

// Typed route metadata from vue-best-practices skill
// route.meta properties (title, icon, showInNav, requiresAuth) are now fully typed
// with IDE autocomplete support

interface NavItem {
  name: string
  path: string
  icon: string
  description: string
}

const navItems = computed<NavItem[]>(() => [
  {
    name: t('navigation.items.home.name'),
    path: '/',
    icon: 'mdi:monitor',
    description: t('navigation.items.home.description'),
  },
  {
    name: t('navigation.items.ide.name'),
    path: '/ide',
    icon: 'mdi:pencil',
    description: t('navigation.items.ide.description'),
  },
  {
    name: t('navigation.items.monaco.name'),
    path: '/monaco',
    icon: 'mdi:pencil',
    description: t('navigation.items.monaco.description'),
  },
  {
    name: t('navigation.items.imageAnalyzer.name'),
    path: '/image-analyzer',
    icon: 'mdi:image',
    description: t('navigation.items.imageAnalyzer.description'),
  },
  {
    name: t('navigation.items.spriteViewer.name'),
    path: '/character-sprite-viewer',
    icon: 'mdi:grid',
    description: t('navigation.items.spriteViewer.description'),
  },
  {
    name: t('navigation.items.canvasPerformance.name'),
    path: '/canvas-test',
    icon: 'mdi:speedometer',
    description: t('navigation.items.canvasPerformance.description'),
  },
])

const isActive = (path: string) => {
  return route.path === path
}

const navigate = (path: string) => {
  router.push(path)
}

const skinOptions = computed(() => {
  return availableSkins.map(skin => ({
    label: skin.label,
    value: skin.name,
  }))
})

const handleSkinChange = (skinValue: string | number) => {
  setSkin(skinValue as typeof currentSkin.value)
}

const localeOptions = computed(() => {
  return availableLocales.map(locale => ({
    label: locale.label,
    value: locale.value,
  }))
})

const handleLocaleChange = (localeValue: string | number) => {
  setLocale(localeValue as typeof currentLocale.value)
}
</script>

<template>
  <nav class="game-navigation">
    <div class="nav-container">
      <div class="nav-title">
        <GameIcon icon="mdi:monitor" :size="28" class="title-icon" />
        <span>{{ t('navigation.appTitle') }}</span>
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
      <div class="nav-controls">
        <GameSelect
          :model-value="currentLocale"
          :options="localeOptions"
          size="small"
          width="100px"
          @update:model-value="handleLocaleChange"
        />
        <GameSelect
          :model-value="currentSkin"
          :options="skinOptions"
          size="small"
          width="120px"
          @update:model-value="handleSkinChange"
        />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.game-navigation {
  /* background: linear-gradient(135deg, var(--game-nav-bg-start) 0%, var(--game-nav-bg-end) 100%); */
  border-bottom: 1px solid var(--game-nav-border);

  /* box-shadow: 0 4px 12px var(--base-alpha-gray-00-40), inset 0 1px 0 var(--base-alpha-gray-100-10); */
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
  color: var(--base-solid-primary);
  text-shadow:
    0 0 10px var(--game-accent-glow),
    0 2px 4px var(--base-alpha-gray-00-80);
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

.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
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
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
}

.nav-button:hover {
  background: var(--game-surface-bg-hover-gradient);
  border-color: var(--base-solid-primary);
  color: var(--game-text-primary);
  transform: translateY(-2px);
  box-shadow:
    0 4px 8px var(--game-accent-glow),
    0 2px 4px var(--base-alpha-gray-00-40),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
}

.nav-button.active {
  background: linear-gradient(135deg, var(--base-solid-primary) 0%, var(--base-solid-primary) 100%);
  border-color: var(--base-solid-primary);
  color: var(--game-text-contrast);
  font-weight: 700;
  box-shadow:
    var(--game-shadow-glow),
    0 4px 8px var(--base-alpha-gray-00-40),
    inset 0 1px 0 var(--base-alpha-gray-100-30);
}

.nav-button.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--base-solid-gray-00);
  border-radius: 8px 0 0 8px;
  box-shadow: 0 0 8px var(--base-alpha-gray-00-50);
}

.nav-icon {
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.nav-button.active .nav-icon {
  color: var(--game-text-contrast);
  filter: drop-shadow(0 0 4px var(--base-alpha-gray-00-30));
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

  .nav-controls {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
    justify-content: center;
    gap: 0.5rem;
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
