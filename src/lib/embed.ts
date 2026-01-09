/**
 * @fileoverview Embeddable CVSS Widget Generator
 * @description Generates SEO-compliant, self-contained HTML for embedding CVSS score cards
 */

import {
    DEFAULT_FRACTION_DIGITS, CVSS_LOGO_ALT
} from "./constants";

interface SeverityInfo {
    label:   string
    color:   string
    bgColor: string
}

/**
 * Maps severity to CSS color values for inline styles
 */
function getSeverityCSS(severity: SeverityInfo): {
    color:   string
    bgColor: string
} {
    const cssMap: Record<string, {
        color:   string
        bgColor: string
    }> = {
        None: {
            // text-sky-700 bg-sky-100
            color:   `oklch(50% 0.134 242.749)`,
            bgColor: `oklch(95.1% 0.026 236.824)`,
        },
        Low: {
            // text-green-700 bg-green-100
            color:   `oklch(52.7% 0.154 150.069)`,
            bgColor: `oklch(96.2% 0.044 156.743)`,
        },
        Medium: {
            // text-yellow-700 bg-yellow-100
            color:   `oklch(55.4% 0.135 66.442)`,
            bgColor: `oklch(97.3% 0.071 103.193)`,
        },
        High: {
            // text-red-700 bg-red-100
            color:   `oklch(50.5% 0.213 27.518)`,
            bgColor: `oklch(93.6% 0.032 17.717)`,
        },
        Critical: {
            // text-purple-700 bg-purple-100
            color:   `oklch(49.6% 0.265 301.924)`,
            bgColor: `oklch(94.6% 0.033 307.174)`,
        },
    };
    return cssMap[severity.label] || {
        color:   `#6b7280`,
        bgColor: `#f9fafb`,
    };
}

/**
 * Generates embeddable HTML code for a CVSS score card
 * @param params Parameters for the embeddable code
 * @returns Self-contained HTML string
 */
