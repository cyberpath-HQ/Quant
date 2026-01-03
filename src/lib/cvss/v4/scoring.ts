/**
 * @fileoverview CVSS v4.0 Scoring Engine
 * @description Complete implementation of CVSS v4.0 scoring based on the official specification
 *
 * CVSS v4.0 uses a MacroVector-based scoring system with interpolation:
 * 1. Metrics are grouped into 6 Equivalence Classes (EQ1-EQ6)
 * 2. Each EQ has 2-3 levels (0 = most severe, 2 = least severe)
 * 3. The MacroVector is a 6-digit string representing all EQ levels
 * 4. Base score comes from a lookup table of 270 MacroVector combinations
 * 5. Final score is interpolated within the MacroVector based on metric distance
 *
 * @see https://www.first.org/cvss/v4-0/specification-document
 * @see https://github.com/FIRSTdotorg/cvss-v4-calculator
 */

import type {
    CVSSv4Metrics,
    CVSSv4Score,
    CVSSv4MacroVector,
    CVSSv4Nomenclature,
    SeverityRating
} from "../types";
import { CVSS_V4_LOOKUP, MAX_COMPOSED, MAX_SEVERITY, METRIC_LEVELS } from "./lookup";

/** Named constants to avoid magic numbers */
enum Constants {
    MAX_SCORE = 10,
    MIN_SCORE = 0,
    ROUND_MULTIPLIER = 10,
    NOT_FOUND = -1,
}

/** Score thresholds for severity ratings */
enum SeverityThreshold {
    LOW = 4.0,
    MEDIUM = 7.0,
    HIGH = 9.0,
}

/** Equivalence class level values */
enum EQLevel {
    HIGHEST = 0,
    MIDDLE = 1,
    LOWEST = 2,
}

/** MacroVector index positions */
enum MacroVectorIndex {
    EQ1 = 0,
    EQ2 = 1,
    EQ3 = 2,
    EQ4 = 3,
    EQ5 = 4,
    EQ6 = 5,
}

/** EQ number identifiers */
enum EQNumber {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
}

/** Score interpolation step */
const SCORE_STEP = 0.1;

/**
 * Get effective metric value, applying environmental overrides and defaults
 */
function getMetricValue(metrics: CVSSv4Metrics, metric: string): string {
    const metricsRecord = metrics as unknown as Record<string, string>;
    const selected = metricsRecord[metric];

    if (metric === `E` && selected === `X`) {
        return `A`;
    }

    if ((metric === `CR` || metric === `IR` || metric === `AR`) && selected === `X`) {
        return `H`;
    }

    if (metric.startsWith(`M`) && selected === `X`) {
        const baseMetric = metric.slice(EQNumber.ONE);
        return metricsRecord[baseMetric];
    }

    return selected;
}

/**
 * Extract a metric value from a vector string
 */
function extractMetricFromVector(metric: string, vector: string): string {
    const index = vector.indexOf(metric);
    if (index === Constants.NOT_FOUND) {
        return ``;
    }

    let extracted = vector.slice(index + metric.length + EQNumber.ONE);
    const slashIndex = extracted.indexOf(`/`);
    if (slashIndex > Constants.MIN_SCORE) {
        extracted = extracted.substring(Constants.MIN_SCORE, slashIndex);
    }
    return extracted;
}

/**
 * Get metric level value for distance calculation
 */
function getMetricLevel(metric: string, value: string): number {
    const levels = METRIC_LEVELS[metric as keyof typeof METRIC_LEVELS];
    if (!levels) {
        return Constants.MIN_SCORE;
    }
    return (levels as Record<string, number>)[value] ?? Constants.MIN_SCORE;
}

/**
 * Calculate EQ1 level based on exploitability metrics
 */
