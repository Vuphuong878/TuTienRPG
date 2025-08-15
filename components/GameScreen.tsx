



import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AIContext } from '../App.tsx';
import type { SaveData, FormData, KnownEntities, Status, GameHistoryEntry, Memory, Entity, CustomRule, Chronicle, CompressedHistorySegment } from './types.ts';
import { buildEnhancedRagPrompt } from './promptBuilder.ts';

// Extracted Handlers
import { createGameActionHandlers } from './handlers/gameActionHandlers';
import { createEntityHandlers } from './handlers/entityHandlers';
import { createGameStateHandlers } from './handlers/gameStateHandlers';
import { createAutoTrimmedStoryLog } from './utils/storyLogUtils';
import { createCommandTagProcessor } from './utils/commandTagProcessor';
import { partyDebugger } from './utils/partyDebugger';

// Custom Hooks
import { useGameState } from './hooks/useGameState';
import { useModalState } from './hooks/useModalState';
import { useGameSettings } from './hooks/useGameSettings';
import { useHistoryCompression } from './hooks/useHistoryCompression';

// Modal Imports
import { MemoizedModals } from './MemoizedModals.tsx';
import { GameSettingsModal, GameSettings } from './GameSettingsModal.tsx';
import { EntityImportModal } from './EntityImportModal';

// UI Components
import { DesktopHeader } from './game/DesktopHeader.tsx';
import { MobileHeader } from './game/MobileHeader.tsx';
import { StoryPanel } from './game/StoryPanel.tsx';
import { ActionPanel } from './game/ActionPanel.tsx';
import { SidebarNav } from './game/SidebarNav.tsx';
import { GameNotifications } from './game/GameNotifications.tsx';
import { MobileInputFooter } from './game/MobileInputFooter.tsx';
import { FloatingTimeDisplay } from './FloatingTimeDisplay.tsx';

// Optimization and Management
import { GameStateOptimizer, CleanupStats } from './GameStateOptimizer';
import { UnifiedMemoryManager } from './utils/UnifiedMemoryManager';
import { MemoryAnalytics } from './utils/MemoryAnalytics';
import { EntityExportManager } from './utils/EntityExportManager';
import { useDebouncedCallback } from './hooks/useDebounce.ts';
import { OptimizedInteractiveText } from './OptimizedInteractiveText.tsx';
import { getThemeColors } from './utils/themeUtils';
import { enhanceStoryItems } from './utils/storyImageEnhancer';

// Helper functions moved to extracted files

