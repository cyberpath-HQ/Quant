/**
 * CVSS Metrics Data - Comprehensive metric definitions for all CVSS versions
 *
 * This file contains all metric definitions, labels, descriptions, and value options
 * for CVSS v4.0, v3.1, v3.0, and v2.0. Used by the UI to render metric selection controls.
 */

export interface MetricOption {
    value:          string
    label:          string
    description:    string
    in_other_words: string
}

export interface MetricDefinition {
    key:         string
    label:       string
    description: string
    options:     Array<MetricOption>
}

export interface MetricGroup {
    name:        string
    description: string
    metrics:     Array<MetricDefinition>
}

/**
 * CVSS v4.0 Metric Data
 */
export const cvss40Metrics: Array<MetricGroup> = [
    {
        name:        `Base Metrics`,
        description: `Represent the intrinsic characteristics of a vulnerability that are constant over time and across user environments`,
        metrics:     [
            {
                key:         `AV`,
                label:       `Attack Vector (AV)`,
                description: `Reflects the context by which vulnerability exploitation is possible`,
                options:     [
                    {
                        value:          `N`,
                        label:          `Network (N)`,
                        description:    `The vulnerable system is bound to the network stack and the attacker's path is through OSI layer 3`,
                        in_other_words: `The attacker can exploit this vulnerability remotely over the internet without needing special network access`,
                    },
                    {
                        value:          `A`,
                        label:          `Adjacent (A)`,
                        description:    `The vulnerable system is bound to a protocol stack, but attack is limited at protocol level to a logically adjacent topology`,
                        in_other_words: `The attacker must be on the same local network segment (like a WiFi network or Bluetooth range) to exploit the vulnerability`,
                    },
                    {
                        value:          `L`,
                        label:          `Local (L)`,
                        description:    `The vulnerable system is not bound to the network stack and the attacker's path is via read/write/execute capabilities`,
                        in_other_words: `The attacker must have already logged into the system or have local access (like sitting at the computer) to exploit it`,
                    },
                    {
                        value:          `P`,
                        label:          `Physical (P)`,
                        description:    `The attack requires the attacker to physically touch or manipulate the vulnerable system`,
                        in_other_words: `The attacker must physically handle or touch the device (like inserting a USB drive or opening the hardware)`,
                    },
                ],
            },
            {
                key:         `AC`,
                label:       `Attack Complexity (AC)`,
                description: `Describes the conditions beyond the attacker's control that must exist in order to exploit the vulnerability`,
                options:     [
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Specialized access conditions or extenuating circumstances do not exist`,
                        in_other_words: `Exploitation is straightforward with no special timing, conditions, or uncommon setup required`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `A successful attack depends on conditions beyond the attacker's control`,
                        in_other_words: `The attacker must wait for specific conditions (like a user restarting, specific software versions, or rare system states) that are hard to predict or trigger`,
                    },
                ],
            },
            {
                key:         `AT`,
                label:       `Attack Requirements (AT)`,
                description: `Captures the prerequisite deployment and execution conditions or variables of the vulnerable system`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `No specialized pre-conditions are necessary for exploitation`,
                        in_other_words: `The vulnerability can be exploited anytime without needing the system configured in a special way`,
                    },
                    {
                        value:          `P`,
                        label:          `Present (P)`,
                        description:    `Some specialized pre-conditions must be present for exploitation`,
                        in_other_words: `The system must be configured or running in a specific way (like a particular software mode, debug flag, or feature enabled) for the attack to work`,
                    },
                ],
            },
            {
                key:         `PR`,
                label:       `Privileges Required (PR)`,
                description: `Describes the level of privileges an attacker must possess before successfully exploiting the vulnerability`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `The attacker is unauthorized prior to attack`,
                        in_other_words: `A complete stranger with no account or access can exploit this vulnerability`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `The attacker requires privileges that provide basic user capabilities`,
                        in_other_words: `The attacker needs a regular user account with limited permissions (like a guest or standard user)`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `The attacker requires privileges that provide significant control over system resources`,
                        in_other_words: `The attacker must be an administrator or have powerful user account with extensive system control`,
                    },
                ],
            },
            {
                key:         `UI`,
                label:       `User Interaction (UI)`,
                description: `Captures the requirement for a human user, other than the attacker, to participate in the successful compromise`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `The vulnerable system can be exploited without interaction from any human user`,
                        in_other_words: `The attack works automatically; no one needs to do anything or click anything`,
                    },
                    {
                        value:          `P`,
                        label:          `Passive (P)`,
                        description:    `Successful exploitation requires limited interaction by the targeted user`,
                        in_other_words: `The user just needs to visit a webpage or open a file; they don't need to intentionally do anything`,
                    },
                    {
                        value:          `A`,
                        label:          `Active (A)`,
                        description:    `Successful exploitation requires specific user interaction`,
                        in_other_words: `The user must take deliberate actions like clicking a button, entering information, or confirming a dialog`,
                    },
                ],
            },
            {
                key:         `VC`,
                label:       `Vulnerable System Confidentiality (VC)`,
                description: `Measures the impact to the confidentiality of the information managed by the vulnerable system`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no loss of confidentiality within the vulnerable system`,
                        in_other_words: `Private information on the compromised system remains protected and cannot be read by attackers`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `There is some loss of confidentiality`,
                        in_other_words: `Some private information may be exposed, but most data stays protected`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of confidentiality`,
                        in_other_words: `Attackers can read (almost) all private information stored on the system`,
                    },
                ],
            },
            {
                key:         `VI`,
                label:       `Vulnerable System Integrity (VI)`,
                description: `Measures the impact to integrity of a successfully exploited vulnerability`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no loss of integrity within the vulnerable system`,
                        in_other_words: `Attackers cannot modify or corrupt any data on the compromised system`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Modification of data is possible, but the attacker does not have control`,
                        in_other_words: `Some data might be changed, but attackers can't control what gets modified`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of integrity`,
                        in_other_words: `Attackers can modify or delete any data on the compromised system`,
                    },
                ],
            },
            {
                key:         `VA`,
                label:       `Vulnerable System Availability (VA)`,
                description: `Measures the impact to the availability of the vulnerable system`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to availability within the vulnerable system`,
                        in_other_words: `The system keeps running normally; users can still access it without interruption`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Performance is reduced or there are interruptions in resource availability`,
                        in_other_words: `The system slows down or becomes partially unavailable, but users can still use it`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of availability`,
                        in_other_words: `The system becomes completely unavailable; users cannot access it at all`,
                    },
                ],
            },
            {
                key:         `SC`,
                label:       `Subsequent System Confidentiality (SC)`,
                description: `Measures the impact to the confidentiality of subsequent systems`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to confidentiality of subsequent systems`,
                        in_other_words: `The breach doesn't spread; other systems connected to this one remain secure`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `There is some loss of confidentiality in subsequent systems`,
                        in_other_words: `Private data from other connected systems may be exposed through this compromised system`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of confidentiality in subsequent systems`,
                        in_other_words: `All private information on connected systems can be accessed through this compromised system`,
                    },
                ],
            },
            {
                key:         `SI`,
                label:       `Subsequent System Integrity (SI)`,
                description: `Measures the impact to integrity of subsequent systems`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to integrity of subsequent systems`,
                        in_other_words: `Data in other connected systems cannot be modified or corrupted through this system`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Modification of data in subsequent systems is possible`,
                        in_other_words: `Attackers can use this system to modify some data in other connected systems`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of integrity in subsequent systems`,
                        in_other_words: `Attackers can use this system to modify or delete any data in connected systems`,
                    },
                ],
            },
            {
                key:         `SA`,
                label:       `Subsequent System Availability (SA)`,
                description: `Measures the impact to the availability of subsequent systems`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to availability of subsequent systems`,
                        in_other_words: `Other systems connected to this one remain fully operational`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Performance is reduced or there are interruptions in subsequent systems`,
                        in_other_words: `Other connected systems may become slower or temporarily unavailable`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of availability in subsequent systems`,
                        in_other_words: `This system compromise can cause other connected systems to become completely unavailable`,
                    },
                ],
            },
        ],
    },
    {
        name:        `Threat Metrics`,
        description: `Measure the current state of exploit techniques or code availability`,
        metrics:     [
            {
                key:         `E`,
                label:       `Exploit Maturity (E)`,
                description: `Measures the likelihood of the vulnerability being attacked`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `The Exploit Maturity metric is not being used`,
                        in_other_words: `We're not providing information about how mature the exploit for this vulnerability is`,
                    },
                    {
                        value:          `A`,
                        label:          `Attacked (A)`,
                        description:    `Based on threat intelligence, this vulnerability is being actively exploited`,
                        in_other_words: `Real hackers are actively using this vulnerability to attack systems right now`,
                    },
                    {
                        value:          `P`,
                        label:          `POC (P)`,
                        description:    `Proof-of-concept exploit code is available`,
                        in_other_words: `Someone has published example code that demonstrates how to exploit this vulnerability, likely being exploited in the wild in the near future`,
                    },
                    {
                        value:          `U`,
                        label:          `Unreported (U)`,
                        description:    `No exploits are publicly available`,
                        in_other_words: `No one has publicly released working exploit code or detailed instructions for this vulnerability yet`,
                    },
                ],
            },
        ],
    },
    {
        name:        `Environmental Metrics`,
        description: `Enable the analyst to customize the CVSS score based on the importance of the affected system`,
        metrics:     [
            {
                key:         `CR`,
                label:       `Confidentiality Requirement (CR)`,
                description: `Measures the importance of confidentiality of the vulnerable system`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We don't know how important confidentiality is for this system`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of confidentiality is likely to have a catastrophic adverse effect`,
                        in_other_words: `Exposing secret data would cause severe damage to the organization (like medical records, trade secrets, or classified info)`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of confidentiality is likely to have a serious adverse effect`,
                        in_other_words: `Exposing private data would cause significant harm to the organization`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of confidentiality is likely to have only a limited adverse effect`,
                        in_other_words: `Exposing data from this system would cause only minor damage`,
                    },
                ],
            },
            {
                key:         `IR`,
                label:       `Integrity Requirement (IR)`,
                description: `Measures the importance of integrity of the vulnerable system`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We don't know how important data integrity is for this system`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of integrity is likely to have a catastrophic adverse effect`,
                        in_other_words: `If attackers could change data, it would cause severe damage (like changing financial records or medical treatments)`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of integrity is likely to have a serious adverse effect`,
                        in_other_words: `If data gets modified, it would cause significant problems for the organization`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of integrity is likely to have only a limited adverse effect`,
                        in_other_words: `Even if some data changes, the impact would be minor`,
                    },
                ],
            },
            {
                key:         `AR`,
                label:       `Availability Requirement (AR)`,
                description: `Measures the importance of availability of the vulnerable system`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We don't know how important continuous availability is for this system`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of availability is likely to have a catastrophic adverse effect`,
                        in_other_words: `If this system goes down, it would cause severe damage (like hospital systems or critical infrastructure)`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of availability is likely to have a serious adverse effect`,
                        in_other_words: `If this system becomes unavailable, it would significantly disrupt the organization`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of availability is likely to have only a limited adverse effect`,
                        in_other_words: `If this system goes down temporarily, the impact would be minimal`,
                    },
                ],
            },
        ],
    },
    {
        name:        `Supplemental Metrics`,
        description: `Provide additional context that may be useful, but do not affect the score`,
        metrics:     [
            {
                key:         `S`,
                label:       `Safety (S)`,
                description: `When a system does have an intended use, the Safety metric may be used`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `The metric is not being used`,
                        in_other_words: `We're not assessing whether the system controls something that could cause harm`,
                    },
                    {
                        value:          `N`,
                        label:          `Negligible (N)`,
                        description:    `Consequences are negligible`,
                        in_other_words: `Even if this system fails, it won't cause harm to people or physical equipment`,
                    },
                    {
                        value:          `P`,
                        label:          `Present (P)`,
                        description:    `Consequences are significant`,
                        in_other_words: `This system controls something important where a malfunction could harm people or equipment`,
                    },
                ],
            },
            {
                key:         `AU`,
                label:       `Automatable (AU)`,
                description: `Captures whether exploitation can be automated`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `The metric is not being used`,
                        in_other_words: `We're not saying whether this can be automated or not`,
                    },
                    {
                        value:          `N`,
                        label:          `No (N)`,
                        description:    `Attacker must take specific steps to exploit`,
                        in_other_words: `Even attackers need human judgment; they can't just write a script to exploit this widely`,
                    },
                    {
                        value:          `Y`,
                        label:          `Yes (Y)`,
                        description:    `Exploitation can be automated`,
                        in_other_words: `Attackers can create a fully automated tool that attacks many systems without human involvement`,
                    },
                ],
            },
            {
                key:         `R`,
                label:       `Recovery (R)`,
                description: `Captures whether recovery is possible`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `The metric is not being used`,
                        in_other_words: `We're not saying whether the system can recover from the damage`,
                    },
                    {
                        value:          `A`,
                        label:          `Automatic (A)`,
                        description:    `The system recovers automatically`,
                        in_other_words: `If something goes wrong, the system fixes itself without anyone needing to help`,
                    },
                    {
                        value:          `U`,
                        label:          `User (U)`,
                        description:    `User intervention is required`,
                        in_other_words: `Someone has to manually fix the system after an attack; it won't repair itself`,
                    },
                    {
                        value:          `I`,
                        label:          `Irrecoverable (I)`,
                        description:    `The system cannot be recovered`,
                        in_other_words: `Once attacked, the damage is permanent and cannot be fixed`,
                    },
                ],
            },
            {
                key:         `V`,
                label:       `Value Density (V)`,
                description: `Measures the concentration of vulnerable systems`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `The metric is not being used`,
                        in_other_words: `We're not assessing how many vulnerable systems of this type exist`,
                    },
                    {
                        value:          `D`,
                        label:          `Diffuse (D)`,
                        description:    `Vulnerable systems are scattered`,
                        in_other_words: `Vulnerable systems of this type are spread out worldwide; attackers would need to target them individually`,
                    },
                    {
                        value:          `C`,
                        label:          `Concentrated (C)`,
                        description:    `Vulnerable systems are concentrated`,
                        in_other_words: `Many vulnerable systems are in a few locations or organizations; attackers can target them efficiently`,
                    },
                ],
            },
            {
                key:         `RE`,
                label:       `Vulnerability Response Effort (RE)`,
                description: `Measures the effort required to respond to the vulnerability`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `The metric is not being used`,
                        in_other_words: `We're not saying how much work fixing this will take`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Response effort is low`,
                        in_other_words: `Fixing this vulnerability is easy and quick; minimal work required`,
                    },
                    {
                        value:          `M`,
                        label:          `Moderate (M)`,
                        description:    `Response effort is moderate`,
                        in_other_words: `Responding to this vulnerability takes significant effort but is straightforward`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Response effort is high`,
                        in_other_words: `Responding to this vulnerability requires extensive work, planning, and resources`,
                    },
                ],
            },
            {
                key:         `U`,
                label:       `Provider Urgency (U)`,
                description: `Captures the provider's assessment of urgency`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `The metric is not being used`,
                        in_other_words: `The provider hasn't given an urgency rating`,
                    },
                    {
                        value:          `Clear`,
                        label:          `Clear`,
                        description:    `Provider has assessed as clear urgency`,
                        in_other_words: `The provider says there's no immediate rush to fix this`,
                    },
                    {
                        value:          `Green`,
                        label:          `Green`,
                        description:    `Provider has assessed as green urgency`,
                        in_other_words: `The provider considers this low priority; fix it when you have time`,
                    },
                    {
                        value:          `Amber`,
                        label:          `Amber`,
                        description:    `Provider has assessed as amber urgency`,
                        in_other_words: `The provider says this is moderately important; should be fixed soon`,
                    },
                    {
                        value:          `Red`,
                        label:          `Red`,
                        description:    `Provider has assessed as red urgency`,
                        in_other_words: `The provider considers this critical; fix it immediately`,
                    },
                ],
            },
        ],
    },
];

