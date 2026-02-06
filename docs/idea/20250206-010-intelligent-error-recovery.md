# Strategic Idea: Intelligent Error Recovery & Quick-Fix System

**Date**: 2026-02-06
**Turn**: 10
**Status**: Conceptual
**Focus Area**: Developer Experience & Code Quality
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add an **intelligent error recovery and quick-fix system** to the Family Basic IDE that transforms cryptic F-BASIC errors into actionable, human-friendly guidance—reducing debugging time from minutes to seconds while teaching developers better patterns.

## Problem Statement

### Current Error Handling Issues

1. **Cryptic Error Messages**: Developers struggle to understand what went wrong
   - "Syntax Error at line 15" without context or details
   - Parser errors show technical token names (IDENTIFIER, STRING_LITERAL) not friendly terms
   - Runtime errors don't show the problematic value or context
   - No indication of what the parser expected instead

2. **No Quick Fixes**: Every error requires manual research and fixing
   - No suggestion for common typos (PRITN → PRINT)
   - No automatic fix for missing syntax (missing THEN after IF)
   - No code suggestions to resolve errors
   - Cannot apply fix with single click

3. **Error Context Missing**: Developers must hunt down the problem
   - No highlighting of exact error location in editor
   - No inline error indicators while typing
   - No related information panel for errors
   - Error message disappears after scrolling

4. **Repetitive Errors**: Same mistakes happen repeatedly
   - No learning from past errors
   - No warning before common mistakes
   - No pattern recognition for error-prone code
   - No proactive error prevention

5. **Poor Learning Experience**: Errors don't teach developers
   - No explanation of why something is wrong
   - No links to documentation
   - No examples of correct usage
   - Error messages don't build understanding

## Proposed Solution

### 1. Enhanced Error Messages

Transform technical errors into human-friendly messages:

```typescript
interface EnhancedError {
  // Basic error info
  line: number
  column: number
  code: string

  // User-friendly presentation
  severity: 'error' | 'warning' | 'info'
  title: string                    // Short, clear summary
  message: string                  // Detailed explanation
  cause: string                    // Why this happened

  // Visual presentation
  highlightRange: [number, number] // Exact range to highlight

  // Quick fixes
  quickFixes: QuickFix[]

  // Learning
  documentationLink?: string
  relatedExamples?: string[]
  learnMore?: string
}

interface QuickFix {
  id: string
  label: string                    // Button text
  description: string              // What this fix does
  edits: TextEdit[]                // Code changes to apply
  confidence: 'high' | 'medium' | 'low'
  autoApplyable: boolean           // Can apply without prompt
}
```

**Before vs After Examples:**

```basic
' Code with error
10 PRITN "Hello"
20 IF X > 0
30 PRINT X
```

**Current Error:**
```
Line 10: Syntax Error: Unexpected token
Line 20: Syntax Error: Expected token of type THEN
```

**Enhanced Errors:**

```
Line 10, Column 3: typo
  PRITN "Hello"
  ~~~~~
  Error: 'PRITN' is not a valid command. Did you mean 'PRINT'?

  Quick Fixes:
  [Change to PRINT] [Delete this line]

  Learn more: F-BASIC Commands → PRINT

---

Line 20, Column 8: missing-then
  IF X > 0
  ~~~~~~~~^
  Error: IF statement must be followed by THEN

  Quick Fixes:
  [Add THEN] [Add THEN and action]

  Example:
  20 IF X > 0 THEN 30

  Learn more: F-BASIC Reference → IF-THEN Statement
```

### 2. Real-Time Error Detection

Show errors as you type, not just when running:

```typescript
interface RealTimeDiagnostics {
  // Parse errors (red squiggly underline)
  syntaxErrors: EnhancedError[]

  // Warnings (yellow squiggly underline)
  warnings: DiagnosticWarning[]

  // Info hints (blue underline)
  hints: DiagnosticHint[]
}

interface DiagnosticWarning {
  line: number
  column: number
  message: string
  rule: string
  // Warnings for:
  // - Unused variables
  // - Unreachable code
  // - Missing END statement
  // - Line number gaps
}

interface DiagnosticHint {
  line: number
  message: string
  // Hints for:
  // - Code improvements
  // - Performance tips
  // - Modern alternatives
}
```

**Real-Time Detection Examples:**

```basic
10 A = 10
20 B = 20
30 PRINT A
'    ~~~~~ Warning: Variable 'B' is defined but never used
40 GOTO 20
'        ~~~ Warning: This code creates an infinite loop
50 END
'   ~~~ Warning: This line is unreachable
```

