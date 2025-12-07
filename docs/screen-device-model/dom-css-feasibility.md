# DOM/CSS Animation Implementation Feasibility Analysis

This document reviews all Family BASIC v3 animation commands and mechanisms to verify whether they can be implemented using DOM/CSS animations.

## Animation Commands Overview

### 1. DEF SPRITE - Sprite Definition

**Command:** `DEF SPRITE n, (A, B, C, D, E) = char. set`

**Parameters:**
- `A`: Color combination (0-3)
- `B`: Character construction pattern (0=8x8, 1=16x16)
- `C`: Display priority (0=front, 1=behind background)
- `D`: X-axis inversion (0=normal, 1=inverted)
- `E`: Y-axis inversion (0=normal, 1=inverted)
- `char. set`: Character string or CHR$ codes

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Color combination: CSS can apply via palette/color classes
- Size (8x8 or 16x16): CSS `width` and `height` in pixels
- Display priority: CSS `z-index` (C=0: higher z-index, C=1: lower z-index)
- X-axis inversion: CSS `transform: scaleX(-1)`
- Y-axis inversion: CSS `transform: scaleY(-1)`
- Character rendering: Pre-rendered sprite images or canvas-based rendering

**Implementation Notes:**
- Sprites can be rendered as `<img>` elements or canvas-drawn elements
- Transform properties can be combined: `transform: scaleX(-1) scaleY(-1) translate(x, y)`
- Z-index management: Front sprites (C=0) need higher z-index than background, back sprites (C=1) need lower

---

### 2. SPRITE - Display/Erase Sprite

**Command:** `SPRITE n [, x, y]`

**Functionality:**
- `SPRITE n, x, y`: Display sprite at position (x, y)
- `SPRITE n`: Erase sprite (remove from display)
- Multiple sprites: Lower sprite number appears in front
- Horizontal limit: Up to 4 sprites (8 character parts) visible horizontally
- Position: Upper-left corner of sprite at (x, y)

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Display at position: CSS `transform: translate(x, y)` or `position: absolute; left: x; top: y`
- Erase sprite: CSS `display: none` or `visibility: hidden`
- Sprite priority: CSS `z-index` (lower sprite number = higher z-index)
- Horizontal limit: DOM can track and enforce limit (hide sprites beyond limit)

**Implementation Notes:**
- Use `transform: translate()` for better performance than `left/top`
- Maintain sprite visibility state
- Z-index calculation: `z-index = 1000 - spriteNumber` (ensures lower numbers appear in front)

---

### 3. SPRITE ON/OFF - Enable/Disable Sprite Screen

**Commands:** `SPRITE ON`, `SPRITE OFF`

**Functionality:**
- `SPRITE ON`: Enables sprite screen display
- `SPRITE OFF`: Disables sprite screen (all sprites hidden)

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Enable: CSS `display: block` or `visibility: visible` on sprite container
- Disable: CSS `display: none` or `visibility: hidden` on sprite container

**Implementation Notes:**
- Apply to parent container element containing all sprites
- Simple toggle of container visibility

---

### 4. DEF MOVE - Define Movement

**Command:** `DEF MOVE(n)=SPRITE(A, B, C, D, E, F)`

**Parameters:**
- `A`: Character type (0-15, predefined animated characters)
- `B`: Movement direction (0-8: 0=none, 1-8=8 directions)
- `C`: Speed (1-255, 0=every 256 frames)
- `D`: Distance (1-255, total distance = 2×D dots)
- `E`: Display priority (0=front, 1=behind)
- `F`: Color combination (0-3)

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Character type: Pre-defined sprite data (DOM can handle)
- Direction: CSS transform calculations (8 directions: up, down, left, right, 4 diagonals)
- Speed: CSS transitions/animations with calculated duration (`duration = (2×D×C)/60` seconds)
- Distance: Can be calculated and tracked (`2×D dots total`)
- Priority: CSS `z-index`
- Color: CSS palette/color classes

**Implementation Notes:**
- **Smooth CSS animations are acceptable** - No need to mimic discrete 2-dot steps exactly
- Speed must be correct: `60/C dots per second`
- Distance must be correct: `2×D dots total`
- Duration calculation: `duration = (2×D×C)/60` seconds
- Can use CSS `transition` or `@keyframes` animation for smooth movement
- Sprite switching should look reasonable when movement completes or sprite changes

---

### 5. MOVE - Start Movement

**Command:** `MOVE n0[, n1, n2, ..., n7]`

