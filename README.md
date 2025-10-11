# Family Basic IDE (F-BASIC Emulator)

A modern web-based IDE for Family Basic (F-BASIC) programming language, built with Vue 3, TypeScript, and Vite. This project provides a complete development environment for writing, executing, and debugging Family Basic programs in the browser.

## 🎯 Business Purpose

### Mission
To preserve and modernize the Family Basic programming language by providing an accessible, web-based development environment that maintains the authentic F-BASIC experience while leveraging modern web technologies.

### Target Users
- **Retro Computing Enthusiasts** - Users interested in classic programming languages
- **Educational Institutions** - Teachers and students learning programming fundamentals
- **Game Developers** - Developers creating retro-style games
- **Preservationists** - Individuals working to preserve historical programming languages

### Key Features
- **Authentic F-BASIC Syntax** - Faithful implementation of Family Basic language features
- **Real-time Execution** - Immediate feedback with syntax highlighting and error reporting
- **Modern Web Interface** - Clean, responsive UI built with Vue 3 and Element Plus
- **Cross-platform** - Runs in any modern web browser
- **Educational Focus** - Designed for learning and teaching programming concepts

## 🏗️ Technical Architecture

### Core Technologies
- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite for fast development and optimized builds
- **Language**: TypeScript for type safety and better developer experience
- **UI Components**: Element Plus for professional interface components
- **Testing**: Vitest for unit testing with Vue Test Utils
- **Code Quality**: ESLint + Prettier for consistent code formatting
- **Utilities**: Lodash-es for optimized utility functions
- **Package Manager**: pnpm for efficient dependency management

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Vue 3 Frontend Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Components: CodeEditor, RuntimeOutput, IdeControls         │
│  Composables: useBasicIdeEnhanced (state management)        │
├─────────────────────────────────────────────────────────────┤
│                    Core Interpreter Layer                   │
├─────────────────────────────────────────────────────────────┤
│  BasicInterpreter (AST-based interpreter)                   │
│  Parser: FBasicParser (Peggy.js grammar-based)              │
│  AST Types: Comprehensive type definitions                  │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  Interfaces: TypeScript type definitions                    │
│  Constants: Centralized configuration and constants         │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles
1. **AST-Based Parsing** - Modern grammar-based parser using Peggy.js
2. **Type Safety** - Comprehensive TypeScript interfaces and type checking
3. **Testability** - Extensive unit test coverage (145 tests)
4. **Maintainability** - Clean code with consistent patterns
5. **Performance** - Optimized with tree-shaking and native methods

### UI Component Library (Element Plus)

#### Overview
Element Plus is the Vue 3 implementation of Element UI, providing a comprehensive set of professional UI components. It's chosen for its:
- **Vue 3 Compatibility** - Built specifically for Vue 3 with Composition API support
- **Professional Design** - Clean, modern interface components
- **TypeScript Support** - Full TypeScript definitions included
- **Accessibility** - WCAG compliant components
- **Customization** - Extensive theming and styling options

#### Components Used
```typescript
// Main IDE Components
<el-button>          // Run/Stop/Clear buttons in IdeControls
<el-tag>             // Error status indicators in RuntimeOutput
<el-textarea>        // Code input in CodeEditor
<el-scrollbar>       // Scrollable output areas
<el-divider>         // Visual separators
<el-icon>            // Action icons (Play, Stop, Clear)
```

#### Implementation Examples

**IdeControls Component:**
```vue
<template>
  <div class="ide-controls">
    <el-button 
      type="primary" 
      :disabled="!canRun"
      @click="runCode"
      :icon="VideoPlay"
    >
      Run
    </el-button>
    <el-button 
      type="danger" 
      :disabled="!canStop"
      @click="stopCode"
      :icon="VideoPause"
    >
      Stop
    </el-button>
    <el-button 
      @click="clearCode"
      :icon="Delete"
    >
      Clear
    </el-button>
  </div>
</template>
```

**RuntimeOutput Component:**
```vue
<template>
  <div class="runtime-output">
    <el-tag v-if="errors.length > 0" type="danger" size="small">
      {{ errors.length }} Error(s)
    </el-tag>
    
    <el-scrollbar class="output-scrollbar">
      <div class="output-content">
        <pre>{{ output }}</pre>
      </div>
    </el-scrollbar>
    
    <div v-if="errors.length > 0" class="error-output">
      <el-divider />
      <div v-for="error in errors" :key="error" class="error-item">
        {{ error }}
      </div>
    </div>
  </div>
</template>
```

