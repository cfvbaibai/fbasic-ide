# Chevrotain + Monaco Editor Integration Guide

This guide explains how to implement syntax highlighting and live error marking in Monaco Editor using Chevrotain parser.

## Overview

When using Chevrotain with Monaco Editor, you need two separate systems:

1. **Syntax Highlighting** → Monaco's Monarch tokenizer (independent of parser)
2. **Live Error Marking** → Monaco's diagnostics API (fed by Chevrotain parser)

## Architecture

```
┌─────────────────────────────────────────┐
│         Monaco Editor                   │
├─────────────────────────────────────────┤
│  Syntax Highlighting                    │
│  ↓ Monarch Tokenizer                    │
│  (Defines token colors/styles)          │
├─────────────────────────────────────────┤
│  Live Error Diagnostics                 │
│  ↓ Chevrotain Parser                    │
│  (Provides error locations/messages)    │
└─────────────────────────────────────────┘
```

## Key Concepts

### 1. Syntax Highlighting (Monarch)

**Monarch** is Monaco's built-in tokenizer system. It's **independent** of your parser and only handles visual syntax highlighting.

**Features:**
- Fast, regex-based tokenization
- No build step required
- Defined in JavaScript/TypeScript
- Handles colors, fonts, styles

**Example:**
```typescript
const monarchLanguage: monaco.languages.IMonarchLanguage = {
  keywords: ['PRINT', 'LET', 'IF', 'THEN'],
  tokenizer: {
    root: [
      [/^\d+/, 'line-number'],
      [/\b(PRINT|LET|IF)\b/i, 'keyword'],
      [/"[^"]*"/, 'string'],
      [/\d+/, 'number']
    ]
  }
};
```

### 2. Live Error Marking (Chevrotain)

**Chevrotain parser** provides detailed error information that Monaco uses for:
- Red squiggly underlines
- Error messages on hover
- Error list in Problems panel

**Features:**
- Precise line/column error locations
- Detailed error messages
- Error recovery (partial parsing)
- TypeScript-first design

**Error Flow:**
```
User types code
  ↓
Chevrotain parser runs (debounced)
  ↓
Parse errors converted to Monaco diagnostics
  ↓
Monaco displays red squiggles + error messages
```

## Implementation Steps

### Step 1: Install Dependencies

```bash
pnpm add chevrotain monaco-editor
pnpm add -D @types/monaco-editor  # If needed
```

### Step 2: Define Chevrotain Lexer & Parser

See `src/core/parser/chevrotain-example.ts` for complete implementation:

- **Define tokens** (keywords, operators, literals)
- **Create lexer** with position tracking
- **Define parser rules** (statements, expressions)
- **Handle errors** with detailed location info

### Step 3: Define Monarch Tokenizer

See `src/core/parser/monaco-integration.ts`:

```typescript
const monarchLanguage: monaco.languages.IMonarchLanguage = {
  keywords: ['PRINT', 'LET', 'IF', ...],
  tokenizer: {
    root: [
      [/^\d+/, 'line-number'],
      [/\b(PRINT|LET)\b/i, 'keyword'],
      // ... more rules
    ]
  }
};
```

### Step 4: Register Language & Setup Diagnostics

```typescript
// Register language
monaco.languages.register({ id: 'fbasic' });
monaco.languages.setMonarchTokensProvider('fbasic', monarchLanguage);

// Setup live error checking
function setupLiveErrorChecking(editor: monaco.editor.IStandaloneCodeEditor) {
  const model = editor.getModel();
  
  model.onDidChangeContent(() => {
    const source = model.getValue();
    const parseResult = parseWithChevrotain(source);
    
    if (!parseResult.success && parseResult.errors) {
      const diagnostics = convertToMonacoDiagnostics(parseResult.errors, model);
      monaco.editor.setModelMarkers(model, 'fbasic', diagnostics);
    } else {
      monaco.editor.setModelMarkers(model, 'fbasic', []);
    }
  });
}
```

### Step 5: Use in Vue Component

See `src/components/MonacoCodeEditor.vue` for complete example.

