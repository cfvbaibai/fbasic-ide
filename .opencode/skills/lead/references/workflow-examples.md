# Workflow Examples Reference

This reference contains detailed workflow examples for the Tech Lead to use when decomposing tasks.

## Example 1: Add CIRCLE Command

### Analysis

**Feature Request**: "Add CIRCLE command to draw circles on screen"

**Affected Teams**:
- Parser: Grammar rule, token
- Runtime: CircleExecutor implementation
- Platform: Draw circle primitive in device adapter
- UI: No changes needed

### Task Decomposition

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Parser Team                                            │
│  Task: Add CIRCLE grammar rule and token                        │
│  Files: src/core/parser/parser-tokens.ts, FBasicChevrotainParser.ts │
│  Output: CST with circleStatement node                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Runtime Team                                           │
│  Task: Implement CircleExecutor                                 │
│  Files: src/core/execution/executors/CircleExecutor.ts          │
│  Output: Calls device.drawCircle(x, y, radius)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Platform Team                                          │
│  Task: Add drawCircle to BasicDeviceAdapter                     │
│  Files: src/core/devices/BasicDeviceAdapter.ts,                 │
│         src/core/devices/WebWorkerDeviceAdapter.ts              │
│  Output: Konva circle rendering on main thread                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Integration                                            │
│  Task: Verify end-to-end flow                                   │
│  - Test: 10 CIRCLE(100, 100, 50)                               │
│  - Verify: Circle appears at correct position                   │
└─────────────────────────────────────────────────────────────────┘
```

### Sub-Agent Tasks

**Parser Team**:
```
Task: Add CIRCLE grammar rule to F-BASIC parser

Add CIRCLE command with syntax: CIRCLE(x, y, radius)

1. Add Circle token to parser-tokens.ts
2. Add circleStatement grammar rule in FBasicChevrotainParser.ts
3. Add to statement dispatcher OR clause
4. Add parser tests for valid/invalid CIRCLE syntax
5. Document CST structure for Runtime Team

Files to modify:
- src/core/parser/parser-tokens.ts
- src/core/parser/FBasicChevrotainParser.ts
- test/parser/circle.test.ts (new file)
```

**Runtime Team**:
```
Task: Implement CircleExecutor for CIRCLE command

Create executor that evaluates x, y, radius expressions and calls device.drawCircle()

1. Create src/core/execution/executors/CircleExecutor.ts
2. Extract and evaluate three expression arguments
3. Call device.drawCircle(x, y, radius)
4. Add to ExecutionEngine dispatcher
5. Add executor tests with mock device

Files to modify:
- src/core/execution/executors/CircleExecutor.ts (new file)
- src/core/execution/ExecutionEngine.ts
- test/executors/CircleExecutor.test.ts (new file)
```

**Platform Team**:
```
Task: Add drawCircle method to BasicDeviceAdapter

Implement circle drawing using Konva on main thread.

1. Add drawCircle(x, y, radius) to BasicDeviceAdapter interface
2. Implement in WebWorkerDeviceAdapter (postMessage to main thread)
3. Add message handler in UI composables
4. Implement Konva circle rendering

Files to modify:
- src/core/devices/BasicDeviceAdapter.ts
- src/core/devices/WebWorkerDeviceAdapter.ts
- src/features/ide/composables/useBasicIdeMessageHandlers.ts
```

---

## Example 2: Add Dark Mode Toggle

### Analysis

**Feature Request**: "Add dark/light theme toggle to IDE toolbar"

**Affected Teams**:
- UI: Theme toggle button, theme state management
- Other teams: No changes needed

### Task Decomposition

**Single Team Task** - UI only

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: UI Team                                                │
│  Task: Add theme toggle button to IDE toolbar                   │
│  Files: src/features/ide/components/ThemeToggle.vue            │
│  Output: Toggle button that switches themes                     │
└─────────────────────────────────────────────────────────────────┘
```

### Sub-Agent Task

**UI Team**:
```
Task: Add theme toggle button to IDE toolbar

Create a toggle button that switches between light and dark themes.

1. Create ThemeToggle.vue component with sun/moon icons
2. Add theme composable (useTheme.ts) if not exists
3. Update [data-theme] attribute on documentElement
4. Save preference to localStorage
5. Add to BasicIde.vue toolbar
6. Add component tests

Files to modify:
- src/features/ide/components/ThemeToggle.vue (new file)
- src/shared/composables/useTheme.ts (create if needed)
- src/features/ide/BasicIde.vue
```

