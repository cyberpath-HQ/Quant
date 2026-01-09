/**
 * @fileoverview CVSS v2.0 Scoring Engine
 * @description Complete implementation of CVSS v2.0 scoring based on official specification
 *
 * CVSS v2.0 uses formula-based scoring with the following components:
 * 1. Impact = 10.41 × (1 - (1 - C) × (1 - I) × (1 - A))
 * 2. Exploitability = 20 × AV × AC × Au
 * 3. f(Impact) = 0 if Impact = 0, else 1.176
 * 4. Base Score = Roundup(((0.6 × Impact) + (0.4 × Exploitability) - 1.5) × f(Impact))
 *
 * @see https://www.first.org/cvss/v2/guide
 */

import type {
    CVSSv2Metrics,
    CVSSv2Score,
    SeverityRating
} from "../types";

/** Named constants */
enum Constants {
    MAX_SCORE = 10,
    MIN_SCORE = 0
}

/** Severity thresholds for v2.0 (different from v3.x) */
enum SeverityThreshold {
    LOW = 4.0,
    MEDIUM = 7.0
}

/** Impact coefficient */
const IMPACT_COEFFICIENT = 10.41;

/** Exploitability coefficient */
const EXPLOITABILITY_COEFFICIENT = 20;

/** f(Impact) value when Impact > 0 */
const F_IMPACT_VALUE = 1.176;

/** Base Score coefficients */
const BASE_COEFFICIENTS = {
    IMPACT:         0.6,
    EXPLOITABILITY: 0.4,
    SUBTRACTOR:     1.5,
} as const;

/**
 * Metric weight values for CVSS v2.0
 */
const WEIGHTS = {
    AV:  {
        L: 0.395,
        A: 0.646,
        N: 1.0,
    },
    AC:  {
        H: 0.35,
        M: 0.61,
        L: 0.71,
    },
    Au:  {
        M: 0.45,
        S: 0.56,
        N: 0.704,
    },
    C:   {
        N: 0,
        P: 0.275,
        C: 0.66,
    },
    I:   {
        N: 0,
        P: 0.275,
        C: 0.66,
    },
    A:   {
        N: 0,
        P: 0.275,
        C: 0.66,
    },
    E:   {
        ND:  1.0,
        U:   0.85,
        POC: 0.9,
        F:   0.95,
        H:   1.0,
    },
    RL:  {
        ND: 1.0,
        OF: 0.87,
        TF: 0.9,
        W:  0.95,
        U:  1.0,
    },
    RC:  {
        ND: 1.0,
        UC: 0.9,
        UR: 0.95,
        C:  1.0,
    },
    CDP: {
        ND: 0,
        N:  0,
        L:  0.1,
        LM: 0.3,
        MH: 0.4,
        H:  0.5,
    },
    TD:  {
        ND: 1,
        N:  0,
        L:  0.25,
        M:  0.75,
        H:  1.0,
    },
    CR:  {
        ND: 1,
        L:  0.5,
        M:  1.0,
        H:  1.51,
    },
    IR:  {
        ND: 1,
        L:  0.5,
        M:  1.0,
        H:  1.51,
    },
    AR:  {
        ND: 1,
        L:  0.5,
        M:  1.0,
        H:  1.51,
    },
} as const;

/**
 * Roundup function for CVSS v2.0
 */