/**
 * CVSS v3.1/v3.0 Metric Data
 */
export const cvss3Metrics: Array<MetricGroup> = [
    {
        name:        `Base Metrics`,
        description: `Represent the intrinsic characteristics of a vulnerability that are constant over time and across user environments`,
        metrics:     [
            {
                key:         `AV`,
                label:       `Attack Vector (AV)`,
                description: `Reflects the context by which vulnerability exploitation is possible`,
                options:     [
                    {
                        value:          `N`,
                        label:          `Network (N)`,
                        description:    `The vulnerable component is bound to the network stack`,
                        in_other_words: `The attacker can exploit this remotely over the internet`,
                    },
                    {
                        value:          `A`,
                        label:          `Adjacent (A)`,
                        description:    `The vulnerable component is bound to the network stack, but attack is limited to the same shared physical or logical network`,
                        in_other_words: `The attacker must be on the same local network (WiFi, Bluetooth, or physical network segment)`,
                    },
                    {
                        value:          `L`,
                        label:          `Local (L)`,
                        description:    `The vulnerable component is not bound to the network stack and requires local access`,
                        in_other_words: `The attacker must have already logged into the system or have physical access to it`,
                    },
                    {
                        value:          `P`,
                        label:          `Physical (P)`,
                        description:    `The attack requires the attacker to physically touch or manipulate the vulnerable component`,
                        in_other_words: `The attacker must physically handle the device or insert hardware`,
                    },
                ],
            },
            {
                key:         `AC`,
                label:       `Attack Complexity (AC)`,
                description: `Describes the conditions beyond the attacker's control that must exist`,
                options:     [
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Specialized access conditions or extenuating circumstances do not exist`,
                        in_other_words: `The attack can happen anytime; no special conditions or timing are needed`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `A successful attack depends on conditions beyond the attacker's control`,
                        in_other_words: `The attack requires specific rare circumstances that the attacker can't easily control`,
                    },
                ],
            },
            {
                key:         `PR`,
                label:       `Privileges Required (PR)`,
                description: `Describes the level of privileges an attacker must possess`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `The attacker is unauthorized prior to attack`,
                        in_other_words: `Anyone can exploit this; you don't need any account or access`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `The attacker requires privileges that provide basic user capabilities`,
                        in_other_words: `You need a regular user account with basic permissions`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `The attacker requires privileges that provide significant control`,
                        in_other_words: `You need administrator or high-level access`,
                    },
                ],
            },
            {
                key:         `UI`,
                label:       `User Interaction (UI)`,
                description: `Captures the requirement for a human user to participate`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `The vulnerable system can be exploited without interaction`,
                        in_other_words: `No user action is needed; the attack happens automatically`,
                    },
                    {
                        value:          `R`,
                        label:          `Required (R)`,
                        description:    `Successful exploitation requires a user to take some action`,
                        in_other_words: `The user must do something (click a link, open a file, etc.) for the attack to work`,
                    },
                ],
            },
            {
                key:         `S`,
                label:       `Scope (S)`,
                description: `Captures whether a vulnerability in one component impacts resources beyond its security scope`,
                options:     [
                    {
                        value:          `U`,
                        label:          `Unchanged (U)`,
                        description:    `An exploited vulnerability can only affect resources managed by the same security authority`,
                        in_other_words: `The damage stays within the compromised component; other parts of the system are protected`,
                    },
                    {
                        value:          `C`,
                        label:          `Changed (C)`,
                        description:    `An exploited vulnerability can affect resources beyond the security scope`,
                        in_other_words: `The attack can break out and damage other systems or applications`,
                    },
                ],
            },
            {
                key:         `C`,
                label:       `Confidentiality (C)`,
                description: `Measures the impact to the confidentiality of information`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no loss of confidentiality`,
                        in_other_words: `Private information remains secure and can't be read`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `There is some loss of confidentiality`,
                        in_other_words: `Some private data might be exposed`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of confidentiality`,
                        in_other_words: `All or nearly all private information can be read`,
                    },
                ],
            },
            {
                key:         `I`,
                label:       `Integrity (I)`,
                description: `Measures the impact to integrity`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no loss of integrity`,
                        in_other_words: `Data cannot be modified or corrupted`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Modification of data is possible`,
                        in_other_words: `Some data might be altered, but it's limited`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of integrity`,
                        in_other_words: `Attackers can freely modify or delete any data`,
                    },
                ],
            },
            {
                key:         `A`,
                label:       `Availability (A)`,
                description: `Measures the impact to the availability of resources`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to availability`,
                        in_other_words: `The system remains fully operational`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Performance is reduced or there are interruptions`,
                        in_other_words: `The system becomes slower or partially unavailable`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `There is a total loss of availability`,
                        in_other_words: `The system becomes completely unavailable`,
                    },
                ],
            },
        ],
    },
    {
        name:        `Temporal Metrics`,
        description: `Measure the current state of exploit techniques and remediation`,
        metrics:     [
            {
                key:         `E`,
                label:       `Exploit Code Maturity (E)`,
                description: `Measures the likelihood of the vulnerability being attacked`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We don't know the status of exploit code for this`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Functional autonomous code exists`,
                        in_other_words: `Fully automated exploit tools are available that work independently`,
                    },
                    {
                        value:          `F`,
                        label:          `Functional (F)`,
                        description:    `Functional exploit code is available`,
                        in_other_words: `Working exploit code is publicly available`,
                    },
                    {
                        value:          `P`,
                        label:          `Proof-of-Concept (P)`,
                        description:    `Proof-of-concept exploit code is available`,
                        in_other_words: `Example code showing the concept exists, but it's not full-featured`,
                    },
                    {
                        value:          `U`,
                        label:          `Unproven (U)`,
                        description:    `No exploit code is available`,
                        in_other_words: `No public exploits exist yet`,
                    },
                ],
            },
            {
                key:         `RL`,
                label:       `Remediation Level (RL)`,
                description: `Measures the availability of remediation steps`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `No information about whether a fix exists`,
                    },
                    {
                        value:          `U`,
                        label:          `Unavailable (U)`,
                        description:    `There is either no solution available or it is impossible to apply`,
                        in_other_words: `There's no fix available, and the situation can't be improved`,
                    },
                    {
                        value:          `W`,
                        label:          `Workaround (W)`,
                        description:    `There is an unofficial, non-vendor solution available`,
                        in_other_words: `There's an unofficial workaround, but not an official fix from the vendor`,
                    },
                    {
                        value:          `T`,
                        label:          `Temporary Fix (T)`,
                        description:    `There is an official but temporary fix available`,
                        in_other_words: `The vendor provided a temporary fix that works for now`,
                    },
                    {
                        value:          `O`,
                        label:          `Official Fix (O)`,
                        description:    `A complete vendor solution is available`,
                        in_other_words: `The vendor has released an official, permanent fix`,
                    },
                ],
            },
            {
                key:         `RC`,
                label:       `Report Confidence (RC)`,
                description: `Measures the degree of confidence in the existence of the vulnerability`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We're uncertain whether this vulnerability is real`,
                    },
                    {
                        value:          `C`,
                        label:          `Confirmed (C)`,
                        description:    `Detailed reports exist, or functional reproduction is possible`,
                        in_other_words: `The vulnerability has been verified and confirmed by multiple sources`,
                    },
                    {
                        value:          `R`,
                        label:          `Reasonable (R)`,
                        description:    `Significant details are published, but not confirmed`,
                        in_other_words: `Good evidence exists, but it hasn't been independently verified`,
                    },
                    {
                        value:          `U`,
                        label:          `Unknown (U)`,
                        description:    `There are reports of impacts that indicate a vulnerability is present`,
                        in_other_words: `There are claims the vulnerability exists, but details are unverified`,
                    },
                ],
            },
        ],
    },
    {
        name:        `Environmental Metrics`,
        description: `Enable the analyst to customize the CVSS score based on the importance of the affected system`,
        metrics:     [
            {
                key:         `CR`,
                label:       `Confidentiality Requirement (CR)`,
                description: `Measures the importance of confidentiality to your organization`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We don't know how important confidentiality is for this system in your environment`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of confidentiality is likely to have a catastrophic adverse effect`,
                        in_other_words: `Your organization would suffer severe damage if private data were exposed`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of confidentiality is likely to have a serious adverse effect`,
                        in_other_words: `Your organization would suffer significant damage if private data were exposed`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of confidentiality is likely to have only a limited adverse effect`,
                        in_other_words: `Exposing this data would cause only minor problems for your organization`,
                    },
                ],
            },
            {
                key:         `IR`,
                label:       `Integrity Requirement (IR)`,
                description: `Measures the importance of integrity to your organization`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We don't know how important data integrity is for this system in your environment`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of integrity is likely to have a catastrophic adverse effect`,
                        in_other_words: `Your organization would suffer severe damage if data were modified or corrupted`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of integrity is likely to have a serious adverse effect`,
                        in_other_words: `Your organization would suffer significant damage if data were modified`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of integrity is likely to have only a limited adverse effect`,
                        in_other_words: `Data modification would cause only minor problems for your organization`,
                    },
                ],
            },
            {
                key:         `AR`,
                label:       `Availability Requirement (AR)`,
                description: `Measures the importance of availability to your organization`,
                options:     [
                    {
                        value:          `X`,
                        label:          `Not Defined (X)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `We don't know how important availability is for this system in your environment`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of availability is likely to have a catastrophic adverse effect`,
                        in_other_words: `Your organization would suffer severe damage if the system went down`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of availability is likely to have a serious adverse effect`,
                        in_other_words: `Your organization would suffer significant disruption if the system became unavailable`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of availability is likely to have only a limited adverse effect`,
                        in_other_words: `System downtime would cause only minor problems for your organization`,
                    },
                ],
            },
        ],
    },
];

