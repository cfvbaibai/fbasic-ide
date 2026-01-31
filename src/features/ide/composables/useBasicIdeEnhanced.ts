/**
 * Enhanced Composable for Family Basic IDE functionality.
 *
 * Composes state, screen integration, worker, execution, and editor modules.
 * Single entry point; implementation is split for maintainability (<500 lines per file).
 *
 * @example
 * ```typescript
 * const {
 *   code,
 *   isRunning,
 *   output,
 *   errors,
 *   runCode,
 *   stopCode,
 *   clearOutput,
 *   highlightedCode
 * } = useBasicIde()
 * ```
 */

import { onDeactivated, onUnmounted, watch } from 'vue'

import { useBasicIdeEditor } from './useBasicIdeEditor'
import { useBasicIdeExecution } from './useBasicIdeExecution'
import { useBasicIdeScreenIntegration } from './useBasicIdeScreenIntegration'
import { useBasicIdeState } from './useBasicIdeState'
import { useBasicIdeWorkerIntegration } from './useBasicIdeWorkerIntegration'

/**
 * Enhanced composable: reactive state and methods for IDE (AST-based parser, worker, screen).
 */
export function useBasicIde() {
  const state = useBasicIdeState()
  const screen = useBasicIdeScreenIntegration(state)
  const worker = useBasicIdeWorkerIntegration(state, screen)
  const editor = useBasicIdeEditor(state)
  const execution = useBasicIdeExecution(state, worker, editor.parseCode)

  const toggleDebugMode = () => {
    state.debugMode.value = !state.debugMode.value
  }

  watch(
    state.code,
    () => {
      void editor.updateHighlighting()
    },
    { immediate: true }
  )

  onUnmounted(worker.cleanupWebWorker)
  onDeactivated(worker.cleanupWebWorker)

  return {
    // State
    code: state.code,
    isRunning: state.isRunning,
    output: state.output,
    errors: state.errors,
    variables: state.variables,
    highlightedCode: state.highlightedCode,
    debugOutput: state.debugOutput,
    debugMode: state.debugMode,
    screenBuffer: state.screenBuffer,
    cursorX: state.cursorX,
    cursorY: state.cursorY,
    bgPalette: state.bgPalette,
    backdropColor: state.backdropColor,
    spritePalette: state.spritePalette,
    cgenMode: state.cgenMode,
    spriteStates: state.spriteStates,
    spriteEnabled: state.spriteEnabled,
    movementStates: state.movementStates,
    frontSpriteNodes: state.frontSpriteNodes,
    backSpriteNodes: state.backSpriteNodes,
    pendingInputRequest: state.pendingInputRequest,
    respondToInputRequest: worker.respondToInputRequest,

    // Methods
    runCode: execution.runCode,
    stopCode: execution.stopCode,
    clearOutput: execution.clearOutput,
    clearAll: execution.clearAll,
    currentSampleType: state.currentSampleType,
    loadSampleCode: editor.loadSampleCode,
    sampleSelectOptions: editor.sampleSelectOptions,
    updateHighlighting: editor.updateHighlighting,
    validateCode: editor.validateCode,
    getParserCapabilities: editor.getParserCapabilities,
    getHighlighterCapabilities: editor.getHighlighterCapabilities,
    toggleDebugMode,

    // Web worker / screen
    sendStickEvent: worker.sendStickEvent,
    sendStrigEvent: worker.sendStrigEvent,
    sharedAnimationView: screen.sharedAnimationView,
    sharedDisplayViews: screen.sharedDisplayViews,
    setDecodedScreenState: screen.setDecodedScreenState,
    registerScheduleRender: screen.registerScheduleRender,
  }
}
