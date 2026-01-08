/**
 * @fileoverview CVSS v4.0 Module Exports
 * @description Barrel export for all CVSS v4.0 scoring functionality
 */

export {
    calculateCVSSv4Score,
    calculateMacroVector,
    getSeverityRating,
    generateVector,
    parseVector,
    DEFAULT_METRICS,
    calculateMetricContribution,
    calculateAllMetricContributions,
    calculateOptionImpact
} from "./scoring";

export {
    CVSS_V4_LOOKUP,
    METRIC_LEVELS,
    MAX_COMPOSED,
    MAX_SEVERITY
} from "./lookup";
