import type { ScoreHistoryEntry } from "@/lib/add-to-history";
import { vectorParser } from "@/lib/cvss";
import {
    cvss2Metrics,
    cvss3Metrics,
    cvss40Metrics
} from "@/lib/cvss/metrics-data";
import dayjs from "dayjs";
import { GitCompare } from "lucide-react";
import {
    useCallback, useMemo,
    type FC
} from "react";
import {
    Card, CardContent
} from "./ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "./ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "./ui/table";
import { Badge } from "./ui/badge";

interface ComparisonDialogProps {
    open:             boolean
    onOpenChange:     (open: boolean) => void
    selectedEntries:  Array<ScoreHistoryEntry>
    getSeverityColor: (severity: string) => string
}

export const ComparisonDialog: FC<ComparisonDialogProps> = ({
    open, onOpenChange, selectedEntries, getSeverityColor,
}) => {
    if (selectedEntries.length < 2) {
        return null;
    }

    const parseMetrics = useCallback((entry: ScoreHistoryEntry) => {
        const parsed = vectorParser.parseVector(entry.vectorString);
        return parsed?.metrics;
    }, []);

    const getMetricLabel = useCallback((key: string, version: string): string => {
        let metricsData;
        switch (version) {
            case `4.0`:
                metricsData = cvss40Metrics;
                break;
            case `3.1`:
            case `3.0`:
                metricsData = cvss3Metrics;
                break;
            case `2.0`:
                metricsData = cvss2Metrics;
                break;
            default:
                return key;
        }

        for (const group of metricsData) {
            for (const metric of group.metrics) {
                if (metric.key === key) {
                    return metric.label;
                }
            }
        }
        return key;
    }, []);

    const getMetricValueLabel = useCallback((key: string, value: string, version: string): string => {
        let metricsData;
        switch (version) {
            case `4.0`:
                metricsData = cvss40Metrics;
                break;
            case `3.1`:
            case `3.0`:
                metricsData = cvss3Metrics;
                break;
            case `2.0`:
                metricsData = cvss2Metrics;
                break;
            default:
                return value;
        }

        for (const group of metricsData) {
            for (const metric of group.metrics) {
                if (metric.key !== key) {
                    continue;
                }

                for (const option of metric.options) {
                    if (option.value === value) {
                        return option.label;
                    }
                }
            }
        }
        return value;
    }, []);

    const is_same_version = useMemo(() => {
        if (selectedEntries.length !== 2) {
            return false;
        }

        const [
            a,
            b,
        ] = selectedEntries;

        const [ a_major ] = a.version.split(`.`);
        const [ b_major ] = b.version.split(`.`);
        return a_major === b_major;
    }, [ selectedEntries ]);

    const getMetricDifferences = useCallback(() => {
        if (selectedEntries.length !== 2) {
            return null;
        }

        const [
            first,
            second,
        ] = selectedEntries;
        if (!is_same_version) {
            return null;
        }

        const firstMetrics = parseMetrics(first);
        const secondMetrics = parseMetrics(second);

        if (!firstMetrics || !secondMetrics) {
            return null;
        }

        const differences: Array<{ key: string
            first:                      string
            second:                     string }> = [];
        const allKeys = new Set([
            ...Object.keys(firstMetrics),
            ...Object.keys(secondMetrics),
        ]);

        for (const key of allKeys) {
            const firstValue = (firstMetrics as unknown as Record<string, string>)[key];
            const secondValue = (secondMetrics as unknown as Record<string, string>)[key];
            if (firstValue !== secondValue) {
                differences.push({
                    key,
                    first:  firstValue,
                    second: secondValue,
                });
            }
        }

        return differences;
    }, [
        parseMetrics,
        selectedEntries,
    ]);

    const metricDifferences = useMemo(() => getMetricDifferences(), [ getMetricDifferences ]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="lg:max-w-3xl w-full max-h-[80vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader className="max-w-[calc(100%-8rem)]">
                    <DialogTitle className="flex items-start md:items-center gap-2 text-balance text-left">
                        <GitCompare className="h-5 w-5" />
                        Score Comparison ({selectedEntries.length} scores)
                    </DialogTitle>
                    <DialogDescription className="text-balance text-left">
                        Compare CVSS scores side by side to identify differences
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4 max-w-[calc(100%-8rem)]">
                    {
                        selectedEntries.length === 2 && (
                            <>
                                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 overflow-hidden">
                                    {selectedEntries.map((entry, index) => (
                                        <Card key={entry.id} className="border-2">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-sm text-muted-foreground">Score {index + 1}</h4>
                                                    <h5 className="font-bold text-lg">{entry.name}</h5>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Version</span>
                                                        <Badge variant="outline">{entry.version}</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Score</span>
                                                        <span className="text-2xl font-bold">{entry.score.toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Severity</span>
                                                        <Badge className={getSeverityColor(entry.severity)}>{entry.severity}</Badge>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-sm text-muted-foreground">Vector</span>
                                                        <p className="text-xs font-mono bg-muted p-2 rounded break-all">{entry.vectorString}</p>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {dayjs(entry.timestamp).format(`MMM DD, YYYY HH:mm`)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {
                                    metricDifferences && metricDifferences.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold dark:text-foreground/95">
                                                    Metric Differences
                                                </h4>
                                                <Badge variant="outline">
                                                    {metricDifferences.length} changed
                                                </Badge>
                                            </div>
                                            <div className="rounded-lg border overflow-hidden overflow-x-auto">
                                                <Table>
                                                    <TableHeader className="bg-muted">
                                                        <TableRow>
                                                            <TableHead>
                                                                Metric
                                                            </TableHead>
                                                            <TableHead>
                                                                Score 1
                                                            </TableHead>
                                                            <TableHead>
                                                                Score 2
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {metricDifferences.map((diff) => (
                                                            <TableRow key={diff.key}>
                                                                <TableCell className="font-semibold dark:text-foreground/85">
                                                                    {getMetricLabel(diff.key, selectedEntries[0].version)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="font-mono text-sm bg-red-100 dark:bg-red-950 dark:text-red-300 px-2 py-1 rounded">
                                                                        {getMetricValueLabel(diff.key, diff.first, selectedEntries[0].version)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="font-mono text-sm bg-green-100 dark:bg-green-950 dark:text-green-300 px-2 py-1 rounded">
                                                                        {getMetricValueLabel(diff.key, diff.second, selectedEntries[0].version)}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )
                                }
                            </>
                        )
                    }

                    {selectedEntries.length === 2 && !is_same_version && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>Note:</strong> These scores use different CVSS versions ({selectedEntries[0].version} vs{` `}
                                {selectedEntries[1].version}). Metric-level comparison is only available for scores using the same
                                major version (eg. version 3.0 vs 3.1).
                            </p>
                        </div>
                    )}

                    {selectedEntries.length > 2 && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Tip:</strong> Metric-level comparison is available when comparing exactly 2 scores of the same
                                CVSS version.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
