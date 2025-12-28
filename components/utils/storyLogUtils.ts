// Constants
export const MAX_STORY_LOG_ENTRIES = 50;

// Helper function to auto-trim story log to keep only the most recent entries
export const createAutoTrimmedStoryLog = (setStoryLog: (log: string[] | ((prev: string[]) => string[])) => void) => {
    return {
        // Update with function (for appending new entries)
        update: (updateFn: (prev: string[]) => string[]) => {
            setStoryLog(prev => {
                const updated = updateFn(prev);
                // If the log exceeds the maximum, keep only the most recent entries
                if (updated.length > MAX_STORY_LOG_ENTRIES) {
                    const trimmed = updated.slice(-MAX_STORY_LOG_ENTRIES);
                    console.log(`📚 StoryLog auto-trimmed: ${updated.length} -> ${trimmed.length} entries (kept ${MAX_STORY_LOG_ENTRIES} most recent)`);
                    return trimmed;
                }
                return updated;
            });
        },
        // Set with direct array (for resetting the log)
        set: (newLog: string[]) => {
            const trimmed = newLog.length > MAX_STORY_LOG_ENTRIES 
                ? newLog.slice(-MAX_STORY_LOG_ENTRIES)
                : newLog;
            if (trimmed.length !== newLog.length) {
                console.log(`📚 StoryLog auto-trimmed on set: ${newLog.length} -> ${trimmed.length} entries (kept ${MAX_STORY_LOG_ENTRIES} most recent)`);
            }
            setStoryLog(trimmed);
        }
    };
};

// Simple function to trim an array to maximum entries (for one-off trimming)
export const trimStoryLog = (log: string[]): string[] => {
    if (log.length > MAX_STORY_LOG_ENTRIES) {
        console.log(`📚 StoryLog trimmed: ${log.length} -> ${MAX_STORY_LOG_ENTRIES} entries`);
        return log.slice(-MAX_STORY_LOG_ENTRIES);
    }
    return log;
};