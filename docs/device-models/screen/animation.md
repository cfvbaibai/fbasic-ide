## Animation Frame System

### Frame Rate and Timing

- **Base Frame Rate**: ~30 FPS (approximately 1/30 second per frame)
- **Frame Duration**: ~33.33ms per frame

**Speed Control (Parameter C in DEF MOVE):**
- **Range**: 0-255
- **C=0**: Moves every 256 frames (slowest)
- **C=1**: Fastest speed
- **Speed Formula**: `60/C dots per second`

**Movement Distance:**
- Total distance = `2 × D dots` (where D is parameter in DEF MOVE)
- Diagonal movement: 2 dots for both X and Y per movement step

**Asynchronous Behavior:**
- Sprites move asynchronously to BASIC program execution
- Sprites continue moving even if the program ends
- Movement status: `MOVE(n)` returns `-1` (moving) or `0` (complete)

---

## Sprite Animation Sequences

### Overview

Each character type (0-15) has implicit sprite animation sequences that automatically switch during movement based on direction.

**Key Concepts:**
- **Character Type (A)**: Determines available sprite sequences
- **Movement Direction (B)**: Determines which sequence to use and inversion flags
- **Frame Cycling**: Sprites cycle through frames in selected sequence
- **Automatic Inversion**: Horizontal/vertical inversion applied based on direction

### Sprite Sequence Model

Each character has multiple sprite definitions organized into sequences:
- **WALK1, WALK2**: Walking animation frames
- **LADDER**: Climbing ladder animation
- **JUMP**: Jumping animation
- **DOWN**: Looking down animation
- etc.

### Direction-to-Sequence Mapping

**Movement Directions:**
- 0: No movement
- 1: Up, 2: Up-right, 3: Right, 4: Down-right
- 5: Down, 6: Down-left, 7: Left, 8: Up-left

**Example: Mario (Type 0)**
| Direction | Sequence | Inversion |
|-----------|----------|-----------|
| 1 (Up) | LADDER | None |
| 3 (Right) | WALK | None |
| 7 (Left) | WALK | Horizontal (X) |
| 5 (Down) | DOWN | None |
| Diagonals | WALK | Based on horizontal component |

### Data Model

**Data Model References:**
- Sprite definitions: `SpriteDefinition` types from `src/shared/data/characters/types.ts`
- Character codes: `MoveCharacterCode` enum from `src/shared/data/characters/types.ts`
- Sprite data: `CHARACTER_SPRITES` array from `src/shared/data/sprites.ts`

```typescript
// From src/shared/data/characters/types.ts
type Tile = number[][]  // 8×8 grid of color indices (0-3)

interface BaseSprite {
  name: string
  moveCharacterCode?: MoveCharacterCode
  defaultPaletteCode: 0 | 1 | 2
  defaultColorCombination: 0 | 1 | 2 | 3
}

// Sprite definition types (one of these):
type OneTileSpriteDefinition = BaseSprite & {
  charCodes: number
  tiles: Tile
}

type FourTileSpriteDefinition = BaseSprite & {
  charCodes: [number, number, number, number]
  tiles: [Tile, Tile, Tile, Tile]
}

type SixTileSpriteDefinition = BaseSprite & {
  charCodes: [number, number, number, number, number, number]
  tiles: [Tile, Tile, Tile, Tile, Tile, Tile]
}

type EightTileSpriteDefinition = BaseSprite & {
  charCodes: [number, number, number, number, number, number, number, number]
  tiles: [Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile]
}

type SpriteDefinition = OneTileSpriteDefinition | FourTileSpriteDefinition | 
                        SixTileSpriteDefinition | EightTileSpriteDefinition

enum MoveCharacterCode {
  MARIO = 0, LADY = 1, FIGHTER_FLY = 2, ACHILLES = 3,
  PENGUIN = 4, FIREBALL = 5, CAR = 6, SPINNER = 7,
  STAR_KILLER = 8, STARSHIP = 9, EXPLOSION = 10, SMILEY = 11,
  LASER = 12, SHELL_CREEPER = 13, SIDE_STEPPER = 14, NITPICKER = 15
}

// Animation sequence model
enum MovementDirection {
  NONE = 0, UP = 1, UP_RIGHT = 2, RIGHT = 3, DOWN_RIGHT = 4,
  DOWN = 5, DOWN_LEFT = 6, LEFT = 7, UP_LEFT = 8
}

interface SpriteSequence {
  name: string  // e.g., "WALK", "LADDER", "JUMP"
  sprites: SpriteDefinition[]  // Sprites with same moveCharacterCode and sequence name
  looping: boolean
  frameRate: number  // Frames per sprite switch
  spriteSheet: string  // URL to sprite sheet image (generated from tiles)
}

interface DirectionAnimationMapping {
  direction: MovementDirection
  sequence: SpriteSequence
  invertX: boolean
  invertY: boolean
}

interface CharacterAnimationConfig {
  characterType: MoveCharacterCode
  characterName: string
  sequences: Map<string, SpriteSequence>  // Key: sequence name (e.g., "WALK", "LADDER")
  directionMappings: DirectionAnimationMapping[]
}
```

### AnimationManager Integration

**Data Lookup:**
- Filter `CHARACTER_SPRITES` by `moveCharacterCode` to get all sprites for a character
- Group sprites by sequence name (extracted from `name` field, e.g., "Mario (WALK1)" → "WALK")
- Build sequences from grouped sprites

