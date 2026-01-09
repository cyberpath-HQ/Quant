import React, {
    useCallback, useEffect, useMemo, useRef, useState,
    type FC
} from "react";
import type { ScoreHistoryEntry } from "@/lib/add-to-history";
import {
    debounce,
    title as titleCase
} from "radash";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    ALL_SEVERITIES,
    SEVERITY_COLOR_MAP,
    ZERO,
    UNIT,
    TRANSPARENCY_MIN,
    TRANSPARENCY_MAX,
    BAR_RADIUS_MIN,
    BAR_RADIUS_MAX,
    INNER_RADIUS_MIN,
    INNER_RADIUS_MAX,
    DEFAULT_INNER_RADIUS,
    DEFAULT_TRANSPARENCY,
    DEFAULT_BAR_RADIUS,
    RGB_RED_START,
    RGB_RED_END,
    RGB_GREEN_START,
    RGB_GREEN_END,
    RGB_BLUE_START,
    RGB_BLUE_END,
    HUNDRED,
    THROTTLE_DELAY,
    DEFAULT_FRACTION_DIGITS,
    BAR_CHART_DEFAULT_LEFT_MARGIN,
    BAR_CHART_DEFAULT_BOTTOM_MARGIN,
    BAR_CHART_FALLBACK_BOTTOM_MARGIN,
    BAR_CHART_X_AXIS_DEFAULT_OFFSET,
    BAR_CHART_X_AXIS_FALLBACK_OFFSET,
    BAR_CHART_Y_AXIS_FALLBACK_WIDTH,
    CHART_DIALOG_SETTINGS_KEY,
    CHART_NOT_FOUND_MESSAGE,
    EXPORT_FAILED_MESSAGE,
    EXPORT_SUCCESS_MESSAGE,
    EMBED_CODE_COPIED_MESSAGE,
    CHART_FILENAME_PREFIX,
    CHART_FILENAME_SUFFIX,
    DARK_THEME_BGCOLOR,
    LIGHT_THEME_BGCOLOR,
    EXPORT_SCALE,
    EXPORT_QUALITY,
    EMBED_IFRAME_WIDTH,
    EMBED_IFRAME_HEIGHT,
    EMBED_IFRAME_STYLE,
    SHOULD_COPY_DEFAULT_STYLES,
    DEFAULT_SETTINGS,
    CHART_TYPE_BAR,
    CHART_TYPE_DONUT,
    LEGEND_POSITION_BELOW_TITLE,
    LEGEND_POSITION_BELOW_CHART,
    TOOLTIP_CONTENT_TYPE_COUNT,
    TOOLTIP_CONTENT_TYPE_PERCENTAGE,
    ACCORDION_VALUE_CHART_SETTINGS,
    ACCORDION_VALUE_TYPE_SPECIFIC_SETTINGS,
    DONUT_CHART_OUTER_RADIUS,
    DONUT_CHART_DEFAULT_COLOR,
    BAR_CHART_DEFAULT_COLOR,
    CARTESIAN_GRID_STROKE_DASHARRAY,
    CHART_AXIS_POSITION_BOTTOM,
    CHART_AXIS_POSITION_INSIDE_LEFT,
    CHART_AXIS_POSITION_ANGLE,
    PIE_CHART_POSITION_PERCENT,
    LOGO_ALT_TEXT,
    IMAGE_LOADING_LAZY,
    BAR_CHART_SETTINGS_TITLE,
    DONUT_CHART_SETTINGS_TITLE
} from "@/lib/constants";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "./ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
    CodeXml, Download, EllipsisVertical, Minus, Plus
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import logoBlack from "@/assets/logo.svg";
import logoWhite from "@/assets/logo-white.svg";
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "./ui/accordion";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet
} from "./ui/field";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
    InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput
} from "./ui/input-group";
import {
    ColorPicker,
    ColorPickerAlphaSlider,
    ColorPickerArea,
    ColorPickerContent,
    ColorPickerEyeDropper,
    ColorPickerFormatSelect,
    ColorPickerHueSlider,
    ColorPickerInput,
    ColorPickerSwatch,
    ColorPickerTrigger
} from "./ui/color-picker";
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from "./ui/select";
import { Spinner } from "./ui/spinner";
import { useTheme } from "@/hooks/use-theme";

interface ChartDialogProps {
    open:            boolean
    onOpenChange:    (open: boolean) => void
    selectedEntries: Array<ScoreHistoryEntry>
}

interface ChartSettingsProps {
    chart_type:               `bar` | `donut`
    set_chart_type:           (value: `bar` | `donut`) => void
    title:                    string
    set_title:                (value: string) => void
    show_legend:              boolean
    set_show_legend:          (value: boolean) => void
    legend_position:          `below-title` | `below-chart`
    set_legend_position:      (value: `below-title` | `below-chart`) => void
    tooltip_content_type:     `count` | `percentage`
    set_tooltip_content_type: (value: `count` | `percentage`) => void
    transparency:             number
    set_transparency:         (value: number) => void
    localTransparency:        number
    setLocalTransparency:     (value: number) => void
}

