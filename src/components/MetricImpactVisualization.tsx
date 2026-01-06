/**
 * Metric Impact Visualization Component
 *
 * Displays visual representation of how each metric contributes to the final CVSS score.
 * Shows base metrics grouped by category with visual indicators.
 */

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Activity, Shield, Zap
} from "lucide-react";

export interface MetricImpact {
    category: string
    metrics: Array<{
        name:        string
        short:       string
        value:       string
        description: string
        weight:      number
    }>
}

interface MetricImpactVisualizationProps {
    impacts: Array<MetricImpact>
    version: string
}

export function MetricImpactVisualization({
    impacts, version,
}: MetricImpactVisualizationProps) {
    const getCategoryIcon = (category: string) => {
        if (category.toLowerCase().includes(`exploit`)) {
            return <Zap className="h-5 w-5" />;
        }
        if (category.toLowerCase().includes(`impact`)) {
            return <Activity className="h-5 w-5" />;
        }
        return <Shield className="h-5 w-5" />;
    };

    const getCategoryColor = (category: string): string => {
        if (category.toLowerCase().includes(`exploit`)) {
            return `text-yellow-600 dark:text-yellow-400`;
        }
        if (category.toLowerCase().includes(`impact`)) {
            return `text-red-600 dark:text-red-400`;
        }
        return `text-blue-600 dark:text-blue-400`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Metric Impact Analysis
                </CardTitle>
                <CardDescription>Visual breakdown of how each metric contributes to the CVSS v{version} score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {impacts.map((category, idx) => (
                    <div key={idx} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className={getCategoryColor(category.category)}>{getCategoryIcon(category.category)}</span>
                            <h3 className="font-semibold text-lg">{category.category}</h3>
                        </div>

                        <div className="grid gap-3">
                            {category.metrics.map((metric, midx) => (
                                <div
                                    key={midx}
                                    className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{metric.name}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {metric.short}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                                    </div>

                                    <div className="ml-4 flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono">
                                            {metric.value}
                                        </Badge>
                                        {metric.weight > 0 && (
                                            <div className="flex items-center gap-1">
                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all"
                                                        style={{
                                                            width: `${ metric.weight * 100 }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {(metric.weight * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> The visualization shows the selected values for each metric. Higher weights indicate
                        greater impact on the final score.{` `}
                        {version === `4.0`
              ? `CVSS v4.0 uses MacroVector-based scoring with complex interactions between metrics.`
              : `The final score is calculated using the official CVSS formula.`}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
