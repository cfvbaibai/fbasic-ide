/**
 * Control Flow Tests Suite
 * 
 * Comprehensive tests for BASIC control flow including:
 * - IF statements
 * - FOR loops
 * - NEXT statements
 * - GOTO statements
 * - GOSUB/RETURN statements
 * - Nested control structures
 * - Colon-separated statements
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'

describe('Control Flow Tests', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter()
  })

  describe('IF Statements', () => {
    it('should execute IF statement when condition is true', async () => {
      const result = await interpreter.execute('10 IF 5 > 3 THEN PRINT "True"\n20 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('True')
    })

    it('should not execute IF statement when condition is false', async () => {
      const result = await interpreter.execute('10 IF 3 > 5 THEN PRINT "False"\n20 PRINT "After"\n30 END')
      expect(result.success).toBe(true)
      expect(result.output).not.toContain('False')
      expect(result.output).toContain('After')
    })

    it('should handle IF with variable conditions', async () => {
      const result = await interpreter.execute('10 LET X = 10\n20 IF X > 5 THEN PRINT "X is greater than 5"\n30 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('X is greater than 5')
    })

    it('should handle IF with complex conditions', async () => {
      const result = await interpreter.execute('10 LET X = 7\n20 IF X > 5 AND X < 10 THEN PRINT "X is between 5 and 10"\n30 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('X is between 5 and 10')
    })

    it('should handle IF with equality conditions', async () => {
      const result = await interpreter.execute('10 LET X = 5\n20 IF X = 5 THEN PRINT "X equals 5"\n30 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('X equals 5')
    })

    it('should handle IF with string conditions', async () => {
      const result = await interpreter.execute('10 LET S$ = "Hello"\n20 IF S$ = "Hello" THEN PRINT "String matches"\n30 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('String matches')
    })

    it('should handle empty IF statement', async () => {
      const result = await interpreter.execute('10 IF 1 > 0 THEN PRINT "True"\n20 PRINT "After"\n30 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('True')
      expect(result.output).toContain('After')
    })
  })

  describe('FOR Loops', () => {
    it('should execute simple FOR loop', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 3\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('2')
      expect(result.output).toContain('3')
    })

    it('should handle FOR loop with step', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 5 STEP 2\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('3')
      expect(result.output).toContain('5')
    })

    it('should handle FOR loop with negative step', async () => {
      const result = await interpreter.execute('10 FOR I = 5 TO 1 STEP -1\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('5')
      expect(result.output).toContain('4')
      expect(result.output).toContain('3')
      expect(result.output).toContain('2')
      expect(result.output).toContain('1')
    })

    it('should handle FOR loop with expressions', async () => {
      const result = await interpreter.execute('10 LET START = 1\n20 LET END = 3\n30 FOR I = START TO END\n40   PRINT I\n50 NEXT I\n60 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('2')
      expect(result.output).toContain('3')
    })

    it('should handle FOR loop with zero iterations', async () => {
      const result = await interpreter.execute('10 FOR I = 5 TO 1\n20   PRINT I\n30 NEXT I\n40 PRINT "After loop"\n50 END')
      expect(result.success).toBe(true)
      expect(result.output).not.toContain('5')
      expect(result.output).not.toContain('4')
      expect(result.output).not.toContain('3')
      expect(result.output).not.toContain('2')
      expect(result.output).not.toContain('1')
      expect(result.output).toContain('After loop')
    })

    it('should handle FOR loop with step that skips end value', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 5 STEP 3\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('4')
    })
  })

  describe('NEXT Statements', () => {
    it('should handle NEXT without variable', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   PRINT I\n30 NEXT\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('2')
    })

    it('should handle NEXT with variable', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('2')
    })

    it('should handle mismatched NEXT variable', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   PRINT I\n30 NEXT J\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('2')
    })
  })

  describe('GOTO Statements', () => {
    it('should execute GOTO statement', async () => {
      const result = await interpreter.execute('10 PRINT "Before"\n20 GOTO 40\n30 PRINT "Skipped"\n40 PRINT "After"\n50 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('Before')
      expect(result.output).not.toContain('Skipped')
      expect(result.output).toContain('After')
    })

    it('should handle GOTO with expressions', async () => {
      const result = await interpreter.execute('10 LET LINE = 30\n20 PRINT "Before"\n30 PRINT "Target"\n40 GOTO LINE\n50 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('Before')
      expect(result.output).toContain('Target')
    })

    it('should handle GOTO to non-existent line', async () => {
      const result = await interpreter.execute('10 GOTO 999\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('GOSUB and RETURN Statements', () => {
    it('should execute GOSUB and RETURN correctly', async () => {
      const result = await interpreter.execute('10 PRINT "Start"\n20 GOSUB 100\n30 PRINT "End"\n40 END\n100 PRINT "Subroutine"\n110 RETURN')
      expect(result.success).toBe(true)
      expect(result.output).toContain('Start')
      expect(result.output).toContain('Subroutine')
      expect(result.output).toContain('End')
    })

    it('should handle nested GOSUB calls', async () => {
      const result = await interpreter.execute('10 GOSUB 100\n20 END\n100 PRINT "Level 1"\n110 GOSUB 200\n120 RETURN\n200 PRINT "Level 2"\n210 RETURN')
      expect(result.success).toBe(true)
      expect(result.output).toContain('Level 1')
      expect(result.output).toContain('Level 2')
    })

    it('should handle multiple GOSUB calls', async () => {
      const result = await interpreter.execute('10 GOSUB 100\n20 GOSUB 100\n30 END\n100 PRINT "Subroutine"\n110 RETURN')
      expect(result.success).toBe(true)
      expect(result.output.split('Subroutine')).toHaveLength(3) // Two calls + original
    })

    it('should handle GOSUB to non-existent line', async () => {
      const result = await interpreter.execute('10 GOSUB 999\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Nested Control Structures', () => {
    it('should handle IF with FOR loop', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 3\n20   IF I > 1 THEN PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('2')
      expect(result.output).toContain('3')
      expect(result.output).not.toContain('1')
    })

    it('should handle nested FOR loops', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   FOR J = 1 TO 2\n30     PRINT I, J\n40   NEXT J\n50 NEXT I\n60 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1 1')
      expect(result.output).toContain('1 2')
      expect(result.output).toContain('2 1')
      expect(result.output).toContain('2 2')
    })

    it('should handle FOR loop with GOSUB', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   GOSUB 100\n30 NEXT I\n40 END\n100 PRINT "Subroutine", I\n110 RETURN')
      expect(result.success).toBe(true)
      expect(result.output).toContain('Subroutine 1')
      expect(result.output).toContain('Subroutine 2')
    })

    it('should handle complex nested structures', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   IF I = 1 THEN\n30     FOR J = 1 TO 2\n40       PRINT "First", J\n50     NEXT J\n60   ELSE\n70     PRINT "Second"\n80   END IF\n90 NEXT I\n100 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('First 1')
      expect(result.output).toContain('First 2')
      expect(result.output).toContain('Second')
    })
  })

  describe('Colon-Separated Statements', () => {
    it('should support colon-separated statements in FOR loops', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2: PRINT I: NEXT I\n20 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('2')
    })

    it('should support multiple colon-separated statements in FOR loops', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2: LET X = I * 2: PRINT X: NEXT I\n20 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('2')
      expect(result.output).toContain('4')
    })

    it('should support colon-separated statements with variable assignments', async () => {
      const result = await interpreter.execute('10 LET A = 1: LET B = 2: PRINT A, B\n20 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('2')
    })

    it('should support nested colon-separated statements', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2: IF I = 1 THEN PRINT "First": ELSE PRINT "Second": END IF: NEXT I\n20 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('First')
      expect(result.output).toContain('Second')
    })

    it('should support colon-separated statements in IF-THEN clauses', async () => {
      const result = await interpreter.execute('10 IF 1 > 0 THEN PRINT "True": PRINT "Still True"\n20 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('True')
      expect(result.output.split('True')).toHaveLength(3) // Two prints + original
    })

    it('should handle complex colon-separated statements', async () => {
      const result = await interpreter.execute('10 LET X = 5: IF X > 3 THEN PRINT "Big": LET Y = X * 2: PRINT Y\n20 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('Big')
      expect(result.output).toContain('10')
    })
  })

  describe('Control Flow Edge Cases', () => {
    it('should handle FOR loop with floating point step', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2 STEP 0.5\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('1.5')
      expect(result.output).toContain('2')
    })

    it('should handle FOR loop with very small step', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 1.1 STEP 0.1\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1')
      expect(result.output).toContain('1.1')
    })

    it('should handle FOR loop with large numbers', async () => {
      const result = await interpreter.execute('10 FOR I = 1000000 TO 1000002\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('1000000')
      expect(result.output).toContain('1000001')
      expect(result.output).toContain('1000002')
    })

    it('should handle infinite loop protection', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 1000000\n20   PRINT I\n30 NEXT I\n40 END')
      expect(result.success).toBe(true)
      // Should complete due to execution limits
    })

    it('should handle GOTO loops', async () => {
      const result = await interpreter.execute('10 LET COUNT = 0\n20 COUNT = COUNT + 1\n30 IF COUNT < 3 THEN GOTO 20\n40 PRINT COUNT\n50 END')
      expect(result.success).toBe(true)
      expect(result.output).toContain('3')
    })
  })

  describe('Control Flow Error Handling', () => {
    it('should handle missing NEXT statement', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   PRINT I\n30 END')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle mismatched FOR/NEXT', async () => {
      const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   PRINT I\n30 NEXT J\n40 END')
      expect(result.success).toBe(true)
      // Should still work but may have warnings
    })

    it('should handle RETURN without GOSUB', async () => {
      const result = await interpreter.execute('10 RETURN\n20 END')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})