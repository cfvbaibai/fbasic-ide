/**
 * Print Executor Tests
 * 
 * Unit tests for the PrintExecutor class.
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import type { BasicDeviceAdapter } from '@/core/interfaces'
import { PrintExecutor } from '@/core/execution/executors/PrintExecutor'
import { IoService } from '@/core/services/IoService'
import { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { ExecutionContext } from '@/core/state/ExecutionContext'
import { FBasicParser } from '@/core/parser/FBasicParser'
import { parsePrintStatement } from '../test-helpers'

describe('PrintExecutor', () => {
  let executor: PrintExecutor
  let ioService: IoService
  let evaluator: ExpressionEvaluator
  let context: ExecutionContext
  let mockDeviceAdapter: BasicDeviceAdapter
  let printOutputMock: MockedFunction<(output: string) => void>

  beforeEach(() => {
    // Create mock device adapter to capture output
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

    context = new ExecutionContext({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: mockDeviceAdapter
    })
    // Ensure deviceAdapter is set on context
    context.deviceAdapter = mockDeviceAdapter
    evaluator = new ExpressionEvaluator(context)
    ioService = new IoService(context, evaluator, mockDeviceAdapter)
    executor = new PrintExecutor(ioService, evaluator)
  })

  describe('Empty PRINT Statement', () => {
    it('should execute empty PRINT statement', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      // Empty PRINT should call printOutput with empty string
      expect(printOutputMock).toHaveBeenCalledWith('')
    })
  })

  describe('PRINT with String Literals', () => {
    it('should execute PRINT statement with single string literal', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT "Hello World"')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalledWith('Hello World')
    })

    it('should execute PRINT statement with multiple string literals', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT "A", "B", "C"')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalledTimes(1)
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('A')
      expect(call).toContain('B')
      expect(call).toContain('C')
    })
  })

  describe('PRINT with Numbers', () => {
    it('should execute PRINT statement with number literal', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT 42')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('42')
    })

    it('should reject floating point number literals', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 PRINT 3.14')
      
      // Floating point literals should be rejected by the parser
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })

  describe('PRINT with Variables', () => {
    it('should execute PRINT statement with variable', async () => {
      // Set up variable
      context.variables.set('X', { value: 100, type: 'number' })

      const printStmtCst = await parsePrintStatement('10 PRINT X')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('100')
    })

    it('should execute PRINT statement with string variable', async () => {
      // Set up variable
      context.variables.set('MSG', { value: 'Test Message', type: 'string' })

      const printStmtCst = await parsePrintStatement('10 PRINT MSG')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('Test Message')
    })
  })

  describe('PRINT with Expressions', () => {
    it('should execute PRINT statement with addition expression', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT 10 + 20')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('30')
    })

    it('should execute PRINT statement with subtraction expression', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT 50 - 20')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('30')
    })

    it('should execute PRINT statement with multiplication expression', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT 5 * 6')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('30')
    })

    it('should execute PRINT statement with division expression', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT 20 / 4')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('5')
    })

    it('should execute PRINT statement with complex expression', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT (10 + 20) * 2')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('60')
    })
  })

  describe('PRINT with Mixed Items', () => {
    it('should execute PRINT statement with string and number', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT "Value:", 42')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('Value:')
      expect(call).toContain('42')
    })

    it('should execute PRINT statement with string and expression', async () => {
      const printStmtCst = await parsePrintStatement('10 PRINT "Result:", 10 + 20')
      expect(printStmtCst).not.toBeNull()

      executor.execute(printStmtCst!)

      expect(printOutputMock).toHaveBeenCalled()
      const call = printOutputMock.mock.calls[0]?.[0]
      expect(call).toContain('Result:')
      expect(call).toContain('30')
    })
  })
})

