# Strategic Idea: Inline Command Documentation & Hover Help

**Date**: 2026-02-06
**Turn**: 28
**Status**: Conceptual
**Focus Area**: Developer Experience & Documentation
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **inline command documentation with hover help** to the Family Basic IDE that provides instant access to F-BASIC command reference, syntax examples, and usage tips—eliminating context switching and reducing the need to consult external documentation while coding.

## Problem Statement

### Current Documentation Issues

1. **Context Switching Disrupts Flow**: Developers must leave the editor to look up commands
   - No command reference available while coding
   - Must open browser tabs or manual pages to check syntax
   - Breaks concentration and slows development
   - No indication of available parameters or options

2. **Unknown Command Availability**: Developers don't know what commands exist
   - No discoverability of F-BASIC command set
   - Must memorize or reference external docs
   - New developers face steep learning curve
   - No visual cues for available features

3. **Syntax Errors from Forgotten Details**: Small mistakes waste time
   - Wrong parameter order (SPRITE x,y vs SPRITE id,x,y)
   - Missing required parameters
   - Invalid parameter ranges (color 0-7 vs 0-15)
   - Forgotten command variations (PRINT vs PRINT#)

4. **No Usage Examples**: Documentation exists but not accessible
   - Family Basic manual has examples but not integrated
   - No quick reference for common patterns
   - Can't see example code without leaving editor
   - No copy-paste examples for learning

5. **Parameter Validation**: No guidance on valid values
   - Don't know valid color numbers without checking docs
   - Coordinate systems unclear (0-255 vs 1-256)
   - String function parameters (LEFT$(str,len) vs MID$(str,start,len))
   - No type hints for expected values

## Proposed Solution

### 1. Hover Documentation Provider

Show command documentation when hovering over keywords in Monaco editor:

```typescript
interface CommandDocumentation {
  // Command identity
  name: string                   // e.g., "SPRITE"
  category: CommandCategory      // e.g., "Sprite Commands"

  // Syntax
  syntax: string[]               // Multiple syntax variations
  parameters: ParameterDoc[]     // Parameter details

  // Description
  shortDescription: string       // One-line summary
  fullDescription: string        // Detailed explanation

  // Examples
  examples: CodeExample[]        // Usage examples

  // Related
  seeAlso: string[]              // Related commands
  notes: string[]                // Important notes/warnings

  // Constraints
  versionInfo?: string           // Version requirements
  limitations?: string[]         // Known limitations
}

interface ParameterDoc {
  name: string                   // Parameter name
  type: 'number' | 'string' | 'expression' | 'variable'
  description: string            // What this parameter does
  required: boolean              // Whether required
  defaultValue?: string          // Default if optional
  validRange?: [number, number]  // Valid value range
  enumValues?: string[]          // Valid enum values
}

interface CodeExample {
  code: string                   // Example code
  description: string            // What this example does
  output?: string                // Expected output
}
```

**Hover Display Example:**

```
┌─────────────────────────────────────────────────┐
│ SPRITE - Display a sprite on screen             │
│                                                  │
│ Syntax:                                         │
│   SPRITE spriteId, x, y                          │
│   SPRITE ON                                      │
│   SPRITE OFF                                     │
│                                                  │
│ Parameters:                                      │
│   spriteId  (number, required)  Sprite number   │
│              Valid range: 0-7                   │
│   x         (number, required)  X coordinate    │
│              Valid range: 0-255                 │
│   y         (number, required)  Y coordinate    │
│              Valid range: 0-239                 │
│                                                  │
│ Example:                                         │
│   10 SPRITE 0,100,100   ' Display sprite 0 at   │
│                         ' center of screen       │
│                                                  │
│ See also: DEF SPRITE, SPRITE ON, MOVE            │
└─────────────────────────────────────────────────┘
```

### 2. Command Discovery via Autocomplete

Enhance existing autocomplete with rich documentation:

```typescript
interface CompletionDocumentation {
  label: string                   // Command name
  kind: CompletionKind            // Keyword, function, etc.
  detail: string                  // Short syntax summary
  documentation: MarkupContent    // Full documentation

  // Smart suggestions
  insertText: string              // Text to insert
  insertTextRules?: InsertTextRule // Smart insertion rules

  // Context awareness
  filterText?: string             // Text for filtering
  sortText?: string               // Sorting priority
  preselect?: boolean             // Auto-select this item

  // Additional info
  tags?: CompletionItemTag[]      // Deprecated, experimental
  commitCharacters?: string[]     // Characters that trigger commit
}
```

**Enhanced Autocomplete Example:**

```
Type: SPR
     │
     ├─ SPRITE
     │  │ Display sprite on screen
     │  │
     │  │ SPRITE spriteId, x, y
     │  │   spriteId: Sprite number (0-7)
     │  │   x: X coordinate (0-255)
     │  │   y: Y coordinate (0-239)
     │
     ├─ SPRITE ON
     │  │ Enable sprite display
     │
     └─ SPRITE OFF
        │ Disable sprite display
```

### 3. Signature Help for Functions

Show parameter hints when typing function calls:

```typescript
interface SignatureHelp {
  signatures: SignatureInformation[]
  activeSignature: number
  activeParameter: number
}

interface SignatureInformation {
  label: string                   // Signature syntax
  documentation: string           // Parameter descriptions
  parameters: ParameterInformation[]
}
```

**Signature Help Example:**

```
Type: LEFT$(

┌─────────────────────────────────────────┐
│ LEFT$(str$, len)                        │
│                                          │
│ Returns leftmost characters from string  │
│                                          │
│ str$  - String to extract from           │
│ len   - Number of characters to return   │
│        Valid range: 0-255                │
└─────────────────────────────────────────┘
```

### 4. Quick Command Reference Panel

Dedicated panel for browsing all commands:

```vue
<template>
  <div class="command-reference-panel">
    <!-- Search/Filter -->
    <input v-model="searchQuery" placeholder="Search commands..." />

    <!-- Category Filter -->
    <div class="category-tabs">
      <button v-for="cat in categories" :key="cat.id">
        {{ cat.name }}
      </button>
    </div>

    <!-- Command List -->
    <div class="command-list">
      <div
        v-for="cmd in filteredCommands"
        :key="cmd.name"
        class="command-item"
        @click="showCommandDetails(cmd)"
      >
        <span class="command-name">{{ cmd.name }}</span>
        <span class="command-summary">{{ cmd.shortDescription }}</span>
      </div>
    </div>

    <!-- Command Detail View -->
    <div v-if="selectedCommand" class="command-detail">
      <h3>{{ selectedCommand.name }}</h3>
      <p>{{ selectedCommand.fullDescription }}</p>

      <!-- Syntax -->
      <div class="syntax-section">
        <h4>Syntax</h4>
        <code v-for="syntax in selectedCommand.syntax" :key="syntax">
          {{ syntax }}
        </code>
      </div>

      <!-- Parameters -->
      <div class="parameters-section">
        <h4>Parameters</h4>
        <div v-for="param in selectedCommand.parameters" :key="param.name">
          <param-doc :param="param" />
        </div>
      </div>

      <!-- Examples -->
      <div class="examples-section">
        <h4>Examples</h4>
        <div v-for="ex in selectedCommand.examples" :key="ex.code">
          <code-block :code="ex.code" :description="ex.description" />
        </div>
      </div>
    </div>
  </div>
</template>
```

### 5. Inline Error Documentation

Enhance error messages with documentation links:

```typescript
interface ErrorWithDocumentation {
  error: BasicError
  command?: string              // Related command
  documentationLink?: string    // Link to full docs
  quickExample?: string         // Quick fix example
  relatedCommands?: string[]    // Related commands to try
}
```

**Error Documentation Example:**

```
Error: Invalid parameter for SPRITE command

The SPRITE command requires 3 parameters: spriteId, x, y
Your code has: SPRITE 0,100

[Quick Fix] Add missing y parameter

Example:
  SPRITE 0,100,100

Learn more: SPRITE Command Documentation →
Related commands: DEF SPRITE, MOVE, POSITION
```

### 6. Documentation Data Source

Structured command documentation database:

```typescript
// src/core/documentation/commandRegistry.ts

export const COMMAND_REGISTRY: Record<string, CommandDocumentation> = {
  PRINT: {
    name: 'PRINT',
    category: 'Output',
    shortDescription: 'Display text or values on screen',
    fullDescription: '...',
    syntax: [
      'PRINT [expression|text]',
      'PRINT #fileNum, expression',
      'PRINT expression{,|;}[expression...]'
    ],
    parameters: [
      {
        name: 'expression',
        type: 'expression',
        description: 'Value or string to display',
        required: false
      }
    ],
    examples: [
      {
        code: '10 PRINT "Hello, World!"',
        description: 'Display a text message',
        output: 'Hello, World!'
      },
      {
        code: '20 PRINT A; B; C',
        description: 'Display values without spaces',
        output: '123'
      },
      {
        code: '30 PRINT "Sum:"; 5 + 3',
        description: 'Display text and expression result',
        output: 'Sum: 8'
      }
    ],
    seeAlso: ['INPUT', 'LINPUT', 'POS'],
    notes: [
      'Use ; to separate items without spacing',
      'Use , to tab to next zone',
      'End with , or ; to suppress newline'
    ]
  },

  SPRITE: {
    name: 'SPRITE',
    category: 'Sprite',
    shortDescription: 'Display sprite at specified coordinates',
    fullDescription: '...',
    syntax: [
      'SPRITE spriteId, x, y',
      'SPRITE ON',
      'SPRITE OFF'
    ],
    parameters: [
      {
        name: 'spriteId',
        type: 'number',
        description: 'Sprite number to display',
        required: true,
        validRange: [0, 7]
      },
      {
        name: 'x',
        type: 'number',
        description: 'Horizontal screen position',
        required: true,
        validRange: [0, 255]
      },
      {
        name: 'y',
        type: 'number',
        description: 'Vertical screen position',
        required: true,
        validRange: [0, 239]
      }
    ],
    examples: [
      {
        code: '10 SPRITE 0,100,100',
        description: 'Display sprite 0 at screen center',
        output: '(sprite appears at center)'
      },
      {
        code: '20 FOR I=0 TO 255: SPRITE 0,I,100: NEXT',
        description: 'Animate sprite moving across screen',
        output: '(sprite moves left to right)'
      }
    ],
    seeAlso: ['DEF SPRITE', 'MOVE', 'POSITION', 'SPRITE ON'],
    notes: [
      'Must use DEF SPRITE first to define sprite',
      'Must use SPRITE ON to enable sprite display',
      'Coordinates: (0,0) is top-left, (255,239) is bottom-right'
    ]
  },

  // ... 40+ more commands
}
```

## Implementation Priority

### Phase 1 (Hover Documentation - Week 1)

**Goal**: Show command documentation on hover

1. **Command Registry**
   - Create structured command documentation
   - Add docs for top 20 most-used commands
   - Include syntax, parameters, examples
   - Add category metadata

2. **Hover Provider**
   - Implement Monaco hover provider
   - Detect command keywords
   - Format and display documentation
   - Handle multiple syntax variations

3. **Integration**
   - Register hover provider with Monaco
   - Test with existing editor integration
   - Ensure proper positioning and styling

**Files to Create:**
- `src/core/documentation/commandRegistry.ts` - Command documentation database
- `src/core/documentation/types.ts` - Documentation type definitions
- `src/features/documentation/composables/useHoverDocumentation.ts` - Hover logic
- `src/features/documentation/utils/hoverFormatter.ts` - Hover content formatting

**Files to Modify:**
- `src/features/ide/integrations/monaco-integration.ts` - Register hover provider
- `src/features/ide/components/MonacoCodeEditor.vue` - Ensure hover enabled

### Phase 2 (Enhanced Autocomplete & Signature Help - Week 2)

**Goal**: Improve command discoverability

1. **Enhanced Autocomplete**
   - Add documentation to completion items
   - Show parameter hints
   - Categorize suggestions
   - Improve filtering and sorting

2. **Signature Help**
   - Implement signature help provider
   - Detect function calls
   - Show parameter information
   - Highlight active parameter

3. **Command Reference Panel**
   - Create command browser UI
   - Add search and filtering
   - Show detailed command info
   - Add copy-paste examples

**Files to Create:**
- `src/features/documentation/composables/useSignatureHelp.ts` - Signature help logic
- `src/features/documentation/components/CommandReferencePanel.vue` - Command browser
- `src/features/documentation/components/CommandDetail.vue` - Individual command view
- `src/features/documentation/components/ParameterDoc.vue` - Parameter display
- `src/features/documentation/components/CodeExample.vue` - Example code display

**Files to Modify:**
- `src/features/ide/IdePage.vue` - Add command reference tab
- `src/features/ide/composables/useBasicIdeEditor.ts` - Integrate documentation
- `src/shared/i18n/en.ts` - Documentation UI translations

## Technical Architecture

### New Documentation Infrastructure

```
src/core/documentation/
├── commandRegistry.ts              # Command documentation database
├── types.ts                        # Documentation type definitions
├── categories.ts                   # Command category definitions
├── utils/
│   ├── hoverFormatter.ts           # Format hover content
│   ├── markdownRenderer.ts         # Render markdown docs
│   └── exampleExtractor.ts         # Extract examples from docs
└── commands/
    ├── output.ts                   # PRINT, INPUT, etc.
    ├── control.ts                  # IF, FOR, GOTO, etc.
    ├── sprite.ts                   # SPRITE, DEF SPRITE, etc.
    ├── graphics.ts                 # COLOR, PSET, LINE, etc.
    ├── sound.ts                    # PLAY, etc.
    └── data.ts                     # DIM, DATA, READ, etc.

src/features/documentation/
├── components/
│   ├── CommandReferencePanel.vue   # Command browser UI
│   ├── CommandDetail.vue           # Detailed command view
│   ├── ParameterDoc.vue            # Parameter display
│   ├── CodeExample.vue             # Example code block
│   └── QuickReference.vue          # Quick reference card
├── composables/
│   ├── useHoverDocumentation.ts    # Hover provider logic
│   ├── useSignatureHelp.ts         # Signature help logic
│   ├── useCommandRegistry.ts       # Command registry access
│   └── useCommandSearch.ts         # Command search/filter
└── utils/
    ├── monacoHoverProvider.ts      # Monaco hover provider
    ├── monacoSignatureProvider.ts  # Monaco signature provider
    └── completionEnhancer.ts       # Enhance autocomplete
```

### Command Documentation Standard

**Minimum Fields for Each Command:**
```typescript
{
  name: string                      // Command keyword
  category: string                  // UI category
  shortDescription: string          // 10-20 words
  syntax: string[]                  // 1-3 syntax variations
  parameters: ParameterDoc[]        // All parameters
  examples: CodeExample[]           // 2-3 examples
  seeAlso: string[]                 // Related commands
  notes: string[]                   // Important notes
}
```

### Monaco Provider Integration

**Hover Provider:**
```typescript
monaco.languages.registerHoverProvider('fbasic', {
  provideHover: async (model, position) => {
    const word = model.getWordAtPosition(position)
    if (!word) return null

    const command = getCommandDocumentation(word.word)
    if (!command) return null

    return {
      range: new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn
      ),
      contents: formatCommandHover(command)
    }
  }
})
```

**Signature Help Provider:**
```typescript
monaco.languages.registerSignatureHelpProvider('fbasic', {
  signatureHelpTriggerCharacters: ['(', ','],
  provideSignatureHelp: async (model, position) => {
    const functionCall = parseFunctionCall(model, position)
    if (!functionCall) return null

    const command = getCommandDocumentation(functionCall.functionName)
    if (!command || !command.parameters) return null

    return {
      value: {
        signatures: [{
          label: command.syntax[0],
          documentation: command.fullDescription,
          parameters: command.parameters.map(p => ({
            label: p.name,
            documentation: p.description
          }))
        }],
        activeSignature: 0,
        activeParameter: functionCall.parameterIndex
      },
      dispose: () => {}
    }
  }
})
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing Monaco editor (leverage hover/signature APIs)
- TypeScript standard library
- Vue 3 composition API
- Existing command documentation (Family Basic manual)

**Data Source:**
- Extract from existing `docs/reference/family-basic-manual/`
- Structure into command registry
- Add examples and parameter details

**Optional Enhancements:**
- `markdown-it`: Rich markdown rendering in hover
- Custom syntax highlighting for examples

## Success Metrics

### Developer Velocity
- **Documentation Access**: % of commands that have hover docs
- **Context Switch Reduction**: Time saved looking up commands
- **Error Prevention**: % of syntax errors avoided
- **Learning Speed**: Time to learn new commands

### User Engagement
- **Hover Usage**: # of hovers per session
- **Command Panel Usage**: # of panel opens per session
- **Example Copy**: # of examples copied
- **Feature Discovery**: % of commands discovered via hover

### Quality
- **Documentation Coverage**: % of commands with docs
- **Example Accuracy**: % of examples that run correctly
- **Parameter Accuracy**: % of parameter validations correct
- **User Satisfaction**: Feedback on doc quality

## Benefits

### Immediate Benefits
1. **Faster Development**: No more context switching to docs
2. **Fewer Errors**: Parameter validation prevents mistakes
3. **Better Learning**: Examples teach by doing
4. **Improved Discoverability**: Find commands without searching

### Long-Term Benefits
1. **Onboarding**: New developers learn faster
2. **Code Quality**: Better understanding leads to better code
3. **Reduced Support**: Fewer questions about syntax
4. **Documentation Evolution**: Docs stay in sync with code

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Documentation maintenance burden | Start with core commands; community contributions |
| Performance overhead from hover lookups | In-memory cache; instant lookups |
| Incomplete or inaccurate docs | Review examples with tests; community feedback |
| Hover popup obscures code | Monaco positioning handles this automatically |
| Too much information in hover | Progressive disclosure; summary first, details on expand |

## Open Questions

1. **Documentation Priority**: Which 20 commands to document first?
2. **Example Format**: Should examples be runnable code snippets?
3. **Multi-language**: Should we support Japanese docs (original F-BASIC)?
4. **Community Editing**: Allow users to contribute command examples?
5. **Offline Mode**: Should docs work without internet?

## Next Steps

1. **Audit**: List all F-BASIC commands from manual and parser
2. **Prioritize**: Identify top 20 most-used commands
3. **Extract**: Pull documentation from existing manual pages
4. **Prototype**: Build hover provider for one command
5. **Test**: Verify hover works with existing Monaco integration
6. **Expand**: Add documentation for all commands

## Implementation Details

### Specific Code Changes

**Command Registry Sample:**

```typescript
// src/core/documentation/commandRegistry.ts
import type { CommandDocumentation } from './types'

export const COMMAND_REGISTRY: Record<string, CommandDocumentation> = {
  PRINT: {
    name: 'PRINT',
    category: 'output',
    shortDescription: 'Display text, values, or calculation results on screen',
    fullDescription: `
      The PRINT statement outputs data to the screen. You can print strings,
      numbers, variables, or expressions. Multiple items can be separated by
      semicolons (;) or commas (,).

      Semicolons print items immediately after each other.
      Commas tab to the next print zone (every 16 characters).
    `.trim(),
    syntax: [
      'PRINT [expression{;|,}expression...]',
      'PRINT #fileNumber, expression{;|,}expression...'
    ],
    parameters: [
      {
        name: 'expression',
        type: 'expression',
        description: 'A value, variable, string, or expression to display',
        required: false
      }
    ],
    examples: [
      {
        code: '10 PRINT "Hello, World!"',
        description: 'Display a simple text message',
        output: 'Hello, World!'
      },
      {
        code: '20 A=5: B=3: PRINT "Sum:"; A+B',
        description: 'Display text with calculation result',
        output: 'Sum: 8'
      },
      {
        code: '30 PRINT "A="; A, "B="; B',
        description: 'Display multiple items with tab spacing',
        output: 'A=5     B=3'
      },
      {
        code: '40 PRINT A; B; C',
        description: 'Display values without spacing',
        output: '537'
      }
    ],
    seeAlso: ['INPUT', 'LINPUT', 'STR$', 'POS'],
    notes: [
      'Use semicolon (;) to print items without spaces',
      'Use comma (,) to tab to the next 16-character zone',
      'End PRINT statement with semicolon or comma to suppress newline',
      'Use PRINT# for file output (requires file to be OPENed)'
    ]
  },

  SPRITE: {
    name: 'SPRITE',
    category: 'sprite',
    shortDescription: 'Position and display a sprite on the screen',
    fullDescription: `
      The SPRITE command displays a previously defined sprite at the
      specified screen coordinates. The sprite must first be defined
      using DEF SPRITE and sprite display must be enabled with SPRITE ON.

      Screen coordinates: (0,0) is top-left, (255,239) is bottom-right.
    `.trim(),
    syntax: [
      'SPRITE spriteNumber, xPosition, yPosition',
      'SPRITE ON',
      'SPRITE OFF'
    ],
    parameters: [
      {
        name: 'spriteNumber',
        type: 'number',
        description: 'The sprite number to display (0-7)',
        required: true,
        validRange: [0, 7]
      },
      {
        name: 'xPosition',
        type: 'number',
        description: 'Horizontal screen position (0-255)',
        required: true,
        validRange: [0, 255]
      },
      {
        name: 'yPosition',
        type: 'number',
        description: 'Vertical screen position (0-239)',
        required: true,
        validRange: [0, 239]
      }
    ],
    examples: [
      {
        code: `10 SPRITE ON
20 DEF SPRITE 0,(0,0,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)
30 SPRITE 0,100,100`,
        description: 'Enable sprites, define sprite 0, display at screen center',
        output: '(Mario sprite appears at center of screen)'
      },
      {
        code: `40 FOR X=0 TO 255
50 SPRITE 0,X,100
60 NEXT`,
        description: 'Animate sprite moving across the screen',
        output: '(Sprite smoothly moves from left to right)'
      }
    ],
    seeAlso: ['DEF SPRITE', 'SPRITE ON', 'SPRITE OFF', 'MOVE', 'POSITION'],
    notes: [
      'Sprite must be defined with DEF SPRITE before displaying',
      'Must use SPRITE ON to enable sprite display system',
      'Up to 8 sprites can be displayed simultaneously (0-7)',
      'Sprites are displayed on top of background graphics',
      'X coordinates: 0=left, 255=right',
      'Y coordinates: 0=top, 239=bottom'
    ]
  },

  // Continue for all F-BASIC commands...
}

// Helper function to get command docs
export function getCommandDocumentation(command: string): CommandDocumentation | undefined {
  return COMMAND_REGISTRY[command.toUpperCase()]
}

// Get all commands in a category
export function getCommandsByCategory(category: string): CommandDocumentation[] {
  return Object.values(COMMAND_REGISTRY)
    .filter(cmd => cmd.category === category)
}

// Search commands by name or description
export function searchCommands(query: string): CommandDocumentation[] {
  const q = query.toLowerCase()
  return Object.values(COMMAND_REGISTRY).filter(cmd =>
    cmd.name.toLowerCase().includes(q) ||
    cmd.shortDescription.toLowerCase().includes(q)
  )
}
```

**Hover Provider Implementation:**

```typescript
// src/features/documentation/utils/monacoHoverProvider.ts
import * as monaco from 'monaco-editor'
import { getCommandDocumentation } from '@/core/documentation/commandRegistry'

export function createHoverProvider(): monaco.languages.HoverProvider {
  return {
    provideHover: async (model, position, _token, _context) => {
      const word = model.getWordAtPosition(position)
      if (!word) return null

      const commandName = word.word.toUpperCase()
      const command = getCommandDocumentation(commandName)
      if (!command) return null

      // Format hover content
      const contents = formatHoverContent(command)

      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents
      }
    }
  }
}