### 3. Quick Fix Actions

One-click fixes for common errors:

```typescript
interface QuickFixProvider {
  // Get available fixes for an error
  getQuickFixes(error: EnhancedError): QuickFix[]

  // Apply a fix
  applyFix(fix: QuickFix): Promise<void>

  // Preview a fix
  previewFix(fix: QuickFix): CodePreview
}
```

**Quick Fix Categories:**

1. **Typo Correction** (high confidence):
   - PRITN → PRINT
   - FO → FOR
   - NXT → NEXT
   - ENMD → END

2. **Missing Syntax** (high confidence):
   - IF X > 0 → IF X > 0 THEN
   - FOR I = 1 → FOR I = 1 TO 10
   - DEF SPRITE = ... → DEF SPRITE (0) = ...

3. **Structure Issues** (medium confidence):
   - Add missing END statement
   - Balance quotes in strings
   - Close parentheses
   - Match FOR/NEST pairs

4. **Style Improvements** (low confidence):
   - Uppercase keywords
   - Add spaces around operators
   - Fix line number ordering

### 4. Error Panel UI

Dedicated panel for all errors and warnings:

```vue
<template>
  <div class="error-panel">
    <div class="error-header">
      <ErrorIcon :severity="highestSeverity" />
      <span>{{ errorCount }} Errors, {{ warningCount }} Warnings</span>
    </div>

    <div class="error-list">
      <ErrorCard
        v-for="error in sortedErrors"
        :key="error.id"
        :error="error"
        @fix="applyQuickFix"
        @goto="goToError"
      />
    </div>
  </div>
</template>
```

**Error Panel Features:**
- List all errors sorted by severity/line
- Filter by error type
- Jump to error location on click
- Apply quick fixes directly from panel
- Error history (recent errors)
- Error search

### 5. Inline Error Indicators

Show errors directly in the editor:

```typescript
interface InlineErrorIndicator {
  // Show error decorations
  showErrors(errors: EnhancedError[]): void

  // Decorations per error
  decorations: {
    squiggle: ErrorSquiggle        // Red/yellow wavy line
    marginIcon: ErrorMarginIcon    // Icon in gutter
    hoverMessage: string           // Tooltip on hover
  }
}
```

**Inline Indicator Features:**
- Red squiggly for errors
- Yellow squiggly for warnings
- Blue squiggly for hints
- Error icons in line number gutter
- Hover shows error message
- Click shows quick fix menu

### 6. Error Recovery Suggestions

Suggest fixes when program won't run:

```typescript
interface ErrorRecoveryAdvisor {
  // Analyze all errors together
  analyze(errors: EnhancedError[]): RecoveryPlan

  // Suggest recovery strategy
  suggestRecovery(errors: EnhancedError[]): RecoverySuggestion
}

interface RecoveryPlan {
  priority: FixPriority             // Which errors to fix first
  blockers: string[]                // Errors blocking execution
  cascade: ErrorCascade[]           // Errors causing others
  suggestedActions: RecoveryAction[]
}

interface RecoveryAction {
  action: string
  errorsToFix: string[]
  estimatedImpact: string
  difficulty: 'easy' | 'medium' | 'hard'
}
```

**Recovery Advice Example:**

```
Your program has 3 errors. Here's how to fix them:

Priority 1: Fix syntax errors first
  [Fix] Line 10: 'PRITN' → 'PRINT'
  [Fix] Line 20: Add 'THEN' after IF

Priority 2: Fix warnings (optional)
  [Fix] Line 30: Remove unused variable 'B'
  [Fix] Line 50: Remove unreachable code

[Apply All Priority 1 Fixes] [Fix One by One]
```

## Implementation Priority

### Phase 1 (Enhanced Error Messages - Week 1)

**Goal**: Transform errors into actionable messages

1. **Error Message Enhancement**
   - Create error message templates
   - Map parser errors to user-friendly messages
   - Add error context (line, column, range)
   - Include "what went wrong" explanations

2. **Quick Fix Engine**
   - Implement typo correction (Levenshtein distance)
   - Add missing syntax detection
   - Create TextEdit generation for fixes
   - Build fix application logic

3. **Basic UI Integration**
   - Enhanced error display in output panel
   - Error highlighting in Monaco editor
   - Quick fix button in error messages

