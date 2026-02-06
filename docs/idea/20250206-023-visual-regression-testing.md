# Strategic Idea: Visual Regression Testing for Screen & Sprite Output

**Date**: 2026-02-06
**Turn**: 23
**Status**: Conceptual
**Focus Area**: Testing & Reliability
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **automated visual regression testing** for Family Basic IDE that captures and compares screen/sprite output as images—ensuring that renderer changes don't accidentally break visual output and providing confidence when refactoring graphics-related code.

## Problem Statement

### Current Testing Gaps for Visual Output

1. **No Visual Verification**: Renderer changes can break output silently
   - Screen output (PRINT, LOCATE, COLOR) has no image-based tests
   - Sprite rendering changes are only caught manually
   - Konva renderer updates can introduce subtle visual bugs
   - No baseline images to compare against

2. **Manual Testing Burden**: Visual bugs slip through to users
   - Must manually run sample codes to verify rendering
   - Sprite animation bugs (like recent teleportation issue) found late
   - Color palette changes require visual inspection
   - No automated way to detect "screen looks wrong"

3. **Regression Fear**: Renderer refactoring is risky
   - Can't safely optimize Konva rendering code
   - Afraid to touch sprite positioning logic
   - No confidence that changes preserve visual output
   - Each renderer change requires full manual regression check

4. **Shared Buffer Verification**: New shared buffer path needs visual validation
   - `SharedBufferIntegration.test.ts` tests data synchronization
   - But doesn't verify that screen *looks* correct
   - Need to ensure shared buffer → visual output pipeline works
   - No way to catch "data is right but rendering is wrong" bugs

## Proposed Solution

### 1. Screenshot Capture for Test Runner

Extend test runner to capture canvas screenshots:

```typescript
interface VisualTestCapture {
  /** Capture current screen state as image data */
  captureScreen(): ImageData

  /** Capture specific sprite state */
  captureSprite(actionNumber: number): ImageData

  /** Capture full canvas (screen + sprites) */
  captureCanvas(): ImageData

  /** Get image data URL for manual inspection */
  toDataURL(imageData: ImageData, format: 'png' | 'jpeg'): string
}

interface VisualTestCase {
  name: string
  code: string
  /** Expected screenshots for key frames */
  expectations: VisualExpectation[]
}

interface VisualExpectation {
  frame: number                           // Frame number to capture
  tolerance?: number                      // Pixel diff tolerance (0-1)
  maxDiffPixels?: number                  // Max allowed different pixels
  excludeRegions?: Region[]               // Areas to exclude (e.g., cursor blink)
  baselinePath: string                    // Path to baseline image
}

interface Region {
  x: number
  y: number
  width: number
  height: number
}
```

### 2. Visual Comparison Engine

Compare screenshots with configurable tolerance:

```typescript
interface VisualComparisonResult {
  passed: boolean
  diffPixels: number
  totalPixels: number
  diffPercentage: number
  diffImage?: ImageData                    // Highlighted diff image
  mismatchRegions: MismatchRegion[]
}

interface MismatchRegion {
  x: number
  y: number
  width: number
  height: number
  diffMagnitude: number                    // 0-1, how different
}

interface VisualComparator {
  /** Compare two images and return diff result */
  compare(
    actual: ImageData,
    expected: ImageData,
    options: ComparisonOptions
  ): VisualComparisonResult

  /** Generate visual diff image for debugging */
  generateDiffImage(
    actual: ImageData,
    expected: ImageData,
    options: DiffOptions
  ): ImageData
}

interface ComparisonOptions {
  pixelTolerance: number                   // Max per-channel diff (0-255)
  maxDiffPixels: number
  maxDiffPercentage: number
  excludeRegions: Region[]
  ignoreAntiAliasing: boolean              // Ignore sub-pixel differences
}
```

### 3. Baseline Management

Store and update baseline images:

```typescript
interface BaselineManager {
  /** Load baseline image for test */
  loadBaseline(testName: string, frame: number): Promise<ImageData | null>

  /** Save new/updated baseline */
  saveBaseline(
    testName: string,
    frame: number,
    imageData: ImageData
  ): Promise<void>

  /** List all available baselines */
  listBaselines(): Promise<BaselineInfo[]>

  /** Delete outdated baseline */
  deleteBaseline(testName: string, frame: number): Promise<void>
}

interface BaselineInfo {
  testName: string
  frame: number
  path: string
  createdAt: Date
  size: number
}
```

