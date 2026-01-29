/**
 * Konva screen renderer - Main composable orchestrating all screen rendering
 * Manages Konva Stage, layers, and coordinates backdrop, background, and sprite rendering
 */

import Konva from 'konva'

import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'
import { COLORS } from '@/shared/data/palette'

import {
  clearBackgroundTileCache,
  updateBackgroundLayer,
  updateBackgroundLayerDirty,
} from './useKonvaBackgroundRenderer'
import {
  clearSpriteImageCache,
  createAnimatedSpriteKonvaImage,
  createStaticSpriteKonvaImage,
  updateAnimatedSpriteKonvaImage,
} from './useKonvaSpriteRenderer'

// F-Basic screen dimensions
const CANVAS_WIDTH = 256 // Sprite screen width
const CANVAS_HEIGHT = 240 // Sprite screen height

/**
 * Layer references for F-Basic screen model
 * Order (back to front): backdrop, sprite back, background, sprite front
 */
export interface KonvaScreenLayers {
  backdropLayer: Konva.Layer | null
  spriteBackLayer: Konva.Layer | null
  backgroundLayer: Konva.Layer | null
  spriteFrontLayer: Konva.Layer | null
}

/**
 * Initialize Konva layers for F-Basic screen model
 * Creates layers in correct order: backdrop, sprite back, background, sprite front
 */
export function initializeKonvaLayers(stage: Konva.Stage): KonvaScreenLayers {
  const layers: KonvaScreenLayers = {
    backdropLayer: null,
    spriteBackLayer: null,
    backgroundLayer: null,
    spriteFrontLayer: null,
  }

  // Layer 1: Backdrop layer (furthest back)
  // Note: This is typically managed by vue-konva template, but we can create programmatically if needed
  // For now, assume it exists from template

  // Layer 2: Sprite back layer (sprites with priority E=1, behind background)
  layers.spriteBackLayer = new Konva.Layer()
  stage.add(layers.spriteBackLayer)

  // Layer 3: Background layer (PRINT content, 28×24 characters)
  layers.backgroundLayer = new Konva.Layer()
  stage.add(layers.backgroundLayer)

  // Layer 4: Sprite front layer (sprites with priority E=0, in front of background)
  layers.spriteFrontLayer = new Konva.Layer()
  stage.add(layers.spriteFrontLayer)

  return layers
}

/**
 * Render backdrop layer (solid color)
 * This is typically handled by vue-konva template, but can be updated programmatically
 */
export function renderBackdropLayer(
  layer: Konva.Layer | null,
  backdropColor: number
): void {
  if (!layer) return

  // Clear existing content
  layer.destroyChildren()

  // Get color from COLORS array
  const color = COLORS[backdropColor] ?? COLORS[0] ?? '#000000'

  // Create rectangle for backdrop
  const rect = new Konva.Rect({
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    fill: color,
  })

  layer.add(rect)
  layer.draw()
}

/**
 * Render background layer from screen buffer
 * When lastBuffer and nodeGridRef are provided, only dirty cells are updated
 */
export function renderBackgroundLayer(
  layer: Konva.Layer | null,
  buffer: ScreenCell[][],
  paletteCode: number,
  shouldCache: boolean = true,
  lastBuffer?: ScreenCell[][] | null,
  nodeGridRef?: Map<string, Konva.Image>
): void {
  if (!layer) return

  if (
    lastBuffer != null &&
    nodeGridRef != null
  ) {
    updateBackgroundLayerDirty(
      layer,
      buffer,
      lastBuffer,
      paletteCode,
      nodeGridRef
    )
  } else {
    updateBackgroundLayer(layer, buffer, paletteCode, nodeGridRef)
  }

  if (shouldCache) {
    layer.cache()
  } else {
    layer.clearCache()
  }
}

/**
 * Render sprites on a sprite layer (back or front)
 * Returns a Map of actionNumber -> Konva.Image for animated sprites
 */
export async function renderSpriteLayer(
  layer: Konva.Layer | null,
  spriteStates: SpriteState[],
  movementStates: MovementState[],
  priority: number,
  spritePaletteCode: number,
  spriteEnabled: boolean,
  spriteNodeMap?: Map<number, Konva.Image>
): Promise<Map<number, Konva.Image>> {
  const nodeMap = spriteNodeMap ?? new Map<number, Konva.Image>()

  if (!layer) return nodeMap

  // Preserve existing node positions before destroying (to maintain position during re-render)
  const preservedPositions = new Map<number, { x: number; y: number }>()
  for (const [actionNumber, node] of nodeMap.entries()) {
    preservedPositions.set(actionNumber, { x: node.x(), y: node.y() })
  }

  // Clear existing sprites
  layer.destroyChildren()
  nodeMap.clear()

  // First, render static sprites (DEF SPRITE) - only if sprite display is enabled
  if (spriteEnabled) {
    const staticSprites = spriteStates.filter(
      s => s.visible && s.priority === priority && s.definition
    )

    for (const spriteState of staticSprites) {
      // Check if this sprite is moving (has active movement state)
      // Note: In Family BASIC, action numbers and sprite numbers are separate
      // For now, we check if there's a movement with matching action number
      const movement = movementStates.find(
        m => m.actionNumber === spriteState.spriteNumber && m.isActive
      )

      if (!movement) {
        // Render static sprite (DEF SPRITE) - only if not moving
        const konvaImage = await createStaticSpriteKonvaImage(spriteState, spritePaletteCode)
        if (konvaImage) {
          layer.add(konvaImage)
        }
      }
    }
  }

  // Second, render movements (DEF MOVE) - both active and stopped (CUT)
  // These work independently of SPRITE ON/OFF
  // Filter movements by priority (include both active and inactive for CUT command)
  const movementsToRender = movementStates.filter(m => {
    if (!m?.definition) return false
    return m.definition.priority === priority
  })

  for (const movement of movementsToRender) {
    // Render animated sprite (DEF MOVE) - both active and stopped movements
    const konvaImage = await createAnimatedSpriteKonvaImage(movement, spritePaletteCode)
    if (konvaImage) {
      // Restore preserved position if available (maintains position during re-render)
      const preservedPos = preservedPositions.get(movement.actionNumber)
      if (preservedPos) {
        konvaImage.x(preservedPos.x)
        konvaImage.y(preservedPos.y)
      }
      layer.add(konvaImage)
      nodeMap.set(movement.actionNumber, konvaImage)
    }
  }

  // Draw the layer
  layer.draw()

  return nodeMap
}