const ChartSettings = React.memo<ChartSettingsProps>(({
    chart_type,
    set_chart_type,
    title,
    set_title,
    show_legend,
    set_show_legend,
    legend_position,
    set_legend_position,
    tooltip_content_type,
    set_tooltip_content_type,
    transparency,
    set_transparency,
    localTransparency,
    setLocalTransparency,
}) => (
    <AccordionItem value={ACCORDION_VALUE_CHART_SETTINGS}>
        <AccordionTrigger>Chart Settings</AccordionTrigger>
        <AccordionContent className="px-3">
            <FieldSet>
                <FieldDescription>
                    Configure the appearance and data of the chart.
                </FieldDescription>
                <FieldGroup>
                    <Field>
                        <FieldLabel>
                            Title
                        </FieldLabel>
                        <Input
                            value={title}
                            onChange={(e) => set_title(e.target.value)} />
                        <FieldDescription className="text-xs">
                            Set a title for the chart to describe its content.
                        </FieldDescription>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>
                                Chart Type
                            </FieldLabel>
                            <Select
                                value={chart_type}
                                onValueChange={set_chart_type}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select chart type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            Chart Type
                                        </SelectLabel>
                                        <SelectItem value={CHART_TYPE_BAR}>
                                            Bar Chart
                                        </SelectItem>
                                        <SelectItem value={CHART_TYPE_DONUT}>
                                            Donut Chart
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FieldDescription className="text-xs">
                                Choose between a bar chart or a donut chart to visualize the data.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>
                                Tooltip Content
                            </FieldLabel>
                            <Select
                                value={tooltip_content_type}
                                onValueChange={set_tooltip_content_type}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select tooltip content" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            Tooltip Content
                                        </SelectLabel>
                                        <SelectItem value={TOOLTIP_CONTENT_TYPE_COUNT}>
                                            Count
                                        </SelectItem>
                                        <SelectItem value={TOOLTIP_CONTENT_TYPE_PERCENTAGE}>
                                            Percentage
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FieldDescription className="text-xs">
                                Choose whether the tooltip displays count or percentage values.
                            </FieldDescription>
                        </Field>
                        <Field
                            orientation={`horizontal`}
                            className="self-center cursor-pointer"
                            onClick={() => set_show_legend(!show_legend)}>
                            <Switch
                                checked={show_legend}
                                onCheckedChange={set_show_legend}
                                className="cursor-pointer"
                                onClick={(e) => e.stopPropagation()} />
                            <FieldContent>
                                <FieldLabel className="flex items-center gap-2 cursor-pointer">
                                    Show Legend
                                </FieldLabel>
                                <FieldDescription className="text-xs">
                                    Toggle the display of the chart legend.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                        <Field>
                            <FieldLabel>
                                Legend Position
                            </FieldLabel>
                            <Select
                                value={legend_position}
                                onValueChange={set_legend_position}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a legend position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            Legend Position
                                        </SelectLabel>
                                        <SelectItem value={LEGEND_POSITION_BELOW_TITLE}>
                                            Below Title
                                        </SelectItem>
                                        <SelectItem value={LEGEND_POSITION_BELOW_CHART}>
                                            Below Chart
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FieldDescription className="text-xs">
                                Select the position of the legend in relation to the chart.
                            </FieldDescription>
                        </Field>
                    </div>
                </FieldGroup>
                <Field>
                    <FieldLabel>
                        Transparency
                    </FieldLabel>
                    <div className="flex items-center gap-4 -my-2">
                        <Slider
                            value={[ localTransparency ]}
                            onValueChange={(value: Array<number>) => {
                                const [ newVal ] = value;
                                setLocalTransparency(newVal);
                                set_transparency(newVal);
                            }}
                            max={TRANSPARENCY_MAX}
                            min={TRANSPARENCY_MIN}
                            step={UNIT}
                            className="col-span-2"
                        />
                        <InputGroup className="w-40">
                            <InputGroupAddon>
                                <InputGroupButton
                                    variant="secondary"
                                    size="icon-xs"
                                    onClick={() => set_transparency(Math.max(TRANSPARENCY_MIN, transparency - UNIT))}
                                    aria-label="Decrease chart transparency by 1"
                                >
                                    <Minus />
                                </InputGroupButton>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="input-secure-19"
                                type="number"
                                value={localTransparency}
                                onChange={(e) => {
                                    const newVal = Math.min(TRANSPARENCY_MAX, Math.max(TRANSPARENCY_MIN, Number(e.target.value)));
                                    setLocalTransparency(newVal);
                                    set_transparency(newVal);
                                }}
                                min={TRANSPARENCY_MIN}
                                max={TRANSPARENCY_MAX}
                                step={UNIT}
                                className="text-end"
                            />
                            <InputGroupAddon align={`inline-end`}>%</InputGroupAddon>
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    variant="secondary"
                                    size="icon-xs"
                                    onClick={() => set_transparency(Math.min(TRANSPARENCY_MAX, transparency + UNIT))}
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
));

interface TypeSpecificSettingsProps {
    chart_type:                  `bar` | `donut`
    show_x_axis_label:           boolean
    set_show_x_axis_label:       (value: boolean) => void
    show_y_axis_label:           boolean
    set_show_y_axis_label:       (value: boolean) => void
    show_x_axis_tick_labels:     boolean
    set_show_x_axis_tick_labels: (value: boolean) => void
    x_axis_label:                string
    set_x_axis_label:            (value: string) => void
    y_axis_label:                string
    set_y_axis_label:            (value: string) => void
    tooltip_label:               string
    set_tooltip_label:           (value: string) => void
    bar_radius:                  number
    set_bar_radius:              (value: number) => void
    localBarRadius:              number
    setLocalBarRadius:           (value: number) => void
    inner_radius:                number
    set_inner_radius:            (value: number) => void
    localInnerRadius:            number
    setLocalInnerRadius:         (value: number) => void
    show_floating_labels:        boolean
    set_show_floating_labels:    (value: boolean) => void
    floating_label_type:         `count` | `percentage`
    set_floating_label_type:     (value: `count` | `percentage`) => void
}

