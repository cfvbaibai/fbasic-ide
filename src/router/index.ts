import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../features/home/HomePage.vue')
  },
  {
    path: '/ide',
    name: 'Ide',
    component: () => import('../features/ide/IdePage.vue')
  },
  {
    path: '/monaco',
    name: 'MonacoEditor',
    component: () => import('../features/ide/MonacoEditorPage.vue')
  },
  {
    path: '/image-analyzer',
    name: 'ImageAnalyzer',
    component: () => import('../features/image-analyzer/ImageAnalyzerPage.vue')
  },
  {
    path: '/character-sprite-viewer',
    name: 'CharacterSpriteViewer',
    component: () => import('../features/sprite-viewer/CharacterSpriteViewerPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

