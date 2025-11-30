import { createApp } from 'vue'
import './style.css'
import './shared/styles/theme.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import { initTheme } from './shared/composables/useTheme'

// Configure Monaco Editor workers before Monaco is imported
// This must be set up before any Monaco Editor code is loaded
// Monaco Editor uses web workers for syntax highlighting and other features
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorkerUrl: function (_workerId: string, label: string) {
      // Use Vite's public path to serve Monaco workers
      // In development, this will be served by Vite's dev server
      // In production, workers should be copied to public directory or bundled
      const getWorkerUrl = (path: string) => {
        // For Vite dev server, use the node_modules path
        // For production, you may need to copy workers to public directory
        if (import.meta.env.DEV) {
          return `/node_modules/monaco-editor/esm/vs/${path}`
        }
        // In production, use a CDN or copy workers to public directory
        return `https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/esm/vs/${path}`
      }
      
      if (label === 'json') {
        return getWorkerUrl('language/json/json.worker.js')
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return getWorkerUrl('language/css/css.worker.js')
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return getWorkerUrl('language/html/html.worker.js')
      }
      if (label === 'typescript' || label === 'javascript') {
        return getWorkerUrl('language/typescript/ts.worker.js')
      }
      // Default editor worker for other languages (including our custom 'fbasic')
      return getWorkerUrl('editor/editor.worker.js')
    }
  }
}

// Initialize theme system
initTheme()

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')