/**
 * Update sprite positions and frames for animated sprites
 * Called each frame during animation loop
 */
export async function updateAnimatedSprites(
  spriteFrontLayer: Konva.Layer | null,
  spriteBackLayer: Konva.Layer | null,
  movementStates: MovementState[],
  spritePaletteCode: number,
  frontSpriteNodes: Map<number, Konva.Image>,
  backSpriteNodes: Map<number, Konva.Image>
): Promise<void> {
  // Update sprites on front layer (priority E=0)
  // Include both active and stopped movements (stopped movements need position updates)
  for (const movement of movementStates) {
    if (!movement.definition || movement.definition.priority !== 0) continue

    const spriteNode = frontSpriteNodes.get(movement.actionNumber)
    if (spriteNode) {
      // Update position for both active and stopped movements
      // Active movements: full update (position + frame)
      // Stopped movements: position only (to ensure correct location after CUT)
      await updateAnimatedSpriteKonvaImage(movement, spriteNode, spritePaletteCode)
    }
  }

  // Update sprites on back layer (priority E=1)
  // Include both active and stopped movements
  for (const movement of movementStates) {
    if (!movement.definition || movement.definition.priority !== 1) continue

    const spriteNode = backSpriteNodes.get(movement.actionNumber)
    if (spriteNode) {
      // Update position for both active and stopped movements
      await updateAnimatedSpriteKonvaImage(movement, spriteNode, spritePaletteCode)
    }
  }

  // Redraw layers if they have sprites (active or stopped)
  if (spriteFrontLayer && frontSpriteNodes.size > 0) {
    spriteFrontLayer.draw()
  }
  if (spriteBackLayer && backSpriteNodes.size > 0) {
    spriteBackLayer.draw()
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  clearSpriteImageCache()
  clearBackgroundTileCache()
}

export interface RenderAllScreenLayersOptions {
  /** When true, only update backdrop and background; do not rebuild sprite layers */
  backgroundOnly?: boolean
  /** Last rendered buffer for dirty background; when set with backgroundNodeGridRef, only dirty cells are updated */
  lastBackgroundBuffer?: ScreenCell[][] | null
  /** Grid of "y,x" -> Konva.Image for dirty background updates; populated/updated by full or dirty render */
  backgroundNodeGridRef?: Map<string, Konva.Image>
}

/**
 * Main function to render all screen layers
 * Coordinates backdrop, background, and sprite rendering
 * Returns sprite node maps for animated sprite updates
 */
export async function renderAllScreenLayers(
  layers: KonvaScreenLayers,
  buffer: ScreenCell[][],
  spriteStates: SpriteState[],
  movementStates: MovementState[],
  bgPaletteCode: number,
  spritePaletteCode: number,
  backdropColor: number,
  spriteEnabled: boolean,
  backgroundShouldCache: boolean = true,
  frontSpriteNodes?: Map<number, Konva.Image>,
  backSpriteNodes?: Map<number, Konva.Image>,
  options?: RenderAllScreenLayersOptions
): Promise<{
  frontSpriteNodes: Map<number, Konva.Image>
  backSpriteNodes: Map<number, Konva.Image>
}> {
  const backgroundOnly = options?.backgroundOnly ?? false
  const lastBackgroundBuffer = options?.lastBackgroundBuffer
  const backgroundNodeGridRef = options?.backgroundNodeGridRef

  // 1. Render backdrop layer (if layer exists, otherwise handled by template)
  if (layers.backdropLayer) {
    renderBackdropLayer(layers.backdropLayer, backdropColor)
  }

  if (backgroundOnly) {
    // Buffer-only update (e.g. PRINT): only background (and backdrop); do not rebuild sprite layers
    renderBackgroundLayer(
      layers.backgroundLayer,
      buffer,
      bgPaletteCode,
      backgroundShouldCache,
      lastBackgroundBuffer,
      backgroundNodeGridRef
    )
    if (layers.backgroundLayer) layers.backgroundLayer.draw()
    return {
      frontSpriteNodes: frontSpriteNodes ?? new Map(),
      backSpriteNodes: backSpriteNodes ?? new Map(),
    }
  }

  // 2. Render back sprites (priority E=1)
  const backNodes = await renderSpriteLayer(
    layers.spriteBackLayer,
    spriteStates,
    movementStates,
    1,
    spritePaletteCode,
    spriteEnabled,
    backSpriteNodes
  )

  // 3. Render background layer (synchronous, full or dirty)
  renderBackgroundLayer(
    layers.backgroundLayer,
    buffer,
    bgPaletteCode,
    backgroundShouldCache,
    lastBackgroundBuffer,
    backgroundNodeGridRef
  )

  // 4. Render front sprites (priority E=0)
  const frontNodes = await renderSpriteLayer(
    layers.spriteFrontLayer,
    spriteStates,
    movementStates,
    0,
    spritePaletteCode,
    spriteEnabled,
    frontSpriteNodes
  )

  return {
    frontSpriteNodes: frontNodes,
    backSpriteNodes: backNodes,
  }
}
