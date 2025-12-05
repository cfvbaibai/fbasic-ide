import { MoveCharacterCode, type SpriteDefinition } from "./types"

const SPRITE_ACHILLES_LEFT1_64 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,3,3,3],
  [0,0,0,0,3,1,3,3],
  [0,0,0,3,1,1,1,3],
  [0,0,0,3,1,1,1,3],
  [0,0,3,3,2,1,1,3],
  [1,2,3,3,2,1,1,3],
]

const SPRITE_ACHILLES_LEFT1_65 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1],
  [3,3,1,1,3,3,3,0],
  [3,3,1,1,1,1,0,0],
  [3,1,1,3,3,3,0,0],
  [3,1,1,1,1,0,0,0],
  [1,1,1,3,3,0,0,0],
  [1,1,3,3,3,0,0,0],
]

const SPRITE_ACHILLES_LEFT1_66 = [
  [2,2,3,3,3,1,3,3],
  [0,0,3,3,3,3,3,3],
  [0,0,0,3,3,3,3,3],
  [0,0,0,3,3,3,3,3],
  [0,0,0,0,3,3,3,3],
  [0,0,0,0,0,3,3,3],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
]

const SPRITE_ACHILLES_LEFT1_67 = [
  [3,3,3,2,2,0,0,0],
  [3,3,2,1,1,0,0,0],
  [3,3,2,1,1,1,2,2],
  [3,3,3,2,1,1,2,3],
  [3,3,3,0,0,0,3,2],
  [3,3,0,0,0,0,2,2],
  [0,0,0,0,0,0,0,2],
  [0,0,0,0,0,0,0,0],
]

const SPRITE_ACHILLES_LEFT2_68 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,3,3,3],
  [0,0,0,0,3,1,3,3],
  [0,0,0,3,1,1,1,3],
  [0,0,0,3,1,1,1,3],
  [0,0,3,3,2,1,1,3],
  [1,2,3,3,2,1,1,3],
  [2,2,3,3,3,1,3,3],
]

const SPRITE_ACHILLES_LEFT2_69 = [
  [0,0,0,0,0,0,0,0],
  [3,3,0,0,0,0,0,0],
  [3,3,3,0,0,0,0,0],
  [3,3,3,3,0,0,0,0],
  [3,3,3,3,0,0,0,0],
  [3,3,3,3,3,0,0,0],
  [1,1,3,3,3,0,0,0],
  [1,1,3,3,2,0,2,2],
]

const SPRITE_ACHILLES_LEFT2_70 = [
  [0,0,3,3,3,3,3,3],
  [0,0,0,3,3,3,3,3],
  [0,0,0,3,3,3,3,3],
  [0,0,0,0,3,3,3,3],
  [0,0,0,0,0,3,3,3],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
]

const SPRITE_ACHILLES_LEFT2_71 = [
  [1,1,1,2,1,1,2,3],
  [1,1,1,2,1,1,3,2],
  [1,1,1,1,0,0,2,2],
  [3,1,1,1,1,0,0,2],
  [3,1,1,3,3,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
]

const SPRITE_ACHILLES_LEFTUP1_72 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,1,2,0,1,1,1],
  [0,0,2,2,3,2,1,1],
  [0,0,0,3,3,3,2,1],
  [0,0,0,2,3,3,3,1],
  [0,0,1,1,2,3,3,3],
  [0,0,1,1,1,1,3,3],
]

const SPRITE_ACHILLES_LEFTUP1_73 = [
  [0,0,0,1,1,1,0,0],
  [0,0,1,1,1,1,1,0],
  [3,3,1,1,1,1,1,1],
  [1,3,3,1,0,0,0,0],
  [1,3,3,3,0,0,0,0],
  [1,3,3,3,0,0,0,0],
  [3,3,3,3,3,0,0,0],
  [3,3,3,3,3,0,0,0],
]

const SPRITE_ACHILLES_LEFTUP1_74 = [
  [0,0,3,1,1,1,3,3],
  [0,0,3,3,3,3,3,3],
  [0,0,1,3,3,3,3,3],
  [1,1,1,1,3,3,3,3],
  [1,1,1,1,3,3,3,3],
  [1,1,1,0,0,3,3,3],
  [0,1,1,0,0,0,0,0],
  [0,0,1,0,0,0,0,0],
]

