/**
 * F-BASIC Syntax Checker
 *
 * Validates F-BASIC code by running the Chevrotain parser against it.
 * Reports syntax errors with line numbers and error details.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseWithChevrotain } from '../../src/core/parser/FBasicChevrotainParser'

interface SyntaxCheckResult {
  file: string
  success: boolean
  errors: Array<{
    line: number
    column: number
    message: string
  }>
}

interface SyntaxCheckReport {
  totalFiles: number
  passedFiles: number
  failedFiles: number
  results: SyntaxCheckResult[]
}

/**
 * Check syntax of a single F-BASIC code string
 */
export function checkSyntax(code: string, filename = '<unknown>'): SyntaxCheckResult {
  const result = parseWithChevrotain(code)

  return {
    file: filename,
    success: result.success,
    errors:
      result.errors?.map(e => ({
        line: e.line ?? 0,
        column: e.column ?? 0,
        message: e.message,
      })) ?? [],
  }
}

/**
 * Check syntax of all sample codes
 */
export async function checkAllSampleCodes(): Promise<SyntaxCheckReport> {
  // Import sample codes (dynamic import for ESM compatibility)
  const samplesModule = await import('../../src/core/samples/sampleCodes.js')
  const { SAMPLE_CODES } = samplesModule

  const results: SyntaxCheckResult[] = []

  // Check all embedded sample codes
  for (const [key, sample] of Object.entries(SAMPLE_CODES)) {
    const result = checkSyntax(sample.code, `sample:${key}`)
    results.push(result)
  }

  // Check external .bas files
  const basDirs = ['sample', 'public/samples', 'dist/samples']
  for (const dir of basDirs) {
    try {
      const files = readdirSync(dir)
      for (const file of files) {
        if (file.endsWith('.bas')) {
          const filePath = join(dir, file)
          const code = readFileSync(filePath, 'utf-8')
          const result = checkSyntax(code, filePath)
          results.push(result)
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }

  // Generate report
  const passedFiles = results.filter(r => r.success).length
  const failedFiles = results.filter(r => !r.success).length

  return {
    totalFiles: results.length,
    passedFiles,
    failedFiles,
    results,
  }
}

/**
 * Print syntax check report to console
 */
export function printSyntaxReport(report: SyntaxCheckReport): void {
  console.log('\n=== F-BASIC Syntax Check Report ===\n')
  console.log(`Total files: ${report.totalFiles}`)
  console.log(`Passed: ${report.passedFiles}`)
  console.log(`Failed: ${report.failedFiles}`)

  if (report.failedFiles > 0) {
    console.log('\n=== Errors ===\n')

    for (const result of report.results) {
      if (!result.success) {
        console.log(`\n❌ ${result.file}`)
        for (const error of result.errors) {
          console.log(`   Line ${error.line}, Col ${error.column}: ${error.message}`)
        }
      }
    }
  } else {
    console.log('\n✅ All files passed syntax check!\n')
  }
}

/**
 * Main entry point when run as script
 */
const isMainModule = import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
  process.argv[1]?.endsWith('check-syntax.ts')

if (isMainModule) {
  checkAllSampleCodes().then(report => {
    printSyntaxReport(report)

    // Exit with error code if any files failed
    process.exit(report.failedFiles > 0 ? 1 : 0)
  })
}
