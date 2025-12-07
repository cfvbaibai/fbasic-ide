interface BaseSprite {
  name: string
  moveCharacterCode?: MoveCharacterCode
  defaultPaletteCode: 0 | 1 | 2
  defaultColorCombination: 0 | 1 | 2 | 3
}

export type Tile = number[][]

export interface EightTileSpriteDefinition extends BaseSprite {
  charCodes: [number, number, number, number, number, number, number, number]
  tiles: [Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile]
}

export interface SixTileSpriteDefinition extends BaseSprite {
  charCodes: [number, number, number, number, number, number]
  tiles: [Tile, Tile, Tile, Tile, Tile, Tile]
}

export interface FourTileSpriteDefinition extends BaseSprite {
  charCodes: [number, number, number, number]
  tiles: [Tile, Tile, Tile, Tile]
}

export interface OneTileSpriteDefinition extends BaseSprite {
  charCodes: number
  tiles: Tile
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

export enum MoveCharacterCode {
  MARIO = 0,
  LADY = 1,
  FIGHTER_FLY = 2,
  ACHILLES = 3,
  PENGUIN = 4,
  FIREBALL = 5,
  CAR = 6,
  SPINNER = 7,
  STAR_KILLER = 8,
  STARSHIP = 9,
  EXPLOSION = 10,
  SMILEY = 11,
  LASER = 12,
  SHELL_CREEPER = 13,
  SIDE_STEPPER = 14,
  NITPICKER = 15,
}

export interface BackgroundItem {
  code: number
  char?: string
  altChars?: string[]
  tile: Tile
}