/**
 * CVSS v2.0 Metric Data
 */
export const cvss2Metrics: Array<MetricGroup> = [
    {
        name:        `Base Metrics`,
        description: `Represent the intrinsic and fundamental characteristics of a vulnerability`,
        metrics:     [
            {
                key:         `AV`,
                label:       `Access Vector (AV)`,
                description: `Reflects how the vulnerability is exploited`,
                options:     [
                    {
                        value:          `L`,
                        label:          `Local (L)`,
                        description:    `Requires local access to the vulnerable system`,
                        in_other_words: `You must be logged in or have physical access to attack this`,
                    },
                    {
                        value:          `A`,
                        label:          `Adjacent Network (A)`,
                        description:    `Requires access to the local network`,
                        in_other_words: `The attacker must be connected to the same local network`,
                    },
                    {
                        value:          `N`,
                        label:          `Network (N)`,
                        description:    `Vulnerable to remote exploitation`,
                        in_other_words: `The vulnerability can be exploited from anywhere over the network`,
                    },
                ],
            },
            {
                key:         `AC`,
                label:       `Access Complexity (AC)`,
                description: `Measures the complexity of the attack required to exploit the vulnerability`,
                options:     [
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Specialized access conditions exist`,
                        in_other_words: `Exploitation requires unusual conditions or specific system setup`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `The access conditions are somewhat specialized`,
                        in_other_words: `Some specific conditions must be met, but they're not too rare`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `No special access conditions or extenuating circumstances exist`,
                        in_other_words: `The attack can work anytime without special conditions`,
                    },
                ],
            },
            {
                key:         `Au`,
                label:       `Authentication (Au)`,
                description: `Measures the number of times an attacker must authenticate`,
                options:     [
                    {
                        value:          `M`,
                        label:          `Multiple (M)`,
                        description:    `Requires authentication two or more times`,
                        in_other_words: `The attacker must log in multiple times to exploit this`,
                    },
                    {
                        value:          `S`,
                        label:          `Single (S)`,
                        description:    `Requires authentication one time`,
                        in_other_words: `The attacker must log in once, but after that can exploit it`,
                    },
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `Authentication is not required`,
                        in_other_words: `No login is needed; anyone can exploit this`,
                    },
                ],
            },
            {
                key:         `C`,
                label:       `Confidentiality Impact (C)`,
                description: `Measures the impact on confidentiality of a successfully exploited vulnerability`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to the confidentiality`,
                        in_other_words: `Private information stays protected`,
                    },
                    {
                        value:          `P`,
                        label:          `Partial (P)`,
                        description:    `There is considerable disclosure`,
                        in_other_words: `Some private information can be accessed`,
                    },
                    {
                        value:          `C`,
                        label:          `Complete (C)`,
                        description:    `There is total information disclosure`,
                        in_other_words: `All private information becomes visible to attackers`,
                    },
                ],
            },
            {
                key:         `I`,
                label:       `Integrity Impact (I)`,
                description: `Measures the impact to integrity of a successfully exploited vulnerability`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to the integrity`,
                        in_other_words: `Data cannot be modified`,
                    },
                    {
                        value:          `P`,
                        label:          `Partial (P)`,
                        description:    `Modification of some information is possible`,
                        in_other_words: `Some data can be altered`,
                    },
                    {
                        value:          `C`,
                        label:          `Complete (C)`,
                        description:    `There is total compromise of integrity`,
                        in_other_words: `All data can be freely modified or deleted`,
                    },
                ],
            },
            {
                key:         `A`,
                label:       `Availability Impact (A)`,
                description: `Measures the impact to availability of a successfully exploited vulnerability`,
                options:     [
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no impact to the availability`,
                        in_other_words: `The system stays operational`,
                    },
                    {
                        value:          `P`,
                        label:          `Partial (P)`,
                        description:    `There is reduced performance or interruptions`,
                        in_other_words: `The system becomes slow or partially unavailable`,
                    },
                    {
                        value:          `C`,
                        label:          `Complete (C)`,
                        description:    `There is total shutdown of the affected resource`,
                        in_other_words: `The system completely stops working`,
                    },
                ],
            },
        ],
    },
    {
        name:        `Temporal Metrics`,
        description: `Measure the current state of exploit techniques and remediation`,
        metrics:     [
            {
                key:         `E`,
                label:       `Exploitability (E)`,
                description: `Measures the current state of exploit techniques`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `No information about exploit availability`,
                    },
                    {
                        value:          `U`,
                        label:          `Unproven (U)`,
                        description:    `No exploit code is available`,
                        in_other_words: `No public exploits exist`,
                    },
                    {
                        value:          `POC`,
                        label:          `Proof-of-Concept (POC)`,
                        description:    `Proof-of-concept exploit code or technique is available`,
                        in_other_words: `Proof-of-concept code is available, showing the concept`,
                    },
                    {
                        value:          `F`,
                        label:          `Functional (F)`,
                        description:    `Functional exploit code is available`,
                        in_other_words: `Working exploit code is publicly available`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Exploitable by functional mobile autonomous code`,
                        in_other_words: `Fully autonomous exploit tools are widely available`,
                    },
                ],
            },
            {
                key:         `RL`,
                label:       `Remediation Level (RL)`,
                description: `Measures the availability of remediation steps`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `No information about available fixes`,
                    },
                    {
                        value:          `OF`,
                        label:          `Official Fix (OF)`,
                        description:    `A complete vendor solution is available`,
                        in_other_words: `The vendor has released a complete, permanent fix`,
                    },
                    {
                        value:          `TF`,
                        label:          `Temporary Fix (TF)`,
                        description:    `There is an official but temporary fix available`,
                        in_other_words: `The vendor released a temporary fix; a permanent one may come later`,
                    },
                    {
                        value:          `W`,
                        label:          `Workaround (W)`,
                        description:    `There is an unofficial, non-vendor solution available`,
                        in_other_words: `There's an unofficial workaround, but not from the vendor`,
                    },
                    {
                        value:          `U`,
                        label:          `Unavailable (U)`,
                        description:    `There is either no solution available or it is impossible to apply`,
                        in_other_words: `No fix exists or it's impossible to apply one`,
                    },
                ],
            },
            {
                key:         `RC`,
                label:       `Report Confidence (RC)`,
                description: `Measures the degree of confidence in the existence of the vulnerability`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `Uncertain whether this vulnerability really exists`,
                    },
                    {
                        value:          `UC`,
                        label:          `Unconfirmed (UC)`,
                        description:    `There is a single unconfirmed source`,
                        in_other_words: `Only one unverified report of the vulnerability`,
                    },
                    {
                        value:          `UR`,
                        label:          `Uncorroborated (UR)`,
                        description:    `There are multiple non-official sources`,
                        in_other_words: `Multiple reports exist, but none from official sources`,
                    },
                    {
                        value:          `C`,
                        label:          `Confirmed (C)`,
                        description:    `Acknowledged by the vendor or author`,
                        in_other_words: `The vendor or author has confirmed the vulnerability exists`,
                    },
                ],
            },
        ],
    },
    {
        name:        `Environmental Metrics`,
        description: `Represent the characteristics of a vulnerability that are relevant and unique to a user's environment`,
        metrics:     [
            {
                key:         `CDP`,
                label:       `Collateral Damage Potential (CDP)`,
                description: `Measures the potential for loss of life or physical assets`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `Unknown potential for physical harm or loss`,
                    },
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `There is no potential for loss`,
                        in_other_words: `No risk of physical harm or casualties`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `A successful exploit may result in slight damage`,
                        in_other_words: `Minimal potential for physical harm`,
                    },
                    {
                        value:          `LM`,
                        label:          `Low-Medium (LM)`,
                        description:    `A successful exploit may result in moderate damage`,
                        in_other_words: `Moderate potential for physical damage`,
                    },
                    {
                        value:          `MH`,
                        label:          `Medium-High (MH)`,
                        description:    `A successful exploit may result in significant damage`,
                        in_other_words: `Significant risk of physical harm or casualties`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `A successful exploit may result in catastrophic damage`,
                        in_other_words: `Severe risk of death, injury, or extensive physical damage`,
                    },
                ],
            },
            {
                key:         `TD`,
                label:       `Target Distribution (TD)`,
                description: `Measures the proportion of vulnerable systems`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `Unknown how many systems are vulnerable`,
                    },
                    {
                        value:          `N`,
                        label:          `None (N)`,
                        description:    `No target systems exist`,
                        in_other_words: `No systems in your environment are vulnerable`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Targets exist on a small scale inside the environment`,
                        in_other_words: `Only a few systems in your environment are vulnerable`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Targets exist on a medium scale`,
                        in_other_words: `A moderate number of systems in your environment are vulnerable`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Targets exist on a considerable scale`,
                        in_other_words: `Many systems in your environment are vulnerable`,
                    },
                ],
            },
            {
                key:         `CR`,
                label:       `Confidentiality Requirement (CR)`,
                description: `Measures the importance of confidentiality to your organization`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `Unknown importance of confidentiality for this system`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of confidentiality has a limited adverse effect`,
                        in_other_words: `Confidentiality loss would cause only minor problems`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of confidentiality has a serious adverse effect`,
                        in_other_words: `Confidentiality loss would cause serious problems`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of confidentiality has a catastrophic adverse effect`,
                        in_other_words: `Confidentiality loss would cause catastrophic damage`,
                    },
                ],
            },
            {
                key:         `IR`,
                label:       `Integrity Requirement (IR)`,
                description: `Measures the importance of integrity to your organization`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `Unknown importance of integrity for this system`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of integrity has a limited adverse effect`,
                        in_other_words: `Data corruption would cause only minor problems`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of integrity has a serious adverse effect`,
                        in_other_words: `Data corruption would cause serious problems`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of integrity has a catastrophic adverse effect`,
                        in_other_words: `Data corruption would cause catastrophic damage`,
                    },
                ],
            },
            {
                key:         `AR`,
                label:       `Availability Requirement (AR)`,
                description: `Measures the importance of availability to your organization`,
                options:     [
                    {
                        value:          `ND`,
                        label:          `Not Defined (ND)`,
                        description:    `Assigning this value indicates there is insufficient information`,
                        in_other_words: `Unknown importance of availability for this system`,
                    },
                    {
                        value:          `L`,
                        label:          `Low (L)`,
                        description:    `Loss of availability has a limited adverse effect`,
                        in_other_words: `System downtime would cause only minor problems`,
                    },
                    {
                        value:          `M`,
                        label:          `Medium (M)`,
                        description:    `Loss of availability has a serious adverse effect`,
                        in_other_words: `System downtime would cause serious problems`,
                    },
                    {
                        value:          `H`,
                        label:          `High (H)`,
                        description:    `Loss of availability has a catastrophic adverse effect`,
                        in_other_words: `System downtime would cause catastrophic damage`,
                    },
                ],
            },
        ],
    },
];

/**
 * Get severity rating based on score and CVSS version
 */
export function getSeverityRating(score: number, version: string): {
    label:   string
    color:   string
    bgColor: string
} {
    if (version.startsWith(`2`)) {
    // CVSS v2.0
        if (score === 0) {
            return {
                label:   `None`,
                color:   `text-sky-700 dark:text-sky-300`,
                bgColor: `bg-sky-100 dark:bg-sky-900`,
            };
        }
        if (score < 4.0) {
            return {
                label:   `Low`,
                color:   `text-green-700 dark:text-green-300`,
                bgColor: `bg-green-100 dark:bg-green-900`,
            };
        }
        if (score < 7.0) {
            return {
                label:   `Medium`,
                color:   `text-yellow-700 dark:text-yellow-300`,
                bgColor: `bg-yellow-100 dark:bg-yellow-900`,
            };
        }
        return {
            label:   `High`,
            color:   `text-red-700 dark:text-red-300`,
            bgColor: `bg-red-100 dark:bg-red-900`,
        };
    }

    // CVSS v3.x and v4.0
    if (score === 0) {
        return {
            label:   `None`,
            color:   `text-sky-700 dark:text-sky-300`,
            bgColor: `bg-sky-100 dark:bg-sky-900`,
        };
    }
    if (score < 4.0) {
        return {
            label:   `Low`,
            color:   `text-green-700 dark:text-green-300`,
            bgColor: `bg-green-100 dark:bg-green-900`,
        };
    }
    if (score < 7.0) {
        return {
            label:   `Medium`,
            color:   `text-yellow-700 dark:text-yellow-300`,
            bgColor: `bg-yellow-100 dark:bg-yellow-900`,
        };
    }
    if (score < 9.0) {
        return {
            label:   `High`,
            color:   `text-red-700 dark:text-red-300`,
            bgColor: `bg-red-100 dark:bg-red-900`,
        };
    }
    return {
        label:   `Critical`,
        color:   `text-purple-700 dark:text-purple-300`,
        bgColor: `bg-purple-100 dark:bg-purple-900`,
    };

}
