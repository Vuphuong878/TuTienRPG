import type { SaveData, CustomRule, Memory, Entity } from '../types';
import { GameSettings } from '../GameSettingsModal';
import { ReferenceIdGenerator } from '../utils/ReferenceIdGenerator';
import { exportStoryImagesWithGameData, importStoryImagesFromGameData } from '../utils/storyImageSystem';

export interface GameStateHandlersParams {
    worldData: any;
    knownEntities: { [key: string]: Entity };
    statuses: any[];
    quests: any[];
    gameHistory: any[];
    memories: Memory[];
    party: Entity[];
    customRules: CustomRule[];
    systemInstruction: string;
    turnCount: number;
    totalTokens: number;
    gameTime: any;
    chronicle: any;
    compressedHistory: any[];
    historyStats: any;
    cleanupStats: any;
    archivedMemories: Memory[];
    memoryStats: any;
    storyLog: string[];
    choices: string[];
    locationDiscoveryOrder: string[];
    choiceHistory: Array<{
        turn: number;
        choices: string[];
        selectedChoice?: string;
        context?: string;
    }>;
    
    // Setters
    setShowSaveSuccess: (show: boolean) => void;
    setStoryLog: (log: string[]) => void;
    setChoices: (choices: string[]) => void;
    setStatuses: (statuses: any[]) => void;
    setQuests: (quests: any[]) => void;
    setMemories: (memories: Memory[]) => void;
    setKnownEntities: (entities: { [key: string]: Entity }) => void;
    setParty: (party: Entity[]) => void;
    setCustomRules: (rules: CustomRule[]) => void;
    setTurnCount: (count: number) => void;
    setTotalTokens: (tokens: number) => void;
    setGameTime: (time: any) => void;
    setChronicle: (chronicle: any) => void;
    setRuleChanges: (changes: any) => void;
    setGameHistory: (history: any[]) => void;
    setHasGeneratedInitialStory: (generated: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    
    // Refs and other state
    isGeneratingRef: React.MutableRefObject<boolean>;
    initialGameState: SaveData;
    previousRulesRef: React.MutableRefObject<CustomRule[]>;
}

export const createGameStateHandlers = (params: GameStateHandlersParams) => {
    const {
        worldData, knownEntities, statuses, quests, gameHistory, memories, party,
        customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle,
        compressedHistory, historyStats, cleanupStats, archivedMemories, memoryStats,
        storyLog, choices, locationDiscoveryOrder, choiceHistory,
        setShowSaveSuccess, setStoryLog, setChoices, setStatuses, setQuests, setMemories,
        setKnownEntities, setParty, setCustomRules, setTurnCount, setTotalTokens, setGameTime, setChronicle,
        setRuleChanges, setGameHistory, setHasGeneratedInitialStory, setIsLoading,
        isGeneratingRef, initialGameState, previousRulesRef
    } = params;

    const handleSaveGame = () => {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);

        const currentGameState: SaveData = {
            worldData, knownEntities, statuses, quests, gameHistory, memories, party,
            customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle,
            compressedHistory, historyStats, cleanupStats, archivedMemories, memoryStats,
            storyLog, choices, locationDiscoveryOrder, choiceHistory
        };
        
        // Export with story images included
        const gameStateWithImages = exportStoryImagesWithGameData(currentGameState);
        
        const jsonString = JSON.stringify(gameStateWithImages, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `AI-RolePlay-${worldData.characterName?.replace(/\s+/g, '_') || 'NhanVat'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleRestartGame = () => {
        setIsLoading(true);
        setStoryLog([]);
        setChoices([]);
        setStatuses([]);
        setQuests([]);
        setMemories([]);
        
        // Recreate PC entity from initial world data
        const pcEntity: Entity = {
            name: worldData.characterName || 'Vô Danh',
            type: 'pc',
            description: worldData.bio,
            gender: worldData.gender,
            age: worldData.characterAge,
            appearance: worldData.characterAppearance || initialGameState.knownEntities[worldData.characterName || 'Vô Danh']?.appearance || '',
            personality: worldData.customPersonality || worldData.personalityFromList,
            learnedSkills: [],
            referenceId: ReferenceIdGenerator.generateReferenceId(worldData.characterName || 'Vô Danh', 'pc'),
        };
        
        // Preserve LORE_CONCEPT entities but reset PC
        const conceptEntities = Object.values(initialGameState.knownEntities)
            .filter(entity => entity.type === 'concept')
            .reduce((acc, entity) => {
                acc[entity.name] = entity;
                return acc;
            }, {} as { [key: string]: Entity });
        
        const resetEntities = {
            [pcEntity.name]: pcEntity,
            ...conceptEntities
        };
        
        setKnownEntities(resetEntities);
        setParty([pcEntity]);
        setTurnCount(0);
        setTotalTokens(0);
        setGameTime({ 
            year: worldData.worldTime?.year || 1, 
            month: worldData.worldTime?.month || 1, 
            day: worldData.worldTime?.day || 1, 
            hour: 8 
        });
        setChronicle({ memoir: [], chapter: [], turn: [] });
        setRuleChanges(null);
        previousRulesRef.current = initialGameState.customRules;
        setGameHistory([]);
        setHasGeneratedInitialStory(false);
        isGeneratingRef.current = false;
    };

    // Settings change is now handled by useGameSettings hook

    const handleToggleMemoryPin = (index: number) => {
        setMemories(prev => prev.map((mem, i) => 
            i === index ? { ...mem, pinned: !mem.pinned } : mem
        ));
    };

    const handleSaveRules = (newRules: CustomRule[], setShowRulesSavedSuccess: (show: boolean) => void) => {
        // Rule change detection logic
        setCustomRules(newRules);
        previousRulesRef.current = JSON.parse(JSON.stringify(newRules));
        setShowRulesSavedSuccess(true);
        setTimeout(() => setShowRulesSavedSuccess(false), 3500);
    };

    return {
        handleSaveGame,
        handleRestartGame,
        handleToggleMemoryPin,
        handleSaveRules
    };
};