function calculateEQ1(m: (metric: string) => string): EQLevel {
    if (m(`AV`) === `N` && m(`PR`) === `N` && m(`UI`) === `N`) {
        return EQLevel.HIGHEST;
    }
    if (
        (m(`AV`) === `N` || m(`PR`) === `N` || m(`UI`) === `N`) &&
        !(m(`AV`) === `N` && m(`PR`) === `N` && m(`UI`) === `N`) &&
        m(`AV`) !== `P`
    ) {
        return EQLevel.MIDDLE;
    }
    return EQLevel.LOWEST;
}

/**
 * Calculate EQ2 level based on complexity metrics
 */
function calculateEQ2(m: (metric: string) => string): EQLevel {
    if (m(`AC`) === `L` && m(`AT`) === `N`) {
        return EQLevel.HIGHEST;
    }
    return EQLevel.MIDDLE;
}

/**
 * Calculate EQ3 level based on vulnerable system impact
 */
function calculateEQ3(m: (metric: string) => string): EQLevel {
    if (m(`VC`) === `H` && m(`VI`) === `H`) {
        return EQLevel.HIGHEST;
    }
    if (
        !(m(`VC`) === `H` && m(`VI`) === `H`) &&
        (m(`VC`) === `H` || m(`VI`) === `H` || m(`VA`) === `H`)
    ) {
        return EQLevel.MIDDLE;
    }
    return EQLevel.LOWEST;
}

/**
 * Calculate EQ4 level based on subsequent system impact
 */
function calculateEQ4(m: (metric: string) => string): EQLevel {
    if (m(`MSI`) === `S` || m(`MSA`) === `S`) {
        return EQLevel.HIGHEST;
    }
    if (
        !(m(`MSI`) === `S` || m(`MSA`) === `S`) &&
        (m(`SC`) === `H` || m(`SI`) === `H` || m(`SA`) === `H`)
    ) {
        return EQLevel.MIDDLE;
    }
    return EQLevel.LOWEST;
}

/**
 * Calculate EQ5 level based on exploit maturity
 */
function calculateEQ5(m: (metric: string) => string): EQLevel {
    if (m(`E`) === `A`) {
        return EQLevel.HIGHEST;
    }
    if (m(`E`) === `P`) {
        return EQLevel.MIDDLE;
    }
    return EQLevel.LOWEST;
}

/**
 * Calculate EQ6 level based on security requirements impact
 */
function calculateEQ6(m: (metric: string) => string): EQLevel {
    if (
        (m(`CR`) === `H` && m(`VC`) === `H`) ||
        (m(`IR`) === `H` && m(`VI`) === `H`) ||
        (m(`AR`) === `H` && m(`VA`) === `H`)
    ) {
        return EQLevel.HIGHEST;
    }
    return EQLevel.MIDDLE;
}

/**
 * Calculate the MacroVector (Equivalence Class assignments) for given metrics
 */
export function calculateMacroVector(metrics: CVSSv4Metrics): CVSSv4MacroVector {
    const m = (metric: string): string => getMetricValue(metrics, metric);

    const eq1 = calculateEQ1(m);
    const eq2 = calculateEQ2(m);
    const eq3 = calculateEQ3(m);
    const eq4 = calculateEQ4(m);
    const eq5 = calculateEQ5(m);
    const eq6 = calculateEQ6(m);

    return `${eq1}${eq2}${eq3}${eq4}${eq5}${eq6}`;
}

/**
 * Get the maximum severity vectors for a given MacroVector level
 */
function getEQMaxes(eq: EQNumber, level: number, eq6Level?: number): string[] {
    if (eq === EQNumber.THREE) {
        const eq3Data = MAX_COMPOSED.eq3[level] as Record<number, string[]>;
        return eq3Data[eq6Level!] ?? [];
    }
    const eqKey = `eq${eq}` as keyof typeof MAX_COMPOSED;
    const eqData = MAX_COMPOSED[eqKey] as Record<number, string[]>;
    return eqData[level] ?? [];
}

/** Severity distances from max vector */
interface SeverityDistances {
    eq1:    number;
    eq2:    number;
    eq3eq6: number;
    eq4:    number;
}

/**
 * Calculate severity distance from the maximum severity vector
 */
