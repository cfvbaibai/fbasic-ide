# Executor Types Reference

This reference covers the different types of executors in the F-BASIC runtime and their patterns.

## Executor Categories

### 1. Simple I/O Commands
Commands that perform basic device I/O with no arguments.

**Examples**: `CLS`, `END`, `STOP`

```typescript
export function executeCls(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  device.clearScreen()
}
```

### 2. Commands with Expression Arguments
Commands that evaluate expressions and pass results to device.

**Examples**: `PRINT`, `LOCATE`, `CIRCLE`

```typescript
export function executeLocate(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const x = evaluateExpression(cst.children.expression[0], context)
  const y = evaluateExpression(cst.children.expression[1], context)
  device.setCursorPosition(x, y)
}
```

### 3. Control Flow Commands
Commands that modify program execution flow.

**Examples**: `GOTO`, `GOSUB`, `RETURN`, `FOR`, `NEXT`, `IF`, `THEN`

```typescript
export function executeGoto(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const lineNumber = evaluateExpression(cst.children.expression[0], context)
  context.setProgramCounter(lineNumber)
}
```

```typescript
export function executeIf(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const condition = evaluateExpression(cst.children.expression[0], context)

  if (condition !== 0) {
    // Execute THEN clause
    const thenBlock = cst.children.thenBlock[0]
    executeStatementList(thenBlock, context, device)
  }
}
```

### 4. Variable Assignment Commands
Commands that store values in variables or arrays.

**Examples**: `LET`, `DIM` (implicit)

```typescript
export function executeLet(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const varName = cst.children.identifier[0].image
  const value = evaluateExpression(cst.children.expression[0], context)
  context.setVariable(varName, value)
}
```

```typescript
export function executeArrayAssignment(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const varName = cst.children.identifier[0].image
  const indices = cst.children.expression.slice(0, -1).map(expr =>
    evaluateExpression(expr, context)
  )
  const value = evaluateExpression(cst.children.expression[indices.length], context)
  context.setArrayValue(varName, indices, value)
}
```

### 5. Sprite Commands
Commands that interact with the sprite/animation system.

**Examples**: `DEF SPRITE`, `SPRITE`, `DEF MOVE`, `MOVE`, `CUT`, `ERA`

```typescript
export function executeSprite(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const spriteId = evaluateExpression(cst.children.expression[0], context)
  const x = evaluateExpression(cst.children.expression[1], context)
  const y = evaluateExpression(cst.children.expression[2], context)

  device.setStaticSpritePosition(spriteId, x, y)
}
```

```typescript
export function executeMove(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const actionNumber = evaluateExpression(cst.children.expression[0], context)
  const startX = evaluateExpression(cst.children.expression[1], context)
  const startY = evaluateExpression(cst.children.expression[2], context)

  device.startMovement(actionNumber, startX, startY)
}
```

### 6. Input Commands
Commands that request user input (async).

**Examples**: `INPUT`, `LINE INPUT`

```typescript
export async function executeInput(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): Promise<void> {
  const prompt = cst.children.stringLiteral?.[0].image?.slice(1, -1) ?? ''
  const varName = cst.children.identifier[0].image

  device.printOutput(prompt + '? ')

  const input = await device.getInput()
  const value = parseFloat(input) ?? input

  if (varName.endsWith('$')) {
    context.setVariable(varName, input)
  } else {
    context.setVariable(varName, value)
  }
}
```

### 7. Sound Commands
Commands that play sounds or music.

**Examples**: `PLAY`, `BEEP`, `WAVE`

```typescript
export function executePlay(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const soundString = cst.children.stringLiteral[0].image.slice(1, -1)
  device.playSound(soundString)
}
```

## Error Handling Pattern

All executors should throw clear runtime errors:

```typescript
export function executeSomeCommand(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  const index = evaluateExpression(cst.children.expression[0], context)

  if (index < 0 || index > 255) {
    throw new RuntimeError(`Index out of range: ${index}`)
  }

  // ... rest of implementation
}
```

## Integration with Platform Team

When adding new commands that require device support:

1. Check if `BasicDeviceAdapter` has the required method
2. If not, note what Platform Team needs to add
3. Use mock device in tests

```typescript
// In executor
device.drawCircle(x, y, radius) // Requires Platform Team support

// In test
const device: BasicDeviceAdapter = {
  drawCircle: vi.fn(),
  // ... other methods
}
```
