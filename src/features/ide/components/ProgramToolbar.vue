<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

import { useProgramStore } from '@/features/ide/composables/useProgramStore'
import { GameIconButton } from '@/shared/components/ui'

const programStore = useProgramStore()

// Renaming state
const editingName = ref(false)
const tempName = ref('')
const nameInputEl = useTemplateRef<HTMLInputElement>('nameInputEl')

// Confirm dialog for unsaved changes
function confirmDiscard(): boolean {
  if (!programStore.isDirty.value) return true
  return confirm('Discard unsaved changes?')
}

// File operations
function handleNew() {
  if (!confirmDiscard()) return
  programStore.newProgram()
}

async function handleOpen() {
  if (!confirmDiscard()) return
  await programStore.open()
}

async function handleSave() {
  await programStore.save()
}

// Renaming
function startRename() {
  tempName.value = programStore.programName
  editingName.value = true
  nextTick(() => {
    // Focus the native input element inside GameInput
    const input = nameInputEl.value
    if (input) {
      input.focus()
      input.select()
    }
  })
}

function finishRename() {
  const newName = tempName.value.trim()
  if (newName && newName !== programStore.programName) {
    // Use setCode to trigger dirty state - name change is handled separately
    // For now, we just update the name directly in localStorage
    const program = programStore.currentProgram.value
    if (program) {
      // Create updated program with new name
      const updatedProgram = {
        ...program,
        name: newName,
        updatedAt: Date.now(),
      }
      programStore.loadProgram(updatedProgram)
    }
  }
  editingName.value = false
}

function cancelRename() {
  editingName.value = false
}

function handleNameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    finishRename()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelRename()
  }
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  // Only handle if not in an input field
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault()
        handleNew()
        break
      case 'o':
        e.preventDefault()
        handleOpen()
        break
      case 's':
        e.preventDefault()
        handleSave()
        break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="program-toolbar">
    <!-- File operations -->
    <div class="file-buttons">
      <GameIconButton
        type="default"
        icon="mdi:file-plus"
        size="small"
        title="New (Ctrl+N)"
        @click="handleNew"
      />
      <GameIconButton
        type="default"
        icon="mdi:folder-open"
        size="small"
        title="Open (Ctrl+O)"
        @click="handleOpen"
      />
      <GameIconButton
        type="primary"
        icon="mdi:content-save"
        size="small"
        title="Save (Ctrl+S)"
        :disabled="!programStore.isDirty.value"
        @click="handleSave"
      />
    </div>

    <!-- Program name -->
    <div class="program-name-container">
      <template v-if="editingName">
        <input
          ref="nameInputEl"
          v-model="tempName"
          type="text"
          class="program-name-input"
          placeholder="Program name"
          @blur="finishRename"
          @keydown="handleNameKeydown"
        />
      </template>
      <template v-else>
        <button
          class="program-name-btn"
          @click="startRename"
          :title="programStore.programName"
          type="button"
        >
          {{ programStore.programName }}
        </button>
      </template>

      <!-- Dirty indicator -->
      <span v-if="programStore.isDirty.value" class="dirty-indicator" title="Unsaved changes">
        ●
      </span>
    </div>
  </div>
</template>

<style scoped>
.program-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-right: 0.75rem;
  border-right: 1px solid var(--game-surface-border);
}

.file-buttons {
  display: flex;
  gap: 0.375rem;
}

.program-name-container {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.25rem;
}

.program-name-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0.375rem 0.5rem;
  color: var(--game-text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.program-name-btn:hover {
  background: var(--game-surface-bg-start);
  border-color: var(--game-surface-border);
}

.program-name-input {
  width: 160px;
  padding: 0.375rem 0.5rem;
  font-size: 0.9375rem;
  color: var(--game-text-primary);
  background: var(--game-surface-bg-start);
  border: 1px solid var(--base-solid-primary);
  border-radius: 4px;
  outline: none;
}

.program-name-input:focus {
  border-color: var(--base-solid-primary);
  box-shadow: 0 0 0 2px var(--base-alpha-primary-20);
}

.dirty-indicator {
  color: var(--base-solid-primary-90);
  font-size: 0.75rem;
  line-height: 1;
}
</style>
