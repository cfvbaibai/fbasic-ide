import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'

describe('Debug Execution', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter()
  })

  it('should debug string literals', async () => {
    // Enable debug mode to see what's happening
    interpreter.updateConfig({ enableDebugMode: true })
    
    const result = await interpreter.execute('10 PRINT "Factorial of"; 5; "is"; 120\n20 END')
    
    console.log('Success:', result.success)
    console.log('Output:', result.output)
    console.log('Errors:', result.errors)
    console.log('Debug output:', result.debugOutput)
    
    expect(result.success).toBe(true)
  })

  it('should debug FOR loop with expressions', async () => {
    const result = await interpreter.execute('10 LET START = 1\n20 LET FINISH = 3\n30 FOR I = START TO FINISH\n40 PRINT I\n50 NEXT I\n60 END')
    
    console.log('Success:', result.success)
    console.log('Output:', result.output)
    console.log('Errors:', result.errors)
    console.log('Debug output:', result.debugOutput)
    
    expect(result.success).toBe(true)
  })

  it('should debug GOTO with expressions', async () => {
    const result = await interpreter.execute('10 LET LINE = 30\n20 PRINT "Before"\n25 GOTO LINE\n30 PRINT "Target"\n40 END')
    
    console.log('Success:', result.success)
    console.log('Output:', result.output)
    console.log('Errors:', result.errors)
    console.log('Debug output:', result.debugOutput)
    
    expect(result.success).toBe(true)
  })

  it('should debug nested FOR loops', async () => {
    const result = await interpreter.execute('10 FOR I = 1 TO 2\n20   FOR J = 1 TO 2\n30     PRINT I, J\n40   NEXT J\n50 NEXT I\n60 END')
    
    console.log('Success:', result.success)
    console.log('Output:', result.output)
    console.log('Errors:', result.errors)
    console.log('Debug output:', result.debugOutput)
    
    expect(result.success).toBe(true)
  })
})
