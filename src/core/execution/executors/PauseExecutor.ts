/**
 * Pause Statement Executor
 *
 * Handles execution of PAUSE statements to delay program execution.
 *
 * ## Why our PAUSE was ~2× real F-BASIC (analysis)
 *
 * 1. **Two time bases**: We use TIMING.FRAME_RATE = 30 (33.33ms per frame). DEF MOVE
 *    uses 60/C dots per second (manual), so movement is tied to a 60Hz-like base.
 *
 * 2. **Original formula**: We used (frames × FRAME_DURATION_MS) / 2 ≈ 16.67ms per
 *    PAUSE unit (60Hz). That assumed real PAUSE used the same 60Hz tick.
 *
 * 3. **Empirical result**: Our pause was ~2× longer than real hardware, so real
 *    PAUSE uses a shorter unit: ~8.33ms (120Hz-equivalent). Real F-BASIC likely
 *    drives PAUSE from a ~120Hz time base (e.g. CPU/scanline-derived), not 60Hz.
 *
 * 4. **Fix**: Use divisor 4 so 1 PAUSE unit ≈ 8.33ms (quarter of our 30 FPS frame),
 *    matching observed real F-BASIC timing.
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES, TIMING } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getFirstCstNode } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class PauseExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a PAUSE statement from CST
   * Pauses execution for the specified number of frames.
   * Real F-BASIC PAUSE is ~quarter of our nominal frame duration (~8.33ms per frame).
   */
  async execute(pauseStmtCst: CstNode): Promise<void> {
    const expressionCst = getFirstCstNode(pauseStmtCst.children.expression)

    if (!expressionCst) {
      this.context.addError({
        line: 0,
        message: 'Invalid PAUSE statement: missing expression',
        type: ERROR_TYPES.RUNTIME,
      })
      return
    }

    // Evaluate the pause duration (in frames)
    const durationValue = this.evaluator.evaluateExpression(expressionCst)
    // Convert to number (handles both numeric and string values)
    const frames =
      typeof durationValue === 'number'
        ? Math.max(0, Math.floor(durationValue))
        : Math.max(0, Math.floor(parseFloat(String(durationValue)) || 0))

    // Convert frames to milliseconds; real F-BASIC uses ~quarter of our nominal frame duration for PAUSE; +25% slower
    const durationMs = (frames * TIMING.FRAME_DURATION_MS) / 2.75

    if (durationMs > 0) {
      await new Promise(resolve => setTimeout(resolve, durationMs))
    }

    // Add debug output
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`PAUSE: ${frames} frames (${Math.round(durationMs)}ms)`)
    }
  }
}