const TypeSpecificSettings = React.memo<TypeSpecificSettingsProps>(({
    chart_type,
    show_x_axis_label,
    set_show_x_axis_label,
    show_y_axis_label,
    set_show_y_axis_label,
    show_x_axis_tick_labels,
    set_show_x_axis_tick_labels,
    x_axis_label,
    set_x_axis_label,
    y_axis_label,
    set_y_axis_label,
    tooltip_label,
    set_tooltip_label,
    bar_radius,
    set_bar_radius,
    inner_radius,
    set_inner_radius,
    localBarRadius,
    setLocalBarRadius,
    localInnerRadius,
    setLocalInnerRadius,
    show_floating_labels,
    set_show_floating_labels,
    floating_label_type,
    set_floating_label_type,
}) => (
    <AccordionItem value={ACCORDION_VALUE_TYPE_SPECIFIC_SETTINGS}>
        <AccordionTrigger>
            {
                chart_type === CHART_TYPE_BAR
                ? BAR_CHART_SETTINGS_TITLE
                : DONUT_CHART_SETTINGS_TITLE
            }
        </AccordionTrigger>
        <AccordionContent className="px-3">
            {
                chart_type === CHART_TYPE_BAR && (
                    <FieldSet>
                        <FieldDescription>
                            Customize the appearance of the bar chart.
                        </FieldDescription>
                        <div className="grid grid-cols-2 gap-4">
                            <FieldGroup className="col-span-full grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-4">
                                    <Field orientation={`horizontal`}
                                        className="cursor-pointer"
                                        onClick={() => set_show_x_axis_label(!show_x_axis_label)}>
                                        <Switch
                                            checked={show_x_axis_label}
                                            onCheckedChange={set_show_x_axis_label}
                                            className="cursor-pointer"
                                            onClick={(e) => e.stopPropagation()} />
                                        <FieldContent>
                                            <FieldLabel className="flex items-center gap-2 cursor-pointer">
                                                Show X-Axis Label
                                            </FieldLabel>
                                            <FieldDescription className="text-xs">
                                                Toggle the display of the X-Axis label.
                                            </FieldDescription>
                                        </FieldContent>
                                    </Field>
                                    <Field orientation={`horizontal`}
                                        className="cursor-pointer"
                                        onClick={() => set_show_x_axis_tick_labels(!show_x_axis_tick_labels)}>
                                        <Switch
                                            checked={show_x_axis_tick_labels}
                                            onCheckedChange={set_show_x_axis_tick_labels}
                                            className="cursor-pointer"
                                            onClick={(e) => e.stopPropagation()} />
                                        <FieldContent>
                                            <FieldLabel className="flex items-center gap-2 cursor-pointer">
                                                Show X-Axis Tick Labels
                                            </FieldLabel>
                                            <FieldDescription className="text-xs">
                                                Toggle the display of tick labels on the X-axis.
                                            </FieldDescription>
                                        </FieldContent>
                                    </Field>
                                </div>
                                <Field className="self-start">
                                    <FieldLabel>
                                        X-Axis Label
                                    </FieldLabel>
                                    <Input
                                        value={x_axis_label}
                                        disabled={!show_x_axis_label}
                                        onChange={(e) => set_x_axis_label(e.target.value)}
                                    />
                                    <FieldDescription className="text-xs">
                                        Label for the X-Axis representing severity levels.
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                            <FieldSeparator className="col-span-full" />
                            <FieldGroup className="col-span-full grid grid-cols-2 gap-4">
                                <Field orientation={`horizontal`}
                                    className="cursor-pointer"
                                    onClick={() => set_show_y_axis_label(!show_y_axis_label)}>
                                    <Switch
                                        checked={show_y_axis_label}
                                        onCheckedChange={set_show_y_axis_label}
                                        className="cursor-pointer"
                                        onClick={(e) => e.stopPropagation()} />
                                    <FieldContent>
                                        <FieldLabel className="flex items-center gap-2 cursor-pointer">
                                            Show Y-Axis Label
                                        </FieldLabel>
                                        <FieldDescription className="text-xs">
                                            Toggle the display of the Y-Axis label.
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel>
                                        Y-Axis Label
                                    </FieldLabel>
                                    <Input
                                        value={y_axis_label}
                                        disabled={!show_y_axis_label}
                                        onChange={(e) => set_y_axis_label(e.target.value)}
                                    />
                                    <FieldDescription className="text-xs">
                                        Label for the Y-Axis representing frequency.
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </div>
                        <Field>
                            <FieldLabel>
                                Tooltip Label
                            </FieldLabel>
                            <Input
                                value={tooltip_label}
                                onChange={(e) => set_tooltip_label(e.target.value)}
                            />
                            <FieldDescription className="text-xs">
                                Label displayed in the tooltip for data points.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldContent>
                                <FieldLabel>
                                    Bar Top Radius
                                </FieldLabel>
                                <div className="flex items-center gap-4">
                                    <Slider
                                        value={[ localBarRadius ]}
                                        onValueChange={(value: Array<number>) => {
                                            const [ newVal ] = value;
                                            setLocalBarRadius(newVal);
                                            set_bar_radius(newVal);
                                        }}
                                        max={BAR_RADIUS_MAX}
                                        min={BAR_RADIUS_MIN}
                                        step={UNIT}
                                    />
                                    <InputGroup className="w-42">
                                        <InputGroupAddon>
                                            <InputGroupButton
                                                variant="secondary"
                                                size="icon-xs"
                                                onClick={() => {
                                                    const newVal = Math.max(BAR_RADIUS_MIN, localBarRadius - UNIT);
                                                    setLocalBarRadius(newVal);
                                                    set_bar_radius(newVal);
                                                }}
                                                aria-label="Decrease chart border radius by 1"
                                            >
                                                <Minus />
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            id="input-secure-19"
                                            type="number"
                                            value={localBarRadius}
                                            onChange={(e) => {
                                                const newVal = Math.min(BAR_RADIUS_MAX, Math.max(BAR_RADIUS_MIN, Number(e.target.value)));
                                                setLocalBarRadius(newVal);
                                                set_bar_radius(newVal);
                                            }}
                                            min={BAR_RADIUS_MIN}
                                            max={BAR_RADIUS_MAX}
                                            step={UNIT}
                                            className="text-end"
                                        />
                                        <InputGroupAddon align={`inline-end`}>
                                            px
                                        </InputGroupAddon>
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                variant="secondary"
                                                size="icon-xs"
                                                onClick={() => {
                                                    const newVal = Math.min(BAR_RADIUS_MAX, localBarRadius + UNIT);
                                                    setLocalBarRadius(newVal);
                                                    set_bar_radius(newVal);
                                                }}
                                                aria-label="Increase chart border radius by 1"
                                            >
                                                <Plus />
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                                <FieldDescription className="text-xs">
                                    Set the border radius for the top corners of the bars to {bar_radius}px
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    </FieldSet>
                )
            }
            {
                chart_type === CHART_TYPE_DONUT && (
                    <FieldSet>
                        <FieldDescription>
                            Customize the appearance of the donut chart.
                        </FieldDescription>
                        <Field>
                            <FieldLabel>
                                Inner Radius
                            </FieldLabel>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={[ localInnerRadius ]}
                                    onValueChange={(value: Array<number>) => {
                                        const [ newVal ] = value;
                                        setLocalInnerRadius(newVal);
                                        set_inner_radius(newVal);
                                    }}
                                    max={INNER_RADIUS_MAX}
                                    min={INNER_RADIUS_MIN}
                                    step={UNIT}
                                />
                                <InputGroup className="w-42">
                                    <InputGroupAddon>
                                        <InputGroupButton
                                            variant="secondary"
                                            size="icon-xs"
                                            onClick={() => {
                                                const newVal = Math.max(INNER_RADIUS_MIN, localInnerRadius - UNIT);
                                                setLocalInnerRadius(newVal);
                                                set_inner_radius(newVal);
                                            }}
                                            aria-label="Decrease chart inner radius by 1"
                                        >
                                            <Minus />
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="input-secure-19"
                                        type="number"
                                        value={localInnerRadius}
                                        onChange={(e) => {
                                            const newVal = Math.min(INNER_RADIUS_MAX, Math.max(INNER_RADIUS_MIN, Number(e.target.value)));
                                            setLocalInnerRadius(newVal);
                                            set_inner_radius(newVal);
                                        }}
                                        min={INNER_RADIUS_MIN}
                                        max={INNER_RADIUS_MAX}
                                        step={UNIT}
                                        className="text-end"
                                    />
                                    <InputGroupAddon align={`inline-end`}>
                                        %
                                    </InputGroupAddon>
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                            variant="secondary"
                                            size="icon-xs"
                                            onClick={() => {
                                                const newVal = Math.min(INNER_RADIUS_MAX, localInnerRadius + UNIT);
                                                setLocalInnerRadius(newVal);
                                                set_inner_radius(newVal);
                                            }}
                                            aria-label="Increase chart inner radius by 1"
                                        >
                                            <Plus />
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                            <FieldDescription className="text-xs">
                                Set the inner radius of the donut chart to {inner_radius}% of the outer radius.
                            </FieldDescription>
                        </Field>
                        <div className="grid grid-cols-2">
                            <Field orientation={`horizontal`}
                                className="self-center cursor-pointer"
                                onClick={() => set_show_floating_labels(!show_floating_labels)}>
                                <Switch
                                    checked={show_floating_labels}
                                    onCheckedChange={set_show_floating_labels}
                                    className="cursor-pointer"
                                    onClick={(e) => e.stopPropagation()} />
                                <FieldContent>
                                    <FieldLabel className="flex items-center gap-2 cursor-pointer">
                                        Show Floating Labels
                                    </FieldLabel>
                                    <FieldDescription className="text-xs">
                                        Toggle the display of floating labels on the donut segments.
                                    </FieldDescription>
                                </FieldContent>
                            </Field>
                            <Field>
                                <FieldLabel>
                                    Floating Label Content
                                </FieldLabel>
                                <Select
                                    value={floating_label_type}
                                    onValueChange={set_floating_label_type}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select floating label content" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>
                                                Floating Label Content
                                            </SelectLabel>
                                            <SelectItem value="count">
                                                Count</SelectItem>
                                            <SelectItem value="percentage">
                                                Percentage
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldDescription className="text-xs">
                                    Choose whether floating labels display count or percentage values.
                                </FieldDescription>
                            </Field>
                        </div>
                    </FieldSet>
                )}
        </AccordionContent>
    </AccordionItem>
));

