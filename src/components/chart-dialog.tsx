import type { ScoreHistoryEntry } from "@/lib/add-to-history";
import {
    useCallback, useRef, useState
} from "react";
import { title as titleCase } from "radash";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "./ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
    CodeXml, Download, EllipsisVertical, Minus, Plus
} from "lucide-react";
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import logoBlack from "@/assets/logo.svg";
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "./ui/accordion";
import {
    Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet
} from "./ui/field";
import { Input } from "./ui/input";
import {
    RadioGroup, RadioGroupItem
} from "./ui/radio-group";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
    InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput
} from "./ui/input-group";
import {
    ColorPicker, ColorPickerAlphaSlider, ColorPickerArea, ColorPickerContent, ColorPickerEyeDropper, ColorPickerFormatSelect, ColorPickerHueSlider, ColorPickerInput, ColorPickerSwatch, ColorPickerTrigger
} from "./ui/color-picker";

interface ChartDialogProps {
    open:            boolean
    onOpenChange:    (open: boolean) => void
    selectedEntries: Array<ScoreHistoryEntry>
}

export function ChartDialog({
    open, onOpenChange, selectedEntries,
}: ChartDialogProps): React.ReactElement {
    const [
        chartType,
        setChartType,
    ] = useState<`bar` | `donut`>(`bar`);
    const [
        title,
        setTitle,
    ] = useState(`CVSS Scores Chart`);
    const [
        showLegend,
        setShowLegend,
    ] = useState(true);
    const [
        showXAxisLabel,
        setShowXAxisLabel,
    ] = useState(true);
    const [
        showYAxisLabel,
        setShowYAxisLabel,
    ] = useState(true);
    const [
        innerRadius,
        setInnerRadius,
    ] = useState(60);
    const [
        customColors,
        setCustomColors,
    ] = useState<Record<string, string>>({});
    const [
        exportFormat,
        setExportFormat,
    ] = useState<`png` | `webp`>(`png`);
    const [
        transparency,
        setTransparency,
    ] = useState(70);
    const [
        xAxisLabel,
        setXAxisLabel,
    ] = useState(`Severity`);
    const [
        yAxisLabel,
        setYAxisLabel,
    ] = useState(`Count`);
    const [
        tooltipLabel,
        setTooltipLabel,
    ] = useState(`Count`);
    const [
        barRadius,
        setBarRadius,
    ] = useState(5);
    const [
        severityLabels,
        setSeverityLabels,
    ] = useState<Record<string, string>>({});
    const [
        showFloatingLabels,
        setShowFloatingLabels,
    ] = useState(true);
    const chartRef = useRef<HTMLDivElement>(null);

    const allSeverities = [
        `none`,
        `low`,
        `medium`,
        `high`,
        `critical`,
    ];

    // Prepare data aggregated by severity
    const severityCounts = allSeverities.reduce((acc, sev) => {
        acc[sev] = 0;
        return acc;
    }, {} as Record<string, number>);

    selectedEntries.forEach((entry) => {
        const sev = entry.severity.toLowerCase();
        if (allSeverities.includes(sev)) {
            severityCounts[sev]++;
        }
    });

    const filteredSeverities = allSeverities.filter((sev) => severityCounts[sev] > 0);

    const severityColorMap: Record<string, string> = {
        none:     `#87CEEB`,
        low:      `#32CD32`,
        medium:   `#FFD700`,
        high:     `#FF6347`,
        critical: `#8A2BE2`,
    };

    const getColorForSeverity = (severity: string): string => {
        const baseColor = customColors[severity] || severityColorMap[severity.toLowerCase()] || `#8884d8`;

        // Convert hex to rgba with transparency
        const hex = baseColor.replace(`#`, ``);
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const alpha = transparency / 100;
        return `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`;
    };

    const barData = filteredSeverities.map((sev) => ({
        name:     severityLabels[sev] || titleCase(sev),
        count:    severityCounts[sev],
        severity: sev,
    }));

    const donutData = filteredSeverities.map((sev) => ({
        name:  severityLabels[sev] || titleCase(sev),
        value: severityCounts[sev],
        color: getColorForSeverity(sev),
    }));

    const maxCount = Math.max(...Object.values(severityCounts));
    const yTicks = Array.from(
        {
            length: maxCount + 1,
        },
        (_, i) => i
    );

    const customLegend = () => (
        <ul className={cn(`flex flex-wrap gap-4 justify-center`, chartType === `bar` && `mt-4`)}>
            {filteredSeverities.map((sev) => (
                <li key={sev} className="flex items-center gap-1">
                    <div
                        style={{
                            backgroundColor: getColorForSeverity(sev),
                        }}
                        className="w-3 h-3 rounded"
                    ></div>
                    <span className="text-sm">{severityLabels[sev] || titleCase(sev)}</span>
                </li>
            ))}
        </ul>
    );

    const exportChart = useCallback(async() => {
        if (!chartRef.current) {
            toast.error(`Chart not found`);
            return;
        }

        try {
            const domtoimage = (await import(`dom-to-image-more`)).default;

            const blob = await domtoimage.toBlob(chartRef.current, {
                bgcolor:           `#ffffff`,
                quality:           1,
                scale:             2,
                copyDefaultStyles: false,
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement(`a`);
            a.href = url;
            a.download = `cvss-chart-${ Date.now() }.${ exportFormat }`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Chart exported as ${ exportFormat.toUpperCase() }`);
        }
        catch (error) {
            console.error(`Export failed:`, error);
            toast.error(`Failed to export chart`);
        }
    }, [ exportFormat ]);

    const shareEmbeddableCode = useCallback(() => {
        const embeddableCode = `<iframe src="${ window.location.origin }/embed/chart?${ new URLSearchParams({
            chart_type:           chartType,
            title,
            show_legend:          JSON.stringify(showLegend),
            show_x_axis_label:    JSON.stringify(showXAxisLabel),
            show_y_axis_label:    JSON.stringify(showYAxisLabel),
            inner_radius:         JSON.stringify(innerRadius),
            custom_colors:        JSON.stringify(customColors),
            transparency:         JSON.stringify(transparency),
            x_axis_label:         xAxisLabel,
            y_axis_label:         yAxisLabel,
            tooltip_label:        tooltipLabel,
            bar_radius:           JSON.stringify(barRadius),
            severity_labels:      JSON.stringify(severityLabels),
            show_floating_labels: JSON.stringify(showFloatingLabels),
        }).toString() }" width="400" height="600" style="border:none;"></iframe>`;
        navigator.clipboard.writeText(embeddableCode);
        toast.success(`Embeddable code copied`);
    }, [
        chartType,
        title,
        showLegend,
        showXAxisLabel,
        showYAxisLabel,
        innerRadius,
        customColors,
        transparency,
        xAxisLabel,
        yAxisLabel,
        tooltipLabel,
        barRadius,
        severityLabels,
        showFloatingLabels,
    ]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chart Configuration</DialogTitle>
                    <DialogDescription>Customize and view charts for selected CVSS score entries.</DialogDescription>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={`outline`} size={`sm`} className="ml-auto w-min">
                                <EllipsisVertical className="size-3.5" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel className="text-xs">
                                Export options
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={exportChart}>
                                <Download className="size-3.5 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={shareEmbeddableCode}>
                                <CodeXml className="size-3.5 mr-2" />
                                Embeddable code
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DialogHeader>
                <div className="space-y-6">
                    <div ref={chartRef} className="relative">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">{title}</h3>
                        </div>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === `bar`
? (
                  <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                          dataKey="name"
                          label={
                        showXAxisLabel
                          ? {
                              value:    xAxisLabel,
                              position: `insideBottom`,
                              offset:   -5,
                          }
                          : undefined
                          }
                      />
                      <YAxis
                          type="number"
                          domain={[
                              0,
                              `dataMax`,
                          ]}
                          allowDecimals={false}
                          ticks={yTicks}
                          label={
                        showYAxisLabel
                          ? {
                              value:    yAxisLabel,
                              angle:    -90,
                              position: `insideLeft`,
                          }
                          : undefined
                          }
                      />
                      <Tooltip formatter={(value) => [
                          value,
                          tooltipLabel,
                      ]} />
                      {showLegend && <Legend content={customLegend} verticalAlign="bottom" height={36} />}
                      <Bar dataKey="count" fill="#8884d8" radius={[
                          barRadius,
                          barRadius,
                          0,
                          0,
                      ]}>
                          {barData.map((entry, index) => (
                              <Cell key={`cell-${ index }`} fill={getColorForSeverity(entry.severity)} />
                          ))}
                      </Bar>
                  </BarChart>
                )
: (
                  <PieChart>
                      <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={innerRadius}
                          labelLine={false}
                          label={
                        showFloatingLabels
                          ? ({
                              name, percent,
                          }) => `${ severityLabels[name!] ?? titleCase(name!) } ${ ((percent ?? 0) * 100).toFixed(2) }%`
                          : false
                          }
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                      >
                          {donutData.map((entry, index) => (
                              <Cell key={`cell-${ index }`} fill={entry.color} />
                          ))}
                      </Pie>
                      <Tooltip />
                      {showLegend && <Legend content={customLegend} verticalAlign="bottom" height={36} />}
                  </PieChart>
                )}
                            </ResponsiveContainer>
                        </div>
                        <img
                            src={logoBlack.src}
                            alt="CyberPath Quant Logo"
                            className="absolute top-2 right-4 h-5 pointer-events-none bg-white p-px rounded-xs"
                        />
                    </div>
                    <Accordion type="multiple">
                        <AccordionItem value="chart-settings">
                            <AccordionTrigger>
                                Chart Settings
                            </AccordionTrigger>
                            <AccordionContent className="px-3">
                                <FieldSet>
                                    <FieldDescription>Configure the appearance and data of the chart.</FieldDescription>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel>Title</FieldLabel>
                                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                                            <FieldDescription className="text-xs">
                                                Set a title for the chart to describe its content.
                                            </FieldDescription>
                                        </Field>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel>Chart Type</FieldLabel>
                                                <RadioGroup
                                                    name={`chart-type`}
                                                    onValueChange={(value: `bar` | `donut`) => setChartType(value)}
                                                    value={chartType}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="bar"
                                                            id="chart-type-bar"
                                                        />
                                                        <FieldLabel htmlFor="chart-type-bar">Bar Chart</FieldLabel>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="donut"
                                                            id="chart-type-donut"
                                                        />
                                                        <FieldLabel htmlFor="chart-type-donut">Donut Chart</FieldLabel>
                                                    </div>
                                                </RadioGroup>
                                            </Field>
                                            <Field orientation={`horizontal`}>
                                                <Switch checked={showLegend} onCheckedChange={setShowLegend} />
                                                <FieldContent>
                                                    <FieldLabel className="flex items-center gap-2">
                                                        Show Legend
                                                    </FieldLabel>
                                                    <FieldDescription className="text-xs">
                                                        Toggle the display of the chart legend.
                                                    </FieldDescription>
                                                </FieldContent>
                                            </Field>
                                        </div>

                                    </FieldGroup>
                                    <Field>
                                        <FieldLabel>Transparency</FieldLabel>
                                        <div className="flex items-center gap-4 -my-2">
                                            <Slider
                                                value={[ transparency ]}
                                                onValueChange={(value: Array<number>) => setTransparency(value[0])}
                                                max={100}
                                                min={0}
                                                step={1}
                                                className="col-span-2"
                                            />
                                            <InputGroup className="w-40">
                                                <InputGroupAddon>
                                                    <InputGroupButton
                                                        variant="secondary"
                                                        size="icon-xs"
                                                        onClick={() => setTransparency(Math.max(0, transparency - 1))}
                                                        aria-label="Decrease chart transparency by 1"
                                                    >
                                                        <Minus />
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    id="input-secure-19"
                                                    type="number"
                                                    value={transparency}
                                                    onChange={(e) => setTransparency(Math.min(100, Math.max(0, Number(e.target.value))))}
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    className="text-end"
                                                />
                                                <InputGroupAddon align={`inline-end`}>
                                                    %
                                                </InputGroupAddon>
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        variant="secondary"
                                                        size="icon-xs"
                                                        onClick={() => setTransparency(Math.min(100, transparency + 1))}
                                                        aria-label="Increase chart transparency by 1"
                                                    >
                                                        <Plus />
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                        <FieldDescription className="text-xs">
                                            Set the chart colors to {transparency}% transparency.
                                        </FieldDescription>
                                    </Field>
                                </FieldSet>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="type-specific-settings">
                            <AccordionTrigger>
                                {chartType === `bar` ? `Bar Chart Settings` : `Donut Chart Settings`}
                            </AccordionTrigger>
                            <AccordionContent className="px-3">
                                {chartType === `bar` && (
                                    <FieldSet>
                                        <FieldDescription>Customize the appearance of the bar chart.</FieldDescription>
                                        <FieldGroup className="grid grid-cols-2 gap-4">
                                            <Field orientation={`horizontal`}>
                                                <Switch checked={showXAxisLabel} onCheckedChange={setShowXAxisLabel} />
                                                <FieldContent>
                                                    <FieldLabel className="flex items-center gap-2">
                                                        Show X-Axis Label
                                                    </FieldLabel>
                                                    <FieldDescription className="text-xs">
                                                        Toggle the display of the X-Axis label.
                                                    </FieldDescription>
                                                </FieldContent>
                                            </Field>
                                            <Field orientation={`horizontal`}>
                                                <Switch checked={showYAxisLabel} onCheckedChange={setShowYAxisLabel} />
                                                <FieldContent>
                                                    <FieldLabel className="flex items-center gap-2">
                                                        Show Y-Axis Label
                                                    </FieldLabel>
                                                    <FieldDescription className="text-xs">
                                                        Toggle the display of the Y-Axis label.
                                                    </FieldDescription>
                                                </FieldContent>
                                            </Field>
                                            <Field>
                                                <FieldLabel>X-Axis Label</FieldLabel>
                                                <Input
                                                    value={xAxisLabel}
                                                    onChange={(e) => setXAxisLabel(e.target.value)} />
                                                <FieldDescription className="text-xs">
                                                    Label for the X-Axis representing severity levels.
                                                </FieldDescription>
                                            </Field>
                                            <Field>
                                                <FieldLabel>Y-Axis Label</FieldLabel>
                                                <Input
                                                    value={yAxisLabel}
                                                    onChange={(e) => setYAxisLabel(e.target.value)} />
                                                <FieldDescription className="text-xs">
                                                    Label for the Y-Axis representing frequency.
                                                </FieldDescription>
                                            </Field>
                                        </FieldGroup>

                                        <Field>
                                            <FieldContent>
                                                <FieldLabel>Tooltip Label</FieldLabel>
                                                <Input value={tooltipLabel} onChange={(e) => setTooltipLabel(e.target.value)} />
                                                <FieldDescription className="text-xs">
                                                    Label displayed in the tooltip for data points.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                        <Field>
                                            <FieldContent>
                                                <FieldLabel>Bar Top Radius</FieldLabel>
                                                <div className="flex items-center gap-4">
                                                    <Slider
                                                        value={[ barRadius ]}
                                                        onValueChange={(value: Array<number>) => setBarRadius(value[0])}
                                                        max={20}
                                                        min={0}
                                                        step={1}
                                                    />
                                                    <InputGroup className="w-42">
                                                        <InputGroupAddon>
                                                            <InputGroupButton
                                                                variant="secondary"
                                                                size="icon-xs"
                                                                onClick={() => setBarRadius(Math.max(0, barRadius - 1))}
                                                                aria-label="Decrease chart border radius by 1"
                                                            >
                                                                <Minus />
                                                            </InputGroupButton>
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            id="input-secure-19"
                                                            type="number"
                                                            value={barRadius}
                                                            onChange={(e) => setBarRadius(Math.min(20, Math.max(0, Number(e.target.value))))}
                                                            min={0}
                                                            max={20}
                                                            step={1}
                                                            className="text-end"
                                                        />
                                                        <InputGroupAddon align={`inline-end`}>
                                                            px
                                                        </InputGroupAddon>
                                                        <InputGroupAddon align="inline-end">
                                                            <InputGroupButton
                                                                variant="secondary"
                                                                size="icon-xs"
                                                                onClick={() => setBarRadius(Math.min(20, barRadius + 1))}
                                                                aria-label="Increase chart border radius by 1"
                                                            >
                                                                <Plus />
                                                            </InputGroupButton>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </div>
                                                <FieldDescription className="text-xs">
                                                    Set the border radius for the top corners of the bars to {barRadius}px
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </FieldSet>
                                )}
                                {chartType === `donut` && (
                                    <FieldSet>
                                        <FieldDescription>Customize the appearance of the donut chart.</FieldDescription>
                                        <Field>
                                            <FieldLabel>Inner Radius</FieldLabel>
                                            <div className="flex items-center gap-4">
                                                <Slider
                                                    value={[ innerRadius ]}
                                                    onValueChange={(value: Array<number>) => setInnerRadius(value[0])}
                                                    max={80}
                                                    min={0}
                                                    step={1}
                                                />
                                                <InputGroup className="w-42">
                                                    <InputGroupAddon>
                                                        <InputGroupButton
                                                            variant="secondary"
                                                            size="icon-xs"
                                                            onClick={() => setInnerRadius(Math.max(0, innerRadius - 1))}
                                                            aria-label="Decrease chart inner radius by 1"
                                                        >
                                                            <Minus />
                                                        </InputGroupButton>
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        id="input-secure-19"
                                                        type="number"
                                                        value={innerRadius}
                                                        onChange={(e) => setInnerRadius(Math.min(80, Math.max(0, Number(e.target.value))))}
                                                        min={0}
                                                        max={80}
                                                        step={1}
                                                        className="text-end"
                                                    />
                                                    <InputGroupAddon align={`inline-end`}>
                                                        %
                                                    </InputGroupAddon>
                                                    <InputGroupAddon align="inline-end">
                                                        <InputGroupButton
                                                            variant="secondary"
                                                            size="icon-xs"
                                                            onClick={() => setInnerRadius(Math.min(80, innerRadius + 1))}
                                                            aria-label="Increase chart inner radius by 1"
                                                        >
                                                            <Plus />
                                                        </InputGroupButton>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </div>
                                            <FieldDescription className="text-xs">
                                                Set the inner radius of the donut chart to {innerRadius}% of the outer radius.
                                            </FieldDescription>
                                        </Field>
                                        <Field orientation={`horizontal`}>
                                            <Switch checked={showFloatingLabels} onCheckedChange={setShowFloatingLabels} />
                                            <FieldContent>
                                                <FieldLabel className="flex items-center gap-2">
                                                    Show Floating Labels
                                                </FieldLabel>
                                                <FieldDescription className="text-xs">
                                                    Toggle the display of floating labels on the donut segments.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </FieldSet>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="customization">
                            <AccordionTrigger>
                                Customization
                            </AccordionTrigger>
                            <AccordionContent className="px-3">
                                <FieldSet>
                                    <FieldDescription>Personalize chart colors and severity labels.</FieldDescription>
                                    <div className="flex flex-col gap-4">
                                        {allSeverities.map((severity, i) => (
                                            <>
                                                <FieldSet key={severity} className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col col-span-full">
                                                        <FieldLegend className="text-sm! font-medium!">
                                                            {titleCase(severity)} Severity
                                                        </FieldLegend>
                                                        <FieldDescription className="text-xs">
                                                            Customize the color and label for {severity} severity entries.
                                                        </FieldDescription>
                                                    </div>

                                                    <Field>
                                                        <FieldLabel>Color</FieldLabel>
                                                        <ColorPicker
                                                            value={customColors[severity] || severityColorMap[severity.toLowerCase()] || `#8884d8`}
                                                            onValueChange={(e) => setCustomColors((prev) => ({
                                                                ...prev,
                                                                [severity]: e,
                                                            }))}
                                                            defaultFormat="hex"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <ColorPickerTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="flex items-center gap-2 px-3"
                                                                    >
                                                                        <ColorPickerSwatch className="size-4" />
                                                                        {customColors[severity] || severityColorMap[severity.toLowerCase()] || `#8884d8`}
                                                                    </Button>
                                                                </ColorPickerTrigger>
                                                            </div>
                                                            <ColorPickerContent>
                                                                <ColorPickerArea />
                                                                <div className="flex items-center gap-2">
                                                                    <ColorPickerEyeDropper />
                                                                    <div className="flex flex-1 flex-col gap-2">
                                                                        <ColorPickerHueSlider />
                                                                        <ColorPickerAlphaSlider />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <ColorPickerFormatSelect />
                                                                    <ColorPickerInput />
                                                                </div>
                                                            </ColorPickerContent>
                                                        </ColorPicker>
                                                    </Field>
                                                    <Field key={severity}>
                                                        <FieldLabel className="text-sm">
                                                            {titleCase(severity)} Label
                                                        </FieldLabel>
                                                        <Input
                                                            value={severityLabels[severity] || titleCase(severity)}
                                                            onChange={(e) => setSeverityLabels((prev) => ({
                                                                ...prev,
                                                                [severity]: e.target.value,
                                                            }))
                                                            }
                                                            placeholder={titleCase(severity)}
                                                        />
                                                    </Field>
                                                </FieldSet>
                                                {
                                                    i < allSeverities.length - 1 && <FieldSeparator />
                                                }
                                            </>
                                        ))}
                                    </div>
                                </FieldSet>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
}
