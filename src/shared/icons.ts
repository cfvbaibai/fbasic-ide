/**
 * Icon registration for offline/bundled icon sets.
 * Registers icon set data with @iconify/vue; addCollection accepts this shape at
 * runtime but types declare IconifyIcons, so we centralize the type bridge here.
 */
import { addCollection } from '@iconify/vue'

/** Shape accepted by addCollection at runtime (IconifyJSON); library types differ. */
export interface IconCollectionData {
  prefix: string
  icons: Record<string, { body: string; width?: number; height?: number }>
  width: number
  height: number
}

type AddCollectionArg = Parameters<typeof addCollection>[0]

export function registerIconCollection(data: IconCollectionData): void {
  // eslint-disable-next-line no-restricted-syntax -- addCollection runtime API vs IconifyIcons type def
  addCollection(data as unknown as AddCollectionArg)
}
