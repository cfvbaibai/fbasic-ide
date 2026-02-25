/**
 * Parser tests for CSRLIN, POS, SCR$, BEEP functions/statement
 */

import { describe, expect,test } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('CSRLIN function parser', () => {
  const parser = new FBasicParser()

  test('parses CSRLIN in PRINT statement', async () => {
    const result = await parser.parse('10 PRINT CSRLIN')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses CSRLIN in assignment', async () => {
    const result = await parser.parse('10 LET Y = CSRLIN')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses CSRLIN in expression', async () => {
    const result = await parser.parse('10 X = CSRLIN + 1')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses CSRLIN with POS in same statement', async () => {
    const result = await parser.parse('10 PRINT POS(0); ","; CSRLIN')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('CSRLIN is case-insensitive', async () => {
    const result = await parser.parse('10 PRINT csrlin')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })
})

describe('POS function parser', () => {
  const parser = new FBasicParser()

  test('parses POS(0) in PRINT statement', async () => {
    const result = await parser.parse('10 PRINT POS(0)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses POS in assignment', async () => {
    const result = await parser.parse('10 LET X = POS(0)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses POS with expression argument', async () => {
    const result = await parser.parse('10 X = POS(I)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('POS is case-insensitive', async () => {
    const result = await parser.parse('10 PRINT pos(0)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })
})

describe('SCR$ function parser', () => {
  const parser = new FBasicParser()

  test('parses SCR$(X, Y) with two arguments', async () => {
    const result = await parser.parse('10 A$ = SCR$(0, 10)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses SCR$(X, Y, Sw) with three arguments', async () => {
    const result = await parser.parse('10 C$ = SCR$(1, 10, 1)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses SCR$ in PRINT statement', async () => {
    const result = await parser.parse('10 PRINT SCR$(0, 10)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses SCR$ with expression arguments', async () => {
    const result = await parser.parse('10 A$ = SCR$(X, Y)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('SCR$ is case-insensitive', async () => {
    const result = await parser.parse('10 A$ = scr$(0, 10)')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses SCR$ result with ASC function', async () => {
    const result = await parser.parse('10 PRINT ASC(SCR$(1, 10, 1))')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })
})

describe('BEEP statement parser', () => {
  const parser = new FBasicParser()

  test('parses BEEP statement', async () => {
    const result = await parser.parse('10 BEEP')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses BEEP in IF-THEN', async () => {
    const result = await parser.parse('10 IF X = 0 THEN BEEP')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses BEEP with other statements on same line', async () => {
    const result = await parser.parse('10 BEEP: PRINT "DONE"')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('BEEP is case-insensitive', async () => {
    const result = await parser.parse('10 beep')
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })
})

describe('Combined screen functions test', () => {
  const parser = new FBasicParser()

  test('parses sample program from manual page 87', async () => {
    const code = `10 REM * CSRLIN *
20 CLS
30 FOR I=0 TO 20
40 LOCATE I, I
50 PRINT POS(0);", ";CSRLIN
60 PAUSE 20
70 NEXT`
    const result = await parser.parse(code)
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })

  test('parses sample program from manual page 87 (SCR$)', async () => {
    const code = `10 CLS
20 LOCATE 0,10
30 PRINT"FAMILY - COMPUTER"
40 PRINT"-----------------"
50 LOCATE 10,15
60 PRINT SCR$(0,10);
70 A$=SCR$(1,10)
80 PRINT A$
90 C$=SCR$(1,10,1)
100 PRINT"COLOR=";ASC(C$)
110 END`
    const result = await parser.parse(code)
    expect(result.success).toBe(true)
    expect(result.cst).toBeDefined()
  })
})
