export const ALL_SEVERITIES = [
    `none`,
    `low`,
    `medium`,
    `high`,
    `critical`,
] as const;

export const SEVERITY_COLOR_MAP: Record<string, string> = {
    none:     `#87CEEB`,
    low:      `#32CD32`,
    medium:   `#FFD700`,
    high:     `#FF6347`,
    critical: `#8A2BE2`,
};

// Constants
export const ZERO = 0;
export const UNIT = 1;
export const TRANSPARENCY_MIN = 0;
export const TRANSPARENCY_MAX = 100;
export const BAR_RADIUS_MIN = 0;
export const BAR_RADIUS_MAX = 20;
export const INNER_RADIUS_MIN = 0;
export const INNER_RADIUS_MAX = 80;
export const DEFAULT_INNER_RADIUS = 60;
export const DEFAULT_TRANSPARENCY = 70;
export const DEFAULT_BAR_RADIUS = 5;
export const RGB_RED_START = 0;
export const RGB_RED_END = 2;
export const RGB_GREEN_START = RGB_RED_END;
export const RGB_GREEN_END = 4;
export const RGB_BLUE_START = RGB_GREEN_END;
export const RGB_BLUE_END = 6;
export const HUNDRED = 100;
export const THROTTLE_DELAY = 100;
export const DEFAULT_FRACTION_DIGITS = 2;
export const BAR_CHART_DEFAULT_LEFT_MARGIN = 20;
export const BAR_CHART_DEFAULT_BOTTOM_MARGIN = 20;
export const BAR_CHART_FALLBACK_BOTTOM_MARGIN = 5;
export const BAR_CHART_X_AXIS_DEFAULT_OFFSET = 5;
export const BAR_CHART_X_AXIS_FALLBACK_OFFSET = -5;
export const BAR_CHART_Y_AXIS_FALLBACK_WIDTH = 25;

export const CHART_DIALOG_SETTINGS_KEY = `chart-dialog-settings`;
export const CHART_NOT_FOUND_MESSAGE = `Chart not found`;
export const EXPORT_FAILED_MESSAGE = `Failed to export chart`;
export const EXPORT_SUCCESS_MESSAGE = `Chart exported as PNG`;
export const EMBED_CODE_COPIED_MESSAGE = `Embeddable code copied`;
export const CHART_FILENAME_PREFIX = `cvss-chart-`;
export const CHART_FILENAME_SUFFIX = `.png`;
export const DARK_THEME_BGCOLOR = `#18181B`;
export const LIGHT_THEME_BGCOLOR = `#ffffff`;
export const EXPORT_SCALE = 2;
export const EXPORT_QUALITY = 1;
export const EMBED_IFRAME_WIDTH = `400`;
export const EMBED_IFRAME_HEIGHT = `600`;
export const EMBED_IFRAME_STYLE = `border:none;`;
export const SHOULD_COPY_DEFAULT_STYLES = false;

export const DEFAULT_SETTINGS = {
    chart_type:                     `bar` as `bar` | `donut`,
    title:                          `CVSS Scores Chart`,
    should_show_legend:             true,
    should_show_x_axis_label:       true,
    should_show_y_axis_label:       true,
    inner_radius:                   DEFAULT_INNER_RADIUS,
    custom_colors:                  {} as Record<string, string>,
    transparency:                   DEFAULT_TRANSPARENCY,
    x_axis_label:                   `Severity`,
    y_axis_label:                   `Count`,
    tooltip_label:                  `Count`,
    bar_radius:                     DEFAULT_BAR_RADIUS,
    severity_labels:                {} as Record<string, string>,
    should_show_floating_labels:    true,
    tooltip_content_type:           `count` as `count` | `percentage`,
    floating_label_type:            `percentage` as `count` | `percentage`,
    should_show_x_axis_tick_labels: true,
    legend_position:                `below-chart` as `below-title` | `below-chart`,
};
