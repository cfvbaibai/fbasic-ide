/**
 * DEF MOVE Statement Executor
 *
 * Handles execution of DEF MOVE statements to define animated sprite movement.
 * Grammar: DEF MOVE(n) = SPRITE(A, B, C, D, E, F)
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getCstNodes } from '@/core/parser/cst-helpers'
import type { MoveDefinition } from '@/core/sprite/types'
import type { ExecutionContext } from '@/core/state/ExecutionContext'
import type { MoveCharacterCode } from '@/shared/data/types'

export class DefMoveExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a DEF MOVE statement from CST
   * DEF MOVE(n) = SPRITE(A, B, C, D, E, F)
   * n: action number (0-7)
   * A: character type (0-15)
   * B: direction (0-8)
   * C: speed (1-255, 60/C dots per second)
   * D: distance (1-255, total = 2×D dots)
   * E: priority (0=front, 1=behind background)
   * F: color combination (0-3)
   */
  execute(defMoveStmtCst: CstNode, lineNumber?: number): void {
    try {
      // Extract labeled expressions
      const actionNumberExpr = getCstNodes(defMoveStmtCst.children.actionNumber)?.[0]
      const characterTypeExpr = getCstNodes(defMoveStmtCst.children.characterType)?.[0]
      const directionExpr = getCstNodes(defMoveStmtCst.children.direction)?.[0]
      const speedExpr = getCstNodes(defMoveStmtCst.children.speed)?.[0]
      const distanceExpr = getCstNodes(defMoveStmtCst.children.distance)?.[0]
      const priorityExpr = getCstNodes(defMoveStmtCst.children.priority)?.[0]
      const colorCombinationExpr = getCstNodes(defMoveStmtCst.children.colorCombination)?.[0]

      if (
        !actionNumberExpr ||
        !characterTypeExpr ||
        !directionExpr ||
        !speedExpr ||
        !distanceExpr ||
        !priorityExpr ||
        !colorCombinationExpr
      ) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: 'DEF MOVE: Missing required parameters',
          type: ERROR_TYPES.RUNTIME,
        })
        return
      }

      // Evaluate parameters
      const actionNumber = this.evaluateNumber(actionNumberExpr, 'action number', lineNumber)
      const characterType = this.evaluateNumber(characterTypeExpr, 'character type', lineNumber)
      const direction = this.evaluateNumber(directionExpr, 'direction', lineNumber)
      const speed = this.evaluateNumber(speedExpr, 'speed', lineNumber)
      const distance = this.evaluateNumber(distanceExpr, 'distance', lineNumber)
      const priority = this.evaluateNumber(priorityExpr, 'priority', lineNumber)
      const colorCombination = this.evaluateNumber(colorCombinationExpr, 'color combination', lineNumber)

      if (
        actionNumber === null ||
        characterType === null ||
        direction === null ||
        speed === null ||
        distance === null ||
        priority === null ||
        colorCombination === null
      ) {
        return // Error already added
      }

      // Validate ranges
      if (!this.validateRange(actionNumber, 0, 7, 'action number', lineNumber)) return
      if (!this.validateRange(characterType, 0, 15, 'character type', lineNumber)) return
      if (!this.validateRange(direction, 0, 8, 'direction', lineNumber)) return
      if (!this.validateRange(speed, 1, 255, 'speed', lineNumber)) return
      if (!this.validateRange(distance, 1, 255, 'distance', lineNumber)) return
      if (!this.validateRange(priority, 0, 1, 'priority', lineNumber)) return
      if (!this.validateRange(colorCombination, 0, 3, 'color combination', lineNumber)) return

      // Create move definition
      const definition: MoveDefinition = {
        actionNumber,
        characterType: characterType as MoveCharacterCode,
        direction,
        speed,
        distance,
        priority,
        colorCombination,
      }

      // Store definition in animation manager
      if (this.context.animationManager) {
        try {
          this.context.animationManager.defineMovement(definition)
        } catch (error) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: `DEF MOVE: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME,
          })
          return
        }
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(
          `DEF MOVE: Defined action ${actionNumber} (character=${characterType}, ` +
            `direction=${direction}, speed=${speed}, distance=${distance})`
        )
      }
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `DEF MOVE: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
    }
  }

  private evaluateNumber(expr: CstNode, paramName: string, lineNumber?: number): number | null {
    try {
      const value = this.evaluator.evaluateExpression(expr)
      const num = typeof value === 'number' ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0)
      return num
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `DEF MOVE: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return null
    }
  }

  private validateRange(num: number, min: number, max: number, paramName: string, lineNumber?: number): boolean {
    if (num < min || num > max) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `DEF MOVE: ${paramName} out of range (${min}-${max}), got ${num}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return false
    }
    return true
  }
}
