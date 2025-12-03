export interface SpriteDefinition {
  name: string
  defaultPaletteCode: 0 | 1 | 2
  defaultColorCombination: 0 | 1 | 2 | 3
  charCodes: [number, number, number, number]
  tiles: [number[][], number[][], number[][], number[][]]
}
