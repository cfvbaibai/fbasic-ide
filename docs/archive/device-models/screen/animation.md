## Animation Frame System

### Frame Rate and Timing

- **Base Frame Rate**: ~30 FPS (approximately 1/30 second per frame)
- **Frame Duration**: ~33.33ms per frame
- **Implementation**: `requestAnimationFrame` on main thread

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

### Position State Management

**Dual-State Architecture:**
- **Web Worker**: Manages movement definitions, sends START_MOVEMENT commands
- **Main Thread**: Handles actual position updates via animation loop

**Position Update Flow:**
1. MOVE command executes in worker → creates initial MovementState
2. START_MOVEMENT command sent to frontend
3. Frontend animation loop updates positions each frame (requestAnimationFrame)
4. Konva sprite nodes updated with new positions
5. On CUT/ERA: positions synced back to worker via UPDATE_ANIMATION_POSITIONS message

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

## Konva.js Sprite Rendering Implementation

### Current Implementation (Konva-based)

The sprite animation system uses **Konva.js** for canvas-based rendering, replacing the earlier CSS animation approach.

**Key Architecture:**
- **Konva Layers**: Multi-layer canvas rendering (backdrop → sprite back → background → sprite front)
- **Sprite Nodes**: Konva.Image nodes for each sprite, updated each frame
- **Animation Loop**: `requestAnimationFrame` loop updates sprite positions and frame indices
- **Tile Caching**: Sprite tiles cached as ImageBitmap for performance

### Position Update Flow

**Main Thread Animation Loop** (`useScreenAnimationLoop.ts`):
```typescript
function updateMovements(deltaTime: number): void {
  for (const movement of localMovementStates) {
    if (!movement.isActive) continue

    // Calculate distance this frame
    const dotsPerFrame = movement.speedDotsPerSecond * (deltaTime / 1000)
    const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)
    movement.remainingDistance -= distanceThisFrame

    // Update position
    const distanceTraveled = movement.totalDistance - movement.remainingDistance
    let currentX = movement.startX + movement.directionDeltaX * distanceTraveled
    let currentY = movement.startY + movement.directionDeltaY * distanceTraveled

    // Clamp to screen bounds
    currentX = Math.max(0, Math.min(255 - spriteSize, currentX))
    currentY = Math.max(0, Math.min(239 - spriteSize, currentY))

    // Update Konva sprite node position
    const sprite = spriteRefs.get(movement.actionNumber)
    if (sprite) {
      sprite.x(currentX * CANVAS_SCALE)
      sprite.y(currentY * CANVAS_SCALE)
    }

    // Update frame animation
    movement.frameCounter++
    if (movement.frameCounter >= 8) {
      movement.frameCounter = 0
      movement.currentFrameIndex++
    }
  }
}
```

### Sprite Rendering

**Konva Sprite Rendering** (`useKonvaSpriteRenderer.ts`):
- Creates Konva.Image nodes for each sprite
- Updates sprite image each frame based on currentFrameIndex
- Applies per-frame or direction-level inversions
- Handles 8×8 and 16×16 sprite sizes
- Uses tile caching for performance

**Frame Animation:**
```typescript
// Get current frame from sequence
const frameIndex = movement.currentFrameIndex % sequence.sprites.length
const currentSprite = sequence.sprites[frameIndex]

// Apply per-frame inversions (if defined) or direction-level inversions
const inversions = sequence.frameInversions?.[frameIndex] ?? {
  invertX: directionMapping.invertX,
  invertY: directionMapping.invertY
}

// Render sprite with inversions
renderSpriteToKonva(sprite, currentSprite, inversions, colorCombination)
```

### Position State Synchronization

**Worker → Frontend (Movement Start):**
```typescript
// Worker: AnimationManager.startMovement()
this.deviceAdapter.sendAnimationCommand({
  type: 'START_MOVEMENT',
  actionNumber,
  definition: moveDefinition,
  startX, startY
})
```

**Frontend → Worker (Position Sync):**
```typescript
// On CUT/ERA: Sync actual positions back to worker
const frontNode = frontSpriteNodes.get(actionNumber)
if (frontNode && typeof frontNode.x === 'function') {
  actualX = frontNode.x() / CANVAS_SCALE
  actualY = frontNode.y() / CANVAS_SCALE
}

// Send UPDATE_ANIMATION_POSITIONS message
workerRef.postMessage({
  type: 'UPDATE_ANIMATION_POSITIONS',
  positions: [{ actionNumber, x: actualX, y: actualY }]
})
```

**Multi-Layer Position Retrieval Priority:**
1. **Konva sprite nodes** (frontSpriteNodes/backSpriteNodes) - Most accurate
2. **Movement state** (localMovementStates) - Fallback
3. **Stored positions** (worker storedPositions) - For stopped movements

### Complete Flow Example

```basic
DEF MOVE(0)=SPRITE(0,3,1,150,0,0)  ' Mario, right, speed=1, distance=150
MOVE 0
```

**Implementation:**
1. Worker's AnimationManager creates MovementState with initial position
2. Sends START_MOVEMENT command to frontend
3. Frontend creates/updates localMovementStates
4. Animation loop starts (requestAnimationFrame)
   - Updates position each frame
   - Updates Konva sprite node position
   - Updates frame index for animation
5. On CUT: Frontend syncs position to worker via UPDATE_ANIMATION_POSITIONS
6. Next MOVE uses synced position from worker's storedPositions
