# Roadmap

**Last Updated**: 2026-02-12

---

## Current Status

Family Basic IDE is feature-complete for core F-BASIC functionality. Major systems implemented:

- **Parser**: Full F-BASIC grammar with Chevrotain
- **Runtime**: Executors for all core statements
- **Platform**: Screen, sprites, animation, sound, joystick
- **UI**: Vue 3 IDE with i18n support

---

## Active Work

### Priority 1: BG GRAPHIC Editor

**Goal**: Enable users to create/edit BG GRAPHIC, making VIEW command usable.

**Why**: VIEW command is blocked — users have no tool to populate the BG GRAPHIC buffer.

**Scope**:
- BG GRAPHIC buffer storage (28×21 tiles)
- UI editor for drawing BG GRAPHIC
- Integration with VIEW command
- Load/save functionality (optional)

**Reference**: `docs/reference/family-basic-manual/page-36.md` (Screen Display Process)

**Status**: Planning — see `todo/9.open.txt`

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
| VIEW | Display BG GRAPHIC | Unblocked after BG editor complete |
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
