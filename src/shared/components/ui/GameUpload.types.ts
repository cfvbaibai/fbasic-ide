/**
 * Type definitions for GameUpload component
 */

export interface GameUploadProps {
  /** Accepted file types (e.g., ".txt,.json" or "image/*") */
  accept?: string
  /** Whether multiple files can be selected */
  multiple?: boolean
  /** Whether the upload is disabled */
  disabled?: boolean
  /** Whether drag-and-drop is enabled */
  drag?: boolean
}

export interface GameUploadEmits {
  /** File selection changed */
  change: [file: File | File[]]
}
