/**
 * @fileoverview CVSS Type Definitions
 * @description Comprehensive TypeScript type definitions for all CVSS versions (4.0, 3.1, 3.0, 2.0)
 *
 * This module provides type-safe definitions for:
 * - Metric values and their valid options
 * - Vector string formats
 * - Score results and severity ratings
 * - Calculator state management
 *
 * @see https://www.first.org/cvss/v4-0/specification-document
 * @see https://www.first.org/cvss/v3-1/specification-document
 * @see https://www.first.org/cvss/v3-0/specification-document
 * @see https://www.first.org/cvss/v2/guide
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

/**
 * Qualitative severity rating based on CVSS score
 * Applies to all CVSS versions
 */
export type SeverityRating = `None` | `Low` | `Medium` | `High` | `Critical`;

/**
 * Score result with numeric value and severity rating
 */
export interface ScoreResult {
    /** Numeric score from 0.0 to 10.0 */
    score:    number

    /** Qualitative severity rating */
    severity: SeverityRating

    /** Vector string representation */
    vector:   string
}

/**
 * Detailed score breakdown showing all component scores
 */
export interface DetailedScore extends ScoreResult {
    /** Base score (always present) */
    baseScore:            number

    /** Temporal score (if temporal metrics are set) */
    temporalScore?:       number

    /** Environmental score (if environmental metrics are set) */
    environmentalScore?:  number

    /** Impact sub-score */
    impactScore?:         number

    /** Exploitability sub-score */
    exploitabilityScore?: number
}

/**
 * Metric definition with value options and descriptions
 */
export interface MetricDefinition {
    /** Full metric name */
    name:        string

    /** Short abbreviation used in vector strings */
    short:       string

    /** Description of what this metric measures */
    description: string

    /** Available value options */
    options:     Array<MetricOption>

    /** Currently selected value */
    selected:    string

    /** Whether this metric is required (Base) or optional (Temporal/Environmental) */
    required:    boolean

    /** Metric group (Base, Temporal, Environmental, Supplemental) */
    group:       MetricGroup
}

/**
 * Individual metric value option
 */
export interface MetricOption {
    /** Display name (e.g., "Network (N)") */
    name:        string

    /** Short value for vector string (e.g., "N") */
    value:       string

    /** Description of what this value means */
    description: string

    /** Numeric weight used in scoring (for formula-based versions) */
    weight?:     number
}

/**
 * Metric group categories
 */
export type MetricGroup =
  | `Base`
  | `Temporal`
  | `Environmental`
  | `Supplemental`
  | `Threat`;

// =============================================================================
// CVSS v4.0 TYPES
// =============================================================================

/**
 * CVSS v4.0 Attack Vector metric values
 * Reflects how the vulnerability can be exploited
 */
export type CVSSv4AttackVector = `N` | `A` | `L` | `P`;

/**
 * CVSS v4.0 Attack Complexity metric values
 * Describes conditions beyond attacker's control needed for exploitation
 */
export type CVSSv4AttackComplexity = `L` | `H`;

/**
 * CVSS v4.0 Attack Requirements metric values
 * Captures prerequisite deployment and execution conditions
 */
export type CVSSv4AttackRequirements = `N` | `P`;

/**
 * CVSS v4.0 Privileges Required metric values
 * Level of privileges needed before exploitation
 */
export type CVSSv4PrivilegesRequired = `N` | `L` | `H`;

/**
 * CVSS v4.0 User Interaction metric values
 * Whether user participation is required
 */
export type CVSSv4UserInteraction = `N` | `P` | `A`;

/**
 * CVSS v4.0 Impact metric values (Confidentiality, Integrity, Availability)
 * For both Vulnerable System and Subsequent System
 */
export type CVSSv4ImpactValue = `H` | `L` | `N`;

/**
 * CVSS v4.0 Modified Subsequent System Impact with Safety option
 */
export type CVSSv4ModifiedSSImpact = `X` | `S` | `H` | `L` | `N`;

/**
 * CVSS v4.0 Exploit Maturity (Threat metric)
 */