#### Configuration
Element Plus is configured in `src/main.ts`:
```typescript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

#### Theming & Customization
- **CSS Variables**: Element Plus uses CSS custom properties for theming
- **Component Props**: Extensive prop system for customization
- **Size Variants**: Small, default, large size options
- **Type Variants**: Primary, success, warning, danger, info types

#### Best Practices
1. **Consistent Sizing**: Use `size="small"` for compact interfaces
2. **Semantic Colors**: Use appropriate `type` props (primary, danger, etc.)
3. **Icon Integration**: Use Element Plus icons with `:icon` prop
4. **Accessibility**: Leverage built-in ARIA attributes
5. **Responsive Design**: Use Element Plus responsive utilities

#### Component Guidelines
- **Buttons**: Use semantic types (primary for main actions, danger for destructive)
- **Tags**: Use for status indicators and labels
- **Scrollbars**: Wrap long content areas for better UX
- **Dividers**: Separate logical sections visually
- **Icons**: Use consistent icon set throughout the application

## 📁 Folder Structure

```
fbasic-emu/
├── public/                          # Static assets
├── src/
│   ├── components/                  # Vue components
│   ├── composables/                 # Vue composables
│   ├── core/                        # Core interpreter logic
│   │   └── parser/                  # Parser system
│   ├── test/                        # Unit tests
│   ├── App.vue                      # Main application component
│   ├── main.ts                      # Application entry point
│   └── style.css                    # Global styles
├── .vscode/                         # VS Code configuration
├── .gitignore                       # Git ignore rules
├── .cursorignore                    # Cursor IDE ignore rules
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
└── README.md                        # This file
```

## 📋 Coding Guidelines

### TypeScript Standards
- **Strict Mode**: All TypeScript strict checks enabled
- **Type Definitions**: Use interfaces for all data structures
- **Type-only Imports**: Use `import type` for type-only imports
- **No `any` Types**: Avoid `any`, use specific types or `unknown`

### Code Organization
- **File Size Limit**: No `.ts` file larger than 300 lines
- **Single Responsibility**: Each file/function has one clear purpose
- **Constants**: All magic numbers/strings in `constants.ts`
- **AST-Based**: Use AST nodes for all parsing and execution

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase for variables, UPPER_CASE for constants
- **Functions**: Verb-based names (e.g., `executePrint`, `validateVariable`)
- **Interfaces**: PascalCase with descriptive names (e.g., `BasicVariable`)

### Error Handling
- **Graceful Degradation**: Always provide fallback behavior
- **Error Types**: Use `ERROR_TYPES` enum for consistent error classification
- **User-Friendly Messages**: Clear, actionable error messages
- **Logging**: Use console logging for debugging (development only)

### Testing Requirements
- **Coverage**: All core functionality must have unit tests
- **Test Structure**: Use `describe` blocks for logical grouping
- **Naming**: Test names should describe expected behavior
- **Isolation**: Each test should be independent and clean up after itself

### Performance Guidelines
- **Native Methods**: Use native array methods (`.map()`, `.filter()`) over lodash
- **Lodash Usage**: Only for complex utilities (`isEmpty()`, `isNumber()`)
- **Tree Shaking**: Import only needed functions from lodash-es
- **Memory Management**: Clean up resources and avoid memory leaks

## 🤖 AI-Specific Instructions

### Code Generation Guidelines
When working with this codebase, follow these AI-specific instructions:

#### File Size Management
- **Never exceed 300 lines** in any `.ts` file
- If approaching limit, extract functionality to focused modules
- Use AST-based patterns for parsing and execution

#### Constant Usage
- **Always use constants** from `constants.ts` instead of magic values
- Add new constants to `constants.ts` if they're used in multiple places
- Use descriptive constant names (e.g., `EXECUTION_LIMITS.MAX_ITERATIONS`)

#### Type Safety
- **Use TypeScript interfaces** defined in `interfaces.ts`
- Import types with `import type` syntax
- Never use `any` type - use specific types or `unknown`

#### Testing Requirements
- **Write tests for all new functionality**
- Follow existing test patterns in `src/test/`
- Ensure all tests pass before submitting changes
- Use `beforeEach`/`afterEach` for proper test isolation

#### Lodash Usage Rules
- **Use native methods** for simple operations: `.map()`, `.filter()`, `.forEach()`
- **Use lodash** only for complex utilities: `isEmpty()`, `isNumber()`, `includes()`
- Import specific functions: `import { isEmpty } from 'lodash-es'`

#### Element Plus Component Guidelines
- **Use semantic components**: `<el-button>`, `<el-tag>`, `<el-scrollbar>`, etc.
- **Follow naming conventions**: Use kebab-case for component names (`el-button`)
- **Use appropriate props**: `type="primary"` for main actions, `type="danger"` for destructive
- **Icon integration**: Use Element Plus icons with `:icon` prop
- **Size consistency**: Use `size="small"` for compact interfaces
- **Accessibility**: Leverage built-in ARIA attributes and semantic HTML

#### Error Handling
- **Always handle errors gracefully**
- Use `ERROR_TYPES` enum for error classification
- Provide clear, user-friendly error messages
- Log errors appropriately for debugging

#### Refactoring Guidelines
- **Maintain AST-based architecture** - use parser and AST nodes for all operations
- **Keep BasicInterpreter.ts under 300 lines** - delegate to AST methods when needed
- **Preserve existing functionality** - all 145 tests must continue to pass
- **Update tests** when changing behavior

#### Code Quality
- **Follow ESLint rules** - run `pnpm lint` before committing
- **Use Prettier formatting** - run `pnpm lint` to auto-fix
- **Type check** - run `pnpm type-check` to ensure no TypeScript errors
- **Test coverage** - run `pnpm test:run` to ensure all tests pass

### Development Workflow
1. **Read existing code** to understand AST-based patterns and structure
2. **Check constants.ts** for existing constants before adding new ones
3. **Follow AST patterns** - use parser and AST nodes for all operations
4. **Write tests first** for new functionality
5. **Run quality checks** before submitting changes
6. **Maintain file size limits** by extracting to focused modules when needed

### Common Patterns
- **Interpreter Methods**: Use AST-based execution with `executeStatement()` dispatch
- **Error Handling**: Use `errors.push()` pattern with proper error objects
- **Variable Management**: Use `Map<string, BasicVariable>` for variable storage
- **Statement Parsing**: Use `FBasicParser.parse()` for AST generation
- **Expression Evaluation**: Use `evaluateExpression()` for safe expression evaluation
- **UI Components**: Use Element Plus components with semantic props and consistent sizing
- **Button Patterns**: `<el-button type="primary" :disabled="!canRun" @click="action">`
- **Status Indicators**: `<el-tag type="danger" size="small">Error Count</el-tag>`
- **Scrollable Content**: Wrap long content in `<el-scrollbar>` for better UX

---

## 🏗️ AST-Based Architecture

### Parser System
The project uses a modern **Abstract Syntax Tree (AST)** based approach for parsing and executing F-BASIC programs:

#### Grammar Definition
- **File**: `src/core/parser/fbasic-grammar-minimal.pegjs`
- **Tool**: Peggy.js parser generator
- **Format**: PEG (Parsing Expression Grammar)
- **Features**: Comprehensive F-BASIC syntax support

#### AST Types
- **File**: `src/core/parser/ast-types.ts`
- **Coverage**: All statement and expression types
- **Type Safety**: Full TypeScript support
- **Extensibility**: Easy to add new language features

#### Parser Interface
- **File**: `src/core/parser/FBasicParser.ts`
- **Methods**: `parse()`, `parseStatement()`, `parseExpression()`
- **Error Handling**: Detailed error reporting with line numbers
- **Fallback**: Graceful degradation for parsing errors

#### Build Process
1. **Grammar** → Peggy.js generates parser
2. **Parser** → TypeScript interfaces for AST nodes
3. **Interpreter** → Executes AST nodes directly

### Benefits
- **Accuracy**: Grammar-based parsing ensures correct syntax
- **Maintainability**: Clear separation between parsing and execution
- **Extensibility**: Easy to add new language features
- **Performance**: Optimized parser generation
- **Error Reporting**: Precise line number and context information

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd fbasic-emu

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Run tests with coverage
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler
```

