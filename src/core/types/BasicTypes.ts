/**
 * BASIC Value Types
 *
 * Defines the fundamental types that BASIC variables and constants can have.
 * According to BASIC specification, values can only be:
 * - Numbers
 * - Strings
 * - Arrays of numbers or strings
 */

/**
 * A BASIC scalar value (number or string)
 */
export type BasicScalarValue = number | string

/**
 * A BASIC array value - can contain numbers, strings, or nested arrays
 */
export type BasicArrayValue = BasicScalarValue | BasicArrayValue[]

/**
 * Any BASIC value (scalar or array)
 */
export type BasicValue = BasicScalarValue | BasicArrayValue

/**
 * Type guard to check if a value is a scalar (not an array)
 */
export function isBasicScalar(value: BasicValue): value is BasicScalarValue {
  return typeof value === 'number' || typeof value === 'string'
}

/**
 * Type guard to check if a value is an array
 */
export function isBasicArray(value: BasicValue): value is BasicArrayValue[] {
  return Array.isArray(value)
}

/**
 * Type guard to check if a value is a number
 */
export function isBasicNumber(value: BasicValue): value is number {
  return typeof value === 'number'
}

/**
 * Type guard to check if a value is a string
 */
export function isBasicString(value: BasicValue): value is string {
  return typeof value === 'string'
}
