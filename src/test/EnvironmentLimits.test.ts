/**
 * Environment-Specific Limits Tests
 * 
 * Tests to verify that different environments (test vs production) 
 * have appropriate iteration limits
 */

import { describe, it, expect } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'
import { EXECUTION_LIMITS } from '@/core/constants'
import { TestDeviceAdapter } from '@/core/devices'

describe('Environment-Specific Limits', () => {
  describe('Test Environment', () => {
    it('should have strict iteration limits for testing', () => {
      const interpreter = new BasicInterpreter({ maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST })
      
      // The config should reflect test environment limits
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_TEST)
      expect(interpreter.getConfig().maxOutputLines).toBe(EXECUTION_LIMITS.MAX_OUTPUT_LINES_TEST)
    })

    it('should hit iteration limit quickly for infinite loops', async () => {
      const interpreter = new BasicInterpreter({ maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST })
      
      // Create an infinite loop that should hit the test limit
      const infiniteLoop = `10 PRINT "Loop"
20 GOTO 10
30 END`
      
      const result = await interpreter.execute(infiniteLoop)
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]?.message).toContain('Maximum iterations exceeded')
    })
  })

  describe('Production Environment', () => {
    it('should have higher iteration limits for user interaction', () => {
      const interpreter = new BasicInterpreter({ 
        maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION,
        maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_PRODUCTION
      })
      
      // The config should reflect production environment limits
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION)
      expect(interpreter.getConfig().maxOutputLines).toBe(EXECUTION_LIMITS.MAX_OUTPUT_LINES_PRODUCTION)
    })

    it('should allow more iterations before hitting limit', async () => {
      const interpreter = new BasicInterpreter({ 
        maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION,
        maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_PRODUCTION
      })
      
      // Create a loop that would exceed test limits but not production limits
      // Reduced iterations to avoid timeout with async execution
      const longLoop = `10 FOR I = 1 TO 5000
20   PRINT I
30 NEXT I
40 END`
      
      const result = await interpreter.execute(longLoop)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Environment Switching', () => {
    it('should allow switching from test to production environment', () => {
      const interpreter = new BasicInterpreter({ maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST })
      
      // Initially in test environment
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_TEST)
      
      // Switch to production
      interpreter.updateConfig({ maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION })
      
      // Should now have production limits
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION)
    })

    it('should allow switching from production to test environment', () => {
      const interpreter = new BasicInterpreter({ 
        maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION,
        maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_PRODUCTION
      })
      
      // Initially in production environment
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION)
      
      // Switch to test
      interpreter.updateConfig({ maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST })
      
      // Should now have test limits
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_TEST)
    })
  })

  describe('Backward Compatibility', () => {
    it('should default to test environment when no environment specified', () => {
      const interpreter = new BasicInterpreter()
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_TEST)
    })

    it('should allow explicit environment override', () => {
      const interpreter = new BasicInterpreter({ 
        maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION,
        maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_PRODUCTION
      })
      expect(interpreter.getConfig().maxIterations).toBe(EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION)
    })
  })

  describe('Joystick Sample Compatibility', () => {
    it('should allow joystick sample to run in production environment', async () => {
      const deviceAdapter = new TestDeviceAdapter()
      const interpreter = new BasicInterpreter({ 
        maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION, 
        maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_PRODUCTION,
        deviceAdapter 
      })
      
      // Simple joystick test that would timeout in test environment
      const joystickTest = `10 REM Simple Joystick Test
20 FOR I = 1 TO 1000
30   LET STICK_VAL = STICK(0)
40   LET STRIG_VAL = STRIG(0)
50   IF STRIG_VAL AND 1 = 1 THEN GOTO 80
60 NEXT I
70 PRINT "No input detected"
80 PRINT "Input detected"
90 END`
      
      const result = await interpreter.execute(joystickTest)
      
      // Should complete successfully in production environment
      expect(result.success).toBe(true)
      expect(deviceAdapter.printOutputs).toEqual(['No input detected', 'Input detected'])
    })

    it('should timeout joystick sample in test environment', async () => {
      const interpreter = new BasicInterpreter({ maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST })
      
      // Create a loop that will definitely exceed test limits
      const joystickTest = `10 REM Simple Joystick Test
20 FOR I = 1 TO 20000
30   LET STICK_VAL = STICK(0)
40   LET STRIG_VAL = STRIG(0)
50   IF STRIG_VAL AND 1 = 1 THEN GOTO 80
60 NEXT I
70 PRINT "No input detected"
80 PRINT "Input detected"
90 END`
      
      const result = await interpreter.execute(joystickTest)
      
      // Should timeout in test environment
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]?.message).toContain('Maximum iterations exceeded')
    })
  })
})