```typescript
// Helper to extract sequence name from sprite name
function getSequenceName(spriteName: string): string {
  // "Mario (WALK1)" -> "WALK", "Mario (LADDER)" -> "LADDER"
  const match = spriteName.match(/\((\w+)/)
  return match ? match[1] : ''
}

// Build sequences from CHARACTER_SPRITES
function buildCharacterSequences(
  characterCode: MoveCharacterCode,
  allSprites: SpriteDefinition[]
): Map<string, SpriteSequence> {
  const characterSprites = allSprites.filter(
    s => s.moveCharacterCode === characterCode
  )
  
  const sequences = new Map<string, SpriteDefinition[]>()
  characterSprites.forEach(sprite => {
    const seqName = getSequenceName(sprite.name)
    if (!sequences.has(seqName)) {
      sequences.set(seqName, [])
    }
    sequences.get(seqName)!.push(sprite)
  })
  
  // Convert to SpriteSequence objects
  const result = new Map<string, SpriteSequence>()
  sequences.forEach((sprites, name) => {
    result.set(name, {
      name,
      sprites: sprites.sort((a, b) => a.name.localeCompare(b.name)),  // WALK1, WALK2, WALK3
      looping: true,
      frameRate: 8,  // Default: 8 frames per sprite switch
      spriteSheet: generateSpriteSheet(sprites)  // Generate from tiles
    })
  })
  
  return result
}

// MoveDefinition structure (from DEF MOVE(n)=SPRITE(A,B,C,D,E,F))
interface MoveDefinition {
  actionNumber: number      // n: 0-7
  characterType: MoveCharacterCode  // A: 0-15
  direction: number         // B: 0-8
  speed: number             // C: 0-255
  distance: number          // D: 1-255
  priority: number          // E: 0-1
  colorCombination: number  // F: 0-3
}

class AnimationManager {
  startMovement(actionNumber: number, definition: MoveDefinition): void {
    const charConfig = getCharacterAnimationConfig(definition.characterType)
    const mapping = charConfig.directionMappings.find(
      m => m.direction === definition.direction
    )
    
    this.deviceAdapter.sendAnimationCommand({
      type: 'START_SPRITE_ANIMATION',
      actionNumber: actionNumber,
      spriteSheet: mapping.sequence.spriteSheet,
      frameCount: mapping.sequence.sprites.length,
      animationDuration: mapping.sequence.frameRate / 30,  // seconds
      invertX: mapping.invertX,
      invertY: mapping.invertY
    })
  }
}
```

---

## CSS Sprite Sheet Implementation

### Sprite Sheet Concept

A single image file containing multiple animation frames arranged horizontally:
```
[Frame 1] [Frame 2] [Frame 3] [Frame 4]
```

### CSS Animation

Use CSS `@keyframes` with `steps()` for discrete frame switching:

```css
.mario-walk {
    width: 64px;
    height: 64px;
    background-image: url('mario-walk-sheet.png');
    background-size: 200% 100%; /* 2 frames = 200% width */
    animation: mario-walk-cycle 0.5s steps(2) infinite;
}

.mario-walk[data-direction="left"] {
    transform: scaleX(-1); /* Horizontal flip */
}

@keyframes mario-walk-cycle {
    from { background-position: 0 0; }
    to { background-position: -100% 0; }
}
```

**Key CSS Properties:**
- `background-size: N×100%` where N = number of frames
- `steps(N)` creates discrete frame switching
- `background-position: -(N-1)×100%` to cycle through all frames
- `transform: scaleX(-1)` for horizontal inversion

### Implementation Steps

**1. Create Sprite Sheets**
- One image per character sequence (e.g., `mario-walk-sheet.png`)
- Frames arranged horizontally side-by-side

**2. Define CSS Classes**
```css
.mario-walk {
    background-image: url('sprites/mario-walk-sheet.png');
    background-size: 200% 100%;
    animation: mario-walk-cycle 0.5s steps(2) infinite;
}

.sprite-left { transform: scaleX(-1); }
.sprite-up { transform: scaleY(-1); }
```

**3. Main Thread Execution**
```typescript
class DOMAnimationExecutor {
  handleAnimationCommand(command: SpriteAnimationCommand): void {
    const sprite = this.getSpriteElement(command.actionNumber)
    sprite.style.backgroundImage = `url('${command.spriteSheet}')`
    sprite.style.backgroundSize = `${command.frameCount * 100}% 100%`
    
    if (command.invertX) sprite.classList.add('sprite-left')
    if (command.invertY) sprite.classList.add('sprite-up')
    
    // CSS animation handles frame cycling automatically
  }
}
```

### Combined Position + Sprite Animation

Position movement and sprite animation run independently via CSS:

```css
.moving-sprite {
    animation: 
        sprite-walk-cycle 0.5s steps(2) infinite,  /* Frame animation */
        move-right 3s linear forwards;              /* Position movement */
}
```

**Two independent CSS animations:**
1. Sprite frame cycling (walk-cycle)
2. Position movement (move-right)

Both are GPU-accelerated and run simultaneously.

### Frame Rate Calculation

```typescript
// sequence.frameRate = frames per sprite switch (e.g., 8 frames)
// Base frame rate = 30 FPS
// Animation duration = (frameRate / 30) seconds

const animationDuration = sequence.frameRate / 30  // e.g., 8/30 = 0.267s
```

### Complete Flow Example

```basic
DEF MOVE(0)=SPRITE(0,3,1,150,0,0)  ' Mario, right, speed=1, distance=150
MOVE 0
```

**Implementation:**
1. AnimationManager looks up Mario config, finds WALK sequence for direction 3
2. Sends `START_SPRITE_ANIMATION` command with sprite sheet URL and parameters
3. Main thread applies CSS classes, browser handles animation
4. Position movement starts via CSS transition (separate animation)
5. Both animations run independently via CSS (GPU-accelerated)
