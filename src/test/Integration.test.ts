/**
 * Integration Tests Suite
 * 
 * Comprehensive integration tests including:
 * - Complex multi-line programs
 * - Sample code validation
 * - Debug mode functionality
 * - Parser and interpreter integration
 * - Real-world program scenarios
 * - Performance and stress tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'
import { FBasicParser } from '../core/parser/FBasicParser'

describe('Integration Tests', () => {
  let interpreter: BasicInterpreter
  let parser: FBasicParser

  beforeEach(() => {
    interpreter = new BasicInterpreter()
    parser = new FBasicParser()
  })

  describe('Complex Multi-line Programs', () => {
    it('should handle mathematical programs', async () => {
      const code = `10 REM Calculate factorial
20 LET N = 5
30 LET FACT = 1
40 FOR I = 1 TO N
50   FACT = FACT * I
60 NEXT I
70 PRINT "Factorial of"; N; "is"; FACT
80 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Factorial of5is120')
    })

    it('should handle text processing programs', async () => {
      const code = `10 REM Text processing demo
20 LET TEXT$ = "Hello World"
30 LET LEN_TEXT = LEN(TEXT$)
40 PRINT "Length of '"; TEXT$; "' is"; LEN_TEXT
50 LET LEFT_PART$ = LEFT(TEXT$, 5)
60 LET RIGHT_PART$ = RIGHT(TEXT$, 5)
70 PRINT "Left part: '"; LEFT_PART$; "'"
80 PRINT "Right part: '"; RIGHT_PART$; "'"
90 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Length of \'Hello World\' is11')
      expect(result.output).toContain('Left part: \'Hello\'')
      expect(result.output).toContain('Right part: \'World\'')
    })

    it('should handle game-like programs', async () => {
      const code = `10 REM Number guessing game simulation
20 LET SECRET = 7
30 LET GUESS = 5
40 IF GUESS < SECRET THEN PRINT "Too low"
50 IF GUESS > SECRET THEN PRINT "Too high"
60 IF GUESS = SECRET THEN PRINT "Correct!"
70 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Too low')
    })

    it('should handle data processing programs', async () => {
      const code = `10 REM Calculate statistics
20 DATA 10, 20, 30, 40, 50
30 LET SUM = 0
40 LET COUNT = 0
50 READ VALUE
60 SUM = SUM + VALUE
70 COUNT = COUNT + 1
80 IF COUNT < 5 THEN GOTO 50
90 LET AVERAGE = SUM / COUNT
100 PRINT "Sum:"; SUM; "Average:"; AVERAGE
110 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Sum:150Average:30')
    })

    it('should handle interactive programs', async () => {
      const code = `10 REM Menu system simulation
20 PRINT "1. Option A"
30 PRINT "2. Option B"
40 PRINT "3. Exit"
50 LET CHOICE = 2
60 IF CHOICE = 1 THEN GOSUB 100
70 IF CHOICE = 2 THEN GOSUB 200
80 IF CHOICE = 3 THEN GOTO 300
90 GOTO 300
100 PRINT "Selected Option A"
110 RETURN
200 PRINT "Selected Option B"
210 RETURN
300 PRINT "Goodbye"
310 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Selected Option B')
      expect(result.output).toContain('Goodbye')
    })

    it('should handle nested loops with conditions', async () => {
      const code = `10 REM Nested loops demo
20 FOR I = 1 TO 3
30   FOR J = 1 TO 2
40     IF I MOD 2 = 1 THEN PRINT "Odd row:"; I; "Col:"; J
50   NEXT J
60 NEXT I
70 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Odd row:1Col:1')
      expect(result.output).toContain('Odd row:1Col:2')
      expect(result.output).toContain('Odd row:3Col:1')
      expect(result.output).toContain('Odd row:3Col:2')
    })

    it('should handle large loops efficiently', async () => {
      const code = `10 REM Performance test
20 LET SUM = 0
30 FOR I = 1 TO 1000
40   SUM = SUM + I
50 NEXT I
60 PRINT "Sum of 1 to 1000:"; SUM
70 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Sum of 1 to 1000: 500500')
    })
  })

  describe('Sample Code Validation', () => {
    const sampleCodes = {
      basic: `10 REM Basic F-Basic Program
20 PRINT "Hello, World!"
30 LET X = 10
40 PRINT "X ="; X
50 END`,
      
      gaming: `10 REM F-Basic Gaming Demo
20 CLS
30 PRINT "Gaming demo completed!"
40 END`,
      
      complex: `10 REM Complex F-Basic Program
20 PRINT "Complex F-Basic Demo"
30 PRINT
40 FOR I = 1 TO 10
50   IF I MOD 2 = 0 THEN PRINT "Even:"; I
60   IF I MOD 2 = 1 THEN PRINT "Odd:"; I
70 NEXT I
80 PRINT
90 LET SUM = 0
100 FOR J = 1 TO 100
110   SUM = SUM + J
120 NEXT J
130 PRINT "Sum of 1 to 100 ="; SUM
140 PRINT
150 PRINT "String functions demo:"
160 LET TEXT$ = "Hello World"
170 PRINT "Length of '"; TEXT$; "' ="; LEN(TEXT$)`,
      
      comprehensive: `10 REM F-Basic Comprehensive Demo
20 CLS
30 PRINT "Comprehensive demo completed!"
40 END`
    }

    it('should parse all sample codes without syntax errors', async () => {
      for (const [name, code] of Object.entries(sampleCodes)) {
        const result = await parser.parse(code)
        expect(result.success).toBe(true)
      }
    })

    it('should execute all sample codes successfully', async () => {
      for (const [name, code] of Object.entries(sampleCodes)) {
        const result = await interpreter.execute(code)
        expect(result.success).toBe(true)
        expect(result.errors).toHaveLength(0)
      }
    })

    it('should handle basic sample correctly', async () => {
      const result = await interpreter.execute(sampleCodes.basic)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Hello, World!')
      expect(result.output).toContain('X =10')
    })

    it('should handle complex sample correctly', async () => {
      const result = await interpreter.execute(sampleCodes.complex)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Complex F-Basic Demo')
      expect(result.output).toContain('Even:2')
      expect(result.output).toContain('Odd:1')
      expect(result.output).toContain('Sum of 1 to 100 =5050')
      expect(result.output).toContain('Length of \'Hello World\' = 11')
    })

    it('should clear screen at start', async () => {
      const result = await interpreter.execute(sampleCodes.comprehensive)
      const outputLines = result.output.split('\n').filter(line => line.trim() !== '')
      expect(outputLines).toEqual(['Comprehensive demo completed!'])
    })
  })

  describe('Debug Mode Integration', () => {
    it('should provide detailed execution trace', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 PRINT "Hello"\n20 LET X = 5\n30 END')
      expect(result.success).toBe(true)
      expect(result.debugOutput).toBeDefined()
      expect(result.debugOutput).toContain('PRINT: Outputting "Hello"')
      expect(result.debugOutput).toContain('LET: X = 5')
    })

    it('should show conditional execution in IF statements', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 IF 5 > 3 THEN PRINT "True"\n20 END')
      expect(result.success).toBe(true)
      expect(result.debugOutput).toContain('IF: Condition is true, executing THEN statement')
      expect(result.debugOutput).toContain('PRINT: True')
    })

    it('should show GOTO execution details', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 PRINT "Before"\n20 GOTO 40\n30 PRINT "Skipped"\n40 PRINT "After"\n50 END')
      expect(result.success).toBe(true)
      expect(result.debugOutput).toContain('GOTO: Jumping to line 40')
    })

    it('should show DATA and READ operations', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 DATA 1, 2, 3\n20 READ A, B, C\n30 PRINT A, B, C\n40 END')
      expect(result.success).toBe(true)
      expect(result.debugOutput).toContain('READ: Reading 3 variables from DATA')
      expect(result.debugOutput).toContain('READ: Reading value 1 from DATA')
    })

    it('should not include debug output when debug mode is disabled', async () => {
      interpreter.updateConfig({ enableDebugMode: false })
      const result = await interpreter.execute('10 PRINT "Hello"\n20 END')
      expect(result.success).toBe(true)
      expect(result.debugOutput).toBeUndefined()
    })

    it('should allow enabling debug mode via updateConfig', async () => {
      const result1 = await interpreter.execute('10 PRINT "Hello"\n20 END')
      expect(result1.debugOutput).toBeUndefined()
      
      interpreter.updateConfig({ enableDebugMode: true })
      const result2 = await interpreter.execute('10 PRINT "Hello"\n20 END')
      expect(result2.debugOutput).toBeDefined()
      expect(result2.debugOutput).toContain('PRINT: Outputting "Hello"')
    })

    it('should have consistent debug message format', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 PRINT "Test"\n20 LET X = 5\n30 END')
      const debugLines = result.debugOutput.split('\n').filter(line => line.trim() !== '')
      expect(debugLines.length).toBeGreaterThan(0)
      // All debug messages should follow a consistent format
      debugLines.forEach(line => {
        expect(line).toMatch(/^\[DEBUG\]/)
      })
    })
  })

  describe('Parser and Interpreter Integration', () => {
    it('should handle complete parse-execute cycle', async () => {
      const code = '10 PRINT "Integration Test"\n20 END'
      
      // Parse
      const parseResult = await parser.parse(code)
      expect(parseResult.success).toBe(true)
      
      // Execute
      const executeResult = await interpreter.execute(code)
      expect(executeResult.success).toBe(true)
      expect(executeResult.output).toContain('Integration Test')
    })

    it('should handle parser errors gracefully', async () => {
      const code = '10 INVALID STATEMENT\n20 END'
      
      const parseResult = await parser.parse(code)
      expect(parseResult.success).toBe(false)
      
      const executeResult = await interpreter.execute(code)
      expect(executeResult.success).toBe(false)
    })

    it('should maintain consistency between parser and interpreter', async () => {
      const code = '10 LET X = 5 + 3\n20 PRINT X\n30 END'
      
      const parseResult = await parser.parse(code)
      expect(parseResult.success).toBe(true)
      
      const executeResult = await interpreter.execute(code)
      expect(executeResult.success).toBe(true)
      expect(executeResult.variables.get('X')?.value).toBe(8)
    })
  })

  describe('Real-world Program Scenarios', () => {
    it('should handle a calculator program', async () => {
      const code = `10 REM Simple Calculator
20 LET A = 10
30 LET B = 5
40 PRINT "A ="; A; "B ="; B
50 PRINT "A + B ="; A + B
60 PRINT "A - B ="; A - B
70 PRINT "A * B ="; A * B
80 PRINT "A / B ="; A / B
90 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('A =10B =5')
      expect(result.output).toContain('A + B =15')
      expect(result.output).toContain('A - B =5')
      expect(result.output).toContain('A * B =50')
      expect(result.output).toContain('A / B =2')
    })

    it('should handle a text formatter program', async () => {
      const code = `10 REM Text Formatter
20 LET TEXT$ = "hello world"
30 LET LEN_TEXT = LEN(TEXT$)
40 PRINT "Original: '"; TEXT$; "'"
50 PRINT "Length:"; LEN_TEXT
60 LET FIRST$ = LEFT(TEXT$, 1)
70 LET REST$ = RIGHT(TEXT$, LEN_TEXT - 1)
80 LET FORMATTED$ = FIRST$ + REST$
90 PRINT "Formatted: '"; FORMATTED$; "'"
100 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Original: \'hello world\'')
      expect(result.output).toContain('Length:11')
      expect(result.output).toContain('Formatted: \'hello world\'')
    })

    it('should handle a data analysis program', async () => {
      const code = `10 REM Data Analysis
20 DATA 85, 92, 78, 96, 88
30 LET SUM = 0
40 LET COUNT = 0
50 LET MAX_SCORE = 0
60 READ SCORE
70 SUM = SUM + SCORE
80 COUNT = COUNT + 1
90 IF SCORE > MAX_SCORE THEN MAX_SCORE = SCORE
100 IF COUNT < 5 THEN GOTO 60
110 LET AVERAGE = SUM / COUNT
120 PRINT "Scores: 85, 92, 78, 96, 88"
130 PRINT "Average:"; AVERAGE
140 PRINT "Highest:"; MAX_SCORE
150 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('Average:87.8')
      expect(result.output).toContain('Highest: 96')
    })
  })

  describe('Performance and Stress Tests', () => {
    it('should handle programs with many variables', async () => {
      let code = ''
      for (let i = 1; i <= 50; i++) {
        code += `${i * 10} LET VAR${i} = ${i}\n`
      }
      code += '510 PRINT "All variables set"\n520 END'
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.output).toContain('All variables set')
    })

    it('should handle programs with many PRINT statements', async () => {
      let code = ''
      for (let i = 1; i <= 100; i++) {
        code += `${i * 10} PRINT ${i}\n`
      }
      code += '1010 END'
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
    })

    it('should handle programs with complex expressions', async () => {
      const code = `10 LET X = ((5 + 3) * 2 - 1) / 3
20 LET Y = SQR(ABS(X * X - 16))
30 LET Z = INT(Y) + FIX(Y)
40 PRINT "X:"; X; "Y:"; Y; "Z:"; Z
50 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
    })

    it('should handle programs with nested function calls', async () => {
      const code = `10 LET X = ABS(SQR(INT(16.7)))
20 LET Y = LEN(LEFT("Hello World", INT(5.9)))
30 PRINT "X:"; X; "Y:"; Y
40 END`
      
      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(4)
      expect(result.variables.get('Y')?.value).toBe(5)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle invalid syntax gracefully', async () => {
      const result = await interpreter.execute('10 INVALID STATEMENT\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors[0].type).toBe('SYNTAX')
    })

    it('should handle runtime errors gracefully', async () => {
      const result = await interpreter.execute('10 GOTO 999\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors[0].type).toBe('RUNTIME')
    })

    it('should handle runtime errors gracefully', async () => {
      const result = await interpreter.execute('10 GOTO 999\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors[0].type).toBe('RUNTIME')
    })
  })
})
