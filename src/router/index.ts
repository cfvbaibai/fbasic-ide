import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/monaco',
    name: 'MonacoEditor',
    component: () => import('../views/MonacoEditorPage.vue')
  },
  {
    path: '/image-analyzer',
    name: 'ImageAnalyzer',
    component: () => import('../views/ImageAnalyzerPage.vue')
  },
  {
    path: '/character-sprite-viewer',
    name: 'CharacterSpriteViewer',
    component: () => import('../views/CharacterSpriteViewerPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

