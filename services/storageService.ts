
import { AppSettings, SaveFile, SaveSlot } from '../types';
import { NUM_SAVE_SLOTS, LOCAL_STORAGE_KEY_SETTINGS, LOCAL_STORAGE_KEY_SAVE_GAME, DEFAULT_SETTINGS } from '../constants';

const LOCAL_STORAGE_KEY_API_KEYS = 'tu_tien_api_keys';

// --- Settings Management ---

export const saveSettings = (settings: AppSettings): void => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings:", e);
    }
};

export const loadSettings = (): AppSettings => {
    try {
        const settingsJson = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
        if (settingsJson) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
        }
    } catch (e) {
        console.error("Failed to load settings:", e);
    }
    return DEFAULT_SETTINGS;
};

// --- Game Save/Load Management ---

export const saveGame = (slotId: number, saveFile: SaveFile): void => {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_SAVE_GAME}${slotId}`, JSON.stringify(saveFile));
    } catch (e) {
        console.error(`Failed to save game in slot ${slotId}:`, e);
    }
};

export const loadGame = (slotId: number): SaveFile | null => {
    try {
        const saveJson = localStorage.getItem(`${LOCAL_STORAGE_KEY_SAVE_GAME}${slotId}`);
        if (saveJson) {
            return JSON.parse(saveJson) as SaveFile;
        }
    } catch (e) {
        console.error(`Failed to load game from slot ${slotId}:`, e);
    }
    return null;
};

export const deleteSave = (slotId: number): void => {
    try {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_SAVE_GAME}${slotId}`);
    } catch (e) {
        console.error(`Failed to delete save in slot ${slotId}:`, e);
    }
};

export const loadAllSaveSlots = (): SaveSlot[] => {
    const slots: SaveSlot[] = [];
    for (let i = 0; i < NUM_SAVE_SLOTS; i++) {
        const file = loadGame(i);
        if (file && file.character) {
            slots.push({
                slotId: i,
                characterName: file.character.name,
                level: file.character.level,
                realm: file.character.realm.name,
                saveDate: file.saveDate || "Không rõ"
            });
        } else {
            slots.push({
                slotId: i,
                characterName: '',
                level: 0,
                realm: '',
                saveDate: ''
            });
        }
    }
    return slots;
};

export const deleteAllData = (): void => {
    try {
        // Delete settings
        localStorage.removeItem(LOCAL_STORAGE_KEY_SETTINGS);
        // Delete api keys
        localStorage.removeItem(LOCAL_STORAGE_KEY_API_KEYS);
        // Delete all save slots
        for (let i = 0; i < NUM_SAVE_SLOTS; i++) {
            deleteSave(i);
        }
        console.log("All application data deleted.");
    } catch(e) {
        console.error("Error deleting all data:", e);
    }
}

// --- API Key Management ---

export const saveApiKeys = (keys: string[]): void => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_API_KEYS, JSON.stringify(keys));
    } catch (e) {
        console.error("Failed to save API keys:", e);
    }
};

export const loadApiKeys = (): string[] => {
    try {
        const keysJson = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEYS);
        if (keysJson) {
            const parsed = JSON.parse(keysJson);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Failed to load API keys:", e);
    }
    return [];
};
