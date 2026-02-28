/**
 * Types for Sound Test Cases
 */

export type TestResult = 'pass' | 'fail' | 'untested'

export interface SoundTestCase {
  /** Unique identifier */
  id: string
  /** Category for grouping */
  category: string
  /** Test name */
  name: string
  /** Description of what to listen for */
  description: string
  /** Music string to play */
  musicString: string
  /** Expected behavior */
  expectedBehavior: string
}

export interface TestResultRecord {
  testCaseId: string
  result: TestResult
  notes: string
}
