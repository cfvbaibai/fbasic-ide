# Roadmap

**Last Updated**: 2026-02-19

---

## Current Status

Family Basic IDE is feature-complete for core F-BASIC functionality. Major systems implemented:

- **Parser**: Full F-BASIC grammar with Chevrotain
- **Runtime**: Executors for all core statements
- **Platform**: Screen, sprites, animation, sound, joystick
- **UI**: Vue 3 IDE with i18n support
- **BG Editor**: Integrated BG GRAPHIC editor with VIEW command support (complete)

---

## Active Work

_No active work items._

---

## Completed

### BG Editor UX Enhancements (2026-02-19)

**What was implemented**:
- Responsive character palette tabs (icon-only with tooltip on hover)
- Hover preview in CHAR mode shows selected BG item before placement
- Cell canvas caching for improved painting performance
- Scale options updated (1.5x, 2x, 3x, 4x)

### BG Editor Scale Issues (2026-02-19)

**Issues fixed**:
- Scale switch display issue: Added `nextTick()` for DOM sync
- Non-integer scale rendering: Split into integer/non-integer rendering paths

### BG GRAPHIC Editor + VIEW Command Integration (2026-02-19)

**What was implemented**:
- BG Editor UI with 28×21 grid, character palette, color patterns
- Canvas-based rendering with localStorage persistence
- VIEW command executor to copy BG GRAPHIC to background screen
- Worker communication to send BG data from main thread to web worker
- Sample code "BG VIEW Test" for manual testing

**Key fix**: BG data now sent to web worker before code execution, enabling VIEW command to access BG Editor content during runtime.

---

### Todo Folder

Check `todo/` folder for all work items. Each file contains:
- `type`: bug, refactor, feature
- `status`: open, resolved, completed
- `subject`: Brief description
- `description`: Full details

---

## Backlog

### F-BASIC Commands (Optional)

| Command | Description | Notes |
|---------|-------------|-------|
| STOP | Stop execution with resume | Requires CONT |
| CONT | Continue after STOP | Requires STOP |
| POKE | Memory write | No-op or limited in web |

### Future Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| Documentation | README, user guide, architecture | Low |
| Performance | Incremental dirty updates (if needed) | Low |

---

## Archived Plans

- [Roadmap V1](archive/planning/roadmap-v1-2026-02-12.md) — Initial development phases (2026-01-24 to 2026-02-06)
- [Outstanding Work Plan V1](archive/planning/outstanding-work-plan-v1-2026-02-12.md) — Remaining commands tracking

---

## Implementation Pattern

For new commands/features:

1. **Parser**: Add token to `parser-tokens.ts`, rule to `FBasicChevrotainParser.ts`
2. **Executor**: Create in `src/core/execution/executors/`
3. **Router**: Register in `StatementRouter.ts`
4. **Device**: Add methods to `src/core/devices/*.ts` if needed
5. **Tests**: Create in `test/executors/`
6. **Docs**: Add JSDoc to executor

**Code Standards**:
- File size: max 500 lines
- TypeScript: strict mode, no `any`
- Tests: happy path + errors + edge cases

---

## References

- [F-BASIC Reference Skill](../.claude/skills/fbasic-reference/SKILL.md)
- [Family BASIC Manual](reference/family-basic-manual/)
- [Team Contexts](teams/)
