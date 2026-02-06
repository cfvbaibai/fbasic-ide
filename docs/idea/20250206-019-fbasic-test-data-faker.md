# F-BASIC Test Data Faker

**Date**: 2026-02-06
**Turn**: 19
**Status**: Conceptual
**Focus Area**: Developer Experience & Testing
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add a **Test Data Faker library** that generates valid F-BASIC programs, sprites, and test fixtures on-demand—dramatically reducing the boilerplate code needed to write tests and enabling rapid test case generation for edge cases.

## Problem Statement

### Current Test Writing Pain Points

1. **Manual Program Construction**: Every test requires hand-coding F-BASIC programs
   - Tests repeatedly write `PRINT "HELLO"` with variations
   - Must manually line number and format programs correctly
   - No shorthand for common program patterns
   - Copy-paste leads to subtle bugs in test data

2. **Limited Fixture Variety**: Tests use similar, predictable inputs
   - Edge cases rarely tested due to effort required
   - Randomized testing not feasible
   - Property-based testing not possible
   - Fuzz testing requires custom generation logic

3. **Verbose Test Setup**: Test files are long due to repetitive setup
   - Each test manually constructs parser, adapter, interpreter
   - No helper to create "standard" test configurations
   - Complex sprite/animation setup requires dozens of lines
   - Tests become hard to read due to setup noise

4. **No Program Generation Tools**: Testing limits and edge cases is difficult
   - Can't easily test "1000 line program" scenarios
   - Can't generate "maximum variable names" test
   - Can't fuzz parser with random but valid syntax
   - Can't generate sprite data patterns algorithmically

5. **Incomplete Test Coverage**: Some features are undertested
   - Color palette combinations require exhaustive manual tests
   - Nested loop depth limits not systematically tested
   - String concatenation edge cases rarely explored
   - GOTO/GOSUB complexity not stress-tested

## Proposed Solution

### 1. F-BASIC Program Builder API

Fluent API for building F-BASIC programs:

```typescript
// test/data/faker/program-builder.ts

import { programBuilder } from '@/test/data/faker'

const simpleProgram = programBuilder()
  .line(10).print('Hello World')
  .line(20).end()
  .build()

// Returns:
// '10 PRINT "Hello World"\n20 END'

const complexProgram = programBuilder()
  .line(10).forLoop('I', 1, 10)
  .line(20).printVar('I')
  .line(30).next('I')
  .line(40).end()
  .build()

// Returns:
// '10 FOR I = 1 TO 10\n20 PRINT I\n30 NEXT I\n40 END'
```

**Builder Methods:**
- `.line(n)` - Set line number
- `.print(text)` - Add PRINT statement
- `.printVar(name)` - Print variable
- `.let(name, value)` - LET assignment
- `.forLoop(var, start, end)` - FOR loop
- `.next(var)` - NEXT statement
- `.ifThen(condition, line)` - IF-THEN
- `.goto(line)` - GOTO statement
- `.gosub(line)` - GOSUB statement
- `.return()` - RETURN statement
- `.input(prompt, var)` - INPUT statement
- `.sprite(id, ...)` - DEF SPRITE
- `.move(id, ...)` - DEF MOVE
- `.cls()` - CLS command
- `.locate(x, y)` - LOCATE command
- `.color(pattern)` - COLOR command
- `.end()` - END statement
- `.build()` - Compile to F-BASIC string

### 2. Random Program Generator

Generate random but syntactically valid F-BASIC programs:

```typescript
// test/data/faker/random-program.ts

import { randomProgram } from '@/test/data/faker'

// Generate random program with 50 lines
const program = randomProgram({ lines: 50 })

// Generate with specific feature sets
const loopsOnly = randomProgram({
  lines: 20,
  features: ['for-next', 'let', 'print'],
  maxVariables: 5,
  maxNesting: 3
})

// Generate for edge case testing
const maxVariables = randomProgram({
  lines: 100,
  variableStrategy: 'exhaustive', // Use all 26*2 variables
  includeStrings: true
})
```

