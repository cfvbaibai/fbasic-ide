import './style.css'
import './shared/styles/theme.css'
import './shared/styles/utilities.css'
import './shared/styles/skins/index.css'

// Configure Monaco Editor workers before Monaco is imported.
// Use Vite's ?worker imports so workers are bundled and load correctly (avoids
// "Could not create web worker(s)" and uncaught Worker error events when
// /node_modules/ is not served by the dev server).
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker.js?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker.js?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'
import { createApp } from 'vue'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router/index'
import i18n from './shared/i18n'
import { logApp } from './shared/logger'

if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorker(_workerId: string, label: string): Worker {
      if (label === 'json') return new JsonWorker()
      if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker()
      if (label === 'typescript' || label === 'javascript') return new TsWorker()
      return new EditorWorker()
    },
  }
}

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(VueKonva)

// Pre-initialize background tile images early (non-blocking)
// This ensures images are ready when the IDE page loads
if (typeof window !== 'undefined') {
  void import('@/features/ide/composables/useCanvasBackgroundRenderer').then(({ preInitializeBackgroundTiles }) => {
    void preInitializeBackgroundTiles().catch((err: Error) => {
      logApp.warn('Background tile pre-initialization failed:', err)
    })
  })
}

app.mount('#app')
