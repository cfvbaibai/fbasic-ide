/**
 * GOSUB/RETURN Executor Tests
 *
 * Unit tests for the GosubExecutor and ReturnExecutor classes.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('GOSUB/RETURN Executor', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter,
    })
  })

  describe('GOSUB', () => {
    it('should call subroutine and return', async () => {
      // From manual page 63 example structure
      const source = `
10 REM * GOSUB *
100 FOR I=1 TO 3
110 GOSUB 1000
120 NEXT
130 PRINT "END"
140 END
1000 FOR J=0 TO I
1010 PRINT "*";
1020 NEXT
1030 PRINT
1040 RETURN
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Should print stars for I=1,2,3 and then "END"
      // I=1: J=0,1 -> ** (2 stars), I=2: J=0,1,2 -> *** (3 stars), I=3: J=0,1,2,3 -> **** (4 stars)
      // Each PRINT "*"; outputs on same line, then PRINT adds newline
      // PRINT "END" doesn't end with semicolon, so adds newline
      expect(outputs).toEqual('**\n***\n****\nEND\n')
    })

    it('should handle nested GOSUB calls', async () => {
      const source = `
10 GOSUB 100
20 PRINT "Main"
30 END
100 PRINT "Sub1"
110 GOSUB 200
120 RETURN
200 PRINT "Sub2"
210 RETURN
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // PRINT "Main" doesn't end with semicolon, so adds newline
      expect(outputs).toEqual('Sub1\nSub2\nMain\n')
    })

    it('should error on GOSUB to non-existent line number', async () => {
      const source = `
10 GOSUB 999
20 PRINT "This should not print"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('GOSUB: line number 999 not found')

      // Verify that PRINT statements after the error are not executed
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: GOSUB: line number 999 not found')
    })
  })

  describe('RETURN', () => {
    it('should return from subroutine to calling line', async () => {
      const source = `
10 PRINT "Before"
20 GOSUB 100
30 PRINT "After"
40 END
100 PRINT "Subroutine"
110 RETURN
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Should execute: Before, Subroutine, After
      // PRINT "After" doesn't end with semicolon, so adds newline
      expect(outputs).toEqual('Before\nSubroutine\nAfter\n')
    })

    it('should return to specific line number when specified', async () => {
      const source = `
10 PRINT "Start"
20 GOSUB 100
30 PRINT "Skipped"
40 PRINT "Target"
50 END
100 PRINT "Subroutine"
110 RETURN 40
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // PRINT "Target" doesn't end with semicolon, so adds newline
      expect(outputs).toEqual('Start\nSubroutine\nTarget\n')
    })

    it('should error on RETURN without GOSUB', async () => {
      const source = `
10 RETURN
20 PRINT "This should not print"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('RETURN: no GOSUB to return from')

      // Verify that PRINT statements after the error are not executed
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: RETURN: no GOSUB to return from')
    })

    it('should error on RETURN to non-existent line number', async () => {
      const source = `
10 GOSUB 100
20 PRINT "This should not print"
30 END
100 RETURN 999
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('RETURN: line number 999 not found')

      // Verify that PRINT statements after the error are not executed
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: RETURN: line number 999 not found')
    })
  })

  describe('GOSUB/RETURN Integration', () => {
    it('should handle multiple GOSUB calls to same subroutine', async () => {
      const source = `
10 GOSUB 100
20 GOSUB 100
30 GOSUB 100
40 END
100 PRINT "Called"
110 RETURN
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Should print "Called" 3 times
      const callCount = (outputs.match(/Called/g) ?? []).length
      expect(callCount).toBe(3)
    })

    it('should handle GOSUB within FOR loop', async () => {
      const source = `
10 FOR I=1 TO 3
20 GOSUB 100
30 NEXT
40 END
100 PRINT I
110 RETURN
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Numbers always get a space BEFORE them
      // PRINT I doesn't end with semicolon, so each adds newline
      expect(outputs).toEqual(' 1\n 2\n 3\n')
    })
  })
})
