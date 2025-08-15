import { useState, useEffect } from 'react';
import { GameSettings } from '../GameSettingsModal';

export interface GameSettingsState {
    gameSettings: GameSettings;
}

export interface GameSettingsActions {
    setGameSettings: (settings: GameSettings) => void;
    handleSettingsChange: (newSettings: GameSettings) => void;
}

export const useGameSettings = (): [GameSettingsState, GameSettingsActions] => {
    const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
        const defaultSettings = {
            fontSize: 16,
            fontFamily: 'Inter',
            memoryAutoClean: true,
            historyAutoCompress: true,
            themeColor: 'purple',
            // Entity Export Settings
            entityExportEnabled: true,
            entityExportInterval: 7,
            entityExportDebugLogging: true,
            // Entity Import Settings
            entityImportEnabled: true,
            entityAutoMergeOnImport: true,
            entityBackupBeforeImport: true,
        };

        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                const parsedSettings = JSON.parse(saved);
                // Merge with defaults to ensure all fields are present
                return { ...defaultSettings, ...parsedSettings };
            } catch {
                // Fall back to defaults if parse fails
            }
        }
        return defaultSettings;
    });

    const handleSettingsChange = (newSettings: GameSettings) => {
        setGameSettings(newSettings);
        localStorage.setItem('gameSettings', JSON.stringify(newSettings));
        
        // Apply font settings to document root
        document.documentElement.style.setProperty('--game-font-size', `${newSettings.fontSize}px`);
        document.documentElement.style.setProperty('--game-font-family', newSettings.fontFamily);
        
        // Apply theme color to document root
        document.documentElement.style.setProperty('--game-theme-color', newSettings.themeColor);
    };

    // Apply settings on component mount
    useEffect(() => {
        document.documentElement.style.setProperty('--game-font-size', `${gameSettings.fontSize}px`);
        document.documentElement.style.setProperty('--game-font-family', gameSettings.fontFamily);
        document.documentElement.style.setProperty('--game-theme-color', gameSettings.themeColor);
    }, [gameSettings.fontSize, gameSettings.fontFamily, gameSettings.themeColor]);

    const gameSettingsState: GameSettingsState = {
        gameSettings
    };

    const gameSettingsActions: GameSettingsActions = {
        setGameSettings,
        handleSettingsChange
    };

    return [gameSettingsState, gameSettingsActions];
};