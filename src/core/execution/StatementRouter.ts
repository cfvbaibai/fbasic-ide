/**
 * Statement Router
 * 
 * Routes BASIC statements to their appropriate executors using CST.
 */

import { ERROR_TYPES } from '../constants'
import { PrintExecutor } from './executors/PrintExecutor'
import { LetExecutor } from './executors/LetExecutor'
import { ForExecutor } from './executors/ForExecutor'
import { NextExecutor } from './executors/NextExecutor'
import { EndExecutor } from './executors/EndExecutor'
import { PauseExecutor } from './executors/PauseExecutor'
import { IfThenExecutor } from './executors/IfThenExecutor'
import { GotoExecutor } from './executors/GotoExecutor'
import { GosubExecutor } from './executors/GosubExecutor'
import { ReturnExecutor } from './executors/ReturnExecutor'
import { OnExecutor } from './executors/OnExecutor'
import { DimExecutor } from './executors/DimExecutor'
import { DataExecutor } from './executors/DataExecutor'
import { ReadExecutor } from './executors/ReadExecutor'
import { RestoreExecutor } from './executors/RestoreExecutor'
import { ClsExecutor } from './executors/ClsExecutor'
import { LocateExecutor } from './executors/LocateExecutor'
import type { VariableService } from '../services/VariableService'
import type { DataService } from '../services/DataService'
import type { ExpressionEvaluator } from '../evaluation/ExpressionEvaluator'
import type { ExecutionContext } from '../state/ExecutionContext'
import { getFirstCstNode, getFirstToken, getCstNodes } from '../parser/cst-helpers'
import type { ExpandedStatement } from './statement-expander'

