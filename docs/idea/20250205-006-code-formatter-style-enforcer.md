# Strategic Idea: F-BASIC Code Formatter & Style Enforcer

**Date**: 2025-02-05
**Turn**: 6
**Status**: Conceptual
**Focus Area**: Developer Experience & Code Quality
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add a **code formatter and style enforcer** to the Family Basic IDE that automatically formats F-BASIC code according to consistent style rules—eliminating manual formatting work, improving code readability, and establishing a foundation for community code standards.

## Problem Statement

### Current Developer Experience Issues

1. **Manual Formatting Burden**: F-BASIC developers spend time on mechanical formatting
   - Adding/removing spaces around operators
   - Aligning multi-line statements
   - Standardizing quote styles for strings
   - Organizing variable declarations

2. **Inconsistent Code Style**: No automated way to enforce formatting standards
   - Sample codes use different formatting conventions
   - Community code lacks consistency
   - Tutorials have varying styles
   - No shared style guide

3. **Readability Issues**: Poorly formatted code is harder to understand
   - Inconsistent spacing obscures structure
   - Line numbers don't align logically
   - Multi-line statements are hard to parse
   - Nested control flow is unclear

4. **Onboarding Friction**: New developers encounter inconsistent examples
   - Different samples use different formatting
   - No clear "right way" to format code
   - Manual comparison required to understand structure

5. **Missing Foundation for Collaboration**: Formatting is a prerequisite for sharing
   - Auto-format needed before code can be shared
   - Style conflicts in collaborative editing
   - No baseline for code review tools

## Proposed Solution

### 1. F-BASIC Code Formatter

Automatic code formatting with sensible defaults:

```typescript
interface FormatterConfig {
  // Spacing
  spaceAroundOperators: boolean        // default: true  (A = B + C)
  spaceAfterComma: boolean            // default: true  (PRINT A, B, C)
  spaceAfterColon: boolean            // default: true  (PRINT A; : PRINT B)

  // Line structure
  maxLineLength: number               // default: 80     (soft wrap)
  indentControlFlow: boolean          // default: false  (line numbers prevent indent)
  blankLineAfterEnd: boolean          // default: true

  // Case conventions
  normalizeKeywords: 'upper' | 'lower' | 'preserve'  // default: 'upper'
  normalizeFunctions: 'upper' | 'lower' | 'preserve' // default: 'upper'

  // String quotes
  preferDoubleQuotes: boolean         // default: true  (PRINT "Hello")
  escapeDoubleQuotes: boolean         // default: true  (PRINT "He said ""Hi""")

  // Line numbers
  renumberLines: boolean              // default: false
  lineNumberIncrement: number         // default: 10

  // Comments
  preserveComments: boolean           // default: true
  commentPrefix: 'REM' | "'"          // default: preserve
}
```

**Formatter Examples:**

```basic
' Before formatting
10 print"a+b=";a+b
20 forI=1to10:printI:next
30 ifx>0then100
40 DATA 1,2,3,4,5

' After formatting (default config)
10 PRINT "A+B="; A + B
20 FOR I = 1 TO 10: PRINT I: NEXT
30 IF X > 0 THEN 100
40 DATA 1, 2, 3, 4, 5
```

**Multi-Statement Formatting:**

```basic
' Before
100 FORI=1TO10:A=A+I:NEXT

' After (colon spacing)
100 FOR I = 1 TO 10: A = A + I: NEXT
```

**String Quote Normalization:**

```basic
' Before
50 PRINT 'Hello'
60 PRINT "World"

' After (preferDoubleQuotes: true)
50 PRINT "Hello"
60 PRINT "World"
```

### 2. Style Linter

Detect style deviations from configured rules:

```typescript
interface StyleIssue {
  line: number
  column: number
  rule: string
  message: string
  severity: 'error' | 'warning' | 'info'
  autoFixable: boolean
  fix?: {
    text: string
    range: [number, number]
  }
}
```

**Lint Rules:**

1. **Spacing Rules**
   - `space-around-operators`: Operators should have spaces around them
   - `space-after-comma`: Commas should be followed by space
   - `space-after-colon`: Colons should be followed by space

2. **Case Rules**
   - `keyword-case`: Keywords should be uppercase (PRINT, IF, FOR)
   - `function-case`: Functions should be uppercase (ABS, LEN, MID$)

3. **String Rules**
   - `consistent-quotes`: Use consistent quote style (prefer double)
   - `escape-quotes`: Escape quotes within strings properly

4. **Structure Rules**
   - `line-length`: Lines should not exceed 80 characters
   - `blank-line-after-end`: END statements should be followed by blank line