function formatHoverContent(command: CommandDocumentation): monaco.languages.IMarkdownString[] {
  const contents: monaco.languages.IMarkdownString[] = []

  // Title and summary
  contents.push({
    value: `**${command.name}** - ${command.shortDescription}`
  })

  // Syntax
  if (command.syntax && command.syntax.length > 0) {
    const syntaxBlock = command.syntax
      .map(s => `\`${s}\``)
      .join('\n\n')
    contents.push({
      value: `**Syntax:**\n\n${syntaxBlock}`
    })
  }

  // Parameters
  if (command.parameters && command.parameters.length > 0) {
    const paramList = command.parameters
      .map(p => {
        let text = `- \`${p.name}\``
        if (p.validRange) {
          text += ` (${p.validRange[0]}-${p.validRange[1]})`
        }
        if (p.required) {
          text += ' **required**'
        }
        text += `\n  ${p.description}`
        return text
      })
      .join('\n')
    contents.push({
      value: `**Parameters:**\n\n${paramList}`
    })
  }

  // Example
  if (command.examples && command.examples.length > 0) {
    const example = command.examples[0]
    contents.push({
      value: `**Example:**\n\n\`\`\`basic\n${example.code}\n\`\`\`\n\n${example.description}`
    })
  }

  // See also
  if (command.seeAlso && command.seeAlso.length > 0) {
    contents.push({
      value: `**See also:** ${command.seeAlso.join(', ')}`
    })
  }

  return contents
}
```

**Integration with Monaco:**

```typescript
// src/features/ide/integrations/monaco-integration.ts
import { createHoverProvider } from '@/features/documentation/utils/monacoHoverProvider'