---

## Example 3: Fix GOTO Line Number Bug

### Analysis

**Bug Report**: "GOTO doesn't jump to the correct line number"

**Affected Teams**:
- Runtime: GotoExecutor bug fix (single team)

### Task Decomposition

**Single Team Bug Fix** - Runtime only

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Identify Bug                                            │
│  Task: Add test case reproducing the bug                        │
│  File: test/executors/GotoExecutor.test.ts                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Fix Bug                                                │
│  Task: Fix GotoExecutor line number lookup                      │
│  File: src/core/execution/executors/GotoExecutor.ts             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Verify                                                  │
│  Task: Run tests to verify fix                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Example 4: Add Sprite Animation System

### Analysis

**Feature Request**: "Add DEF MOVE and MOVE commands for sprite animation"

**Affected Teams**:
- Parser: Grammar for DEF MOVE, MOVE
- Runtime: DefMoveExecutor, MoveExecutor
- Platform: AnimationManager, AnimationWorker, SharedBuffer extension
- UI: Konva sprite rendering from buffer

### Task Decomposition

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Platform Team (Foundation)                             │
│  Task: Create AnimationWorker and shared buffer layout          │
│  Files: AnimationWorker.ts, sharedDisplayBuffer.ts              │
│  Output: Worker that updates sprite positions at 60Hz           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Parser Team                                            │
│  Task: Add DEF MOVE and MOVE grammar rules                      │
│  Files: parser-tokens.ts, FBasicChevrotainParser.ts             │
│  Output: CST with defMoveStatement, moveStatement               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Runtime Team                                           │
│  Task: Implement DefMoveExecutor and MoveExecutor               │
│  Files: executors/DefMoveExecutor.ts, MoveExecutor.ts           │
│  Output: Executors that send commands to AnimationWorker        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: UI Team                                                │
│  Task: Read sprite positions from buffer, render with Konva     │
│  Files: useScreenAnimationLoopRenderOnly.ts                     │
│  Output: Animated sprites on screen                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Integration                                            │
│  Task: Test full animation pipeline                             │
│  - DEF MOVE pattern, START, coordinates                         │
│  - Verify sprites move correctly across screen                   │
│  - Test edge wrapping (256×240 bounds)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Example 5: Add INPUT Statement Support

### Analysis

**Feature Request**: "Add INPUT statement for user input during program execution"

**Affected Teams**:
- Parser: Grammar for INPUT statement
- Runtime: InputExecutor with async handling
- UI: Input dialog/overlay in IDE
- Platform: Not involved

### Task Decomposition

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Parser Team                                            │
│  Task: Add INPUT grammar rule                                   │
│  Files: FBasicChevrotainParser.ts                               │
│  Output: CST with inputStatement                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: UI Team (Worker Message Support)                       │
│  Task: Add REQUEST_INPUT message handling                      │
│  Files: useBasicIdeMessageHandlers.ts                          │
│  Output: Shows input prompt, sends INPUT_VALUE back            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Runtime Team                                           │
│  Task: Implement InputExecutor with async/await                │
│  Files: executors/InputExecutor.ts                              │
│  Output: Executor that pauses execution, waits for input        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Integration                                            │
│  Task: Test async input flow                                    │
│  - Program pauses at INPUT                                      │
│  - UI shows prompt                                              │
│  - User types value, presses Enter                              │
│  - Program resumes with value in variable                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Multi-Team Coordination Checklist

### Before Starting
- [ ] Check `docs/roadmap.md` for related work
- [ ] Check `todo/` folder for existing items
- [ ] Identify all affected teams
- [ ] Determine dependencies (which team must go first)

### During Execution
- [ ] Spawn sub-agents in dependency order
- [ ] Each sub-agent reads their team context
- [ ] Collect outputs from each team
- [ ] Identify integration points

### After Completion
- [ ] Verify cross-team boundaries work
- [ ] Run full test suite
- [ ] Update relevant todo files
- [ ] Create commit with all changes

### Common Integration Points to Verify

| From | To | Interface |
|------|-----|-----------|
| Parser | Runtime | CST node structure |
| Runtime | Platform | BasicDeviceAdapter methods |
| Platform | UI | SharedArrayBuffer layout |
| Runtime | UI | Worker message types |
| UI | Runtime | EXECUTE, STOP, INPUT_VALUE messages |
