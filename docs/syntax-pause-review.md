# Demo Code Syntax & PAUSE Review

**Date**: 2026-02-04
**Status**: ✅ Complete

## Summary

Created a syntax checker (`scripts/check-syntax.ts`) and ran it against all 21 demo/sample codes. Fixed all syntax errors and adjusted PAUSE values for better gameplay experience.

## Files Changed

### 1. Syntax Checker (New)
- **Created**: `scripts/check-syntax.ts` - Validates F-BASIC code using Chevrotain parser
- **Added**: `pnpm check-syntax` command to package.json

### 2. Syntax Fixes

| File | Issue | Fix |
|------|-------|-----|
| `sample\shooting.bas` | Comment-only lines without line numbers (lines 1-8) | Removed orphan comments |
| `public\samples\joystick-demo.bas` | `NEXT I` (Family BASIC spec requires just `NEXT`) | Changed to `NEXT` |
| `dist\samples\joystick-demo.bas` | `NEXT I` | Changed to `NEXT` |

### 3. PAUSE Value Adjustments

| File | Original | New | Reason |
|------|----------|-----|--------|
| `sample\shooting.bas` (line 22) | `PAUSE 10` | `PAUSE 30` | Shot effect too brief (120ms → 364ms) |
| `sample\shooting.bas` (line 31) | `PAUSE 1` | `PAUSE 5` | Game loop too fast; matches manual examples |

## PAUSE Timing Reference

Current formula: `durationMs = (frames × 33.33) / 2.75`

| PAUSE Value | Duration | Typical Use |
|-------------|----------|-------------|
| 1 | ~12ms | (not recommended) |
| 5 | ~61ms | Game loops, input polling |
| 10 | ~121ms | Brief pauses |
| 30 | ~364ms | Visual effects |
| 50 | ~606ms | Between actions |
| 53-54 | ~642-655ms | Screen messages |
| 100 | ~1.2s | Demo observation |

## Verification

```
=== F-BASIC Syntax Check Report ===

Total files: 21
Passed: 21
Failed: 0

✅ All files passed syntax check!
```

## Files Checked

- 18 embedded samples in `src/core/samples/sampleCodes.ts`
- 3 external `.bas` files: `sample/shooting.bas`, `public/samples/joystick-demo.bas`, `dist/samples/joystick-demo.bas`
- `sample/screen-coalesce-demo.bas`