export type CVSSv4ExploitMaturity = `X` | `A` | `P` | `U`;

/**
 * CVSS v4.0 Security Requirements
 */
export type CVSSv4SecurityRequirement = `X` | `H` | `M` | `L`;

/**
 * CVSS v4.0 Supplemental Safety metric
 */
export type CVSSv4Safety = `X` | `P` | `N`;

/**
 * CVSS v4.0 Automatable metric
 */
export type CVSSv4Automatable = `X` | `N` | `Y`;

/**
 * CVSS v4.0 Recovery metric
 */
export type CVSSv4Recovery = `X` | `A` | `U` | `I`;

/**
 * CVSS v4.0 Value Density metric
 */
export type CVSSv4ValueDensity = `X` | `D` | `C`;

/**
 * CVSS v4.0 Vulnerability Response Effort metric
 */
export type CVSSv4ResponseEffort = `X` | `L` | `M` | `H`;

/**
 * CVSS v4.0 Provider Urgency metric
 */
export type CVSSv4ProviderUrgency = `X` | `Clear` | `Green` | `Amber` | `Red`;

/**
 * Not Defined wrapper for optional metrics
 */
export type NotDefined = `X`;

/**
 * CVSS v4.0 complete metrics object
 * All base metrics are required, others default to 'X' (Not Defined)
 */
export interface CVSSv4Metrics {
    // Base Metrics - Exploitability (Required)
    AV: CVSSv4AttackVector
    AC: CVSSv4AttackComplexity
    AT: CVSSv4AttackRequirements
    PR: CVSSv4PrivilegesRequired
    UI: CVSSv4UserInteraction

    // Base Metrics - Vulnerable System Impact (Required)
    VC: CVSSv4ImpactValue
    VI: CVSSv4ImpactValue
    VA: CVSSv4ImpactValue

    // Base Metrics - Subsequent System Impact (Required)
    SC: CVSSv4ImpactValue
    SI: CVSSv4ImpactValue
    SA: CVSSv4ImpactValue

    // Threat Metrics (Optional)
    E: CVSSv4ExploitMaturity

    // Environmental Metrics - Modified Base (Optional)
    MAV: CVSSv4AttackVector | NotDefined
    MAC: CVSSv4AttackComplexity | NotDefined
    MAT: CVSSv4AttackRequirements | NotDefined
    MPR: CVSSv4PrivilegesRequired | NotDefined
    MUI: CVSSv4UserInteraction | NotDefined
    MVC: CVSSv4ImpactValue | NotDefined
    MVI: CVSSv4ImpactValue | NotDefined
    MVA: CVSSv4ImpactValue | NotDefined
    MSC: CVSSv4ImpactValue | NotDefined
    MSI: CVSSv4ModifiedSSImpact
    MSA: CVSSv4ModifiedSSImpact

    // Environmental Metrics - Security Requirements (Optional)
    CR: CVSSv4SecurityRequirement
    IR: CVSSv4SecurityRequirement
    AR: CVSSv4SecurityRequirement

    // Supplemental Metrics (Optional, do not affect score)
    S:  CVSSv4Safety
    AU: CVSSv4Automatable
    R:  CVSSv4Recovery
    V:  CVSSv4ValueDensity
    RE: CVSSv4ResponseEffort
    U:  CVSSv4ProviderUrgency
}

/**
 * CVSS v4.0 MacroVector representation
 * 6-digit string representing the equivalence class
 */
export type CVSSv4MacroVector = string;

/**
 * CVSS v4.0 score nomenclature
 * Indicates which metric groups were used in scoring
 */
export type CVSSv4Nomenclature = `CVSS-B` | `CVSS-BE` | `CVSS-BT` | `CVSS-BTE`;

/**
 * CVSS v4.0 detailed score result
 */
export interface CVSSv4Score extends DetailedScore {
    /** MacroVector used for scoring */
    macroVector:  CVSSv4MacroVector

    /** Score nomenclature */
    nomenclature: CVSSv4Nomenclature

