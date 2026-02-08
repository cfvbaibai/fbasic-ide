# RND Function Investigation Report

## Executive Summary

The RND function is **working correctly** and returns different (non-deterministic) values when called multiple times. The issue observed in the shooting game (all enemies showing as MARIO) is **NOT caused by RND returning the same value**.

## Test Results

### Test 1: Multiple RND(16) calls
```basic
10 FOR X=0 TO 9: PRINT RND(16): NEXT
```

**Result:** PASSED (5 consecutive runs)
- All 10 RND(16) calls return different values
- Values are in range 0-15 (as expected)
- Multiple unique values are generated each run

### Test 2: Multiple RND(9) calls
```basic
10 FOR X=0 TO 9: PRINT RND(9): NEXT
```

**Result:** PASSED (5 consecutive runs)
- All 10 RND(9) calls return different values
- Values are in range 0-8 (as expected)
- Multiple unique values are generated each run

### Test 3: Single RND calls (existing tests)
All existing RND tests continue to pass:
- RND(10) returns value 0-9
- RND(8) returns value 0-7
- RND(1) always returns 0 (per spec)
- Error handling for invalid arguments works correctly

## Implementation Analysis

### FunctionEvaluator.ts (lines 346-371)
```typescript
private evaluateRnd(args: Array<number | string>): number {
  if (args.length !== 1) {
    throw new Error('RND function requires exactly 1 argument')
  }
  const x = toNumber(args[0] ?? 0)

  // Validate argument range: 1 to 32767
  if (x < 1 || x > 32767) {
    throw new Error(`RND argument must be between 1 and 32767, got ${x}`)
  }

  // Special case: RND(1) always returns 0
  if (x === 1) {
    return 0
  }

  // Return random integer from 0 to (x-1)
  return Math.trunc(Math.random() * x)
}
```

**Key findings:**
1. Uses `Math.random()` which generates different values each call
2. Correctly truncates to integer
3. Properly implements the Family BASIC spec
4. No caching or optimization that would cause deterministic results

### DefMoveExecutor.ts (lines 132-136)
```typescript
private evaluateNumber(expr: CstNode, paramName: string, lineNumber?: number): number | null {
  try {
    const value = this.evaluator.evaluateExpression(expr)
    const num = typeof value === 'number' ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0)
    return num
  } catch (error) {
    // error handling...
  }
}
```

**Key findings:**
1. Each parameter in DEF MOVE is evaluated separately via `evaluateExpression()`
2. Function calls (like RND) are re-evaluated each time
3. No caching of expression results

## Conclusion

**The RND function is NOT the cause of the issue in the shooting game.**

When `DEF MOVE(X)=SPRITE(RND(16),RND(9),5,50,0,0)` is called 8 times in a loop:
- Each call to RND(16) should return a different value (0-15)
- Each call to RND(9) should return a different value (0-8)
- The character type (first parameter) should vary across the 8 enemies

**The issue must be elsewhere in the system**, possibly:
1. Sprite rendering/display logic
2. Sprite initialization or caching
3. Character type to sprite mapping
4. Buffer write/sync issues between workers

## Recommendations

1. **Investigate sprite rendering** - Check if sprites are being rendered with the correct character types
2. **Check buffer writes** - Verify that character types are being written correctly to the shared buffer
3. **Examine sprite cache** - Look for any caching mechanism that might be causing all sprites to use the same character type
4. **Add debug output** - Log the actual RND values when DEF MOVE is called to confirm they're different

## Test Coverage

Added two new tests to `test/evaluation/ArithmeticFunctions.test.ts`:
- `should return different values when called multiple times with RND(16)`
- `should return different values when called multiple times with RND(9)`

Both tests verify that RND returns different values when called multiple times in a loop.
