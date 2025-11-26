/**
 * String Functions Tests
 * 
 * Tests for Family Basic string operation functions:
 * - LEN(string) - returns the length of a string
 * - LEFT$(string, n) - returns leftmost n characters
 * - RIGHT$(string, n) - returns rightmost n characters
 * - MID$(string, start, length) - returns substring starting at position start with length characters
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('String Functions', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false
    })
  })

  describe('LEN function', () => {
    it('should return the length of a string literal', async () => {
      const code = '10 LET X = LEN("Hello")'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should return the length of an empty string', async () => {
      const code = '10 LET X = LEN("")'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(0)
    })

    it('should return the length of a string variable', async () => {
      const code = `10 LET A$ = "World"
20 LET X = LEN(A$)`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should return 0 for uninitialized string variable', async () => {
      const code = '10 LET X = LEN(B$)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(0)
    })

    it('should handle LEN in expressions', async () => {
      const code = '10 LET X = LEN("Hello") + LEN("World")'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10)
    })
  })

  describe('LEFT$ function', () => {
    it('should return leftmost n characters from a string literal', async () => {
      const code = '10 LET A$ = LEFT$("Hello World", 5)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('Hello')
    })

    it('should return entire string if n is greater than string length', async () => {
      const code = '10 LET A$ = LEFT$("Hi", 10)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('Hi')
    })

    it('should return empty string if n is 0', async () => {
      const code = '10 LET A$ = LEFT$("Hello", 0)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('')
    })

    it('should return empty string if n is negative', async () => {
      const code = '10 LET A$ = LEFT$("Hello", -1)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('')
    })

    it('should work with string variables', async () => {
      const code = `10 LET TEXT$ = "Family Basic"
20 LET A$ = LEFT$(TEXT$, 6)`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('Family')
    })

    it('should reject floating point literals', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET A$ = LEFT$("Hello", 3.7)')
      
      // Floating point literals should be rejected by the parser
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })

  describe('RIGHT$ function', () => {
    it('should return rightmost n characters from a string literal', async () => {
      const code = '10 LET A$ = RIGHT$("Hello World", 5)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('World')
    })

    it('should return entire string if n is greater than string length', async () => {
      const code = '10 LET A$ = RIGHT$("Hi", 10)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('Hi')
    })

    it('should return empty string if n is 0', async () => {
      const code = '10 LET A$ = RIGHT$("Hello", 0)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('')
    })

    it('should return empty string if n is negative', async () => {
      const code = '10 LET A$ = RIGHT$("Hello", -1)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('')
    })

    it('should work with string variables', async () => {
      const code = `10 LET TEXT$ = "Family Basic"
20 LET A$ = RIGHT$(TEXT$, 5)`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('Basic')
    })

    it('should handle single character', async () => {
      const code = '10 LET A$ = RIGHT$("Hello", 1)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('o')
    })
  })

  describe('MID$ function', () => {
    it('should return substring starting at position with specified length', async () => {
      const code = '10 LET A$ = MID$("Hello World", 7, 5)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('World')
    })

    it('should use 1-based indexing', async () => {
      const code = '10 LET A$ = MID$("Hello", 1, 2)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('He')
    })

    it('should return empty string if start is beyond string length', async () => {
      const code = '10 LET A$ = MID$("Hello", 10, 5)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('')
    })

    it('should return empty string if length is 0 or negative', async () => {
      const code = '10 LET A$ = MID$("Hello", 1, 0)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('')
    })

    it('should truncate if length exceeds remaining characters', async () => {
      const code = '10 LET A$ = MID$("Hello", 3, 10)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('llo')
    })

    it('should work with string variables', async () => {
      const code = `10 LET TEXT$ = "Family Basic IDE"
20 LET A$ = MID$(TEXT$, 8, 5)`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // "Family Basic IDE" - position 8 is 'B', so MID$(TEXT$, 8, 5) = "Basic"
      expect(result.variables.get('A$')?.value).toBe('Basic')
    })

    it('should return empty string for start position 0 or negative', async () => {
      const code = '10 LET A$ = MID$("Hello", 0, 2)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Start position 0 or negative is invalid in BASIC - should return empty string
      expect(result.variables.get('A$')?.value).toBe('')
    })

    it('should return empty string for negative start position', async () => {
      const code = '10 LET A$ = MID$("Hello", -1, 2)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Negative start position is invalid - should return empty string
      expect(result.variables.get('A$')?.value).toBe('')
    })
  })

  describe('Combined string functions', () => {
    it('should combine LEN and LEFT$', async () => {
      const code = `10 LET TEXT$ = "Hello World"
20 LET HALF = LEN(TEXT$) / 2
30 LET A$ = LEFT$(TEXT$, HALF)`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('A$')?.value).toBe('Hello')
    })

    it('should use string functions in PRINT statements', async () => {
      const code = `10 LET TEXT$ = "Hello"
20 PRINT LEN(TEXT$)
30 PRINT LEFT$(TEXT$, 2)
40 PRINT RIGHT$(TEXT$, 2)
50 PRINT MID$(TEXT$, 2, 3)`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should nest string functions', async () => {
      const code = `10 LET TEXT$ = "Hello World"
20 LET A$ = LEFT$(RIGHT$(TEXT$, 5), 2)`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // RIGHT$("Hello World", 5) = "World", LEFT$("World", 2) = "Wo"
      expect(result.variables.get('A$')?.value).toBe('Wo')
    })
  })
})