function roundup(value: number): number {
    const roundMultiplier = 10;
    return Math.round(value * roundMultiplier) / roundMultiplier;
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
 * Calculate Impact
 * Impact = 10.41 × (1 - (1 - C) × (1 - I) × (1 - A))
 */
function calculateImpact(c: number, i: number, a: number): number {
    return IMPACT_COEFFICIENT * (1 - (1 - c) * (1 - i) * (1 - a));
}

/**
 * Calculate Exploitability
 * Exploitability = 20 × AV × AC × Au
 */
function calculateExploitability(av: number, ac: number, au: number): number {
    return EXPLOITABILITY_COEFFICIENT * av * ac * au;
}

/**
 * f(Impact) function
 * Returns 0 if Impact = 0, else 1.176
 */
function fImpact(impact: number): number {
    if (impact === Constants.MIN_SCORE) {
        return Constants.MIN_SCORE;
    }
    return F_IMPACT_VALUE;
}

/**
 * Calculate Base Score
 * BaseScore = Roundup(((0.6 × Impact) + (0.4 × Exploitability) - 1.5) × f(Impact))
 */
function calculateBaseScore(impact: number, exploitability: number): number {
    const fI = fImpact(impact);
    const score = (
        (BASE_COEFFICIENTS.IMPACT * impact) +
        (BASE_COEFFICIENTS.EXPLOITABILITY * exploitability) -
        BASE_COEFFICIENTS.SUBTRACTOR
    ) * fI;
    return roundup(Math.max(Constants.MIN_SCORE, score));
}

/**
 * Calculate Temporal Score
 * TemporalScore = Roundup(BaseScore × E × RL × RC)
 */
function calculateTemporalScore(baseScore: number, e: number, rl: number, rc: number): number {
    return roundup(baseScore * e * rl * rc);
}

/**
 * Calculate Environmental Score
 * Uses Adjusted Base metrics with Security Requirements
 */
function calculateEnvironmentalScore(
    metrics: CVSSv2Metrics,
    baseScore: number
): number {
    const cr = getWeight(`CR`, metrics.CR);
    const ir = getWeight(`IR`, metrics.IR);
    const ar = getWeight(`AR`, metrics.AR);

    const c = getWeight(`C`, metrics.C);
    const i = getWeight(`I`, metrics.I);
    const a = getWeight(`A`, metrics.A);

    const adjustedImpact = Math.min(
        IMPACT_COEFFICIENT,
        IMPACT_COEFFICIENT * (1 - (1 - c * cr) * (1 - i * ir) * (1 - a * ar))
    );

    const av = getWeight(`AV`, metrics.AV);
    const ac = getWeight(`AC`, metrics.AC);
    const au = getWeight(`Au`, metrics.Au);
    const exploitability = calculateExploitability(av, ac, au);

    const fI = fImpact(adjustedImpact);
    const adjustedBase = (
        (BASE_COEFFICIENTS.IMPACT * adjustedImpact) +
        (BASE_COEFFICIENTS.EXPLOITABILITY * exploitability) -
        BASE_COEFFICIENTS.SUBTRACTOR
    ) * fI;

    const e = getWeight(`E`, metrics.E);
    const rl = getWeight(`RL`, metrics.RL);
    const rc = getWeight(`RC`, metrics.RC);

    const adjustedTemporal = roundup(adjustedBase * e * rl * rc);

    const cdp = getWeight(`CDP`, metrics.CDP);
    const td = getWeight(`TD`, metrics.TD);

    const envScore = roundup((adjustedTemporal + (Constants.MAX_SCORE - adjustedTemporal) * cdp) * td);

    return Math.max(Constants.MIN_SCORE, envScore);
}

/**
 * Convert numeric score to severity rating (CVSS v2.0 uses different thresholds)
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
    return `High`;
}

/**
 * Generate CVSS v2.0 vector string from metrics
 */
export function generateVector(metrics: CVSSv2Metrics): string {
    const parts: Array<string> = [ `CVSS:2.0` ];

    parts.push(`AV:${ metrics.AV }`);
    parts.push(`AC:${ metrics.AC }`);
    parts.push(`Au:${ metrics.Au }`);
    parts.push(`C:${ metrics.C }`);
    parts.push(`I:${ metrics.I }`);
    parts.push(`A:${ metrics.A }`);

    if (metrics.E !== `ND`) {
        parts.push(`E:${ metrics.E }`);
    }
    if (metrics.RL !== `ND`) {
        parts.push(`RL:${ metrics.RL }`);
    }
    if (metrics.RC !== `ND`) {
        parts.push(`RC:${ metrics.RC }`);
    }

    if (metrics.CDP !== `ND`) {
        parts.push(`CDP:${ metrics.CDP }`);
    }
    if (metrics.TD !== `ND`) {
        parts.push(`TD:${ metrics.TD }`);
    }
    if (metrics.CR !== `ND`) {
        parts.push(`CR:${ metrics.CR }`);
    }
    if (metrics.IR !== `ND`) {
        parts.push(`IR:${ metrics.IR }`);
    }
    if (metrics.AR !== `ND`) {
        parts.push(`AR:${ metrics.AR }`);
    }

    return parts.join(`/`);
}

/**
 * Parse a CVSS v2.0 vector string into metrics object
 */
export function parseVector(vector: string): CVSSv2Metrics {
    const metrics: CVSSv2Metrics = {
        AV:  `N`,
        AC:  `L`,
        Au:  `N`,
        C:   `N`,
        I:   `N`,
        A:   `N`,
        E:   `ND`,
        RL:  `ND`,
        RC:  `ND`,
        CDP: `ND`,
        TD:  `ND`,
        CR:  `ND`,
        IR:  `ND`,
        AR:  `ND`,
    };

    const cleanVector = vector.replace(/^\(|\)$/g, ``);
    const parts = cleanVector.split(`/`);

    for (const part of parts) {
        const [
            key,
            value,
        ] = part.split(`:`);
        if (key && value && key in metrics) {
            (metrics as unknown as Record<string, string>)[key] = value;
        }
    }

    return metrics;
}

/**
 * Create default CVSS v2.0 metrics object with least impact values
 */
export function createDefaultMetrics(): CVSSv2Metrics {
    return {
        // Base Metrics - least impact values
        AV: `L`, // Local (hardest to exploit)
        AC: `H`, // High (most complex)
        Au: `M`, // Multiple (most authentication required)
        C:  `N`, // None (no confidentiality impact)
        I:  `N`, // None (no integrity impact)
        A:  `N`, // None (no availability impact)

        // Temporal Metrics - not defined
        E:  `ND`,
        RL: `ND`,
        RC: `ND`,

        // Environmental Metrics - not defined
        CDP: `ND`,
        TD:  `ND`,
        CR:  `ND`,
        IR:  `ND`,
        AR:  `ND`,
    };
}

/**
 * Calculate the CVSS v2.0 score for given metrics
 */
export function calculateCVSSv2Score(metrics: CVSSv2Metrics): CVSSv2Score {
    const av = getWeight(`AV`, metrics.AV);
    const ac = getWeight(`AC`, metrics.AC);
    const au = getWeight(`Au`, metrics.Au);

    const c = getWeight(`C`, metrics.C);
    const i = getWeight(`I`, metrics.I);
    const a = getWeight(`A`, metrics.A);

    const impact = calculateImpact(c, i, a);
    const exploitability = calculateExploitability(av, ac, au);
    const baseScore = calculateBaseScore(impact, exploitability);

    const hasTemporal = metrics.E !== `ND` || metrics.RL !== `ND` || metrics.RC !== `ND`;
    let temporalScore: number | undefined;

    if (hasTemporal) {
        const e = getWeight(`E`, metrics.E);
        const rl = getWeight(`RL`, metrics.RL);
        const rc = getWeight(`RC`, metrics.RC);
        temporalScore = calculateTemporalScore(baseScore, e, rl, rc);
    }

    const hasEnvironmental = metrics.CDP !== `ND` || metrics.TD !== `ND` ||
        metrics.CR !== `ND` || metrics.IR !== `ND` || metrics.AR !== `ND`;

    let environmentalScore: number | undefined;
    if (hasEnvironmental) {
        environmentalScore = calculateEnvironmentalScore(metrics, baseScore);
    }

    const finalScore = environmentalScore ?? temporalScore ?? baseScore;

    return {
        score:               finalScore,
        severity:            getSeverityRating(finalScore),
        vector:              generateVector(metrics),
        baseScore,
        temporalScore,
        environmentalScore,
        impactScore:         impact,
        exploitabilityScore: exploitability,
        version:             `2.0`,
    };
}

/**
 * Calculate the score impact of selecting a specific metric option
 * This enables showing users how each option affects the final score
 *
 * @param metrics Current metrics configuration
 * @param metricKey The metric to analyze
 * @param optionValue The option value to test
 * @returns The impact on score (positive means increases score, negative means decreases)
 */
export function calculateOptionImpact(
    metrics: CVSSv2Metrics,
    metricKey: keyof CVSSv2Metrics,
    optionValue: string
): number {
    const currentScore = calculateCVSSv2Score(metrics).score;

    // Create a copy with this specific option selected
    const testMetrics = {
        ...metrics,
        [metricKey]: optionValue,
    };

    const testScore = calculateCVSSv2Score(testMetrics).score;

    // Return the delta: positive means selecting this option increases score
    return testScore - currentScore;
}

// Default metrics for initialization with least impact on score
export const DEFAULT_METRICS: CVSSv2Metrics = {
    // Base Metrics - least impact values
    AV: `L`,
    AC: `H`,
    Au: `M`,
    C:  `N`,
    I:  `N`,
    A:  `N`,

    // Temporal Metrics - not defined
    E:  `ND`,
    RL: `ND`,
    RC: `ND`,

    // Environmental Metrics - not defined
    CDP: `ND`,
    TD:  `ND`,
    CR:  `ND`,
    IR:  `ND`,
    AR:  `ND`,
};