    /** CVSS version identifier */
    version:      `4.0`
}

// =============================================================================
// CVSS v3.1 / v3.0 TYPES
// =============================================================================

/**
 * CVSS v3.x Attack Vector metric values
 */
export type CVSSv3AttackVector = `N` | `A` | `L` | `P`;

/**
 * CVSS v3.x Attack Complexity metric values
 */
export type CVSSv3AttackComplexity = `L` | `H`;

/**
 * CVSS v3.x Privileges Required metric values
 */
export type CVSSv3PrivilegesRequired = `N` | `L` | `H`;

/**
 * CVSS v3.x User Interaction metric values
 */
export type CVSSv3UserInteraction = `N` | `R`;

/**
 * CVSS v3.x Scope metric values
 * Indicates if exploitation can affect resources beyond the vulnerable component
 */
export type CVSSv3Scope = `U` | `C`;

/**
 * CVSS v3.x Impact metric values (Confidentiality, Integrity, Availability)
 */
export type CVSSv3ImpactValue = `H` | `L` | `N`;

/**
 * CVSS v3.x Exploit Code Maturity values
 */
export type CVSSv3ExploitMaturity = `X` | `H` | `F` | `P` | `U`;

/**
 * CVSS v3.x Remediation Level values
 */
export type CVSSv3RemediationLevel = `X` | `U` | `W` | `T` | `O`;

/**
 * CVSS v3.x Report Confidence values
 */
export type CVSSv3ReportConfidence = `X` | `C` | `R` | `U`;

/**
 * CVSS v3.x Security Requirements
 */
export type CVSSv3SecurityRequirement = `X` | `H` | `M` | `L`;

/**
 * CVSS v3.x complete metrics object
 */
export interface CVSSv3Metrics {
    // Base Metrics (Required)
    AV: CVSSv3AttackVector
    AC: CVSSv3AttackComplexity
    PR: CVSSv3PrivilegesRequired
    UI: CVSSv3UserInteraction
    S:  CVSSv3Scope
    C:  CVSSv3ImpactValue
    I:  CVSSv3ImpactValue
    A:  CVSSv3ImpactValue

    // Temporal Metrics (Optional)
    E:  CVSSv3ExploitMaturity
    RL: CVSSv3RemediationLevel
    RC: CVSSv3ReportConfidence

    // Environmental Metrics - Security Requirements (Optional)
    CR: CVSSv3SecurityRequirement
    IR: CVSSv3SecurityRequirement
    AR: CVSSv3SecurityRequirement

    // Environmental Metrics - Modified Base (Optional)
    MAV: CVSSv3AttackVector | NotDefined
    MAC: CVSSv3AttackComplexity | NotDefined
    MPR: CVSSv3PrivilegesRequired | NotDefined
    MUI: CVSSv3UserInteraction | NotDefined
    MS:  CVSSv3Scope | NotDefined
    MC:  CVSSv3ImpactValue | NotDefined
    MI:  CVSSv3ImpactValue | NotDefined
    MA:  CVSSv3ImpactValue | NotDefined
}

/**
 * CVSS v3.x detailed score result
 */
export interface CVSSv3Score extends DetailedScore {
    /** CVSS version identifier */
    version:                      `3.1` | `3.0`

    /** Modified Impact Sub-Score (for environmental) */
    modifiedImpactScore?:         number

    /** Modified Exploitability Sub-Score (for environmental) */
    modifiedExploitabilityScore?: number
}

// =============================================================================
// CVSS v2.0 TYPES
// =============================================================================

/**
 * CVSS v2.0 Access Vector metric values
 */
export type CVSSv2AccessVector = `L` | `A` | `N`;

/**
 * CVSS v2.0 Access Complexity metric values
 */
export type CVSSv2AccessComplexity = `H` | `M` | `L`;

/**
 * CVSS v2.0 Authentication metric values
 */
export type CVSSv2Authentication = `M` | `S` | `N`;

/**
 * CVSS v2.0 Impact metric values (Confidentiality, Integrity, Availability)
 */