## Error Conversion

Chevrotain errors need to be converted to Monaco's `IMarkerData` format:

```typescript
function convertToMonacoDiagnostics(
  errors: ParseError[],
  model: monaco.editor.ITextModel
): monaco.editor.IMarkerData[] {
  return errors.map((error) => ({
    severity: monaco.MarkerSeverity.Error,
    startLineNumber: error.line || 1,
    startColumn: error.column || 1,
    endLineNumber: error.line || 1,
    endColumn: error.column + error.length || 1,
    message: error.message,
    source: 'F-BASIC Parser'
  }));
}
```

## Performance Considerations

### Debouncing

Parse on every keystroke is expensive. Use debouncing:

```typescript
let timeoutId: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

model.onDidChangeContent(() => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    updateDiagnostics();
  }, DEBOUNCE_MS);
});
```

### Error Recovery

Chevrotain's error recovery allows partial parsing even with errors, which is great for live editing.

## Advantages of Chevrotain + Monaco

### vs. Peggy.js

| Feature | Chevrotain | Peggy.js |
|---------|------------|----------|
| TypeScript Support | Native | Generated |
| Build Step | None | Required |
| Error Recovery | Excellent | Good |
| IDE Support | Full | Limited |
| Performance | Very Fast | Fast |

### Benefits

1. **No Build Step** - Grammar defined in TypeScript, no `.pegjs` files
2. **Better Type Safety** - Full TypeScript support throughout
3. **Excellent Error Messages** - Detailed error locations and context
4. **Error Recovery** - Can parse partial/invalid code
5. **IDE Integration** - Better autocomplete and IntelliSense support

## Migration Path

If migrating from Peggy.js:

1. **Keep AST types** - Your `ast-types.ts` can stay the same
2. **Rewrite parser** - Convert PEG grammar to Chevrotain rules
3. **Update error handling** - Use Chevrotain's error format
4. **Add Monaco integration** - Use provided integration code

## Example: Complete Flow

```typescript
// 1. User types: "10 PRINT hello"
// 2. Monaco Monarch tokenizes for highlighting:
//    - "10" → line-number (gray)
//    - "PRINT" → keyword (blue)
//    - "hello" → identifier (black)

// 3. Chevrotain parser runs (debounced):
const parseResult = parseWithChevrotain("10 PRINT hello");

// 4. If error found:
if (!parseResult.success) {
  // Convert to Monaco diagnostics
  const diagnostics = convertToMonacoDiagnostics(parseResult.errors, model);
  
  // Display red squiggles
  monaco.editor.setModelMarkers(model, 'fbasic', diagnostics);
}

// 5. User sees:
//    - Syntax highlighting (from Monarch)
//    - Red squiggles under errors (from Chevrotain)
//    - Error messages on hover (from Chevrotain)
```

## Additional Features

### Code Completion

```typescript
monaco.languages.registerCompletionItemProvider('fbasic', {
  provideCompletionItems: () => {
    return {
      suggestions: [
        {
          label: 'PRINT',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'PRINT '
        }
        // ... more suggestions
      ]
    };
  }
});
```

### Hover Information

```typescript
monaco.languages.registerHoverProvider('fbasic', {
  provideHover: async (model, position) => {
    // Use Chevrotain parser to analyze code at position
    // Return helpful information
  }
});
```

## Troubleshooting

### Syntax highlighting not working
- Check Monarch tokenizer rules are correct
- Verify language is registered: `monaco.languages.register({ id: 'fbasic' })`
- Check editor language: `language: 'fbasic'`

### Errors not showing
- Verify Chevrotain parser is running
- Check error conversion function
- Ensure `setModelMarkers` is called with correct model

### Performance issues
- Increase debounce delay
- Consider parsing only visible lines
- Use web workers for parsing (advanced)

## Resources

- [Chevrotain Documentation](https://chevrotain.io/docs/)
- [Monaco Editor Language Guide](https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages)
- [Monarch Tokenizer Reference](https://microsoft.github.io/monaco-editor/monarch.html)

