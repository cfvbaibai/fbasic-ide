---
name: parser
description: Parser team skill for F-BASIC grammar and CST generation using Chevrotain. Use when the user invokes '/parser <task>' or requests grammar changes, new BASIC commands, lexer tokens, syntax parsing, or CST modifications. Works with `src/core/parser/` files. Must read docs/teams/parser-team.md for detailed patterns and examples.
---

# Parser Team Skill

Work on the F-BASIC parser using Chevrotain parser generator.

## Ownership

- **Files**: `src/core/parser/*`, `test/parser/*`
- **Responsibilities**: Grammar, CST generation, syntax error reporting

## Key Files

- `FBasicChevrotainParser.ts` - Main parser class (grammar rules)
- `parser-tokens.ts` - Token definitions (lexer)
- `cst-helpers.ts` - CST traversal utilities
- `FBasicParser.ts` - Parser interface/wrapper

## Key Pattern

**Direct CST output** (no AST conversion). Executors consume CST nodes directly.

## Common Tasks

### Add New BASIC Command

1. **Add token** to `parser-tokens.ts`:

   ```typescript
   const Circle = createToken({ name: 'Circle', pattern: /CIRCLE/i })
   ```

2. **Add grammar rule** to `FBasicChevrotainParser.ts`:

   ```typescript
   private circleStatement() {
     this.CONSUME(Circle)
     this.CONSUME(LParen)
     this.SUBRULE(this.expression)
     // ... more rules
   }
   ```

3. **Add to statement dispatcher**

4. **Add parser tests** in `test/parser/`

5. **Hand off to Runtime Team** for executor

### Fix Parsing Bug

1. Check grammar rule in `FBasicChevrotainParser.ts`
2. Add test case reproducing the bug
3. Fix grammar rule (consult `docs/reference/`)
4. Verify test passes

## Patterns

### Grammar Rule Structure

```typescript
private commandName() {
  this.CONSUME(CommandToken)
  this.SUBRULE(this.expression)
  this.CONSUME(Comma)
}
```

### Token Patterns

```typescript
const Print = createToken({ name: 'Print', pattern: /PRINT/i })
const Number = createToken({ name: 'Number', pattern: /\d+(\.\d+)?/ })
const StringLiteral = createToken({ name: 'StringLiteral', pattern: /"[^"]*"/ })
```

## Testing

- **Location**: `test/parser/`
- **Pattern**: Test both valid and invalid syntax
- **Verify**: CST structure matches expected
- **Always**: Check `result.errors` array

## Reference

- Read `docs/teams/parser-team.md` for complete guide
- **Chevrotain docs**: https://chevrotain.io/docs/
- **F-BASIC manual**: `docs/reference/family-basic-manual/`
