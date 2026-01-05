/**
 * CVSS Vector String Parser
 *
 * Parses CVSS vector strings and extracts metrics for all CVSS versions
 */

import type {
    CVSSv2Metrics,
    CVSSv3Metrics,
    CVSSv4Metrics
} from "./types";

export interface ParsedVector {
    version: `2.0` | `3.0` | `3.1` | `4.0`
    metrics: CVSSv2Metrics | CVSSv3Metrics | CVSSv4Metrics
}

/**
 * Detect CVSS version from vector string
 */
export function detectVersion(vector: string): `2.0` | `3.0` | `3.1` | `4.0` | null {
    if (vector.startsWith(`CVSS:4.0/`)) {
        return `4.0`;
    }
    if (vector.startsWith(`CVSS:3.1/`)) {
        return `3.1`;
    }
    if (vector.startsWith(`CVSS:3.0/`)) {
        return `3.0`;
    }
    if (vector.includes(`AV:`) && vector.includes(`AC:`)) {
        return `2.0`;
    }
    return null;
}

/**
 * Parse CVSS v4.0 vector string
 */
export function parseCVSSv4Vector(vector: string): CVSSv4Metrics {
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

    // Remove prefix if present
    const vectorStr = vector.replace(`CVSS:4.0/`, ``);
    const parts = vectorStr.split(`/`);

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
 * Parse CVSS v3.x vector string
 */
export function parseCVSSv3Vector(vector: string): CVSSv3Metrics {
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

    // Remove prefix if present
    const vectorStr = vector.replace(/CVSS:3\.[01]\//, ``);
    const parts = vectorStr.split(`/`);

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
 * Parse CVSS v2.0 vector string
 */
export function parseCVSSv2Vector(vector: string): CVSSv2Metrics {
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

    const parts = vector.split(`/`);

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
 * Parse any CVSS vector string
 */
export function parseVector(vector: string): ParsedVector | null {
    const version = detectVersion(vector);

    if (!version) {
        return null;
    }

    let metrics: CVSSv2Metrics | CVSSv3Metrics | CVSSv4Metrics;

    switch (version) {
        case `4.0`:
            metrics = parseCVSSv4Vector(vector);
            break;
        case `3.1`:
        case `3.0`:
            metrics = parseCVSSv3Vector(vector);
            break;
        case `2.0`:
            metrics = parseCVSSv2Vector(vector);
            break;
    }

    return {
        version,
        metrics,
    };
}

/**
 * Get vector string from URL parameters
 */
export function getVectorFromURL(): ParsedVector | null {
    if (typeof window === `undefined`) {
        return null;
    }

    const params = new URLSearchParams(window.location.search);
    const vector = params.get(`vector`);

    if (!vector) {
        return null;
    }

    return parseVector(decodeURIComponent(vector));
}

/**
 * Create shareable URL with vector string
 */
export function createShareableURL(vector: string): string {
    if (typeof window === `undefined`) {
        return ``;
    }

    const url = new URL(window.location.href);
    url.searchParams.set(`vector`, encodeURIComponent(vector));

    return url.toString();
}
