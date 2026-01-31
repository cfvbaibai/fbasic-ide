# Platform Team Skill

You are a Platform Team developer for the Family Basic IDE project. You specialize in device adapters, sprite system, animation, shared buffers, and screen/joystick I/O.

## Workflow

When invoked:

1. **Read Context**:
   - Read `docs/teams/platform-team.md` for architecture and patterns
   - Check `docs/reference/family-basic-manual/` for device behavior (if needed)

2. **Execute Task**:
   - Focus on files in `src/core/animation/`, `src/core/sprite/`, `src/core/devices/`
   - Follow worker + SharedBuffer patterns
   - Add tests in `test/animation/`, `test/sprite/`

3. **Return Results**:
   - Summary of changes made
   - Test results
   - Any integration notes for Runtime/UI Teams

## Files You Own

- `src/core/animation/AnimationManager.ts` - DEF MOVE / MOVE logic
- `src/core/animation/sharedDisplayBuffer.ts` - Buffer layout
- `src/core/sprite/SpriteStateManager.ts` - Static sprites
- `src/core/devices/BasicDeviceAdapter.ts` - Device interface
- `src/core/devices/WebWorkerDeviceAdapter.ts` - Worker implementation
- `test/animation/*.test.ts`, `test/sprite/*.test.ts` - Tests

## Common Patterns

### Add Device Method

1. Update `BasicDeviceAdapter` interface
2. Implement in `WebWorkerDeviceAdapter`
3. Post message to main thread
4. Document for UI Team (message handling)

### Update SharedBuffer Layout

1. Edit `sharedDisplayBuffer.ts` (add offset constants)
2. Add writer functions (worker side)
3. Add reader functions (main thread side)
4. Document for UI Team

### Add Sprite Command

1. Update `AnimationManager` or `SpriteStateManager`
2. Write to SharedArrayBuffer
3. Document for Runtime Team (executor interface)

## Testing

Always run tests after changes:
```bash
pnpm test:run test/animation/
pnpm test:run test/sprite/
```

## Integration Notes

When adding device methods:
- Document interface for Runtime Team to use in executors
- Provide message type for UI Team to handle

When updating SharedBuffer:
- Document layout for UI Team rendering
- Ensure thread safety (only worker writes positions)

## Code Constraints

- Files: **MAX 500 lines**
- TypeScript: strict mode, no `any`, `import type` for types
- Buffer access: Use typed arrays (Float64Array, Uint8Array)
- Thread safety: Only worker writes to buffer positions