function calculateSeverityDistances(
    metrics: CVSSv4Metrics,
    maxVectors: string[]
): SeverityDistances {
    const m = (metric: string): string => getMetricValue(metrics, metric);
    const result: SeverityDistances = { eq1: 0, eq2: 0, eq3eq6: 0, eq4: 0 };

    for (const maxVector of maxVectors) {
        const distAV = getMetricLevel(`AV`, m(`AV`)) - getMetricLevel(`AV`, extractMetricFromVector(`AV`, maxVector));
        const distPR = getMetricLevel(`PR`, m(`PR`)) - getMetricLevel(`PR`, extractMetricFromVector(`PR`, maxVector));
        const distUI = getMetricLevel(`UI`, m(`UI`)) - getMetricLevel(`UI`, extractMetricFromVector(`UI`, maxVector));
        const distAC = getMetricLevel(`AC`, m(`AC`)) - getMetricLevel(`AC`, extractMetricFromVector(`AC`, maxVector));
        const distAT = getMetricLevel(`AT`, m(`AT`)) - getMetricLevel(`AT`, extractMetricFromVector(`AT`, maxVector));
        const distVC = getMetricLevel(`VC`, m(`VC`)) - getMetricLevel(`VC`, extractMetricFromVector(`VC`, maxVector));
        const distVI = getMetricLevel(`VI`, m(`VI`)) - getMetricLevel(`VI`, extractMetricFromVector(`VI`, maxVector));
        const distVA = getMetricLevel(`VA`, m(`VA`)) - getMetricLevel(`VA`, extractMetricFromVector(`VA`, maxVector));
        const distSC = getMetricLevel(`SC`, m(`SC`)) - getMetricLevel(`SC`, extractMetricFromVector(`SC`, maxVector));
        const distSI = getMetricLevel(`SI`, m(`SI`)) - getMetricLevel(`SI`, extractMetricFromVector(`SI`, maxVector));
        const distSA = getMetricLevel(`SA`, m(`SA`)) - getMetricLevel(`SA`, extractMetricFromVector(`SA`, maxVector));
        const distCR = getMetricLevel(`CR`, m(`CR`)) - getMetricLevel(`CR`, extractMetricFromVector(`CR`, maxVector));
        const distIR = getMetricLevel(`IR`, m(`IR`)) - getMetricLevel(`IR`, extractMetricFromVector(`IR`, maxVector));
        const distAR = getMetricLevel(`AR`, m(`AR`)) - getMetricLevel(`AR`, extractMetricFromVector(`AR`, maxVector));

        const allDistances = [
            distAV, distPR, distUI, distAC, distAT,
            distVC, distVI, distVA, distSC, distSI, distSA,
            distCR, distIR, distAR,
        ];

        if (allDistances.some((d) => d < Constants.MIN_SCORE)) {
            continue;
        }

        result.eq1 = distAV + distPR + distUI;
        result.eq2 = distAC + distAT;
        result.eq3eq6 = distVC + distVI + distVA + distCR + distIR + distAR;
        result.eq4 = distSC + distSI + distSA;
        break;
    }

    return result;
}

/**
 * Compose all possible max vectors from EQ components
 */
function composeMaxVectors(
    eq1Maxes: string[],
    eq2Maxes: string[],
    eq3eq6Maxes: string[],
    eq4Maxes: string[],
    eq5Maxes: string[]
): string[] {
    const maxVectors: string[] = [];
    for (const eq1Max of eq1Maxes) {
        for (const eq2Max of eq2Maxes) {
            for (const eq3eq6Max of eq3eq6Maxes) {
                for (const eq4Max of eq4Maxes) {
                    for (const eq5Max of eq5Maxes) {
                        maxVectors.push(eq1Max + eq2Max + eq3eq6Max + eq4Max + eq5Max);
                    }
                }
            }
        }
    }
    return maxVectors;
}

/**
 * Convert numeric score to severity rating
 */