### 3. Format on Save

Automatic formatting when saving:

```typescript
interface FormatOnSaveOptions {
  enabled: boolean
  excludePatterns: string[]  // Don't format files matching these patterns
  timeout: number            // Max time to format (ms)
}
```

### 4. Format Selection

Format selected code only:

```basic
' User selects lines 20-40 and formats
10 PRINT "Not formatted"
20 FORI=1TO5:PRINTI:NEXT      ' ← Will be formatted
30 DATA1,2,3,4,5              ' ← Will be formatted
40 END                        ' ← Will be formatted
50 PRINT "Also not formatted"

' After format selection
10 PRINT "Not formatted"
20 FOR I = 1 TO 5: PRINT I: NEXT
30 DATA 1, 2, 3, 4, 5
40 END
50 PRINT "Also not formatted"
```

### 5. Format Document

Format entire document:

```typescript
interface FormatDocumentResult {
  edits: TextEdit[]
  didFormat: boolean
  error?: string
}
```

### 6. Configurable Style Presets

Built-in style presets:

```typescript
const STYLE_PRESETS = {
  classic: {
    // Traditional F-BASIC style
    normalizeKeywords: 'upper',
    normalizeFunctions: 'upper',
    preferDoubleQuotes: true,
    spaceAroundOperators: true,
  },
  compact: {
    // Minimal spacing, compact style
    normalizeKeywords: 'upper',
    spaceAroundOperators: false,
    spaceAfterComma: false,
  },
  modern: {
    // More readable, modern style
    normalizeKeywords: 'upper',
    preferDoubleQuotes: true,
    spaceAroundOperators: true,
    spaceAfterComma: true,
    spaceAfterColon: true,
  },
  preserve: {
    // Only normalize keywords, preserve user spacing
    normalizeKeywords: 'upper',
    spaceAroundOperators: false,
  },
}
```

### 7. Community Style Guide

Establish shared formatting conventions:

```markdown
# Family Basic Style Guide

## Spacing
- Use spaces around operators: `A = B + C`
- Use space after comma: `PRINT A, B, C`
- Use space after colon: `PRINT A: PRINT B`

## Case
- Keywords: UPPERCASE (PRINT, IF, FOR, NEXT)
- Functions: UPPERCASE (ABS, LEN, MID$)
- Variables: User preference (A$, SCORE, PlayerName)

## Strings
- Prefer double quotes: `PRINT "Hello"`
- Escape with double quotes: `PRINT "Say ""Hi"""`

## Line Numbers
- Use increments of 10: 10, 20, 30...
- Leave room for insertions

## Comments
- Use REM or single quote: `' This is a comment`
- Place comments above code they explain
```

## Implementation Priority

### Phase 1 (Core Formatter - Week 1)

**Goal**: Basic formatting functionality

1. **Formatter Engine**
   - Implement `FBasicFormatter` class
   - Tokenize code (reuse existing parser lexer)
   - Apply formatting rules
   - Generate formatted output

2. **Formatting Rules**
   - Spacing around operators
   - Spacing after commas
   - Spacing after colons
   - Keyword normalization (uppercase)
   - Function normalization (uppercase)

3. **Integration**
   - Add format command to IDE
   - Format on save option
   - Format selection command
   - Format document command

**Files to Create:**
- `src/core/formatting/FBasicFormatter.ts` - Core formatter engine
- `src/core/formatting/FormatterConfig.ts` - Configuration types
- `src/core/formatting/formattingRules.ts` - Rule definitions
- `src/features/ide/composables/useCodeFormatter.ts` - IDE integration

**Files to Modify:**
- `src/features/ide/components/MonacoCodeEditor.vue` - Add format commands
- `src/features/ide/composables/useBasicIdeEditor.ts` - Integrate formatter

### Phase 2 (Linter & Presets - Week 2)

**Goal**: Style checking and presets

1. **Style Linter**
   - Implement `FBasicLinter` class
   - Define lint rules
   - Auto-fixable issues
   - Lint UI integration

2. **Style Presets**
   - Define preset configurations
   - Preset selector UI
   - Custom configuration support

3. **Community Style Guide**
   - Write style guide documentation
   - Link from IDE help
   - Tutorial integration

**Files to Create:**
- `src/core/formatting/FBasicLinter.ts` - Linter engine
- `src/core/formatting/lintRules.ts` - Lint rule definitions
- `src/features/ide/components/StylePanel.vue` - Lint results UI
- `src/features/ide/components/FormatterConfig.vue` - Configuration UI
- `docs/style-guide.md` - Community style guide

**Files to Modify:**
- `src/features/ide/IdePage.vue` - Add lint panel
- `src/shared/i18n/en.ts` - Add localization for formatter

### Phase 3 (Polish - Optional)

**Goal**: Enhanced UX and edge cases

1. **Advanced Features**
   - Line renumbering
   - Comment preservation options
   - Multi-file formatting
   - Format on paste

2. **UX Improvements**
   - Format preview (before/after)
   - Undo integration
   - Progress indicator for large files
   - Keyboard shortcuts

3. **Testing**
   - Unit tests for formatter
   - Lint rule tests
   - Integration tests
   - Regression tests

**Files to Create:**
- `test/formatting/Formatter.test.ts` - Formatter tests
- `test/formatting/Linter.test.ts` - Linter tests
- `test/formatting/fixtures/` - Before/after fixtures

## Technical Architecture

### New Formatting Infrastructure

```
src/core/formatting/
├── FBasicFormatter.ts              # Main formatter class
├── FBasicLinter.ts                 # Style linter
├── FormatterConfig.ts              # Configuration types
├── formattingRules/
│   ├── SpacingRule.ts              # Spacing rules
│   ├── CaseNormalizationRule.ts    # Case rules
│   ├── StringQuoteRule.ts          # Quote rules
│   └── LineStructureRule.ts        # Line structure rules
├── lintRules/
│   ├── SpacingLintRule.ts          # Spacing lint
│   ├── CaseLintRule.ts             # Case lint
│   └── StringLintRule.ts           # String lint
└── presets.ts                      # Style presets

