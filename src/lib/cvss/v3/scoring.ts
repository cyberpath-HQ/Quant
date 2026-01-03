/**
 * @fileoverview CVSS v3.x Scoring Engine
 * @description Complete implementation of CVSS v3.0 and v3.1 scoring based on official specifications
 *
 * CVSS v3.x uses formula-based scoring with the following components:
 * 1. Impact Sub-Score (ISS) based on C/I/A impact
 * 2. Impact Score based on ISS and Scope
 * 3. Exploitability Score based on AV, AC, PR, UI
 * 4. Base Score = min(Impact + Exploitability, 10)
 *
 * Key differences between v3.0 and v3.1:
 * - Roundup function implementation
 * - Modified Impact formula when Scope is Changed
 *
 * @see https://www.first.org/cvss/v3-1/specification-document
 * @see https://www.first.org/cvss/v3-0/specification-document
 */

import type {
    CVSSv3Metrics,
    CVSSv3Score,
    SeverityRating
} from "../types";

/** CVSS version identifier */
export type CVSSv3Version = `3.0` | `3.1`;

/** Named constants to avoid magic numbers */
enum Constants {
    MAX_SCORE = 10,
    MIN_SCORE = 0,
}

/** Score thresholds for severity ratings */
enum SeverityThreshold {
    LOW = 4.0,
    MEDIUM = 7.0,
    HIGH = 9.0,
}

/** Exploitability coefficient */
const EXPLOITABILITY_COEFFICIENT = 8.22;

/** Impact coefficients for Scope Changed */
const IMPACT_COEFFICIENTS = {
    SCOPE_CHANGED_MULTIPLIER: 7.52,
    SCOPE_CHANGED_SUBTRACTOR: 0.029,
    SCOPE_UNCHANGED_MULTIPLIER: 6.42,
} as const;

/** Impact Sub-Score coefficient */
const ISS_COEFFICIENT = 1 - (1 - 0.56) * (1 - 0.56) * (1 - 0.56);

/**
 * Metric weight values for CVSS v3.x
 */
const WEIGHTS = {
    AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
    AC: { L: 0.77, H: 0.44 },
    UI: { N: 0.85, R: 0.62 },
    S:  { U: 0, C: 1 },
    C:  { H: 0.56, L: 0.22, N: 0 },
    I:  { H: 0.56, L: 0.22, N: 0 },
    A:  { H: 0.56, L: 0.22, N: 0 },
    E:  { X: 1, H: 1, F: 0.97, P: 0.94, U: 0.91 },
    RL: { X: 1, U: 1, W: 0.97, T: 0.96, O: 0.95 },
    RC: { X: 1, C: 1, R: 0.96, U: 0.92 },
    CR: { X: 1, H: 1.5, M: 1, L: 0.5 },
    IR: { X: 1, H: 1.5, M: 1, L: 0.5 },
    AR: { X: 1, H: 1.5, M: 1, L: 0.5 },
} as const;

/**
 * Privileges Required weights depend on Scope
 */
const PR_WEIGHTS = {
    unchanged: { N: 0.85, L: 0.62, H: 0.27 },
    changed:   { N: 0.85, L: 0.68, H: 0.5 },
} as const;

/**
 * CVSS v3.0 roundup function - rounds to nearest 0.1
 */
function roundUpV30(value: number): number {
    const roundMultiplier = 10;
    return Math.ceil(value * roundMultiplier) / roundMultiplier;
}

/**
 * CVSS v3.1 roundup function - rounds up to 1 decimal place
 * Implementation follows the specification exactly
 */
function roundUpV31(value: number): number {
    const intInput = Math.round(value * 100000);
    const remainder = intInput % 10000;
    if (remainder === 0) {
        return intInput / 100000;
    }
    return (Math.floor(intInput / 10000) + 1) / 10;
}

/**
 * Get the appropriate roundup function for the version
 */
function getRoundupFunction(version: CVSSv3Version): (value: number) => number {
    if (version === `3.1`) {
        return roundUpV31;
    }
    return roundUpV30;
}

/**
 * Get weight for a metric value
 */
function getWeight<T extends keyof typeof WEIGHTS>(
    metric: T,
    value: string
): number {
    const metricWeights = WEIGHTS[metric];
    return (metricWeights as Record<string, number>)[value] ?? 0;
}