export function getSeverityRating(score: number): SeverityRating {
    if (score === Constants.MIN_SCORE) {
        return `None`;
    }
    if (score < SeverityThreshold.LOW) {
        return `Low`;
    }
    if (score < SeverityThreshold.MEDIUM) {
        return `Medium`;
    }
    if (score < SeverityThreshold.HIGH) {
        return `High`;
    }
    return `Critical`;
}

/**
 * Determine the score nomenclature based on which metrics are defined
 */
function determineNomenclature(metrics: CVSSv4Metrics): CVSSv4Nomenclature {
    const hasEnvironmental = metrics.CR !== `X` || metrics.IR !== `X` || metrics.AR !== `X` ||
        metrics.MAV !== `X` || metrics.MAC !== `X` || metrics.MAT !== `X` ||
        metrics.MPR !== `X` || metrics.MUI !== `X` || metrics.MVC !== `X` ||
        metrics.MVI !== `X` || metrics.MVA !== `X` || metrics.MSC !== `X` ||
        metrics.MSI !== `X` || metrics.MSA !== `X`;

    const hasThreat = metrics.E !== `X`;

    if (hasEnvironmental && hasThreat) {
        return `CVSS-BTE`;
    }
    if (hasThreat) {
        return `CVSS-BT`;
    }
    if (hasEnvironmental) {
        return `CVSS-BE`;
    }
    return `CVSS-B`;
}

/**
 * Generate CVSS v4.0 vector string from metrics
 */
export function generateVector(metrics: CVSSv4Metrics): string {
    const parts: string[] = [`CVSS:4.0`];

    const baseMetrics: (keyof CVSSv4Metrics)[] = [
        `AV`, `AC`, `AT`, `PR`, `UI`, `VC`, `VI`, `VA`, `SC`, `SI`, `SA`,
    ];
    for (const metric of baseMetrics) {
        parts.push(`${metric}:${metrics[metric]}`);
    }

    if (metrics.E !== `X`) {
        parts.push(`E:${metrics.E}`);
    }

    if (metrics.CR !== `X`) {
        parts.push(`CR:${metrics.CR}`);
    }
    if (metrics.IR !== `X`) {
        parts.push(`IR:${metrics.IR}`);
    }
    if (metrics.AR !== `X`) {
        parts.push(`AR:${metrics.AR}`);
    }

    if (metrics.MAV !== `X`) {
        parts.push(`MAV:${metrics.MAV}`);
    }
    if (metrics.MAC !== `X`) {
        parts.push(`MAC:${metrics.MAC}`);
    }
    if (metrics.MAT !== `X`) {
        parts.push(`MAT:${metrics.MAT}`);
    }
    if (metrics.MPR !== `X`) {
        parts.push(`MPR:${metrics.MPR}`);
    }
    if (metrics.MUI !== `X`) {
        parts.push(`MUI:${metrics.MUI}`);
    }
    if (metrics.MVC !== `X`) {
        parts.push(`MVC:${metrics.MVC}`);
    }
    if (metrics.MVI !== `X`) {
        parts.push(`MVI:${metrics.MVI}`);
    }
    if (metrics.MVA !== `X`) {
        parts.push(`MVA:${metrics.MVA}`);
    }
    if (metrics.MSC !== `X`) {
        parts.push(`MSC:${metrics.MSC}`);
    }
    if (metrics.MSI !== `X`) {
        parts.push(`MSI:${metrics.MSI}`);
    }
    if (metrics.MSA !== `X`) {
        parts.push(`MSA:${metrics.MSA}`);
    }

    if (metrics.S !== `X`) {
        parts.push(`S:${metrics.S}`);
    }
    if (metrics.AU !== `X`) {
        parts.push(`AU:${metrics.AU}`);
    }
    if (metrics.R !== `X`) {
        parts.push(`R:${metrics.R}`);
    }
    if (metrics.V !== `X`) {
        parts.push(`V:${metrics.V}`);
    }
    if (metrics.RE !== `X`) {
        parts.push(`RE:${metrics.RE}`);
    }
    if (metrics.U !== `X`) {
        parts.push(`U:${metrics.U}`);
    }

    return parts.join(`/`);
}

