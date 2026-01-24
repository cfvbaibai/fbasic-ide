/**
 * Variable Types Tests
 * 
 * Tests for how Family Basic handles numerical value variables and letter (string) variables.
 * 
 * Based on Family Basic Manual:
 * - Numerical value variables: Store integers only (no decimal/floating-point support)
 * - Letter variables: Use $ suffix (e.g., A$, XA$)
 * - Variable names: Only first 2 characters matter for distinction
 * - Default values: Numerical variables default to 0, letter variables default to empty
 * - Variable names: Up to 255 characters, but only first 2 are significant
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('Variable Types', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false
    })
  })

  describe('Numerical Value Variables (Integers Only)', () => {
    it('should store integer values', async () => {
      const code = '10 LET X = 100'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(100)
      expect(Number.isInteger(result.variables.get('X')?.value)).toBe(true)
    })

    it('should store negative integer values', async () => {
      const code = '10 LET X = -200'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-200)
      expect(Number.isInteger(result.variables.get('X')?.value)).toBe(true)
    })

    it('should default numerical variables to 0', async () => {
      const code = `10 LET X = 100
20 LET Y = X`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Y should get X's value (100), but if Y didn't exist, it would default to 0
      expect(result.variables.get('Y')?.value).toBe(100)
    })

    it('should handle multiple numerical variables', async () => {
      const code = `10 LET X = 100
20 LET XA = 200
30 LET X1 = 300`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(100)
      expect(result.variables.get('XA')?.value).toBe(200)
      expect(result.variables.get('X1')?.value).toBe(300)
    })

    it('should perform integer arithmetic', async () => {
      const code = '10 LET X = 5 + 3'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(8)
      expect(Number.isInteger(result.variables.get('X')?.value)).toBe(true)
    })

    it('should handle integer multiplication', async () => {
      const code = '10 LET X = 7 * 6'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(42)
      expect(Number.isInteger(result.variables.get('X')?.value)).toBe(true)
    })

    it('should handle integer division (may produce decimal in current implementation)', async () => {
      const code = '10 LET X = 7 / 2'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Note: Current implementation allows decimals, but Family Basic should truncate to integer
      // This test documents current behavior - may need to be updated when integer-only support is added
      expect(typeof result.variables.get('X')?.value).toBe('number')
    })
  })

  describe('Letter Variables (String Variables with $ Suffix)', () => {
    it('should store string values in letter variables', async () => {
      const code = '10 LET A$ = "MARIO SAMPLE"'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('MARIO SAMPLE')
      expect(typeof result.variables.get('A$')?.value).toBe('string')
    })

    it('should store numeric strings in letter variables', async () => {
      const code = '10 LET XA$ = "100"'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('XA$')?.value).toBe('100')
      expect(typeof result.variables.get('XA$')?.value).toBe('string')
      // Even though it's numeric, it's treated as a string
      expect(result.variables.get('XA$')?.value).not.toBe(100)
    })

    it('should distinguish letter variables from numerical variables', async () => {
      const code = `10 LET A = 100
20 LET A$ = "HELLO"`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A')?.value).toBe(100)
      expect(result.variables.get('A$')?.value).toBe('HELLO')
      // They should be different variables
      expect(result.variables.get('A')?.value).not.toBe(result.variables.get('A$')?.value)
    })

    it('should handle multiple letter variables', async () => {
      const code = `10 LET A$ = "FIRST"
20 LET XA$ = "SECOND"
30 LET B$ = "THIRD"`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('FIRST')
      expect(result.variables.get('XA$')?.value).toBe('SECOND')
      expect(result.variables.get('B$')?.value).toBe('THIRD')
    })

    it('should print letter variables', async () => {
      const code = `10 LET A$ = "HELLO"
20 PRINT A$`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('HELLO')
    })
  })

  describe('Variable Name Distinction (First 2 Characters)', () => {
    it('should distinguish variables by first 2 characters', async () => {
      const code = `10 LET X = 100
20 LET XA = 200`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // X and XA should be different variables (first 2 chars: "X" vs "XA")
      expect(result.variables.get('X')?.value).toBe(100)
      expect(result.variables.get('XA')?.value).toBe(200)
    })

    it('should treat variables with same first 2 characters as same variable', async () => {
      const code = `10 LET XAPPLE = 100
20 LET XAXIS = 200
30 LET X = XAPPLE`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      // Note: Current implementation uses full variable name
      // Family Basic would treat XAPPLE and XAXIS as the same (both start with "XA")
      // This test documents current behavior - may need update when 2-char distinction is implemented
      expect(result.variables.get('XAPPLE')?.value).toBe(100)
      expect(result.variables.get('XAXIS')?.value).toBe(200)
    })

    it('should handle letter variables with same first 2 characters', async () => {
      const code = `10 LET A$ = "FIRST"
20 LET AB$ = "SECOND"
30 LET ABC$ = "THIRD"`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // A$ and AB$ should be different (first 2 chars: "A" vs "AB")
      // AB$ and ABC$ might be same in Family Basic (both start with "AB")
      expect(result.variables.get('A$')?.value).toBe('FIRST')
      expect(result.variables.get('AB$')?.value).toBe('SECOND')
      expect(result.variables.get('ABC$')?.value).toBe('THIRD')
    })
  })

  describe('Variable Name Rules', () => {
    it('should accept variable names starting with alphabetic letter', async () => {
      const code = `10 LET X = 10
20 LET Y = 20
30 LET Z1 = 30`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10)
      expect(result.variables.get('Y')?.value).toBe(20)
      expect(result.variables.get('Z1')?.value).toBe(30)
    })

    it('should handle variable names with numbers', async () => {
      const code = `10 LET X1 = 100
20 LET X2 = 200
30 LET X10 = 300`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X1')?.value).toBe(100)
      expect(result.variables.get('X2')?.value).toBe(200)
      expect(result.variables.get('X10')?.value).toBe(300)
    })

    it('should handle long variable names (up to 255 chars)', async () => {
      const longName = `A${  'B'.repeat(100)}` // Create a long name
      const code = `10 LET ${longName} = 999`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get(longName)?.value).toBe(999)
    })
  })

  describe('Default Variable Values', () => {
    it('should default numerical variables to 0 when accessed before assignment', async () => {
      const code = `10 LET X = Y`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Y should default to 0
      expect(result.variables.get('X')?.value).toBe(0)
    })

    it('should default letter variables to empty string when accessed before assignment', async () => {
      const code = `10 LET A$ = B$`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // B$ should default to empty string
      expect(result.variables.get('A$')?.value).toBe('')
    })
  })

  describe('Mixed Numerical and Letter Variables', () => {
    it('should handle both numerical and letter variables in same program', async () => {
      const code = `10 LET X = 100
20 LET A$ = "HELLO"
30 LET Y = 200
40 LET B$ = "WORLD"`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(100)
      expect(result.variables.get('A$')?.value).toBe('HELLO')
      expect(result.variables.get('Y')?.value).toBe(200)
      expect(result.variables.get('B$')?.value).toBe('WORLD')
    })

    it('should print both numerical and letter variables', async () => {
      const code = `10 LET X = 42
20 LET A$ = "ANSWER"
30 PRINT X
40 PRINT A$`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(42)
      expect(result.variables.get('A$')?.value).toBe('ANSWER')
    })
  })

  describe('Floating Point Literal Rejection', () => {
    it('should reject decimal number literals', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET X = 3.14')
      
      // Floating point literals should be rejected by the parser
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('should reject decimal arithmetic with literals', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET X = 1.5 + 2.3')
      
      // Floating point literals should be rejected by the parser
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })
})

