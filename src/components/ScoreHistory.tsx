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
    Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
    History,
    Trash2,
    RotateCcw,
    Download,
    Upload,
    GitCompare,
    X,
    Edit,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    BarChart3,
    Minus,
    Plus,
    EllipsisVertical,
    CodeXml
} from "lucide-react";
import { toast } from "sonner";
import {
    STORAGE_KEY, HISTORY_UPDATE_EVENT, type ScoreHistoryEntry
} from "@/lib/add-to-history";
import { vectorParser } from "@/lib/cvss";
import dayjs from "dayjs";
import { ComparisonDialog } from "./comparison-dialog";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Label
} from "recharts";
import { cn } from "@/lib/utils";
import { title as titleCase } from "radash";
import logoBlack from "@/assets/logo.svg";
import {
    RadioGroup, RadioGroupItem
} from "./ui/radio-group";
import {
    InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput
} from "./ui/input-group";
import {
    ColorPicker, ColorPickerAlphaSlider, ColorPickerArea, ColorPickerContent, ColorPickerEyeDropper, ColorPickerFormatSelect, ColorPickerHueSlider, ColorPickerInput, ColorPickerSwatch, ColorPickerTrigger
} from "./ui/color-picker";
import {
    AccordionContent, AccordionTrigger, Accordion, AccordionItem
} from "./ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ChartDialog } from "./chart-dialog";

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
    const [
        isChartDialogOpen,
        setIsChartDialogOpen,
    ] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [
        search,
        setSearch,
    ] = useState(``);
    const [
        editingId,
        setEditingId,
    ] = useState<string | null>(null);
    const [
        editName,
        setEditName,
    ] = useState(``);
    const [
        sortColumn,
        setSortColumn,
    ] = useState<`score` | `severity` | null>(null);
    const [
        sortDirection,
        setSortDirection,
    ] = useState<`asc` | `desc` | `none`>(`none`);

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

    const startEdit = useCallback((entry: ScoreHistoryEntry) => {
        setEditingId(entry.id);
        setEditName(entry.name);
    }, []);

    const saveEdit = useCallback(() => {
        if (!editingId) {
            return;
        }
        const updated = history.map((entry) => entry.id === editingId
        ? {
            ...entry,
            name: editName,
        }
        : entry
        );
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
        setEditingId(null);
        setEditName(``);
        toast.success(`Entry name updated`);
    }, [
        editingId,
        editName,
        history,
    ]);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditName(``);
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

    const getSeveritySortValue = useCallback((severity: string): number => {
        switch (severity.toLowerCase()) {
            case `none`:
                return 0;
            case `low`:
                return 1;
            case `medium`:
                return 2;
            case `high`:
                return 3;
            case `critical`:
                return 4;
            default:
                return 0;
        }
    }, []);

    const handleSort = useCallback(
        (column: `score` | `severity`) => {
            if (sortColumn === column) {
                if (sortDirection === `none`) {
                    setSortDirection(`asc`);
                }
                else if (sortDirection === `asc`) {
                    setSortDirection(`desc`);
                }
                else {
                    setSortDirection(`none`);
                }
            }
            else {
                setSortColumn(column);
                setSortDirection(`asc`);
            }
        },
        [
            sortColumn,
            sortDirection,
        ]
    );

    const getSortIcon = useCallback(
        (column: `score` | `severity`) => {
            if (sortColumn === column && sortDirection !== `none`) {
                return sortDirection === `asc` ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
            }
            return <ArrowUpDown className="h-4 w-4 opacity-50" />;
        },
        [
            sortColumn,
            sortDirection,
        ]
    );

    const filteredHistory = history.filter(
        (entry) => entry.name.toLowerCase().includes(search.toLowerCase()) || entry.score.toString().includes(search)
    );
    const sortedHistory = [ ...filteredHistory ].sort((a, b) => {
        if (!sortColumn || sortDirection === `none`) {
            // Default sort by timestamp (newest first)
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }

        let aValue: number;
        let bValue: number;

        if (sortColumn === `score`) {
            aValue = a.score;
            bValue = b.score;
        }
        else {
            // severity
            aValue = getSeveritySortValue(a.severity);
            bValue = getSeveritySortValue(b.severity);
        }

        if (aValue === bValue) {
            // Secondary sort by timestamp
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }

        return sortDirection === `asc` ? aValue - bValue : bValue - aValue;
    });

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
                  <Button variant="secondary" size="sm" onClick={() => setIsChartDialogOpen(true)}>
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Chart ({selectedIds.size})
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
                <div className="mb-4 flex items-center">
                    <Field className="max-w-96">
                        <FieldContent>
                            <FieldLabel htmlFor="search-history">Search History</FieldLabel>
                            <Input
                                placeholder="Search by name or score"
                                value={search}
                                id="search-history"
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FieldDescription className="text-xs">
                                Search your history by name or score to quickly find specific entries.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </div>
                <div className="max-h-96 overflow-y-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8">
                                    <Checkbox
                                        checked={selectedIds.size === sortedHistory.length && sortedHistory.length > 0}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedIds(new Set(sortedHistory.map((entry) => entry.id)));
                                            }
                                            else {
                                                setSelectedIds(new Set());
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => handleSort(`score`)}>
                                    <div className="flex items-center gap-1">
                                        Score
                                        {getSortIcon(`score`)}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none hover:bg-muted/50"
                                    onClick={() => handleSort(`severity`)}
                                >
                                    <div className="flex items-center gap-1">
                                        Severity
                                        {getSortIcon(`severity`)}
                                    </div>
                                </TableHead>
                                <TableHead>Vector</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedHistory.map((entry) => {
                                const isSelected = selectedIds.has(entry.id);
                                return (
                                    <TableRow
                                        key={entry.id}
                                        className={isSelected ? `bg-sky-500/5 cursor-pointer` : `cursor-pointer`}
                                        onClick={() => toggleSelection(entry.id)}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-2">
                                                <Button variant="secondary" size="icon-sm" onClick={() => startEdit(entry)} title="Edit name">
                                                    <Edit className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="icon-sm"
                                                    onClick={() => restoreEntry(entry)}
                                                    title="Restore this score"
                                                >
                                                    <RotateCcw className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    onClick={() => deleteEntry(entry.id)}
                                                    title="Delete this entry"
                                                >
                                                    <Trash2 className="size-3.5" />
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

            <ChartDialog
                open={isChartDialogOpen}
                onOpenChange={setIsChartDialogOpen}
                selectedEntries={history.filter((entry) => selectedIds.has(entry.id))}
            />

            <Dialog open={editingId !== null} onOpenChange={(open) => !open && cancelEdit()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Entry Name</DialogTitle>
                        <DialogDescription>Update the name for this CVSS score entry.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Field>
                            <FieldContent>
                                <FieldLabel htmlFor="edit-entry-name">Entry Name</FieldLabel>
                                <Input
                                    id="edit-entry-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter new name..."
                                />
                                <FieldDescription className="text-xs">
                                    Provide a descriptive name for this score entry.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={cancelEdit}>
                                Cancel
                            </Button>
                            <Button onClick={saveEdit}>Save</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