export const GameScreen: React.FC<{ 
    initialGameState: SaveData, 
    onBackToMenu: () => void,
    keyRotationNotification: string | null;
    onClearNotification: () => void;
}> = ({ initialGameState, onBackToMenu, keyRotationNotification, onClearNotification }) => {
    const { ai, isAiReady, apiKeyError, rotateKey, isUsingDefaultKey, userApiKeyCount, selectedModel } = useContext(AIContext);
    
    // Refs
    const isGeneratingRef = useRef<boolean>(false);
    const previousRulesRef = useRef<CustomRule[]>(initialGameState.customRules);

    // Rule change tracking
    const [ruleChanges, setRuleChanges] = useState<{ activated: CustomRule[], deactivated: CustomRule[], updated: { oldRule: CustomRule, newRule: CustomRule }[] } | null>(null);

    // --- Data Rehydration Logic ---
    const { rehydratedLog, rehydratedChoices } = useMemo(() => {
        // Priority 1: Use directly saved log and choices if they exist (new save format)
        if (Array.isArray(initialGameState.storyLog) && Array.isArray(initialGameState.choices)) {
            return {
                rehydratedLog: initialGameState.storyLog,
                rehydratedChoices: initialGameState.choices,
            };
        }
    
        // Priority 2: Fallback for older saves - rehydrate from history
        const log: string[] = [];
        let lastChoices: string[] = [];
    
        (initialGameState.gameHistory || []).forEach(entry => {
            if (entry.role === 'user') {
                const fullPrompt = entry.parts[0].text;
                const actionMatch = fullPrompt.match(/--- HÀNH ĐỘNG CỦA NGƯỜI CHƠI ---\n"([^"]+)"/);
                const actionText = actionMatch ? actionMatch[1] : null;
    
                if (actionText && actionText !== 'SYSTEM_RULE_UPDATE') {
                    log.push(`> ${actionText}`);
                }
            } else { // 'model' role
                try {
                    const jsonResponse = JSON.parse(entry.parts[0].text);
                    const storyText = jsonResponse.story || '';
                    // We need parseStoryAndTags here, but it's defined later, so we'll use a simplified version
                    const cleanStory = storyText.replace(/\[([A-Z_]+):\s*([^\]]+)\]/g, '').trim();
                    if (cleanStory) {
                        log.push(cleanStory);
                    }
                    lastChoices = jsonResponse.choices || [];
                } catch (e) {
                    const cleanText = entry.parts[0].text.replace(/\[([A-Z_]+):\s*([^\]]+)\]/g, '').trim();
                    log.push(cleanText);
                }
            }
        });
    
        return { rehydratedLog: log, rehydratedChoices: lastChoices };
    }, [initialGameState]); 

    // Initialize custom hooks
    const [gameSettingsState, gameSettingsActions] = useGameSettings();
    const [historyCompressionState, historyCompressionActions] = useHistoryCompression(initialGameState);
    const [gameState, gameStateActions] = useGameState(initialGameState, isAiReady, rehydratedLog, rehydratedChoices);
    const [modalState, modalStateActions] = useModalState();

    // Image Generation State
    const [isAutoImageEnabled, setIsAutoImageEnabled] = useState(() => {
        const saved = localStorage.getItem('rpg-auto-image-enabled');
        return saved ? JSON.parse(saved) : false;
    });

    // Save auto image preference
    useEffect(() => {
        localStorage.setItem('rpg-auto-image-enabled', JSON.stringify(isAutoImageEnabled));
    }, [isAutoImageEnabled]);

    const toggleAutoImageGeneration = useCallback(() => {
        setIsAutoImageEnabled((prev: boolean) => !prev);
    }, []);

    // Extract values from hooks for easier access
    const {
        worldData, knownEntities, statuses, quests, gameHistory, memories, party,
        customRules, systemInstruction, chronicle, gameTime, turnCount, currentTurnTokens,
        totalTokens, storyLog, choices, locationDiscoveryOrder, choiceHistory, isLoading,
        hasGeneratedInitialStory, customAction
    } = gameState;

    const {
        setWorldData, setKnownEntities, setStatuses, setQuests, setGameHistory, setMemories,
        setParty, setCustomRules, setSystemInstruction, setChronicle, setGameTime,
        setTurnCount, setCurrentTurnTokens, setTotalTokens, setStoryLog, setChoices,
        setLocationDiscoveryOrder, updateChoiceHistory, setIsLoading, setHasGeneratedInitialStory, setCustomAction
    } = gameStateActions;

    // Create auto-trimmed story log for main story updates
    const storyLogManager = useMemo(() => createAutoTrimmedStoryLog(setStoryLog), [setStoryLog]);

    const {
        isHomeModalOpen, isRestartModalOpen, isMemoryModalOpen, isKnowledgeModalOpen,
        isCustomRulesModalOpen, isMapModalOpen, isPcInfoModalOpen, isPartyModalOpen,
        isQuestLogModalOpen, isSidebarOpen, isChoicesModalOpen, isGameSettingsModalOpen, isEntityImportModalOpen,
        isInventoryModalOpen, isAdminModalOpen, isEditItemModalOpen, isEditSkillModalOpen, isEditNPCModalOpen, isEditPCModalOpen, isEditLocationModalOpen, activeEntity, activeStatus, activeQuest, activeEditItem, activeEditSkill, activeEditNPC, activeEditPC, activeEditLocation, showSaveSuccess, showRulesSavedSuccess,
        notification
    } = modalState;

    const {
        setIsHomeModalOpen, setIsRestartModalOpen, setIsMemoryModalOpen, setIsKnowledgeModalOpen,
        setIsCustomRulesModalOpen, setIsMapModalOpen, setIsPcInfoModalOpen, setIsPartyModalOpen,
        setIsQuestLogModalOpen, setIsSidebarOpen, setIsChoicesModalOpen, setIsGameSettingsModalOpen, setIsEntityImportModalOpen,
        setIsInventoryModalOpen, setIsAdminModalOpen, setIsEditItemModalOpen, setIsEditSkillModalOpen, setIsEditNPCModalOpen, setIsEditPCModalOpen, setIsEditLocationModalOpen, setActiveEntity, setActiveStatus, setActiveQuest, setActiveEditItem, setActiveEditSkill, setActiveEditNPC, setActiveEditPC, setActiveEditLocation, setShowSaveSuccess, setShowRulesSavedSuccess,
        setNotification, modalCloseHandlers
    } = modalStateActions;

    const { gameSettings } = gameSettingsState;
    const { handleSettingsChange } = gameSettingsActions;

    const { compressedHistory, historyStats, cleanupStats } = historyCompressionState;
    const { setCompressedHistory, setHistoryStats, setCleanupStats } = historyCompressionActions;

    // Unified Memory Management State
    const [archivedMemories, setArchivedMemories] = useState<Memory[]>(initialGameState.archivedMemories || []);
    const [memoryStats, setMemoryStats] = useState(initialGameState.memoryStats || {
        totalMemoriesArchived: 0,
        totalMemoriesEnhanced: 0,
        averageImportanceScore: 0,
        lastMemoryCleanupTurn: 0
    });

    const pcEntity = useMemo(() => Object.values(knownEntities).find(e => e.type === 'pc'), [knownEntities]);
    const pcName = pcEntity?.name;
    
    // Initialize handlers with current state
    const commandTagProcessor = useMemo(() => createCommandTagProcessor({
        setGameTime, setChronicle, setMemories, setStatuses, setKnownEntities, setQuests,
        setParty, setLocationDiscoveryOrder,
        knownEntities, statuses, party, turnCount, worldData
    }), [knownEntities, statuses, party, turnCount, worldData]);
    
    const parseStoryAndTags = useCallback((storyText: string, applySideEffects = true): string => {
        return commandTagProcessor.parseStoryAndTags(storyText, applySideEffects);
    }, [commandTagProcessor]);

    // Define response schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        story: { type: Type.STRING, description: "Phần văn bản tường thuật của câu chuyện, bao gồm các định dạng đặc biệt và các thẻ lệnh ẩn." },
        choices: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Một mảng gồm 4-6 lựa chọn cho người chơi."
        },
      },
      required: ['story', 'choices']
    };

    // Initialize game action handlers
    const gameActionHandlers = useMemo(() => createGameActionHandlers({
        ai, selectedModel, systemInstruction, responseSchema,
        isUsingDefaultKey, userApiKeyCount, rotateKey, rehydratedChoices,
        setIsLoading, setChoices, setCustomAction, setStoryLog, setGameHistory,
        setTurnCount, setCurrentTurnTokens, setTotalTokens,
        gameHistory, customRules, ruleChanges, setRuleChanges, parseStoryAndTags,
        updateChoiceHistory
    }), [ai, selectedModel, systemInstruction, responseSchema, isUsingDefaultKey, userApiKeyCount, rotateKey, rehydratedChoices, gameHistory, customRules, ruleChanges, parseStoryAndTags, updateChoiceHistory]);

    // Function to get current game state
    const getCurrentGameState = useCallback((): SaveData => {
        return {
            worldData,
            knownEntities,
            statuses,
            quests,
            gameHistory,
            memories,
            party,
            customRules,
            systemInstruction,
            turnCount,
            totalTokens,
            gameTime,
            chronicle,
            storyLog,
            choices: choices
        };
    }, [worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, storyLog, choices]);

    // Initialize entity handlers  
    const entityHandlers = useMemo(() => createEntityHandlers({
        knownEntities,
        setKnownEntities,
        setActiveEntity,
        setActiveStatus,
        setActiveQuest,
        handleAction: gameActionHandlers.handleAction,
        getCurrentGameState
    }), [knownEntities, setKnownEntities, gameActionHandlers, getCurrentGameState]);

    // Initialize game state handlers
    const gameStateHandlers = useMemo(() => createGameStateHandlers({
        worldData, knownEntities, statuses, quests, gameHistory, memories, party,
        customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle,
        compressedHistory, historyStats, cleanupStats, archivedMemories, memoryStats,
        storyLog, choices, locationDiscoveryOrder, choiceHistory,
        setShowSaveSuccess, setStoryLog, setChoices, setStatuses, setQuests, setMemories,
        setKnownEntities, setParty, setCustomRules, setTurnCount, setTotalTokens, setGameTime, setChronicle,
        setRuleChanges, setGameHistory, setHasGeneratedInitialStory, setIsLoading,
        isGeneratingRef, initialGameState, previousRulesRef
    }), [worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory, historyStats, cleanupStats, archivedMemories, memoryStats, storyLog, choices, locationDiscoveryOrder, choiceHistory]);

    // --- Handle Key Rotation Notification ---
    useEffect(() => {
        if (keyRotationNotification) {
            setNotification(keyRotationNotification);
            const timer = setTimeout(() => {
                setNotification(null);
                onClearNotification();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [keyRotationNotification, onClearNotification]);

    // Monitor party changes for debugging
    useEffect(() => {
        partyDebugger.monitorPartyChanges(party, statuses, turnCount);
    }, [party, statuses, turnCount]);

    // Configure EntityExportManager with game settings
    useEffect(() => {
        EntityExportManager.configure({
            enabled: gameSettings.entityExportEnabled,
            exportInterval: gameSettings.entityExportInterval,
            enableDebugLogging: gameSettings.entityExportDebugLogging,
            exportPath: '/data/game-exports/',
            maxFileSize: 1024 * 1024, // 1MB
            // Import settings
            importEnabled: gameSettings.entityImportEnabled,
            autoMergeOnImport: gameSettings.entityAutoMergeOnImport,
            backupBeforeImport: gameSettings.entityBackupBeforeImport
        });
        
        // Entity export debugging disabled
    }, [gameSettings.entityExportEnabled, gameSettings.entityExportInterval, gameSettings.entityExportDebugLogging]);

    // Auto-enhance story items with image generation
    useEffect(() => {
        const timeout = setTimeout(() => {
            enhanceStoryItems();
        }, 500); // Small delay to ensure DOM is updated
        
        return () => clearTimeout(timeout);
    }, [storyLog]);
    
    // Define generateInitialStory callback before using it
    const generateInitialStory = useCallback(async () => {
        if (!pcEntity) return;
        const initialHistory: GameHistoryEntry[] = [];
        await gameActionHandlers.generateInitialStory(worldData, knownEntities, pcEntity, initialHistory);
        isGeneratingRef.current = false;
    }, [gameActionHandlers, worldData, knownEntities, pcEntity]);
    
    useEffect(() => {
        if (gameHistory.length === 0 && isAiReady && storyLog.length === 0 && !hasGeneratedInitialStory && !isGeneratingRef.current) {
            setIsLoading(true);
            setHasGeneratedInitialStory(true);
            isGeneratingRef.current = true;
            generateInitialStory();
        } else if (!isAiReady) {
            setStoryLog([apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra API Key và quay về trang chủ."])
            setIsLoading(false);
        }
    }, [isAiReady, hasGeneratedInitialStory, generateInitialStory, gameHistory.length, storyLog.length, apiKeyError]); 

    // Automatic cleanup and history management effect
    useEffect(() => {
        // Add more strict conditions to prevent running during initialization
        if (turnCount === 0 || 
            !hasGeneratedInitialStory || 
            isLoading ||
            gameHistory.length === 0 ||
            (cleanupStats && turnCount <= cleanupStats.lastCleanupTurn)) {
            return;
        }

        const currentState: SaveData = {
            worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory,
            lastCompressionTurn: historyStats.compressionCount, // This seems to be used as an indicator, not a turn number
            historyStats, cleanupStats, archivedMemories, memoryStats
        };
        
        // Automatic unified cleanup logic (only if enabled in settings)
        let optimizerResult = null;
        let unifiedCleanupResult = null;
        
        if (gameSettings.memoryAutoClean || gameSettings.historyAutoCompress) {
            // Try unified cleanup first with smart memory generation (more aggressive settings)
            unifiedCleanupResult = UnifiedMemoryManager.coordinatedCleanup(currentState, {
                maxActiveMemories: 45,               // More aggressive than before (50->45)
                memoryCleanupThreshold: 65,          // More aggressive than before (70->65)
                lowImportanceThreshold: 28,          // More aggressive than before (30->28)
                maxActiveHistoryEntries: 28,         // More aggressive than before (30->28)
                historyCompressionThreshold: 28,     // More aggressive than before (30->28)
                maxTokenBudget: 8000,
                memoryTokenRatio: 0.32,              // Slightly higher than before (0.3->0.32)
                enableSmartMemoryGeneration: true,
                smartMemoryConfig: {
                    enableEventMemories: true,
                    enableRelationshipMemories: true,
                    enableDiscoveryMemories: true,
                    enableCombatMemories: true,
                    enableAchievementMemories: true,
                    minImportanceThreshold: 45,      // Reduced from 60 to allow more memory creation
                    maxMemoriesPerTurn: 3,           // Increased from 1 to create more memories
                    lookbackTurns: 6                 // Increased from 2 to analyze more turns
                }
            });
            
            if (unifiedCleanupResult.cleanupTriggered) {
                console.log("🔄 Applying unified auto cleanup (improved settings)...");
                
                // Update memories
                const activeMemories = [...unifiedCleanupResult.memoriesProcessed.kept, ...unifiedCleanupResult.memoriesProcessed.enhanced];
                setMemories(activeMemories);
                
                // Update archived memories
                setArchivedMemories(prev => [...prev, ...unifiedCleanupResult.memoriesProcessed.archived]);
                
                // Update memory stats
                setMemoryStats(prev => ({
                    totalMemoriesArchived: prev.totalMemoriesArchived + unifiedCleanupResult.memoriesProcessed.archived.length,
                    totalMemoriesEnhanced: prev.totalMemoriesEnhanced + unifiedCleanupResult.memoriesProcessed.enhanced.length,
                    averageImportanceScore: UnifiedMemoryManager.getOptimizationStats(activeMemories, archivedMemories).averageImportance,
                    lastMemoryCleanupTurn: turnCount
                }));
                
                // Update history
                setGameHistory(unifiedCleanupResult.historyProcessed.activeEntries);
                
                // Add compressed segment if created
                if (unifiedCleanupResult.historyProcessed.compressed) {
                    setCompressedHistory(prev => [...prev, unifiedCleanupResult.historyProcessed.compressed!]);
                    setHistoryStats(prev => ({
                        ...prev,
                        compressionCount: prev.compressionCount + 1,
                        totalTokensSaved: prev.totalTokensSaved + unifiedCleanupResult.tokensSaved,
                        lastCompressionTurn: turnCount
                    }));
                }
                
                // Run additional entity cleanup (use more aggressive force cleanup like manual)
                optimizerResult = GameStateOptimizer.forceCleanup(currentState, false); // false = auto mode, less aggressive than manual
                setKnownEntities(optimizerResult.optimizedState.knownEntities);
                setStatuses(optimizerResult.optimizedState.statuses);
                setChronicle(optimizerResult.optimizedState.chronicle);
                
                setCleanupStats(prev => ({
                    totalCleanupsPerformed: (prev?.totalCleanupsPerformed || 0) + 1,
                    totalTokensSavedFromCleanup: (prev?.totalTokensSavedFromCleanup || 0) + unifiedCleanupResult.tokensSaved + (optimizerResult?.stats.totalTokensSaved || 0),
                    lastCleanupTurn: turnCount,
                    cleanupHistory: [...(prev?.cleanupHistory || []), { 
                        turn: turnCount, 
                        tokensSaved: unifiedCleanupResult.tokensSaved + (optimizerResult?.stats.totalTokensSaved || 0), 
                        itemsRemoved: unifiedCleanupResult.memoriesProcessed.archived.length + (optimizerResult?.stats.memoriesRemoved || 0) + (optimizerResult?.stats.chronicleEntriesRemoved || 0) + (optimizerResult?.stats.entitiesArchived || 0)
                    }]
                }));
                
                console.log("✅ Improved auto cleanup completed:", {
                    memoriesArchived: unifiedCleanupResult.memoriesProcessed.archived.length,
                    memoriesEnhanced: unifiedCleanupResult.memoriesProcessed.enhanced.length,
                    smartMemoriesGenerated: unifiedCleanupResult.smartMemoriesGenerated?.memories.length || 0,
                    historyCompressed: !!unifiedCleanupResult.historyProcessed.compressed,
                    tokensSaved: unifiedCleanupResult.tokensSaved,
                    entitiesOptimized: optimizerResult?.stats.entitiesArchived || 0
                });
            } else if (gameSettings.memoryAutoClean) {
                // Fallback to legacy cleanup if unified didn't trigger but memory auto clean is enabled
                console.log("🔄 Applying fallback auto cleanup (unified didn't trigger)...");
                optimizerResult = GameStateOptimizer.forceCleanup(currentState, false); // Use forceCleanup for better results
                const { optimizedState, stats } = optimizerResult;
                setKnownEntities(optimizedState.knownEntities);
                setStatuses(optimizedState.statuses);
                setMemories(optimizedState.memories);
                setChronicle(optimizedState.chronicle);
                setCleanupStats(prev => ({
                    totalCleanupsPerformed: (prev?.totalCleanupsPerformed || 0) + 1,
                    totalTokensSavedFromCleanup: (prev?.totalTokensSavedFromCleanup || 0) + stats.totalTokensSaved,
                    lastCleanupTurn: turnCount,
                    cleanupHistory: [...(prev?.cleanupHistory || []), { turn: turnCount, tokensSaved: stats.totalTokensSaved, itemsRemoved: stats.memoriesRemoved + stats.chronicleEntriesRemoved + stats.entitiesArchived }]
                }));
            }
        }

        // UnifiedMemoryManager handles all memory operations including history compression
        if (!gameSettings.historyAutoCompress) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`⏸️ [${timestamp}] Auto History Compression Disabled:`, {
                turn: turnCount,
                currentHistorySize: gameHistory.length,
                autoCompressEnabled: false
            });
        }
    }, [turnCount]);
    
    const parseApiResponse = useCallback((text: string) => {
        try {
            // Check if response is empty or whitespace only
            if (!text || text.trim().length === 0) {
                console.error("Empty AI response received");
                setStoryLog(prev => [...prev, "Lỗi: AI trả về phản hồi trống. Hãy thử lại."]);
                setChoices([]);
                return;
            }
            
            // Clean the response text to remove any non-JSON content
            let cleanText = text.trim();
            
            // If response starts with markdown code block, extract JSON
            if (cleanText.startsWith('```json')) {
                const jsonMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    cleanText = jsonMatch[1].trim();
                }
            } else if (cleanText.startsWith('```')) {
                const jsonMatch = cleanText.match(/```\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    cleanText = jsonMatch[1].trim();
                }
            }
            
            // Try to find JSON object if response has extra text
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            }
            
            // Final check if cleanText is valid before parsing
            if (!cleanText || cleanText.length === 0) {
                console.error("No valid JSON found in response");
                setStoryLog(prev => [...prev, "Lỗi: Không tìm thấy JSON hợp lệ trong phản hồi. Hãy thử lại."]);
                setChoices([]);
                return;
            }
            
            const jsonResponse = JSON.parse(cleanText);
            
            // Validate required fields
            if (!jsonResponse.story) {
                console.error("Missing story field in JSON response");
                setStoryLog(prev => [...prev, "Lỗi: Phản hồi thiếu nội dung câu chuyện. Hãy thử lại."]);
                setChoices([]);
                return;
            }
            
            const cleanStory = parseStoryAndTags(jsonResponse.story, true);
            storyLogManager.update(prev => [...prev, cleanStory]);
            setChoices(jsonResponse.choices || []);
        } catch (e) {
            console.error("Failed to parse AI response:", e, "Raw response:", text);
            setStoryLog(prev => [...prev, "Lỗi: AI trả về dữ liệu không hợp lệ. Hãy thử lại."]);
            setChoices([]);
        }
    }, [parseStoryAndTags]);
    const handleAction = useCallback(async (action: string) => {
        if (isLoading || !ai) return;
        const currentGameState: SaveData = {
            worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory
        };
        await gameActionHandlers.handleAction(action, currentGameState);
    }, [gameActionHandlers, isLoading, ai, worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory]);

    const debouncedHandleAction = useDebouncedCallback((action: string) => {
        handleAction(action);
    }, 300);
    
    const handleEntityClick = useCallback((entityName: string) => entityHandlers.handleEntityClick(entityName), [entityHandlers]);
    const handleUseItem = useCallback((itemName: string) => entityHandlers.handleUseItem(itemName), [entityHandlers]);
    const handleLearnItem = useCallback((itemName: string) => entityHandlers.handleLearnItem(itemName), [entityHandlers]);
    const handleEquipItem = useCallback((itemName: string) => entityHandlers.handleEquipItem(itemName), [entityHandlers]);
    const handleUnequipItem = useCallback((itemName: string) => entityHandlers.handleUnequipItem(itemName), [entityHandlers]);
    const handleDiscardItem = useCallback((item: Entity) => {
        console.log(`🗑️ GameScreen: Discard request for "${item.name}", owner: ${item.owner}`);
        
        // Directly process the discard by removing the item from knownEntities
        setKnownEntities(prev => {
            const newEntities = { ...prev };
            console.log(`🗑️ GameScreen: Checking if item "${item.name}" exists in knownEntities:`, !!newEntities[item.name]);
            
            if (newEntities[item.name] && (newEntities[item.name].owner === 'pc' || !newEntities[item.name].owner)) {
                delete newEntities[item.name];
                console.log(`🗑️ GameScreen: Item "${item.name}" successfully removed from knownEntities`);
            } else {
                console.log(`🗑️ GameScreen: Item "${item.name}" not removed - does not meet criteria (exists: ${!!newEntities[item.name]}, owner: ${newEntities[item.name]?.owner})`);
            }
            return newEntities;
        });
        
        // Also add to story log to show the action happened
        setStoryLog(prev => [...prev, `> Vứt bỏ ${item.name}`, `Bạn đã vứt bỏ **${item.name}** khỏi túi đồ.`]);
    }, [setKnownEntities, setStoryLog]);

    const handleSaveEditedItem = useCallback((originalItem: Entity, editedItem: Entity) => {
        setKnownEntities(prev => {
            const newEntities = { ...prev };
            
            // If the name changed, remove the old item
            if (originalItem.name !== editedItem.name) {
                delete newEntities[originalItem.name];
                console.log(`✏️ Item renamed: ${originalItem.name} → ${editedItem.name}, old item removed`);
            }
            
            // Add/update the edited item
            newEntities[editedItem.name] = editedItem;
            console.log(`✏️ Item edited: ${editedItem.name} has been updated`);
            
            return newEntities;
        });
        
        // Show success notification
        setNotification("Vật phẩm đã được chỉnh sửa thành công!");
        setTimeout(() => setNotification(null), 3000);
        
        // Close the edit modal
        setIsEditItemModalOpen(false);
        setActiveEditItem(null);
    }, [setKnownEntities, setNotification, setIsEditItemModalOpen, setActiveEditItem]);

    const handleSaveEditedSkill = useCallback((originalSkill: Entity, editedSkill: Entity) => {
        setKnownEntities(prev => {
            const newEntities = { ...prev };
            
            // If the name changed, remove the old skill
            if (originalSkill.name !== editedSkill.name) {
                delete newEntities[originalSkill.name];
                console.log(`✏️ Skill renamed: ${originalSkill.name} → ${editedSkill.name}, old skill removed`);
            }
            
            // Add/update the edited skill
            newEntities[editedSkill.name] = editedSkill;
            console.log(`✏️ Skill edited: ${editedSkill.name} has been updated`);
            
            return newEntities;
        });
        
        // Show success notification
        setNotification("Kỹ năng đã được chỉnh sửa thành công!");
        setTimeout(() => setNotification(null), 3000);
        
        // Close the edit modal
        setIsEditSkillModalOpen(false);
        setActiveEditSkill(null);
    }, [setKnownEntities, setNotification, setIsEditSkillModalOpen, setActiveEditSkill]);

    const handleSaveEditedNPC = useCallback((originalNPC: Entity, editedNPC: Entity) => {
        setKnownEntities(prev => {
            const newEntities = { ...prev };
            
            // If the name changed, remove the old NPC
            if (originalNPC.name !== editedNPC.name) {
                delete newEntities[originalNPC.name];
                console.log(`✏️ NPC renamed: ${originalNPC.name} → ${editedNPC.name}, old NPC removed`);
            }
            
            // Add/update the edited NPC
            newEntities[editedNPC.name] = editedNPC;
            console.log(`✏️ NPC edited: ${editedNPC.name} has been updated`);
            console.log(`✏️ NPC Skills Status - "${editedNPC.name}" skills:`, editedNPC.skills);
            
            return newEntities;
        });
        
        // Show success notification
        setNotification("NPC đã được chỉnh sửa thành công!");
        setTimeout(() => setNotification(null), 3000);
        
        // Close the edit modal
        setIsEditNPCModalOpen(false);
        setActiveEditNPC(null);
    }, [setKnownEntities, setNotification, setIsEditNPCModalOpen, setActiveEditNPC]);

    const handleSaveEditedPC = useCallback((originalPC: Entity, editedPC: Entity) => {
        setKnownEntities(prev => {
            const newEntities = { ...prev };
            
            // If the name changed, remove the old PC
            if (originalPC.name !== editedPC.name) {
                delete newEntities[originalPC.name];
                console.log(`✏️ PC renamed: ${originalPC.name} → ${editedPC.name}, old PC removed`);
            }
            
            // Add/update the edited PC
            newEntities[editedPC.name] = editedPC;
            console.log(`✏️ PC edited: ${editedPC.name} has been updated`);
            
            return newEntities;
        });
        
        // Show success notification
        setNotification("Thông tin nhân vật chính đã được cập nhật thành công!");
        setTimeout(() => setNotification(null), 3000);
        
        // Close the edit modal
        setIsEditPCModalOpen(false);
        setActiveEditPC(null);
    }, [setKnownEntities, setNotification, setIsEditPCModalOpen, setActiveEditPC]);

    const handleSaveEditedLocation = useCallback((originalLocation: Entity, editedLocation: Entity) => {
        setKnownEntities(prev => {
            const newEntities = { ...prev };
            
            // If the name changed, remove the old location
            if (originalLocation.name !== editedLocation.name) {
                delete newEntities[originalLocation.name];
                console.log(`✏️ Location renamed: ${originalLocation.name} → ${editedLocation.name}, old location removed`);
            }
            
            // Add/update the edited location
            newEntities[editedLocation.name] = editedLocation;
            console.log(`✏️ Location edited: ${editedLocation.name} has been updated`);
            
            return newEntities;
        });
        
        // Show success notification
        setNotification("Thông tin địa điểm đã được cập nhật thành công!");
        setTimeout(() => setNotification(null), 3000);
        
        // Close the edit modal
        setIsEditLocationModalOpen(false);
        setActiveEditLocation(null);
    }, [setKnownEntities, setNotification, setIsEditLocationModalOpen, setActiveEditLocation]);

    const handleDeleteStatus = useCallback((statusName: string, entityName: string) => {
        setStatuses(prev => {
            const newStatuses = prev.filter(status => 
                !(status.name === statusName && (status.owner === entityName || (entityName === 'pc' && status.owner === 'pc')))
            );
            console.log(`🗑️ Status deleted: "${statusName}" removed from ${entityName}`);
            return newStatuses;
        });
        
        // Show success notification
        setNotification(`Trạng thái "${statusName}" đã được xóa thành công!`);
        setTimeout(() => setNotification(null), 3000);
    }, [setStatuses, setNotification]);

    const handleStatusClick = useCallback((status: Status) => entityHandlers.handleStatusClick(status), [entityHandlers]);
    const handleToggleMemoryPin = useCallback((index: number) => gameStateHandlers.handleToggleMemoryPin(index), [gameStateHandlers]);
    
    const handleSuggestAction = useCallback(async () => {
        const currentGameState: SaveData = {
            worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory
        };
        await gameActionHandlers.handleSuggestAction(storyLog, currentGameState);
    }, [gameActionHandlers, storyLog, worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory]);

    const handleSaveGame = useCallback(() => {
        gameStateHandlers.handleSaveGame();
    }, [gameStateHandlers]);

    const handleSaveRules = useCallback((newRules: CustomRule[]) => {
        gameStateHandlers.handleSaveRules(newRules, setShowRulesSavedSuccess);
    }, [gameStateHandlers]);

    const handleRestartGame = useCallback(() => {
        setIsRestartModalOpen(false);
        gameStateHandlers.handleRestartGame();
    }, [gameStateHandlers]);

    // Font settings are now handled in useGameSettings hook

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent shortcuts when typing in input fields
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Knowledge Base shortcut: K key or Ctrl+K
            if (e.key === 'k' || e.key === 'K' || (e.ctrlKey && e.key === 'k')) {
                e.preventDefault();
                setIsKnowledgeModalOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleManualCleanup = useCallback(() => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🧹 [${timestamp}] Manual Unified Cleanup Started:`, {
            turn: turnCount,
            beforeCleanup: {
                entities: Object.keys(knownEntities).length,
                statuses: statuses.length,
                memories: memories.length,
                historyEntries: gameHistory.length,
                chronicleEntries: `memoir:${chronicle.memoir.length}, chapter:${chronicle.chapter.length}, turn:${chronicle.turn.length}`
            }
        });
        
        const currentState: SaveData = {
            worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory,
            lastCompressionTurn: historyStats.compressionCount, 
            historyStats, cleanupStats, archivedMemories, memoryStats
        };
        
        // Use unified memory manager for coordinated cleanup with aggressive smart memory generation
        const unifiedResult = UnifiedMemoryManager.coordinatedCleanup(currentState, {
            maxActiveMemories: 40,
            memoryCleanupThreshold: 60,
            lowImportanceThreshold: 25,
            maxActiveHistoryEntries: 25,
            historyCompressionThreshold: 25,
            maxTokenBudget: 8000,
            memoryTokenRatio: 0.35,
            enableSmartMemoryGeneration: true,
            smartMemoryConfig: {
                enableEventMemories: true,
                enableRelationshipMemories: true,
                enableDiscoveryMemories: true,
                enableCombatMemories: true,
                enableAchievementMemories: true,
                minImportanceThreshold: 35, // Lower threshold for manual cleanup
                maxMemoriesPerTurn: 5,      // More memories for manual cleanup
                lookbackTurns: 10           // Longer lookback for manual cleanup
            }
        });
        
        // Apply unified cleanup results
        if (unifiedResult.cleanupTriggered) {
            // Update memories
            const activeMemories = [...unifiedResult.memoriesProcessed.kept, ...unifiedResult.memoriesProcessed.enhanced];
            setMemories(activeMemories);
            
            // Update archived memories
            setArchivedMemories(prev => [...prev, ...unifiedResult.memoriesProcessed.archived]);
            
            // Update memory stats
            setMemoryStats(prev => ({
                totalMemoriesArchived: prev.totalMemoriesArchived + unifiedResult.memoriesProcessed.archived.length,
                totalMemoriesEnhanced: prev.totalMemoriesEnhanced + unifiedResult.memoriesProcessed.enhanced.length,
                averageImportanceScore: UnifiedMemoryManager.getOptimizationStats(activeMemories, archivedMemories).averageImportance,
                lastMemoryCleanupTurn: turnCount
            }));
            
            // Update history
            setGameHistory(unifiedResult.historyProcessed.activeEntries);
            
            // Add compressed segment if created
            if (unifiedResult.historyProcessed.compressed) {
                setCompressedHistory(prev => [...prev, unifiedResult.historyProcessed.compressed!]);
                setHistoryStats(prev => ({
                    ...prev,
                    compressionCount: prev.compressionCount + 1,
                    totalTokensSaved: prev.totalTokensSaved + unifiedResult.tokensSaved,
                    lastCompressionTurn: turnCount
                }));
            }
            
            // Run additional entity cleanup
            const legacyResult = GameStateOptimizer.forceCleanup(currentState, true);
            setKnownEntities(legacyResult.optimizedState.knownEntities);
            setStatuses(legacyResult.optimizedState.statuses);
            setChronicle(legacyResult.optimizedState.chronicle);
            
            setCleanupStats(prev => ({
                ...prev!,
                totalCleanupsPerformed: (prev?.totalCleanupsPerformed || 0) + 1,
                totalTokensSavedFromCleanup: (prev?.totalTokensSavedFromCleanup || 0) + unifiedResult.tokensSaved + legacyResult.stats.totalTokensSaved,
                lastCleanupTurn: turnCount,
            }));

            console.log(`✅ [${timestamp}] Unified Cleanup Completed:`, {
                turn: turnCount,
                unifiedCleanup: {
                    memoriesArchived: unifiedResult.memoriesProcessed.archived.length,
                    memoriesEnhanced: unifiedResult.memoriesProcessed.enhanced.length,
                    memoriesKept: unifiedResult.memoriesProcessed.kept.length,
                    smartMemoriesGenerated: unifiedResult.smartMemoriesGenerated?.memories.length || 0,
                    historyCompressed: !!unifiedResult.historyProcessed.compressed,
                    tokensSaved: unifiedResult.tokensSaved
                },
                legacyCleanup: {
                    entitiesRemoved: Object.keys(knownEntities).length - Object.keys(legacyResult.optimizedState.knownEntities).length,
                    statusesRemoved: statuses.length - legacyResult.optimizedState.statuses.length
                },
                totalTokensSaved: unifiedResult.tokensSaved + legacyResult.stats.totalTokensSaved
            });

            setNotification(`🧹 Unified cleanup complete! Saved ~${Math.round((unifiedResult.tokensSaved + legacyResult.stats.totalTokensSaved) / 1000)}k tokens.`);
        } else {
            // Fallback to legacy cleanup if unified didn't trigger
            const result = GameStateOptimizer.forceCleanup(currentState, true);
            setKnownEntities(result.optimizedState.knownEntities);
            setStatuses(result.optimizedState.statuses);
            setMemories(result.optimizedState.memories);
            setChronicle(result.optimizedState.chronicle);
            
            setNotification(`🧹 Legacy cleanup complete! Saved ~${Math.round(result.stats.totalTokensSaved / 1000)}k tokens.`);
        }
        
        setTimeout(() => setNotification(null), 4000);
    }, [worldData, knownEntities, statuses, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory, historyStats, cleanupStats, archivedMemories, memoryStats]);

    // Debug function to show current system status
    const debugSystemStatus = useCallback(() => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🔍 [${timestamp}] System Status Debug:`, {
            gameInfo: {
                currentTurn: turnCount,
                totalTokens: totalTokens,
                currentTurnTokens: currentTurnTokens
            },
            historySystem: {
                autoCompressionEnabled: gameSettings.historyAutoCompress,
                activeHistoryEntries: gameHistory.length,
                compressedSegments: compressedHistory.length,
                historyStats: historyStats,
                lastCompression: historyStats.compressionCount > 0 ? `Segment ${historyStats.compressionCount}` : 'Never'
            },
            memoryCleanup: {
                totalCleanupsPerformed: cleanupStats?.totalCleanupsPerformed || 0,
                totalTokensSaved: cleanupStats?.totalTokensSavedFromCleanup || 0,
                lastCleanupTurn: cleanupStats?.lastCleanupTurn || 'Never'
            },
            gameState: {
                entities: Object.keys(knownEntities).length,
                statuses: statuses.length,
                memories: memories.length,
                chronicleMemoir: chronicle.memoir.length,
                chronicleChapter: chronicle.chapter.length,
                chronicleTurn: chronicle.turn.length
            }
        });
    }, [turnCount, gameSettings.historyAutoCompress, gameSettings.memoryAutoClean, hasGeneratedInitialStory, isLoading]);

    // Phase 4: Memory Analytics and Insights
    const analyzeMemories = useCallback(() => {
        const currentState: SaveData = {
            worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory,
            lastCompressionTurn: historyStats.compressionCount, 
            historyStats, cleanupStats, archivedMemories, memoryStats
        };
        
        const analytics = MemoryAnalytics.analyzeMemories(currentState);
        
        console.log('🔍 Memory Analytics Results:', analytics);
        
        // Show insights as notifications
        if (analytics.insights.length > 0) {
            const topInsight = analytics.insights[0];
            setNotification(`📊 Memory Insight: ${topInsight.title} - ${topInsight.description}`);
        } else {
            setNotification(`📊 Memory Analysis: ${analytics.overview.totalMemories} memories, ${analytics.overview.averageImportance.toFixed(1)} avg importance, ${analytics.overview.memoryHealth} health`);
        }
        
        setTimeout(() => setNotification(null), 6000);
    }, [worldData, knownEntities, statuses, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory, historyStats, cleanupStats, archivedMemories, memoryStats]);

    // Manual smart memory generation for testing
    const generateSmartMemories = useCallback(() => {
        const currentState: SaveData = {
            worldData, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory,
            lastCompressionTurn: historyStats.compressionCount, 
            historyStats, cleanupStats, archivedMemories, memoryStats
        };
        
        const result = UnifiedMemoryManager.generateSmartMemories(currentState, {
            enableEventMemories: true,
            enableRelationshipMemories: true,
            enableDiscoveryMemories: true,
            enableCombatMemories: true,
            enableAchievementMemories: true,
            minImportanceThreshold: 30,
            maxMemoriesPerTurn: 10,
            lookbackTurns: 10
        });
        
        if (result.memories.length > 0) {
            setMemories(prev => [...prev, ...result.memories]);
            setNotification(`🧠 Generated ${result.memories.length} smart memories! ${result.insights.join(', ')}`);
            console.log('🧠 Smart Memory Generation Result:', result);
        } else {
            setNotification(`🧠 No new smart memories generated from recent events.`);
        }
        
        setTimeout(() => setNotification(null), 5000);
    }, [worldData, knownEntities, statuses, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokens, gameTime, chronicle, compressedHistory, historyStats, cleanupStats, archivedMemories, memoryStats]);






    // WorldSetup export functionality
    const handleExportWorldSetup = useCallback(() => {
        try {
            const worldSetupData = {
                worldData,
                customRules,
                exportTimestamp: new Date().toISOString(),
                exportVersion: "1.0.0"
            };

            const dataStr = JSON.stringify(worldSetupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, -5);
            const storyName = (worldData.storyName || 'unnamed_story').replace(/\s+/g, '_');
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `worldsetup_${storyName}_${timestamp}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            setNotification('📤 WorldSetup đã được xuất thành công!');
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error('Error exporting WorldSetup:', error);
            setNotification('❌ Lỗi khi xuất WorldSetup');
            setTimeout(() => setNotification(null), 3000);
        }
    }, [worldData, customRules]);

    // Expose debug functions to window for manual testing
    React.useEffect(() => {
        (window as any).debugGameSystems = debugSystemStatus;
        (window as any).generateSmartMemories = generateSmartMemories;
        (window as any).analyzeMemories = analyzeMemories;
        
        // Debug function to clean duplicate memories
        (window as any).cleanDuplicateMemories = () => {
            setMemories(prev => {
                const uniqueMemories = [];
                const seenTexts = new Set();
                
                for (const memory of prev) {
                    if (!seenTexts.has(memory.text)) {
                        seenTexts.add(memory.text);
                        uniqueMemories.push(memory);
                    }
                }
                
                console.log(`🧹 Cleaned duplicate memories: ${prev.length} → ${uniqueMemories.length}`);
                setNotification(`🧹 Đã xóa ${prev.length - uniqueMemories.length} memory trùng lặp`);
                setTimeout(() => setNotification(null), 3000);
                
                return uniqueMemories;
            });
        };
        return () => {
            delete (window as any).debugGameSystems;
            delete (window as any).generateSmartMemories;
            delete (window as any).analyzeMemories;
            delete (window as any).cleanDuplicateMemories;
        };
    }, [debugSystemStatus, generateSmartMemories, analyzeMemories]);

    
    const pcStatuses = statuses.filter(s => s.owner === 'pc' || (pcName && s.owner === pcName));
    const displayParty = party.filter(p => p.name !== pcName);
    const isCustomActionLocked = useMemo(() => customRules.some(rule => rule.isActive && rule.content.toUpperCase().includes('KHÓA HÀNH ĐỘNG TÙY Ý')), [customRules]);
    
    // Optimized player inventory computation - recompute when knownEntities changes
    const playerInventory = useMemo(() => {
        const items = Object.values(knownEntities).filter((entity): entity is Entity => entity.type === 'item');
        
        return items.filter(entity => {
            // Include items that explicitly belong to PC
            if (entity.owner === 'pc') return true;
            
            // Include items with no owner or empty owner (likely player items from story)
            if (!entity.owner || entity.owner === '' || entity.owner === null || entity.owner === undefined) {
                return true;
            }
            
            // Exclude items that explicitly belong to NPCs
            return false;
        });
    }, [knownEntities]);

    const entityComputations = useMemo(() => ({
        pcEntity,
        pcStatuses,
        displayParty,
        playerInventory
    }), [pcEntity, pcStatuses, displayParty, playerInventory]);
    
    const themeColors = getThemeColors(gameSettings.themeColor);
    
    return (
        <div 
            className={`bg-gradient-to-br ${themeColors.primary} w-full h-full p-0 md:p-4 flex flex-col text-white relative overflow-hidden`}
            style={{
                maxHeight: '98vh', 
                height: '98vh',
                fontSize: 'var(--game-font-size, 16px)',
                fontFamily: 'var(--game-font-family, Inter)'
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-50">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>
            
            {/* Floating Orbs */}
            <div className={`absolute top-20 left-20 w-32 h-32 bg-${themeColors.text.split('-')[0]}-500/20 rounded-full blur-xl animate-pulse`}></div>
            <div className={`absolute bottom-20 right-20 w-48 h-48 bg-${themeColors.text.split('-')[0]}-400/10 rounded-full blur-2xl animate-pulse delay-1000`}></div>
            <div className={`absolute top-1/2 left-1/4 w-24 h-24 bg-${themeColors.text.split('-')[0]}-600/15 rounded-full blur-xl animate-pulse delay-500`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
            <GameNotifications 
                notification={notification} 
                showSaveSuccess={showSaveSuccess} 
                showRulesSavedSuccess={showRulesSavedSuccess} 
            />
            
            <SidebarNav 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
                onHome={() => setIsHomeModalOpen(true)}
                onSettings={() => setIsGameSettingsModalOpen(true)}
                onImport={() => setIsEntityImportModalOpen(true)}
                onSave={handleSaveGame}
                onExportWorldSetup={handleExportWorldSetup}
                onMap={() => setIsMapModalOpen(true)}
                onRules={() => setIsCustomRulesModalOpen(true)}
                onKnowledge={() => setIsKnowledgeModalOpen(true)}
                onMemory={() => setIsMemoryModalOpen(true)}
                onRestart={() => setIsRestartModalOpen(true)}
                onPCInfo={() => setIsPcInfoModalOpen(true)}
                onParty={() => setIsPartyModalOpen(true)}
                onQuests={() => setIsQuestLogModalOpen(true)}
                onAdmin={() => setIsAdminModalOpen(true)}
                onManualCleanup={handleManualCleanup}
                currentTurnTokens={currentTurnTokens}
                totalTokens={totalTokens}
                historyStats={historyStats}
                compressedSegments={compressedHistory.length}
                gameHistory={gameHistory}
                cleanupStats={cleanupStats!}
            />

            <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} worldData={worldData} />

            <DesktopHeader 
                onHome={() => setIsHomeModalOpen(true)} 
                onSettings={() => setIsGameSettingsModalOpen(true)}
                onImport={() => setIsEntityImportModalOpen(true)}
                onSave={handleSaveGame} 
                onExportWorldSetup={handleExportWorldSetup}
                onMap={() => setIsMapModalOpen(true)}
                onRules={() => setIsCustomRulesModalOpen(true)}
                onKnowledge={() => setIsKnowledgeModalOpen(true)}
                onMemory={() => setIsMemoryModalOpen(true)}
                onRestart={() => setIsRestartModalOpen(true)}
                onPCInfo={() => setIsPcInfoModalOpen(true)}
                onParty={() => setIsPartyModalOpen(true)}
                onQuests={() => setIsQuestLogModalOpen(true)}
                onInventory={() => setIsInventoryModalOpen(true)}
                onAdmin={() => setIsAdminModalOpen(true)}
                onManualCleanup={handleManualCleanup}
                worldData={worldData}
                gameTime={gameTime}
                turnCount={turnCount}
                currentTurnTokens={currentTurnTokens}
                totalTokens={totalTokens}
            />

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-hidden p-4 md:p-0">
                <StoryPanel
                    storyLog={storyLog}
                    isLoading={isLoading}
                    isAiReady={isAiReady}
                    knownEntities={knownEntities}
                    onEntityClick={handleEntityClick}
                    isAutoImageEnabled={isAutoImageEnabled}
                    onToggleAutoImage={toggleAutoImageGeneration}
                    pcName={pcName}
                    gameHistoryLength={gameHistory.length}
                />
                <ActionPanel
                    isAiReady={isAiReady}
                    apiKeyError={apiKeyError}
                    isLoading={isLoading}
                    choices={choices}
                    handleAction={handleAction}
                    debouncedHandleAction={debouncedHandleAction}
                    customAction={customAction}
                    setCustomAction={setCustomAction}
                    handleSuggestAction={handleSuggestAction}
                    isCustomActionLocked={isCustomActionLocked}
                />
            </div>
            
            <MobileInputFooter
                onChoicesClick={() => setIsChoicesModalOpen(true)}
                onInventoryClick={() => setIsInventoryModalOpen(true)}
                customAction={customAction}
                setCustomAction={setCustomAction}
                handleAction={handleAction}
                debouncedHandleAction={debouncedHandleAction}
                handleSuggestAction={handleSuggestAction}
                isLoading={isLoading}
                isAiReady={isAiReady}
                isCustomActionLocked={isCustomActionLocked}
            />

            <MemoizedModals
                isHomeModalOpen={isHomeModalOpen}
                isRestartModalOpen={isRestartModalOpen}
                isMemoryModalOpen={isMemoryModalOpen}
                isKnowledgeModalOpen={isKnowledgeModalOpen}
                isCustomRulesModalOpen={isCustomRulesModalOpen}
                isMapModalOpen={isMapModalOpen}
                isPcInfoModalOpen={isPcInfoModalOpen}
                isPartyModalOpen={isPartyModalOpen}
                isQuestLogModalOpen={isQuestLogModalOpen}
                isChoicesModalOpen={isChoicesModalOpen}
                isInventoryModalOpen={isInventoryModalOpen}
                isAdminModalOpen={isAdminModalOpen}
                isEditItemModalOpen={isEditItemModalOpen}
                isEditSkillModalOpen={isEditSkillModalOpen}
                isEditNPCModalOpen={isEditNPCModalOpen}
                isEditPCModalOpen={isEditPCModalOpen}
                isEditLocationModalOpen={isEditLocationModalOpen}
                activeEntity={activeEntity}
                activeStatus={activeStatus}
                activeQuest={activeQuest}
                activeEditItem={activeEditItem}
                activeEditSkill={activeEditSkill}
                activeEditNPC={activeEditNPC}
                activeEditPC={activeEditPC}
                activeEditLocation={activeEditLocation}
                onBackToMenu={onBackToMenu}
                handleRestartGame={handleRestartGame}
                setActiveEntity={setActiveEntity}
                handleUseItem={handleUseItem}
                handleLearnItem={handleLearnItem}
                handleEquipItem={handleEquipItem}
                handleUnequipItem={handleUnequipItem}
                handleDiscardItem={handleDiscardItem}
                setActiveStatus={setActiveStatus}
                handleStatusClick={handleStatusClick}
                handleDeleteStatus={handleDeleteStatus}
                setActiveQuest={setActiveQuest}
                handleToggleMemoryPin={handleToggleMemoryPin}
                handleEntityClick={handleEntityClick}
                handleSaveRules={handleSaveRules}
                handleAction={handleAction}
                setActiveEditItem={setActiveEditItem}
                handleSaveEditedItem={handleSaveEditedItem}
                setIsEditItemModalOpen={setIsEditItemModalOpen}
                setActiveEditSkill={setActiveEditSkill}
                handleSaveEditedSkill={handleSaveEditedSkill}
                setIsEditSkillModalOpen={setIsEditSkillModalOpen}
                setActiveEditNPC={setActiveEditNPC}
                handleSaveEditedNPC={handleSaveEditedNPC}
                setIsEditNPCModalOpen={setIsEditNPCModalOpen}
                setActiveEditPC={setActiveEditPC}
                handleSaveEditedPC={handleSaveEditedPC}
                setIsEditPCModalOpen={setIsEditPCModalOpen}
                setActiveEditLocation={setActiveEditLocation}
                handleSaveEditedLocation={handleSaveEditedLocation}
                setIsEditLocationModalOpen={setIsEditLocationModalOpen}
                modalCloseHandlers={modalCloseHandlers}
                memories={memories}
                knownEntities={knownEntities}
                statuses={statuses}
                quests={quests}
                customRules={customRules}
                choices={choices}
                turnCount={turnCount}
                locationDiscoveryOrder={locationDiscoveryOrder}
                worldData={worldData}
                entityComputations={entityComputations}
            />

            <GameSettingsModal
                isOpen={isGameSettingsModalOpen}
                onClose={() => setIsGameSettingsModalOpen(false)}
                settings={gameSettings}
                onSettingsChange={handleSettingsChange}
            />

            <EntityImportModal
                isOpen={isEntityImportModalOpen}
                onClose={() => setIsEntityImportModalOpen(false)}
                gameState={{ 
                    worldData, 
                    knownEntities, 
                    statuses, 
                    gameHistory, 
                    memories, 
                    party, 
                    customRules, 
                    systemInstruction, 
                    turnCount, 
                    totalTokens, 
                    gameTime, 
                    chronicle, 
                    compressedHistory, 
                    historyStats, 
                    cleanupStats, 
                    archivedMemories, 
                    memoryStats, 
                    storyLog, 
                    choices, 
                    locationDiscoveryOrder 
                }}
                onImportSuccess={(results) => {
                    // Show success notification
                    const totalImported = results.reduce((sum, r) => sum + r.entitiesImported, 0);
                    const totalConflicts = results.reduce((sum, r) => sum + r.conflicts.length, 0);
                    setNotification(`Import thành công: ${totalImported} entities đã được nhập${totalConflicts > 0 ? `, ${totalConflicts} conflicts đã được giải quyết` : ''}`);
                    setTimeout(() => setNotification(null), 5000);
                }}
            />

            {/* Floating Time Display - Only show on mobile */}
            <div className="md:hidden">
                <FloatingTimeDisplay gameTime={gameTime} />
            </div>
            </div>
        </div>
    );
};