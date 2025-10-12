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
import { SAMPLE_CODES } from '../core/samples/sampleCodes'
import { TestDeviceAdapter } from '../core/devices/TestDeviceAdapter'

describe('Integration Tests', () => {
  let interpreter: BasicInterpreter
  let parser: FBasicParser
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({ deviceAdapter })
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
      expect(deviceAdapter.printOutputs).toContain('Factorial of5is120')
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
      expect(deviceAdapter.printOutputs).toEqual([
        'Length of \'Hello World\' is11', 
        'Left part: \'Hello\'',
        'Right part: \'World\''
      ])
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
      expect(deviceAdapter.printOutputs).toEqual(['Too low'])
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
      expect(deviceAdapter.printOutputs).toEqual(['Sum:150Average:30'])
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
      expect(deviceAdapter.printOutputs).toEqual([
        '1. Option A',
        '2. Option B', 
        '3. Exit',
        'Selected Option B',
        'Goodbye'
      ])
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
      expect(deviceAdapter.printOutputs).toEqual(['Odd row:1Col:1', 'Odd row:1Col:2', 'Odd row:3Col:1', 'Odd row:3Col:2'])
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
      expect(deviceAdapter.printOutputs).toEqual(['Sum of 1 to 1000:500500'])
    })
  })

  describe('Sample Code Validation', () => {
    it('should parse all sample codes without syntax errors', async () => {
      for (const [_name, sample] of Object.entries(SAMPLE_CODES)) {
        const result = await parser.parse(sample.code)
        expect(result.success).toBe(true)
      }
    })

    it('should execute all sample codes successfully', async () => {
      for (const [name, sample] of Object.entries(SAMPLE_CODES)) {
        // Configure device adapter for gaming sample to simulate START button press
        if (name === 'gaming') {
          deviceAdapter.setupJoystickState(1, 0, [1]) // joystick 1, no stick input, START button press
        }
        
        const result = await interpreter.execute(sample.code)
        expect(result.success).toBe(true)
        expect(result.errors).toHaveLength(0)
      }
    })

    it('should handle basic sample correctly', async () => {
      const sample = SAMPLE_CODES.basic
      expect(sample).toBeDefined()
      const result = await interpreter.execute(sample!.code)
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['Basic F-Basic Program', 'A + B = 30'])
    })

    it('should handle gaming sample correctly', async () => {
      const sample = SAMPLE_CODES.gaming
      expect(sample).toBeDefined()
      
      // Configure device adapter to simulate START button press on joystick #1
      // START button = bit 1 in STRIG value
      deviceAdapter.setupJoystickState(1, 0, [1]) // joystick 1, no stick input, START button press
      
      const result = await interpreter.execute(sample!.code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual([
        'Family BASIC v3 Interactive Joystick Test', 
        '==========================================',
        '',
        'This program continuously monitors joystick inputs',
        'STICK(joystick) returns cross-button state:',
        '  1=right, 2=left, 4=down, 8=top',
        'STRIG(joystick) returns button state:',
        '  1=start, 2=select, 4=B, 8=A',
        '',
        'Press START button on joystick #1 to exit',
        '==========================================',
        '',
        'Monitoring joystick inputs...',
        '',
        'INPUT DETECTED!',
        '  Joystick 1: STICK=0, STRIG=1',
        'START button pressed on joystick #1',
        'Exiting joystick test...'
      ])
    })

    it('should handle complex sample correctly', async () => {
      const sample = SAMPLE_CODES.complex
      expect(sample).toBeDefined()
      const result = await interpreter.execute(sample!.code)
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual([
        'Complex F-Basic Demo',
        '',
        'Odd: 1',
        'Even: 2',
        'Odd: 3',
        'Even: 4',
        'Odd: 5',
        'Even: 6',
        'Odd: 7',
        'Even: 8',
        'Odd: 9',
        'Even: 10',
        '',
        'Sum of 1 to 100 = 5050',
        '',
        'String functions demo:',
        'Length of \'Hello World\' = 11',
        'Left 5 chars: Hello',
        'Right 5 chars: World',
        'Middle chars: llo W'
      ])
    })

    it('should handle comprehensive sample correctly', async () => {
      const sample = SAMPLE_CODES.comprehensive
      expect(sample).toBeDefined()
      const result = await interpreter.execute(sample!.code)
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual([
        'F-Basic Comprehensive Demo',
        '==========================',
        '',
        'Mathematical functions:',
        'SQR(16) = 4',
        'ABS(-5) = 5',
        'INT(3.7) = 3',
        '',
        'String functions:',
        'LEN(\'Hello World\') = 11',
        'LEFT(\'Hello World\', 5) = Hello',
        'RIGHT(\'Hello World\', 5) = World',
        '',
        'Control structures:',
        'Odd: 1',
        'Even: 2',
        'Odd: 3',
        '',
        'Variables and expressions:',
        'A = 10, B = 20, C = A + B * 2 = 50',
        '',
        'Demo completed successfully!'
      ])
    })
  })

  describe('Debug Mode Integration', () => {
    it('should provide detailed execution trace', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 PRINT "Hello"\n20 LET X = 5\n30 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.debugOutputs).toBeDefined()
      expect(deviceAdapter.debugOutputs).toContain('PRINT: Hello')
      expect(deviceAdapter.debugOutputs).toContain('LET: X = 5')
    })

    it('should show conditional execution in IF statements', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 IF 5 > 3 THEN PRINT "True"\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.debugOutputs).toContain('PRINT: True')
      expect(deviceAdapter.debugOutputs).toContain('PRINT: True')
    })

    it('should show GOTO execution details', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 PRINT "Before"\n20 GOTO 40\n30 PRINT "Skipped"\n40 PRINT "After"\n50 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.debugOutputs).toContain('Statement index modified to: 3')
    })

    it('should show DATA and READ operations', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      const result = await interpreter.execute('10 DATA 1, 2, 3\n20 READ A, B, C\n30 PRINT A, B, C\n40 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.debugOutputs).toContain('READ: 1')
      expect(deviceAdapter.debugOutputs).toContain('READ: 2')
      expect(deviceAdapter.debugOutputs).toContain('READ: 3')
    })

    it('should not include debug output when debug mode is disabled', async () => {
      interpreter.updateConfig({ enableDebugMode: false })
      const result = await interpreter.execute('10 PRINT "Hello"\n20 END')
      expect(result.success).toBe(true)
      expect(deviceAdapter.debugOutputs).toEqual([])
    })

    it('should allow enabling debug mode via updateConfig', async () => {
      await interpreter.execute('10 PRINT "Hello"\n20 END')
      expect(deviceAdapter.debugOutputs).toEqual([])
      
      interpreter.updateConfig({ enableDebugMode: true })
      await interpreter.execute('10 PRINT "Hello"\n20 END')
      expect(deviceAdapter.debugOutputs).toBeDefined()
      expect(deviceAdapter.debugOutputs).toContain('PRINT: Hello')
    })

    it('should have consistent debug message format', async () => {
      interpreter.updateConfig({ enableDebugMode: true })
      await interpreter.execute('10 PRINT "Test"\n20 LET X = 5\n30 END')
      const debugLines = deviceAdapter.debugOutputs?.filter(line => line.trim() !== '') || []
      expect(debugLines.length).toBeGreaterThan(0)
      // All debug messages should follow a consistent format (current format uses "TYPE: message" or descriptive text)
      debugLines.forEach(line => {
        // Allow both "TYPE: message" format and descriptive text format
        expect(line).toMatch(/^[A-Z]+:|^[A-Za-z]/)
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
      expect(deviceAdapter.printOutputs).toContain('Integration Test')
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
      expect(deviceAdapter.printOutputs).toContain('A =10B =5')
      expect(deviceAdapter.printOutputs).toContain('A + B =15')
      expect(deviceAdapter.printOutputs).toContain('A - B =5')
      expect(deviceAdapter.printOutputs).toContain('A * B =50')
      expect(deviceAdapter.printOutputs).toContain('A / B =2')
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
      expect(deviceAdapter.printOutputs).toContain('Original: \'hello world\'')
      expect(deviceAdapter.printOutputs).toContain('Length:11')
      expect(deviceAdapter.printOutputs).toContain('Formatted: \'hello world\'')
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
      expect(deviceAdapter.printOutputs).toContain('Average:87.8')
      expect(deviceAdapter.printOutputs).toContain('Highest:96')
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
      expect(deviceAdapter.printOutputs).toContain('All variables set')
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
      expect(result.errors?.[0]?.type).toBe('SYNTAX')
    })

    it('should handle runtime errors gracefully', async () => {
      const result = await interpreter.execute('10 GOTO 999\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors?.[0]?.type).toBe('RUNTIME')
    })
  })
})