**Generation Strategies:**
- `simple`: Basic statements, no nesting
- `nested`: Allow control flow nesting
- `exhaustive`: Use all available resources (variables, sprites)
- `edgeCase`: Focus on boundary conditions
- `chaos`: Maximize diversity

### 3. Sprite Data Generator

Generate valid sprite character patterns:

```typescript
// test/data/faker/sprite-generator.ts

import { spriteGen } from '@/test/data/faker'

// Simple 8x8 sprite
const simpleSprite = spriteGen()
  .pattern('00111100')
  .pattern('01111110')
  .pattern('11000011')
  .pattern('10000001')
  .pattern('10000001')
  .pattern('11000011')
  .pattern('01111110')
  .pattern('00111100')
  .build()
// Returns: [0x3C, 0x7E, 0xC3, 0x81, 0x81, 0xC3, 0x7E, 0x3C]

// Random sprite
const randomSprite = spriteGen.random(8, 8)

// Named sprites (presets)
const smileyFace = spriteGen.preset('smiley')
const spaceship = spriteGen.preset('spaceship')
const character = spriteGen.preset('character', { color: 1 })
```

**Preset Library:**
- Basic shapes (circle, square, triangle)
- Characters (person, enemy, item)
- Objects (ship, bullet, platform)
- Text (numbers 0-9, letters A-Z)

### 4. Test Fixture Factory

Create complete test setups with one call:

```typescript
// test/data/faker/fixture-factory.ts

import { createFixture } from '@/test/data/faker'

// Standard interpreter fixture
const { interpreter, adapter, parser } = createFixture('interpreter')

// Custom configuration
const customFixture = createFixture('interpreter', {
  maxIterations: 10000,
  enableTracing: true,
  screenSize: 'large'
})

// Execute program from builder
const result = await createFixture('executor')
  .withProgram(
    programBuilder()
      .line(10).print('Test')
      .line(20).end()
      .build()
  )
  .execute()
```

**Fixture Types:**
- `parser`: Parser with default config
- `interpreter`: Interpreter + adapter + parser
- `executor`: Pre-configured executor
- `animator`: Animation-ready setup
- `full`: Complete IDE simulation

### 5. Expression Generator

Generate valid F-BASIC expressions:

```typescript
// test/data/faker/expression-generator.ts

import { expr } from '@/test/data/faker'

// Simple expressions
expr.number(42)        // "42"
expr.string('hello')   // '"hello"'
expr.variable('X')     // "X"

// Arithmetic
expr.add('X', 5)       // "X + 5"
expr.subtract(10, 'Y') // "10 - Y"
expr.multiply('A', 'B') // "A * B"
expr.divide('N', 2)    // "N / 2"

// Complex expressions
expr.nested(expr.add('X', expr.multiply('Y', 2)))
// "X + (Y * 2)"

// Random expressions
const randomExpr = expr.random({
  depth: 3,
  variables: ['X', 'Y', 'Z'],
  includeStrings: false,
  includeFunctions: true
})
```

### 6. Assertion Helpers

Custom assertions for F-BASIC testing:

```typescript
// test/data/faker/assertions.ts

import { assertProgram } from '@/test/data/faker'

// Assert program structure
assertProgram.hasLine(code, 10)
assertProgram.lineCount(code, 5)
assertProgram.hasVariable(code, 'X')
assertProgram.hasSpriteDef(code, 0)

// Assert execution results
assertExecution.terminatedNormally(result)
assertExecution.outputContains(result, 'Hello')
assertExecution.variableEquals(result, 'X', 42)
assertExecution.iterationCount(result, 100)

// Assert screen state
assertScreen.cursorAt({ x: 10, y: 5 })
assertScreen.characterAt({ x: 0, y: 0 }, 'H')
assertScreen.colorPattern({ x: 5, y: 3 }, 1)
```

## Implementation Phases

### Phase 1: Core Program Builder (2-3 days)

**File**: `test/data/faker/program-builder.ts` (~200 lines)

