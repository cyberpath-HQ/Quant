/**
 * @fileoverview CVSS Calculator Library
 * @description Unified exports for all CVSS versions (4.0, 3.1, 3.0, 2.0)
 *
 * This library provides complete scoring implementations for all major CVSS versions:
 *
 * - **CVSS v4.0**: Latest version with MacroVector-based scoring, threat metrics,
 *   and supplemental metrics for comprehensive vulnerability assessment
 *
 * - **CVSS v3.1/3.0**: Industry standard with Scope concept, formula-based scoring,
 *   and temporal/environmental modifiers
 *
 * - **CVSS v2.0**: Legacy version for backward compatibility and historical data
 *
 * @example Basic Usage
 * ```typescript
 * import { v4, v3, v2, type CVSSv4Metrics, type CVSSv3Metrics } from '@/lib/cvss';
 *
 * // CVSS v4.0
 * const v4Metrics = v4.createDefaultMetrics();
 * const v4Score = v4.calculateCVSSv4Score(v4Metrics);
 *
 * // CVSS v3.1
 * const v3Metrics = v3.createDefaultMetrics();
 * const v3Score = v3.calculateCVSSv3Score(v3Metrics, '3.1');
 *
 * // CVSS v2.0
 * const v2Metrics = v2.createDefaultMetrics();
 * const v2Score = v2.calculateCVSSv2Score(v2Metrics);
 * ```
 *
 * @see https://www.first.org/cvss/
 */

export * as v4 from "./v4";
export * as v3 from "./v3";
export * as v2 from "./v2";

export * from "./types";
export * as vectorParser from "./vector-parser";

/**
 * Get severity rating from numeric score
 * Applies to all CVSS versions
 */
export function getSeverityRating(score: number): string {
  if (score === 0.0) return "None";
  if (score >= 0.1 && score <= 3.9) return "Low";
  if (score >= 4.0 && score <= 6.9) return "Medium";
  if (score >= 7.0 && score <= 8.9) return "High";
  if (score >= 9.0 && score <= 10.0) return "Critical";
  return "None";
}
