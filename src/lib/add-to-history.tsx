
/**
 * Add a score to history
 */
export function addToHistory(entry: Omit<ScoreHistoryEntry, `id` | `timestamp`>): void {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const history: Array<ScoreHistoryEntry> = stored ? JSON.parse(stored) : [];

        const newEntry: ScoreHistoryEntry = {
            ...entry,
            id: `${ Date.now() }-${ Math.random().toString(36)
                .substring(2, 9) }`,
            timestamp: new Date().toISOString(),
        };

        // Add to beginning and limit to MAX_HISTORY
        const updated = [
            newEntry,
            ...history,
        ].slice(0, MAX_HISTORY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Notify other components that history has been updated
        window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
    }
    catch (error) {
        console.error(`Failed to save to history:`, error);
    }
}

export const STORAGE_KEY = `cvss-score-history`;
export const MAX_HISTORY = 50;
export const HISTORY_UPDATE_EVENT = `cvss-history-update`;

export interface ScoreHistoryEntry {
    id:           string
    version:      string
    score:        number
    severity:     string
    vectorString: string
    timestamp:    string
    name:         string
}