const SPRITE_ACHILLES_LEFTUP1_75 = [
  [3,3,3,3,3,0,0,0],
  [3,3,3,3,3,1,2,2],
  [3,3,3,3,1,2,2,3],
  [3,3,3,3,0,2,3,0],
  [3,3,3,1,0,0,0,0],
  [3,3,1,2,2,0,0,0],
  [0,0,2,2,3,0,0,0],
  [0,0,2,3,0,0,0,0],
]

const SPRITE_ACHILLES_LEFTUP2_76 = [
  [0,0,0,0,0,0,0,0],
  [0,0,1,2,0,1,1,1],
  [0,0,2,2,3,2,1,1],
  [0,0,0,3,3,3,2,1],
  [0,0,0,2,3,3,3,1],
  [0,0,1,1,2,3,3,3],
  [0,0,1,1,1,1,3,3],
  [0,0,3,1,1,1,3,3],
]

const SPRITE_ACHILLES_LEFTUP2_77 = [
  [0,0,0,0,0,0,0,0],
  [3,3,0,0,0,0,0,0],
  [1,3,3,1,1,0,0,0],
  [1,3,3,3,1,1,0,0],
  [1,3,3,3,1,1,1,0],
  [3,3,3,3,3,0,1,0],
  [3,3,3,3,3,0,0,0],
  [3,3,3,3,3,0,0,0],
]

const SPRITE_ACHILLES_LEFTUP2_78 = [
  [0,0,3,3,3,3,3,3],
  [0,0,0,3,3,3,3,3],
  [0,0,0,3,3,3,3,3],
  [0,0,0,1,3,3,3,3],
  [0,0,0,1,1,3,3,3],
  [0,0,0,1,1,1,0,0],
  [0,0,0,0,1,1,0,0],
  [0,0,0,0,0,1,1,0],
]

const SPRITE_ACHILLES_LEFTUP2_79 = [
  [3,3,3,3,3,1,2,2],
  [3,3,3,3,1,1,2,3],
  [3,3,3,3,1,2,3,0],
  [3,3,3,0,0,2,3,0],
  [3,3,1,0,0,0,0,0],
  [0,1,1,2,0,0,0,0],
  [0,2,2,3,0,0,0,0],
  [0,2,3,0,0,0,0,0],
]

const SPRITE_ACHILLES_TOP1_80 = [
  [0,0,0,0,0,0,0,2],
  [0,0,0,0,0,0,0,2],
  [1,1,0,0,0,0,1,3],
  [1,1,1,0,0,1,2,3],
  [0,1,1,0,3,1,2,3],
  [0,0,1,1,3,1,1,3],
  [0,0,1,1,3,1,3,3],
  [0,0,0,1,3,3,3,3]
]

const SPRITE_ACHILLES_TOP1_81 = [
  [1,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0],
  [3,1,0,0,0,0,1,1],
  [3,2,1,0,0,1,1,1],
  [3,2,1,3,0,1,1,0],
  [3,1,1,3,1,1,0,0],
  [3,3,1,3,1,1,0,0],
  [3,3,3,3,1,0,0,0]
]

const SPRITE_ACHILLES_TOP1_82 = [
  [0,0,0,3,3,3,3,3],
  [0,0,0,3,3,3,3,3],
  [0,0,0,0,3,3,3,3],
  [0,0,0,0,3,3,3,3],
  [0,0,0,0,1,3,3,3],
  [0,0,0,0,0,1,3,3],
  [0,0,0,0,2,2,2,0],
  [0,0,0,0,2,3,3,0]
]

const SPRITE_ACHILLES_TOP1_83 = [
  [3,3,3,3,3,0,0,0],
  [3,3,3,3,3,0,0,0],
  [3,3,3,3,0,0,0,0],
  [3,3,3,3,0,0,0,0],
  [3,3,3,1,0,0,0,0],
  [3,3,1,0,0,0,0,0],
  [0,2,2,2,0,0,0,0],
  [0,3,3,2,0,0,0,0]
]

