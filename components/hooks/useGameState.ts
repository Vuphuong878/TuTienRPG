import { useState, useEffect } from 'react';
import type { SaveData, KnownEntities, Status, Quest, GameHistoryEntry, Memory, Entity, CustomRule, Chronicle } from '../types';
import { MemoryMigration } from '../utils/MemoryMigration';

export interface GameState {
    // Core game data
    worldData: any;
    knownEntities: KnownEntities;
    statuses: Status[];
    quests: Quest[];
    gameHistory: GameHistoryEntry[];
    memories: Memory[];
    party: Entity[];
    customRules: CustomRule[];
    systemInstruction: string;
    chronicle: Chronicle;
    gameTime: any;
    
    // Game progression
    turnCount: number;
    currentTurnTokens: number;
    totalTokens: number;
    
    // Story and choices
    storyLog: string[];
    choices: string[];
    locationDiscoveryOrder: string[];
    choiceHistory: Array<{
        turn: number;
        choices: string[];
        selectedChoice?: string;
        context?: string;
    }>;
    
    // UI state
    isLoading: boolean;
    hasGeneratedInitialStory: boolean;
    customAction: string;
}

export interface GameStateActions {
    // Core game data setters
    setWorldData: (data: any) => void;
    setKnownEntities: (entities: KnownEntities | ((prev: KnownEntities) => KnownEntities)) => void;
    setStatuses: (statuses: Status[] | ((prev: Status[]) => Status[])) => void;
    setQuests: (quests: Quest[] | ((prev: Quest[]) => Quest[])) => void;
    setGameHistory: (history: GameHistoryEntry[] | ((prev: GameHistoryEntry[]) => GameHistoryEntry[])) => void;
    setMemories: (memories: Memory[] | ((prev: Memory[]) => Memory[])) => void;
    setParty: (party: Entity[] | ((prev: Entity[]) => Entity[])) => void;
    setCustomRules: (rules: CustomRule[]) => void;
    setSystemInstruction: (instruction: string) => void;
    setChronicle: (chronicle: Chronicle | ((prev: Chronicle) => Chronicle)) => void;
    setGameTime: (time: any | ((prev: any) => any)) => void;
    
    // Game progression setters
    setTurnCount: (count: number | ((prev: number) => number)) => void;
    setCurrentTurnTokens: (tokens: number) => void;
    setTotalTokens: (tokens: number | ((prev: number) => number)) => void;
    
    // Story and choices setters
    setStoryLog: (log: string[] | ((prev: string[]) => string[])) => void;
    setChoices: (choices: string[]) => void;
    setLocationDiscoveryOrder: (order: string[] | ((prev: string[]) => string[])) => void;
    updateChoiceHistory: (choices: string[], selectedChoice?: string, context?: string) => void;
    
    // UI state setters
    setIsLoading: (loading: boolean) => void;
    setHasGeneratedInitialStory: (generated: boolean) => void;
    setCustomAction: (action: string) => void;
}

