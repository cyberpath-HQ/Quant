/**
 * @fileoverview CVSS v2.0 Module Exports
 * @description Barrel export for all CVSS v2.0 scoring functionality
 */

export {
    calculateCVSSv2Score,
    getSeverityRating,
    generateVector,
    parseVector,
    createDefaultMetrics,
} from "./scoring";
