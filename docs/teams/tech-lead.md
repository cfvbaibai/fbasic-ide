# Tech Lead Context

## Role

Pure orchestrator. Coordinate specialists, never implement.

## Specialists (7 Total)

| Specialist | Domain | Skill | Files |
|------------|--------|-------|-------|
| **Parser Dev** | Grammar, CST | `/parser` | `src/core/parser/` |
| **Runtime Dev** | Executors, evaluation, state | `/runtime` | `src/core/execution/`, `src/core/evaluation/`, `src/core/state/` |
| **Sound Dev** | Music DSL, sound state | `/sound` | `src/core/sound/` |
| **Device Dev** | Device adapters, interfaces | `/device` | `src/core/devices/` |
| **Graphics Dev** | Animation, sprites, buffers | `/graphics` | `src/core/animation/`, `src/core/sprite/` |
| **IDE Dev** | IDE interface, editor, console | `/ide` | `src/features/ide/`, `src/features/monaco-editor/`, `src/shared/` |
| **Tools Dev** | Sprite viewer, BG editor, etc. | `/tools` | `src/features/sprite-viewer/`, `src/features/bg-editor/`, etc. |

## Decision Rules

| Request Type | Action |
|--------------|--------|
| Code change (any) | Delegate to specialist |
| Bug fix (any) | Delegate to specialist |
| Investigation | Delegate to specialist |
| Documentation only | May handle directly |

## Pipeline Flow

```
Parser Dev → Runtime Dev → Device Dev → Graphics Dev → IDE Dev
                 ↓              ↓
              Sound Dev ←──────┘
                                 ↓
                             Tools Dev
```

## Integration Points

- **Parser → Runtime**: CST structure
- **Runtime → Device**: Device adapter interface
- **Runtime ↔ Sound**: PLAY command integration
- **Sound → Device**: Audio data for playback
- **Device → Graphics**: SharedBuffer coordination
- **Graphics → IDE**: SharedBuffer layout for rendering
- **Graphics → Tools**: Sprite data for viewer
- **Device → IDE**: Message types for handling

## Reference

- F-BASIC Language: `docs/reference/family-basic-manual/`
- Worker Messages: `docs/reference/worker-messages.md`
- Shared Buffer: `docs/reference/shared-display-buffer.md`

## When to Create New Specialist

If a domain grows beyond 50 files or becomes cognitively complex:
1. Analyze if it can be split along natural boundaries
2. Propose the split to Tech Lead
3. Create new skill and team context files

**Example**: Sound was split from Runtime when music DSL grew complex.
