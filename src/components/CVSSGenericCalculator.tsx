/**
 * Generic CVSS Calculator Component
 *
 * Unified calculator supporting all CVSS versions (v2.0, v3.0, v3.1, v4.0).
 * Features: Side-by-side layout, tabbed metrics, score contributions, real-time updates
 */

import {
    useState, useEffect,
    useCallback,
    useMemo,
    type FC
} from "react";
import {
    Card, CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    CodeXml,
    Copy, EllipsisVertical, History, Settings, Share2
} from "lucide-react";
import {
    toast, Toaster
} from "sonner";
import {
    calculateCVSSv2Score, calculateOptionImpact as calculateV2OptionImpact, DEFAULT_METRICS as V2_DEFAULT_METRICS
} from "@/lib/cvss/v2";
import {
    calculateCVSSv3Score, calculateOptionImpact as calculateV3OptionImpact, DEFAULT_METRICS as V3_DEFAULT_METRICS
} from "@/lib/cvss/v3";
import {
    calculateCVSSv4Score, calculateOptionImpact as calculateV4OptionImpact, DEFAULT_METRICS as V4_DEFAULT_METRICS
} from "@/lib/cvss/v4";
import {
    cvss2Metrics,
    cvss3Metrics,
    cvss40Metrics,
    getSeverityRating
} from "@/lib/cvss/metrics-data";
import type {
    CVSSv2Metrics,
    CVSSv3Metrics,
    CVSSv4Metrics,
    MetricGroup
} from "@/lib/cvss/types";
import {
    Field, FieldContent, FieldDescription, FieldLabel, FieldSet
} from "./ui/field";
import {
    RadioGroup, RadioGroupItem
} from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import logoWhite from "@/assets/logo-white.svg";
import logoBlack from "@/assets/logo.svg";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "./ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { addToHistory } from "../lib/add-to-history";
import { useTheme } from "@/hooks/use-theme";

type CVSSVersion = `2.0` | `3.0` | `3.1` | `4.0`;

type CVSSMetrics = CVSSv2Metrics | CVSSv3Metrics | CVSSv4Metrics;

interface CVSSGenericCalculatorProps {
    version:                            CVSSVersion
    initialMetrics?:                    Partial<CVSSMetrics>
    shouldUseAlternativeDescription:    boolean
    setShouldUseAlternativeDescription: (value: boolean) => void
    shouldShowContributions:            boolean
    setShouldShowContributions:         (value: boolean) => void
}