/**
 * Parse a CVSS v4.0 vector string into metrics object
 */
export function parseVector(vector: string): CVSSv4Metrics {
    const metrics: CVSSv4Metrics = {
        AV:  `N`,
        AC:  `L`,
        AT:  `N`,
        PR:  `N`,
        UI:  `N`,
        VC:  `N`,
        VI:  `N`,
        VA:  `N`,
        SC:  `N`,
        SI:  `N`,
        SA:  `N`,
        E:   `X`,
        MAV: `X`,
        MAC: `X`,
        MAT: `X`,
        MPR: `X`,
        MUI: `X`,
        MVC: `X`,
        MVI: `X`,
        MVA: `X`,
        MSC: `X`,
        MSI: `X`,
        MSA: `X`,
        CR:  `X`,
        IR:  `X`,
        AR:  `X`,
        S:   `X`,
        AU:  `X`,
        R:   `X`,
        V:   `X`,
        RE:  `X`,
        U:   `X`,
    };

    const parts = vector.split(`/`);
    if (!parts[MacroVectorIndex.EQ1].startsWith(`CVSS:4.0`)) {
        throw new Error(`Invalid CVSS v4.0 vector: must start with CVSS:4.0`);
    }

    for (let i = EQNumber.ONE; i < parts.length; i++) {
        const [key, value] = parts[i].split(`:`);
        if (key && value && key in metrics) {
            (metrics as unknown as Record<string, string>)[key] = value;
        }
    }

    return metrics;
}

/**
 * Create default CVSS v4.0 metrics object with all base metrics at highest severity
 */
export function createDefaultMetrics(): CVSSv4Metrics {
    return {
        AV:  `N`,
        AC:  `L`,
        AT:  `N`,
        PR:  `N`,
        UI:  `N`,
        VC:  `H`,
        VI:  `H`,
        VA:  `H`,
        SC:  `H`,
        SI:  `H`,
        SA:  `H`,
        E:   `X`,
        MAV: `X`,
        MAC: `X`,
        MAT: `X`,
        MPR: `X`,
        MUI: `X`,
        MVC: `X`,
        MVI: `X`,
        MVA: `X`,
        MSC: `X`,
        MSI: `X`,
        MSA: `X`,
        CR:  `X`,
        IR:  `X`,
        AR:  `X`,
        S:   `X`,
        AU:  `X`,
        R:   `X`,
        V:   `X`,
        RE:  `X`,
        U:   `X`,
    };
}

/** Next lower MacroVectors for interpolation */
interface NextLowerMacroVectors {
    eq1:          string;
    eq2:          string;
    eq3eq6:       string;
    eq3eq6Left?:  string;
    eq3eq6Right?: string;
    eq4:          string;
    eq5:          string;
}

/**
 * Compute next lower MacroVectors for interpolation
 */
function getNextLowerMacroVectors(
    eq1: number,
    eq2: number,
    eq3: number,
    eq4: number,
    eq5: number,
    eq6: number
): NextLowerMacroVectors {
    const result: NextLowerMacroVectors = {
        eq1:    `${eq1 + EQNumber.ONE}${eq2}${eq3}${eq4}${eq5}${eq6}`,
        eq2:    `${eq1}${eq2 + EQNumber.ONE}${eq3}${eq4}${eq5}${eq6}`,
        eq3eq6: ``,
        eq4:    `${eq1}${eq2}${eq3}${eq4 + EQNumber.ONE}${eq5}${eq6}`,
        eq5:    `${eq1}${eq2}${eq3}${eq4}${eq5 + EQNumber.ONE}${eq6}`,
    };

    if (eq3 === EQLevel.MIDDLE && eq6 === EQLevel.MIDDLE) {
        result.eq3eq6 = `${eq1}${eq2}${eq3 + EQNumber.ONE}${eq4}${eq5}${eq6}`;
    } else if (eq3 === EQLevel.HIGHEST && eq6 === EQLevel.MIDDLE) {
        result.eq3eq6 = `${eq1}${eq2}${eq3 + EQNumber.ONE}${eq4}${eq5}${eq6}`;
    } else if (eq3 === EQLevel.MIDDLE && eq6 === EQLevel.HIGHEST) {
        result.eq3eq6 = `${eq1}${eq2}${eq3}${eq4}${eq5}${eq6 + EQNumber.ONE}`;
    } else if (eq3 === EQLevel.HIGHEST && eq6 === EQLevel.HIGHEST) {
        result.eq3eq6Left = `${eq1}${eq2}${eq3}${eq4}${eq5}${eq6 + EQNumber.ONE}`;
        result.eq3eq6Right = `${eq1}${eq2}${eq3 + EQNumber.ONE}${eq4}${eq5}${eq6}`;
    } else {
        result.eq3eq6 = `${eq1}${eq2}${eq3 + EQNumber.ONE}${eq4}${eq5}${eq6 + EQNumber.ONE}`;
    }

    return result;
}

