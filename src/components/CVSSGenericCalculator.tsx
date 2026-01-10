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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
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
    getSeverityRating,
    type MetricGroup
} from "@/lib/cvss/metrics-data";
import type {
    CVSSv2Metrics,
    CVSSv3Metrics,
    CVSSv4Metrics
} from "@/lib/cvss/types";
import {
    Field, FieldDescription, FieldLabel, FieldSet
} from "./ui/field";
import {
    RadioGroup, RadioGroupItem
} from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import {
    CVSS_VERSION_2_0,
    CVSS_VERSION_3_0,
    CVSS_VERSION_3_1,
    CVSS_VERSION_4_0,
    CVSS_DEFAULT_ACTIVE_GROUP,
    CVSS_VECTOR_COPIED_MESSAGE,
    CVSS_SHAREABLE_LINK_MESSAGE,
    CVSS_EMBEDDABLE_CODE_MESSAGE,
    CVSS_SCORE_SAVED_MESSAGE,
    CVSS_GRID_COLS_4,
    CVSS_GRID_COLS_3,
    CVSS_EMBED_PATH_40,
    CVSS_EMBED_PATH_2,
    CVSS_EMBED_PATH_3_PREFIX,
    CVSS_QUERY_PARAM_VECTOR,
    ZERO,
    IMPACT_FRACTION_DIGITS
} from "@/lib/constants";
import { generateEmbeddableCode } from "@/lib/embed";
import SettingsMenu from './cvss-calculator/SettingsMenu';
import ScoreCard from './cvss-calculator/ScoreCard';
import ExportMenu from './cvss-calculator/ExportMenu';
import SaveScoreDialog from './cvss-calculator/SaveScoreDialog';
import { addToHistory } from "@/lib/add-to-history";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";

type CVSSVersion = typeof CVSS_VERSION_2_0 | typeof CVSS_VERSION_3_0 | typeof CVSS_VERSION_3_1 | typeof CVSS_VERSION_4_0;

type CVSSMetrics = CVSSv2Metrics | CVSSv3Metrics | CVSSv4Metrics;