### 4. Vitest Integration

Visual test extensions for Vitest:

```typescript
// test/visual/ScreenRendering.test.ts
import { describe, it, expect } from 'vitest'
import { executeVisualTest } from '@/test/helpers/visualTestRunner'

describe('Screen Output Visual Tests', () => {
  it('should render PRINT output correctly', async () => {
    const result = await executeVisualTest({
      name: 'print-basic',
      code: '10 PRINT "HELLO WORLD"\n20 END',
      expectations: [
        {
          frame: 0,
          baselinePath: 'test/visual/baselines/print-basic/frame-0.png',
          maxDiffPercentage: 0 // Exact match expected
        }
      ]
    })

    expect(result.passed).toBe(true)
    expect(result.diffPercentage).toBe(0)
  })

  it('should render LOCATE positioned text correctly', async () => {
    await executeVisualTest({
      name: 'locate-positioning',
      code: `
10 LOCATE 10, 5
20 PRINT "X"
30 END
`,
      expectations: [
        {
          frame: 0,
          baselinePath: 'test/visual/baselines/locate-positioning/frame-0.png',
          maxDiffPixels: 0
        }
      ]
    })
  })

  it('should render COLOR patterns correctly', async () => {
    await executeVisualTest({
      name: 'color-patterns',
      code: `
10 COLOR 0, 0, 3
20 COLOR 5, 5, 1
30 END
`,
      expectations: [
        {
          frame: 0,
          baselinePath: 'test/visual/baselines/color-patterns/frame-0.png',
          tolerance: 5 // Allow minor color variation
        }
      ]
    })
  })
})

// test/visual/SpriteRendering.test.ts
describe('Sprite Output Visual Tests', () => {
  it('should render static sprite correctly', async () => {
    await executeVisualTest({
      name: 'sprite-static',
      code: `
