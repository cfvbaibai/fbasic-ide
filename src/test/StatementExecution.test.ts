/**
 * Statement Execution Tests Suite
 * 
 * Comprehensive tests for BASIC statement execution including:
 * - PRINT statements
 * - LET statements
 * - DATA/READ statements
 * - DIM statements
 * - CLS statements
 * - REM statements
 * - GOSUB/RETURN statements
 * - Variable operations
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices'

describe('Statement Execution Tests', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({ deviceAdapter })
  })

  describe('PRINT Statement', () => {
    it('should print string literals', async () => {
      const result = await interpreter.execute('10 PRINT "Hello World"\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Hello World'])
    })

    it('should print numbers', async () => {
      const result = await interpreter.execute('10 PRINT 42\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['42'])
    })

    it('should print expressions', async () => {
      const result = await interpreter.execute('10 PRINT 5 + 3\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['8'])
    })

    it('should print multiple items', async () => {
      const result = await interpreter.execute('10 PRINT "A", "B", 123\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['A B 123'])
    })

    it('should handle empty PRINT statement', async () => {
      const result = await interpreter.execute('10 PRINT\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual([''])
    })

    it('should print variables', async () => {
      const result = await interpreter.execute('10 LET X = 100\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['100'])
    })

    it('should print string variables', async () => {
      const result = await interpreter.execute('10 LET S$ = "Test"\n20 PRINT S$\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Test'])
    })
  })

  describe('LET Statement', () => {
    it('should assign simple values', async () => {
      const result = await interpreter.execute('10 LET X = 10\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(10)
    })

    it('should assign without LET keyword', async () => {
      const result = await interpreter.execute('10 X = 20\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(20)
    })

    it('should assign string values', async () => {
      const result = await interpreter.execute('10 LET S$ = "Hello"\n20 PRINT S$\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('S$')?.value).toBe('Hello')
    })

    it('should assign expression results', async () => {
      const result = await interpreter.execute('10 LET X = 5 + 3\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(8)
    })

    it('should assign function results', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-5)\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should overwrite existing variables', async () => {
      const result = await interpreter.execute('10 LET X = 10\n20 LET X = 20\n30 PRINT X\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(20)
    })

    it('should handle array assignments', async () => {
      const result = await interpreter.execute('10 DIM A(5)\n20 A(1) = 42\n30 PRINT A(1)\n40 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['42'])
    })
  })

  describe('DATA and READ Statements', () => {
    it('should read data values correctly', async () => {
      const result = await interpreter.execute('10 DATA 1, 2, 3\n20 READ A, B, C\n30 PRINT A, B, C\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('A')?.value).toBe(1)
      expect(result.variables.get('B')?.value).toBe(2)
      expect(result.variables.get('C')?.value).toBe(3)
    })

    it('should read string data', async () => {
      const result = await interpreter.execute('10 DATA "Hello", "World"\n20 READ S$, T$\n30 PRINT S$, T$\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('S$')?.value).toBe('Hello')
      expect(result.variables.get('T$')?.value).toBe('World')
    })

    it('should handle mixed data types', async () => {
      const result = await interpreter.execute('10 DATA 42, "Test", 3.14\n20 READ N, S$, F\n30 PRINT N, S$, F\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('N')?.value).toBe(42)
      expect(result.variables.get('S$')?.value).toBe('Test')
      expect(result.variables.get('F')?.value).toBe(3.14)
    })

    it('should handle RESTORE statement', async () => {
      const result = await interpreter.execute('10 DATA 1, 2, 3\n20 READ A, B\n30 RESTORE\n40 READ C, D\n50 PRINT A, B, C, D\n60 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('A')?.value).toBe(1)
      expect(result.variables.get('B')?.value).toBe(2)
      expect(result.variables.get('C')?.value).toBe(1)
      expect(result.variables.get('D')?.value).toBe(2)
    })

    it('should handle RESTORE with line number', async () => {
      const result = await interpreter.execute('10 DATA 1, 2\n20 DATA 3, 4\n30 READ A\n40 RESTORE 20\n50 READ B\n60 PRINT A, B\n70 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('A')?.value).toBe(1)
      expect(result.variables.get('B')?.value).toBe(3)
    })
  })

  describe('DIM Statement', () => {
    it('should create one-dimensional arrays', async () => {
      const result = await interpreter.execute('10 DIM A(5)\n20 A(1) = 42\n30 PRINT A(1)\n40 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['42'])
    })

    it('should create multiple arrays', async () => {
      const result = await interpreter.execute('10 DIM A(3), B(3)\n20 A(1) = 10\n30 B(1) = 20\n40 PRINT A(1), B(1)\n50 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['10 20'])
    })

    it('should handle array bounds', async () => {
      const result = await interpreter.execute('10 DIM A(2)\n20 A(0) = 1\n30 A(1) = 2\n40 A(2) = 3\n50 PRINT A(0), A(1), A(2)\n60 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['1 2 3'])
    })
  })

  describe('CLS Statement', () => {
    it('should clear the screen output', async () => {
      const result = await interpreter.execute('10 PRINT "Before"\n20 CLS\n30 PRINT "After"\n40 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['After'])
    })
  })

  describe('REM Statement', () => {
    it('should ignore REM statements', async () => {
      const result = await interpreter.execute('10 REM This is a comment\n20 PRINT "Hello"\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Hello'])
    })

    it('should handle REM with single word comment', async () => {
      const result = await interpreter.execute('10 REM Test\n20 PRINT "Hello"\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Hello'])
    })

    it('should handle REM with multiple word comment', async () => {
      const result = await interpreter.execute('10 REM This is a multi word comment\n20 PRINT "Hello"\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Hello'])
    })

    it('should handle REM with special characters', async () => {
      const result = await interpreter.execute('10 REM Comment with !@#$%^&*()\n20 PRINT "Hello"\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Hello'])
    })
  })

  describe('GOSUB and RETURN Statements', () => {
    it('should execute GOSUB and RETURN correctly', async () => {
      const result = await interpreter.execute('10 PRINT "Start"\n20 GOSUB 100\n30 PRINT "End"\n40 END\n100 PRINT "Subroutine"\n110 RETURN')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Start', 'Subroutine', 'End'])
    })

    it('should handle nested GOSUB calls', async () => {
      const result = await interpreter.execute('10 GOSUB 100\n20 END\n100 PRINT "Level 1"\n110 GOSUB 200\n120 RETURN\n200 PRINT "Level 2"\n210 RETURN')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Level 1', 'Level 2'])
    })
  })

  describe('COLOR Statement', () => {
    it('should set foreground color', async () => {
      const result = await interpreter.execute('10 COLOR 1\n20 PRINT "Red text"\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Red text'])
    })

    it('should set background color', async () => {
      const result = await interpreter.execute('10 COLOR 0, 1\n20 PRINT "Blue background"\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Blue background'])
    })
  })

  describe('Variable Operations', () => {
    it('should handle single letter variable names', async () => {
      const result = await interpreter.execute('10 LET A = 1\n20 LET B = 2\n30 PRINT A, B\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('A')?.value).toBe(1)
      expect(result.variables.get('B')?.value).toBe(2)
    })

    it('should handle multi-letter variable names', async () => {
      const result = await interpreter.execute('10 LET COUNT = 10\n20 LET TOTAL = 100\n30 PRINT COUNT, TOTAL\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('COUNT')?.value).toBe(10)
      expect(result.variables.get('TOTAL')?.value).toBe(100)
    })

    it('should handle string variables with $ suffix', async () => {
      const result = await interpreter.execute('10 LET NAME$ = "John"\n20 LET CITY$ = "NYC"\n30 PRINT NAME$, CITY$\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('NAME$')?.value).toBe('John')
      expect(result.variables.get('CITY$')?.value).toBe('NYC')
    })

    it('should maintain variable values across statements', async () => {
      const result = await interpreter.execute('10 LET X = 5\n20 LET Y = X * 2\n30 LET Z = X + Y\n40 PRINT X, Y, Z\n50 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(5)
      expect(result.variables.get('Y')?.value).toBe(10)
      expect(result.variables.get('Z')?.value).toBe(15)
    })

    it('should handle undefined variables gracefully', async () => {
      const result = await interpreter.execute('10 PRINT UNDEFINED\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['0']) // Default value for undefined variables
    })
  })

  describe('Complex Statement Combinations', () => {
    it('should execute multiple statement types', async () => {
      const result = await interpreter.execute('10 REM Program start\n20 CLS\n30 LET X = 10\n40 DATA 1, 2, 3\n50 READ A, B, C\n60 IF X > 5 THEN PRINT "X is greater than 5"\n70 PRINT A, B, C\n80 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['X is greater than 5', '1 2 3'])
    })

    it('should handle statements with function calls', async () => {
      const result = await interpreter.execute('10 LET X = ABS(-5)\n20 LET Y = SQR(16)\n30 PRINT X, Y\n40 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(5)
      expect(result.variables.get('Y')?.value).toBe(4)
    })

    it('should handle nested expressions in statements', async () => {
      const result = await interpreter.execute('10 LET X = (5 + 3) * 2\n20 PRINT X\n30 END')
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(16)
    })
  })

  describe('PAUSE Statement', () => {
    it('should pause execution for specified duration', async () => {
      const startTime = Date.now()
      const result = await interpreter.execute('10 PRINT "Starting pause"\n20 PAUSE 100\n30 PRINT "Pause complete"\n40 END')
      const endTime = Date.now()
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Starting pause', 'Pause complete'])
      // Should have paused for approximately 100ms (allow some tolerance)
      expect(endTime - startTime).toBeGreaterThanOrEqual(90)
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('should handle PAUSE with zero duration', async () => {
      const startTime = Date.now()
      const result = await interpreter.execute('10 PRINT "Zero pause"\n20 PAUSE 0\n30 PRINT "Zero pause complete"\n40 END')
      const endTime = Date.now()
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Zero pause', 'Zero pause complete'])
      // Should complete almost immediately
      expect(endTime - startTime).toBeLessThan(50)
    })

    it('should handle PAUSE with negative duration', async () => {
      const startTime = Date.now()
      const result = await interpreter.execute('10 PRINT "Negative pause"\n20 PAUSE -50\n30 PRINT "Negative pause complete"\n40 END')
      const endTime = Date.now()
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Negative pause', 'Negative pause complete'])
      // Should complete almost immediately (negative duration treated as 0)
      expect(endTime - startTime).toBeLessThan(50)
    })

    it('should handle PAUSE with variable duration', async () => {
      const result = await interpreter.execute('10 LET DURATION = 50\n20 PRINT "Variable pause"\n30 PAUSE DURATION\n40 PRINT "Variable pause complete"\n50 END')
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Variable pause', 'Variable pause complete'])
    })

    it('should handle PAUSE with expression duration', async () => {
      const result = await interpreter.execute('10 LET X = 25\n20 PRINT "Expression pause"\n30 PAUSE X * 2\n40 PRINT "Expression pause complete"\n50 END')
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Expression pause', 'Expression pause complete'])
    })

    it('should handle multiple PAUSE statements', async () => {
      const startTime = Date.now()
      const result = await interpreter.execute('10 PRINT "First pause"\n20 PAUSE 50\n30 PRINT "Second pause"\n40 PAUSE 50\n50 PRINT "Both pauses complete"\n60 END')
      const endTime = Date.now()
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['First pause', 'Second pause', 'Both pauses complete'])
      // Should have paused for approximately 100ms total
      expect(endTime - startTime).toBeGreaterThanOrEqual(90)
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('should handle PAUSE in debug mode', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 PRINT "Debug pause"\n20 PAUSE 10\n30 PRINT "Debug pause complete"\n40 END')
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.debugOutputs).toEqual([
        'Preprocessed 0 data values',
        'Preprocessed 4 statements (flattened statement blocks)',
        'Statement 0: Line 10, Type: PrintStatement',
        'Statement 1: Line 20, Type: PauseStatement',
        'Statement 2: Line 30, Type: PrintStatement',
        'Statement 3: Line 40, Type: EndStatement',
        'Executing statement 0: PrintStatement',
        'PRINT: evaluating expression {"type":"Expression","expression":{"type":"StringLiteral","value":"Debug pause"}} = Debug pause, separator: undefined',
        'PRINT: Debug pause',
        'Moved to next statement: 1',
        'Executing statement 1: PauseStatement',
        'PAUSE: 10ms',
        'Moved to next statement: 2',
        'Executing statement 2: PrintStatement',
        'PRINT: evaluating expression {"type":"Expression","expression":{"type":"StringLiteral","value":"Debug pause complete"}} = Debug pause complete, separator: undefined',
        'PRINT: Debug pause complete',
        'Moved to next statement: 3',
        'Executing statement 3: EndStatement',
        'Moved to next statement: 4'
      ])
      expect(deviceAdapter.printOutputs).toEqual(['Debug pause', 'Debug pause complete'])
    })
  })
})
