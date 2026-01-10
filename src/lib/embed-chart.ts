import type { ScoreHistoryEntry } from "./add-to-history";
import {
    ALL_SEVERITIES,
    SEVERITY_COLOR_MAP,
    type DEFAULT_SETTINGS,
    ZERO,
    HUNDRED,
    RGB_RED_START,
    RGB_RED_END,
    RGB_GREEN_START,
    RGB_GREEN_END,
    RGB_BLUE_START,
    RGB_BLUE_END,
    DEFAULT_FRACTION_DIGITS,
    LOGO_ALT_TEXT
} from "./constants";
import { title } from "radash";

export function generateEmbeddableChartHTML(
    settings: typeof DEFAULT_SETTINGS,
    selectedEntries: Array<ScoreHistoryEntry>,
    origin: string
): string {
    // Compute severity counts
    const severity_counts: Record<string, number> = ALL_SEVERITIES.reduce((acc, sev) => {
        acc[sev] = 0;
        return acc;
    }, {} as Record<string, number>);

    selectedEntries.forEach((entry) => {
        const sev = entry.severity.toLowerCase();
        if (ALL_SEVERITIES.includes(sev as typeof ALL_SEVERITIES[number])) {
            severity_counts[sev]++;
        }
    });

    const total = selectedEntries.length;

    const filtered_severities = ALL_SEVERITIES.filter((sev) => severity_counts[sev] > ZERO);

    const get_color_for_severity = (severity: string): string => {
        const base_color = settings.custom_colors[severity] || SEVERITY_COLOR_MAP[severity.toLowerCase()] || `#8884d8`;
        const hex = base_color.replace(`#`, ``);
        const r = parseInt(hex.substring(RGB_RED_START, RGB_RED_END), 16);
        const g = parseInt(hex.substring(RGB_GREEN_START, RGB_GREEN_END), 16);
        const b = parseInt(hex.substring(RGB_BLUE_START, RGB_BLUE_END), 16);
        const alpha = settings.transparency / HUNDRED;
        return `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`;
    };

    const labels = filtered_severities.map((sev) => settings.severity_labels[sev] || sev.charAt(0).toUpperCase() + sev.slice(1));
    const data = filtered_severities.map((sev) => severity_counts[sev]);
    const backgroundColors = filtered_severities.map(get_color_for_severity);

    let chartType: string;
    let chartData: any;
    const options: any = {
        responsive: true,
        plugins:    {
            legend: {
                display:  false,
                position: settings.legend_position === `below-title` ? `top` : `bottom`,
            },
            tooltip: {
                callbacks: {},
            },
        },
    };

    if (settings.chart_type === `bar`) {
        chartType = `bar`;
        chartData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                    borderRadius:    settings.bar_radius,
                },
            ],
        };
        options.scales = {
            x: {
                display: settings.should_show_x_axis_label || settings.should_show_x_axis_tick_labels,
                title:   {
                    display: settings.should_show_x_axis_label && Boolean(settings.x_axis_label.trim()),
                    text:    settings.x_axis_label,
                },
                ticks: {
                    display: settings.should_show_x_axis_tick_labels,
                },
                grid: {
                    display: true,
                },
            },
            y: {
                display: true,
                title:   {
                    display: settings.should_show_y_axis_label && Boolean(settings.y_axis_label.trim()),
                    text:    settings.y_axis_label,
                },
                ticks: {
                    display:  true,
                    stepSize:      1,
                },
                grid: {
                    display: true,
                },
                beginAtZero:   true,
                allowDecimals: false,
            },
        };
    }
    else {
        chartType = `doughnut`;
        chartData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                    cutout:          `${ settings.inner_radius }%`,
                },
            ],
        };
    }

    const html = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js" 
    integrity="sha512-Y51n9mtKTVBh3Jbx5pZSJNDDMyY+yGe77DGtBPzRlgsf/YLCh13kSZ3JmfHGzYFCmOndraf0sQgfM654b7dJ3w==" 
    crossorigin="anonymous" 
    async 
    defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-datalabels/2.2.0/chartjs-plugin-datalabels.min.js" 
    integrity="sha512-JPcRR8yFa8mmCsfrw4TNte1ZvF1e3+1SdGMslZvmrzDYxS69J7J49vkFL8u6u8PlPJK+H3voElBtUCzaXj+6ig==" 
    crossorigin="anonymous" 
    async 
    defer></script>
