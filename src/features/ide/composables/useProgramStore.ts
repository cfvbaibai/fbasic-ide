/**
 * useProgramStore composable
 *
 * Central state management for the Program Management System.
 * Uses singleton pattern with module-level state (same pattern as useBgEditorState).
 */

import { readonly, ref, watch } from 'vue'

import type { ProgramData, ProgramExportFile } from '@/core/interfaces'
import { createEmptyGrid } from '@/features/bg-editor/composables/useBgGrid'
import type { BgGridData } from '@/features/bg-editor/types'
import { compressBg, decompressBg } from '@/features/bg-editor/utils/bgCompression'
import { isValidProgramFile,loadJsonFile, saveJsonFile } from '@/shared/utils/fileIO'
import { generateProgramId, generateSessionId } from '@/shared/utils/id'

// ============================================================================
// Module-level Singleton State
// ============================================================================

/** Current active program */
const currentProgram = ref<ProgramData | null>(null)

/** Whether there are unsaved changes */
const isDirty = ref(false)

/** Whether the store has been initialized */
const isInitialized = ref(false)

// ============================================================================
// Auto-persist to localStorage on program changes
// ============================================================================

watch(
  currentProgram,
  (program) => {
    if (program) {
      try {
        localStorage.setItem(`program:${program.id}`, JSON.stringify(program))
        localStorage.setItem('program:current', program.id)
      } catch (error) {
        console.error('[useProgramStore] Failed to persist program:', error)
      }
    }
  },
  { deep: true }
)

// ============================================================================
// Internal Functions
// ============================================================================

/**
 * Restore the last active program from localStorage on startup
 */
function restoreLastProgram(): void {
  if (isInitialized.value) return
  isInitialized.value = true

  try {
    const currentId = localStorage.getItem('program:current')
    if (!currentId) {
      // No previous program, create new one
      newProgram()
      return
    }

    const programJson = localStorage.getItem(`program:${currentId}`)
    if (!programJson) {
      // Program data missing, create new one
      newProgram()
      return
    }

    const program = JSON.parse(programJson) as ProgramData
    currentProgram.value = program
    isDirty.value = false
  } catch (error) {
    console.error('[useProgramStore] Failed to restore program:', error)
    newProgram()
  }
}

/**
 * Create a new empty program
 */
function newProgram(): void {
  const now = Date.now()
  currentProgram.value = {
    version: 1,
    id: generateSessionId(),
    name: 'Untitled',
    code: '',
    bg: compressBg(createEmptyGrid()),
    createdAt: now,
    updatedAt: now,
  }
  isDirty.value = false
}

/**
 * Load a program into the store
 */
function loadProgram(program: ProgramData): void {
  currentProgram.value = program
  isDirty.value = false
}

/**
 * Update the program's code
 */
function setCode(code: string): void {
  if (!currentProgram.value) return

  currentProgram.value.code = code
  currentProgram.value.updatedAt = Date.now()
  isDirty.value = true
}

/**
 * Update the program's BG data
 */
function setBg(bg: BgGridData): void {
  if (!currentProgram.value) return

  currentProgram.value.bg = compressBg(bg)
  currentProgram.value.updatedAt = Date.now()
  isDirty.value = true
}

/**
 * Save the current program to file
 * Persists to localStorage and triggers file download
 */
async function save(): Promise<void> {
  if (!currentProgram.value) return

  // Create export file
  const exportFile: ProgramExportFile = {
    format: 'family-basic-program',
    version: 1,
    program: currentProgram.value,
  }

  // Download file
  await saveJsonFile(exportFile, `${currentProgram.value.name}.fbasic.json`)

  // Mark as saved
  isDirty.value = false
}

/**
 * Save the program with a new name
 * Generates new ID and saves as new file
 */
async function saveAs(name: string): Promise<void> {
  if (!currentProgram.value) return

  const now = Date.now()
  currentProgram.value = {
    ...currentProgram.value,
    id: generateProgramId(),
    name,
    updatedAt: now,
  }

  isDirty.value = false
  await save()
}

/**
 * Open a program from file
 */
async function open(): Promise<boolean> {
  try {
    const data = await loadJsonFile()

    if (!data) {
      // User cancelled
      return false
    }

    if (!isValidProgramFile(data)) {
      console.error('[useProgramStore] Invalid program file format')
      return false
    }

    const exportFile = data
    loadProgram(exportFile.program)
    return true
  } catch (error) {
    console.error('[useProgramStore] Failed to open program:', error)
    return false
  }
}

/**
 * Get the current BG data (decompressed)
 */
function getBg(): BgGridData {
  if (!currentProgram.value) {
    return createEmptyGrid()
  }
  return decompressBg(currentProgram.value.bg)
}

// ============================================================================
// Composable Export
// ============================================================================

/**
 * Composable for Program state management
 *
 * Provides singleton access to the current program with:
 * - Code and BG data management
 * - Save/Load functionality
 * - Dirty state tracking
 * - Auto-persistence to localStorage
 */
export function useProgramStore() {
  // Initialize on first use
  restoreLastProgram()

  return {
    // State (readonly to prevent direct mutation)
    currentProgram: readonly(currentProgram),
    isDirty: readonly(isDirty),

    // Getters
    get programId() {
      return currentProgram.value?.id ?? null
    },
    get programName() {
      return currentProgram.value?.name ?? 'Untitled'
    },
    get code() {
      return currentProgram.value?.code ?? ''
    },
    get bg() {
      return getBg()
    },

    // Actions
    newProgram,
    loadProgram,
    setCode,
    setBg,
    save,
    saveAs,
    open,
  }
}
