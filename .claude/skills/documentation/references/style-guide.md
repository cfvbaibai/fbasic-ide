# Documentation Style Guide

Detailed patterns and standards for Family Basic IDE documentation.

## Table of Contents

1. [Writing Style](#writing-style)
2. [Markdown Conventions](#markdown-conventions)
3. [Code Examples in Docs](#code-examples-in-docs)
4. [File Organization](#file-organization)
5. [Team Documentation Pattern](#team-documentation-pattern)

---

## Writing Style

### Principles

- **Concise** - Prefer tables over paragraphs
- **Actionable** - Use imperative mood ("Add token" not "You should add token")
- **Scannable** - Use headers, lists, and tables
- **Current** - No outdated information

### Voice

| Do | Don't |
|----|-------|
| "Create executor in `src/core/execution/executors/`" | "You might want to create an executor..." |
| "Add test case reproducing the bug" | "It would be good to add a test" |
| "See `docs/teams/parser-team.md`" | "Refer to the parser team documentation" |

---

## Markdown Conventions

### Tables for Structured Data

```markdown
| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |
```

### Code Blocks with Language

````markdown
```typescript
const example: string = 'always specify language'
```
````

### File Paths as Code

Use backticks for file paths: `src/core/parser/FBasicParser.ts`

### Cross-References

```markdown
See [Architecture Overview](../teams/tech-lead.md)
```

---

## Code Examples in Docs

### TypeScript Examples

```typescript
// Always include types
export function executeCommand(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  // Implementation
}
```

### Vue Examples

```vue
<script setup lang="ts">
// 1. Type imports
import type { Ref } from 'vue'

// 2. Value imports
import { ref, computed } from 'vue'

// 3. Props/Emits
const props = defineProps<{ value: string }>()
</script>
```

---

## File Organization

### When to Create New Doc

| Scenario | Action |
|----------|--------|
| New team/role | Create `docs/teams/<team>-team.md` |
| New feature (complex) | Create `docs/reference/<feature>.md` |
| Future idea | Create `docs/idea/YYYYMMDD-NNN-name.md` |
| Simple feature | Update existing team doc |

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Team | `<team>-team.md` | `parser-team.md` |
| Reference | `<topic>.md` | `worker-messages.md` |
| Idea | `YYYYMMDD-NNN-name.md` | `20250206-029-debugger.md` |

---

## Team Documentation Pattern

Each team doc should follow this structure:

```markdown
# <Team> Team

## Ownership
- Files owned
- Responsibilities

## Architecture
- Overview diagram
- Key files

## Common Tasks
- Task 1: Step-by-step
- Task 2: Step-by-step

## Integration Points
- What team provides
- What team receives

## Patterns & Conventions
- Code patterns
- Naming conventions

## Testing
- Test location
- Test patterns

## Code Constraints
- File limits
- Language rules

## Reference
- External docs
- Related files
```
