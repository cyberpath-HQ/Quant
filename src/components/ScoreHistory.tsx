/**
 * Score History Component
 *
 * Tracks and displays previously calculated CVSS scores using localStorage.
 * Allows users to view, compare, and restore previous assessments.
 */

import {
    useState, useEffect
} from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    History, Trash2, RotateCcw, Download
} from "lucide-react";
import { toast } from "sonner";

export interface ScoreHistoryEntry {
    id:           string
    version:      string
    score:        number
    severity:     string
    vectorString: string
    timestamp:    string
    name:         string
}

interface ScoreHistoryProps {
    onRestore?: (entry: ScoreHistoryEntry) => void
}

const STORAGE_KEY = `cvss-score-history`;
const MAX_HISTORY = 50;
const HISTORY_UPDATE_EVENT = `cvss-history-update`;

export function ScoreHistory({
    onRestore,
}: ScoreHistoryProps) {
    const [
        history,
        setHistory,
    ] = useState<Array<ScoreHistoryEntry>>([]);

    // Load history from localStorage
    useEffect(() => {
        const loadHistory = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as Array<Partial<ScoreHistoryEntry>>;
                    const withNames = parsed.map(entry => ({
                        ...entry,
                        name: entry.name || `Unnamed Score`
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

    const deleteEntry = (id: string) => {
        const updated = history.filter((entry) => entry.id !== id);
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
        toast.success(`Entry deleted from history`);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
        toast.success(`History cleared`);
    };

    const restoreEntry = (entry: ScoreHistoryEntry) => {
        if (onRestore) {
            onRestore(entry);
            toast.success(`Score restored - check the URL or reload`);
        }
    };

    const exportHistory = () => {
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
    };

    const getSeverityColor = (severity: string): string => {
        switch (severity.toLowerCase()) {
            case `none`:
                return `bg-green-500/10 text-green-700 dark:text-green-400`;
            case `low`:
                return `bg-yellow-500/10 text-yellow-700 dark:text-yellow-400`;
            case `medium`:
                return `bg-orange-500/10 text-orange-700 dark:text-orange-400`;
            case `high`:
                return `bg-red-500/10 text-red-700 dark:text-red-400`;
            case `critical`:
                return `bg-purple-500/10 text-purple-700 dark:text-purple-400`;
            default:
                return `bg-gray-500/10 text-gray-700 dark:text-gray-400`;
        }
    };

    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Score History
                    </CardTitle>
                    <CardDescription>Your previously calculated scores will appear here</CardDescription>
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
                        <Button variant="outline" size="sm" onClick={exportHistory}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={clearHistory}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear All
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">v{entry.version}</Badge>
                                    <span className="font-bold text-lg">{entry.score.toFixed(1)}</span>
                                    <Badge className={getSeverityColor(entry.severity)}>{entry.severity}</Badge>
                                </div>
                                <p className="text-sm font-medium">{entry.name}</p>
                                <p className="text-xs text-muted-foreground font-mono truncate max-w-md">{entry.vectorString}</p>
                                <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                            </div>

                            <div className="flex gap-2 ml-4">
                                <Button variant="ghost" size="icon" onClick={() => restoreEntry(entry)} title="Restore this score">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} title="Delete this entry">
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

/**
 * Add a score to history
 */
export function addToHistory(entry: Omit<ScoreHistoryEntry, `id` | `timestamp`>): void {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const history: Array<ScoreHistoryEntry> = stored ? JSON.parse(stored) : [];

        const newEntry: ScoreHistoryEntry = {
            ...entry,
            id:        `${ Date.now() }-${ Math.random().toString(36)
                .substr(2, 9) }`,
            timestamp: new Date().toISOString(),
        };

        // Add to beginning and limit to MAX_HISTORY
        const updated = [
            newEntry,
            ...history,
        ].slice(0, MAX_HISTORY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Notify other components that history has been updated
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
    }
    catch (error) {
        console.error(`Failed to save to history:`, error);
    }
}