**Implementation:**
```typescript
export class ProgramBuilder {
  private lines: Map<number, string> = new Map()

  line(n: number): StatementBuilder {
    return new StatementBuilder(this, n)
  }

  addLine(n: number, statement: string): this {
    this.lines.set(n, statement)
    return this
  }

  build(): string {
    const sorted = Array.from(this.lines.entries())
      .sort((a, b) => a[0] - b[0])
    return sorted.map(([n, stmt]) => `${n} ${stmt}`).join('\n')
  }
}

export class StatementBuilder {
  constructor(
    private builder: ProgramBuilder,
    private lineNumber: number
  ) {}

  print(text: string): ProgramBuilder {
    this.builder.addLine(this.lineNumber, `PRINT "${text}"`)
    return this.builder
  }

  let(name: string, value: number | string): ProgramBuilder {
    const val = typeof value === 'string' ? `"${value}"` : value
    this.builder.addLine(this.lineNumber, `LET ${name} = ${val}`)
    return this.builder
  }

  forLoop(variable: string, start: number, end: number): ProgramBuilder {
    this.builder.addLine(this.lineNumber, `FOR ${variable} = ${start} TO ${end}`)
    return this.builder
  }

  // ... other statement methods
}

export const programBuilder = () => new ProgramBuilder()
```

**Acceptance Criteria:**
- [ ] ProgramBuilder generates valid F-BASIC syntax
- [ ] All statement types (PRINT, LET, IF, FOR, etc.) supported
- [ ] Fluent API allows chaining
- [ ] Line numbers sorted in output
- [ ] Type-safe with TypeScript

### Phase 2: Expression Generator (1-2 days)

**File**: `test/data/faker/expression-generator.ts` (~150 lines)

**Implementation:**
```typescript
export class ExpressionBuilder {
  number(n: number): string {
    return n.toString()
  }

  string(s: string): string {
    return `"${s}"`
  }

  variable(name: string): string {
    if (!/^[A-Z][\$]?$/.test(name)) {
      throw new Error(`Invalid variable name: ${name}`)
    }
    return name
  }

  add(left: string | number, right: string | number): string {
    return `${this.coerce(left)} + ${this.coerce(right)}`
  }

  subtract(left: string | number, right: string | number): string {
    return `${this.coerce(left)} - ${this.coerce(right)}`
  }

  // ... other operators

  private coerce(value: string | number): string {
    return typeof value === 'string' ? value : value.toString()
  }

  random(options?: RandomExpressionOptions): string {
    // Generate random valid expression
  }
}

export const expr = new ExpressionBuilder()
```

**Acceptance Criteria:**
- [ ] All arithmetic operators supported
- [ ] String concatenation supported
- [ ] Variable names validated
- [ ] Nested expressions generated correctly
- [ ] Random generation produces valid syntax

### Phase 3: Sprite Generator (1-2 days)

**File**: `test/data/faker/sprite-generator.ts` (~150 lines)

**Implementation:**
```typescript
export class SpriteGenerator {
  private patterns: string[] = []

  pattern(binary: string): this {
    if (binary.length !== 8 || !/^[01]+$/.test(binary)) {
      throw new Error('Pattern must be 8-bit binary')
    }
    this.patterns.push(binary)
    return this
  }

  build(): number[] {
    if (this.patterns.length !== 8) {
      throw new Error('Sprite must have exactly 8 patterns')
    }
    return this.patterns.map(p => parseInt(p, 2))
  }

  preset(name: string, options?: PresetOptions): number[] {
    const presets: Record<string, string[]> = {
      smiley: [
        '00111100',
        '01000010',
        '10100101',
        '10000001',
        '10100101',
        '10011001',
        '01000010',
        '00111100'
      ],
      spaceship: [/* ... */]
    }
    const pattern = presets[name]
    if (!pattern) throw new Error(`Unknown preset: ${name}`)
    return pattern.map(p => parseInt(p, 2))
  }

  random(): number[] {
    // Generate 8 random bytes
  }
}

export const spriteGen = () => new SpriteGenerator()
```