export class StatementRouter {
  private printExecutor: PrintExecutor
  private letExecutor: LetExecutor
  private forExecutor: ForExecutor
  private nextExecutor: NextExecutor
  private endExecutor: EndExecutor
  private pauseExecutor: PauseExecutor
  private ifThenExecutor: IfThenExecutor
  private gotoExecutor: GotoExecutor
  private gosubExecutor: GosubExecutor
  private returnExecutor: ReturnExecutor
  private onExecutor: OnExecutor
  private dimExecutor: DimExecutor
  private dataExecutor: DataExecutor
  private readExecutor: ReadExecutor
  private restoreExecutor: RestoreExecutor
  private clsExecutor: ClsExecutor
  private locateExecutor: LocateExecutor

  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator,
    private variableService: VariableService,
    private dataService: DataService
  ) {
    this.printExecutor = new PrintExecutor(context, evaluator)
    this.letExecutor = new LetExecutor(variableService)
    this.forExecutor = new ForExecutor(context, evaluator, variableService)
    this.nextExecutor = new NextExecutor(context, variableService)
    this.endExecutor = new EndExecutor(context)
    this.pauseExecutor = new PauseExecutor(context, evaluator)
    this.ifThenExecutor = new IfThenExecutor(context, evaluator)
    this.gotoExecutor = new GotoExecutor(context)
    this.gosubExecutor = new GosubExecutor(context)
    this.returnExecutor = new ReturnExecutor(context)
    this.onExecutor = new OnExecutor(context, evaluator, dataService)
    this.dimExecutor = new DimExecutor(context, evaluator, variableService)
    this.dataExecutor = new DataExecutor(dataService)
    this.readExecutor = new ReadExecutor(dataService, variableService, evaluator)
    this.restoreExecutor = new RestoreExecutor(dataService)
    this.clsExecutor = new ClsExecutor(context)
    this.locateExecutor = new LocateExecutor(context, evaluator)
  }

  /**
   * Route an expanded statement to its appropriate executor
   * Each expanded statement contains a single command (colon-separated commands are already expanded)
   */
  async executeStatement(expandedStatement: ExpandedStatement): Promise<void> {
    const commandCst = expandedStatement.command
    const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand)
    
    if (!singleCommandCst) {
      this.context.addError({
        line: expandedStatement.lineNumber,
        message: 'Invalid command: missing single command',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Check which command type we have
    if (singleCommandCst.children.ifThenStatement) {
      const ifThenStmtCst = getFirstCstNode(singleCommandCst.children.ifThenStatement)
      if (ifThenStmtCst) {
        // Evaluate condition
        const conditionIsTrue = this.ifThenExecutor.evaluateCondition(ifThenStmtCst, expandedStatement.lineNumber)
        
        // Execute THEN clause if condition is true
        if (conditionIsTrue) {
          // Check if it's a line number jump (IF ... THEN number or IF ... GOTO number)
          if (this.ifThenExecutor.hasLineNumberJump(ifThenStmtCst)) {
            const targetLineNumber = this.ifThenExecutor.getLineNumber(ifThenStmtCst)
            if (targetLineNumber !== undefined) {
              const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber)
              if (targetStatementIndex === -1) {
                this.context.addError({
                  line: expandedStatement.lineNumber,
                  message: `IF-THEN: line number ${targetLineNumber} not found`,
                  type: ERROR_TYPES.RUNTIME
                })
              } else {
                if (this.context.config.enableDebugMode) {
                  this.context.addDebugOutput(`IF-THEN: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex})`)
                }
                this.context.jumpToStatement(targetStatementIndex)
                return // Don't advance to next statement
              }
            }
          }
          
          // Otherwise, execute statements in THEN clause
          const thenCommandListCst = this.ifThenExecutor.getThenClause(ifThenStmtCst)
          if (thenCommandListCst) {
            // Get all commands from the command list (colon-separated commands)
            const thenCommands = getCstNodes(thenCommandListCst.children.command)
            
            // Execute each command in the THEN clause sequentially
            // Use a local index counter to track position within THEN clause for FOR/NEXT loops
            let thenCommandIndex = 0
            while (thenCommandIndex < thenCommands.length) {
              const commandCst = thenCommands[thenCommandIndex]
              if (!commandCst) break
              
              const thenStatement: ExpandedStatement = {
                statementIndex: expandedStatement.statementIndex, // Keep same statement index
                lineNumber: expandedStatement.lineNumber,
                command: commandCst
              }
              
              // Execute the command
              await this.executeStatement(thenStatement)
              
              // Check if NEXT caused a jump back (loop continuation)
              // If so, we need to restart from the FOR statement in the THEN clause
              const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand)
              if (singleCommandCst?.children.nextStatement) {
                const nextStmtCst = getFirstCstNode(singleCommandCst.children.nextStatement)
                if (nextStmtCst) {
                  // Check if NEXT caused a jump - if loop stack has a loop for this line
                  // and the current statement index matches, we need to find the FOR in THEN clause
                  // NEXT always refers to the innermost loop (no variable name in Family BASIC)
                  const activeLoop = this.context.loopStack.find(
                    loop => loop.statementIndex === expandedStatement.statementIndex
                  )
                  if (activeLoop) {
                    // Loop is active - find the FOR statement in THEN clause and restart from there
                    // Find the index of the FOR statement for this variable
                    const varName = activeLoop.variableName
                    for (let i = 0; i < thenCommands.length; i++) {
                      const cmd = thenCommands[i]
                      const singleCmd = getFirstCstNode(cmd?.children.singleCommand)
                      const forStmt = getFirstCstNode(singleCmd?.children.forStatement)
                      if (forStmt) {
                        const forVarToken = getFirstToken(forStmt.children.Identifier)
                        if (forVarToken && forVarToken.image.toUpperCase() === varName) {
                          thenCommandIndex = i // Jump back to FOR statement
                          break
                        }
                      }
                    }
                    continue // Continue loop to re-execute from FOR
                  }
                }
              }
              
              // Move to next command
              thenCommandIndex++
            }
          }
        }
      }
    } else if (singleCommandCst.children.onStatement) {
      const onStmtCst = getFirstCstNode(singleCommandCst.children.onStatement)
      if (onStmtCst) {
        // ON may jump to another line - don't advance to next statement if it jumps
        this.onExecutor.execute(onStmtCst, expandedStatement.lineNumber)
        return
      }
    } else if (singleCommandCst.children.gotoStatement) {
      const gotoStmtCst = getFirstCstNode(singleCommandCst.children.gotoStatement)
      if (gotoStmtCst) {
        // GOTO jumps to another line - don't advance to next statement
        this.gotoExecutor.execute(gotoStmtCst, expandedStatement.lineNumber)
        return
      }
    } else if (singleCommandCst.children.gosubStatement) {
      const gosubStmtCst = getFirstCstNode(singleCommandCst.children.gosubStatement)
      if (gosubStmtCst) {
        // GOSUB jumps to another line - don't advance to next statement
        this.gosubExecutor.execute(gosubStmtCst, expandedStatement.lineNumber)
        return
      }
    } else if (singleCommandCst.children.returnStatement) {
      const returnStmtCst = getFirstCstNode(singleCommandCst.children.returnStatement)
      if (returnStmtCst) {
        // RETURN may jump to another line - don't advance to next statement if it jumps
        this.returnExecutor.execute(returnStmtCst, expandedStatement.lineNumber)
        return
      }
    } else if (singleCommandCst.children.printStatement) {
      const printStmtCst = getFirstCstNode(singleCommandCst.children.printStatement)
      if (printStmtCst) {
        this.printExecutor.execute(printStmtCst)
      }
    } else if (singleCommandCst.children.letStatement) {
      const letStmtCst = getFirstCstNode(singleCommandCst.children.letStatement)
      if (letStmtCst) {
        this.letExecutor.execute(letStmtCst)
      }
    } else if (singleCommandCst.children.forStatement) {
      const forStmtCst = getFirstCstNode(singleCommandCst.children.forStatement)
      if (forStmtCst) {
        // Check if loop is already active (jumped back from NEXT)
        // If so, skip FOR initialization
        const identifierToken = getFirstToken(forStmtCst.children.Identifier)
        if (identifierToken) {
          const varName = identifierToken.image.toUpperCase()
          const existingLoop = this.context.loopStack.find(
            loop => loop.variableName === varName && loop.statementIndex === expandedStatement.statementIndex
          )
          if (existingLoop) {
            // Loop already active - skip FOR initialization
            return
          }
        }
        // Pass current statement index and line number for loop tracking
        this.forExecutor.execute(forStmtCst, expandedStatement.statementIndex, expandedStatement.lineNumber)
      }
      } else if (singleCommandCst.children.nextStatement) {
        const nextStmtCst = getFirstCstNode(singleCommandCst.children.nextStatement)
        if (nextStmtCst) {
          // NEXT may modify statement index (jump back to FOR)
          const shouldContinue = this.nextExecutor.execute(nextStmtCst, expandedStatement.lineNumber)
          if (shouldContinue) {
            // Loop continues - don't advance to next statement
            return
          }
        }
    } else if (singleCommandCst.children.endStatement) {
      const endStmtCst = getFirstCstNode(singleCommandCst.children.endStatement)
      if (endStmtCst) {
        // END stops execution immediately
        this.endExecutor.execute(endStmtCst)
        return // Don't continue executing
      }
    } else if (singleCommandCst.children.pauseStatement) {
      const pauseStmtCst = getFirstCstNode(singleCommandCst.children.pauseStatement)
      if (pauseStmtCst) {
        await this.pauseExecutor.execute(pauseStmtCst)
      }
      return
    } else if (singleCommandCst.children.dimStatement) {
      const dimStmtCst = getFirstCstNode(singleCommandCst.children.dimStatement)
      if (dimStmtCst) {
        this.dimExecutor.execute(dimStmtCst, expandedStatement.lineNumber)
      }
    } else if (singleCommandCst.children.dataStatement) {
      // DATA statements are preprocessed, but we still need to handle them during execution
      // (they're no-ops during execution, but we process them during preprocessing)
      const dataStmtCst = getFirstCstNode(singleCommandCst.children.dataStatement)
      if (dataStmtCst) {
        // DATA statements are already processed during preprocessing
        // During execution, they are no-ops
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput('DATA: Statement already processed during preprocessing')
        }
      }
    } else if (singleCommandCst.children.readStatement) {
      const readStmtCst = getFirstCstNode(singleCommandCst.children.readStatement)
      if (readStmtCst) {
        this.readExecutor.execute(readStmtCst, expandedStatement.lineNumber)
      }
    } else if (singleCommandCst.children.restoreStatement) {
      const restoreStmtCst = getFirstCstNode(singleCommandCst.children.restoreStatement)
      if (restoreStmtCst) {
        this.restoreExecutor.execute(restoreStmtCst)
      }
    } else if (singleCommandCst.children.clsStatement) {
      const clsStmtCst = getFirstCstNode(singleCommandCst.children.clsStatement)
      if (clsStmtCst) {
        this.clsExecutor.execute(clsStmtCst)
      }
    } else if (singleCommandCst.children.locateStatement) {
      const locateStmtCst = getFirstCstNode(singleCommandCst.children.locateStatement)
      if (locateStmtCst) {
        this.locateExecutor.execute(locateStmtCst, expandedStatement.lineNumber)
      }
    } else {
      // Other statement types not yet implemented
      this.context.addError({
        line: expandedStatement.lineNumber,
        message: 'Unsupported statement type',
        type: ERROR_TYPES.RUNTIME
      })
    }
  }
}
