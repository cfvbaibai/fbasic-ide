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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