**Acceptance Criteria:**
- [ ] Binary patterns converted to hex correctly
- [ ] Preset library includes 5+ sprites
- [ ] Random generation produces valid 8-byte arrays
- [ ] Validation ensures 8 patterns exactly

### Phase 4: Fixture Factory (2-3 days)

**File**: `test/data/faker/fixture-factory.ts` (~200 lines)

**Implementation:**
```typescript
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { SharedBufferTestAdapter } from '@/test/adapters/SharedBufferTestAdapter'
import { FBasicParser } from '@/core/parser/FBasicParser'

interface FixtureOptions {
  maxIterations?: number
  enableTracing?: boolean
}

export class FixtureFactory {
  createInterpreter(options?: FixtureOptions) {
    const adapter = new SharedBufferTestAdapter()
    const parser = new FBasicParser()
    const interpreter = new BasicInterpreter({
      maxIterations: options?.maxIterations ?? 1000,
      maxOutputLines: 100,
      deviceAdapter: adapter,
    })
    return { interpreter, adapter, parser }
  }

  async executeProgram(code: string, options?: FixtureOptions) {
    const { interpreter, adapter } = this.createInterpreter(options)
    const result = await interpreter.execute(code)
    return { result, adapter, interpreter }
  }
}

export const createFixture = () => new FixtureFactory()
```

**Acceptance Criteria:**
- [ ] Creates valid interpreter setup
- [ ] Options passed through correctly
- [ ] executeProgram returns execution results
- [ ] Reusable across multiple tests

### Phase 5: Random Program Generator (2-3 days)

**File**: `test/data/faker/random-program.ts` (~250 lines)

**Implementation:**
```typescript
interface RandomProgramOptions {
  lines: number
  features?: Array<'print' | 'let' | 'for-next' | 'if-then' | 'goto'>
  maxVariables?: number
  maxNesting?: number
  includeStrings?: boolean
}

export function randomProgram(options: RandomProgramOptions): string {
  const features = options.features ?? ['print', 'let', 'for-next']
  const variables = allocateVariables(options.maxVariables ?? 10)
  const lines: string[] = []

  for (let i = 0; i < options.lines; i++) {
    const lineNumber = (i + 1) * 10
    const feature = pickRandom(features)
    const statement = generateStatement(feature, variables)
    lines.push(`${lineNumber} ${statement}`)
  }

  return lines.join('\n') + '\n' + (lines.length * 10 + 10) + ' END'
}

function generateStatement(
  feature: string,
  variables: string[]
): string {
  switch (feature) {
    case 'print':
      return `PRINT "${pickRandom(['Hello', 'World', 'Test'])}"`
    case 'let':
      return `LET ${pickRandom(variables)} = ${Math.floor(Math.random() * 100)}`
    case 'for-next':
      return `FOR ${pickRandom(variables)} = 1 TO ${Math.floor(Math.random() * 10) + 1}`
    // ... other cases
  }
}
```

**Acceptance Criteria:**
- [ ] Generated programs parse successfully
- [ ] All selected features appear in output
- [ ] Variable names are valid
- [ ] Line numbers are sequential
- [ ] Can generate 100+ line programs

### Phase 6: Custom Assertions (1-2 days)

**File**: `test/data/faker/assertions.ts` (~150 lines)

**Implementation:**
```typescript
import { expect } from 'vitest'

export const assertProgram = {
  hasLine(code: string, lineNumber: number) {
    const lineRegex = new RegExp(`^${lineNumber}\\s`, 'm')
    expect(code).toMatch(lineRegex)
  },

  lineCount(code: string, expected: number) {
    const lines = code.trim().split('\n')
    expect(lines.length).toBe(expected)
  },

  hasVariable(code: string, name: string) {
    const varRegex = new RegExp(`\\b${name}\\b`, 'g')
    expect(code).toMatch(varRegex)
  }
}

export const assertExecution = {
  terminatedNormally(result: ExecutionResult) {
    expect(result.status).toBe('terminated')
  },

  outputContains(result: ExecutionResult, text: string) {
    expect(result.output).toContain(text)
  }
}
```