10 DEF SPRITE 0,(1,0,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
20 SPRITE 0,100,100
30 SPRITE ON
40 END
`,
      expectations: [
        {
          frame: 0,
          baselinePath: 'test/visual/baselines/sprite-static/frame-0.png'
        }
      ]
    })
  })

  it('should render sprite animation frames correctly', async () => {
    await executeVisualTest({
      name: 'sprite-animation',
      code: `
10 DEF SPRITE 0,(4,0,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
20 DEF MOVE(0)=SPRITE(0,3,60,100,0,0)
30 MOVE 0
40 END
`,
      expectations: [
        {
          frame: 0,
          baselinePath: 'test/visual/baselines/sprite-animation/frame-0.png'
        },
        {
          frame: 10, // After 10 animation frames
          baselinePath: 'test/visual/baselines/sprite-animation/frame-10.png',
          excludeRegions: [
            // Exclude cursor area (may blink)
            { x: 0, y: 0, width: 10, height: 10 }
          ]
        }
      ]
    })
  })
})

// test/visual/SharedBufferRendering.test.ts
describe('Shared Buffer Visual Tests', () => {
  it('should render screen output via shared buffer correctly', async () => {
    await executeVisualTest({
      name: 'shared-buffer-screen',
      code: '10 PRINT "SHARED"\n20 END',
      useSharedBuffer: true,
      expectations: [
        {
          frame: 0,
          baselinePath: 'test/visual/baselines/shared-buffer-screen/frame-0.png'
        }
      ]
    })
  })
})
```

### 5. Visual Diff Viewer Component

Vue component for inspecting test failures:

```vue
<template>
  <div class="visual-diff-viewer">
    <!-- Test Header -->
    <div class="diff-header">
      <h3>{{ testName }} - Frame {{ frame }}</h3>
      <div class="diff-stats" :class="{ passed: result.passed }">
        <span>Diff: {{ result.diffPercentage.toFixed(2) }}%</span>
        <span>Pixels: {{ result.diffPixels }} / {{ result.totalPixels }}</span>
      </div>
    </div>

    <!-- Image Comparison -->
    <div class="diff-images">
      <!-- Expected Image -->
      <div class="image-panel">
        <h4>Expected (Baseline)</h4>
        <img :src="expectedUrl" alt="Expected" />
      </div>

      <!-- Actual Image -->
      <div class="image-panel">
        <h4>Actual</h4>
        <img :src="actualUrl" alt="Actual" />
      </div>

      <!-- Diff Image -->
      <div class="image-panel" v-if="diffImageUrl">
        <h4>Diff (Mismatches Highlighted)</h4>
        <img :src="diffImageUrl" alt="Diff" />
      </div>
    </div>

    <!-- Slider Comparison -->
    <div class="diff-slider">
      <h4>Slider Comparison (Drag to Compare)</h4>
      <ComparisonSlider
        :before="expectedUrl"
        :after="actualUrl"
      />
    </div>

    <!-- Mismatch Regions -->
    <div class="mismatch-regions" v-if="result.mismatchRegions.length > 0">
      <h4>Mismatch Regions ({{ result.mismatchRegions.length }})</h4>
      <div
        v-for="(region, i) in result.mismatchRegions"
        :key="i"
        class="region-item"
      >
        <span>Position: ({{ region.x }}, {{ region.y }})</span>
        <span>Size: {{ region.width }}×{{ region.height }}</span>
        <span>Diff: {{ (region.diffMagnitude * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="diff-actions">
      <button @click="acceptAsNewBaseline">
        Accept as New Baseline
      </button>
      <button @click="openInExternalViewer">
        Open in External Viewer
      </button>
      <button @click="copyFailureInfo">
        Copy Failure Info
      </button>
    </div>
  </div>
</template>
```

### 6. CI/CD Integration

Automated visual testing in CI:

```typescript
// vitest.visual.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'test/**/*.{test,spec}.{js,ts}',
      'test/visual/**/*.visual.{test,spec}.{js,ts}'
    ],
    testTimeout: 30000, // Visual tests need more time
    setupFiles: ['./test/visual/setup.ts'],
    reporters: ['default', 'html'],
    coverage: {
      // Exclude visual test helpers from coverage
      exclude: ['test/visual/**']
    }
  }
})

// .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  pull_request:
    paths:
      - 'src/features/ide/**'
      - 'src/core/animation/**'
      - 'src/core/sprite/**'
      - 'test/visual/**'

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-diffs
          path: test/visual/diffs/
```

### 7. Baseline Update Workflow

CLI tool for managing baselines:

```bash
# Update all baselines
pnpm test:visual --update

# Update specific test
pnpm test:visual --update print-basic

# Generate diff report without failing
pnpm test:visual --report

# Run only visual tests
pnpm test:visual

# Run with interactive diff viewer
pnpm test:visual --interactive
```

## Implementation Priority

### Phase 1 (Week 1): Core Visual Testing Infrastructure

**Goal**: Basic screenshot capture and comparison

1. **Screenshot Capture**
   - Implement `VisualTestCapture` class
   - Hook into test adapter for canvas access
   - Capture canvas at specific execution points
   - Save screenshots as PNG

2. **Visual Comparison**
   - Implement pixel-by-pixel comparison
   - Calculate diff percentage
   - Generate diff images
   - Handle edge cases (anti-aliasing, cursor blink)

3. **Baseline Storage**
   - Store baseline images in `test/visual/baselines/`
   - Load baselines for comparison
   - Git-tracked baselines for version control

**Files to Create:**
- `test/visual/VisualTestCapture.ts` - Screenshot capture
- `test/visual/VisualComparator.ts` - Image comparison
- `test/visual/BaselineManager.ts` - Baseline management
- `test/visual/helpers/visualTestRunner.ts` - Test helper
- `test/visual/setup.ts` - Test setup

**Files to Modify:**
- `test/adapters/SharedBufferTestAdapter.ts` - Add capture methods
- `vitest.config.ts` - Add visual test patterns

**Tests to Create:**
- `test/visual/ScreenRendering.visual.test.ts` - Screen output tests
- `test/visual/SpriteRendering.visual.test.ts` - Sprite tests
- `test/visual/ColorRendering.visual.test.ts` - Color tests

### Phase 2 (Week 2): Enhanced Features & CI Integration

**Goal**: Full visual testing workflow

1. **Advanced Comparison**
   - Exclude regions (cursor, animations)
   - Configurable tolerance per test
   - Mismatch region detection
   - Anti-aliasing aware comparison

2. **Diff Viewer UI**
   - Vue component for visual diff inspection
   - Slider comparison
   - Region highlighting
   - Accept new baseline action

3. **CI/CD Integration**
   - GitHub Actions workflow
   - Artifact upload for failures
   - PR comment with diff images
   - Baseline update instructions

4. **CLI Tools**
   - `pnpm test:visual` command
   - `--update` flag for baselines
   - `--interactive` flag for diff viewer
   - `--report` flag for HTML report

**Files to Create:**
- `src/features/test-visual/components/VisualDiffViewer.vue` - Diff UI
- `src/features/test-visual/components/ComparisonSlider.vue` - Slider
- `src/features/test-visual/composables/useVisualDiff.ts` - Diff logic
- `.github/workflows/visual-regression.yml` - CI workflow
- `scripts/visual-test-cli.ts` - CLI handler

**Files to Modify:**
- `package.json` - Add visual test scripts
- `README.md` - Document visual testing

## Technical Architecture

### New Visual Testing Infrastructure

```
test/visual/
├── VisualTestCapture.ts              # Screenshot capture
├── VisualComparator.ts               # Image comparison
├── BaselineManager.ts                # Baseline CRUD
├── helpers/
│   ├── visualTestRunner.ts           # Test runner helper
│   └── frameCapture.ts               # Frame timing utilities
├── fixtures/
│   ├── sample-codes.ts               # Test programs
│   └── expected-images.ts            # Image fixtures
├── baselines/                        # Git-tracked baseline images
│   ├── print-basic/
│   │   └── frame-0.png
│   ├── sprite-animation/
│   │   ├── frame-0.png
│   │   └── frame-10.png
│   └── ...
├── diffs/                            # Generated diffs (git-ignored)
│   └── ...
├── ScreenRendering.visual.test.ts    # Screen tests
├── SpriteRendering.visual.test.ts    # Sprite tests
├── SharedBufferRendering.visual.test.ts
└── setup.ts                          # Test setup

src/features/test-visual/
├── components/
│   ├── VisualDiffViewer.vue          # Diff UI
│   ├── ComparisonSlider.vue          # Before/after slider
│   └── DiffImageViewer.vue           # Image viewer
├── composables/
│   ├── useVisualDiff.ts              # Diff state
│   └── useBaselineManager.ts         # Baseline management
└── utils/
    ├── imageUtils.ts                 # Image processing
    └── diffGenerator.ts              # Diff image generation
```

### Screenshot Capture Strategy

**Canvas Access:**
```typescript
// In test adapter
class SharedBufferTestAdapter implements BasicDeviceAdapter {
  private canvasElement?: HTMLCanvasElement

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas
  }

  getCanvasContext(): CanvasRenderingContext2D | null {
    return this.canvasElement?.getContext('2d') ?? null
  }
}

// In visual test runner
function captureScreen(adapter: SharedBufferTestAdapter): ImageData {
  const ctx = adapter.getCanvasContext()
  if (!ctx) throw new Error('No canvas context')
  return ctx.getImageData(0, 0, 256, 240)
}
```

**Frame Timing:**
```typescript
// Capture at specific frames for animation tests
async function captureAtFrame(
  code: string,
  frameNumber: number
): Promise<ImageData> {
  const adapter = new SharedBufferTestAdapter()
  const interpreter = new BasicInterpreter({ deviceAdapter: adapter })

  // Start execution
  const executePromise = interpreter.execute(code)

  // Wait for specific frame
  for (let i = 0; i < frameNumber; i++) {
    await waitForNextFrame()
  }

  // Capture screenshot
  return captureScreen(adapter)
}
```

### Comparison Algorithm

**Pixel-by-Pixel Comparison:**
```typescript
function compareImages(
  actual: ImageData,
  expected: ImageData,
  options: ComparisonOptions
): VisualComparisonResult {
  let diffPixels = 0
  const mismatches: MismatchRegion[] = []

  for (let y = 0; y < actual.height; y++) {
    for (let x = 0; x < actual.width; x++) {
      const i = (y * actual.width + x) * 4

      // Skip excluded regions
      if (isInExcludedRegion(x, y, options.excludeRegions)) continue

      // Compare RGB channels
      const rDiff = Math.abs(actual.data[i] - expected.data[i])
      const gDiff = Math.abs(actual.data[i + 1] - expected.data[i + 1])
      const bDiff = Math.abs(actual.data[i + 2] - expected.data[i + 2])

      if (rDiff > options.pixelTolerance ||
          gDiff > options.pixelTolerance ||
          bDiff > options.pixelTolerance) {
        diffPixels++
        // Track mismatch regions...
      }
    }
  }

  const totalPixels = actual.width * actual.height
  const diffPercentage = diffPixels / totalPixels

  return {
    passed: diffPixels <= options.maxDiffPixels &&
            diffPercentage <= options.maxDiffPercentage,
    diffPixels,
    totalPixels,
    diffPercentage,
    mismatchRegions: mismatches
  }
}
```

### Integration with Existing Tests

**Extend SharedBufferTestAdapter:**
```typescript
class SharedBufferTestAdapter implements BasicDeviceAdapter {
  // Existing methods...

  /** Capture current canvas state */
  captureCanvas(): ImageData {
    const canvas = this.getCanvasElement()
    const ctx = canvas.getContext('2d')!
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  }

  /** Get canvas element for testing */
  getCanvasElement(): HTMLCanvasElement {
    // Return mounted Konva canvas
    return document.querySelector('canvas')!
  }
}
```

## Dependencies & Tools

**No New Runtime Dependencies Required:**

All functionality can be built with:
- Canvas API (browser built-in)
- Vitest test framework (already using)
- PNG encoding via Canvas `toDataURL()`

**Development Dependencies:**
- `pixelmatch`: Optional, for robust image diffing
- `playwright`: Optional, for cross-browser visual tests

**Optional Enhancements:**
- `@storybook/addon-storyshots`: For component visual tests
- `reg-suit`: Alternative visual regression framework

## Success Metrics

### Test Coverage
- **Visual Test Count**: # of visual tests added
- **Code Coverage**: % of rendering code covered by visual tests
- **Baseline Coverage**: % of sample codes with visual baselines

### Regression Detection
- **Regressions Caught**: # of visual bugs caught before merge
- **False Positive Rate**: % of visual test failures that are intentional
- **Baseline Update Rate**: # of legitimate baseline updates

### Developer Confidence
- **Refactoring Velocity**: Time spent on manual testing after renderer changes
- **PR Merge Time**: Reduced time for visual verification in PRs
- **Bug Escape Rate**: % of visual bugs that reach production

## Benefits

### Immediate Benefits
1. **Automated Verification**: No manual screenshot comparison
2. **Confidence**: Safe refactoring of rendering code
3. **Documentation**: Visual baselines serve as reference
4. **Debugging**: Diff images highlight exact problem areas

### Long-Term Benefits
1. **Faster Development**: Less manual testing overhead
2. **Higher Quality**: Fewer visual bugs in releases
3. **Better Onboarding**: New developers see expected output
4. **CI Protection**: Automated visual regression detection

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Flaky tests due to anti-aliasing | Configurable tolerance; exclude regions |
| Large baseline files | Git LFS; compression; only key frames |
| Cross-browser differences | Run in consistent CI environment; per-browser baselines |
| Performance overhead | Only run in CI; separate test suite |
| False positives | Exclude dynamic elements (cursor, animations) |

## Open Questions

1. **Baseline Storage**: Git-tracked or separate storage?
2. **Tolerance Defaults**: What default pixel tolerance?
3. **Animation Frames**: How many frames to capture per animation?
4. **Cross-Browser**: Need per-browser baselines?
5. **CI Performance**: How long can visual tests take?

## Next Steps

1. **Prototype**: Build basic screenshot capture in test
2. **Baseline Generation**: Run sample codes and save baselines
3. **Comparison**: Implement pixel diff algorithm
4. **CI Integration**: Add visual test workflow
5. **Documentation**: Write visual testing guide

## Example Test Case

```typescript
// test/visual/SpriteTeleportation.visual.test.ts
// Regression test for the sprite teleportation bug

import { executeVisualTest } from '@/test/helpers/visualTestRunner'

describe('Sprite Animation Regression Tests', () => {
  it('should not teleport sprites when ERA followed by MOVE', async () => {
    // This is the exact scenario that caused the teleportation bug
    const result = await executeVisualTest({
      name: 'sprite-era-move-no-teleport',
      code: `
10 DEF SPRITE 0,(1,0,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
20 SPRITE ON
30 MOVE 0
40 ERA 0
50 MOVE 0
60 FOR I=1 TO 100: NEXT I
70 END
`,
      expectations: [
        {
          frame: 60, // After ERA and second MOVE
          baselinePath: 'test/visual/baselines/sprite-era-move-no-teleport/frame-60.png',
          maxDiffPixels: 10 // Allow minor anti-aliasing differences
        }
      ]
    })

    // If sprite teleported, diff would be huge
    expect(result.passed).toBe(true)
    expect(result.diffPercentage).toBeLessThan(0.01)
  })
})
```

---

*"A picture is worth a thousand assertions. Visual regression testing transforms the invisible—pixel-perfect rendering—into automated confidence, ensuring that every refactor preserves the visual magic that makes F-BASIC come alive."*