export function generateEmbeddableCode(params: {
    version:      string
    score:        number
    vectorString: string
    severity:     SeverityInfo
    origin:       string
}): string {
    const {
        version,
        score,
        vectorString,
        severity,
        origin,
    } = params;
    const scoreDisplay = score.toFixed(DEFAULT_FRACTION_DIGITS);
    const logoUrl = `${ origin }/logo.svg`;
    const severityCSS = getSeverityCSS(severity);
    const escapedVector = vectorString.replace(/'/g, `\\'`);
    const shareLink = `${ origin }?${ new URLSearchParams({
        vector: vectorString,
    }).toString() }`;
    const escapedShareLink = shareLink.replace(/'/g, `\\'`);

    const html = `
<style>
    .cvss-widget-container {
        all: initial;
        font-family: system-ui, -apple-system, sans-serif;
        color: #1f2937;
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
    .cvss-widget-container * {
        box-sizing: border-box;
    }
    @keyframes cvss-slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes cvss-slideDown {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    @keyframes cvss-slideUp {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
        }
    }
    .cvss-widget-container .cvss-toast {
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }
    .cvss-widget-container .cvss-dropdown {
        position: relative;
        display: inline-block;
    }
    .cvss-widget-container .cvss-dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        top: 100%;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        z-index: 20;
        min-width: 160px;
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }
    .cvss-widget-container .cvss-dropdown-content.cvss-show {
        animation: cvss-slideDown 0.3s ease-out;
    }
    .cvss-widget-container .cvss-dropdown-content.cvss-hide {
        animation: cvss-slideUp 0.3s ease-out;
    }
    .cvss-widget-container .cvss-dropdown-content a {
        display: block;
        padding: 8px 16px;
        text-decoration: none;
        color: #1f2937;
        font-size: 14px;
    }
    .cvss-widget-container .cvss-dropdown-content a:hover {
        background: #f9fafb;
    }
    .cvss-widget-container .cvss-btn-link {
        background: #0ea5e9;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px 0 0 4px;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
        display: inline-block;
        cursor: pointer;
        transition: background 0.2s;
        border-right: 1px solid rgba(255,255,255,0.2);
    }
    .cvss-widget-container .cvss-btn-link:hover {
        background: #0284c7;
    }
    .cvss-widget-container .cvss-dropdown button {
        background: #0ea5e9;
        border: none;
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 0 4px 4px 0;
        color: white;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background 0.2s;
        border-left: 1px solid rgba(255,255,255,0.2);
    }
    .cvss-widget-container .cvss-dropdown button:hover {
        background: #0284c7;
    }
</style>
<div class="cvss-widget-container">
    <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    ">
        <span style="
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        ">
            CVSS v${ version }
        </span>
        <div style="display: flex;">
            <a href='${ origin }?${ new URLSearchParams({
                vector:       vectorString,
                utm_source:   `view_in_calculator`,
                utm_medium:   `widget`,
                utm_campaign: `cvss_calculator`,
            }).toString() }' rel="noopener" target="_blank" class="cvss-btn-link" aria-label="Open CVSS calculator with current vector">
                Open in calculator
            </a>
            <div class="cvss-dropdown">
                <button onclick="cvssToggleDropdown()" aria-expanded="false" aria-haspopup="menu" aria-label="More options">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
                <div id="cvss-dropdown-content" class="cvss-dropdown-content" role="menu" aria-hidden="true">
                    <a href="#" onclick="cvssCopyLink('${ escapedShareLink }'); cvssToggleDropdown(); return false;" role="menuitem" tabindex="-1">
                        Copy share link
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div style="
        display: flex;
        align-items: flex-end;
        gap: 12px;
        margin-bottom: 24px;
    ">
        <span style="
            font-size: 48px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            color: ${ severityCSS.color };
        ">
            ${ scoreDisplay }
        </span>
        <span style="
            font-size: 14px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 4px;
            color: ${ severityCSS.color };
            background-color: ${ severityCSS.bgColor };
        ">
            ${ severity.label }
        </span>
    </div>

    <div style="margin-bottom: 24px;">
        <span style="
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        ">
            Vector
        </span>
        <div style="
            margin-top: 8px;
            padding: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-family: 'Courier New', 'Monaco', monospace;
            font-size: 10px;
            line-height: 1.5;
            word-break: break-all;
            color: #1f2937;
            position: relative;
        " onmouseover="cvssShowIcons()" onmouseout="cvssHideIcons()">
            ${ vectorString }
            <div id="cvss-vector-icons" style="
                position: absolute;
                top: 8px;
                right: 8px;
                display: none;
                gap: 4px;
            ">
                <button onclick="cvssCopyVector('${ escapedVector }')" style="
                    background: white;
                    border: 1px solid #e5e7eb;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    color: #6b7280;
                    z-index: 10;
                    position: relative;
                " title="Copy vector" aria-label="Copy CVSS vector to clipboard">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <div id="cvss-toast" class="cvss-toast" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        display: none;
        z-index: 1000;
        transform: translateX(100%);
        opacity: 0;
    " aria-live="polite" aria-atomic="true" role="status"></div>

    <script>
        (function() {
            const container = document.querySelector('.cvss-widget-container');
            if (!container) return;

            container.addEventListener('click', function(event) {
                const dropdown = container.querySelector('.cvss-dropdown');
                const content = container.querySelector('#cvss-dropdown-content');
                if (!dropdown.contains(event.target)) {
                    cvssCloseDropdown();
                }
            });

            window.cvssToggleDropdown = function() {
                const content = container.querySelector('#cvss-dropdown-content');
                const button = content.previousElementSibling;
                if (content.style.display === 'block') {
                    cvssCloseDropdown();
                } else {
                    cvssOpenDropdown();
                }
            };

            window.cvssOpenDropdown = function() {
                const content = container.querySelector('#cvss-dropdown-content');
                const button = content.previousElementSibling;
                content.style.display = 'block';
                content.classList.add('cvss-show');
                content.classList.remove('cvss-hide');
                button.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
            };

            window.cvssCloseDropdown = function() {
                const content = container.querySelector('#cvss-dropdown-content');
                const button = content.previousElementSibling;
                content.classList.add('cvss-hide');
                content.classList.remove('cvss-show');
                setTimeout(() => {
                    content.style.display = 'none';
                }, 300);
                button.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
            };

            window.cvssShowIcons = function() {
                const icons = container.querySelector('#cvss-vector-icons');
                icons.style.display = 'flex';
            };

            window.cvssHideIcons = function() {
                const icons = container.querySelector('#cvss-vector-icons');
                icons.style.display = 'none';
            };

            window.cvssCopyVector = function(text) {
                navigator.clipboard.writeText(text).then(() => {
                    cvssShowToast('Vector copied!');
                });
            };

            window.cvssCopyLink = function(url) {
                navigator.clipboard.writeText(url).then(() => {
                    cvssShowToast('Share link copied!');
                });
            };

            window.cvssShowToast = function(message) {
                const toast = container.querySelector('#cvss-toast');
                toast.textContent = message;
                toast.style.display = 'block';
                // Trigger animation
                setTimeout(() => {
                    toast.style.transform = 'translateX(0)';
                    toast.style.opacity = '1';
                }, 10);
                setTimeout(() => {
                    toast.style.transform = 'translateX(100%)';
                    toast.style.opacity = '0';
                    setTimeout(() => {
                        toast.style.display = 'none';
                    }, 300);
                }, 3300); // 3s + 300ms entrance
            };
        })();
    </script>

    <div style="text-align: center; margin-top: 32px;">
        <a href='${ origin }?${ new URLSearchParams({
            utm_source:   `embedded_logo`,
            utm_medium:   `widget`,
            utm_campaign: `cvss_calculator`,
        }).toString() }' rel="noopener" target="_blank">
            <img src="${ logoUrl }" alt="${ CVSS_LOGO_ALT }" style="
                width: 100%;
                height: auto;
                max-width: 200px;
            " />
        </a>
    </div>
</div>
`;

    return html.trim();
}