### Development
1. **Start the dev server**: `pnpm dev`
2. **Open browser**: Navigate to `http://localhost:5173`
3. **Write BASIC code**: Use the code editor on the left
4. **Run code**: Click the "Run" button to execute
5. **View output**: See results in the runtime output panel

---

## 📚 Supported F-BASIC Features

### Current Implementation
- ✅ **PRINT** - Output text and variables
- ✅ **LET** - Variable assignment (numbers and strings)
- ✅ **FOR/NEXT** - Loop structures with STEP support
- ✅ **IF/THEN** - Conditional statements with all comparison operators
- ✅ **GOTO** - Jump statements with line number support
- ✅ **END** - Program termination
- ✅ **Variables** - Numeric and string variables
- ✅ **Expressions** - Arithmetic, comparison, and logical operations
- ✅ **Mathematical Functions** - ABS, SQR, SIN, COS, TAN, ATN, LOG, EXP, INT, FIX, SGN, RND
- ✅ **String Operations** - Concatenation and comparison
- ✅ **Error Handling** - Comprehensive error reporting with line numbers
- ✅ **AST-Based Parser** - Modern grammar-based parsing with Peggy.js

### Planned Features
- 🔄 **Graphics** - Sprite and background rendering
- 🔄 **File I/O** - Save and load programs
- 🔄 **Arrays** - Multi-dimensional arrays
- 🔄 **Subroutines** - GOSUB/RETURN
- 🔄 **Input** - User input statements
- 🔄 **Data/Read** - Data storage and retrieval

---

## 🤝 Contributing

We welcome contributions! Please follow the coding guidelines and ensure all tests pass before submitting pull requests.

### Contribution Process
1. Fork the repository
2. Create a feature branch
3. Follow coding guidelines
4. Write tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Family Basic language specification
- Vue.js and Vite teams for excellent tooling
- Element Plus for UI components
- Lodash team for utility functions
- All contributors and testers