**Acceptance Criteria:**
- [ ] All assertions work with Vitest
- [ ] Error messages are descriptive
- [ ] Assertions integrate with existing test suite

## Technical Architecture

### New Test Infrastructure

```
test/data/faker/
├── index.ts                    # Main export barrel
├── program-builder.ts          # Program builder API
├── expression-generator.ts     # Expression builder
├── sprite-generator.ts         # Sprite data generator
├── random-program.ts           # Random program generator
├── fixture-factory.ts          # Test fixture factory
├── assertions.ts               # Custom assertions
├── presets/
│   ├── sprites.ts             # Sprite preset library
│   └── programs.ts            # Program templates
└── types.ts                    # Faker type definitions
```

### Integration with Existing Tests

**Before (Verbose):**
```typescript
test('should handle nested loops', async () => {
  const adapter = new SharedBufferTestAdapter()
  const interpreter = new BasicInterpreter({
    maxIterations: 1000,
    maxOutputLines: 100,
    deviceAdapter: adapter,
  })

  const code = '10 FOR I = 1 TO 5\n20 FOR J = 1 TO 3\n30 K = I * J\n40 PRINT K\n50 NEXT J\n60 NEXT I\n70 END'

  const result = await interpreter.execute(code)

  expect(adapter.output).toContain('1')
  expect(adapter.output).toContain('15')
})
```