**Functionality:**
- Starts movement of up to 8 animated characters simultaneously
- Movement is asynchronous (continues even if program ends)
- Characters move until defined distance is complete
- Movement speed and distance determined by `DEF MOVE` parameters

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Start movement: Send `START_MOVEMENT` command to main thread
- Multiple simultaneous movements: Each sprite tracked independently
- Asynchronous behavior: Movement continues independently of BASIC program
- Smooth CSS transitions/animations are acceptable

**Implementation Notes:**
- AnimationManager calculates movement parameters:
  - Start position: From `POSITION` command or default (120, 120)
  - End position: Calculated from start position, direction, and distance (2×D dots)
  - Duration: Calculated from speed and distance: `duration = (2×D×C)/60` seconds
- Main thread receives `START_MOVEMENT` command with start position, end position, and duration
- Creates sprite element if not exists
- Applies CSS transition for smooth movement: `transition: transform ${duration}s linear`
- Movement state tracked in AnimationManager (web worker) for status queries

---

### 6. CUT - Stop Movement (Preserve Position)

**Command:** `CUT n0[, n1, n2, ..., n7]`

**Functionality:**
- Stops movement of specified sprites
- **Preserves exact position** where movement stopped
- Can resume movement from same position later
- Remaining distance is preserved

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Stop movement: AnimationManager stops sending position updates
- Preserve position: Current CSS `transform` value remains unchanged
- Resume capability: Position stored in AnimationManager state

**Implementation Notes:**
- AnimationManager stops movement and preserves current position
- CSS transition is paused/cancelled, current transform value remains
- When `MOVE` is called again, movement resumes from preserved position
- Remaining distance tracked in AnimationManager state

---

### 7. ERA - Erase Sprite (Preserve Position)

**Command:** `ERA n0[, n1, n2, ..., n7]`

**Functionality:**
- Stops movement and erases sprite from display
- **Preserves exact position** where sprite disappeared
- Can resume movement from same position later
- Remaining distance is preserved

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Erase sprite: CSS `display: none` or `visibility: hidden`
- Preserve position: Position stored in AnimationManager state
- Resume capability: When `MOVE` called again, sprite reappears at preserved position

**Implementation Notes:**
- AnimationManager stops movement and marks sprite as erased
- Main thread hides sprite element: `sprite.style.display = 'none'`
- Position state maintained in AnimationManager
- When `MOVE` called again: `sprite.style.display = 'block'` and movement resumes

---

### 8. POSITION - Set Initial Position

**Command:** `POSITION n, X, Y`

**Functionality:**
- Sets initial coordinates before starting movement
- Default: X=120, Y=120 if not specified
- Used to position sprite before `MOVE` command

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Set position: CSS `transform: translate(X, Y)` or `left: X; top: Y`
- Default values: Applied if POSITION not called

**Implementation Notes:**
- Position set immediately via CSS transform
- Stored in AnimationManager state
- Used as starting point for next `MOVE` command

---

### 9. XPOS/YPOS - Query Current Position

**Functions:** `XPOS(n)`, `YPOS(n)`

**Functionality:**
- Returns current X or Y coordinate of sprite
- Used during movement to get current position
- Returns sprite screen coordinates (0-255)

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Position tracked in AnimationManager state

**Implementation Notes:**
- AnimationManager maintains current position in `MovementState`
- `XPOS(n)` and `YPOS(n)` return values directly from AnimationManager state
- Position tracked based on movement parameters and elapsed time
- No DOM query needed (position is source of truth in web worker)

---

### 10. MOVE(n) - Query Movement Status

**Function:** `MOVE(n)`

**Functionality:**
- Returns `-1` if movement is in progress
- Returns `0` if movement is complete
- Used to wait for movement completion

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Query status: AnimationManager tracks movement state
- Returns value directly from `MovementState.remainingDistance`

**Implementation Notes:**
- AnimationManager maintains `remainingDistance` for each active movement
- `MOVE(n)` checks: `remainingDistance > 0 ? -1 : 0`
- No DOM interaction needed (state managed in web worker)

---

## Special Mechanisms

### Movement Speed and Distance

**Critical Behavior:**
- Movement speed: `60/C dots per second` (where C is speed parameter 1-255)
- Total movement distance: `2×D dots` (where D is distance parameter 1-255)
- Movement direction: 8 directions (0=none, 1-8=directions)

**DOM/CSS Implementation:**
✅ **Implementable with smooth CSS animations**

**Implementation:**
- Smooth CSS transitions for position movement
- CSS sprite sheet animations for sprite frame cycling
- Speed and distance must be mathematically correct

**Position Movement:**
1. AnimationManager calculates start and end positions based on direction and distance
2. Calculates duration: `duration = (2×D) / (60/C) = (2×D×C) / 60` seconds
3. Sends `START_MOVEMENT` command with start position, end position, and duration
4. Main thread applies CSS transition: `transition: transform ${duration}s linear`
5. Updates transform to end position