**Files to Create:**
- `src/core/errors/EnhancedError.ts` - Enhanced error types
- `src/core/errors/QuickFixProvider.ts` - Quick fix engine
- `src/core/errors/errorMessages.ts` - Error message templates
- `src/core/errors/typoDetector.ts` - Typo detection
- `src/features/errors/composables/useErrorHandling.ts` - Error handling composable

**Files to Modify:**
- `src/core/parser/` - Add error context to parser errors
- `src/core/execution/` - Enhance runtime error messages
- `src/features/ide/components/MonacoCodeEditor.vue` - Add error decorations
- `src/features/ide/components/RuntimeOutput.vue` - Enhanced error display

### Phase 2 (Real-Time Diagnostics - Week 2)

**Goal**: Show errors as you type

1. **Real-Time Parsing**
   - Parse on every keystroke (debounced)
   - Detect syntax errors immediately
   - Show inline error indicators
   - Update error panel in real-time

2. **Diagnostic Warnings**
   - Detect unused variables
   - Find unreachable code
   - Check for missing END
   - Validate line number sequences

3. **Error Panel UI**
   - Dedicated error panel component
   - Error list with filtering
   - Jump to error navigation
   - Error history tracking

**Files to Create:**
- `src/core/diagnostics/RealTimeParser.ts` - Real-time parsing
- `src/core/diagnostics/WarningDetector.ts` - Warning detection
- `src/features/errors/components/ErrorPanel.vue` - Error panel UI
- `src/features/errors/components/ErrorCard.vue` - Individual error card
- `src/features/errors/components/QuickFixMenu.vue` - Quick fix menu

**Files to Modify:**
- `src/features/ide/IdePage.vue` - Add error panel tab
- `src/features/ide/composables/useBasicIdeEditor.ts` - Real-time diagnostics
- `src/shared/i18n/en.ts` - Error message translations

## Technical Architecture

### New Error Handling Infrastructure

```
src/core/errors/
├── EnhancedError.ts               # Enhanced error types
├── QuickFixProvider.ts            # Quick fix engine
├── errorMessages.ts               # Error message templates
├── typoDetector.ts                # Typo detection (Levenshtein)
├── syntaxAnalyzer.ts              # Syntax pattern analysis
└── recoveryAdvisor.ts             # Error recovery suggestions

src/core/diagnostics/
├── RealTimeParser.ts              # Real-time parsing service
├── WarningDetector.ts             # Warning detection rules
├── DiagnosticCollector.ts         # Diagnostic aggregation
└── DiagnosticCache.ts             # Diagnostic caching

src/features/errors/
├── components/
│   ├── ErrorPanel.vue             # Error list panel
│   ├── ErrorCard.vue              # Individual error display
│   ├── QuickFixMenu.vue           # Quick fix menu
│   ├── InlineErrorIndicator.vue   # Inline error decorator
│   └── ErrorRecoveryGuide.vue     # Recovery suggestions
├── composables/
│   ├── useErrorHandling.ts        # Error state management
│   ├── useQuickFixes.ts           # Quick fix logic
│   ├── useDiagnostics.ts          # Real-time diagnostics
│   └── useErrorNavigation.ts      # Error navigation
└── types/
    └── errors.ts                  # Error-related types
```

### Integration with Existing Systems

**Parser Integration:**
- Enhance parser error output with context
- Include token position and expected tokens
- Add error recovery points
- No changes to parsing logic required

**Monaco Integration:**
- Use Monaco's decoration API for squigglies
- Use Monaco's marker API for gutter icons
- Register custom language features
- Leverage Monaco's quick fix infrastructure

**Web Worker Integration:**
- Parse in worker thread
- Send diagnostics to main thread
- Minimal UI impact
- Debounced parsing (300ms)

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing parser (Chevrotain)
- Existing editor (Monaco)
- TypeScript standard library
- Levenshtein distance (can implement simple version)

**Optional Enhancements:**
- `fast-levenshtein`: Faster typo detection
- `monaco-editor`: Already using, just leverage more features

## Success Metrics

### Developer Velocity
- **Fix Time**: Average time to resolve an error
- **Quick Fix Usage**: % of errors fixed with quick fix
- **Error Reduction**: % decrease in repeated errors
- **Iteration Speed**: Time between error discovery and fix

### User Satisfaction
- **Error Understanding**: % of errors understood without help
- **Feature Usage**: % of sessions using error panel
- **Quick Fix Adoption**: % of quick fixes applied
- **NPS**: Satisfaction with error messages

### Learning Impact
- **Pattern Learning**: % decrease in common errors over time
- **Documentation Access**: % of errors where docs are viewed
- **Example Usage**: % of errors where examples are viewed
- **Skill Development**: Error resolution speed improvement over time

