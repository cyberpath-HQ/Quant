/**
 * @fileoverview CVSS v3.x Module Exports
 * @description Barrel export for all CVSS v3.0 and v3.1 scoring functionality
 */

export {
    calculateCVSSv3Score,
    getSeverityRating,
    generateVector,
    parseVector,
    createDefaultMetrics,
} from "./scoring";

export type { CVSSv3Version } from "./scoring";