const SPRITE_ACHILLES_TOP2_84 = [
  [0,0,0,0,0,0,0,2],
  [0,0,0,0,0,0,0,2],
  [0,0,0,0,0,0,1,3],
  [0,0,0,0,0,1,2,3],
  [0,0,0,0,3,1,2,3],
  [0,0,0,0,3,1,1,3],
  [0,0,0,3,3,1,3,3],
  [0,0,1,3,3,3,3,3]
]

const SPRITE_ACHILLES_TOP2_85 = [
  [1,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0],
  [3,1,0,0,0,0,0,0],
  [3,2,1,0,0,0,0,0],
  [3,2,1,3,0,0,0,0],
  [3,1,1,3,0,0,0,0],
  [3,3,1,3,3,0,0,0],
  [3,3,3,3,3,1,0,0]
]

const SPRITE_ACHILLES_TOP2_86 = [
  [0,1,1,3,3,3,3,3],
  [1,1,1,3,3,3,3,3],
  [1,3,1,0,3,3,3,3],
  [1,3,0,0,3,3,3,3],
  [1,3,0,0,1,3,3,3],
  [1,0,0,2,2,1,3,3],
  [0,0,3,3,2,2,0,0],
  [0,0,0,3,3,3,0,0]
]

const SPRITE_ACHILLES_TOP2_87 = [
  [3,3,3,3,3,1,1,0],
  [3,3,3,3,3,1,1,1],
  [3,3,3,3,0,1,3,1],
  [3,3,3,3,0,0,3,1],
  [3,3,3,1,0,0,3,1],
  [3,3,1,2,2,0,0,1],
  [0,0,2,2,3,3,0,0],
  [0,0,3,3,3,0,0,0]
]

export const ACHILLES_SPRITES: SpriteDefinition[] = [
  {
    name: "Achilles (LEFT1)",
    moveCharacterCode: MoveCharacterCode.ACHILLES,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [64, 65, 66, 67],
    tiles: [SPRITE_ACHILLES_LEFT1_64, SPRITE_ACHILLES_LEFT1_65, SPRITE_ACHILLES_LEFT1_66, SPRITE_ACHILLES_LEFT1_67],
  },
  {
    name: "Achilles (LEFT2)",
    moveCharacterCode: MoveCharacterCode.ACHILLES,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [68, 69, 70, 71],
    tiles: [SPRITE_ACHILLES_LEFT2_68, SPRITE_ACHILLES_LEFT2_69, SPRITE_ACHILLES_LEFT2_70, SPRITE_ACHILLES_LEFT2_71],
  },
  {
    name: "Achilles (LEFTUP1)",
    moveCharacterCode: MoveCharacterCode.ACHILLES,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [72, 73, 74, 75],
    tiles: [SPRITE_ACHILLES_LEFTUP1_72, SPRITE_ACHILLES_LEFTUP1_73, SPRITE_ACHILLES_LEFTUP1_74, SPRITE_ACHILLES_LEFTUP1_75],
  },
  {
    name: "Achilles (LEFTUP2)",
    moveCharacterCode: MoveCharacterCode.ACHILLES,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [76, 77, 78, 79],
    tiles: [SPRITE_ACHILLES_LEFTUP2_76, SPRITE_ACHILLES_LEFTUP2_77, SPRITE_ACHILLES_LEFTUP2_78, SPRITE_ACHILLES_LEFTUP2_79],
  },
  {
    name: "Achilles (TOP1)",
    moveCharacterCode: MoveCharacterCode.ACHILLES,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [80, 81, 82, 83],
    tiles: [SPRITE_ACHILLES_TOP1_80, SPRITE_ACHILLES_TOP1_81, SPRITE_ACHILLES_TOP1_82, SPRITE_ACHILLES_TOP1_83],
  },
  {
    name: "Achilles (TOP2)",
    moveCharacterCode: MoveCharacterCode.ACHILLES,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [84, 85, 86, 87],
    tiles: [SPRITE_ACHILLES_TOP2_84, SPRITE_ACHILLES_TOP2_85, SPRITE_ACHILLES_TOP2_86, SPRITE_ACHILLES_TOP2_87],
  },
]