## Benefits

### Immediate Benefits
1. **Faster Debugging**: Know exactly what's wrong and how to fix it
2. **Less Frustration**: Clear messages reduce confusion
3. **Better Learning**: Errors teach, not just punish
4. **Increased Confidence**: Quick fixes encourage experimentation

### Long-Term Benefits
1. **Skill Development**: Developers learn patterns from fixes
2. **Code Quality**: Fewer errors make it into production
3. **Community**: Shared error knowledge helps everyone
4. **Accessibility**: Better for non-native speakers

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Wrong quick fixes break code | Confidence scores; preview changes; easy undo |
| Performance overhead from real-time parsing | Debounce; cache results; worker thread |
| False positives in warnings | Make warnings optional; allow disable |
| Error message localization effort | Start with English; community translations |
| Quick fix edge cases | Extensive testing; manual review for complex fixes |

## Open Questions

1. **Quick Fix Threshold**: What confidence level should auto-apply fixes?
2. **Real-Time Performance**: Can we parse on every keystroke without lag?
3. **Error Persistence**: Should we save error history across sessions?
4. **Warning Aggressiveness**: How strict should warnings be by default?
5. **Localization Priority**: Which languages to support first?

## Next Steps

1. **Audit**: Catalog all current error messages in the codebase
2. **Prototype**: Build enhanced error message for one common error
3. **Test**: Test quick fixes on sample programs with intentional errors
4. **Design**: Design error panel UI mockup
5. **Community**: Gather feedback on most frustrating errors

## Implementation Details

### Specific Code Changes

**Example: Enhanced Parser Error**

```typescript
// Current: src/core/parser/parser.ts
throw new Error(`Syntax error at line ${lineNumber}`);

// Enhanced:
throw new EnhancedError({
  code: 'UNEXPECTED_TOKEN',
  line: lineNumber,
  column: token.startOffset,
  title: 'Unexpected command',
  message: `"${token.image}" is not a valid F-BASIC command.`,
  cause: `F-BASIC expects a known command like PRINT, IF, FOR, etc.`,
  highlightRange: [token.startOffset, token.endOffset],
  quickFixes: [
    {
      id: 'typo-fix',
      label: `Change to ${suggestedCommand}`,
      edits: [{ range: tokenRange, text: suggestedCommand }],
      confidence: 'high',
      autoApplyable: true
    }
  ],
  documentationLink: '/docs/commands'
})
```

**Example: Typo Detection**

```typescript
// src/core/errors/typoDetector.ts
function detectTypo(token: string, validCommands: string[]): string | null {
  const threshold = 2 // Max edit distance

  for (const command of validCommands) {
    const distance = levenshtein(token, command)
    if (distance <= threshold && distance > 0) {
      return command
    }
  }

  return null
}

// Simple Levenshtein implementation
function levenshtein(a: string, b: string): number {
  const matrix = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}
```

**Example: Quick Fix Application**

```typescript
// src/features/errors/composables/useQuickFixes.ts
export function useQuickFixes(editor: monaco.editor.IStandaloneCodeEditor) {
  function applyQuickFix(fix: QuickFix) {
    // Create edits
    const edits = fix.edits.map(edit =>
      new monaco.editor.Edit(
        edit.range,
        edit.text
      )
    )

    // Apply edits
    editor.executeEdits(fix.id, edits)

    // Track application for learning
    trackQuickFixUsage(fix.id)
  }

  function previewFix(fix: QuickFix): CodePreview {
    // Generate before/after preview
    const before = editor.getValue()
    const after = applyEditsToText(before, fix.edits)

    return { before, after, diff: generateDiff(before, after) }
  }

  return { applyQuickFix, previewFix }
}
```

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] All parser errors show friendly messages with context
- [ ] Typos are detected and suggested (90% accuracy)
- [ ] Missing syntax errors offer quick fixes
- [ ] Quick fixes can be applied with one click
- [ ] Error location is highlighted in editor
- [ ] At least 10 common error patterns have quick fixes

**Phase 2 (Week 2):**
- [ ] Errors appear as you type (300ms debounce)
- [ ] Error panel shows all errors with filtering
- [ ] Inline error indicators (squigglies) show in editor
- [ ] Warnings detect unused variables and unreachable code
- [ ] Error navigation (jump to error) works
- [ ] Error history persists for session

---

*"An error message is either a dead end or a detour sign. Let's make every error a learning moment that guides developers back to the path of success—with less frustration and more understanding."*