/**
 * Get Privileges Required weight based on Scope
 */
function getPRWeight(pr: string, scope: string): number {
    if (scope === `C`) {
        return (PR_WEIGHTS.changed as Record<string, number>)[pr] ?? 0;
    }
    return (PR_WEIGHTS.unchanged as Record<string, number>)[pr] ?? 0;
}

/**
 * Calculate Impact Sub-Score (ISS)
 * ISS = 1 - (1 - C) × (1 - I) × (1 - A)
 */
function calculateISS(c: number, i: number, a: number): number {
    return 1 - (1 - c) * (1 - i) * (1 - a);
}

/**
 * Calculate Impact Score based on Scope
 *
 * If Scope is Unchanged:
 *   Impact = 6.42 × ISS
 * If Scope is Changed:
 *   Impact = 7.52 × (ISS - 0.029) - 3.25 × (ISS - 0.02)^15
 */
function calculateImpact(iss: number, scopeChanged: boolean, version: CVSSv3Version): number {
    if (!scopeChanged) {
        return IMPACT_COEFFICIENTS.SCOPE_UNCHANGED_MULTIPLIER * iss;
    }

    const offsetValue = 0.029;
    const offsetPower = 0.02;
    const powerMultiplier = 3.25;
    const exponent = 15;

    if (version === `3.1`) {
        return IMPACT_COEFFICIENTS.SCOPE_CHANGED_MULTIPLIER * (iss - offsetValue) -
            powerMultiplier * Math.pow(iss - offsetPower, exponent);
    }

    return IMPACT_COEFFICIENTS.SCOPE_CHANGED_MULTIPLIER * (iss - offsetValue) -
        powerMultiplier * Math.pow(iss * 0.9731 - offsetPower, exponent);
}

/**
 * Calculate Exploitability Score
 * Exploitability = 8.22 × AV × AC × PR × UI
 */
