/**
 * CVSS Score Manager Component
 *
 * Comprehensive management of saved CVSS scores stored in localStorage.
 * Provides advanced features for listing, sorting, comparing, editing, deleting, and restoring scores.
 * Supports diff-like comparisons, aggregate charts with advanced settings, and import/export functionality.
 */

import {
    useState, useEffect, useCallback, useRef, useMemo
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
    Field, FieldContent, FieldDescription, FieldLabel
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
    History, Trash2, RotateCcw, Download, Upload, GitCompare, Edit, ChevronUp, ChevronDown, ArrowUpDown, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import {
    STORAGE_KEY, HISTORY_UPDATE_EVENT, type ScoreHistoryEntry
} from "@/lib/add-to-history";
import { vectorParser } from "@/lib/cvss";
import dayjs from "dayjs";
import { ComparisonDialog } from "./comparison-dialog";
import { ChartDialog } from "./chart-dialog";

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_BG_COLOR_MAP: Record<string, string> = {
    none:     `bg-sky-500/10 text-sky-700 dark:text-sky-400`,
    low:      `bg-green-500/10 text-green-700 dark:text-green-400`,
    medium:   `bg-yellow-500/10 text-yellow-700 dark:text-yellow-400`,
    high:     `bg-red-500/10 text-red-700 dark:text-red-400`,
    critical: `bg-purple-500/10 text-purple-700 dark:text-purple-400`,
};

const SEVERITY_SORT_ORDER: Record<string, number> = {
    none:     0,
    low:      1,
    medium:   2,
    high:     3,
    critical: 4,
};

const UNNAMED_SCORE_NAME = `Unnamed Score`;
const IMPORTED_SCORE_NAME = `Imported Score`;
const DEFAULT_SEVERITY = `Unknown`;
const VECTOR_DATE_FORMAT = `ddd DD MMM, YYYY hh:mm`;
const EXPORT_FILENAME_PREFIX = `cvss-history-`;
const INVALID_FORMAT_ERROR = `Invalid format: expected an array`;
const IMPORT_ERROR_MESSAGE = `Failed to import: Invalid file format`;
const NO_NEW_ENTRIES_MESSAGE = `No new entries to import`;
const FAILED_PARSE_ERROR = `Failed to parse vector string`;
const ENTRY_DELETED_MESSAGE = `Entry deleted from history`;
const HISTORY_CLEARED_MESSAGE = `History cleared`;
const ENTRY_NAME_UPDATED_MESSAGE = `Entry name updated`;
const SCORE_RESTORED_MESSAGE = `Restored score: `;
const HISTORY_EXPORTED_MESSAGE = `History exported`;

// ============================================================================
// Types
// ============================================================================

type SortColumn = `score` | `severity` | null;

type SortDirection = `asc` | `desc` | `none`;

interface SortState {
    column:    SortColumn
    direction: SortDirection
}

interface EditState {
    id:   string | null
    name: string
}

interface HeaderControlsProps {
    isLoading:     boolean
    isAnySelected: boolean
    selectedCount: number
    historyCount:  number
    onCompare:     () => void
    onChart:       () => void
    onImport:      () => void
    onExport:      () => void
    onClear:       () => void
}

interface SortHeaderProps {
    column:        `score` | `severity`
    sortColumn:    SortColumn
    sortDirection: SortDirection
    onClick:       (column: `score` | `severity`) => void
    children:      string
}

interface ScoreRowProps {
    entry:          ScoreHistoryEntry
    isSelected:     boolean
    onToggleSelect: (id: string) => void
    onEdit:         (entry: ScoreHistoryEntry) => void
    onRestore:      (entry: ScoreHistoryEntry) => void
    onDelete:       (id: string) => void
}

interface EditDialogProps {
    open:         boolean
    name:         string
    onNameChange: (name: string) => void
    onSave:       () => void
    onCancel:     () => void
}

interface SearchFieldProps {
    value:    string
    onChange: (value: string) => void
}

interface EmptyStateProps {
    isLoading: boolean
}

// ============================================================================
// Sub-Components
// ============================================================================

function HeaderControls({
    isLoading,
    isAnySelected,
    selectedCount,
    historyCount,
    onCompare,
    onChart,
    onImport,
    onExport,
    onClear,
}: HeaderControlsProps) {
    if (isLoading) {
        return (
            <Button variant="outline" size="sm" disabled>
                <Upload className="h-4 w-4 mr-1" />
                Import
            </Button>
        );
    }

    if (isAnySelected) {
        return (
            <>
                <Button variant="secondary" size="sm" onClick={onCompare} disabled={selectedCount < 2}>
                    <GitCompare className="h-4 w-4 mr-1" />
                    Compare ({selectedCount})
                </Button>
                <Button variant="default" size="sm" onClick={onChart}>
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Chart ({selectedCount})
                </Button>
            </>
        );
    }

    if (historyCount > 0) {
        return (
            <>
                <Button variant="outline" size="sm" onClick={onImport}>
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                </Button>
                <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                </Button>
                <Button variant="destructive" size="sm" onClick={onClear}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                </Button>
            </>
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-1" />
            Import
        </Button>
    );
}

function SortHeader({
    column,
    sortColumn,
    sortDirection,
    onClick,
    children,
}: SortHeaderProps) {
    const isActive = sortColumn === column && sortDirection !== `none`;
    const icon = isActive
        ? (
            sortDirection === `asc`
                ? (
                    <ChevronUp className="h-4 w-4" />
                )
                : (
                    <ChevronDown className="h-4 w-4" />
                )
        )
        : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
        );

    return (
        <TableHead
            className="cursor-pointer select-none hover:bg-muted/50"
            onClick={() => onClick(column)}
        >
            <div className="flex items-center gap-1">
                {children}
                {icon}
            </div>
        </TableHead>
    );
}

function ScoreRow({
    entry,
    isSelected,
    onToggleSelect,
    onEdit,
    onRestore,
    onDelete,
}: ScoreRowProps) {
    const handleCellClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
        },
        []
    );

    return (
        <TableRow
            className={isSelected ? `bg-sky-500/5 cursor-pointer` : `cursor-pointer`}
            onClick={() => onToggleSelect(entry.id)}
        >
            <TableCell onClick={handleCellClick}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(entry.id)}
                />
            </TableCell>
            <TableCell className="font-semibold">{entry.name}</TableCell>
            <TableCell>{entry.score.toFixed(1)}</TableCell>
            <TableCell>
                <Badge
                    className={
                        SEVERITY_BG_COLOR_MAP[entry.severity.toLowerCase()] ??
                        SEVERITY_BG_COLOR_MAP.none
                    }
                >
                    {entry.severity}
                </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs max-w-xs truncate">
                {entry.vectorString}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
                {dayjs(entry.timestamp).format(VECTOR_DATE_FORMAT)}
            </TableCell>
            <TableCell onClick={handleCellClick}>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => onEdit(entry)}
                        title="Edit name"
                    >
                        <Edit className="size-3.5" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => onRestore(entry)}
                        title="Restore this score"
                    >
                        <RotateCcw className="size-3.5" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => onDelete(entry.id)}
                        title="Delete this entry"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

