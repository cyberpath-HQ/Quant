/**
 * CVSS v4.0 Calculator Component
 *
 * Interactive calculator for CVSS v4.0 vulnerability scoring.
 * Features: Side-by-side layout, tabbed metrics, state persistence, real-time updates
 */

import {
    useState, useEffect,
    useCallback,
    useMemo
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
    Copy, Download, Share2
} from "lucide-react";
import {
    toast, Toaster
} from "sonner";
import { calculateCVSSv4Score } from "@/lib/cvss/v4";
import {
    cvss40Metrics, getSeverityRating
} from "@/lib/cvss/metrics-data";
import { exportToPDF } from "@/lib/pdf-export";
import type { CVSSv4Metrics } from "@/lib/cvss/types";
import { dash } from "radash";
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

interface CVSS40CalculatorProps {
    initialMetrics?:                    Partial<CVSSv4Metrics>
    shouldUseAlternativeDescription:    boolean
    setShouldUseAlternativeDescription: (value: boolean) => void
}

const DEFAULT_METRICS: CVSSv4Metrics = {
    AV:  `N`,
    AC:  `L`,
    AT:  `N`,
    PR:  `N`,
    UI:  `N`,
    VC:  `N`,
    VI:  `N`,
    VA:  `N`,
    SC:  `N`,
    SI:  `N`,
    SA:  `N`,
    E:   `X`,
    CR:  `X`,
    IR:  `X`,
    AR:  `X`,
    MAV: `X`,
    MAC: `X`,
    MAT: `X`,
    MPR: `X`,
    MUI: `X`,
    MVC: `X`,
    MVI: `X`,
    MVA: `X`,
    MSC: `X`,
    MSI: `X`,
    MSA: `X`,
    S:   `X`,
    AU:  `X`,
    R:   `X`,
    V:   `X`,
    RE:  `X`,
    U:   `X`,
};

export function CVSS40Calculator({
    initialMetrics,
    shouldUseAlternativeDescription,
    setShouldUseAlternativeDescription,
}: CVSS40CalculatorProps) {
    const [
        metrics,
        setMetrics,
    ] = useState<CVSSv4Metrics>(() => {
        if (initialMetrics && Object.keys(initialMetrics).length > 0) {
            return {
                ...DEFAULT_METRICS,
                ...initialMetrics,
            };
        }
        return DEFAULT_METRICS;
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

    const updateMetric = useCallback((key: keyof CVSSv4Metrics, value: string) => {
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

    const exportPDF = useCallback(() => {
        exportToPDF({
            version:  `4.0`,
            score,
            severity: getSeverityRating(score, `4.0`).label,
            vectorString,
            metrics:  metrics as unknown as Record<string, string>,
        });
    }, [
        score,
        vectorString,
        metrics,
    ]);

    const severity = useMemo(() => getSeverityRating(score, `4.0`), [ score ]);

    useEffect(() => {
        const result = calculateCVSSv4Score(metrics);
        setScore(result.score);
        setVectorString(result.vector);
    }, [ metrics ]);

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                {/* Left: Metrics */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Configure Metrics</h2>
                        <p className="text-sm text-muted-foreground mt-1">Score updates in real-time</p>
                    </div>

                    <Tabs value={activeGroup} onValueChange={setActiveGroup}>
                        <TabsList className="w-full grid grid-cols-4 h-10">
                            {
                                cvss40Metrics.map((group) => (
                                    <TabsTrigger key={group.name} value={dash(group.name)} className="text-xs">
                                        {group.name.replace(`Metrics`, ``)}
                                    </TabsTrigger>
                                ))
                            }
                        </TabsList>

                        {cvss40Metrics.map((group) => (
                            <TabsContent key={group.name} value={dash(group.name)} className="mt-6 space-y-4">
                                <div className="text-sm text-muted-foreground">{group.description}</div>

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
                                                    value={metrics[metric.key as keyof CVSSv4Metrics] as string}
                                                    onValueChange={(value) => updateMetric(metric.key as keyof CVSSv4Metrics, value)}
                                                >
                                                    {
                                                        metric.options.map((option) => (
                                                            <Field
                                                                key={option.value}
                                                                orientation="horizontal"
                                                                className="items-start border rounded-md p-4 cursor-pointer
                                                                [:has([role='radio'][data-state='checked'])]:border-sky-500
                                                                [:has([role='radio'][data-state='checked'])]:bg-sky-500/10"
                                                                onClick={() => document.getElementById(`${ metric.key }-${ option.value }`)?.click()}
                                                            >
                                                                <RadioGroupItem
                                                                    value={option.value}
                                                                    id={`${ metric.key }-${ option.value }`}
                                                                    className="mt-1 [[data-state='checked']]:border-sky-500"/>
                                                                <div className="flex flex-col">
                                                                    <FieldLabel
                                                                        htmlFor={`${ metric.key }-${ option.value }`}
                                                                        className="font-medium">
                                                                        {option.label}
                                                                    </FieldLabel>
                                                                    <FieldDescription>
                                                                        {shouldUseAlternativeDescription ? option.in_other_words : option.description}
                                                                    </FieldDescription>
                                                                </div>
                                                            </Field>
                                                        ))
                                                    }
                                                </RadioGroup>
                                            </FieldSet>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                {/* Right: Sticky Score */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <Card className="border-2 border-sky-500/30 shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CVSS v4.0</p>
                                <div className="flex items-baseline gap-3">
                                    <div className={cn(`text-6xl font-bold tabular-nums`, severity.color)}>
                                        {score.toFixed(1)}
                                    </div>
                                    <Badge className={cn(`text-sm px-3 py-1.5 font-semibold`, severity.color, severity.bgColor)}>
                                        {severity.label}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vector</p>
                                <div className="rounded-lg bg-white dark:bg-slate-900 p-3 font-mono text-[10px] leading-relaxed break-all border border-sky-200 dark:border-sky-800 text-foreground">
                                    {vectorString}
                                </div>
                            </div>

                            <div className="grid gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={copyVector} className="justify-start h-9 text-sm">
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    Copy Vector
                                </Button>
                                <Button variant="outline" size="sm" onClick={shareScore} className="justify-start h-9 text-sm">
                                    <Share2 className="h-3.5 w-3.5 mr-2" />
                                    Share Link
                                </Button>
                                <Button variant="outline" size="sm" onClick={exportPDF} className="justify-start h-9 text-sm">
                                    <Download className="h-3.5 w-3.5 mr-2" />
                                    Export PDF
                                </Button>
                            </div>

                            <Field orientation="horizontal">
                                <Switch
                                    onCheckedChange={setShouldUseAlternativeDescription}
                                    checked={shouldUseAlternativeDescription}
                                    id="alternative-descriptions" />
                                <FieldContent onClick={() => document.getElementById(`alternative-descriptions`)?.click()}>
                                    <FieldLabel htmlFor="2fa">
                                        Use Alternative Descriptions
                                    </FieldLabel>
                                    <FieldDescription>
                                        Toggle to switch between official not-so-clear and alternative, more explanatory metric descriptions.
                                    </FieldDescription>
                                </FieldContent>
                            </Field>

                            <div>
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
        </>
    );
}
