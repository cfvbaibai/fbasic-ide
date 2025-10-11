/**
 * Expression Evaluation Tests Suite
 * 
 * Comprehensive tests for BASIC expression evaluation including:
 * - Arithmetic expressions
 * - String operations
 * - Comparison expressions
 * - Logical expressions
 * - Unary expressions
 * - Variable references
 * - Nested expressions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'

describe('Expression Evaluation Tests', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter()
  })

  describe('Arithmetic Expressions', () => {
    it('should evaluate addition', async () => {
      const result = await interpreter.execute('10 LET X = 5 + 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(8)
    })

    it('should evaluate subtraction', async () => {
      const result = await interpreter.execute('10 LET X = 10 - 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(7)
    })

    it('should evaluate multiplication', async () => {
      const result = await interpreter.execute('10 LET X = 4 * 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(20)
    })

    it('should evaluate division', async () => {
      const result = await interpreter.execute('10 LET X = 15 / 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should handle division by zero', async () => {
      const result = await interpreter.execute('10 LET X = 5 / 0\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0)
    })

    it('should evaluate exponentiation', async () => {
      const result = await interpreter.execute('10 LET X = 2 ^ 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(8)
    })

    it('should evaluate MOD operation', async () => {
      const result = await interpreter.execute('10 LET X = 7 MOD 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1)
    })

    it('should evaluate complex arithmetic expressions', async () => {
      const result = await interpreter.execute('10 LET X = (5 + 3) * 2 - 1\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(15)
    })

    it('should handle operator precedence', async () => {
      const result = await interpreter.execute('10 LET X = 2 + 3 * 4\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(14)
    })
  })

  describe('String Operations', () => {
    it('should concatenate strings', async () => {
      const result = await interpreter.execute('10 LET S$ = "Hello" + "World"\n20 PRINT S$\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('S$')?.value).toBe('HelloWorld')
    })

    it('should concatenate string and number', async () => {
      const result = await interpreter.execute('10 LET S$ = "Number: " + 42\n20 PRINT S$\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('S$')?.value).toBe('Number: 42')
    })

    it('should handle empty strings', async () => {
      const result = await interpreter.execute('10 LET S$ = "" + "Test"\n20 PRINT S$\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('S$')?.value).toBe('Test')
    })

    it('should handle multiple string concatenations', async () => {
      const result = await interpreter.execute('10 LET S$ = "A" + "B" + "C"\n20 PRINT S$\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('S$')?.value).toBe('ABC')
    })
  })

  describe('Comparison Expressions', () => {
    it('should evaluate equality', async () => {
      const result = await interpreter.execute('10 LET X = 5 = 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate inequality', async () => {
      const result = await interpreter.execute('10 LET X = 5 <> 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate less than', async () => {
      const result = await interpreter.execute('10 LET X = 3 < 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate greater than', async () => {
      const result = await interpreter.execute('10 LET X = 7 > 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate less than or equal', async () => {
      const result = await interpreter.execute('10 LET X = 5 <= 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate greater than or equal', async () => {
      const result = await interpreter.execute('10 LET X = 5 >= 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate false comparisons', async () => {
      const result = await interpreter.execute('10 LET X = 5 = 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0) // False
    })

    it('should handle string comparisons', async () => {
      const result = await interpreter.execute('10 LET X = "A" = "A"\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })
  })

  describe('Logical Expressions', () => {
    it('should evaluate AND operation', async () => {
      const result = await interpreter.execute('10 LET X = 1 AND 1\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate OR operation', async () => {
      const result = await interpreter.execute('10 LET X = 0 OR 1\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate complex logical expressions', async () => {
      const result = await interpreter.execute('10 LET X = (1 AND 0) OR (0 AND 1)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0) // False
    })

    it('should handle logical precedence', async () => {
      const result = await interpreter.execute('10 LET X = 1 AND 0 OR 1\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })
  })

  describe('Unary Expressions', () => {
    it('should evaluate negative numbers', async () => {
      const result = await interpreter.execute('10 LET X = -5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(-5)
    })

    it('should evaluate NOT operation', async () => {
      const result = await interpreter.execute('10 LET X = NOT 0\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(1) // True
    })

    it('should evaluate NOT with non-zero', async () => {
      const result = await interpreter.execute('10 LET X = NOT 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0) // False
    })

    it('should handle double negation', async () => {
      const result = await interpreter.execute('10 LET X = --5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(5)
    })
  })

  describe('Variable References', () => {
    it('should evaluate variables in expressions', async () => {
      const result = await interpreter.execute('10 LET A = 5\n20 LET B = A + 3\n30 PRINT B\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('B')?.value).toBe(8)
    })

    it('should handle undefined variables', async () => {
      const result = await interpreter.execute('10 LET X = UNDEFINED + 5\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(5) // 0 + 5
    })

    it('should evaluate complex variable expressions', async () => {
      const result = await interpreter.execute('10 LET A = 2\n20 LET B = 3\n30 LET C = A * B + A\n40 PRINT C\n50 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('C')?.value).toBe(8) // 2 * 3 + 2
    })

    it('should handle array variable references', async () => {
      const result = await interpreter.execute('10 DIM A(3)\n20 A(1) = 10\n30 LET X = A(1) * 2\n40 PRINT X\n50 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(20)
    })
  })

  describe('Nested Expressions', () => {
    it('should evaluate deeply nested expressions', async () => {
      const result = await interpreter.execute('10 LET X = ((5 + 3) * 2) - (4 / 2)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(14) // (8 * 2) - 2
    })

    it('should handle mixed type expressions', async () => {
      const result = await interpreter.execute('10 LET X = 5 + "3"\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe('53') // String concatenation
    })

    it('should evaluate function calls in expressions', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-5) + SQR(16)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(9) // 5 + 4
    })

    it('should handle parentheses precedence', async () => {
      const result = await interpreter.execute('10 LET X = 2 + (3 * 4)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(14)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', async () => {
      const result = await interpreter.execute('10 LET X = 999999999\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(999999999)
    })

    it('should handle very small numbers', async () => {
      const result = await interpreter.execute('10 LET X = 0.000001\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(0.000001)
    })

    it('should handle decimal arithmetic', async () => {
      const result = await interpreter.execute('10 LET X = 3.14 + 2.86\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(6)
    })

    it('should handle floating point precision', async () => {
      const result = await interpreter.execute('10 LET X = 0.1 + 0.2\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      // Note: This might not be exactly 0.3 due to floating point precision
      expect(result.variables.get('X')?.value).toBeCloseTo(0.3)
    })
  })

  describe('Expression Error Handling', () => {
    it('should handle invalid operators gracefully', async () => {
      const result = await interpreter.execute('10 LET X = 5 @ 3\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle unmatched parentheses', async () => {
      const result = await interpreter.execute('10 LET X = (5 + 3\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle malformed expressions', async () => {
      const result = await interpreter.execute('10 LET X = + + 5\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
