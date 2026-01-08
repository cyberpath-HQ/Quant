/**
 * Score History Component
 *
 * Tracks and displays previously calculated CVSS scores using localStorage.
 * Allows users to view, compare, and restore previous assessments.
 */

import {
    useState, useEffect,
    useCallback,
    useRef
} from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    History, Trash2, RotateCcw, Download, Upload
} from "lucide-react";
import { toast } from "sonner";
import {
    STORAGE_KEY, HISTORY_UPDATE_EVENT,
    type ScoreHistoryEntry
} from "@/lib/add-to-history";
import { vectorParser } from "@/lib/cvss";
import dayjs from "dayjs";

export function ScoreHistory() {
    const [
        history,
        setHistory,
    ] = useState<Array<ScoreHistoryEntry>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const deleteEntry = useCallback((id: string) => {
        const updated = history.filter((entry) => entry.id !== id);
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
        toast.success(`Entry deleted from history`);
    }, [ history ]);

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

    const importHistory = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
                const newEntries = imported.filter((entry) => {
                    // Validate required fields
                    if (!entry.vectorString || !entry.version || typeof entry.score !== `number`) {
                        return false;
                    }
                    return !existingVectors.has(entry.vectorString);
                }).map((entry) => ({
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
    }, [ history ]);

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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
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
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
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
                <div className="space-y-2 max-h-96 overflow-y-auto p-4">
                    {history.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-center justify-between rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
                        >
                            <div className="flex-1 space-y-1">
                                <h4 className="text-lg font-semibold">{entry.name}</h4>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Score: {entry.score.toFixed(1)}</span>
                                    <Badge className={getSeverityColor(entry.severity)}>{entry.severity}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                                    {entry.vectorString}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {dayjs(entry.timestamp).format(`ddd DD MMM, YYYY hh:mm`)}
                                </p>
                            </div>

                            <div className="flex gap-2 ml-4">
                                <Button
                                    variant={`secondary`}
                                    size="icon"
                                    onClick={() => restoreEntry(entry)}
                                    title="Restore this score">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={`destructive`}
                                    size="icon"
                                    onClick={() => deleteEntry(entry.id)}
                                    title="Delete this entry">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
