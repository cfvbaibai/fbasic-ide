# Debug Console Panel

## Idea Type
SMALL - Focused feature implementable in 1-2 weeks

## Problem Statement
The Family Basic IDE currently has debug output infrastructure in place (see `src/core/interfaces.ts:75` - `debugOutput()` method on `BasicDeviceAdapter`, and `MessageHandlerContext.debugOutput` ref), but this capability is not exposed to users in a meaningful way. Debug messages are written to an internal string but there is no dedicated UI component to view them.

This creates several issues:
1. **Hidden debug information**: Users running programs with debug statements cannot see the output
2. **Limited debugging workflow**: Developers learning F-BASIC have no way to inspect intermediate values
3. **Underutilized infrastructure**: Existing debug output path exists but is effectively dead code

## Proposed Solution
Add a dedicated Debug Console panel to the IDE that displays debug output separately from standard PRINT output. This provides a clean separation between:
- **Output Panel**: User-facing PRINT results (what the program's user sees)
- **Debug Console**: Developer-facing debug information (what the developer sees)

## Architecture

### Components to Create
1. **`DebugConsole.vue`** - New component in `src/features/ide/components/`
   - Display-only view of `debugOutput` string
   - Monospace font, auto-scroll to bottom
   - Clear button to wipe debug buffer
   - Collapsible panel (default collapsed to save space)

2. **IDE Integration** - Modify `src/features/ide/components/BasicIde.vue` or relevant layout
   - Add Debug Console panel alongside existing Output/Error panels
   - Connect to existing `debugOutput` ref from `useBasicIdeEnhanced`

### Existing Integration Points
The infrastructure already exists:
- `BasicDeviceAdapter.debugOutput(output: string)` method
- `MessageHandlerContext.debugOutput: Ref<string>`
- `handleOutputMessage()` routes `outputType === 'debug'` to `context.debugOutput.value += outputText + '\n'`

## Implementation Phases

### Phase 1: Create DebugConsole Component (2-3 days)
**File**: `src/features/ide/components/DebugConsole.vue`

```typescript
// Props
interface Props {
  modelValue: string  // v-model for debug output content
}

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'clear': []
}>()

// Features
- Auto-scroll to bottom when new content arrives
- Copy all to clipboard button
- Clear button
- Collapsible header
- Monospace font family
- Max-height with overflow-y auto
```

### Phase 2: IDE Integration (2-3 days)
**File**: `src/features/ide/components/BasicIde.vue` (or relevant layout component)

Changes:
1. Import `DebugConsole.vue`
2. Add to panel layout (likely after Error Panel or as a tab)
3. Bind to existing `debugOutput` ref

```vue
<DebugConsole
  v-model="debugOutput"
  @clear="debugOutput = ''"
/>
```

### Phase 3: Testing (1-2 days)
**File**: Create test file `test/features/ide/DebugConsole.test.ts`

Tests:
1. Renders debug output correctly
2. Auto-scrolls on new content
3. Clear button wipes buffer
4. Copy button copies to clipboard
5. Collapsible toggle works

**Manual Test Program**:
```basic
10 PRINT "User output"
20 DEBUG "This is debug info: X="; 10
30 FOR I = 1 TO 5
40 DEBUG "Loop iteration: "; I
50 NEXT I
60 PRINT "Done"
```

### Phase 4: Polish (1-2 days)
1. Add keyboard shortcut to toggle debug console (Ctrl+Shift+D)
2. Add visual indicator when debug console has content but is collapsed
3. Add timestamps option for debug messages
4. Ensure responsive design works on mobile

## Success Metrics
1. **Functional**: Debug statements in F-BASIC code display in the Debug Console panel
2. **Usability**: Clear visual distinction between output and debug panels
3. **Performance**: No lag when receiving large amounts of debug output
4. **Completeness**: All existing debug output paths (currently hidden) are now visible

## Files to Modify

### New Files
- `src/features/ide/components/DebugConsole.vue` (~150 lines)
- `test/features/ide/DebugConsole.test.ts` (~100 lines)

### Modified Files
- `src/features/ide/components/BasicIde.vue` (~20 lines - import + add panel)
- `src/features/ide/composables/useBasicIdeEnhanced.ts` (verify debugOutput ref is exported)

## Long-Term Vision
The Debug Console is a foundational feature that enables:
1. **Educational value**: Students can trace program execution
2. **Advanced debugging**: Foundation for future breakpoint/watch features
3. **Telemetry**: Could be extended with log levels (info, warn, error)
4. **Integration**: Could tie into proposed "Execution Tracing Debug Visualizer" (idea 014)

## Related Ideas
- Complements `011-test-coverage-visualizer.md` by adding runtime visibility
- Enables better debugging for `010-intelligent-error-recovery.md`
- Could integrate with `014-execution-tracing-debug-visualizer.md`

## Acceptance Criteria
- [ ] Debug Console panel displays `debugOutput` content
- [ ] Panel is collapsible (default collapsed)
- [ ] Clear button wipes debug buffer
- [ ] Auto-scrolls to bottom on new messages
- [ ] Keyboard shortcut (Ctrl+Shift+D) toggles visibility
- [ ] No regression to existing Output/Error panel functionality
- [ ] Test coverage > 80% for DebugConsole component
