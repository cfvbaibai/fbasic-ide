import 'vue'

import type Konva from 'konva'
import type { Component } from 'vue'

declare module 'vue' {
  export interface GlobalComponents {
    VStage: Component
    VLayer: Component
    VRect: Component
    VImage: Component
    VCircle: Component
    VText: Component
    VSprite: Component
  }
}

/**
 * Vue-konva component instance with getNode() method
 * VStage component exposes getNode() which returns Konva.Stage
 */
export interface VueKonvaStageInstance {
  getNode(): Konva.Stage
  getStage?(): Konva.Stage
}
