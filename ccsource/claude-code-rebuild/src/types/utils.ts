/**
 * Utility Types - 重建的类型定义
 *
 * 这些类型定义基于源码 import 分析重建
 * 原文件缺失，此为学习用途的近似定义
 */

// ============================================================================
// Deep Immutable
// ============================================================================

/**
 * Makes all properties recursively readonly
 */
export type DeepImmutable<T> = {
  readonly [P in keyof T]: T[P] extends Function
    ? T[P]
    : T[P] extends object
    ? DeepImmutable<T[P]>
    : T[P]
}

// ============================================================================
// Deep Partial
// ============================================================================

/**
 * Makes all properties recursively optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

// ============================================================================
// Deep Required
// ============================================================================

/**
 * Makes all properties recursively required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P]
}

// ============================================================================
// Non-Nullable
// ============================================================================

/**
 * Excludes null and undefined from T
 */
export type NonNullable<T> = T extends null | undefined ? never : T

// ============================================================================
// Exact
// ============================================================================

/**
 * Ensures type matches exactly, no extra properties
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never

// ============================================================================
// Brand
// ============================================================================

/**
 * Creates a branded type for nominal typing
 */
export type Brand<T, B> = T & { __brand: B }

// ============================================================================
// Omit Strict
// ============================================================================

/**
 * Omit that requires the key to exist
 */
export type OmitStrict<T, K extends keyof T> = Omit<T, K>

// ============================================================================
// Pick Strict
// ============================================================================

/**
 * Pick that requires the keys to exist
 */
export type PickStrict<T, K extends keyof T> = Pick<T, K>

// ============================================================================
// Merge
// ============================================================================

/**
 * Merge two types, with second overriding first
 */
export type Merge<T, U> = Omit<T, keyof U> & U

// ============================================================================
// Required Keys
// ============================================================================

/**
 * Get keys that are required in T
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

// ============================================================================
// Optional Keys
// ============================================================================

/**
 * Get keys that are optional in T
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

// ============================================================================
// Function Properties
// ============================================================================

/**
 * Get only function properties of T
 */
export type FunctionProperties<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K]
}

// ============================================================================
// Non-Function Properties
// ============================================================================

/**
 * Get only non-function properties of T
 */
export type NonFunctionProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
}