/** Interpolation result */
interface InterpolationResult {
    adjustment: number;
    count:      number;
}

/** EQ levels for interpolation calculation */
interface EQLevels {
    eq1: number;
    eq2: number;
    eq3: number;
    eq4: number;
    eq6: number;
}

/**
 * Calculate interpolation adjustment based on severity distances
 */
function calculateInterpolation(
    baseValue: number,
    nextLower: NextLowerMacroVectors,
    distances: SeverityDistances,
    eqLevels: EQLevels
): InterpolationResult {
    const scoreEq1NextLower = CVSS_V4_LOOKUP[nextLower.eq1];
    const scoreEq2NextLower = CVSS_V4_LOOKUP[nextLower.eq2];
    const scoreEq4NextLower = CVSS_V4_LOOKUP[nextLower.eq4];
    const scoreEq5NextLower = CVSS_V4_LOOKUP[nextLower.eq5];

    let scoreEq3eq6NextLower: number | undefined;
    if (eqLevels.eq3 === EQLevel.HIGHEST && eqLevels.eq6 === EQLevel.HIGHEST) {
        const leftScore = CVSS_V4_LOOKUP[nextLower.eq3eq6Left!];
        const rightScore = CVSS_V4_LOOKUP[nextLower.eq3eq6Right!];
        scoreEq3eq6NextLower = Math.max(leftScore ?? Constants.MIN_SCORE, rightScore ?? Constants.MIN_SCORE);
    } else {
        scoreEq3eq6NextLower = CVSS_V4_LOOKUP[nextLower.eq3eq6];
    }

    let count = Constants.MIN_SCORE;
    let totalNormalized = Constants.MIN_SCORE;

    const maxSeverityEq1 = (MAX_SEVERITY.eq1[eqLevels.eq1] as number) * SCORE_STEP;
    const maxSeverityEq2 = (MAX_SEVERITY.eq2[eqLevels.eq2] as number) * SCORE_STEP;
    const eq3eq6Data = MAX_SEVERITY.eq3eq6[eqLevels.eq3] as Record<number, number> | undefined;
    const maxSeverityEq3eq6 = ((eq3eq6Data?.[eqLevels.eq6] ?? Constants.MIN_SCORE) as number) * SCORE_STEP;
    const maxSeverityEq4 = (MAX_SEVERITY.eq4[eqLevels.eq4] as number) * SCORE_STEP;

    if (scoreEq1NextLower !== undefined && maxSeverityEq1 > Constants.MIN_SCORE) {
        count++;
        const available = baseValue - scoreEq1NextLower;
        const percentToNext = distances.eq1 / maxSeverityEq1;
        totalNormalized += available * percentToNext;
    }

    if (scoreEq2NextLower !== undefined && maxSeverityEq2 > Constants.MIN_SCORE) {
        count++;
        const available = baseValue - scoreEq2NextLower;
        const percentToNext = distances.eq2 / maxSeverityEq2;
        totalNormalized += available * percentToNext;
    }

    if (scoreEq3eq6NextLower !== undefined && maxSeverityEq3eq6 > Constants.MIN_SCORE) {
        count++;
        const available = baseValue - scoreEq3eq6NextLower;
        const percentToNext = distances.eq3eq6 / maxSeverityEq3eq6;
        totalNormalized += available * percentToNext;
    }

    if (scoreEq4NextLower !== undefined && maxSeverityEq4 > Constants.MIN_SCORE) {
        count++;
        const available = baseValue - scoreEq4NextLower;
        const percentToNext = distances.eq4 / maxSeverityEq4;
        totalNormalized += available * percentToNext;
    }

    if (scoreEq5NextLower !== undefined) {
        count++;
    }

    return { adjustment: totalNormalized, count };
}

