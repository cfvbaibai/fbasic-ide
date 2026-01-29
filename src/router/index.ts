import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/features/home/HomePage.vue'),
    meta: {
      title: 'Home',
      showInNav: true,
      icon: 'mdi:home',
    },
  },
  {
    path: '/ide',
    name: 'Ide',
    component: () => import('@/features/ide/IdePage.vue'),
    meta: {
      title: 'IDE',
      showInNav: true,
      icon: 'mdi:monitor',
    },
  },
  {
    path: '/monaco',
    name: 'MonacoEditor',
    component: () => import('@/features/monaco-editor/MonacoEditorPage.vue'),
    meta: {
      title: 'Monaco Editor',
      showInNav: false,
    },
  },
  {
    path: '/image-analyzer',
    name: 'ImageAnalyzer',
    component: () => import('@/features/image-analyzer/ImageAnalyzerPage.vue'),
    meta: {
      title: 'Image Analyzer',
      showInNav: false,
    },
  },
  {
    path: '/character-sprite-viewer',
    name: 'CharacterSpriteViewer',
    component: () => import('@/features/sprite-viewer/CharacterSpriteViewerPage.vue'),
    meta: {
      title: 'Sprite Viewer',
      showInNav: true,
      icon: 'mdi:eye',
    },
  },
  {
    path: '/konva-test',
    name: 'KonvaSpriteTest',
    component: () => import('@/features/konva-test/KonvaSpriteTestPage.vue'),
    meta: {
      title: 'Konva Sprite Test',
      showInNav: true,
      icon: 'mdi:animation',
    },
  },
  {
    path: '/position-sync-load-test',
    name: 'PositionSyncLoadTest',
    component: () => import('@/features/ide/PositionSyncLoadTestPage.vue'),
    meta: {
      title: 'Position Sync Load Test',
      showInNav: false,
    },
  },
  {
    path: '/print-vs-sprites-test',
    name: 'PrintVsSpritesTest',
    component: () => import('@/features/ide/PrintVsSpritesTestPage.vue'),
    meta: {
      title: 'PRINT vs Sprites (Phase 6.1)',
      showInNav: false,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
