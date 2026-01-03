/**
 * CVSS Metrics Data - Comprehensive metric definitions for all CVSS versions
 * 
 * This file contains all metric definitions, labels, descriptions, and value options
 * for CVSS v4.0, v3.1, v3.0, and v2.0. Used by the UI to render metric selection controls.
 */

export interface MetricOption {
  value: string;
  label: string;
  description: string;
}

export interface MetricDefinition {
  key: string;
  label: string;
  description: string;
  options: MetricOption[];
}

export interface MetricGroup {
  name: string;
  description: string;
  metrics: MetricDefinition[];
}

/**
 * CVSS v4.0 Metric Data
 */
export const cvss40Metrics: MetricGroup[] = [
  {
    name: "Base Metrics",
    description: "Represent the intrinsic characteristics of a vulnerability that are constant over time and across user environments",
    metrics: [
      {
        key: "AV",
        label: "Attack Vector (AV)",
        description: "Reflects the context by which vulnerability exploitation is possible",
        options: [
          { value: "N", label: "Network (N)", description: "The vulnerable system is bound to the network stack and the attacker's path is through OSI layer 3" },
          { value: "A", label: "Adjacent (A)", description: "The vulnerable system is bound to a protocol stack, but attack is limited at protocol level to a logically adjacent topology" },
          { value: "L", label: "Local (L)", description: "The vulnerable system is not bound to the network stack and the attacker's path is via read/write/execute capabilities" },
          { value: "P", label: "Physical (P)", description: "The attack requires the attacker to physically touch or manipulate the vulnerable system" },
        ],
      },
      {
        key: "AC",
        label: "Attack Complexity (AC)",
        description: "Describes the conditions beyond the attacker's control that must exist in order to exploit the vulnerability",
        options: [
          { value: "L", label: "Low (L)", description: "Specialized access conditions or extenuating circumstances do not exist" },
          { value: "H", label: "High (H)", description: "A successful attack depends on conditions beyond the attacker's control" },
        ],
      },
      {
        key: "AT",
        label: "Attack Requirements (AT)",
        description: "Captures the prerequisite deployment and execution conditions or variables of the vulnerable system",
        options: [
          { value: "N", label: "None (N)", description: "No specialized pre-conditions are necessary for exploitation" },
          { value: "P", label: "Present (P)", description: "Some specialized pre-conditions must be present for exploitation" },
        ],
      },
      {
        key: "PR",
        label: "Privileges Required (PR)",
        description: "Describes the level of privileges an attacker must possess before successfully exploiting the vulnerability",
        options: [
          { value: "N", label: "None (N)", description: "The attacker is unauthorized prior to attack" },
          { value: "L", label: "Low (L)", description: "The attacker requires privileges that provide basic user capabilities" },
          { value: "H", label: "High (H)", description: "The attacker requires privileges that provide significant control over system resources" },
        ],
      },
      {
        key: "UI",
        label: "User Interaction (UI)",
        description: "Captures the requirement for a human user, other than the attacker, to participate in the successful compromise",
        options: [
          { value: "N", label: "None (N)", description: "The vulnerable system can be exploited without interaction from any human user" },
          { value: "P", label: "Passive (P)", description: "Successful exploitation requires limited interaction by the targeted user" },
          { value: "A", label: "Active (A)", description: "Successful exploitation requires specific user interaction" },
        ],
      },
      {
        key: "VC",
        label: "Vulnerable System Confidentiality (VC)",
        description: "Measures the impact to the confidentiality of the information managed by the vulnerable system",
        options: [
          { value: "N", label: "None (N)", description: "There is no loss of confidentiality within the vulnerable system" },
          { value: "L", label: "Low (L)", description: "There is some loss of confidentiality" },
          { value: "H", label: "High (H)", description: "There is a total loss of confidentiality" },
        ],
      },
      {
        key: "VI",
        label: "Vulnerable System Integrity (VI)",
        description: "Measures the impact to integrity of a successfully exploited vulnerability",
        options: [
          { value: "N", label: "None (N)", description: "There is no loss of integrity within the vulnerable system" },
          { value: "L", label: "Low (L)", description: "Modification of data is possible, but the attacker does not have control" },
          { value: "H", label: "High (H)", description: "There is a total loss of integrity" },
        ],
      },
      {
        key: "VA",
        label: "Vulnerable System Availability (VA)",
        description: "Measures the impact to the availability of the vulnerable system",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to availability within the vulnerable system" },
          { value: "L", label: "Low (L)", description: "Performance is reduced or there are interruptions in resource availability" },
          { value: "H", label: "High (H)", description: "There is a total loss of availability" },
        ],
      },
      {
        key: "SC",
        label: "Subsequent System Confidentiality (SC)",
        description: "Measures the impact to the confidentiality of subsequent systems",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to confidentiality of subsequent systems" },
          { value: "L", label: "Low (L)", description: "There is some loss of confidentiality in subsequent systems" },
          { value: "H", label: "High (H)", description: "There is a total loss of confidentiality in subsequent systems" },
        ],
      },
      {
        key: "SI",
        label: "Subsequent System Integrity (SI)",
        description: "Measures the impact to integrity of subsequent systems",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to integrity of subsequent systems" },
          { value: "L", label: "Low (L)", description: "Modification of data in subsequent systems is possible" },
          { value: "H", label: "High (H)", description: "There is a total loss of integrity in subsequent systems" },
        ],
      },
      {
        key: "SA",
        label: "Subsequent System Availability (SA)",
        description: "Measures the impact to the availability of subsequent systems",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to availability of subsequent systems" },
          { value: "L", label: "Low (L)", description: "Performance is reduced or there are interruptions in subsequent systems" },
          { value: "H", label: "High (H)", description: "There is a total loss of availability in subsequent systems" },
        ],
      },
    ],
  },
  {
    name: "Threat Metrics",
    description: "Measure the current state of exploit techniques or code availability",
    metrics: [
      {
        key: "E",
        label: "Exploit Maturity (E)",
        description: "Measures the likelihood of the vulnerability being attacked",
        options: [
          { value: "X", label: "Not Defined (X)", description: "The Exploit Maturity metric is not being used" },
          { value: "A", label: "Attacked (A)", description: "Based on threat intelligence, this vulnerability is being actively exploited" },
          { value: "P", label: "POC (P)", description: "Proof-of-concept exploit code is available" },
          { value: "U", label: "Unreported (U)", description: "No exploits are publicly available" },
        ],
      },
    ],
  },
  {
    name: "Environmental Metrics",
    description: "Enable the analyst to customize the CVSS score based on the importance of the affected system",
    metrics: [
      {
        key: "CR",
        label: "Confidentiality Requirement (CR)",
        description: "Measures the importance of confidentiality of the vulnerable system",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "H", label: "High (H)", description: "Loss of confidentiality is likely to have a catastrophic adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of confidentiality is likely to have a serious adverse effect" },
          { value: "L", label: "Low (L)", description: "Loss of confidentiality is likely to have only a limited adverse effect" },
        ],
      },
      {
        key: "IR",
        label: "Integrity Requirement (IR)",
        description: "Measures the importance of integrity of the vulnerable system",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "H", label: "High (H)", description: "Loss of integrity is likely to have a catastrophic adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of integrity is likely to have a serious adverse effect" },
          { value: "L", label: "Low (L)", description: "Loss of integrity is likely to have only a limited adverse effect" },
        ],
      },
      {
        key: "AR",
        label: "Availability Requirement (AR)",
        description: "Measures the importance of availability of the vulnerable system",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "H", label: "High (H)", description: "Loss of availability is likely to have a catastrophic adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of availability is likely to have a serious adverse effect" },
          { value: "L", label: "Low (L)", description: "Loss of availability is likely to have only a limited adverse effect" },
        ],
      },
    ],
  },
  {
    name: "Supplemental Metrics",
    description: "Provide additional context that may be useful, but do not affect the score",
    metrics: [
      {
        key: "S",
        label: "Safety (S)",
        description: "When a system does have an intended use, the Safety metric may be used",
        options: [
          { value: "X", label: "Not Defined (X)", description: "The metric is not being used" },
          { value: "N", label: "Negligible (N)", description: "Consequences are negligible" },
          { value: "P", label: "Present (P)", description: "Consequences are significant" },
        ],
      },
      {
        key: "AU",
        label: "Automatable (AU)",
        description: "Captures whether exploitation can be automated",
        options: [
          { value: "X", label: "Not Defined (X)", description: "The metric is not being used" },
          { value: "N", label: "No (N)", description: "Attacker must take specific steps to exploit" },
          { value: "Y", label: "Yes (Y)", description: "Exploitation can be automated" },
        ],
      },
      {
        key: "R",
        label: "Recovery (R)",
        description: "Captures whether recovery is possible",
        options: [
          { value: "X", label: "Not Defined (X)", description: "The metric is not being used" },
          { value: "A", label: "Automatic (A)", description: "The system recovers automatically" },
          { value: "U", label: "User (U)", description: "User intervention is required" },
          { value: "I", label: "Irrecoverable (I)", description: "The system cannot be recovered" },
        ],
      },
      {
        key: "V",
        label: "Value Density (V)",
        description: "Measures the concentration of vulnerable systems",
        options: [
          { value: "X", label: "Not Defined (X)", description: "The metric is not being used" },
          { value: "D", label: "Diffuse (D)", description: "Vulnerable systems are scattered" },
          { value: "C", label: "Concentrated (C)", description: "Vulnerable systems are concentrated" },
        ],
      },
      {
        key: "RE",
        label: "Vulnerability Response Effort (RE)",
        description: "Measures the effort required to respond to the vulnerability",
        options: [
          { value: "X", label: "Not Defined (X)", description: "The metric is not being used" },
          { value: "L", label: "Low (L)", description: "Response effort is low" },
          { value: "M", label: "Moderate (M)", description: "Response effort is moderate" },
          { value: "H", label: "High (H)", description: "Response effort is high" },
        ],
      },
      {
        key: "U",
        label: "Provider Urgency (U)",
        description: "Captures the provider's assessment of urgency",
        options: [
          { value: "X", label: "Not Defined (X)", description: "The metric is not being used" },
          { value: "Clear", label: "Clear", description: "Provider has assessed as clear urgency" },
          { value: "Green", label: "Green", description: "Provider has assessed as green urgency" },
          { value: "Amber", label: "Amber", description: "Provider has assessed as amber urgency" },
          { value: "Red", label: "Red", description: "Provider has assessed as red urgency" },
        ],
      },
    ],
  },
];