export const useGameState = (
    initialGameState: SaveData,
    isAiReady: boolean,
    rehydratedLog: string[],
    rehydratedChoices: string[]
): [GameState, GameStateActions] => {
    // Core game data
    const [worldData, setWorldData] = useState(initialGameState.worldData);
    const [knownEntities, setKnownEntities] = useState<KnownEntities>(initialGameState.knownEntities);
    const [statuses, setStatuses] = useState<Status[]>(initialGameState.statuses);
    const [quests, setQuests] = useState<Quest[]>(initialGameState.quests);
    const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>(initialGameState.gameHistory);
    const [memories, setMemories] = useState<Memory[]>(() => {
        // Auto-migrate memories to enhanced format if needed
        if (MemoryMigration.needsMigration(initialGameState.memories)) {
            const migratedState = MemoryMigration.autoMigrateOnLoad(initialGameState);
            return migratedState.memories;
        }
        return initialGameState.memories;
    });
    const [party, setParty] = useState<Entity[]>(initialGameState.party);
    const [customRules, setCustomRules] = useState<CustomRule[]>(initialGameState.customRules);
    const [systemInstruction, setSystemInstruction] = useState<string>(initialGameState.systemInstruction);
    const [chronicle, setChronicle] = useState<Chronicle>(initialGameState.chronicle);
    const [gameTime, setGameTime] = useState(initialGameState.gameTime || { year: 1, month: 1, day: 1, hour: 8, minute: 0 });
    
    // Game progression
    const [turnCount, setTurnCount] = useState<number>(initialGameState.turnCount);
    const [currentTurnTokens, setCurrentTurnTokens] = useState<number>(0);
    const [totalTokens, setTotalTokens] = useState<number>(initialGameState.totalTokens || 0);
    
    // Story and choices
    const [storyLog, setStoryLog] = useState<string[]>(rehydratedLog);
    const [choices, setChoices] = useState<string[]>(rehydratedChoices);
    const [locationDiscoveryOrder, setLocationDiscoveryOrder] = useState<string[]>(() => {
        // Priority 1: Use directly saved order if it exists
        if (Array.isArray(initialGameState.locationDiscoveryOrder)) {
            const savedOrder = [...initialGameState.locationDiscoveryOrder];
            const seen = new Set(savedOrder);
            const allKnownLocations = Object.values(initialGameState.knownEntities)
                .filter(e => e.type === 'location')
                .map(e => e.name);

            allKnownLocations.forEach(locName => {
                if (!seen.has(locName)) {
                    savedOrder.push(locName);
                }
            });
            return savedOrder;
        }

        // Priority 2: Fallback for older saves - rehydrate from history
        const order: string[] = [];
        const seen = new Set<string>();
        initialGameState.gameHistory.forEach(entry => {
            if (entry.role === 'model') {
                 try {
                    const jsonResponse = JSON.parse(entry.parts[0].text);
                    const storyText = jsonResponse.story || '';
                    const tagRegex = /\[LORE_LOCATION:\s*name="([^"]+)"[^\]]*\]/g;
                    let match;
                    while ((match = tagRegex.exec(storyText)) !== null) {
                        const locName = match[1];
                        if (!seen.has(locName)) {
                            order.push(locName);
                            seen.add(locName);
                        }
                    }
                } catch (e) { /* Ignore non-json responses */ }
            }
        });
        
        // Final fallback: Ensure all known locations are at least present, even if order is arbitrary
        const knownLocations = Object.values(initialGameState.knownEntities)
            .filter(e => e.type === 'location')
            .map(e => e.name);
            
        knownLocations.forEach(locName => {
            if (!seen.has(locName)) {
                order.push(locName);
                seen.add(locName);
            }
        });

        return order;
    });
    const [choiceHistory, setChoiceHistory] = useState<Array<{
        turn: number;
        choices: string[];
        selectedChoice?: string;
        context?: string;
    }>>(initialGameState.choiceHistory || []);
    
    // UI state
    const [isLoading, setIsLoading] = useState(initialGameState.gameHistory.length === 0 && isAiReady);
    const [hasGeneratedInitialStory, setHasGeneratedInitialStory] = useState<boolean>(false);
    const [customAction, setCustomAction] = useState('');
    
    // Choice history update function
    const updateChoiceHistory = (choices: string[], selectedChoice?: string, context?: string) => {
        setChoiceHistory(prev => {
            const newEntry = {
                turn: turnCount,
                choices: [...choices],
                selectedChoice,
                context
            };
            
            // Keep only last 20 entries to prevent memory bloat
            const updated = [...prev, newEntry].slice(-20);
            return updated;
        });
    };

    const gameState: GameState = {
        worldData,
        knownEntities,
        statuses,
        quests,
        gameHistory,
        memories,
        party,
        customRules,
        systemInstruction,
        chronicle,
        gameTime,
        turnCount,
        currentTurnTokens,
        totalTokens,
        storyLog,
        choices,
        locationDiscoveryOrder,
        choiceHistory,
        isLoading,
        hasGeneratedInitialStory,
        customAction
    };

    const gameStateActions: GameStateActions = {
        setWorldData,
        setKnownEntities,
        setStatuses,
        setQuests,
        setGameHistory,
        setMemories,
        setParty,
        setCustomRules,
        setSystemInstruction,
        setChronicle,
        setGameTime,
        setTurnCount,
        setCurrentTurnTokens,
        setTotalTokens,
        setStoryLog,
        setChoices,
        setLocationDiscoveryOrder,
        updateChoiceHistory,
        setIsLoading,
        setHasGeneratedInitialStory,
        setCustomAction
    };

    return [gameState, gameStateActions];
};