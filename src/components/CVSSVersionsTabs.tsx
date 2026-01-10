import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function cvssVersionsTabs(): React.ReactElement {
    return (
        <Tabs defaultValue="v4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="v4">
                    v4.0
                    <Badge variant="secondary" className="ml-2 text-xs">
                        Latest
                    </Badge>
                </TabsTrigger>
                <TabsTrigger value="v3-1">v3.1</TabsTrigger>
                <TabsTrigger value="v3-0">v3.0</TabsTrigger>
                <TabsTrigger value="v2">v2.0</TabsTrigger>
            </TabsList>

            <TabsContent value="v4" className="space-y-4 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>CVSS v4.0</CardTitle>
                        <CardDescription>Latest version - Released November 2023</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            CVSS v4.0 is the latest standard from FIRST.org, introducing significant improvements to
                            vulnerability scoring methodology.
                        </p>
                        <div className="space-y-3">
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Key Features</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>MacroVector-Based Scoring:</strong> More nuanced scoring using 6 equivalence classes
                                        (EQ1-EQ6)
                                    </li>
                                    <li>
                                        <strong>Subsequent System Impact:</strong> Separate metrics for impact on downstream systems
                                        beyond the initial target
                                    </li>
                                    <li>
                                        <strong>Enhanced Supplemental Metrics:</strong> Safety, Automatable, Recovery, Automatable, and
                                        Provider Urgency
                                    </li>
                                    <li>
                                        <strong>Threat Intelligence:</strong> Incorporation of threat intelligence data
                                    </li>
                                    <li>
                                        <strong>Environmental Adjustments:</strong> More granular environmental scoring
                                    </li>
                                    <li>
                                        <strong>Environmental Adjustments:</strong> More granular environmental scoring
                                    </li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Base Metrics</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>Attack Vector (AV):</strong> Network, Adjacent, Local, Physical
                                    </li>
                                    <li>
                                        <strong>Attack Complexity (AC):</strong> Low, High
                                    </li>
                                    <li>
                                        <strong>Attack Requirements (AT):</strong> None, Present
                                    </li>
                                    <li>
                                        <strong>Privileges Required (PR):</strong> None, Low, High
                                    </li>
                                    <li>
                                        <strong>User Interaction (UI):</strong> None, Passive, Active
                                    </li>
                                    <li>
                                        <strong>Vulnerable System Confidentiality (VC):</strong> High, Low, None
                                    </li>
                                    <li>
                                        <strong>Vulnerable System Integrity (VI):</strong> High, Low, None
                                    </li>
                                    <li>
                                        <strong>Vulnerable System Availability (VA):</strong> High, Low, None
                                    </li>
                                    <li>
                                        <strong>Subsequent System Confidentiality (SC):</strong> High, Low, None
                                    </li>
                                    <li>
                                        <strong>Subsequent System Integrity (SI):</strong> High, Low, None
                                    </li>
                                    <li>
                                        <strong>Subsequent System Availability (SA):</strong> High, Low, None
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                <strong>Score Range:</strong> 0.0 - 10.0 | <strong>Qualitative Ratings:</strong> None, Low, Medium,
                                High, Critical
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="v3-1" className="space-y-4 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>CVSS v3.1</CardTitle>
                        <CardDescription>Industry standard - Released June 2019</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            CVSS v3.1 is the current industry standard, providing a comprehensive framework for assessing
                            vulnerability severity.
                        </p>
                        <div className="space-y-3">
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Key Features</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>Three Metric Groups:</strong> Base, Temporal, Environmental
                                    </li>
                                    <li>
                                        <strong>Improved Scoring:</strong> Better alignment with real-world impact
                                    </li>
                                    <li>
                                        <strong>Scope Concept:</strong> Distinguishes between Changed and Unchanged scope
                                    </li>
                                    <li>
                                        <strong>User Interaction:</strong> Accounts for required user interaction
                                    </li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Base Metrics</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>Attack Vector (AV):</strong> Network, Adjacent, Local, Physical
                                    </li>
                                    <li>
                                        <strong>Attack Complexity (AC):</strong> Low, High
                                    </li>
                                    <li>
                                        <strong>Privileges Required (PR):</strong> None, Low, High
                                    </li>
                                    <li>
                                        <strong>User Interaction (UI):</strong> None, Required
                                    </li>
                                    <li>
                                        <strong>Scope (S):</strong> Unchanged, Changed
                                    </li>
                                    <li>
                                        <strong>Confidentiality (C):</strong> None, Low, High
                                    </li>
                                    <li>
                                        <strong>Integrity (I):</strong> None, Low, High
                                    </li>
                                    <li>
                                        <strong>Availability (A):</strong> None, Low, High
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                <strong>Score Range:</strong> 0.0 - 10.0 | <strong>Qualitative Ratings:</strong> None, Low, Medium,
                                High, Critical
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="v3-0" className="space-y-4 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>CVSS v3.0</CardTitle>
                        <CardDescription>Legacy standard - Released June 2015</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            CVSS v3.0 was a major update from v2.0, introducing significant changes to the scoring system.
                        </p>
                        <div className="space-y-3">
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Key Features</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>Simplified Metrics:</strong> Reduced complexity compared to v2.0
                                    </li>
                                    <li>
                                        <strong>Scope Concept:</strong> Introduced Changed/Unchanged scope
                                    </li>
                                    <li>
                                        <strong>Base Score Focus:</strong> Emphasis on base metrics for consistency
                                    </li>
                                    <li>
                                        <strong>Temporal Metrics:</strong> Exploitability and remediation level
                                    </li>
                                    <li>
                                        <strong>Environmental Metrics:</strong> Organization-specific adjustments
                                    </li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Base Metrics</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>Attack Vector (AV):</strong> Network, Adjacent, Local, Physical
                                    </li>
                                    <li>
                                        <strong>Attack Complexity (AC):</strong> Low, High
                                    </li>
                                    <li>
                                        <strong>Authentication (Au):</strong> Multiple, Single, None
                                    </li>
                                    <li>
                                        <strong>Confidentiality (C):</strong> None, Partial, Complete
                                    </li>
                                    <li>
                                        <strong>Integrity (I):</strong> None, Partial, Complete
                                    </li>
                                    <li>
                                        <strong>Availability (A):</strong> None, Partial, Complete
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                <strong>Score Range:</strong> 0.0 - 10.0 | <strong>Qualitative Ratings:</strong> None, Low, Medium,
                                High, Critical
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="v2" className="space-y-4 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>CVSS v2.0</CardTitle>
                        <CardDescription>Legacy version - Released February 2007</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            CVSS v2.0 was the original standard, widely used for many years before being superseded by v3.0.
                        </p>
                        <div className="space-y-3">
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Key Features</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>Three Metric Groups:</strong> Base, Temporal, Environmental
                                    </li>
                                    <li>
                                        <strong>Access Vector:</strong> How vulnerability is exploited
                                    </li>
                                    <li>
                                        <strong>Access Complexity:</strong> Difficulty of exploitation
                                    </li>
                                    <li>
                                        <strong>Authentication:</strong> Required authentication level
                                    </li>
                                    <li>
                                        <strong>Impact Metrics:</strong> CIA triad impact assessment
                                    </li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Base Metrics</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        <strong>Access Vector (AV):</strong> Network, Adjacent Network, Local
                                    </li>
                                    <li>
                                        <strong>Access Complexity (AC):</strong> High, Medium, Low
                                    </li>
                                    <li>
                                        <strong>Authentication (Au):</strong> Multiple, Single, None
                                    </li>
                                    <li>
                                        <strong>Confidentiality Impact (C):</strong> None, Partial, Complete
                                    </li>
                                    <li>
                                        <strong>Integrity Impact (I):</strong> None, Partial, Complete
                                    </li>
                                    <li>
                                        <strong>Availability Impact (A):</strong> None, Partial, Complete
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                <strong>Score Range:</strong> 0.0 - 10.0 | <strong>Qualitative Ratings:</strong> Low, Medium, High
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
