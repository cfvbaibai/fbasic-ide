/**
 * Shooting Game Bug Reproduction Test
 *
 * Tests the specific pattern from the shooting game that should create
 * 8 different enemy types but instead creates 8 MARIOs (type 0).
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { BasicInterpreter } from '@/core/BasicInterpreter'

import { SharedBufferTestAdapter } from '../adapters/SharedBufferTestAdapter'

describe('Shooting Game Bug - All enemies show as MARIO', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: SharedBufferTestAdapter
  let sharedBuffer: SharedArrayBuffer

  beforeEach(() => {
    // Create shared display buffer
    const bufferData = createSharedDisplayBuffer()
    sharedBuffer = bufferData.buffer

    // Create and configure adapter
    deviceAdapter = new SharedBufferTestAdapter()
    deviceAdapter.setSharedDisplayBuffer(sharedBuffer)
    deviceAdapter.configure({
      enableDisplayBuffer: true,
      enableAnimationBuffer: true,
    })

    interpreter = new BasicInterpreter({
      maxIterations: 10000,
      maxOutputLines: 1000,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter,
      sharedAnimationBuffer: sharedBuffer,
      sharedDisplayBuffer: sharedBuffer,
    })
  })

  it('should create different character types when FOR loop calls GOSUB', async () => {
    // This exactly mimics the shooting game's initialization
    const source = `
10 SPRITE ON:FOR X=0 TO 7:GOSUB 1000:NEXT
20 END
1000 DEF MOVE(X)=SPRITE(RND(16),RND(9),5,50,0,0):POSITION X,RND(256),RND(256):MOVE X:RETURN
`
    const result = await interpreter.execute(source)

    // Debug: print errors if any
    if (!result.success) {
      console.error('Execution failed with errors:', result.errors)
    }
    if (deviceAdapter.errorOutputs.length > 0) {
      console.error('Error outputs:', deviceAdapter.errorOutputs)
    }

    expect(result.success).toBe(true)

    // Collect character types for all 8 action numbers
    const characterTypes: number[] = []
    for (let i = 0; i < 8; i++) {
      const def = interpreter.getAnimationManager()?.getMoveDefinition(i)
      expect(def).toBeDefined()
      characterTypes.push(def?.characterType ?? -1)
    }

    console.log('Character types created:', characterTypes)
    console.log('Unique values:', new Set(characterTypes).size)

    // All should be valid (0-15)
    for (let i = 0; i < 8; i++) {
      expect(characterTypes[i]).toBeGreaterThanOrEqual(0)
      expect(characterTypes[i]).toBeLessThanOrEqual(15)
    }

    // BUG REPRODUCTION: If all are 0 (MARIO), this fails
    const uniqueCharacterTypes = new Set(characterTypes)
    expect(uniqueCharacterTypes.size).toBeGreaterThan(1)
  })

  it('should handle GOSUB with FOR loop variable correctly', async () => {
    // Test if FOR loop variable X is correctly passed to subroutine
    const source = `
10 DIM T(8)
20 FOR X=0 TO 7
30 GOSUB 1000
40 NEXT
50 FOR I=0 TO 7: PRINT T(I);:NEXT
60 END
1000 T(X)=RND(16):RETURN
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const output = deviceAdapter.printOutputs.join(' ')

    // Parse the output to get the 8 values
    const values = output.split(/\s+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n))

    console.log('Values from T(0) to T(7):', values)

    // All values should be in valid range
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(15)
    }

    // Should have 8 values (possibly more due to other output)
    expect(values.length).toBeGreaterThanOrEqual(8)

    // Get the first 8 values
    const firstEight = values.slice(0, 8)
    const uniqueValues = new Set(firstEight)

    // BUG: If all 8 values are the same (likely 0), this indicates an issue
    console.log('Unique values in first 8:', uniqueValues.size)
    expect(uniqueValues.size).toBeGreaterThan(1)
  })
})