export const CVSSGenericCalculator: FC<CVSSGenericCalculatorProps> = ({
    version,
    initialMetrics,
    shouldUseAlternativeDescription,
    setShouldUseAlternativeDescription,
    shouldShowContributions,
    setShouldShowContributions,
}) => {
    // Get version-specific configuration
    const config = useMemo(() => {
        switch (version) {
            case `4.0`:
                return {
                    metricsData:    cvss40Metrics,
                    gridCols:       4,
                    embedPath:      `cvss40`,
                    defaultMetrics: V4_DEFAULT_METRICS,
                };
            case `3.1`:
            case `3.0`:
                return {
                    metricsData:    cvss3Metrics,
                    gridCols:       3,
                    embedPath:      `cvss3${ version.replace(`.`, ``) }`,
                    defaultMetrics: V3_DEFAULT_METRICS,
                };
            case `2.0`:
                return {
                    metricsData:    cvss2Metrics,
                    gridCols:       3,
                    embedPath:      `cvss2`,
                    defaultMetrics: V2_DEFAULT_METRICS,
                };
        }
    }, [ version ]);

    const [
        metrics,
        setMetrics,
    ] = useState<CVSSMetrics>(() => {
        if (initialMetrics && Object.keys(initialMetrics).length > 0) {
            return {
                ...config.defaultMetrics,
                ...initialMetrics,
            };
        }
        return config.defaultMetrics;
    });

    const [
        score,
        setScore,
    ] = useState<number>(0);
    const [
        vectorString,
        setVectorString,
    ] = useState<string>(``);
    const [
        activeGroup,
        setActiveGroup,
    ] = useState(`base-metrics`);

    const [
        should_save_dialog_be_open,
        set_should_save_dialog_be_open,
    ] = useState(false);
    const [
        historyName,
        setHistoryName,
    ] = useState(``);

    const updateMetric = useCallback((key: string, value: string) => {
        setMetrics((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const copyVector = useCallback(() => {
        navigator.clipboard.writeText(vectorString);
        toast.success(`Vector string copied`);
    }, [ vectorString ]);

    const shareScore = useCallback(() => {
        const url = `${ window.location.origin }?vector=${ encodeURIComponent(vectorString) }`;
        navigator.clipboard.writeText(url);
        toast.success(`Shareable link copied`);
    }, [ vectorString ]);

    const shareEmbeddableCode = useCallback(() => {
        const embeddableCode = `<iframe src="${ window.location.origin
        }/embed/${ config.embedPath }?vector=${ encodeURIComponent(vectorString)
        }" width="400" height="600" style="border:none;"></iframe>`;
        navigator.clipboard.writeText(embeddableCode);
        toast.success(`Embeddable code copied`);
    }, [
        vectorString,
        config.embedPath,
    ]);

    const handleSaveToHistory = useCallback(() => {
        if (historyName.trim()) {
            const currentSeverity = getSeverityRating(score, version);
            addToHistory({
                version,
                score,
                severity: currentSeverity.label,
                vectorString,
                name:     historyName.trim(),
            });
            toast.success(`Score saved to history`);
            set_should_save_dialog_be_open(false);
            setHistoryName(``);
        }
    }, [
        historyName,
        score,
        vectorString,
        version,
    ]);

    const calculateOptionImpact = useCallback((
        metricKey: string,
        optionValue: string
    ): number => {
        switch (version) {
            case `4.0`:
                return calculateV4OptionImpact(
                    metrics as CVSSv4Metrics,
                    metricKey as keyof CVSSv4Metrics,
                    optionValue
                );
            case `3.1`:
            case `3.0`:
                return calculateV3OptionImpact(
                    metrics as CVSSv3Metrics,
                    metricKey as keyof CVSSv3Metrics,
                    optionValue,
                    version
                );
            case `2.0`:
                return calculateV2OptionImpact(
                    metrics as CVSSv2Metrics,
                    metricKey as keyof CVSSv2Metrics,
                    optionValue
                );
            default:
                return 0;
        }
    }, [
        metrics,
        version,
    ]);

    const severity = useMemo(() => getSeverityRating(score, version), [
        score,
        version,
    ]);

    useEffect(() => {
        let result: {
            score:  number
            vector: string
        };

        switch (version) {
            case `4.0`:
                result = calculateCVSSv4Score(metrics as CVSSv4Metrics);
                break;
            case `3.1`:
            case `3.0`:
                result = calculateCVSSv3Score(metrics as CVSSv3Metrics, version);
                break;
            case `2.0`:
                result = calculateCVSSv2Score(metrics as CVSSv2Metrics);
                break;
            default:
                result = {
                    score:  0,
                    vector: ``,
                };
        }

        setScore(result.score);
        setVectorString(result.vector);
    }, [
        metrics,
        version,
    ]);

    const theme = useTheme();

    // Helper to transform group names for tabs
    const getTabValue = (groupName: string) => groupName.toLowerCase().replace(/\s+/g, `-`);

    // Helper to transform group names for display
    const getTabLabel = (groupName: string) => groupName
        .replace(`Metrics`, ``)
        .replace(`Temporal`, `Threat`);

    return (
        <>
            <Toaster position="top-right" richColors theme={theme.theme} />
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                {/* Left: Metrics */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                Configure Metrics
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Score updates in real-time
                            </p>
                        </div>
                        <div className="space-y-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={`outline`} size={`sm`}>
                                        <Settings className="size-3.5" />
                                        Settings
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="max-w-96">
                                    <DropdownMenuItem
                                        className="cursor-pointer p-3"
                                        onClick={() => document.getElementById(
                                            `alternative-descriptions`
                                        )?.click()}
                                    >
                                        <Field orientation="horizontal">
                                            <Switch
                                                onCheckedChange={setShouldUseAlternativeDescription}
                                                checked={shouldUseAlternativeDescription}
                                                id="alternative-descriptions"
                                            />
                                            <FieldContent>
                                                <FieldLabel htmlFor="alternative-descriptions">
                                                    Use Alternative Descriptions
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Toggle to switch between official not-so-clear
                                                    and alternative, more explanatory metric descriptions.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer p-3"
                                        onClick={() => document.getElementById(
                                            `show-contributions`
                                        )?.click()}
                                    >
                                        <Field orientation="horizontal">
                                            <Switch
                                                onCheckedChange={setShouldShowContributions}
                                                checked={shouldShowContributions}
                                                id="show-contributions"
                                            />
                                            <FieldContent>
                                                <FieldLabel htmlFor="show-contributions">
                                                    Show Score Contributions
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Display how much each metric option contributes
                                                    to the overall vulnerability score.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Tabs
                        value={activeGroup}
                        onValueChange={setActiveGroup}>
                        <TabsList className={cn(
                            `w-full h-10`,
                            config.gridCols === 4 && `grid-cols-4`,
                            config.gridCols === 3 && `grid-cols-3`
                        )}>
                            {
                                config.metricsData.map((group: MetricGroup) => (
                                    <TabsTrigger
                                        key={group.name}
                                        value={getTabValue(group.name)}
                                        className="text-xs"
                                    >
                                        {getTabLabel(group.name)}
                                    </TabsTrigger>
                                ))
                            }
                        </TabsList>

                        {
                            config.metricsData.map((group: MetricGroup) => (
                                <TabsContent
                                    key={group.name}
                                    value={getTabValue(group.name)}
                                    className="mt-6 space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        {group.description}
                                    </div>

                                    <div className="grid gap-5">
                                        {group.metrics.map((metric) => (
                                            <div key={metric.key} className="space-y-2">
                                                <FieldSet>
                                                    <FieldLabel>
                                                        {metric.label}
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        {metric.description}
                                                    </FieldDescription>
                                                    <RadioGroup
                                                        value={
                                                            metrics[metric.key as keyof CVSSMetrics] as string
                                                        }
                                                        onValueChange={(value) => {
                                                            updateMetric(metric.key, value);
                                                        }}
                                                    >
                                                        {
                                                            metric.options.map((option) => {
                                                                const is_currently_selected =
                                                                    metrics[
                                                                        metric.key as keyof CVSSMetrics
                                                                    ] === option.value;

                                                                // Calculate impact
                                                                const impact =
                                                                    shouldShowContributions &&
                                                                        !is_currently_selected
                                                                        ? calculateOptionImpact(
                                                                            metric.key,
                                                                            option.value
                                                                        )
                                                                        : 0;

                                                                const has_impact =
                                                                    shouldShowContributions &&
                                                                    !is_currently_selected;

                                                                let impactColor =
                                                                    `text-gray-500 dark:text-gray-400`;
                                                                if (has_impact) {
                                                                    if (impact > 0) {
                                                                        impactColor = `text-red-600
                                                                        dark:text-red-400
                                                                        border-red-300
                                                                        dark:border-red-700`;
                                                                    }
                                                                    else if (impact < 0) {
                                                                        impactColor = `text-green-600
                                                                        dark:text-green-400
                                                                        border-green-300
                                                                        dark:border-green-700`;
                                                                    }
                                                                }

                                                                return (
                                                                    <Field
                                                                        key={option.value}
                                                                        orientation="horizontal"
                                                                        className="items-start border
                                                                        rounded-md p-4 cursor-pointer
                                                                        [:has([role='radio'][data-state='checked'])]:border-sky-500
                                                                        [:has([role='radio'][data-state='checked'])]:bg-sky-500/10"
                                                                        onClick={() => {
                                                                            const element =
                                                                                document.getElementById(
                                                                                    `${ metric.key }-${ option.value
                                                                                    }`
                                                                                );
                                                                            element?.click();
                                                                        }}
                                                                    >
                                                                        <RadioGroupItem
                                                                            value={option.value}
                                                                            id={`${ metric.key }-${ option.value
                                                                            }`}
                                                                            className="mt-1
                                                                            data-[state='checked']:border-sky-500"
                                                                        />
                                                                        <div className="flex flex-col
                                                                        flex-1">
                                                                            <div className="flex
                                                                            items-center
                                                                            justify-between gap-2">
                                                                                <FieldLabel
                                                                                    htmlFor={`${ metric.key
                                                                                    }-${ option.value }`}
                                                                                    className="font-medium"
                                                                                >
                                                                                    {option.label}
                                                                                </FieldLabel>
                                                                                {shouldShowContributions && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={cn(
                                                                                            `text-xs font-mono
                                                                                            tabular-nums`,
                                                                                            is_currently_selected
                                                                                                ? `text-blue-600
                                                                                            dark:text-blue-400
                                                                                            border-blue-300
                                                                                            dark:border-blue-700`
                                                                                                : impactColor
                                                                                        )}
                                                                                    >
                                                                                        {is_currently_selected
                                                                                            ? (
                                                                                                `Current`
                                                                                            )
                                                                                            : (
                                                                                                <>
                                                                                                    {impact > 0 ? `+` : ``}
                                                                                                    {impact.toFixed(1)}
                                                                                                </>
                                                                                            )}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <FieldDescription>
                                                                                {
                                                                                    shouldUseAlternativeDescription
                                                                                        ? option.in_other_words
                                                                                        : option.description
                                                                                }
                                                                            </FieldDescription>
                                                                        </div>
                                                                    </Field>
                                                                );
                                                            })
                                                        }
                                                    </RadioGroup>
                                                </FieldSet>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))
                        }
                    </Tabs>
                </div>

                {/* Right: Sticky Score */}
                <div className="lg:sticky lg:top-20 h-fit">
                    <Card className="border-2 border-sky-500/30 shadow-lg">
                        <CardContent className="px-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-muted-foreground
                                    uppercase tracking-wider">
                                        CVSS v{version}
                                    </p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={`outline`} size={`sm`}>
                                                <EllipsisVertical className="size-3.5" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel className="text-xs">
                                                Export options
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={copyVector}>
                                                <Copy className="size-3.5 mr-2" />
                                                Copy Vector
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={shareScore}>
                                                <Share2 className="size-3.5 mr-2" />
                                                Share Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={shareEmbeddableCode}>
                                                <CodeXml className="size-3.5 mr-2" />
                                                Embeddable code
                                            </DropdownMenuItem>
                                            <DropdownMenuLabel className="text-xs">
                                                Persistence
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => set_should_save_dialog_be_open(true)
                                            }>
                                                <History className="size-3.5 mr-2" />
                                                Save to Score Manager
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-end gap-3">
                                    <div className={cn(
                                        `text-6xl font-bold tabular-nums`,
                                        severity.color
                                    )}>
                                        {score.toFixed(1)}
                                    </div>
                                    <Badge className={cn(
                                        `text-sm px-3 py-1.5 font-semibold`,
                                        severity.color,
                                        severity.bgColor
                                    )}>
                                        {severity.label}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground
                                uppercase tracking-wider">
                                    Vector
                                </p>
                                <div className="rounded-lg bg-white dark:bg-slate-900 p-3
                                font-mono text-[10px] leading-relaxed break-all border
                                border-sky-200 dark:border-sky-800 text-foreground">
                                    {vectorString}
                                </div>
                            </div>

                            <div className="mt-8 px-12">
                                {/* Light theme image */}
                                <picture className="block dark:hidden" data-light-theme>
                                    <img
                                        src={logoBlack.src}
                                        loading="lazy"
                                        alt="CyberPath Quant Logo"
                                        className="w-full h-auto"
                                    />
                                </picture>

                                {/* Dark theme image */}
                                <picture className="hidden dark:block" data-dark-theme>
                                    <img
                                        src={logoWhite.src}
                                        loading="lazy"
                                        alt="CyberPath Quant Logo"
                                        className="w-full h-auto"
                                    />
                                </picture>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog
                open={should_save_dialog_be_open}
                onOpenChange={set_should_save_dialog_be_open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Save Score to History
                        </DialogTitle>
                        <DialogDescription>
                            Enter a name for this CVSS score to save it in your history.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldLabel htmlFor="show-contributions">
                                    History Name
                                </FieldLabel>
                                <Input
                                    id="name"
                                    value={historyName}
                                    onChange={(e) => setHistoryName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === `Enter`) {
                                            handleSaveToHistory();
                                        }
                                    }}
                                    placeholder="Enter a name for this score"
                                />
                                <FieldDescription>
                                    A descriptive name to help you identify this score
                                    in your history.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => set_should_save_dialog_be_open(false)}>
                            Cancel
                        </Button>
                        <Button
                            id="save-to-history"
                            onClick={handleSaveToHistory}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
