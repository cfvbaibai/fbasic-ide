/**
 * DATA, READ, RESTORE Integration Tests
 * 
 * Tests for complete DATA/READ/RESTORE workflows based on spec examples.
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import type { BasicDeviceAdapter } from '@/core/interfaces'

describe('DATA/READ/RESTORE Integration', () => {
  let interpreter: BasicInterpreter
  let mockDeviceAdapter: BasicDeviceAdapter
  let printOutputMock: MockedFunction<(output: string) => void>

  beforeEach(() => {
    printOutputMock = vi.fn()
    mockDeviceAdapter = {
      getJoystickCount: vi.fn(() => 0),
      getStickState: vi.fn(() => 0),
      setStickState: vi.fn(),
      pushStrigState: vi.fn(),
      consumeStrigState: vi.fn(() => 0),
      printOutput: printOutputMock,
      debugOutput: vi.fn(),
      errorOutput: vi.fn(),
      clearScreen: vi.fn()
    }

    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: mockDeviceAdapter
    })
  })

  describe('Numerical Value Data Reading (Spec Example 1)', () => {
    it('should read numeric data values sequentially', async () => {
      const code = `10 DATA 3, 4, 1, 6, 2, 7, 8, 3, 4, 9
20 FOR I=1 TO 10
30 READ X
40 PRINT X;
50 NEXT
60 END`

      const result = await interpreter.execute(code)

      if (!result.success) {
        console.log('Execution errors:', result.errors)
      }
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Each PRINT X; creates a separate output (semicolon at end doesn't suppress newline in current impl)
      // Verify all 10 values were printed
      expect(printOutputMock).toHaveBeenCalledTimes(10)
      const outputs = printOutputMock.mock.calls.map(call => call[0])
      
      // Expected values in order: 3, 4, 1, 6, 2, 7, 8, 3, 4, 9
      const expectedValues = ['3', '4', '1', '6', '2', '7', '8', '3', '4', '9']
      expect(outputs).toEqual(expectedValues)
      
      // Verify variable X has the last read value
      expect(result.variables.get('X')?.value).toBe(9)
    })
  })

  describe('Character Data Reading (Spec Example 2)', () => {
    it('should read unquoted string data values', async () => {
      const code = `10 DATA GOOD, MORNING, EVENING
20 READ A$, B$, C$
30 PRINT A$; " "; B$; "."
40 PRINT A$; " "; C$; "."
50 END`

      const result = await interpreter.execute(code)

      if (!result.success) {
        console.log('Execution errors:', result.errors)
      }
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify variable values were read correctly
      expect(result.variables.get('A$')?.value).toBe('GOOD')
      expect(result.variables.get('B$')?.value).toBe('MORNING')
      expect(result.variables.get('C$')?.value).toBe('EVENING')
      
      // Verify PRINT outputs (semicolon adds spaces between items)
      expect(printOutputMock).toHaveBeenCalledTimes(2)
      const outputs = printOutputMock.mock.calls.map(call => call[0])
      // PRINT A$; " "; B$; "." creates: "GOOD" + " " + " " + "MORNING" + " " + "." = "GOOD   MORNING ."
      // Each semicolon adds a space, so: A$ + space + " " + space + B$ + space + "." 
      expect(outputs[0]).toBe('GOOD   MORNING .')
      expect(outputs[1]).toBe('GOOD   EVENING .')
    })
  })

  describe('Array Reading (Spec Example 3)', () => {
    it('should read data into array elements', async () => {
      const code = `10 DATA 9, 1, 8, 3, 4, 8
20 DIM A(5)
30 FOR I=0 TO 5
40 READ A(I)
50 PRINT A(I);
60 NEXT
70 END`

      const result = await interpreter.execute(code)

      if (!result.success) {
        console.log('Execution errors:', result.errors)
      }
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify PRINT outputs (6 values printed, one per iteration)
      // Each PRINT A(I); outputs the array element value
      expect(printOutputMock).toHaveBeenCalledTimes(6)
      const outputs = printOutputMock.mock.calls.map(call => call[0])
      const expectedOutputs = ['9', '1', '8', '3', '4', '8']
      expect(outputs).toEqual(expectedOutputs)
      
      // Verify that array elements were read correctly by checking the printed values
      // The array A should contain: [9, 1, 8, 3, 4, 8] at indices 0-5
    })
  })

  describe('RESTORE Functionality (Spec Example)', () => {
    it('should restore data pointer to specific line', async () => {
      const code = `1000 DATA 23, 43, 55, 65, 42, 9
1010 DATA 12, 56, 34, 68, 53, 2
10 REM * RESTORE *
20 RESTORE 1010
30 FOR I=0 TO 5
40 READ A
50 PRINT A;
60 NEXT
70 PRINT
80 RESTORE 1000
90 FOR I=0 TO 5
100 READ A
110 PRINT A;
120 NEXT
130 END`

      const result = await interpreter.execute(code)

      if (!result.success) {
        console.log('Execution errors:', result.errors)
      }
      
      // If RESTORE with line number works correctly:
      // First loop should read from line 1010: 12, 56, 34, 68, 53, 2
      // Second loop should read from line 1000: 23, 43, 55, 65, 42, 9
      expect(result.success).toBe(true)
      
      // Verify PRINT outputs (12 values + 1 empty line)
      expect(printOutputMock).toHaveBeenCalledTimes(13)
      const outputs = printOutputMock.mock.calls.map(call => call[0])
      
      // First 6 outputs should be from line 1010
      const firstSet = outputs.slice(0, 6)
      expect(firstSet).toEqual(['12', '56', '34', '68', '53', '2'])
      
      // 7th output should be empty (PRINT with no arguments)
      expect(outputs[6]).toBe('')
      
      // Last 6 outputs should be from line 1000
      const secondSet = outputs.slice(7, 13)
      expect(secondSet).toEqual(['23', '43', '55', '65', '42', '9'])
    })

    it('should restore data pointer to beginning when no line specified', async () => {
      const code = `10 DATA 10, 20, 30
20 READ A, B
30 RESTORE
40 READ C, D
50 PRINT A; B; C; D
60 END`

      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify variable values
      expect(result.variables.get('A')?.value).toBe(10)
      expect(result.variables.get('B')?.value).toBe(20)
      // After RESTORE, C and D should read the same values as A and B
      expect(result.variables.get('C')?.value).toBe(10)
      expect(result.variables.get('D')?.value).toBe(20)
      
      // Verify PRINT output (semicolon adds spaces between items)
      expect(printOutputMock).toHaveBeenCalledTimes(1)
      const output = printOutputMock.mock.calls[0]?.[0]
      expect(output).toBeDefined()
      // PRINT A; B; C; D creates: "10" + " " + "20" + " " + "10" + " " + "20" = "10 20 10 20"
      expect(output).toBe('10 20 10 20')
    })
  })

  describe('Quoted Strings with Commas', () => {
    it('should handle quoted strings containing commas', async () => {
      const code = `10 DATA ABC, DE, ", ", F
20 READ A$, B$, C$, D$
30 PRINT A$; B$; C$; D$
40 END`

      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify variable values were read correctly
      expect(result.variables.get('A$')?.value).toBe('ABC')
      expect(result.variables.get('B$')?.value).toBe('DE')
      expect(result.variables.get('C$')?.value).toBe(', ')
      expect(result.variables.get('D$')?.value).toBe('F')
      
      // Verify PRINT output (semicolon adds space between items)
      expect(printOutputMock).toHaveBeenCalledTimes(1)
      const output = printOutputMock.mock.calls[0]?.[0]
      expect(output).toBeDefined()
      // PRINT with semicolon adds spaces: "ABC DE ,  F"
      expect(output).toBe('ABC DE ,  F')
    })
  })

  describe('OD ERROR Handling', () => {
    it('should report OD ERROR when reading more data than available', async () => {
      const code = `10 DATA 10, 20
20 READ A, B, C
30 PRINT "This should not print"
40 END`

      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      const errors = result.errors || []
      expect(errors.length).toBeGreaterThan(0)
      const odError = errors.find(e => e.message === 'OD ERROR')
      expect(odError).toBeDefined()
      
      // Verify that PRINT statements after the error are not executed
      // printOutputMock should not be called because execution halts on error
      expect(printOutputMock).not.toHaveBeenCalled()
    })
  })

  describe('Multiple DATA Statements', () => {
    it('should read data from multiple DATA statements sequentially', async () => {
      const code = `10 DATA 10, 20
20 DATA 30, 40
30 READ A, B, C, D
40 PRINT A; B; C; D
50 END`

      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify variable values were read correctly from both DATA statements
      expect(result.variables.get('A')?.value).toBe(10)
      expect(result.variables.get('B')?.value).toBe(20)
      expect(result.variables.get('C')?.value).toBe(30)
      expect(result.variables.get('D')?.value).toBe(40)
      
      // Verify PRINT output (semicolon adds spaces between items)
      expect(printOutputMock).toHaveBeenCalledTimes(1)
      const output = printOutputMock.mock.calls[0]?.[0]
      expect(output).toBeDefined()
      // PRINT A; B; C; D creates: "10" + " " + "20" + " " + "30" + " " + "40" = "10 20 30 40"
      expect(output).toBe('10 20 30 40')
    })
  })
})