src/features/ide/
├── composables/
│   └── useCodeFormatter.ts         # Formatter composable
└── components/
    ├── FormatterConfig.vue         # Config UI
    ├── StylePanel.vue              # Lint results
    └── FormatPreview.vue           # Before/after preview
```

### Integration with Existing Code

**Parser Integration:**
- Reuse existing lexer for tokenization
- Use CST for structure analysis
- No changes to parser required

**Monaco Integration:**
- Use Monaco's formatting API
- Register format provider
- Format on save hook
- Format selection command

**UI Integration:**
- Add format button to toolbar
- Add lint panel to debug tab
- Settings page for configuration
- Keyboard shortcuts (Ctrl+Shift+F)

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing parser (Chevrotain)
- Existing editor (Monaco)
- TypeScript standard library

**Optional Enhancements:**
- `diff`: For format preview (if needed, can implement simple diff)

## Success Metrics

### Developer Velocity
- **Time Saved**: Average time saved per program (format manually vs auto)
- **Format Usage**: % of programs formatted
- **Format on Save**: % of users with format on save enabled

### Code Quality
- **Style Consistency**: % of code matching style guide
- **Lint Issues**: Average lint issues per program
- **Auto-Fix Rate**: % of lint issues auto-fixable

### User Satisfaction
- **Feature Usage**: % of sessions using formatter
- **Configuration Customization**: % of users customizing config
- **NPS**: Satisfaction with formatter

## Benefits

### Immediate Benefits
1. **Time Savings**: No manual formatting required
2. **Consistency**: All code follows same style
3. **Readability**: Easier to read and understand code
4. **Learning**: New developers learn style from formatter

### Long-Term Benefits
1. **Community Standards**: Shared style guide
2. **Collaboration**: Consistent code for sharing
3. **Foundation**: Base for advanced features (AI formatting, style migration)
4. **Quality**: Professional appearance of code

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Formatter changes code behavior | Comprehensive tests; dry-run mode; clear diff preview |
| Users dislike formatting | Opt-in by default; customizable config; format selection only |
| Performance on large files | Incremental formatting; async with progress indicator |
| Edge cases break code | Extensive test suite; conservative rules; manual review |
| Conflicts with user preferences | Highly configurable; multiple presets; preserve option |

## Open Questions

1. **Default Behavior**: Should formatter be opt-in or opt-out by default?
2. **Format on Save**: Should format on save be enabled by default?
3. **Config Storage**: Where to store user configuration (localStorage, settings file)?
4. **Line Renumbering**: Should line renumbering be included (risky)?
5. **Comment Preservation**: How to handle comments that might be moved by formatting?

## Next Steps

1. **Research**: Study formatters in other IDEs (Prettier, Black, rustfmt)
2. **Prototype**: Build basic formatter for spacing rules
3. **User Testing**: Test formatter on existing sample codes
4. **Documentation**: Write style guide draft
5. **Community**: Gather feedback on style preferences

---

*"Code formatting should be automatic, not a debate. Let developers focus on logic, not spacing. A good formatter disappears—you stop noticing it and start enjoying readable, consistent code."*
