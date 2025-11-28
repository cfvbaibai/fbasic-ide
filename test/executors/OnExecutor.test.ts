/**
 * ON Statement Executor Tests
 * 
 * Unit tests for the OnExecutor class execution behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('OnExecutor', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter
    })
  })

  describe('ON ... GOTO', () => {
    it('should jump to first line when expression is 1', async () => {
      const source = `
10 LET X = 1
20 ON X GOTO 100, 200, 300
30 PRINT "Skipped"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('First')
      expect(outputs).not.toContain('Second')
      expect(outputs).not.toContain('Third')
      expect(outputs).not.toContain('Skipped')
    })

    it('should jump to second line when expression is 2', async () => {
      const source = `
10 LET X = 2
20 ON X GOTO 100, 200, 300
30 PRINT "Skipped"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).not.toContain('First')
      expect(outputs).toContain('Second')
      expect(outputs).not.toContain('Third')
      expect(outputs).not.toContain('Skipped')
    })

    it('should jump to third line when expression is 3', async () => {
      const source = `
10 LET X = 3
20 ON X GOTO 100, 200, 300
30 PRINT "Skipped"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).not.toContain('First')
      expect(outputs).not.toContain('Second')
      expect(outputs).toContain('Third')
      expect(outputs).not.toContain('Skipped')
    })

    it('should proceed to next line when expression is 0', async () => {
      // Manual: "When the value of the equation is 0 or when it exceeds the specified number of lines, it moves to the next sentence after the ON sentence."
      const source = `
10 LET X = 0
20 ON X GOTO 100, 200, 300
30 PRINT "Next"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('Next')
      expect(outputs).not.toContain('First')
      expect(outputs).not.toContain('Second')
      expect(outputs).not.toContain('Third')
    })

    it('should proceed to next line when expression exceeds number of lines', async () => {
      // Manual: "When the value of the equation is 0 or when it exceeds the specified number of lines, it moves to the next sentence after the ON sentence."
      const source = `
10 LET X = 5
20 ON X GOTO 100, 200, 300
30 PRINT "Next"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('Next')
      expect(outputs).not.toContain('First')
      expect(outputs).not.toContain('Second')
      expect(outputs).not.toContain('Third')
    })

    it('should handle ON with expression', async () => {
      const source = `
10 LET X = 1
20 ON X + 1 GOTO 100, 200, 300
30 PRINT "Skipped"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).not.toContain('First')
      expect(outputs).toContain('Second')
      expect(outputs).not.toContain('Third')
      expect(outputs).not.toContain('Skipped')
    })

    it('should handle negative expression value', async () => {
      const source = `
10 LET X = -1
20 ON X GOTO 100, 200, 300
30 PRINT "Next"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('Next')
      expect(outputs).not.toContain('First')
      expect(outputs).not.toContain('Second')
      expect(outputs).not.toContain('Third')
    })

    it('should handle fractional expression value (truncated to integer)', async () => {
      // Use expression that results in fractional value: 5 / 2 = 2.5, truncated to 2
      const source = `
10 LET X = 5
20 ON X / 2 GOTO 100, 200, 300
30 PRINT "Skipped"
40 END
100 PRINT "First"
110 END
200 PRINT "Second"
210 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // 5 / 2 = 2.5 truncated to 2, so should jump to second line
      expect(outputs).not.toContain('First')
      expect(outputs).toContain('Second')
      expect(outputs).not.toContain('Third')
      expect(outputs).not.toContain('Skipped')
    })
  })

  describe('ON ... GOSUB', () => {
    it('should jump to first line when expression is 1', async () => {
      // TODO: Enable when GOSUB/RETURN is fully implemented
      const source = `
10 LET N = 1
20 ON N GOSUB 100, 200, 300
30 PRINT "After"
40 END
100 PRINT "First"
110 RETURN
200 PRINT "Second"
210 RETURN
300 PRINT "Third"
310 RETURN
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('First')
      expect(outputs).toContain('After')
      expect(outputs).not.toContain('Second')
      expect(outputs).not.toContain('Third')
    })

    it('should handle ON-GOSUB matching manual example structure', async () => {
      // From manual page 66 example structure
      const source = `
10 REM * ON-GOSUB *
20 LET N = 2
30 ON N GOSUB 100,200,300,400,500,600
40 IF N<1 OR N>6 THEN 20
50 PRINT N; " IS THE SYMBOL OF ";X$;"."
60 END
100 X$="ETERNITY": RETURN
200 X$="HOPE": RETURN
300 X$="WOMAN": RETURN
400 X$="MAN": RETURN
500 X$="PERFECTION": RETURN
600 X$="WEDDING": RETURN
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('HOPE')
    })
  })

  describe('ON ... RETURN', () => {
    it('should return to first line when expression is 1', async () => {
      const source = `
10 GOSUB 100
20 PRINT "After"
30 END
100 LET X = 1
110 ON X RETURN 200, 300, 400
120 PRINT "Never"
200 PRINT "First"
210 RETURN
300 PRINT "Second"
310 RETURN
400 PRINT "Third"
410 RETURN
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('First')
      expect(outputs).toContain('After')
      expect(outputs).not.toContain('Never')
      expect(outputs).not.toContain('Second')
      expect(outputs).not.toContain('Third')
    })

    it('should return to second line when expression is 2', async () => {
      const source = `
10 GOSUB 100
20 PRINT "After"
30 END
100 LET X = 2
110 ON X RETURN 200, 300, 400
120 PRINT "Never"
200 PRINT "First"
210 RETURN
300 PRINT "Second"
310 RETURN
400 PRINT "Third"
410 RETURN
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('Second')
      expect(outputs).toContain('After')
      expect(outputs).not.toContain('Never')
      expect(outputs).not.toContain('First')
      expect(outputs).not.toContain('Third')
    })
  })

  describe('ON ... RESTORE', () => {
    it('should restore data pointer to first line when expression is 1', async () => {
      const source = `
10 DATA 10, 20, 30
20 DATA 40, 50, 60
30 DATA 70, 80, 90
40 LET X = 1
50 ON X RESTORE 10, 20, 30
60 READ A, B, C
70 PRINT A, B, C
80 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Should read from line 10: 10, 20, 30
      expect(outputs).toContain('10')
      expect(outputs).toContain('20')
      expect(outputs).toContain('30')
    })

    it('should restore data pointer to second line when expression is 2', async () => {
      const source = `
10 DATA 10, 20, 30
20 DATA 40, 50, 60
30 DATA 70, 80, 90
40 LET X = 2
50 ON X RESTORE 10, 20, 30
60 READ A, B, C
70 PRINT A, B, C
80 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Should read from line 20: 40, 50, 60
      expect(outputs).toContain('40')
      expect(outputs).toContain('50')
      expect(outputs).toContain('60')
    })

    it('should proceed to next line when expression is 0 or out of range', async () => {
      const source = `
10 DATA 10, 20
20 DATA 30, 40
30 LET X = 0
40 ON X RESTORE 10, 20
50 READ A
60 PRINT A
70 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Should read from default position (beginning): 10
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('10')
    })
  })

  describe('Error Handling', () => {
    it('should error on ON to non-existent line number', async () => {
      const source = `
10 LET X = 1
20 ON X GOTO 999
30 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toContain('line number 999 not found')
    })

    it('should handle ON with multiple line numbers where one is invalid', async () => {
      const source = `
10 LET X = 2
20 ON X GOTO 100, 999, 300
30 END
100 PRINT "First"
110 END
300 PRINT "Third"
310 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toContain('line number 999 not found')
    })
  })

  describe('Comparison with IF-THEN', () => {
    it('should work like multiple IF-THEN statements', async () => {
      // Manual page 66 shows ON X GOTO 1000,2000,3000,4000,5000
      // is equivalent to:
      // IF X=1 THEN 1000
      // IF X=2 THEN 2000
      // IF X=3 THEN 3000
      // IF X=4 THEN 4000
      // IF X=5 THEN 5000
      const source = `
10 LET X = 3
20 ON X GOTO 100, 200, 300, 400, 500
30 PRINT "Skipped"
40 END
100 PRINT "One"
110 END
200 PRINT "Two"
210 END
300 PRINT "Three"
310 END
400 PRINT "Four"
410 END
500 PRINT "Five"
510 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toContain('Three')
      expect(outputs).not.toContain('One')
      expect(outputs).not.toContain('Two')
      expect(outputs).not.toContain('Four')
      expect(outputs).not.toContain('Five')
      expect(outputs).not.toContain('Skipped')
    })
  })
})