function calculateExploitability(av: number, ac: number, pr: number, ui: number): number {
    return EXPLOITABILITY_COEFFICIENT * av * ac * pr * ui;
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
 * Calculate Base Score
 *
 * If Impact ≤ 0: Base Score = 0
 * If Scope is Unchanged: BaseScore = Roundup(min(Impact + Exploitability, 10))
 * If Scope is Changed: BaseScore = Roundup(min(1.08 × (Impact + Exploitability), 10))
 */
function calculateBaseScore(
    impact: number,
    exploitability: number,
    scopeChanged: boolean,
    roundup: (value: number) => number
): number {
    if (impact <= Constants.MIN_SCORE) {
        return Constants.MIN_SCORE;
    }

    const scopeMultiplier = 1.08;
    let baseScore: number;

    if (scopeChanged) {
        baseScore = scopeMultiplier * (impact + exploitability);
    } else {
        baseScore = impact + exploitability;
    }

    return roundup(Math.min(baseScore, Constants.MAX_SCORE));
}

/**
 * Calculate Temporal Score
 * TemporalScore = Roundup(BaseScore × E × RL × RC)
 */
function calculateTemporalScore(
    baseScore: number,
    e: number,
    rl: number,
    rc: number,
    roundup: (value: number) => number
): number {
    return roundup(baseScore * e * rl * rc);
}

/**
 * Calculate Environmental Score
 * Uses Modified Base metrics with Security Requirements
 */
function calculateEnvironmentalScore(
    metrics: CVSSv3Metrics,
    version: CVSSv3Version,
    roundup: (value: number) => number
): number {
    const mav = metrics.MAV !== `X` ? metrics.MAV : metrics.AV;
    const mac = metrics.MAC !== `X` ? metrics.MAC : metrics.AC;
    const mpr = metrics.MPR !== `X` ? metrics.MPR : metrics.PR;
    const mui = metrics.MUI !== `X` ? metrics.MUI : metrics.UI;
    const ms = metrics.MS !== `X` ? metrics.MS : metrics.S;
    const mc = metrics.MC !== `X` ? metrics.MC : metrics.C;
    const mi = metrics.MI !== `X` ? metrics.MI : metrics.I;
    const ma = metrics.MA !== `X` ? metrics.MA : metrics.A;

    const cr = getWeight(`CR`, metrics.CR);
    const ir = getWeight(`IR`, metrics.IR);
    const ar = getWeight(`AR`, metrics.AR);

    const mcWeight = getWeight(`C`, mc);
    const miWeight = getWeight(`I`, mi);
    const maWeight = getWeight(`A`, ma);

    const miss = Math.min(
        1 - (1 - mcWeight * cr) * (1 - miWeight * ir) * (1 - maWeight * ar),
        0.915
    );

    const scopeChanged = ms === `C`;
    let modifiedImpact: number;

    if (!scopeChanged) {
        modifiedImpact = IMPACT_COEFFICIENTS.SCOPE_UNCHANGED_MULTIPLIER * miss;
    } else {
        const offsetValue = 0.029;
        const offsetPower = 0.02;
        const powerMultiplier = 3.25;
        const exponent = 15;

        if (version === `3.1`) {
            modifiedImpact = IMPACT_COEFFICIENTS.SCOPE_CHANGED_MULTIPLIER * (miss - offsetValue) -
                powerMultiplier * Math.pow(miss - offsetPower, exponent);
        } else {
            modifiedImpact = IMPACT_COEFFICIENTS.SCOPE_CHANGED_MULTIPLIER * (miss - offsetValue) -
                powerMultiplier * Math.pow(miss * 0.9731 - offsetPower, exponent);
        }
    }

    const mavWeight = getWeight(`AV`, mav);
    const macWeight = getWeight(`AC`, mac);
    const mprWeight = getPRWeight(mpr, ms);
    const muiWeight = getWeight(`UI`, mui);

    const modifiedExploitability = EXPLOITABILITY_COEFFICIENT * mavWeight * macWeight * mprWeight * muiWeight;

    if (modifiedImpact <= Constants.MIN_SCORE) {
        return Constants.MIN_SCORE;
    }

    const e = getWeight(`E`, metrics.E);
    const rl = getWeight(`RL`, metrics.RL);
    const rc = getWeight(`RC`, metrics.RC);

    const scopeMultiplier = 1.08;
    let envScore: number;

    if (scopeChanged) {
        envScore = scopeMultiplier * (modifiedImpact + modifiedExploitability);
    } else {
        envScore = modifiedImpact + modifiedExploitability;
    }

    return roundup(roundup(Math.min(envScore, Constants.MAX_SCORE)) * e * rl * rc);
}

/**
 * Generate CVSS v3.x vector string from metrics
 */
export function generateVector(metrics: CVSSv3Metrics, version: CVSSv3Version): string {
    const parts: string[] = [`CVSS:${version}`];

    parts.push(`AV:${metrics.AV}`);
    parts.push(`AC:${metrics.AC}`);
    parts.push(`PR:${metrics.PR}`);
    parts.push(`UI:${metrics.UI}`);
    parts.push(`S:${metrics.S}`);
    parts.push(`C:${metrics.C}`);
    parts.push(`I:${metrics.I}`);
    parts.push(`A:${metrics.A}`);

    if (metrics.E !== `X`) {
        parts.push(`E:${metrics.E}`);
    }
    if (metrics.RL !== `X`) {
        parts.push(`RL:${metrics.RL}`);
    }
    if (metrics.RC !== `X`) {
        parts.push(`RC:${metrics.RC}`);
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
    if (metrics.MPR !== `X`) {
        parts.push(`MPR:${metrics.MPR}`);
    }
    if (metrics.MUI !== `X`) {
        parts.push(`MUI:${metrics.MUI}`);
    }
    if (metrics.MS !== `X`) {
        parts.push(`MS:${metrics.MS}`);
    }
    if (metrics.MC !== `X`) {
        parts.push(`MC:${metrics.MC}`);
    }
    if (metrics.MI !== `X`) {
        parts.push(`MI:${metrics.MI}`);
    }
    if (metrics.MA !== `X`) {
        parts.push(`MA:${metrics.MA}`);
    }

    return parts.join(`/`);
}

/**
 * Parse a CVSS v3.x vector string into metrics object
 */
export function parseVector(vector: string): { metrics: CVSSv3Metrics; version: CVSSv3Version } {
    const metrics: CVSSv3Metrics = {
        AV:  `N`,
        AC:  `L`,
        PR:  `N`,
        UI:  `N`,
        S:   `U`,
        C:   `N`,
        I:   `N`,
        A:   `N`,
        E:   `X`,
        RL:  `X`,
        RC:  `X`,
        CR:  `X`,
        IR:  `X`,
        AR:  `X`,
        MAV: `X`,
        MAC: `X`,
        MPR: `X`,
        MUI: `X`,
        MS:  `X`,
        MC:  `X`,
        MI:  `X`,
        MA:  `X`,
    };

    const parts = vector.split(`/`);
    const versionPart = parts[0];

    let version: CVSSv3Version;
    if (versionPart === `CVSS:3.1`) {
        version = `3.1`;
    } else if (versionPart === `CVSS:3.0`) {
        version = `3.0`;
    } else {
        throw new Error(`Invalid CVSS v3.x vector: must start with CVSS:3.0 or CVSS:3.1`);
    }

    for (let i = 1; i < parts.length; i++) {
        const [key, value] = parts[i].split(`:`);
        if (key && value && key in metrics) {
            (metrics as unknown as Record<string, string>)[key] = value;
        }
    }

    return { metrics, version };
}

/**
 * Create default CVSS v3.x metrics object
 */
export function createDefaultMetrics(): CVSSv3Metrics {
    return {
        AV:  `N`,
        AC:  `L`,
        PR:  `N`,
        UI:  `N`,
        S:   `U`,
        C:   `H`,
        I:   `H`,
        A:   `H`,
        E:   `X`,
        RL:  `X`,
        RC:  `X`,
        CR:  `X`,
        IR:  `X`,
        AR:  `X`,
        MAV: `X`,
        MAC: `X`,
        MPR: `X`,
        MUI: `X`,
        MS:  `X`,
        MC:  `X`,
        MI:  `X`,
        MA:  `X`,
    };
}

/**
 * Calculate the CVSS v3.x score for given metrics
 */
export function calculateCVSSv3Score(metrics: CVSSv3Metrics, version: CVSSv3Version = `3.1`): CVSSv3Score {
    const roundup = getRoundupFunction(version);
    const scopeChanged = metrics.S === `C`;

    const avWeight = getWeight(`AV`, metrics.AV);
    const acWeight = getWeight(`AC`, metrics.AC);
    const prWeight = getPRWeight(metrics.PR, metrics.S);
    const uiWeight = getWeight(`UI`, metrics.UI);

    const cWeight = getWeight(`C`, metrics.C);
    const iWeight = getWeight(`I`, metrics.I);
    const aWeight = getWeight(`A`, metrics.A);

    const iss = calculateISS(cWeight, iWeight, aWeight);
    const impact = calculateImpact(iss, scopeChanged, version);
    const exploitability = calculateExploitability(avWeight, acWeight, prWeight, uiWeight);
    const baseScore = calculateBaseScore(impact, exploitability, scopeChanged, roundup);

    const hasTemporal = metrics.E !== `X` || metrics.RL !== `X` || metrics.RC !== `X`;
    let temporalScore: number | undefined;

    if (hasTemporal) {
        const e = getWeight(`E`, metrics.E);
        const rl = getWeight(`RL`, metrics.RL);
        const rc = getWeight(`RC`, metrics.RC);
        temporalScore = calculateTemporalScore(baseScore, e, rl, rc, roundup);
    }

    const hasEnvironmental = metrics.CR !== `X` || metrics.IR !== `X` || metrics.AR !== `X` ||
        metrics.MAV !== `X` || metrics.MAC !== `X` || metrics.MPR !== `X` ||
        metrics.MUI !== `X` || metrics.MS !== `X` || metrics.MC !== `X` ||
        metrics.MI !== `X` || metrics.MA !== `X`;

    let environmentalScore: number | undefined;
    if (hasEnvironmental) {
        environmentalScore = calculateEnvironmentalScore(metrics, version, roundup);
    }

    const finalScore = environmentalScore ?? temporalScore ?? baseScore;

    return {
        score:               finalScore,
        severity:            getSeverityRating(finalScore),
        vector:              generateVector(metrics, version),
        baseScore,
        temporalScore,
        environmentalScore,
        impactScore:         impact,
        exploitabilityScore: exploitability,
        version,
    };
}
