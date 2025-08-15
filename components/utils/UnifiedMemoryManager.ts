import type { Memory, SaveData, GameHistoryEntry } from '../types';
import { HistoryManager, type CompressedHistorySegment } from '../HistoryManager';
import { ImportanceScorer } from './ImportanceScorer';
import { MemoryEnhancer } from './MemoryEnhancer';
import { SmartMemoryGenerator, type MemoryGenerationConfig } from './SmartMemoryGenerator';

export interface CleanupConfig {
    // Memory thresholds
    maxActiveMemories: number;        // Max memories kept in main list
    memoryCleanupThreshold: number;   // When to trigger memory cleanup
    lowImportanceThreshold: number;   // Memories below this score get archived
    
    // History thresholds (inherited from HistoryManager)
    maxActiveHistoryEntries: number;
    historyCompressionThreshold: number;
    
    // Token management
    maxTokenBudget: number;           // Total token budget for memory + history
    memoryTokenRatio: number;         // Ratio of tokens allocated to memories (0-1)
    
    // Smart memory generation
    enableSmartMemoryGeneration: boolean;
    smartMemoryConfig: MemoryGenerationConfig;
}

export interface CleanupResult {
    memoriesProcessed: {
        archived: Memory[];
        enhanced: Memory[];
        kept: Memory[];
        totalProcessed: number;
    };
    historyProcessed: {
        compressed?: CompressedHistorySegment;
        activeEntries: GameHistoryEntry[];
        originalSize: number;
        newSize: number;
    };
    smartMemoriesGenerated?: {
        memories: Memory[];
        insights: string[];
        stats: any;
    };
    tokensSaved: number;
    cleanupTriggered: boolean;
}

export class UnifiedMemoryManager {
    private static readonly DEFAULT_CONFIG: CleanupConfig = {
        maxActiveMemories: 80,
        memoryCleanupThreshold: 100,
        lowImportanceThreshold: 40,
        maxActiveHistoryEntries: 50,
        historyCompressionThreshold: 40,
        maxTokenBudget: 10000,
        memoryTokenRatio: 0.3,
        enableSmartMemoryGeneration: true,
        smartMemoryConfig: {
            enableEventMemories: true,
            enableRelationshipMemories: true,
            enableDiscoveryMemories: true,
            enableCombatMemories: true,
            enableAchievementMemories: true,
            minImportanceThreshold: 50,  // Increased from 40 to reduce memory creation
            maxMemoriesPerTurn: 1,       // Reduced from 3 to limit growth
            lookbackTurns: 2             // Reduced from 5 to analyze fewer turns
        }
    };