<style>
    .chart-wrapper {
        all: initial;
        font-family: system-ui, -apple-system, sans-serif;
        color: oklch(21% 0.006 285.885);
        border: 2px solid #0ea5e9;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        padding: 24px;
        background: white;
        max-width: 400px;
        height: auto;
        margin: 0 auto;
        display: block;
    }
    .chart-wrapper * {
        box-sizing: border-box;
    }
    .chart-container {
        width: 100%;
        height: 100%;
        margin: 0 auto;
        position: relative;
    }
    .loading-spinner {
        width: 25px;
        height: 25px;
        border: 2px solid  #f3f3f3;
        border-top: 2px solid #0066cc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-inline: auto;
        margin-top: 3rem;
    }
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    .legend {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
        font-size: 0.9em;
    }
    .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
    }
    .footer-link {
        display: block;
        text-align: center;
        margin-top: 20px;
        color: #1f2937;
        text-decoration: none;
        font-size: 0.9em;
        cursor: pointer;
    }
    .footer-link:after {
        content: '';
        display: block;
        margin-top: 1px;
        width: 25%;
        height: 1px;
        background: #1f2937;
        margin-left: auto;
        margin-right: auto;
        transition: width 300ms ease-in-out;
    }
    .footer-link:hover:after {
        width: 50%;
    }
</style>
<div class="chart-wrapper">
    <h3 style="text-align: center; margin-bottom: 1rem; margin-top: 0;">${ settings.title }</h3>
    ${ settings.should_show_legend && settings.legend_position === `below-title`
? `
    <div class="legend" style="margin-bottom: 1.5rem">
    ${ filtered_severities.map((sev) => `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${ get_color_for_severity(sev) }"></div>
            <span>${ settings.severity_labels[sev] || title(sev) }</span>
        </div>
    `).join(``) }
    </div>
    `
: `` }
    <canvas id="chart" class="chart-container" aria-label="${ settings.title }" role="img" style="display: none;"></canvas>
    <div id="loading-spinner" class="loading-spinner"></div>
    ${ settings.should_show_legend && settings.legend_position === `below-chart`
? `
    <div class="legend">
        ${ filtered_severities.map((sev) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${ get_color_for_severity(sev) }"></div>
                <span>${ settings.severity_labels[sev] || title(sev) }</span>
            </div>
        `).join(``) }
    </div>
    `
: `` }
    <a href="${ origin }?${ new URLSearchParams({
        utm_source:   `embedded_logo`,
        utm_medium:   `chart`,
        utm_campaign: `cvss_summary_chart`,
    }).toString() }" class="footer-link" target="_blank" rel="noopener">
        View on
        <img src="${ origin }/logo.svg" 
            alt="${ LOGO_ALT_TEXT }" 
            style="height: 1.4em; vertical-align: middle;">
    </a>
</div>    
<script>
function initChart() {
    if (typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined') {
        setTimeout(initChart, 100);
        return;
    }
    const spinner = document.getElementById('loading-spinner');
    const chartElem = document.getElementById('chart');
    if (spinner) {
        spinner.style.display = 'none';
    }
    if (chartElem) {
        chartElem.style.display = 'block';
    }
    const ctx = document.getElementById('chart').getContext('2d');
    const total = ${ total };
    const tooltipContentType = ${ JSON.stringify(settings.tooltip_content_type) };
    const tooltipLabel = ${ JSON.stringify(settings.tooltip_label) };
    const shouldShowFloatingLabels = ${ JSON.stringify(settings.should_show_floating_labels) };
    const floatingLabelType = ${ JSON.stringify(settings.floating_label_type) };
    const chartType = ${ JSON.stringify(chartType) };
    const options = ${ JSON.stringify(options) };
    
    options.plugins.tooltip.callbacks.label = (context) => {
        const value = context.raw;
        const formattedValue = tooltipContentType === 'count'
            ? value
            : ((value / total) * 100).toFixed(2) + '%';
        return tooltipLabel + ": " + formattedValue;
    };
    
    if (chartType === 'doughnut' && shouldShowFloatingLabels) {
        options.plugins.datalabels = {
            display: true,
            formatter: (value) => {
                const percent = ((value / total) * 100).toFixed(2);
                return floatingLabelType === 'count' ? value.toString() : percent + '%';
            },
            color: 'white',
            font: {
                weight: 'bold',
                size: 12,
            },
            anchor: 'center',
            align: 'center',
        };
    }
    else {
        options.plugins.datalabels = {
            display: false,
        };
    }
    
    new Chart(ctx, {
        type: chartType,
        plugins: [ChartDataLabels],
        data: ${ JSON.stringify(chartData) },
        options
    });
}
initChart();
</script>`;

    return html;
}
