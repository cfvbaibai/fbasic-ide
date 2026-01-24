# Screen Model Comparison: F-BASIC Manual vs Implementation

**Date**: 2026-01-24  
**Reference**: F-BASIC Manual Page 36 (Screen Display Process)

## Summary

Our screen model implementation is **consistent and correct** with the F-BASIC manual specifications. The manual page 36 contains some coordinate range errors that we have correctly identified and implemented.

## Comparison Table

| Screen | Manual Page 36 | Our Documentation | Our Implementation | Status |
|--------|----------------|-------------------|---------------------|--------|
| **Background Screen Dimensions** | 24 vertical lines × 28 horizontal characters | 28 columns × 24 lines | 28×24 grid (0-27, 0-23) | ✅ Match |
| **Backdrop Screen Dimensions** | 30 vertical lines × 32 horizontal characters | 32 columns × 30 lines | 32×30 (0-31, 0-29) | ✅ Match |
| **BG GRAPHIC Screen Dimensions** | 21 vertical lines × 28 horizontal characters | 28 columns × 21 lines | 28×21 (0-27, 0-20) | ✅ Match |
| **Sprite Screen Dimensions** | 256 dots × 240 dots | 256×240 dots | 256×240 (0-255, 0-239) | ✅ Match |

## Coordinate Range Discrepancy

**Manual Page 36 lists incorrect coordinate ranges:**

| Screen | Manual Page 36 (Incorrect) | Correct Range | Our Implementation |
|--------|---------------------------|---------------|---------------------|
| Backdrop Screen | (0,0) to (31,8) | (0,0) to (31,29) | ✅ (0,0) to (31,29) |
| Sprite Screen (Back) | (0,0) to (27,23) | (0,0) to (255,239) | ✅ (0,0) to (255,239) |
| Background Screen | (0,0) to (27,23) | (0,0) to (27,23) | ✅ (0,0) to (27,23) |
| Sprite Screen (Front) | (0,0) to (27,23) | (0,0) to (255,239) | ✅ (0,0) to (255,239) |

**Note**: The manual appears to have listed character coordinates for sprite screens instead of pixel coordinates. Our implementation correctly uses pixel coordinates (0-255, 0-239) for sprite screens.

## Detailed Verification

### Background Screen

**Manual Page 36:**
- Dimensions: 24 vertical lines and 28 horizontal characters
- Grid Structure: 1 CHARACTER = 8 DOTS horizontally
- 28 characters horizontally, 24 lines vertically

**Our Documentation:**
- Dimensions: 28 columns × 24 lines
- Coordinate Range: (0,0) to (27,23)
- Grid Structure: 1 CHARACTER = 8 DOTS horizontally

**Our Implementation:**
- `LocateExecutor`: Validates X (0-27), Y (0-23) ✅
- `ColorExecutor`: Validates X (0-27), Y (0-23) ✅
- `WebWorkerDeviceAdapter`: Initializes 28×24 grid ✅
- Screen buffer: `ScreenCell[24][28]` ✅

**Status**: ✅ **Fully Consistent**

### Backdrop Screen

**Manual Page 36:**
- Dimensions: 30 vertical lines × 32 horizontal characters
- Structure: Adds 3 lines to top/bottom, 2 columns to left/right of Background Screen
- Total: 30 lines vertically, 32 characters horizontally

**Our Documentation:**
- Dimensions: 32 columns × 30 lines
- Coordinate Range: (0,0) to (31,29)
- Structure: Extends beyond Background Screen (adds 3 lines top/bottom, 2 columns left/right)

**Status**: ✅ **Fully Consistent** (Note: Manual coordinate range is incorrect)

### BG GRAPHIC Screen

**Manual Page 36:**
- Dimensions: 21 vertical lines × 28 horizontal characters
- Purpose: Draws BG GRAPHIC patterns
- Can be copied to Background Screen via VIEW command

**Our Documentation:**
- Dimensions: 28 columns × 21 lines
- Coordinate Range: (0,0) to (27,20)
- Purpose: Graphics drawing layer

**Status**: ✅ **Fully Consistent** (Note: Manual doesn't list coordinate range, but our calculation is correct)

### Sprite Screen

**Manual Page 36:**
- Dimensions: 256 dots horizontally × 240 dots vertically
- Positioning: Sprites can be set within 240 vertical dots and 256 horizontal dots
- Note: Display scope depends on TV receiver

**Our Documentation:**
- Dimensions: 256×240 dots
- Coordinate Range: (0,0) to (255,239) in dots
- Available Display Area: x: 0-240, y: 5-220 (actual visible range)

**Status**: ✅ **Fully Consistent** (Note: Manual coordinate range is incorrect - shows character coordinates instead of pixel coordinates)

## Screen Layer Order

**Manual Page 36 (from back to front):**
1. Backdrop Screen (furthest back)
2. Sprite Screen (Back)
3. Background Screen
4. Sprite Screen (Front) (furthest front)

**Our Documentation:**
1. Backdrop Screen (furthest back)
2. Sprite Screen (Back)
3. Background Screen
4. Sprite Screen (Front) (furthest front)

**Status**: ✅ **Fully Consistent**

## Implementation Verification

### LOCATE Command

**Manual Page 70:**
- X: Horizontal display column (0 to 27)
- Y: Vertical display line (0 to 23)

**Our Implementation:**
- `LocateExecutor.ts`: Validates X (0-27), Y (0-23) ✅
- Error messages match manual specification ✅
- Tests verify range validation ✅

### COLOR Command

**Manual Page 70:**
- X: Horizontal display column (0 to 27)
- Y: Vertical display line (0 to 23)
- n: Color pattern number (0 to 3)

**Our Implementation:**
- `ColorExecutor.ts`: Validates X (0-27), Y (0-23), pattern (0-3) ✅
- Error messages match manual specification ✅
- Tests verify range validation ✅

### Screen Buffer Structure

**Our Implementation:**
- `WebWorkerDeviceAdapter`: Initializes 28×24 grid ✅
- Screen buffer: `ScreenCell[24][28]` ✅
- Each cell: `{ character: string, colorPattern: number, x: number, y: number }` ✅

## Conclusion

✅ **Our screen model is fully consistent with the F-BASIC manual specifications.**

**Key Points:**
1. All screen dimensions match the manual exactly
2. Coordinate ranges are correctly implemented (manual has errors)
3. Screen layer order matches the manual
4. Command parameter ranges match the manual
5. Implementation correctly handles character vs pixel coordinate systems

**Recommendation:**
- Our documentation is accurate and should be considered the authoritative reference
- The manual page 36 coordinate ranges appear to be errors (likely character coordinates listed for sprite screens)
- No changes needed to our implementation or documentation

## References

- F-BASIC Manual Page 36: Screen Display Process
- F-BASIC Manual Page 70: Screen Control Statements (LOCATE, COLOR)
- Our Documentation: `docs/device-models/screen/screen.md`
- Our Implementation: `src/core/execution/executors/LocateExecutor.ts`, `ColorExecutor.ts`
