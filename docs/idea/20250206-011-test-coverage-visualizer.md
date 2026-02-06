# Strategic Idea: Test Coverage Visualizer

**Date**: 2026-02-06
**Turn**: 11
**Status**: Conceptual
**Focus Area**: Testing & Reliability
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add a **test coverage visualizer** to the Family Basic IDE that provides immediate visual feedback on code coverage—helping developers identify untested code paths at a glance and improve test quality through clear, actionable insights.

## Problem Statement

### Current Testing Visibility Gaps

1. **No Coverage Visibility**: Developers don't know which code is tested
   - 60+ test files exist but no aggregate coverage report
   - No way to see % coverage per module
   - Can't identify untested functions/lines
   - No visibility into coverage trends over time

2. **Missing Test Feedback**: Writing tests is guesswork
   - Don't know if new tests increase coverage
   - Can't easily find edge cases to test
   - No indication when coverage decreases
   - No motivation to improve coverage

3. **Manual Test Maintenance**: Burden to keep tests relevant
   - No automatic detection of dead tests
   - Can't identify redundant test coverage
   - No signals when code changes break coverage
   - Hard to prioritize testing efforts

4. **Limited Quality Insights**: Coverage tells only part of the story
   - No distinction between statement vs branch vs line coverage
   - Can't see which test covers which code
   - No coverage for F-BASIC language features
   - Missing integration test coverage visibility

## Proposed Solution

### 1. Vitest Coverage Integration

Leverage Vitest's built-in coverage (via c8 or istanbul) to generate coverage reports:

```typescript
// vitest.config.ts enhancement
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // Fast, built-in coverage
      reporter: ['json', 'html', 'text'],
      exclude: [
        'node_modules/',
        'test/',
        '*.config.ts',
        'src/main.ts'
      ],
      // Custom thresholds
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    }
  }
})
```

### 2. Coverage Data Types

```typescript
interface CoverageData {
  summary: CoverageSummary
  files: CoverageFile[]
  trends: CoverageTrend[]
}

interface CoverageSummary {
  total: {
    lines: CoverageMetric
    functions: CoverageMetric
    branches: CoverageMetric
    statements: CoverageMetric
  }
}

interface CoverageMetric {
  covered: number
  total: number
  percentage: number
}

interface CoverageFile {
  path: string                    // 'src/core/parser/lexer.ts'
  displayName: string             // 'lexer.ts'
  modulePath: string              // 'core/parser'
  summary: CoverageMetrics
  lines: LineCoverage[]          // Per-line coverage
  functions: FunctionCoverage[]  // Per-function coverage
  branches: BranchCoverage[]     // Per-branch coverage
}

interface LineCoverage {
  lineNumber: number
  covered: boolean
  count: number                  // Execution count
}

interface FunctionCoverage {
  name: string
  line: number
  covered: boolean
  branches: {
    covered: number
    total: number
  }
}

interface BranchCoverage {
  line: number
  type: 'if' | 'switch' | 'ternary'
  covered: number
  total: number
  locations: BranchLocation[]
}

interface BranchLocation {
  line: number
  covered: boolean
}

interface CoverageTrend {
  date: Date
  summary: CoverageSummary
  commit: string
}
```

### 3. Coverage Visualizer Component

Vue component for displaying coverage with visual indicators:

```vue
<template>
  <div class="coverage-visualizer">
    <!-- Summary Cards -->
    <CoverageSummary
      :lines="summary.lines"
      :functions="summary.functions"
      :branches="summary.branches"
      :statements="summary.statements"
    />

    <!-- Module Coverage List -->
    <div class="coverage-list">
      <CoverageFileRow
        v-for="file in sortedFiles"
        :key="file.path"
        :file="file"
        :expanded="expandedFiles.has(file.path)"
        @toggle="toggleFile"
        @click="openFile"
      />
    </div>

    <!-- Coverage Details Panel -->
    <CoverageDetails
      v-if="selectedFile"
      :file="selectedFile"
      :highlight-mode="highlightMode"
    />
  </div>
</template>
```

### 4. Editor Integration

Show coverage directly in Monaco editor with color-coded gutter:

```typescript
interface CoverageEditorDecorator {
  // Apply coverage decorations to editor
  applyCoverage(
    editor: monaco.editor.IStandaloneCodeEditor,
    coverage: CoverageFile
  ): void

  // Decoration types
  decorations: {
    covered: EditorDecoration      // Green background
    uncovered: EditorDecoration    // Red background
    partiallyCovered: EditorDecoration // Yellow background
    branchMissed: EditorDecoration // Orange accent
  }
}

// Usage in Monaco
const decorations = coverageDecorator.decorations

const coverageDecorations = [
  // Line 10: Covered (green)
  {
    range: new monaco.Range(10, 1, 10, 100),
    options: decorations.covered
  },
  // Line 15: Uncovered (red)
  {
    range: new monaco.Range(15, 1, 15, 100),
    options: decorations.uncovered
  },
  // Line 20: Partially covered (yellow - some branches missed)
  {
    range: new monaco.Range(20, 1, 20, 100),
    options: decorations.partiallyCovered
  }
]
```

### 5. Coverage Dashboard

Dedicated panel showing coverage metrics:

```vue
<template>
  <div class="coverage-dashboard">
    <!-- Overall Progress -->
    <div class="coverage-progress">
      <CircularProgress
        :value="summary.lines.percentage"
        :color="getColorForPercentage(summary.lines.percentage)"
      />
      <div class="metrics">
        <MetricRow label="Lines" :value="summary.lines" />
        <MetricRow label="Functions" :value="summary.functions" />
        <MetricRow label="Branches" :value="summary.branches" />
        <MetricRow label="Statements" :value="summary.statements" />
      </div>
    </div>

    <!-- Module Breakdown -->
    <ModuleCoverageList :files="filesByModule" />

    <!-- Trend Chart -->
    <CoverageTrendChart :trends="trends" />

    <!-- Uncovered Files -->
    <UncoveredFilesList :files="uncoveredFiles" />

    <!-- Quick Actions -->
    <div class="coverage-actions">
      <button @click="runTests">Run Tests with Coverage</button>
      <button @click="exportReport">Export Coverage Report</button>
      <button @click="updateBaselines">Update Baselines</button>
    </div>
  </div>
</template>
```

### 6. Coverage Color Scheme

```typescript
// Color coding for coverage levels
const COVERAGE_COLORS = {
  excellent: { // 80-100%
    primary: '#10b981', // emerald-500
    background: '#d1fae5', // emerald-100
    text: '#065f46' // emerald-700
  },
  good: { // 60-79%
    primary: '#3b82f6', // blue-500
    background: '#dbeafe', // blue-100
    text: '#1e40af' // blue-700
  },
  warning: { // 40-59%
    primary: '#f59e0b', // amber-500
    background: '#fef3c7', // amber-100
    text: '#92400e' // amber-700
  },
  critical: { // 0-39%
    primary: '#ef4444', // red-500
    background: '#fee2e2', // red-100
    text: '#991b1b' // red-700
  }
}

function getCoverageLevel(percentage: number): keyof typeof COVERAGE_COLORS {
  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'warning'
  return 'critical'
}
```

### 7. Coverage by F-BASIC Feature

Track coverage for language feature implementation:

```typescript
interface FeatureCoverage {
  feature: FBasicFeature
  implementation: {
    parser: CoverageFile[]        // Parser implementation files
    executor: CoverageFile[]      // Executor files
    tests: TestFile[]             // Test files
  }
  coverage: CoverageSummary
  gaps: string[]                  // Missing coverage areas
}

type FBasicFeature =
  | 'print-statement'
  | 'if-then'
  | 'for-loop'
  | 'gosub-return'
  | 'sprite-system'
  | 'sound-system'
  | 'input-statement'
  | 'data-read'

// Example: Feature coverage report
const featureCoverage: FeatureCoverage[] = [
  {
    feature: 'sprite-system',
    implementation: {
      parser: ['src/core/parser/sprite.ts'],
      executor: ['src/core/execution/SpriteExecutor.ts'],
      tests: ['test/executors/SpriteExecutor.test.ts']
    },
    coverage: { lines: 85, functions: 90, branches: 75, statements: 85 },
    gaps: ['Collision detection edge cases', 'Multi-sprite layering']
  },
  {
    feature: 'for-loop',
    implementation: {
      parser: ['src/core/parser/ForNextParser.ts'],
      executor: ['src/core/execution/ForExecutor.ts'],
      tests: ['test/executors/ForExecutor.test.ts']
    },
    coverage: { lines: 92, functions: 95, branches: 88, statements: 92 },
    gaps: ['Negative step values', 'Nested loop limits']
  }
]
```

