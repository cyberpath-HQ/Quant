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
    CodeXml,
    Copy, Download, EllipsisVertical, MoreHorizontalIcon, Settings, Share2
} from "lucide-react";
import {
    toast, Toaster
} from "sonner";
import {
    calculateCVSSv4Score,
    calculateOptionImpact
} from "@/lib/cvss/v4";
import {
    cvss40Metrics, getSeverityRating
} from "@/lib/cvss/metrics-data";
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
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "./ui/dropdown-menu";

interface CVSS40CalculatorProps {
    initialMetrics?:                    Partial<CVSSv4Metrics>
    shouldUseAlternativeDescription:    boolean
    setShouldUseAlternativeDescription: (value: boolean) => void
    shouldShowContributions:            boolean
    setShouldShowContributions:         (value: boolean) => void
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
    shouldShowContributions,
    setShouldShowContributions,
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

    const shareEmbeddableCode = useCallback(() => {
        const embeddableCode = `<iframe src="${ window.location.origin }/embed/cvss40?vector=${ encodeURIComponent(vectorString) }" width="400" height="600" style="border:none;"></iframe>`;
        navigator.clipboard.writeText(embeddableCode);
        toast.success(`Embeddable code copied`);
    }, [ vectorString ]);

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Configure Metrics</h2>
                            <p className="text-sm text-muted-foreground mt-1">Score updates in real-time</p>
                        </div>
                        <div className="space-y-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={`outline`} size={`sm`}>
                                        <Settings className="size-3.5"/>
                                        Settings
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="max-w-96">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => document.getElementById(`alternative-descriptions`)?.click()}>
                                        <Field orientation="horizontal">
                                            <Switch
                                                onCheckedChange={setShouldUseAlternativeDescription}
                                                checked={shouldUseAlternativeDescription}
                                                id="alternative-descriptions" />
                                            <FieldContent>
                                                <FieldLabel htmlFor="alternative-descriptions">
                                                    Use Alternative Descriptions
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Toggle to switch between official not-so-clear and alternative, more explanatory metric descriptions.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => document.getElementById(`show-contributions`)?.click()}>
                                        <Field orientation="horizontal">
                                            <Switch
                                                onCheckedChange={setShouldShowContributions}
                                                checked={shouldShowContributions}
                                                id="show-contributions" />
                                            <FieldContent>
                                                <FieldLabel htmlFor="show-contributions">
                                                    Show Score Contributions
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Display how much each metric option contributes to the overall vulnerability score.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                                                    onValueChange={(value) => {
                                                        updateMetric(metric.key as keyof CVSSv4Metrics, value);
                                                    }}
                                                >
                                                    {
                                                        metric.options.map((option) => {
                                                            const metricKey = metric.key as keyof CVSSv4Metrics;
                                                            const isCurrentlySelected = metrics[metricKey] === option.value;

                                                            // Calculate what the score impact would be if this option is selected
                                                            const impact = shouldShowContributions && !isCurrentlySelected
                                                                ? calculateOptionImpact(metrics, metricKey, option.value)
                                                                : 0;

                                                            const hasImpact = shouldShowContributions && !isCurrentlySelected;

                                                            let impactColor = `text-gray-500 dark:text-gray-400`;
                                                            if (hasImpact) {
                                                                if (impact > 0) {
                                                                    impactColor = `text-red-600 dark:text-red-400 border-red-300 dark:border-red-700`;
                                                                }
                                                                else if (impact < 0) {
                                                                    impactColor = `text-green-600 dark:text-green-400 border-green-300 dark:border-green-700`;
                                                                }
                                                            }

                                                            return (
                                                                <Field
                                                                    key={option.value}
                                                                    orientation="horizontal"
                                                                    className="items-start border rounded-md p-4 cursor-pointer
                                                                    [:has([role='radio'][data-state='checked'])]:border-sky-500
                                                                    [:has([role='radio'][data-state='checked'])]:bg-sky-500/10"
                                                                    onClick={() => {
                                                                        const element = document.getElementById(
                                                                            `${ metricKey }-${ option.value }`
                                                                        );
                                                                        element?.click();
                                                                    }}
                                                                >
                                                                    <RadioGroupItem
                                                                        value={option.value}
                                                                        id={`${ metricKey }-${ option.value }`}
                                                                        className="mt-1 [[data-state='checked']]:border-sky-500"
                                                                    />
                                                                    <div className="flex flex-col flex-1">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <FieldLabel
                                                                                htmlFor={`${ metricKey }-${ option.value }`}
                                                                                className="font-medium"
                                                                            >
                                                                                {option.label}
                                                                            </FieldLabel>
                                                                            {shouldShowContributions && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className={cn(
                                                                                        `text-xs font-mono tabular-nums`,
                                                                                        isCurrentlySelected
                                                                                            ? `text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700`
                                                                                            : impactColor
                                                                                    )}
                                                                                >
                                                                                    {isCurrentlySelected
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
                                                                            {shouldUseAlternativeDescription
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
                        ))}
                    </Tabs>
                </div>

                {/* Right: Sticky Score */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <Card className="border-2 border-sky-500/30 shadow-lg">
                        <CardContent className="px-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CVSS v4.0</p>
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
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
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
        </>
    );
}