    /**
     * Coordinated cleanup of both memories and history
     */
    public static coordinatedCleanup(
        gameState: SaveData,
        config: CleanupConfig = this.DEFAULT_CONFIG
    ): CleanupResult {
        const timestamp = new Date().toLocaleTimeString();
        
        console.log(`🧹 [${timestamp}] Starting Unified Memory Cleanup:`, {
            turnNumber: gameState.turnCount,
            currentMemories: gameState.memories?.length || 0,
            currentHistoryEntries: gameState.gameHistory.length,
            memoryThreshold: config.memoryCleanupThreshold,
            maxActiveMemories: config.maxActiveMemories,
            historyThreshold: config.historyCompressionThreshold,
            lowImportanceCount: gameState.memories?.filter(m => (m.importance || 0) < config.lowImportanceThreshold).length || 0,
            tokenBudget: config.maxTokenBudget
        });

        // 1. Process history compression first (frees up context)
        const historyResult = HistoryManager.manageHistory(
            gameState.gameHistory,
            gameState.turnCount,
            {
                maxActiveEntries: config.maxActiveHistoryEntries,
                compressionThreshold: config.historyCompressionThreshold,
                summaryLength: 200
            }
        );

        // 2. Generate smart memories from recent events
        let smartMemoryResult;
        if (config.enableSmartMemoryGeneration) {
            smartMemoryResult = SmartMemoryGenerator.generateMemoriesFromHistory(
                gameState, 
                config.smartMemoryConfig
            );
            
            if (smartMemoryResult.memories.length > 0) {
                console.log(`🧠 Smart Memory Generation: Added ${smartMemoryResult.memories.length} memories`, 
                    smartMemoryResult.stats);
            }
        }

        // 3. Process memory optimization (including new smart memories)
        const allMemories = smartMemoryResult ? 
            [...gameState.memories, ...smartMemoryResult.memories] : 
            gameState.memories;
        const memoryResult = this.optimizeMemories(allMemories, gameState, config);

        // 4. Calculate token savings
        const tokensSaved = this.calculateTokenSavings(historyResult, memoryResult);

        const cleanupTriggered = historyResult.shouldCompress || 
                                 memoryResult.totalProcessed > 0 || 
                                 (smartMemoryResult && smartMemoryResult.memories.length > 0);

        if (cleanupTriggered) {
            console.log(`✅ [${timestamp}] Unified Cleanup Completed:`, {
                memoriesArchived: memoryResult.archived.length,
                memoriesEnhanced: memoryResult.enhanced.length,
                memoriesKept: memoryResult.kept.length,
                smartMemoriesGenerated: smartMemoryResult?.memories.length || 0,
                historyCompressed: historyResult.shouldCompress,
                tokensSaved,
                newMemoryCount: memoryResult.kept.length + memoryResult.enhanced.length,
                newHistoryCount: historyResult.activeHistory.length
            });
        }

        return {
            memoriesProcessed: memoryResult,
            historyProcessed: {
                compressed: historyResult.compressedSegment,
                activeEntries: historyResult.activeHistory,
                originalSize: historyResult.stats.originalSize,
                newSize: historyResult.stats.newSize
            },
            smartMemoriesGenerated: smartMemoryResult,
            tokensSaved,
            cleanupTriggered
        };
    }

    /**
     * Optimize memories based on importance and token budget
     */
    private static optimizeMemories(
        memories: Memory[],
        gameState: SaveData,
        config: CleanupConfig
    ): {
        archived: Memory[];
        enhanced: Memory[];
        kept: Memory[];
        totalProcessed: number;
    } {
        // Check if memory cleanup is needed
        // Cleanup when we exceed maxActiveMemories OR when we have too many low-importance memories
        const needsCleanup = memories.length > config.maxActiveMemories || 
                            memories.length > config.memoryCleanupThreshold ||
                            memories.filter(m => (m.importance || 0) < config.lowImportanceThreshold).length > 10;
        
        if (!needsCleanup) {
            console.log(`⏭️ Memory cleanup skipped:`, {
                memoryCount: memories.length,
                maxActive: config.maxActiveMemories,
                threshold: config.memoryCleanupThreshold,
                lowImportanceCount: memories.filter(m => (m.importance || 0) < config.lowImportanceThreshold).length,
                reason: memories.length <= config.maxActiveMemories ? 'below maxActive' : 
                       memories.length <= config.memoryCleanupThreshold ? 'below threshold' : 'low-importance count OK'
            });
            return {
                archived: [],
                enhanced: [],
                kept: memories,
                totalProcessed: 0
            };
        }

        const archived: Memory[] = [];
        const enhanced: Memory[] = [];
        const kept: Memory[] = [];

        // Sort memories by importance (descending) and recency
        const sortedMemories = [...memories].sort((a, b) => {
            const scoreA = a.importance || 0;
            const scoreB = b.importance || 0;
            if (scoreA !== scoreB) return scoreB - scoreA;
            
            // If importance is equal, prefer more recent memories
            const timeA = a.lastAccessed || a.createdAt || 0;
            const timeB = b.lastAccessed || b.createdAt || 0;
            return timeB - timeA;
        });

        // Calculate memory token budget
        const memoryTokenBudget = config.maxTokenBudget * config.memoryTokenRatio;
        let currentTokenUsage = 0;

        for (const memory of sortedMemories) {
            const memoryTokens = this.estimateMemoryTokens(memory);
            const importance = memory.importance || 0;

            // Always keep pinned memories (but still respect maxActiveMemories)
            if (memory.pinned) {
                if (kept.length + enhanced.length < config.maxActiveMemories) {
                    kept.push(memory);
                    currentTokenUsage += memoryTokens;
                    continue;
                } else {
                    // Even pinned memories must be archived if over limit
                    archived.push({
                        ...memory,
                        category: 'archived' as any,
                        lastAccessed: gameState.turnCount
                    });
                    continue;
                }
            }

            // Archive low-importance memories
            if (importance < config.lowImportanceThreshold) {
                archived.push({
                    ...memory,
                    category: 'archived' as any,
                    lastAccessed: gameState.turnCount
                });
                continue;
            }

            // Check if we're within token budget and memory limit
            if (currentTokenUsage + memoryTokens <= memoryTokenBudget && 
                kept.length + enhanced.length < config.maxActiveMemories) {
                
                // Enhance memory if it needs updating
                if (this.shouldEnhanceMemory(memory, gameState)) {
                    const enhancementResult = MemoryEnhancer.enhanceMemory(memory, gameState);
                    enhanced.push(enhancementResult.enhanced);
                    currentTokenUsage += this.estimateMemoryTokens(enhancementResult.enhanced);
                } else {
                    kept.push(memory);
                    currentTokenUsage += memoryTokens;
                }
            } else {
                // Archive if over budget or limit
                archived.push({
                    ...memory,
                    category: 'archived' as any,
                    lastAccessed: gameState.turnCount
                });
            }
        }

        return {
            archived,
            enhanced,
            kept,
            totalProcessed: archived.length + enhanced.length
        };
    }