## Implementation Priority

### Phase 1 (Week 1): Coverage Infrastructure

**Goal**: Generate coverage reports and basic display

1. **Vitest Coverage Setup**
   - Configure `vitest.config.ts` for coverage
   - Set coverage thresholds
   - Generate JSON coverage reports
   - Add `pnpm test:coverage` script

2. **Coverage Data Service**
   - Create `CoverageService` to read JSON reports
   - Parse coverage data into typed structures
   - Cache coverage data for performance
   - Watch for coverage changes

3. **Basic Coverage UI**
   - Summary cards with metrics
   - File list with coverage percentages
   - Color coding by coverage level
   - Expand/collapse file details

**Files to Create:**
- `vitest.config.ts` - Enhanced configuration
- `src/core/coverage/CoverageService.ts` - Coverage data service
- `src/features/coverage/types.ts` - Coverage type definitions
- `src/features/coverage/components/CoverageSummary.vue` - Summary display
- `src/features/coverage/components/CoverageFileList.vue` - File list

**Files to Modify:**
- `package.json` - Add `test:coverage` script
- `src/features/ide/IdePage.vue` - Add coverage tab

### Phase 2 (Week 2): Editor Integration & Advanced Features

**Goal**: Show coverage in editor and add insights

1. **Monaco Editor Integration**
   - Coverage gutter decorations
   - Line background colors
   - Coverage hover tooltips
   - Toggle coverage overlay

2. **Coverage Details Panel**
   - Per-line coverage display
   - Branch coverage visualization
   - Function coverage breakdown
   - Navigate to uncovered code

3. **Feature Coverage Tracking**
   - Map files to F-BASIC features
   - Show coverage by feature
   - Identify gaps by feature
   - Feature-based test recommendations

4. **Trend Tracking**
   - Store historical coverage data
   - Show coverage trends
   - Alert on coverage decreases
   - Commit-level coverage history

**Files to Create:**
- `src/features/coverage/composables/useCoverageDecorator.ts` - Monaco decorator
- `src/features/coverage/components/CoverageDetails.vue` - Details panel
- `src/features/coverage/components/CoverageTrendChart.vue` - Trend visualization
- `src/features/coverage/components/FeatureCoverage.vue` - Feature-based view
- `src/features/coverage/utils/featureMapper.ts` - Feature-to-file mapping

**Files to Modify:**
- `src/features/ide/components/MonacoCodeEditor.vue` - Add coverage decorations
- `src/features/ide/composables/useBasicIdeEditor.ts` - Coverage toggle

## Technical Architecture

### New Coverage Infrastructure

```
src/core/coverage/
├── CoverageService.ts            # Coverage data service
├── CoverageParser.ts             # Parse JSON coverage reports
├── CoverageCache.ts              # Cache coverage data
└── CoverageReporter.ts           # Generate custom reports

src/features/coverage/
├── types.ts                      # Coverage type definitions
├── components/
│   ├── CoverageSummary.vue       # Metrics summary
│   ├── CoverageFileList.vue      # File list with coverage
│   ├── CoverageFileRow.vue       # Individual file row
│   ├── CoverageDetails.vue       # Detailed view
│   ├── CoverageTrendChart.vue    # Trend visualization
│   ├── FeatureCoverage.vue       # Feature-based coverage
│   └── CoverageProgress.vue      # Progress indicator
├── composables/
│   ├── useCoverage.ts            # Coverage data composable
│   ├── useCoverageDecorator.ts   # Monaco editor decorator
│   ├── useCoverageTrends.ts      # Trend tracking
│   └── useFeatureCoverage.ts     # Feature coverage
└── utils/
    ├── featureMapper.ts          # Map files to features
    ├── colorCoding.ts            # Coverage level colors
    └── thresholds.ts             # Coverage thresholds
```

### Integration with Existing Systems

**Vitest Integration:**
- Use Vitest's built-in coverage provider (v8)
- No additional dependencies required
- JSON output for programmatic access