/**
 * CVSS v3.1/v3.0 Metric Data
 */
export const cvss3Metrics: MetricGroup[] = [
  {
    name: "Base Metrics",
    description: "Represent the intrinsic characteristics of a vulnerability that are constant over time and across user environments",
    metrics: [
      {
        key: "AV",
        label: "Attack Vector (AV)",
        description: "Reflects the context by which vulnerability exploitation is possible",
        options: [
          { value: "N", label: "Network (N)", description: "The vulnerable component is bound to the network stack" },
          { value: "A", label: "Adjacent (A)", description: "The vulnerable component is bound to the network stack, but attack is limited to the same shared physical or logical network" },
          { value: "L", label: "Local (L)", description: "The vulnerable component is not bound to the network stack and requires local access" },
          { value: "P", label: "Physical (P)", description: "The attack requires the attacker to physically touch or manipulate the vulnerable component" },
        ],
      },
      {
        key: "AC",
        label: "Attack Complexity (AC)",
        description: "Describes the conditions beyond the attacker's control that must exist",
        options: [
          { value: "L", label: "Low (L)", description: "Specialized access conditions or extenuating circumstances do not exist" },
          { value: "H", label: "High (H)", description: "A successful attack depends on conditions beyond the attacker's control" },
        ],
      },
      {
        key: "PR",
        label: "Privileges Required (PR)",
        description: "Describes the level of privileges an attacker must possess",
        options: [
          { value: "N", label: "None (N)", description: "The attacker is unauthorized prior to attack" },
          { value: "L", label: "Low (L)", description: "The attacker requires privileges that provide basic user capabilities" },
          { value: "H", label: "High (H)", description: "The attacker requires privileges that provide significant control" },
        ],
      },
      {
        key: "UI",
        label: "User Interaction (UI)",
        description: "Captures the requirement for a human user to participate",
        options: [
          { value: "N", label: "None (N)", description: "The vulnerable system can be exploited without interaction" },
          { value: "R", label: "Required (R)", description: "Successful exploitation requires a user to take some action" },
        ],
      },
      {
        key: "S",
        label: "Scope (S)",
        description: "Captures whether a vulnerability in one component impacts resources beyond its security scope",
        options: [
          { value: "U", label: "Unchanged (U)", description: "An exploited vulnerability can only affect resources managed by the same security authority" },
          { value: "C", label: "Changed (C)", description: "An exploited vulnerability can affect resources beyond the security scope" },
        ],
      },
      {
        key: "C",
        label: "Confidentiality (C)",
        description: "Measures the impact to the confidentiality of information",
        options: [
          { value: "N", label: "None (N)", description: "There is no loss of confidentiality" },
          { value: "L", label: "Low (L)", description: "There is some loss of confidentiality" },
          { value: "H", label: "High (H)", description: "There is a total loss of confidentiality" },
        ],
      },
      {
        key: "I",
        label: "Integrity (I)",
        description: "Measures the impact to integrity",
        options: [
          { value: "N", label: "None (N)", description: "There is no loss of integrity" },
          { value: "L", label: "Low (L)", description: "Modification of data is possible" },
          { value: "H", label: "High (H)", description: "There is a total loss of integrity" },
        ],
      },
      {
        key: "A",
        label: "Availability (A)",
        description: "Measures the impact to the availability of resources",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to availability" },
          { value: "L", label: "Low (L)", description: "Performance is reduced or there are interruptions" },
          { value: "H", label: "High (H)", description: "There is a total loss of availability" },
        ],
      },
    ],
  },
  {
    name: "Temporal Metrics",
    description: "Measure the current state of exploit techniques and remediation",
    metrics: [
      {
        key: "E",
        label: "Exploit Code Maturity (E)",
        description: "Measures the likelihood of the vulnerability being attacked",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "H", label: "High (H)", description: "Functional autonomous code exists" },
          { value: "F", label: "Functional (F)", description: "Functional exploit code is available" },
          { value: "P", label: "Proof-of-Concept (P)", description: "Proof-of-concept exploit code is available" },
          { value: "U", label: "Unproven (U)", description: "No exploit code is available" },
        ],
      },
      {
        key: "RL",
        label: "Remediation Level (RL)",
        description: "Measures the availability of remediation steps",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "U", label: "Unavailable (U)", description: "There is either no solution available or it is impossible to apply" },
          { value: "W", label: "Workaround (W)", description: "There is an unofficial, non-vendor solution available" },
          { value: "T", label: "Temporary Fix (T)", description: "There is an official but temporary fix available" },
          { value: "O", label: "Official Fix (O)", description: "A complete vendor solution is available" },
        ],
      },
      {
        key: "RC",
        label: "Report Confidence (RC)",
        description: "Measures the degree of confidence in the existence of the vulnerability",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "C", label: "Confirmed (C)", description: "Detailed reports exist, or functional reproduction is possible" },
          { value: "R", label: "Reasonable (R)", description: "Significant details are published, but not confirmed" },
          { value: "U", label: "Unknown (U)", description: "There are reports of impacts that indicate a vulnerability is present" },
        ],
      },
    ],
  },
  {
    name: "Environmental Metrics",
    description: "Enable the analyst to customize the CVSS score based on the importance of the affected system",
    metrics: [
      {
        key: "CR",
        label: "Confidentiality Requirement (CR)",
        description: "Measures the importance of confidentiality to your organization",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "H", label: "High (H)", description: "Loss of confidentiality is likely to have a catastrophic adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of confidentiality is likely to have a serious adverse effect" },
          { value: "L", label: "Low (L)", description: "Loss of confidentiality is likely to have only a limited adverse effect" },
        ],
      },
      {
        key: "IR",
        label: "Integrity Requirement (IR)",
        description: "Measures the importance of integrity to your organization",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "H", label: "High (H)", description: "Loss of integrity is likely to have a catastrophic adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of integrity is likely to have a serious adverse effect" },
          { value: "L", label: "Low (L)", description: "Loss of integrity is likely to have only a limited adverse effect" },
        ],
      },
      {
        key: "AR",
        label: "Availability Requirement (AR)",
        description: "Measures the importance of availability to your organization",
        options: [
          { value: "X", label: "Not Defined (X)", description: "Assigning this value indicates there is insufficient information" },
          { value: "H", label: "High (H)", description: "Loss of availability is likely to have a catastrophic adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of availability is likely to have a serious adverse effect" },
          { value: "L", label: "Low (L)", description: "Loss of availability is likely to have only a limited adverse effect" },
        ],
      },
    ],
  },
];

