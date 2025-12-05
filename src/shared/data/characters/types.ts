interface BaseSprite {
  name: string
  defaultPaletteCode: 0 | 1 | 2
  defaultColorCombination: 0 | 1 | 2 | 3
}

export interface EightTileSpriteDefinition extends BaseSprite {
  charCodes: [number, number, number, number, number, number, number, number]
  tiles: [number[][], number[][], number[][], number[][], number[][], number[][], number[][], number[][]]
}

export interface SixTileSpriteDefinition extends BaseSprite {
  charCodes: [number, number, number, number, number, number]
  tiles: [number[][], number[][], number[][], number[][], number[][], number[][]]
}

export interface FourTileSpriteDefinition extends BaseSprite {
  charCodes: [number, number, number, number]
  tiles: [number[][], number[][], number[][], number[][]]
}

export interface OneTileSpriteDefinition extends BaseSprite {
  charCodes: number
  tiles: number[][]
}

export type SpriteDefinition = EightTileSpriteDefinition | SixTileSpriteDefinition | FourTileSpriteDefinition | OneTileSpriteDefinition

export function isEightTileSprite(spriteDef: SpriteDefinition): spriteDef is EightTileSpriteDefinition {
  return Array.isArray(spriteDef.charCodes) && spriteDef.charCodes.length === 8
} 

export function isSixTileSprite(spriteDef: SpriteDefinition): spriteDef is SixTileSpriteDefinition {
  return Array.isArray(spriteDef.charCodes) && spriteDef.charCodes.length === 6
} 

export function isFourTileSprite(spriteDef: SpriteDefinition): spriteDef is FourTileSpriteDefinition {
  return Array.isArray(spriteDef.charCodes) && spriteDef.charCodes.length === 4
} 

export function isOneTileSprite(spriteDef: SpriteDefinition): spriteDef is OneTileSpriteDefinition {
  return typeof spriteDef.charCodes === 'number'
}