    /**
     * Check if a memory should be enhanced
     */
    private static shouldEnhanceMemory(memory: Memory, gameState: SaveData): boolean {
        // Enhance if missing important metadata
        if (!memory.category || !memory.relatedEntities || !memory.tags) {
            return true;
        }

        // Enhance if importance score is outdated (more than 10 turns old)
        const lastScored = memory.lastAccessed || memory.createdAt || 0;
        if (gameState.turnCount - lastScored > 10) {
            return true;
        }

        // Enhance if recent events might have changed its relevance
        const hasRecentRelatedActivity = memory.relatedEntities?.some(entityName => 
            this.hasRecentEntityActivity(entityName, gameState)
        );

        return hasRecentRelatedActivity || false;
    }

    /**
     * Check if an entity has had recent activity
     */
    private static hasRecentEntityActivity(entityName: string, gameState: SaveData): boolean {
        // Check recent history for entity mentions
        const recentEntries = gameState.gameHistory.slice(-10);
        return recentEntries.some(entry => 
            entry.parts[0].text.toLowerCase().includes(entityName.toLowerCase())
        );
    }

    /**
     * Estimate token usage for a memory
     */
    private static estimateMemoryTokens(memory: Memory): number {
        let tokenCount = Math.ceil(memory.text.length * 0.8); // Base text tokens
        
        // Add tokens for metadata
        if (memory.tags?.length) {
            tokenCount += memory.tags.length * 2;
        }
        if (memory.relatedEntities?.length) {
            tokenCount += memory.relatedEntities.length * 3;
        }
        
        return tokenCount;
    }

    /**
     * Calculate total tokens saved from cleanup
     */
    private static calculateTokenSavings(
        historyResult: any,
        memoryResult: { archived: Memory[]; enhanced: Memory[]; kept: Memory[]; totalProcessed: number }
    ): number {
        let tokensSaved = 0;

        // Tokens saved from history compression
        if (historyResult.shouldCompress) {
            tokensSaved += historyResult.stats.savedEntries * 500; // Estimate 500 tokens per history entry
        }

        // Tokens saved from memory archiving
        tokensSaved += memoryResult.archived.reduce((sum, memory) => 
            sum + this.estimateMemoryTokens(memory), 0
        );

        return tokensSaved;
    }