export type CVSSv2ImpactValue = `N` | `P` | `C`;

/**
 * CVSS v2.0 Exploitability metric values
 */
export type CVSSv2Exploitability = `U` | `POC` | `F` | `H` | `ND`;

/**
 * CVSS v2.0 Remediation Level values
 */
export type CVSSv2RemediationLevel = `OF` | `TF` | `W` | `U` | `ND`;

/**
 * CVSS v2.0 Report Confidence values
 */
export type CVSSv2ReportConfidence = `UC` | `UR` | `C` | `ND`;

/**
 * CVSS v2.0 Collateral Damage Potential values
 */
export type CVSSv2CollateralDamage = `N` | `L` | `LM` | `MH` | `H` | `ND`;

/**
 * CVSS v2.0 Target Distribution values
 */
export type CVSSv2TargetDistribution = `N` | `L` | `M` | `H` | `ND`;

/**
 * CVSS v2.0 Security Requirements
 */
export type CVSSv2SecurityRequirement = `L` | `M` | `H` | `ND`;

/**
 * CVSS v2.0 complete metrics object
 */
export interface CVSSv2Metrics {
    // Base Metrics (Required)
    AV: CVSSv2AccessVector
    AC: CVSSv2AccessComplexity
    Au: CVSSv2Authentication
    C:  CVSSv2ImpactValue
    I:  CVSSv2ImpactValue
    A:  CVSSv2ImpactValue

    // Temporal Metrics (Optional)
    E:  CVSSv2Exploitability
    RL: CVSSv2RemediationLevel
    RC: CVSSv2ReportConfidence

    // Environmental Metrics (Optional)
    CDP: CVSSv2CollateralDamage
    TD:  CVSSv2TargetDistribution
    CR:  CVSSv2SecurityRequirement
    IR:  CVSSv2SecurityRequirement
    AR:  CVSSv2SecurityRequirement
}

/**
 * CVSS v2.0 detailed score result
 */
export interface CVSSv2Score extends DetailedScore {
    /** CVSS version identifier */
    version:                `2.0`

    /** Adjusted Impact for environmental scoring */
    adjustedImpactScore?:   number

    /** Adjusted Temporal for environmental scoring */
    adjustedTemporalScore?: number
}

// =============================================================================
// CALCULATOR STATE TYPES
// =============================================================================

/**
 * Available CVSS versions
 */
export type CVSSVersion = `4.0` | `3.1` | `3.0` | `2.0`;

/**
 * Union type for all CVSS metrics
 */
export type CVSSMetrics = CVSSv4Metrics | CVSSv3Metrics | CVSSv2Metrics;

/**
 * Union type for all CVSS scores
 */
export type CVSSScore = CVSSv4Score | CVSSv3Score | CVSSv2Score;

/**
 * Calculator state for managing CVSS scoring
 */
export interface CalculatorState<T extends CVSSMetrics> {
    /** Current CVSS version */
    version: CVSSVersion

    /** Current metric values */
    metrics: T

    /** Calculated score result */
    score:   CVSSScore | null

    /** Whether calculation is valid */
    isValid: boolean

    /** Error message if invalid */
    error?:  string
}

/**
 * History entry for tracking previous calculations
 */
export interface HistoryEntry {
    /** Unique identifier */
    id:        string

    /** Timestamp of calculation */
    timestamp: Date

    /** CVSS version used */
    version:   CVSSVersion

    /** Vector string */
    vector:    string

    /** Score result */
    score:     number

    /** Severity rating */
    severity:  SeverityRating

    /** Optional user label */
    label?:    string
}

/**
 * Export format options
 */
export type ExportFormat = `json` | `pdf` | `csv` | `text`;

/**
 * Export configuration
 */
export interface ExportOptions {
    /** Export format */
    format:              ExportFormat

    /** Include detailed breakdown */
    includeDetails:      boolean

    /** Include metric descriptions */
    includeDescriptions: boolean

    /** Custom filename (without extension) */
    filename?:           string
}
