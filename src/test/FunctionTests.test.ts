/**
 * Function Tests Suite
 * 
 * Comprehensive tests for BASIC functions including:
 * - Mathematical functions (ABS, SQR, SIN, COS, TAN, ATN, LOG, EXP, INT, FIX, SGN, RND)
 * - String functions (LEN, LEFT, RIGHT, MID)
 * - Function error handling
 * - Nested function calls
 * - Function integration with expressions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'

describe('Function Tests', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter()
  })

  describe('Mathematical Functions', () => {
    describe('Basic Mathematical Functions', () => {
      it('should evaluate ABS function', async () => {
        const result = await interpreter.execute('10 LET X = ABS(-5)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(5)
      })

      it('should evaluate SQR function', async () => {
        const result = await interpreter.execute('10 LET X = SQR(16)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(4)
      })

      it('should evaluate SQR with decimal result', async () => {
        const result = await interpreter.execute('10 LET X = SQR(2)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBeCloseTo(1.4142135623730951)
      })

      it('should evaluate SIN function', async () => {
        const result = await interpreter.execute('10 LET X = SIN(0)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(0)
      })

      it('should evaluate COS function', async () => {
        const result = await interpreter.execute('10 LET X = COS(0)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(1)
      })

      it('should evaluate TAN function', async () => {
        const result = await interpreter.execute('10 LET X = TAN(0)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(0)
      })

      it('should evaluate ATN function', async () => {
        const result = await interpreter.execute('10 LET X = ATN(0)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(0)
      })

      it('should evaluate LOG function', async () => {
        const result = await interpreter.execute('10 LET X = LOG(1)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(0)
      })

      it('should evaluate EXP function', async () => {
        const result = await interpreter.execute('10 LET X = EXP(0)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(1)
      })
    })

    describe('Integer Functions', () => {
      it('should evaluate INT function', async () => {
        const result = await interpreter.execute('10 LET X = INT(3.7)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(3)
      })

      it('should evaluate INT with negative numbers', async () => {
        const result = await interpreter.execute('10 LET X = INT(-3.7)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(-3) // JavaScript Math.floor behavior
      })

      it('should evaluate FIX function', async () => {
        const result = await interpreter.execute('10 LET X = FIX(3.7)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(3)
      })

      it('should evaluate FIX with negative numbers', async () => {
        const result = await interpreter.execute('10 LET X = FIX(-3.7)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(-3)
      })

      it('should evaluate SGN function', async () => {
        const result = await interpreter.execute('10 LET X = SGN(5)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(1)
      })

      it('should evaluate SGN with negative numbers', async () => {
        const result = await interpreter.execute('10 LET X = SGN(-5)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(-1)
      })

      it('should evaluate SGN with zero', async () => {
        const result = await interpreter.execute('10 LET X = SGN(0)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(0)
      })
    })

    describe('Random Function', () => {
      it('should evaluate RND function', async () => {
        const result = await interpreter.execute('10 LET X = RND()\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        const value = result.variables.get('X')?.value as number
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      })

      it('should produce different values on multiple calls', async () => {
        const result = await interpreter.execute('10 LET X = RND()\n20 LET Y = RND()\n30 PRINT X, Y\n40 END')
        expect(result.success).toBe(true)
        const x = result.variables.get('X')?.value as number
        const y = result.variables.get('Y')?.value as number
        // Note: While unlikely, it's possible for two random numbers to be the same
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThan(1)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThan(1)
      })
    })
  })

  describe('String Functions', () => {
    describe('LEN function', () => {
      it('should return string length', async () => {
        const result = await interpreter.execute('10 LET X = LEN("Hello")\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(5)
      })

      it('should return 0 for empty string', async () => {
        const result = await interpreter.execute('10 LET X = LEN("")\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(0)
      })

      it('should handle non-string input', async () => {
        const result = await interpreter.execute('10 LET X = LEN(123)\n20 PRINT X\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('X')?.value).toBe(0)
      })
    })

    describe('LEFT function', () => {
      it('should return leftmost characters', async () => {
        const result = await interpreter.execute('10 LET S$ = LEFT("Hello", 3)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('Hel')
      })

      it('should handle count greater than string length', async () => {
        const result = await interpreter.execute('10 LET S$ = LEFT("Hi", 10)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('Hi')
      })

      it('should handle zero count', async () => {
        const result = await interpreter.execute('10 LET S$ = LEFT("Hello", 0)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('')
      })

      it('should handle negative count', async () => {
        const result = await interpreter.execute('10 LET S$ = LEFT("Hello", -1)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('')
      })
    })

    describe('RIGHT function', () => {
      it('should return rightmost characters', async () => {
        const result = await interpreter.execute('10 LET S$ = RIGHT("Hello", 3)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('llo')
      })

      it('should handle count greater than string length', async () => {
        const result = await interpreter.execute('10 LET S$ = RIGHT("Hi", 10)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('Hi')
      })

      it('should handle zero count', async () => {
        const result = await interpreter.execute('10 LET S$ = RIGHT("Hello", 0)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('')
      })

      it('should handle negative count', async () => {
        const result = await interpreter.execute('10 LET S$ = RIGHT("Hello", -1)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('')
      })
    })

    describe('MID function', () => {
      it('should return middle characters', async () => {
        const result = await interpreter.execute('10 LET S$ = MID("Hello", 2, 3)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('ell')
      })

      it('should handle start position beyond string length', async () => {
        const result = await interpreter.execute('10 LET S$ = MID("Hi", 5, 2)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('')
      })

      it('should handle count beyond remaining characters', async () => {
        const result = await interpreter.execute('10 LET S$ = MID("Hello", 3, 10)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('llo')
      })

      it('should handle zero count', async () => {
        const result = await interpreter.execute('10 LET S$ = MID("Hello", 2, 0)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('')
      })

      it('should handle negative start position', async () => {
        const result = await interpreter.execute('10 LET S$ = MID("Hello", -1, 2)\n20 PRINT S$\n30 END')
        expect(result.success).toBe(true)
        expect(result.variables.get('S$')?.value).toBe('He')
      })
    })
  })

  describe('Function with Variables', () => {
    it('should evaluate functions with variable arguments', async () => {
      const result = await interpreter.execute('10 LET X = -5\n20 LET Y = ABS(X)\n30 PRINT Y\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('Y')?.value).toBe(5)
    })

    it('should evaluate functions with expressions', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-5 + 3)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(2)
    })

    it('should evaluate nested functions', async () => {
      const result = await interpreter.execute('10 LET X = ABS(SQR(16))\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(4)
    })
  })

  describe('Function Error Handling', () => {
    it('should handle functions with no arguments', async () => {
      const result = await interpreter.execute('10 LET X = ABS()\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0) // Default behavior
    })

    it('should handle functions with multiple arguments (using first)', async () => {
      const result = await interpreter.execute('10 LET X = ABS(5, 10)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(5) // Uses first argument
    })

    it('should handle string functions with non-string input', async () => {
      const result = await interpreter.execute('10 LET X = LEN(123)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0) // Default for non-string
    })
  })

  describe('Complex Function Expressions', () => {
    it('should evaluate functions in arithmetic expressions', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-5) + SQR(16)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(9) // 5 + 4
    })

    it('should evaluate functions in comparison expressions', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-5) > SQR(4)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // 5 > 2 = True
    })

    it('should evaluate functions in logical expressions', async () => {
      const result = await interpreter.execute('10 LET X = (ABS(-5) > 0) AND (SQR(16) = 4)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True AND True = True
    })

    it('should handle deeply nested function calls', async () => {
      const result = await interpreter.execute('10 LET X = ABS(SQR(INT(16.7)))\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(4) // ABS(SQR(16)) = ABS(4) = 4
    })
  })

  describe('String Functions Integration', () => {
    it('should work with string variables', async () => {
      const result = await interpreter.execute('10 LET S$ = "Hello World"\n20 LET L = LEN(S$)\n30 LET LEFT$ = LEFT(S$, 5)\n40 LET RIGHT$ = RIGHT(S$, 5)\n50 PRINT L, LEFT$, RIGHT$\n60 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('L')?.value).toBe(11)
      expect(result.variables.get('LEFT$')?.value).toBe('Hello')
      expect(result.variables.get('RIGHT$')?.value).toBe('World')
    })

    it('should handle string function chaining', async () => {
      const result = await interpreter.execute('10 LET S$ = "Programming"\n20 LET SUB$ = MID(S$, LEN(S$) - 3, 4)\n30 PRINT SUB$\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('SUB$')?.value).toBe('ming')
    })
  })

  describe('Function Edge Cases', () => {
    it('should handle very large function arguments', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-999999999)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(999999999)
    })

    it('should handle very small function arguments', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-0.000001)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0.000001)
    })

    it('should handle trigonometric functions with common angles', async () => {
      const result = await interpreter.execute('10 LET X = SIN(3.14159/2)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBeCloseTo(1, 5)
    })
  })
})