/**
 * CVSS v2.0 Metric Data
 */
export const cvss2Metrics: MetricGroup[] = [
  {
    name: "Base Metrics",
    description: "Represent the intrinsic and fundamental characteristics of a vulnerability",
    metrics: [
      {
        key: "AV",
        label: "Access Vector (AV)",
        description: "Reflects how the vulnerability is exploited",
        options: [
          { value: "L", label: "Local (L)", description: "Requires local access to the vulnerable system" },
          { value: "A", label: "Adjacent Network (A)", description: "Requires access to the local network" },
          { value: "N", label: "Network (N)", description: "Vulnerable to remote exploitation" },
        ],
      },
      {
        key: "AC",
        label: "Access Complexity (AC)",
        description: "Measures the complexity of the attack required to exploit the vulnerability",
        options: [
          { value: "H", label: "High (H)", description: "Specialized access conditions exist" },
          { value: "M", label: "Medium (M)", description: "The access conditions are somewhat specialized" },
          { value: "L", label: "Low (L)", description: "No special access conditions or extenuating circumstances exist" },
        ],
      },
      {
        key: "Au",
        label: "Authentication (Au)",
        description: "Measures the number of times an attacker must authenticate",
        options: [
          { value: "M", label: "Multiple (M)", description: "Requires authentication two or more times" },
          { value: "S", label: "Single (S)", description: "Requires authentication one time" },
          { value: "N", label: "None (N)", description: "Authentication is not required" },
        ],
      },
      {
        key: "C",
        label: "Confidentiality Impact (C)",
        description: "Measures the impact on confidentiality of a successfully exploited vulnerability",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to the confidentiality" },
          { value: "P", label: "Partial (P)", description: "There is considerable disclosure" },
          { value: "C", label: "Complete (C)", description: "There is total information disclosure" },
        ],
      },
      {
        key: "I",
        label: "Integrity Impact (I)",
        description: "Measures the impact to integrity of a successfully exploited vulnerability",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to the integrity" },
          { value: "P", label: "Partial (P)", description: "Modification of some information is possible" },
          { value: "C", label: "Complete (C)", description: "There is total compromise of integrity" },
        ],
      },
      {
        key: "A",
        label: "Availability Impact (A)",
        description: "Measures the impact to availability of a successfully exploited vulnerability",
        options: [
          { value: "N", label: "None (N)", description: "There is no impact to the availability" },
          { value: "P", label: "Partial (P)", description: "There is reduced performance or interruptions" },
          { value: "C", label: "Complete (C)", description: "There is total shutdown of the affected resource" },
        ],
      },
    ],
  },
  {
    name: "Temporal Metrics",
    description: "Measure the current state of exploit techniques and remediation",
    metrics: [
      {
        key: "E",
        label: "Exploitability (E)",
        description: "Measures the current state of exploit techniques",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "U", label: "Unproven (U)", description: "No exploit code is available" },
          { value: "POC", label: "Proof-of-Concept (POC)", description: "Proof-of-concept exploit code or technique is available" },
          { value: "F", label: "Functional (F)", description: "Functional exploit code is available" },
          { value: "H", label: "High (H)", description: "Exploitable by functional mobile autonomous code" },
        ],
      },
      {
        key: "RL",
        label: "Remediation Level (RL)",
        description: "Measures the availability of remediation steps",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "OF", label: "Official Fix (OF)", description: "A complete vendor solution is available" },
          { value: "TF", label: "Temporary Fix (TF)", description: "There is an official but temporary fix available" },
          { value: "W", label: "Workaround (W)", description: "There is an unofficial, non-vendor solution available" },
          { value: "U", label: "Unavailable (U)", description: "There is either no solution available or it is impossible to apply" },
        ],
      },
      {
        key: "RC",
        label: "Report Confidence (RC)",
        description: "Measures the degree of confidence in the existence of the vulnerability",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "UC", label: "Unconfirmed (UC)", description: "There is a single unconfirmed source" },
          { value: "UR", label: "Uncorroborated (UR)", description: "There are multiple non-official sources" },
          { value: "C", label: "Confirmed (C)", description: "Acknowledged by the vendor or author" },
        ],
      },
    ],
  },
  {
    name: "Environmental Metrics",
    description: "Represent the characteristics of a vulnerability that are relevant and unique to a user's environment",
    metrics: [
      {
        key: "CDP",
        label: "Collateral Damage Potential (CDP)",
        description: "Measures the potential for loss of life or physical assets",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "N", label: "None (N)", description: "There is no potential for loss" },
          { value: "L", label: "Low (L)", description: "A successful exploit may result in slight damage" },
          { value: "LM", label: "Low-Medium (LM)", description: "A successful exploit may result in moderate damage" },
          { value: "MH", label: "Medium-High (MH)", description: "A successful exploit may result in significant damage" },
          { value: "H", label: "High (H)", description: "A successful exploit may result in catastrophic damage" },
        ],
      },
      {
        key: "TD",
        label: "Target Distribution (TD)",
        description: "Measures the proportion of vulnerable systems",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "N", label: "None (N)", description: "No target systems exist" },
          { value: "L", label: "Low (L)", description: "Targets exist on a small scale inside the environment" },
          { value: "M", label: "Medium (M)", description: "Targets exist on a medium scale" },
          { value: "H", label: "High (H)", description: "Targets exist on a considerable scale" },
        ],
      },
      {
        key: "CR",
        label: "Confidentiality Requirement (CR)",
        description: "Measures the importance of confidentiality to your organization",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "L", label: "Low (L)", description: "Loss of confidentiality has a limited adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of confidentiality has a serious adverse effect" },
          { value: "H", label: "High (H)", description: "Loss of confidentiality has a catastrophic adverse effect" },
        ],
      },
      {
        key: "IR",
        label: "Integrity Requirement (IR)",
        description: "Measures the importance of integrity to your organization",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "L", label: "Low (L)", description: "Loss of integrity has a limited adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of integrity has a serious adverse effect" },
          { value: "H", label: "High (H)", description: "Loss of integrity has a catastrophic adverse effect" },
        ],
      },
      {
        key: "AR",
        label: "Availability Requirement (AR)",
        description: "Measures the importance of availability to your organization",
        options: [
          { value: "ND", label: "Not Defined (ND)", description: "Assigning this value indicates there is insufficient information" },
          { value: "L", label: "Low (L)", description: "Loss of availability has a limited adverse effect" },
          { value: "M", label: "Medium (M)", description: "Loss of availability has a serious adverse effect" },
          { value: "H", label: "High (H)", description: "Loss of availability has a catastrophic adverse effect" },
        ],
      },
    ],
  },
];

/**
 * Get severity rating based on score and CVSS version
 */
export function getSeverityRating(score: number, version: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (version.startsWith("2")) {
    // CVSS v2.0
    if (score === 0) return { label: "None", color: "text-green-700", bgColor: "bg-green-100" };
    if (score < 4.0) return { label: "Low", color: "text-yellow-700", bgColor: "bg-yellow-100" };
    if (score < 7.0) return { label: "Medium", color: "text-orange-700", bgColor: "bg-orange-100" };
    return { label: "High", color: "text-red-700", bgColor: "bg-red-100" };
  } else {
    // CVSS v3.x and v4.0
    if (score === 0) return { label: "None", color: "text-green-700", bgColor: "bg-green-100" };
    if (score < 4.0) return { label: "Low", color: "text-yellow-700", bgColor: "bg-yellow-100" };
    if (score < 7.0) return { label: "Medium", color: "text-orange-700", bgColor: "bg-orange-100" };
    if (score < 9.0) return { label: "High", color: "text-red-700", bgColor: "bg-red-100" };
    return { label: "Critical", color: "text-purple-700", bgColor: "bg-purple-100" };
  }
}
