/**
 * CST Tree Visualizer
 * 
 * Utility script to visualize CST (Concrete Syntax Tree) structure for debugging.
 * 
 * Usage:
 *   tsx scripts/dev/visualize-cst.ts "10 PRINT X"
 *   tsx scripts/dev/visualize-cst.ts --file path/to/file.bas
 *   tsx scripts/dev/visualize-cst.ts --json "10 IF X=0 THEN PRINT X"
 *   echo "10 PRINT X" | tsx scripts/dev/visualize-cst.ts
 */

import { FBasicParser } from '../../src/core/parser/FBasicParser'
import type { CstNode, CstElement, IToken } from 'chevrotain'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

/* global process */

function isCstNode(cst: CstElement): cst is CstNode {
  return 'children' in cst
}

function isCstToken(cst: CstElement): cst is IToken {
  return 'image' in cst
}

/**
 * Visualize CST tree structure with ASCII tree formatting
 */
function visualizeCst(
  node: CstNode | CstElement,
  indent: string = '',
  isLast: boolean = true,
  maxDepth: number = Infinity,
  currentDepth: number = 0
): string {
  if (currentDepth >= maxDepth) {
    return indent + (isLast ? '└── ' : '├── ') + '... (truncated)\n'
  }

  let result = ''
  const prefix = isLast ? '└── ' : '├── '

  if (isCstNode(node)) {
    result += indent + prefix + node.name + '\n'
    const children = Object.values(node.children).flat()
    const newIndent = indent + (isLast ? '    ' : '│   ')

    for (let i = 0; i < children.length; i++) {
      const child = children[i]!
      const isLastChild = i === children.length - 1
      result += visualizeCst(child, newIndent, isLastChild, maxDepth, currentDepth + 1)
    }
  } else if (isCstToken(node)) {
    const tokenInfo = `${node.tokenType.name}`
    const image = node.image.length > 50 ? node.image.substring(0, 47) + '...' : node.image
    result += indent + prefix + `[${tokenInfo}] "${image}"\n`
  }

  return result
}

/**
 * Get code from various sources (CLI args, file, stdin)
 */
function getCode(): string {
  const args = process.argv.slice(2)

  // Check for --file flag
  const fileIndex = args.indexOf('--file')
  if (fileIndex !== -1) {
    const filePath = args[fileIndex + 1]
    if (!filePath) {
      console.error('Error: --file requires a file path')
      process.exit(1)
    }
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath)
      return readFileSync(fullPath, 'utf-8')
    } catch (error) {
      console.error(`Error reading file: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  }

  // Check for --help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CST Tree Visualizer

Usage:
  tsx scripts/dev/visualize-cst.ts "10 PRINT X"
  tsx scripts/dev/visualize-cst.ts --file path/to/file.bas
  tsx scripts/dev/visualize-cst.ts --json "10 IF X=0 THEN PRINT X"
  tsx scripts/dev/visualize-cst.ts --depth 5 "10 PRINT X"
  echo "10 PRINT X" | tsx scripts/dev/visualize-cst.ts

Options:
  --file <path>    Read code from a file
  --json           Output CST as JSON instead of tree visualization
  --depth <n>      Limit tree depth to n levels (default: unlimited)
  --help, -h        Show this help message

Examples:
  tsx scripts/dev/visualize-cst.ts "10 IF X=0 THEN PRINT X"
  tsx scripts/dev/visualize-cst.ts --file sample/shooting.bas
  tsx scripts/dev/visualize-cst.ts --json "10 FOR I=1 TO 3: PRINT I: NEXT"
`)
    process.exit(0)
  }

  // Get code from remaining args (everything that's not a flag)
  const codeArgs = args.filter(
    (arg, index) =>
      arg !== '--json' &&
      arg !== '--depth' &&
      (index === 0 || args[index - 1] !== '--file' && args[index - 1] !== '--depth')
  )

  if (codeArgs.length > 0) {
    return codeArgs.join(' ')
  }

  // Try to read from stdin
  const stdin = process.stdin
  if (stdin.isTTY) {
    console.error('Error: No code provided. Use --help for usage information.')
    process.exit(1)
  }
  
  // Return null to indicate stdin should be used
  return null
}

/**
 * Process and visualize the code
 */
async function processCode(code: string) {
  const args = process.argv.slice(2)
  const outputJson = args.includes('--json')
  const depthIndex = args.indexOf('--depth')
  const maxDepth = depthIndex !== -1 && args[depthIndex + 1]
    ? parseInt(args[depthIndex + 1]!, 10)
    : Infinity

  if (!code.trim()) {
    console.error('Error: Empty code provided.')
    process.exit(1)
  }

  console.log('Parsing code:')
  console.log(code)
  console.log('\n' + '='.repeat(60) + '\n')

  const parser = new FBasicParser()
  const result = await parser.parse(code)

  if (!result.success) {
    console.error('Parse failed!')
    if (result.errors) {
      console.error('\nErrors:')
      result.errors.forEach((error) => {
        console.error(`  Line ${error.location?.start?.line || '?'}, Column ${error.location?.start?.column || '?'}: ${error.message}`)
      })
    }
    process.exit(1)
  }

  if (!result.cst) {
    console.error('No CST returned')
    process.exit(1)
  }

  if (outputJson) {
    console.log('CST JSON:\n')
    console.log(JSON.stringify(result.cst, null, 2))
  } else {
    console.log('CST Tree Structure:\n')
    const tree = visualizeCst(result.cst, '', true, maxDepth)
    console.log(tree)

    if (maxDepth !== Infinity) {
      console.log(`\n(Note: Tree depth limited to ${maxDepth} levels)`)
    }
  }
}

// Main execution
async function main() {
  const code = getCode()
  
  if (code === null) {
    // Read from stdin
    const stdin = process.stdin
    let inputCode = ''
    stdin.setEncoding('utf8')
    
    for await (const chunk of stdin) {
      inputCode += chunk
    }
    
    if (!inputCode.trim()) {
      console.error('Error: No code provided from stdin.')
      process.exit(1)
    }
    
    await processCode(inputCode.trim())
  } else if (code) {
    await processCode(code)
  } else {
    console.error('Error: No code provided. Use --help for usage information.')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})