**After (Concise):**
```typescript
test('should handle nested loops', async () => {
  const { result } = await createFixture('executor')
    .withProgram(
      programBuilder()
        .line(10).forLoop('I', 1, 5)
        .line(20).forLoop('J', 1, 3)
        .line(30).let('K', expr.multiply('I', 'J'))
        .line(40).printVar('K')
        .line(50).next('J')
        .line(60).next('I')
        .line(70).end()
        .build()
    )
    .execute()

  assertExecution.outputContains(result, '1')
  assertExecution.outputContains(result, '15')
})
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- TypeScript standard library
- Existing Vitest integration
- Existing F-BASIC parser (for validation)

**Optional Enhancements:**
- `faker` library: For generic test data (names, colors, etc.)
- `fast-check`: For property-based testing integration

## Success Metrics

### Developer Velocity
- **Test Writing Speed**: Time to write new test reduced by 50%
- **Code Reduction**: Test code reduced by 30-40% (less boilerplate)
- **Test Diversity**: 20% increase in edge case coverage

### Test Quality
- **Edge Cases**: Systematic testing of boundaries (max variables, deep nesting)
- **Fuzz Testing**: Ability to run randomized test suites
- **Regression Detection**: Easier to generate comprehensive test cases

### Developer Experience
- **Onboarding**: New contributors write tests faster
- **Readability**: Test intent clearer with builder API
- **Maintenance**: Less duplication, easier to update

## Benefits

### Immediate Benefits
1. **Faster Test Writing**: Less boilerplate means more tests written
2. **Better Edge Cases**: Random generation finds unexpected bugs
3. **Cleaner Tests**: Test intent is clearer
4. **Property Testing**: Enable systematic testing of properties

### Long-Term Benefits
1. **Test Coverage**: Easier to achieve comprehensive coverage
2. **Fuzzing**: Random program generation can find parser bugs
3. **Documentation**: Preset programs serve as examples
4. **Quality**: More variety in test inputs

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Generated code doesn't match real usage | Validate against corpus of real F-BASIC programs |
| Random programs are too random | Provide generation strategies (simple, nested, edgeCase) |
| API becomes too complex | Start minimal, add features based on usage |
| Tests become harder to read | Keep fluent API semantic and readable |
| Performance overhead from generation | Cache common fixtures; lazy generation |

## Open Questions

1. **Validation**: Should generated programs be parsed to ensure validity?
2. **Corpus**: Should we collect real F-BASIC programs as generation reference?
3. **Property Testing**: Should we integrate fast-check for property-based tests?
4. **Presets**: How many sprite/program presets should we include?
5. **Documentation**: Should generated fixtures serve as documentation examples?

## Next Steps

1. **Prototype**: Build ProgramBuilder with 3 statement types
2. **Validate**: Use in existing tests to prove value
3. **Expand**: Add remaining statement types
4. **Integrate**: Update test documentation with faker examples
5. **Measure**: Track test writing time improvement

## Example Usage

### Property-Based Testing
```typescript
test('variable assignment is idempotent', () => {
  fc.assert(fc.property(
    fc.integer(1, 1000),
    async (value) => {
      const program = programBuilder()
        .line(10).let('X', value)
        .line(20).printVar('X')
        .line(30).end()
        .build()

      const { adapter } = await createFixture('executor')
        .withProgram(program)
        .execute()

      assertExecution.outputContains(adapter, value.toString())
    }
  ))
})
```

### Fuzz Testing
```typescript
test('parser handles random programs', async () => {
  for (let i = 0; i < 100; i++) {
    const program = randomProgram({
      lines: 50,
      features: ['print', 'let', 'for-next']
    })

    const { parser } = createFixture('parser')
    const result = await parser.parse(program)

    // Should parse or give clear error
    expect(result.success || result.errors.length > 0).toBe(true)
  }
})
```

### Edge Case Testing
```typescript
test('handles maximum nested loops', async () => {
  const program = programBuilder()
  let depth = 10
  let lineNum = 10

  for (let i = 0; i < depth; i++) {
    const varName = String.fromCharCode(65 + i) // A, B, C...
    program.line(lineNum++).forLoop(varName, 1, 2)
  }

  for (let i = depth - 1; i >= 0; i--) {
    const varName = String.fromCharCode(65 + i)
    program.line(lineNum++).next(varName)
  }

  program.line(lineNum).end()

  const { result } = await createFixture('executor')
    .withProgram(program.build())
    .execute()

  assertExecution.terminatedNormally(result)
})
```

## Related Ideas

- Complements `018-snapshot-regression-testing.md` with easier test generation
- Enables `011-test-coverage-visualizer.md` with more comprehensive tests
- Supports `010-intelligent-error-recovery.md` with fuzz testing capability

## Acceptance Criteria

### Phase 1 (Program Builder)
- [ ] ProgramBuilder generates syntactically valid F-BASIC
- [ ] All core statements supported (PRINT, LET, IF, FOR, GOTO, END)
- [ ] Fluent API chains correctly
- [ ] Type-safe TypeScript implementation
- [ ] Used in 5+ existing tests as proof of concept

### Phase 2 (Expression Generator)
- [ ] All arithmetic operators supported
- [ ] Variable names validated against F-BASIC rules
- [ ] Nested expressions generated correctly
- [ ] Random expression produces valid syntax

### Phase 3 (Sprite Generator)
- [ ] Binary-to-hex conversion accurate
- [ ] 5+ sprite presets included
- [ ] Random generation produces valid 8-byte arrays
- [ ] Validation ensures 8 patterns

### Phase 4 (Fixture Factory)
- [ ] Creates valid interpreter setup
- [ ] executeProgram helper works end-to-end
- [ ] Configuration options respected
- [ ] Reduces test setup code by 30%

### Phase 5 (Random Program Generator)
- [ ] Generated programs parse successfully 95%+ of time
- [ ] All feature combinations work
- [ ] Can generate 100+ line programs
- [ ] Variable allocation strategy works

### Phase 6 (Custom Assertions)
- [ ] All assertions integrate with Vitest
- [ ] Descriptive error messages
- [ ] Program assertions work (hasLine, hasVariable)
- [ ] Execution assertions work (terminatedNormally, outputContains)

### Overall
- [ ] Zero regression to existing test suite
- [ ] Documentation with examples included
- [ ] Type coverage 100% on faker code
- [ ] Test writing time reduced by 40%+ in practice

---

*"Test data generation shouldn't be harder than writing the code being tested. Let's make test writing as joyful as writing F-BASIC itself."*