interface CustomizationProps {
    custom_colors:       Record<string, string>
    set_custom_colors:   (updater: (prev: Record<string, string>) => Record<string, string>) => void
    severity_labels:     Record<string, string>
    set_severity_labels: (updater: (prev: Record<string, string>) => Record<string, string>) => void
}

const Customization = React.memo<CustomizationProps>(({
    custom_colors, set_custom_colors, severity_labels, set_severity_labels,
}) => {
    const severity_colors = useMemo(
        () => ALL_SEVERITIES.reduce(
            (acc, severity) => {
                acc[severity] = custom_colors[severity] || SEVERITY_COLOR_MAP[severity.toLowerCase()] || BAR_CHART_DEFAULT_COLOR;
                return acc;
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            {} as Record<typeof ALL_SEVERITIES[number], string>
        ),
        [
            custom_colors,
            SEVERITY_COLOR_MAP,
        ]
    );

    return (
        <AccordionItem value="customization">
            <AccordionTrigger>
                Customization
            </AccordionTrigger>
            <AccordionContent className="px-3">
                <FieldSet>
                    <FieldDescription>
                        Personalize chart colors and severity labels.
                    </FieldDescription>
                    <div className="flex flex-col gap-4">
                        {
                            ALL_SEVERITIES.map((severity, i) => (
                                <>
                                    <FieldSet
                                        key={severity}
                                        className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col col-span-full">
                                            <FieldLegend className="text-sm! font-medium!">
                                                {titleCase(severity)} Severity
                                            </FieldLegend>
                                            <FieldDescription className="text-xs">
                                                Customize the color and label for {severity} severity entries.
                                            </FieldDescription>
                                        </div>

                                        <Field>
                                            <FieldLabel>
                                                Color
                                            </FieldLabel>
                                            <ColorPicker
                                                value={severity_colors[severity]}
                                                onValueChange={(e) => set_custom_colors((prev) => ({
                                                    ...prev,
                                                    [severity]: e,
                                                }))
                                                }
                                                defaultFormat="hex"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ColorPickerTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="flex items-center gap-2 px-3">
                                                            <ColorPickerSwatch className="size-4" />
                                                            {severity_colors[severity]}
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
                                                value={severity_labels[severity] || titleCase(severity)}
                                                onChange={(e) => set_severity_labels((prev) => ({
                                                    ...prev,
                                                    [severity]: e.target.value,
                                                }))
                                                }
                                                placeholder={titleCase(severity)}
                                            />
                                        </Field>
                                    </FieldSet>
                                    {i < ALL_SEVERITIES.length - UNIT && <FieldSeparator />}
                                </>
                            ))}
                    </div>
                </FieldSet>
            </AccordionContent>
        </AccordionItem>
    );
});

export const ChartDialog: FC<ChartDialogProps> = ({
    open, onOpenChange, selectedEntries,
}) => {
    const [
        settings,
        setSettings,
    ] = useState(DEFAULT_SETTINGS);
    const [
        should_show_loading,
        setShouldShowLoading,
    ] = useState(true);
    const chart_ref = useRef<HTMLDivElement>(null);

    const [
        localTransparency,
        setLocalTransparency,
    ] = useState(DEFAULT_TRANSPARENCY);
    const [
        localBarRadius,
        setLocalBarRadius,
    ] = useState(DEFAULT_BAR_RADIUS);
    const [
        localInnerRadius,
        setLocalInnerRadius,
    ] = useState(DEFAULT_INNER_RADIUS);

    const throttledSetTransparency = useMemo(
        () => debounce(
            {
                delay: THROTTLE_DELAY,
            },
            (value: number) => setSettings((prev) => ({
                ...prev,
                transparency: value,
            }))
        ),
        []
    );
    const throttledSetBarRadius = useMemo(
        () => debounce(
            {
                delay: THROTTLE_DELAY,
            },
            (value: number) => setSettings((prev) => ({
                ...prev,
                bar_radius: value,
            }))
        ),
        []
    );
    const throttledSetInnerRadius = useMemo(
        () => debounce(
            {
                delay: THROTTLE_DELAY,
            },
            (value: number) => setSettings((prev) => ({
                ...prev,
                inner_radius: value,
            }))
        ),
        []
    );

    useEffect(() => {
        const saved = localStorage.getItem(CHART_DIALOG_SETTINGS_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings((prev) => ({
                    ...prev,
                    ...parsed,
                }));
            }
            catch (e) {
                console.error(`Failed to parse chart settings`, e);
            }
        }
        setShouldShowLoading(false);
    }, []);

    useEffect(() => {
        localStorage.setItem(CHART_DIALOG_SETTINGS_KEY, JSON.stringify(settings));
    }, [ settings ]);

    const {
        chart_type,
        title,
        should_show_legend,
        should_show_x_axis_label,
        should_show_y_axis_label,
        inner_radius,
        custom_colors,
        transparency,
        x_axis_label,
        y_axis_label,
        tooltip_label,
        bar_radius,
        severity_labels,
        should_show_floating_labels,
        tooltip_content_type,
        floating_label_type,
        should_show_x_axis_tick_labels,
        legend_position,
    } = settings;

    useEffect(() => setLocalTransparency(transparency), [ transparency ]);
    useEffect(() => setLocalBarRadius(bar_radius), [ bar_radius ]);
    useEffect(() => setLocalInnerRadius(inner_radius), [ inner_radius ]);

    const severity_counts = useMemo(() => {
        const counts = ALL_SEVERITIES.reduce((acc, sev) => {
            acc[sev] = 0;
            return acc;
        }, {} as Record<string, number>);
        selectedEntries.forEach((entry) => {
            const sev = entry.severity.toLowerCase();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            if (ALL_SEVERITIES.includes(sev as typeof ALL_SEVERITIES[number])) {
                counts[sev]++;
            }
        });
        return counts;
    }, [ selectedEntries ]);

    const total = selectedEntries.length;

    const filtered_severities = useMemo(
        () => ALL_SEVERITIES.filter((sev) => severity_counts[sev] > ZERO),
        [ severity_counts ]
    );

    const get_color_for_severity = useCallback(
        (severity: string): string => {
            const base_color = custom_colors[severity] || SEVERITY_COLOR_MAP[severity.toLowerCase()] || BAR_CHART_DEFAULT_COLOR;
            const hex = base_color.replace(`#`, ``);
            const r = parseInt(hex.substring(RGB_RED_START, RGB_RED_END), 16);
            const g = parseInt(hex.substring(RGB_GREEN_START, RGB_GREEN_END), 16);
            const b = parseInt(hex.substring(RGB_BLUE_START, RGB_BLUE_END), 16);
            const alpha = transparency / HUNDRED;
            return `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`;
        },
        [
            custom_colors,
            transparency,
        ]
    );

    const bar_data = useMemo(
        () => filtered_severities.map((sev) => ({
            name:     severity_labels[sev] || titleCase(sev),
            count:    severity_counts[sev],
            severity: sev,
        })),
        [
            filtered_severities,
            severity_labels,
            severity_counts,
        ]
    );

    const donut_data = useMemo(
        () => filtered_severities.map((sev) => ({
            name:  severity_labels[sev] || titleCase(sev),
            value: severity_counts[sev],
            color: get_color_for_severity(sev),
        })),
        [
            filtered_severities,
            severity_labels,
            severity_counts,
            get_color_for_severity,
        ]
    );

    const max_count = useMemo(() => Math.max(...Object.values(severity_counts)), [ severity_counts ]);
    const y_ticks = useMemo(() => Array.from({
        length: max_count + UNIT,
    }, (_, i) => i), [ max_count ]);

    const get_floating_label = useCallback(
        ({
            name, value, percent,
        }: {
            name?:    string
            value?:   number
            percent?: number
        }) => {
            const label = severity_labels[name ?? ``] ?? titleCase(name ?? ``);
            if (floating_label_type === `count`) {
                return `${ label } ${ value ?? ZERO }`;
            }
            return `${ label } ${ ((percent ?? ZERO) * HUNDRED).toFixed(DEFAULT_FRACTION_DIGITS) }%`;
        },
        [
            severity_labels,
            floating_label_type,
        ]
    );

    const custom_legend = useMemo(
        () => (
            <ul
                className={cn(
                    `flex flex-wrap gap-4 justify-center dark:text-foreground/90`,
                    {
                        "mt-4":      legend_position === LEGEND_POSITION_BELOW_CHART &&
                                 should_show_x_axis_label &&
                                 should_show_x_axis_tick_labels,
                        "mt-2 mb-4": legend_position === LEGEND_POSITION_BELOW_TITLE,
                        "-mt-2":     legend_position === LEGEND_POSITION_BELOW_CHART &&
                                 !should_show_x_axis_label &&
                                 !should_show_x_axis_tick_labels,
                    }
                )}
            >
                {
                    filtered_severities.map((sev) => (
                        <li key={sev} className="flex items-center gap-1">
                            <div
                                style={{
                                    backgroundColor: get_color_for_severity(sev),
                                }}
                                className="w-3 h-3 rounded"
                            ></div>
                            <span className="text-sm">
                                {severity_labels[sev] || titleCase(sev)}
                            </span>
                        </li>
                    ))
                }
            </ul>
        ),
        [
            filtered_severities,
            get_color_for_severity,
            legend_position,
            should_show_x_axis_label,
            severity_labels,
        ]
    );

    const {
        theme,
    } = useTheme();

    const export_chart = useCallback(async() => {
        if (!chart_ref.current) {
            toast.error(CHART_NOT_FOUND_MESSAGE);
            return;
        }

        try {
            const domtoimage = (await import(`dom-to-image-more`)).default;

            const blob = await domtoimage.toBlob(chart_ref.current, {
                bgcolor:           theme === `dark` ? DARK_THEME_BGCOLOR : LIGHT_THEME_BGCOLOR,
                quality:           EXPORT_QUALITY,
                scale:             EXPORT_SCALE,
                copyDefaultStyles: SHOULD_COPY_DEFAULT_STYLES,
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement(`a`);
            a.href = url;
            a.download = `${ CHART_FILENAME_PREFIX }${ Date.now() }${ CHART_FILENAME_SUFFIX }`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(EXPORT_SUCCESS_MESSAGE);
        }
        catch (error) {
            console.error(`Export failed:`, error);
            toast.error(EXPORT_FAILED_MESSAGE);
        }
    }, [ theme ]);

    const share_embeddable_code = useCallback(() => {
        const embeddable_code = `<iframe src="${ window.location.origin }/embed/chart?${ new URLSearchParams({
            chart_type:              chart_type,
            title,
            show_legend:             JSON.stringify(should_show_legend),
            show_x_axis_label:       JSON.stringify(should_show_x_axis_label),
            show_y_axis_label:       JSON.stringify(should_show_y_axis_label),
            inner_radius:            JSON.stringify(inner_radius),
            custom_colors:           JSON.stringify(custom_colors),
            transparency:            JSON.stringify(transparency),
            x_axis_label:            x_axis_label,
            y_axis_label:            y_axis_label,
            tooltip_label:           tooltip_label,
            bar_radius:              JSON.stringify(bar_radius),
            severity_labels:         JSON.stringify(severity_labels),
            show_floating_labels:    JSON.stringify(should_show_floating_labels),
            tooltip_content_type:    tooltip_content_type,
            floating_label_type:     floating_label_type,
            show_x_axis_tick_labels: JSON.stringify(should_show_x_axis_tick_labels),
            legend_position:         legend_position,
        }).toString() }" width="${ EMBED_IFRAME_WIDTH }" height="${ EMBED_IFRAME_HEIGHT }" style="${ EMBED_IFRAME_STYLE }"></iframe>`;
        navigator.clipboard.writeText(embeddable_code);
        toast.success(EMBED_CODE_COPIED_MESSAGE);
    }, [
        chart_type,
        title,
        should_show_legend,
        should_show_x_axis_label,
        should_show_y_axis_label,
        inner_radius,
        custom_colors,
        transparency,
        x_axis_label,
        y_axis_label,
        tooltip_label,
        bar_radius,
        severity_labels,
        should_show_floating_labels,
        tooltip_content_type,
        floating_label_type,
        should_show_x_axis_tick_labels,
        legend_position,
    ]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Chart Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Customize and view charts for selected CVSS score entries.
                    </DialogDescription>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={`outline`}
                                size={`sm`}
                                className="ml-auto w-min">
                                <EllipsisVertical className="size-3.5" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel className="text-xs">
                                Export options
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={export_chart}>
                                <Download className="size-3.5 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={share_embeddable_code}>
                                <CodeXml className="size-3.5 mr-2" />
                                Embeddable code
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DialogHeader>
                {
                    should_show_loading
                    ? (
                        <div className="flex justify-center p-8">
                            <Spinner />
                        </div>
                    )
                    : (
                        <div className="space-y-6">
                            <div
                                ref={chart_ref}
                                className="relative">
                                <div className="text-center">
                                    <h3 className={cn(
                                        `text-lg font-semibold dark:text-foreground/95`,
                                        {
                                            "mb-4": legend_position !== `below-title` || !should_show_legend,
                                        }
                                    )}>
                                        {title}
                                    </h3>
                                    {should_show_legend && legend_position === `below-title` && custom_legend}
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {
                                        chart_type === CHART_TYPE_BAR
                                        ? (
                                            <BarChart
                                                data={bar_data}
                                                margin={{
                                                    left:   should_show_y_axis_label && y_axis_label.trim()
                                                            ? BAR_CHART_DEFAULT_LEFT_MARGIN
                                                            : ZERO,
                                                    bottom: should_show_x_axis_label && x_axis_label.trim()
                                                            ? BAR_CHART_DEFAULT_BOTTOM_MARGIN
                                                            : BAR_CHART_FALLBACK_BOTTOM_MARGIN,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray={CARTESIAN_GRID_STROKE_DASHARRAY} />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={
                                                        should_show_x_axis_tick_labels
                                                        ? {
                                                            className: `dark:fill-foreground/80`,
                                                        }
                                                        : false
                                                    }
                                                    tickFormatter={
                                                        should_show_x_axis_tick_labels
                                                        ? undefined
                                                        : (): string => ``
                                                    }
                                                    label={
                                                        should_show_x_axis_label
                                                        ? {
                                                            value:    x_axis_label,
                                                            position: CHART_AXIS_POSITION_BOTTOM,
                                                            offset:   should_show_x_axis_tick_labels
                                                                    ? BAR_CHART_X_AXIS_DEFAULT_OFFSET
                                                                    : BAR_CHART_X_AXIS_FALLBACK_OFFSET,
                                                            className: `dark:fill-foreground/90`,
                                                        }
                                                        : undefined
                                                    }
                                                />
                                                <YAxis
                                                    type="number"
                                                    domain={[
                                                        ZERO,
                                                        `dataMax`,
                                                    ]}
                                                    allowDecimals={false}
                                                    ticks={y_ticks}
                                                    width={
                                                        should_show_y_axis_label && y_axis_label.trim()
                                                        ? undefined
                                                        : BAR_CHART_Y_AXIS_FALLBACK_WIDTH
                                                    }
                                                    tick={{
                                                        className: `dark:fill-foreground/80`,
                                                    }}
                                                    label={
                                                        should_show_y_axis_label
                                                        ? {
                                                            value:     y_axis_label,
                                                            angle:     CHART_AXIS_POSITION_ANGLE,
                                                            position:  CHART_AXIS_POSITION_INSIDE_LEFT,
                                                            className: `dark:fill-foreground/90`,
                                                        }
                                                        : undefined
                                                    }
                                                />
                                                <Tooltip
                                                    formatter={
                                                        (value) => [
                                                            tooltip_content_type === TOOLTIP_CONTENT_TYPE_COUNT
                                                            ? value
                                                            : `${ (((value as number) / total) * HUNDRED).toFixed(DEFAULT_FRACTION_DIGITS) }%`,
                                                            tooltip_label,
                                                        ]
                                                    }
                                                />
                                                <Bar dataKey="count" fill={BAR_CHART_DEFAULT_COLOR} radius={[
                                                    bar_radius,
                                                    bar_radius,
                                                    ZERO,
                                                    ZERO,
                                                ]}>
                                                    {bar_data.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${ index }`}
                                                            fill={get_color_for_severity(entry.severity)}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        )
                                        : (
                                            <PieChart>
                                                <Pie
                                                    data={donut_data}
                                                    cx={PIE_CHART_POSITION_PERCENT}
                                                    cy={PIE_CHART_POSITION_PERCENT}
                                                    innerRadius={inner_radius}
                                                    labelLine={false}
                                                    label={should_show_floating_labels ? get_floating_label : false}
                                                    outerRadius={DONUT_CHART_OUTER_RADIUS}
                                                    fill={DONUT_CHART_DEFAULT_COLOR}
                                                    dataKey="value"
                                                >
                                                    {donut_data.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${ index }`}
                                                            fill={entry.color}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={
                                                        (value, name) => [
                                                            tooltip_content_type === TOOLTIP_CONTENT_TYPE_COUNT
                                                            ? value
                                                            : `${ (((value as number) / total) * HUNDRED).toFixed(DEFAULT_FRACTION_DIGITS) }%`,
                                                            name,
                                                        ]
                                                    }
                                                />
                                            </PieChart>
                                        )
                                        }
                                    </ResponsiveContainer>
                                </div>
                                {should_show_legend && legend_position === `below-chart` && custom_legend}
                                <div className="absolute top-1.25 right-4 h-5 pointer-events-none bg-transparent p-px rounded-xs">
                                    {/* Light theme image */}
                                    <picture className="block dark:hidden" data-light-theme>
                                        <img
                                            src={logoBlack.src}
                                            loading={IMAGE_LOADING_LAZY}
                                            alt={LOGO_ALT_TEXT}
                                            className="w-auto h-5"
                                        />
                                    </picture>

                                    {/* Dark theme image */}
                                    <picture className="hidden dark:block" data-dark-theme>
                                        <img
                                            src={logoWhite.src}
                                            loading={IMAGE_LOADING_LAZY}
                                            alt={LOGO_ALT_TEXT}
                                            className="w-auto h-5"
                                        />
                                    </picture>
                                </div>
                            </div>
                            <Accordion type={`multiple`}>
                                <ChartSettings
                                    chart_type={chart_type}
                                    set_chart_type={(value) => setSettings((prev) => ({
                                        ...prev,
                                        chart_type: value,
                                    }))}
                                    title={title}
                                    set_title={(value) => setSettings((prev) => ({
                                        ...prev,
                                        title: value,
                                    }))}
                                    show_legend={should_show_legend}
                                    set_show_legend={(value) => setSettings((prev) => ({
                                        ...prev,
                                        should_show_legend: value,
                                    }))}
                                    legend_position={legend_position}
                                    set_legend_position={(value) => setSettings((prev) => ({
                                        ...prev,
                                        legend_position: value,
                                    }))}
                                    tooltip_content_type={tooltip_content_type}
                                    set_tooltip_content_type={(value) => setSettings((prev) => ({
                                        ...prev,
                                        tooltip_content_type: value,
                                    }))}
                                    transparency={transparency}
                                    set_transparency={throttledSetTransparency}
                                    localTransparency={localTransparency}
                                    setLocalTransparency={setLocalTransparency}
                                />
                                <TypeSpecificSettings
                                    chart_type={chart_type}
                                    show_x_axis_label={should_show_x_axis_label}
                                    set_show_x_axis_label={(value) => setSettings((prev) => ({
                                        ...prev,
                                        should_show_x_axis_label: value,
                                    }))}
                                    show_y_axis_label={should_show_y_axis_label}
                                    set_show_y_axis_label={(value) => setSettings((prev) => ({
                                        ...prev,
                                        should_show_y_axis_label: value,
                                    }))}
                                    show_x_axis_tick_labels={should_show_x_axis_tick_labels}
                                    set_show_x_axis_tick_labels={(value) => setSettings((prev) => ({
                                        ...prev,
                                        should_show_x_axis_tick_labels: value,
                                    }))}
                                    x_axis_label={x_axis_label}
                                    set_x_axis_label={(value) => setSettings((prev) => ({
                                        ...prev,
                                        x_axis_label: value,
                                    }))}
                                    y_axis_label={y_axis_label}
                                    set_y_axis_label={(value) => setSettings((prev) => ({
                                        ...prev,
                                        y_axis_label: value,
                                    }))}
                                    tooltip_label={tooltip_label}
                                    set_tooltip_label={(value) => setSettings((prev) => ({
                                        ...prev,
                                        tooltip_label: value,
                                    }))}
                                    bar_radius={bar_radius}
                                    set_bar_radius={throttledSetBarRadius}
                                    inner_radius={inner_radius}
                                    set_inner_radius={throttledSetInnerRadius}
                                    localBarRadius={localBarRadius}
                                    setLocalBarRadius={setLocalBarRadius}
                                    localInnerRadius={localInnerRadius}
                                    setLocalInnerRadius={setLocalInnerRadius}
                                    show_floating_labels={should_show_floating_labels}
                                    set_show_floating_labels={(value) => setSettings((prev) => ({
                                        ...prev,
                                        should_show_floating_labels: value,
                                    }))}
                                    floating_label_type={floating_label_type}
                                    set_floating_label_type={(value) => setSettings((prev) => ({
                                        ...prev,
                                        floating_label_type: value,
                                    }))}
                                />
                                <Customization
                                    custom_colors={custom_colors}
                                    set_custom_colors={(updater) => setSettings((prev) => ({
                                        ...prev,
                                        custom_colors: updater(prev.custom_colors),
                                    }))}
                                    severity_labels={severity_labels}
                                    set_severity_labels={(updater) => setSettings((prev) => ({
                                        ...prev,
                                        severity_labels: updater(prev.severity_labels),
                                    }))}
                                />
                            </Accordion>
                        </div>
                    )
                }
            </DialogContent>
        </Dialog>
    );
};