**Monaco Integration:**
- Use `deltaDecorations` API for performance
- Gutter glyphs for quick visual scan
- Hover widgets for detailed info

**State Management:**
- Pinia store for coverage state
- Reactive updates when coverage changes
- Persist coverage preferences

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Vitest 4.0.18 (already installed)
- v8 coverage provider (built into Vitest)
- Vue 3 (already using)
- Monaco Editor (already using)

**Optional Enhancements:**
- `recharts`: For trend chart visualization
- `@vitest/ui`: Alternative coverage UI

## Success Metrics

### Coverage Metrics
- **Overall Coverage**: % of codebase covered by tests (baseline: current, target: +10%)
- **Critical Path Coverage**: % of core parser/execution covered (target: 85%+)
- **Feature Coverage**: % of F-BASIC features with >80% coverage

### Usage Metrics
- **Dashboard Usage**: % of developers opening coverage panel
- **Editor Integration**: % of sessions with coverage overlay enabled
- **Action Taking**: % of coverage gaps that get tests written

### Quality Metrics
- **Coverage Growth**: Monthly coverage increase
- **Test Quality**: Ratio of meaningful tests to coverage
- **Regression Prevention**: % of bugs caught by covered code

## Benefits

### Immediate Benefits
1. **Test Visibility**: See exactly what's tested at a glance
2. **Focused Testing**: Write tests for actual gaps, not guesses
3. **Quality Motivation**: Clear goals for improvement
4. **Code Review Insight**: Coverage changes visible in PRs

### Long-Term Benefits
1. **Higher Quality**: More tested code = fewer bugs
2. **Refactoring Confidence**: Know what's covered before changing
3. **Onboarding**: New developers see test expectations
4. **Documentation**: Coverage serves as living documentation

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Coverage becomes a target, not a tool | Focus on meaningful tests, not just numbers |
| Slow coverage generation | Incremental coverage; parallel tests |
| Visual clutter in editor | Easy toggle; subtle colors |
| High coverage, low quality | Add test quality metrics; reviews |
| Configuration overhead | Sensible defaults; easy setup |

## Open Questions

1. **Threshold Levels**: What should our coverage targets be per module?
2. **Branch vs Line**: Should we prioritize branch coverage over line coverage?
3. **CI Integration**: Should coverage fail builds in CI?
4. **Trend Storage**: Where to store historical coverage data?
5. **Feature Mapping**: Manual or automatic feature-to-file mapping?

## Next Steps

1. **Baseline**: Run current coverage to establish baseline
2. **Config**: Set up Vitest coverage configuration
3. **Prototype**: Build basic coverage summary component
4. **Integration**: Add Monaco decorations
5. **Iterate**: Add features based on user feedback

## Implementation Details

### Specific Files to Modify

**1. vitest.config.ts**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['json', 'text', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '*.config.ts',
        'src/main.ts',
        'src/shared/styles/'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    }
  }
})
```

**2. package.json scripts**
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest --coverage"
  }
}
```

**3. src/features/ide/IdePage.vue** - Add coverage tab
```vue
<template>
  <div class="ide-page">
    <TabBar>
      <Tab name="editor">Editor</Tab>
      <Tab name="output">Output</Tab>
      <Tab name="coverage">Coverage</Tab> <!-- New -->
    </TabBar>

    <TabContent name="coverage">
      <CoverageVisualizer />
    </TabContent>
  </div>
</template>
```

### Acceptance Criteria

**Week 1:**
- [ ] `pnpm test:coverage` generates coverage report
- [ ] Coverage summary shows lines, functions, branches, statements
- [ ] File list shows coverage per file with color coding
- [ ] Can expand file to see line-level coverage
- [ ] Coverage panel accessible from IDE

**Week 2:**
- [ ] Monaco editor shows coverage decorations
- [ ] Toggle coverage overlay on/off
- [ ] Hover over line shows execution count
- [ ] Feature coverage view shows F-BASIC feature coverage
- [ ] Trend chart shows coverage over time
- [ ] Uncovered files list shows files needing tests

---

*"What gets measured gets improved. Test coverage visualization makes the invisible visible, turning guesswork into actionable insights and helping developers build confidence through comprehensive testing."*