/**
 * Calculate the CVSS v4.0 score for given metrics
 *
 * Algorithm:
 * 1. Calculate the MacroVector from metrics
 * 2. Look up the base score for this MacroVector
 * 3. Calculate severity distance from highest severity vector in MacroVector
 * 4. Interpolate the final score based on distance
 */
export function calculateCVSSv4Score(metrics: CVSSv4Metrics): CVSSv4Score {
    const m = (metric: string): string => getMetricValue(metrics, metric);

    const impactMetrics = [`VC`, `VI`, `VA`, `SC`, `SI`, `SA`];
    if (impactMetrics.every((metric) => m(metric) === `N`)) {
        return {
            score:        Constants.MIN_SCORE,
            severity:     `None`,
            vector:       generateVector(metrics),
            baseScore:    Constants.MIN_SCORE,
            macroVector:  `222220`,
            nomenclature: determineNomenclature(metrics),
            version:      `4.0`,
        };
    }

    const macroVector = calculateMacroVector(metrics);
    const baseValue = CVSS_V4_LOOKUP[macroVector];

    if (baseValue === undefined) {
        throw new Error(`Invalid MacroVector: ${macroVector}`);
    }

    const eq1 = parseInt(macroVector[MacroVectorIndex.EQ1]);
    const eq2 = parseInt(macroVector[MacroVectorIndex.EQ2]);
    const eq3 = parseInt(macroVector[MacroVectorIndex.EQ3]);
    const eq4 = parseInt(macroVector[MacroVectorIndex.EQ4]);
    const eq5 = parseInt(macroVector[MacroVectorIndex.EQ5]);
    const eq6 = parseInt(macroVector[MacroVectorIndex.EQ6]);

    const eq1Maxes = getEQMaxes(EQNumber.ONE, eq1);
    const eq2Maxes = getEQMaxes(EQNumber.TWO, eq2);
    const eq3eq6Maxes = getEQMaxes(EQNumber.THREE, eq3, eq6);
    const eq4Maxes = getEQMaxes(EQNumber.FOUR, eq4);
    const eq5Maxes = getEQMaxes(EQNumber.FIVE, eq5);

    const maxVectors = composeMaxVectors(eq1Maxes, eq2Maxes, eq3eq6Maxes, eq4Maxes, eq5Maxes);
    const distances = calculateSeverityDistances(metrics, maxVectors);
    const nextLower = getNextLowerMacroVectors(eq1, eq2, eq3, eq4, eq5, eq6);
    const interpolation = calculateInterpolation(
        baseValue,
        nextLower,
        distances,
        { eq1, eq2, eq3, eq4, eq6 }
    );

    let meanDistance = Constants.MIN_SCORE;
    if (interpolation.count > Constants.MIN_SCORE) {
        meanDistance = interpolation.adjustment / interpolation.count;
    }

    let finalScore = baseValue - meanDistance;
    finalScore = Math.max(Constants.MIN_SCORE, Math.min(Constants.MAX_SCORE, finalScore));
    finalScore = Math.round(finalScore * Constants.ROUND_MULTIPLIER) / Constants.ROUND_MULTIPLIER;

    return {
        score:        finalScore,
        severity:     getSeverityRating(finalScore),
        vector:       generateVector(metrics),
        baseScore:    finalScore,
        macroVector,
        nomenclature: determineNomenclature(metrics),
        version:      `4.0`,
    };
}