function EditDialog({
    open,
    name,
    onNameChange,
    onSave,
    onCancel,
}: EditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Entry Name</DialogTitle>
                    <DialogDescription>
                        Update the name for this CVSS score entry.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Field>
                        <FieldContent>
                            <FieldLabel htmlFor="edit-entry-name">
                                Entry Name
                            </FieldLabel>
                            <Input
                                id="edit-entry-name"
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                                placeholder="Enter new name..."
                            />
                            <FieldDescription className="text-xs">
                                Provide a descriptive name for this score entry.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={onSave}>Save</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SearchField({
    value, onChange,
}: SearchFieldProps) {
    return (
        <Field className="max-w-96">
            <FieldContent>
                <FieldLabel htmlFor="search-history">Search History</FieldLabel>
                <Input
                    placeholder="Search by name or score"
                    value={value}
                    id="search-history"
                    onChange={(e) => onChange(e.target.value)}
                />
                <FieldDescription className="text-xs">
                    Search your history by name or score to quickly find specific entries.
                </FieldDescription>
            </FieldContent>
        </Field>
    );
}

function EmptyState({
    isLoading,
}: EmptyStateProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner />
            </div>
        );
    }

    return (
        <p className="text-center text-sm text-muted-foreground py-8">
            No scores yet. Start calculating CVSS scores to build your collection.
        </p>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function ScoreManager() {
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
    const [
        isLoading,
        setIsLoading,
    ] = useState(true);
    const [
        search,
        setSearch,
    ] = useState(``);
    const [
        sort,
        setSort,
    ] = useState<SortState>({
        column:    null,
        direction: `none`,
    });
    const [
        edit,
        setEdit,
    ] = useState<EditState>({
        id:   null,
        name: ``,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load history from localStorage
    useEffect(() => {
        setIsLoading(true);
        const loadHistory = (): void => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as Array<Partial<ScoreHistoryEntry>>;
                    const withNames = parsed.map((entry) => ({
                        ...entry,
                        name: entry.name ?? UNNAMED_SCORE_NAME,
                    })) as Array<ScoreHistoryEntry>;
                    setHistory(withNames);
                }
            }
            catch (error) {
                console.error(`Failed to load history:`, error);
            }
            setIsLoading(false);
        };

        loadHistory();

        const handleHistoryUpdate = (): void => {
            loadHistory();
        };

        window.addEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);

        return () => {
            window.removeEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);
        };
    }, []);

    // Memoized filtered history
    const filteredHistory = useMemo(
        () => history.filter(
            (entry) => entry.name.toLowerCase().includes(search.toLowerCase()) ||
                entry.score.toString().includes(search)
        ),
        [
            history,
            search,
        ]
    );

    // Memoized sorted history
    const sortedHistory = useMemo(() => {
        const sorted = [ ...filteredHistory ].sort((a, b) => {
            if (!sort.column || sort.direction === `none`) {
                // Default sort by timestamp (newest first)
                return (
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                );
            }

            let aValue: number;
            let bValue: number;

            if (sort.column === `score`) {
                aValue = a.score;
                bValue = b.score;
            }
            else {
                aValue = SEVERITY_SORT_ORDER[a.severity.toLowerCase()] ?? 0;
                bValue = SEVERITY_SORT_ORDER[b.severity.toLowerCase()] ?? 0;
            }

            if (aValue === bValue) {
                return (
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                );
            }

            return sort.direction === `asc` ? aValue - bValue : bValue - aValue;
        });

        return sorted;
    }, [
        filteredHistory,
        sort,
    ]);

    // ========================================================================
    // Callbacks
    // ========================================================================

    const saveToStorage = useCallback(
        (data: Array<ScoreHistoryEntry>): void => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
        },
        []
    );

    const deleteEntry = useCallback(
        (id: string): void => {
            const updated = history.filter((entry) => entry.id !== id);
            setHistory(updated);
            saveToStorage(updated);
            toast.success(ENTRY_DELETED_MESSAGE);
        },
        [
            history,
            saveToStorage,
        ]
    );

    const clearHistory = useCallback((): void => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
        toast.success(HISTORY_CLEARED_MESSAGE);
    }, []);

    const startEdit = useCallback((entry: ScoreHistoryEntry): void => {
        setEdit({
            id:   entry.id,
            name: entry.name,
        });
    }, []);

    const saveEdit = useCallback((): void => {
        if (!edit.id) {
            return;
        }
        const updated = history.map((entry) => entry.id === edit.id
            ? {
                ...entry,
                name: edit.name,
            }
            : entry
        );
        setHistory(updated);
        saveToStorage(updated);
        setEdit({
            id:   null,
            name: ``,
        });
        toast.success(ENTRY_NAME_UPDATED_MESSAGE);
    }, [
        edit.id,
        edit.name,
        history,
        saveToStorage,
    ]);

    const cancelEdit = useCallback((): void => {
        setEdit({
            id:   null,
            name: ``,
        });
    }, []);

    const restoreEntry = useCallback((entry: ScoreHistoryEntry): void => {
        const parsed = vectorParser.parseVector(entry.vectorString);
        if (!parsed) {
            toast.error(FAILED_PARSE_ERROR);
            return;
        }

        const restoreEvent = new CustomEvent(`cvss-restore-vector`, {
            detail: {
                version:      parsed.version,
                metrics:      parsed.metrics,
                vectorString: entry.vectorString,
            },
        });
        window.dispatchEvent(restoreEvent);

        toast.success(`${ SCORE_RESTORED_MESSAGE }${ entry.name }`);
    }, []);

    const exportHistory = useCallback((): void => {
        const data = JSON.stringify(history, null, 2);
        const blob = new Blob([ data ], {
            type: `application/json`,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement(`a`);
        a.href = url;
        a.download = `${ EXPORT_FILENAME_PREFIX }${ Date.now() }.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(HISTORY_EXPORTED_MESSAGE);
    }, [ history ]);

    const importHistory = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>): void => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (e): void => {
                try {
                    const content = e.target?.result as string;
                    const imported = JSON.parse(content) as Array<
                        Partial<ScoreHistoryEntry>
                    >;

                    if (!Array.isArray(imported)) {
                        throw new Error(INVALID_FORMAT_ERROR);
                    }

                    const existingVectors = new Set(
                        history.map((entry) => entry.vectorString)
                    );
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                    const newEntries = imported
                        .filter((entry) => {
                            if (
                                !entry.vectorString ||
                                !entry.version ||
                                typeof entry.score !== `number`
                            ) {
                                return false;
                            }
                            return !existingVectors.has(entry.vectorString);
                        })
                        .map((entry) => ({
                            id: `${ Date.now() }-${ Math.random()
                                .toString(36)
                                .substring(2, 9) }`,
                            version:      entry.version,
                            score:        entry.score,
                            severity:     entry.severity ?? DEFAULT_SEVERITY,
                            vectorString: entry.vectorString,
                            timestamp:    entry.timestamp ?? new Date().toISOString(),
                            name:         entry.name ?? IMPORTED_SCORE_NAME,
                        })) as Array<ScoreHistoryEntry>;

                    if (newEntries.length === 0) {
                        toast.info(NO_NEW_ENTRIES_MESSAGE);
                        return;
                    }

                    const updated = [
                        ...newEntries,
                        ...history,
                    ];
                    setHistory(updated);
                    saveToStorage(updated);
                    const entryWord = newEntries.length === 1 ? `y` : `ies`;
                    toast.success(`Imported ${ newEntries.length } new entr${ entryWord }`);
                }
                catch (error) {
                    console.error(`Failed to import history:`, error);
                    toast.error(IMPORT_ERROR_MESSAGE);
                }
            };
            reader.readAsText(file);

            event.target.value = ``;
        },
        [
            history,
            saveToStorage,
        ]
    );

    const toggleSelection = useCallback((id: string): void => {
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

    const toggleAllSelection = useCallback(
        (checked: boolean): void => {
            if (checked) {
                setSelectedIds(new Set(sortedHistory.map((entry) => entry.id)));
            }
            else {
                setSelectedIds(new Set());
            }
        },
        [ sortedHistory ]
    );

    const handleSort = useCallback((column: `score` | `severity`): void => {
        setSort((prev) => {
            if (prev.column === column) {
                if (prev.direction === `none`) {
                    return {
                        column,
                        direction: `asc`,
                    };
                }
                else if (prev.direction === `asc`) {
                    return {
                        column,
                        direction: `desc`,
                    };
                }
                return {
                    column:    null,
                    direction: `none`,
                };

            }
            return {
                column,
                direction: `asc`,
            };

        });
    }, []);

    const openCompareDialog = useCallback((): void => {
        if (selectedIds.size >= 2) {
            setIsCompareDialogOpen(true);
        }
    }, [ selectedIds ]);

    // ========================================================================
    // Render
    // ========================================================================

    const selectedEntries = useMemo(
        () => history.filter((entry) => selectedIds.has(entry.id)),
        [
            history,
            selectedIds,
        ]
    );

    const descriptionText = isLoading
        ? `Loading scores...`
        : history.length > 0
            ? `Manage ${ history.length } saved CVSS score(s)`
            : `Manage your saved CVSS scores`;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            CVSS Score Manager
                        </CardTitle>
                        <CardDescription>{descriptionText}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <HeaderControls
                            isLoading={isLoading}
                            isAnySelected={selectedIds.size > 0}
                            selectedCount={selectedIds.size}
                            historyCount={history.length}
                            onCompare={openCompareDialog}
                            onChart={() => setIsChartDialogOpen(true)}
                            onImport={() => fileInputRef.current?.click()}
                            onExport={exportHistory}
                            onClear={clearHistory}
                        />
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
                {isLoading || history.length === 0
                    ? (
                        <EmptyState isLoading={isLoading} />
                    )
                    : (
                        <>
                            <div className="mb-4 flex items-center">
                                <SearchField value={search} onChange={setSearch} />
                            </div>
                            <Table containerClassName="max-h-96 overflow-auto border rounded-lg relative overscroll-contain">
                                <TableHeader className="sticky top-0 bg-background z-10 rounded-lg overflow-hidden">
                                    <TableRow className="outline outline-border">
                                        <TableHead className="w-8">
                                            <Checkbox
                                                checked={
                                                    selectedIds.size ===
                                                    sortedHistory.length &&
                                                    sortedHistory.length > 0
                                                }
                                                onCheckedChange={toggleAllSelection}
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <SortHeader
                                            column="score"
                                            sortColumn={sort.column}
                                            sortDirection={sort.direction}
                                            onClick={handleSort}
                                        >
                                            Score
                                        </SortHeader>
                                        <SortHeader
                                            column="severity"
                                            sortColumn={sort.column}
                                            sortDirection={sort.direction}
                                            onClick={handleSort}
                                        >
                                            Severity
                                        </SortHeader>
                                        <TableHead>Vector</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="w-24" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedHistory.map((entry) => (
                                        <ScoreRow
                                            key={entry.id}
                                            entry={entry}
                                            isSelected={selectedIds.has(entry.id)}
                                            onToggleSelect={toggleSelection}
                                            onEdit={startEdit}
                                            onRestore={restoreEntry}
                                            onDelete={deleteEntry}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}
            </CardContent>

            <ComparisonDialog
                open={isCompareDialogOpen}
                onOpenChange={setIsCompareDialogOpen}
                selectedEntries={selectedEntries}
                getSeverityColor={(severity: string): string => SEVERITY_BG_COLOR_MAP[severity.toLowerCase()] ??
                    SEVERITY_BG_COLOR_MAP.none
                }
            />

            <ChartDialog
                open={isChartDialogOpen}
                onOpenChange={setIsChartDialogOpen}
                selectedEntries={selectedEntries}
            />

            <EditDialog
                open={edit.id !== null}
                name={edit.name}
                onNameChange={(name) => setEdit({
                    ...edit,
                    name,
                })}
                onSave={saveEdit}
                onCancel={cancelEdit}
            />
        </Card>
    );
}
