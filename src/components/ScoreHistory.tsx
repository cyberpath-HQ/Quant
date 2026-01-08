/**
 * Score History Component
 *
 * Tracks and displays previously calculated CVSS scores using localStorage.
 * Allows users to view, compare, and restore previous assessments.
 */

import {
    useState, useEffect, useCallback, useRef
} from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    History, Trash2, RotateCcw, Download, Upload, GitCompare, X
} from "lucide-react";
import { toast } from "sonner";
import {
    STORAGE_KEY, HISTORY_UPDATE_EVENT, type ScoreHistoryEntry
} from "@/lib/add-to-history";
import { vectorParser } from "@/lib/cvss";
import {
    cvss40Metrics, cvss3Metrics, cvss2Metrics
} from "@/lib/cvss/metrics-data";
import dayjs from "dayjs";

export function ScoreHistory() {
    const [
        history,
        setHistory,
    ] = useState<Array<ScoreHistoryEntry>>([]);
    const [
        selectedIds,
        setSelectedIds,
    ] = useState<Set<string>>(new Set());
    const [
        isCompareDialogOpen,
        setIsCompareDialogOpen,
    ] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [
        search,
        setSearch,
    ] = useState(``);

    // Load history from localStorage
    useEffect(() => {
        const loadHistory = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as Array<Partial<ScoreHistoryEntry>>;
                    const withNames = parsed.map((entry) => ({
                        ...entry,
                        name: entry.name || `Unnamed Score`,
                    })) as Array<ScoreHistoryEntry>;
                    setHistory(withNames);
                }
            }
            catch (error) {
                console.error(`Failed to load history:`, error);
            }
        };

        loadHistory();

        // Listen for history updates
        const handleHistoryUpdate = () => {
            loadHistory();
        };

        window.addEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);

        return () => {
            window.removeEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);
        };
    }, []);

    const deleteEntry = useCallback(
        (id: string) => {
            const updated = history.filter((entry) => entry.id !== id);
            setHistory(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
            toast.success(`Entry deleted from history`);
        },
        [ history ]
    );

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
        toast.success(`History cleared`);
    }, []);

    const restoreEntry = useCallback((entry: ScoreHistoryEntry) => {
    // Parse the vector string to get version and metrics
        const parsed = vectorParser.parseVector(entry.vectorString);
        if (!parsed) {
            toast.error(`Failed to parse vector string`);
            return;
        }

        // Dispatch custom event with vector data for CVSSCalculator to handle
        const restoreEvent = new CustomEvent(`cvss-restore-vector`, {
            detail: {
                version:      parsed.version,
                metrics:      parsed.metrics,
                vectorString: entry.vectorString,
            },
        });
        window.dispatchEvent(restoreEvent);

        toast.success(`Restored score: ${ entry.name }`);
    }, []);

    const exportHistory = useCallback(() => {
        const data = JSON.stringify(history, null, 2);
        const blob = new Blob([ data ], {
            type: `application/json`,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement(`a`);
        a.href = url;
        a.download = `cvss-history-${ Date.now() }.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`History exported`);
    }, [ history ]);

    const importHistory = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const imported = JSON.parse(content) as Array<Partial<ScoreHistoryEntry>>;

                    // Validate imported data
                    if (!Array.isArray(imported)) {
                        throw new Error(`Invalid format: expected an array`);
                    }

                    // Merge with existing history, avoiding duplicates by vectorString
                    const existingVectors = new Set(history.map((entry) => entry.vectorString));
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                    const newEntries = imported
                        .filter((entry) => {
                            // Validate required fields
                            if (!entry.vectorString || !entry.version || typeof entry.score !== `number`) {
                                return false;
                            }
                            return !existingVectors.has(entry.vectorString);
                        })
                        .map((entry) => ({
                            id:           `${ Date.now() }-${ Math.random().toString(36)
                                .substring(2, 9) }`,
                            version:      entry.version,
                            score:        entry.score,
                            severity:     entry.severity ?? `Unknown`,
                            vectorString: entry.vectorString,
                            timestamp:    entry.timestamp ?? new Date().toISOString(),
                            name:         entry.name ?? `Imported Score`,
                        })) as Array<ScoreHistoryEntry>;

                    if (newEntries.length === 0) {
                        toast.info(`No new entries to import`);
                        return;
                    }

                    const updated = [
                        ...newEntries,
                        ...history,
                    ];
                    setHistory(updated);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
                    toast.success(`Imported ${ newEntries.length } new entr${ newEntries.length === 1 ? `y` : `ies` }`);
                }
                catch (error) {
                    console.error(`Failed to import history:`, error);
                    toast.error(`Failed to import: Invalid file format`);
                }
            };
            reader.readAsText(file);

            // Reset file input
            event.target.value = ``;
        },
        [ history ]
    );

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            }
            else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const openCompareDialog = useCallback(() => {
        if (selectedIds.size >= 2) {
            setIsCompareDialogOpen(true);
        }
    }, [ selectedIds ]);

    const getSeverityColor = useCallback((severity: string): string => {
        switch (severity.toLowerCase()) {
            case `none`:
                return `bg-sky-500/10 text-sky-700 dark:text-sky-400`;
            case `low`:
                return `bg-green-500/10 text-green-700 dark:text-green-400`;
            case `medium`:
                return `bg-yellow-500/10 text-yellow-700 dark:text-yellow-400`;
            case `high`:
                return `bg-red-500/10 text-red-700 dark:text-red-400`;
            case `critical`:
                return `bg-purple-500/10 text-purple-700 dark:text-purple-400`;
            default:
                return `bg-gray-500/10 text-gray-700 dark:text-gray-400`;
        }
    }, []);

    const filteredHistory = history.filter(
        (entry) => entry.name.toLowerCase().includes(search.toLowerCase()) || entry.score.toString().includes(search)
    );
    const sortedHistory = [ ...filteredHistory ].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Score History
                            </CardTitle>
                            <CardDescription>Your previously calculated scores will appear here</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-1" />
                                Import
                            </Button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,application/json"
                            onChange={importHistory}
                            className="hidden"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-muted-foreground py-8">
                        No history yet. Start calculating CVSS scores to build your history.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Score History
                        </CardTitle>
                        <CardDescription>{history.length} score(s) saved locally</CardDescription>
                        {selectedIds.size === 0 && (
                            <div className="mt-2">
                                <Input
                                    placeholder="Search by name or score..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {selectedIds.size > 0
? (
              <>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                      <X className="h-4 w-4 mr-1" />
                      Clear ({selectedIds.size})
                  </Button>
                  <Button variant="default" size="sm" onClick={openCompareDialog} disabled={selectedIds.size < 2}>
                      <GitCompare className="h-4 w-4 mr-1" />
                      Compare ({selectedIds.size})
                  </Button>
              </>
            )
: (
              <>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-1" />
                      Import
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportHistory}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                  </Button>
              </>
            )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        onChange={importHistory}
                        className="hidden"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="max-h-96 overflow-y-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">Select</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Vector</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedHistory.map((entry) => {
                                const isSelected = selectedIds.has(entry.id);
                                return (
                                    <TableRow key={entry.id} className={isSelected ? `bg-sky-500/5` : ``}>
                                        <TableCell>
                                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(entry.id)} />
                                        </TableCell>
                                        <TableCell className="font-semibold">{entry.name}</TableCell>
                                        <TableCell>{entry.score.toFixed(1)}</TableCell>
                                        <TableCell>
                                            <Badge className={getSeverityColor(entry.severity)}>{entry.severity}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs max-w-xs truncate">{entry.vectorString}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {dayjs(entry.timestamp).format(`ddd DD MMM, YYYY hh:mm`)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    onClick={() => restoreEntry(entry)}
                                                    title="Restore this score"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deleteEntry(entry.id)}
                                                    title="Delete this entry"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <ComparisonDialog
                open={isCompareDialogOpen}
                onOpenChange={setIsCompareDialogOpen}
                selectedEntries={history.filter((entry) => selectedIds.has(entry.id))}
                getSeverityColor={getSeverityColor}
            />
        </Card>
    );
}

interface ComparisonDialogProps {
    open:             boolean
    onOpenChange:     (open: boolean) => void
    selectedEntries:  Array<ScoreHistoryEntry>
    getSeverityColor: (severity: string) => string
}

function ComparisonDialog({
    open, onOpenChange, selectedEntries, getSeverityColor,
}: ComparisonDialogProps) {
    if (selectedEntries.length < 2) {
        return null;
    }

    const parseMetrics = (entry: ScoreHistoryEntry) => {
        const parsed = vectorParser.parseVector(entry.vectorString);
        return parsed?.metrics;
    };

    const getMetricLabel = (key: string, version: string): string => {
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
    };

    const getMetricValueLabel = (key: string, value: string, version: string): string => {
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
                if (metric.key === key) {
                    for (const option of metric.options) {
                        if (option.value === value) {
                            return option.label;
                        }
                    }
                }
            }
        }
        return value;
    };

    const getMetricDifferences = () => {
        if (selectedEntries.length !== 2) {
            return null;
        }

        const [
            first,
            second,
        ] = selectedEntries;
        if (first.version !== second.version) {
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
    };

    const metricDifferences = getMetricDifferences();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="lg:max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GitCompare className="h-5 w-5" />
                        Score Comparison ({selectedEntries.length} scores)
                    </DialogTitle>
                    <DialogDescription>Compare CVSS scores side by side to identify differences</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="grid gap-4 grid-cols-2">
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

                    {metricDifferences && metricDifferences.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold">Metric Differences</h4>
                                <Badge variant="outline">{metricDifferences.length} changed</Badge>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted">
                                        <TableRow>
                                            <TableHead>Metric</TableHead>
                                            <TableHead>Score 1</TableHead>
                                            <TableHead>Score 2</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {metricDifferences.map((diff) => (
                                            <TableRow key={diff.key}>
                                                <TableCell className="font-semibold">
                                                    {getMetricLabel(diff.key, selectedEntries[0].version)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm bg-red-100 dark:bg-red-950 px-2 py-1 rounded">
                                                        {getMetricValueLabel(diff.key, diff.first, selectedEntries[0].version)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm bg-green-100 dark:bg-green-950 px-2 py-1 rounded">
                                                        {getMetricValueLabel(diff.key, diff.second, selectedEntries[0].version)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {selectedEntries.length === 2 && selectedEntries[0].version !== selectedEntries[1].version && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>Note:</strong> These scores use different CVSS versions ({selectedEntries[0].version} vs{` `}
                                {selectedEntries[1].version}). Metric-level comparison is only available for scores using the same
                                version.
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
}