export function setupMonacoLanguage(): void {
  // ... existing setup ...

  // Register hover provider for inline documentation
  monaco.languages.registerHoverProvider('fbasic', createHoverProvider())
}
```

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] Command registry created with 20 core commands
- [ ] Hover provider shows documentation for keywords
- [ ] Hover displays syntax, parameters, and example
- [ ] Hover content is properly formatted and readable
- [ ] No performance degradation when typing
- [ ] Works for all command categories (PRINT, SPRITE, IF, FOR, etc.)

**Phase 2 (Week 2):**
- [ ] Autocomplete shows command summaries
- [ ] Signature help displays for function calls
- [ ] Command reference panel shows all commands
- [ ] Search and filtering work correctly
- [ ] Examples can be copied to clipboard
- [ ] Documentation links from error messages work

**Command Coverage (Minimum 20 commands):**
1. PRINT - Output
2. INPUT - User input
3. IF/THEN - Conditional
4. FOR/NEXT - Loops
5. GOTO - Branching
6. GOSUB/RETURN - Subroutines
7. DIM - Arrays
8. SPRITE - Sprite display
9. DEF SPRITE - Sprite definition
10. SPRITE ON/OFF - Sprite control
11. COLOR - Color settings
12. LOCATE - Cursor positioning
13. CLS - Clear screen
14. PLAY - Music
15. DEF MOVE - Sprite animation
16. MOVE - Move sprite
17. STR$, LEFT$, RIGHT$, MID$ - String functions
18. RND - Random numbers
19. DATA/READ - Data statements
20. END - Program termination

---

*"The best documentation is the one you don't have to search for—it appears right when you need it, right where you're working. Let's make F-BASIC commands discoverable without leaving the editor."*
