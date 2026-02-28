/**
 * PLAY Statement Executor
 *
 * Handles execution of PLAY statements for music/sound playback.
 * Format: PLAY string-expression
 * Example: PLAY "CRDRE", PLAY "C:E:G"
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getCstNodes } from '@/core/parser/cst-helpers'
import { parseMusicToAst } from '@/core/sound/MusicDSLParser'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class PlayExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a PLAY statement from CST
   * Plays music according to string data specification
   */
  execute(playStmtCst: CstNode, lineNumber?: number): void {
    // 1. Get expression from CST
    const expressions = getCstNodes(playStmtCst.children.expression)

    if (expressions.length < 1) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: 'PLAY: Expected a string expression',
        type: ERROR_TYPES.RUNTIME,
      })
      return
    }

    const musicStringExpr = expressions[0]

    if (!musicStringExpr) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: 'PLAY: Invalid argument',
        type: ERROR_TYPES.RUNTIME,
      })
      return
    }

    // 2. Evaluate music string expression
    let musicString: string

    try {
      const value = this.evaluator.evaluateExpression(musicStringExpr)

      // PLAY requires a string
      if (typeof value !== 'string') {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `PLAY: Expected string, got ${typeof value}`,
          type: ERROR_TYPES.RUNTIME,
        })
        return
      }

      musicString = value
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `PLAY: Error evaluating expression: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return
    }

    // 3. Parse music string to MusicScore (Stage 1)
    // This validates the string and throws on invalid characters
    let musicScore
    try {
      musicScore = parseMusicToAst(musicString)
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `PLAY: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return
    }

    // 4. Call device adapter to play sound (Stage 2 compilation happens in adapter)
    if (this.context.deviceAdapter?.playSound) {
      this.context.deviceAdapter.playSound(musicScore)
    }

    // 5. Debug output
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`PLAY: "${musicString}"`)
    }
  }
}
