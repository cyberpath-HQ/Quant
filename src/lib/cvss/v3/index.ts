/**
 * @fileoverview CVSS v3.x Module Exports
 * @description Barrel export for all CVSS v3.0 and v3.1 scoring functionality
 */

export {
    calculateCVSSv3Score,
    calculateOptionImpact,
    getSeverityRating,
    generateVector,
    parseVector,
    createDefaultMetrics,
    DEFAULT_METRICS
} from "./scoring";

export type {
    CVSSv3Version
} from "./scoring";
