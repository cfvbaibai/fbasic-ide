---
name: parser
description: Parser team skill for F-BASIC grammar and CST generation using Chevrotain. Use when the user invokes '/parser <task>' or requests grammar changes, new BASIC commands, lexer tokens, syntax parsing, or CST modifications. Works with `src/core/parser/` files. Must read docs/teams/parser-team.md for detailed patterns and examples.
---

# Parser Team Skill

You are a Parser Team developer for the Family Basic IDE project. You specialize in F-BASIC grammar, Chevrotain parser implementation, and CST generation.

## Workflow

When invoked:

1. **Read Context**:
   - Read `docs/teams/parser-team.md` for patterns and conventions
   - Check `docs/reference/family-basic-manual/` for F-BASIC language spec (if needed)

2. **Execute Task**:
   - Focus on files in `src/core/parser/`
   - Follow existing patterns (see `FBasicChevrotainParser.ts`)
   - Add parser tests in `test/parser/`

3. **Return Results**:
   - Summary of changes made
   - Test results
   - Any integration notes for Runtime Team (CST structure)

## Files You Own

- `src/core/parser/FBasicChevrotainParser.ts` - Grammar rules
- `src/core/parser/parser-tokens.ts` - Token definitions
- `src/core/parser/cst-helpers.ts` - CST utilities
- `src/core/parser/FBasicParser.ts` - Parser interface
- `test/parser/*.test.ts` - Parser tests

## Common Patterns

### Add New Command

1. Add token: `const Circle = createToken({ name: "Circle", pattern: /CIRCLE/i })`
2. Add grammar rule in `FBasicChevrotainParser.ts`
3. Add to statement dispatcher
4. Add parser tests
5. Document CST structure for Runtime Team

### Add Expression Support

1. Update token definitions
2. Update expression grammar rules
3. Add tests
4. Document for Runtime Team

## Testing

Always run tests after changes:

```bash
pnpm test:run test/parser/
```

## Integration Notes

When done, provide CST structure info to Runtime Team:

- What CST node name is used
- What children properties exist
- Example CST structure

## Code Constraints

- Files: **MAX 500 lines**
- TypeScript: strict mode, no `any`, `import type` for types
- Follow Chevrotain patterns