    /**
     * Get optimization statistics
     */
    public static getOptimizationStats(
        memories: Memory[],
        archivedMemories: Memory[] = []
    ): {
        activeMemories: number;
        archivedMemories: number;
        averageImportance: number;
        categoryDistribution: { [category: string]: number };
        pinnedCount: number;
        estimatedTokenUsage: number;
    } {
        const categoryDistribution: { [category: string]: number } = {};
        let totalImportance = 0;
        let pinnedCount = 0;
        let estimatedTokenUsage = 0;

        memories.forEach(memory => {
            if (memory.category) {
                categoryDistribution[memory.category] = (categoryDistribution[memory.category] || 0) + 1;
            }
            if (memory.importance) {
                totalImportance += memory.importance;
            }
            if (memory.pinned) {
                pinnedCount++;
            }
            estimatedTokenUsage += this.estimateMemoryTokens(memory);
        });

        return {
            activeMemories: memories.length,
            archivedMemories: archivedMemories.length,
            averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
            categoryDistribution,
            pinnedCount,
            estimatedTokenUsage
        };
    }

    /**
     * Restore archived memories that have become relevant again
     */
    public static restoreRelevantMemories(
        archivedMemories: Memory[],
        gameState: SaveData,
        maxToRestore: number = 5
    ): Memory[] {
        if (!archivedMemories.length) return [];

        // Find memories related to recent activities
        const recentActivityTerms = this.extractRecentActivityTerms(gameState);
        
        const relevantArchived = archivedMemories
            .filter(memory => 
                recentActivityTerms.some(term => 
                    memory.text.toLowerCase().includes(term.toLowerCase()) ||
                    memory.relatedEntities?.some(entity => 
                        entity.toLowerCase().includes(term.toLowerCase())
                    )
                )
            )
            .sort((a, b) => (b.importance || 0) - (a.importance || 0))
            .slice(0, maxToRestore);

        if (relevantArchived.length > 0) {
            console.log(`🔄 Restoring ${relevantArchived.length} relevant archived memories`);
        }

        return relevantArchived.map(memory => ({
            ...memory,
            lastAccessed: gameState.turnCount,
            category: memory.category === 'archived' ? 'general' : memory.category
        }));
    }

    /**
     * Extract terms from recent game activity
     */
    private static extractRecentActivityTerms(gameState: SaveData): string[] {
        const terms: string[] = [];
        
        // Extract from recent history
        const recentEntries = gameState.gameHistory.slice(-5);
        recentEntries.forEach(entry => {
            try {
                if (entry.role === 'model') {
                    const parsed = JSON.parse(entry.parts[0].text);
                    if (parsed.story) {
                        // Extract entity names and important keywords
                        const words = parsed.story.split(/\s+/)
                            .filter((word: string) => word.length > 3)
                            .slice(0, 10);
                        terms.push(...words);
                    }
                }
            } catch (e) {
                // Skip invalid JSON
            }
        });

        // Extract from party member names
        gameState.party?.forEach(member => {
            if (member.name) terms.push(member.name);
        });

        // Extract from recent locations
        const recentLocations = gameState.locationDiscoveryOrder.slice(-3);
        terms.push(...recentLocations);

        return [...new Set(terms)]; // Remove duplicates
    }

    /**
     * Generate smart memories independently (without cleanup)
     */
    public static generateSmartMemories(
        gameState: SaveData,
        config?: MemoryGenerationConfig
    ): {
        memories: Memory[];
        insights: string[];
        stats: any;
    } {
        const smartConfig = config || this.DEFAULT_CONFIG.smartMemoryConfig;
        return SmartMemoryGenerator.generateMemoriesFromHistory(gameState, smartConfig);
    }
}