interface VersionConfig {
    metricsData:    Array<MetricGroup>
    gridCols:       number
    embedPath:      string
    defaultMetrics: CVSSMetrics
}

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
    const config = useMemo((): VersionConfig => {
        switch (version) {
            case CVSS_VERSION_4_0:
                return {
                    metricsData:    cvss40Metrics,
                    gridCols:       CVSS_GRID_COLS_4,
                    embedPath:      CVSS_EMBED_PATH_40,
                    defaultMetrics: V4_DEFAULT_METRICS,
                };
            case CVSS_VERSION_3_1:
            case CVSS_VERSION_3_0:
                return {
                    metricsData:    cvss3Metrics,
                    gridCols:       CVSS_GRID_COLS_3,
                    embedPath:      `${ CVSS_EMBED_PATH_3_PREFIX }${ version.replace(`.`, ``) }`,
                    defaultMetrics: V3_DEFAULT_METRICS,
                };
            case CVSS_VERSION_2_0:
                return {
                    metricsData:    cvss2Metrics,
                    gridCols:       CVSS_GRID_COLS_3,
                    embedPath:      CVSS_EMBED_PATH_2,
                    defaultMetrics: V2_DEFAULT_METRICS,
                };
        }
    }, [ version ]);

    const [
        metrics,
        setMetrics,
    ] = useState<CVSSMetrics>((): CVSSMetrics => {
        if (initialMetrics && Object.keys(initialMetrics).length > ZERO) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            return {
                ...config.defaultMetrics,
                ...initialMetrics,
            } as CVSSMetrics;
        }
        return config.defaultMetrics;
    });

    const [
        score,
        setScore,
    ] = useState<number>(ZERO);
    const [
        vectorString,
        setVectorString,
    ] = useState<string>(``);
    const [
        activeGroup,
        setActiveGroup,
    ] = useState(CVSS_DEFAULT_ACTIVE_GROUP);

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
        toast.success(CVSS_VECTOR_COPIED_MESSAGE);
    }, [ vectorString ]);

    const shareScore = useCallback(() => {
        const url = `${ window.location.origin }?${ CVSS_QUERY_PARAM_VECTOR }=${ encodeURIComponent(vectorString) }`;
        navigator.clipboard.writeText(url);
        toast.success(CVSS_SHAREABLE_LINK_MESSAGE);
    }, [ vectorString ]);


    const severity = useMemo(() => getSeverityRating(score, version), [
        score,
        version,
    ]);

    const shareEmbeddableCode = useCallback(() => {
        const embeddableCode = generateEmbeddableCode({
            version,
            score,
            vectorString,
            severity,
            origin: window.location.origin,
        });
        navigator.clipboard.writeText(embeddableCode);
        toast.success(CVSS_EMBEDDABLE_CODE_MESSAGE);
    }, [
        version,
        score,
        vectorString,
        severity,
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
            toast.success(CVSS_SCORE_SAVED_MESSAGE);
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
            case CVSS_VERSION_4_0:
                return calculateV4OptionImpact(
                    metrics as CVSSv4Metrics,
                    metricKey as keyof CVSSv4Metrics,
                    optionValue
                );
            case CVSS_VERSION_3_1:
            case CVSS_VERSION_3_0:
                return calculateV3OptionImpact(
                    metrics as CVSSv3Metrics,
                    metricKey as keyof CVSSv3Metrics,
                    optionValue,
                    version
                );
            case CVSS_VERSION_2_0:
                return calculateV2OptionImpact(
                    metrics as CVSSv2Metrics,
                    metricKey as keyof CVSSv2Metrics,
                    optionValue
                );
            default:
                return ZERO;
        }
    }, [
        metrics,
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
    const getTabValue = useCallback(
        (groupName: string): string => groupName.toLowerCase().replace(/\s+/g, `-`),
        []
    );

    // Helper to transform group names for display
    const getTabLabel = useCallback(
        (groupName: string): string => groupName
            .replace(`Metrics`, ``)
            .replace(`Temporal`, `Threat`),
        []
    );

    // Load activeGroup from URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const group = urlParams.get(`group`);
        if (group) {
            // Validate if group exists in config.metricsData
            const validGroups = config.metricsData.map((g) => getTabValue(g.name));
            if (validGroups.includes(group)) {
                setActiveGroup(group);
            }
        }
    }, [
        config.metricsData,
        getTabValue,
    ]);

    // Update URL when activeGroup changes
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(`group`, activeGroup);
        const newSearch = urlParams.toString();
        if (window.location.search !== `?${ newSearch }`) {
            window.history.replaceState(null, ``, `?${ newSearch }`);
        }
    }, [ activeGroup ]);

    return (
        <>
            <Toaster position="top-right" richColors theme={theme.theme} className="max-w-dvw" />
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
                        <SettingsMenu
                            shouldUseAlternativeDescription={shouldUseAlternativeDescription}
                            setShouldUseAlternativeDescription={setShouldUseAlternativeDescription}
                            shouldShowContributions={shouldShowContributions}
                            setShouldShowContributions={setShouldShowContributions}
                        />
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
                                config.metricsData.map((group) => (
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
                            config.metricsData.map((group) => (
                                <TabsContent
                                    key={group.name}
                                    value={getTabValue(group.name)}
                                    className="mt-6 space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        {group.description}
                                    </div>

                                    <div className="grid md:gap-8 gap-10">
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
                                                                        : ZERO;

                                                                const has_impact =
                                                                    shouldShowContributions &&
                                                                    !is_currently_selected;

                                                                let impactColor =
                                                                    `text-gray-500 dark:text-gray-400`;
                                                                if (has_impact) {
                                                                    if (impact > ZERO) {
                                                                        impactColor = `text-red-600
                                                                        dark:text-red-400
                                                                        border-red-300
                                                                        dark:border-red-700`;
                                                                    }
                                                                    else if (impact < ZERO) {
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
                                                                            id={`${ metric.key }-${ option.value }`}
                                                                            className="mt-1
                                                                            data-[state='checked']:border-sky-500"
                                                                        />
                                                                        <div className="flex flex-col flex-1">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <FieldLabel
                                                                                    htmlFor={`${ metric.key }-${ option.value }`}
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
                                                                                                    {impact > ZERO ? `+` : ``}
                                                                                                    {impact.toFixed(IMPACT_FRACTION_DIGITS)}
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
                    <ScoreCard
                        version={version}
                        score={score}
                        vectorString={vectorString}
                        severity={severity}
                        exportMenu={
                            <ExportMenu
                                onCopyVector={copyVector}
                                onShareScore={shareScore}
                                onShareCode={shareEmbeddableCode}
                                onSaveClick={() => set_should_save_dialog_be_open(true)}
                            />
                        }
                    />

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>
                                Never Miss an Update!
                            </CardTitle>
                            <CardDescription>
                                Get the latest updates from CyberPath, including new features,
                                articles, and cybersecurity insights delivered straight to your inbox.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="bg-foreground/90">
                                <a
                                    href="https://newsletter.cyberpath-hq.com"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Subscribe to Newsletter
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SaveScoreDialog
                open={should_save_dialog_be_open}
                onOpenChange={set_should_save_dialog_be_open}
                historyName={historyName}
                onNameChange={setHistoryName}
                onSave={handleSaveToHistory}
            />
        </>
    );
};