**Sprite Frame Animation (CSS Sprite Sheet):**
1. AnimationManager looks up character animation config based on direction
2. Determines sprite sequence and sprite sheet URL
3. Sends `START_SPRITE_ANIMATION` command with sprite sheet, frame count, and animation duration
4. Main thread applies CSS sprite sheet animation using `@keyframes` with `steps()`
5. CSS handles frame cycling automatically (no JavaScript loops)

**Speed and Distance Calculation:**
```typescript
// Speed: 60/C dots per second
const speedDotsPerSecond = 60 / C;

// Distance: 2×D dots total
const totalDistance = 2 * D;

// Duration: distance / speed
const durationSeconds = totalDistance / speedDotsPerSecond;
// Simplified: durationSeconds = (2 * D * C) / 60

// For diagonal movement: distance applies to both X and Y
const dx = getDirectionDeltaX(direction) * totalDistance;
const dy = getDirectionDeltaY(direction) * totalDistance;
```

---

### Asynchronous Movement

**Critical Behavior:**
- Sprites continue moving even if BASIC program ends
- Movement completes independently
- Multiple sprites can move simultaneously

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- CSS animations run independently of BASIC program execution
- Movement state tracked per sprite in AnimationManager
- No dependency on BASIC program execution

---

### Sprite Priority and Layering

**Critical Behavior:**
- Lower sprite number appears in front
- Display priority (E parameter): 0=front of background, 1=behind background
- Multiple sprites can overlap

**DOM/CSS Implementation:**
✅ **Fully Implementable**
- Z-index calculation:
  - Background layer: z-index 100
  - Sprite back layer (E=1): z-index 50-99
  - Sprite front layer (E=0): z-index 200-299
  - Within same layer: `z-index = baseLayer + (100 - spriteNumber)`
- Example: Sprite 0 (E=0) gets z-index 300, Sprite 1 (E=0) gets z-index 299

---

## CSS Sprite Sheet Solution

### Overview

Sprite frame animation uses **CSS sprite sheets** with hardware-accelerated animations. This eliminates JavaScript frame loops and provides smooth, efficient sprite animation.

### Sprite Sheet Structure

A sprite sheet is a single image file containing multiple animation frames arranged horizontally:

```
[Frame 1] [Frame 2] [Frame 3] [Frame 4]
  64px      64px      64px      64px
```

**Benefits:**
- Single HTTP request (faster loading)
- GPU-accelerated animation
- No main thread blocking
- Efficient memory usage
- Browser handles all timing

