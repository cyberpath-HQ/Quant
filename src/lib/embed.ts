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
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
        }
    }
    #toast {
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }
    #toast.show {
        animation: slideInRight 0.3s ease-out;
    }
    .dropdown {
        position: relative;
        display: inline-block;
    }
    .dropdown-content {
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
    .dropdown-content.show {
        animation: slideDown 0.3s ease-out;
    }
    .dropdown-content.hide {
        animation: slideUp 0.3s ease-out;
    }
    .dropdown-content a {
        display: block;
        padding: 8px 16px;
        text-decoration: none;
        color: #1f2937;
        font-size: 14px;
    }
    .dropdown-content a:hover {
        background: #f9fafb;
    }
    .btn-link {
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
    .btn-link:hover {
        background: #0284c7;
    }
    .dropdown button {
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
    .dropdown button:hover {
        background: #0284c7;
    }
</style>
<div style="
    border: 2px solid #0ea5e9;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    padding: 24px;
    font-family: system-ui, -apple-system, sans-serif;
    background: white;
    color: #1f2937;
    max-width: 400px;
    height: auto;
    margin: 0 auto;
">
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
            }).toString() }' rel="noopener" target="_blank" class="btn-link" aria-label="Open CVSS calculator with current vector">
                Open in calculator
            </a>
            <div class="dropdown">
                <button onclick="toggleDropdown()" aria-expanded="false" aria-haspopup="menu" aria-label="More options">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
                <div id="dropdown-content" class="dropdown-content" role="menu" aria-hidden="true">
                    <a href="#" onclick="copyLink('${ escapedShareLink }'); toggleDropdown(); return false;" role="menuitem" tabindex="-1">
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
        " onmouseover="showIcons()" onmouseout="hideIcons()">
            ${ vectorString }
            <div id="vector-icons" style="
                position: absolute;
                top: 8px;
                right: 8px;
                display: none;
                gap: 4px;
            ">
                <button onclick="copyVector('${ escapedVector }')" style="
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

    <div id="toast" style="
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
        document.addEventListener('click', function(event) {
            const dropdown = document.querySelector('.dropdown');
            const content = document.getElementById('dropdown-content');
            if (!dropdown.contains(event.target)) {
                closeDropdown();
            }
        });
        function toggleDropdown() {
            const content = document.getElementById('dropdown-content');
            const button = content.previousElementSibling;
            if (content.style.display === 'block') {
                closeDropdown();
            } else {
                openDropdown();
            }
        }
        function openDropdown() {
            const content = document.getElementById('dropdown-content');
            const button = content.previousElementSibling;
            content.style.display = 'block';
            content.classList.add('show');
            content.classList.remove('hide');
            button.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');
        }
        function closeDropdown() {
            const content = document.getElementById('dropdown-content');
            const button = content.previousElementSibling;
            content.classList.add('hide');
            content.classList.remove('show');
            setTimeout(() => {
                content.style.display = 'none';
            }, 300);
            button.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');
        }
        function showIcons() {
            document.getElementById('vector-icons').style.display = 'flex';
        }
        function hideIcons() {
            document.getElementById('vector-icons').style.display = 'none';
        }
        function copyVector(text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Vector copied!');
            });
        }
        function copyLink(url) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('Share link copied!');
            });
        }
        function showToast(message) {
            const toast = document.getElementById('toast');
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
        }
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