### CSS Implementation

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
  from { background-position: 0 0; }      /* Frame 1 */
  to { background-position: -100% 0; }    /* Frame 2 */
}
```

**Key CSS Properties:**
- `background-size: N×100%` where N = number of frames
- `steps(N)` creates discrete frame switching
- `background-position: -(N-1)×100%` to cycle through all frames
- Animation duration: `frameRate / 30` seconds

### Implementation Flow

1. **Create Sprite Sheets**: One image per character sequence (e.g., `mario-walk-sheet.png`)
2. **AnimationManager**: Looks up character config, determines sprite sequence and sheet URL
3. **Send Command**: `START_SPRITE_ANIMATION` with sprite sheet URL, frame count, duration
4. **Main Thread**: Applies CSS sprite sheet animation
5. **Browser**: Handles frame cycling automatically (GPU-accelerated)

### Combined with Position Movement

Position movement and sprite frame animation run independently via CSS:

```css
.moving-sprite {
  /* Sprite frame animation */
  animation: 
    sprite-walk-cycle 0.5s steps(2) infinite,
    /* Position movement */
    move-right 3s linear forwards;
}
```

Two independent CSS animations:
1. **Sprite animation**: Cycles through frames (walk-cycle)
2. **Position animation**: Moves sprite across screen (move-right)

Both are GPU-accelerated and run simultaneously.

---

## Summary: DOM/CSS Implementation Feasibility

### ✅ Fully Implementable Commands

All animation commands can be implemented using DOM/CSS with the following approach:

1. **Sprite Definition & Display**: CSS transforms, z-index, visibility
2. **Position Control**: CSS `transform: translate(x, y)` with transitions
3. **Movement Control**: CSS transitions for smooth position movement
4. **Sprite Frame Animation**: CSS sprite sheet animations with `@keyframes` and `steps()`
5. **State Queries**: AnimationManager state (no DOM queries needed)
6. **Layering**: CSS z-index with calculated values
7. **Transforms**: CSS `scaleX(-1)`, `scaleY(-1)` for inversion

### ⚠️ Critical Implementation Requirements

1. **Speed Accuracy**: Movement speed must match `60/C dots per second` exactly
2. **Distance Accuracy**: Total movement distance must be `2×D dots` exactly
3. **State Management**: Position and movement state must be tracked in AnimationManager (web worker)
4. **Sprite Switching**: When sprites change appearance or movement completes, transitions should look reasonable

### Implementation Approach

**Position Movement:**
- CSS `transition` for smooth movement (speed and distance must be correct)
- Duration: `duration = (2×D×C)/60` seconds

**Sprite Frame Animation:**
- CSS sprite sheet with `@keyframes` and `steps()` for discrete frame switching
- Animation duration: `duration = frameRate / 30` seconds
- GPU-accelerated, no JavaScript loops

**What to Avoid:**
- ❌ Querying DOM for position (use AnimationManager state instead)
- ❌ JavaScript frame loops for sprite animation (use CSS sprite sheets)
- ❌ Incorrect speed or distance calculations

### Implementation Pattern

**AnimationManager (Web Worker):**
```typescript
startMovement(actionNumber: number, definition: MoveDefinition, startX?: number, startY?: number): void {
  // Calculate position movement parameters
  const speed = 60 / definition.speed; // dots per second
  const totalDistance = 2 * definition.distance; // total dots
  const duration = totalDistance / speed; // seconds
  
  // Calculate end position based on direction
  const dx = getDirectionDeltaX(definition.direction) * totalDistance;
  const dy = getDirectionDeltaY(definition.direction) * totalDistance;
  const endX = (startX || 120) + dx;
  const endY = (startY || 120) + dy;
  
  // Lookup character animation config
  const charConfig = getCharacterAnimationConfig(definition.characterType);
  const mapping = charConfig.directionMappings.find(
    m => m.direction === definition.direction
  );
  
  // Send position movement command
  this.deviceAdapter.sendAnimationCommand({
    type: 'START_MOVEMENT',
    actionNumber: actionNumber,
    startX: startX || 120,
    startY: startY || 120,
    endX: endX,
    endY: endY,
    duration: duration
  });
  
  // Send sprite frame animation command
  this.deviceAdapter.sendAnimationCommand({
    type: 'START_SPRITE_ANIMATION',
    actionNumber: actionNumber,
    spriteSheet: mapping.sequence.spriteSheet,
    frameCount: mapping.sequence.sprites.length,
    animationDuration: mapping.sequence.frameRate / 30, // seconds
    invertX: mapping.invertX,
    invertY: mapping.invertY
  });
}
```

**Main Thread - DOM Execution:**
```typescript
handleAnimationCommand(command: AnimationCommand): void {
  if (command.type === 'START_MOVEMENT') {
    const sprite = this.getSpriteElement(command.actionNumber);
    
    // Set initial position
    sprite.style.transform = `translate(${command.startX}px, ${command.startY}px)`;
    
    // Apply CSS transition for smooth position movement
    sprite.style.transition = `transform ${command.duration}s linear`;
    
    // Trigger transition to end position
    requestAnimationFrame(() => {
      sprite.style.transform = `translate(${command.endX}px, ${command.endY}px)`;
    });
  }
  
  if (command.type === 'START_SPRITE_ANIMATION') {
    const sprite = this.getSpriteElement(command.actionNumber);
    
    // Apply sprite sheet and CSS animation
    sprite.style.backgroundImage = `url('${command.spriteSheet}')`;
    sprite.style.backgroundSize = `${command.frameCount * 100}% 100%`;
    sprite.style.animation = `sprite-cycle ${command.animationDuration}s steps(${command.frameCount}) infinite`;
    
    // Apply inversion
    if (command.invertX) sprite.style.transform += ' scaleX(-1)';
    if (command.invertY) sprite.style.transform += ' scaleY(-1)';
    
    // CSS handles frame cycling automatically
  }
}
```

## Conclusion

**All Family BASIC v3 animation commands and mechanisms can be implemented using DOM/CSS:**

1. **Position Movement**: CSS transitions for smooth movement
   - Speed: `60/C dots per second`
   - Distance: `2×D dots total`
   - Duration: `(2×D×C)/60` seconds

2. **Sprite Frame Animation**: CSS sprite sheet animations
   - Sprite sheets with `@keyframes` and `steps()` for discrete frame switching
   - GPU-accelerated, no JavaScript loops
   - Animation duration: `frameRate / 30` seconds

3. **AnimationManager**: Maintains authoritative state for positions and movement status

4. **Main Thread**: Executes CSS animations based on commands from web worker

5. **Z-index**: Calculated based on sprite number and display priority

