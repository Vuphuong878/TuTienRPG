
import type { SaveData, Memory, Quest, Status, Chronicle, Entity, KnownEntities } from './types';

export interface CleanupConfig {
    // Chronicle cleanup  
    maxMemoirEntries: number;         // Số memoir entries tối đa
    maxChapterEntries: number;        // Số chapter entries tối đa
    maxTurnEntries: number;           // Số turn entries tối đa
    
    // Quest cleanup
    maxCompletedQuests: number;       // Số quest đã hoàn thành tối đa
    questRetentionTurns: number;      // Giữ quest bao nhiêu lượt sau khi complete
    
    // Status cleanup
    maxStatusesPerEntity: number;     // Số status tối đa mỗi entity
    removeExpiredStatuses: boolean;   // Tự động xóa status hết hạn
    
    // Entity cleanup
    maxInactiveEntities: number;      // Số entities không hoạt động tối đa
    entityInactivityThreshold: number; // Số lượt không mention để coi là inactive
    
    // Cleanup frequency
    cleanupInterval: number;          // Cleanup mỗi bao nhiêu lượt
}

export interface CleanupStats {
    chronicleEntriesRemoved: number;
    questsArchived: number;
    statusesRemoved: number;
    entitiesArchived: number;
    totalTokensSaved: number;
    lastCleanupTurn: number;
}

export class GameStateOptimizer {
    private static readonly DEFAULT_CONFIG: CleanupConfig = {
        // Chronicle settings
        maxMemoirEntries: 15,            // Giữ 15 memoir entries
        maxChapterEntries: 20,           // Giữ 20 chapter entries  
        maxTurnEntries: 30,              // Giữ 30 turn entries
        
        // Quest settings
        maxCompletedQuests: 10,          // Giữ 10 quest đã hoàn thành
        questRetentionTurns: 50,         // Giữ quest 50 lượt sau complete
        
        // Status settings
        maxStatusesPerEntity: 3,         // Tối đa 3 status/entity
        removeExpiredStatuses: true,     // Tự động xóa status hết hạn
        
        // Entity settings
        maxInactiveEntities: 100,        // Giữ tối đa 100 entities không hoạt động
        entityInactivityThreshold: 25,   // 25 lượt không mention = inactive
        
        // Cleanup frequency
        cleanupInterval: 10              // Cleanup mỗi 10 lượt
    };

    /**
     * Main cleanup function - gọi này mỗi lượt
     */
    public static performCleanup(
        gameState: SaveData,
        config: CleanupConfig = this.DEFAULT_CONFIG
    ): {
        optimizedState: SaveData;
        stats: CleanupStats;
        shouldRunCleanup: boolean;
    } {
        const shouldRunCleanup = gameState.turnCount % config.cleanupInterval === 0 && gameState.turnCount > 0;
        
        if (!shouldRunCleanup) {
            return {
                optimizedState: gameState,
                stats: this.getEmptyStats(),
                shouldRunCleanup: false
            };
        }
        
        const result = this._runCleanupLogic(gameState, config);

        return {
            ...result,
            shouldRunCleanup: true
        };
    }

    private static _runCleanupLogic(
        gameState: SaveData,
        config: CleanupConfig
    ): { optimizedState: SaveData; stats: CleanupStats } {
        console.log(`🧹 Running cleanup logic at turn ${gameState.turnCount}...`);
        const cleanupStart = performance.now();

        let optimizedState = JSON.parse(JSON.stringify(gameState)); // Deep copy to avoid mutation issues
        const stats: CleanupStats = {
            chronicleEntriesRemoved: 0,
            questsArchived: 0,
            statusesRemoved: 0,
            entitiesArchived: 0,
            totalTokensSaved: 0,
            lastCleanupTurn: gameState.turnCount
        };

        // 1. Clean up chronicle
        const chronicleResult = this.cleanupChronicle(optimizedState.chronicle, config);
        optimizedState.chronicle = chronicleResult.cleaned;
        stats.chronicleEntriesRemoved = chronicleResult.removed;
        stats.totalTokensSaved += chronicleResult.tokensSaved;

        // 3. Clean up quests
        const questResult = this.cleanupQuests(optimizedState.quests, gameState.turnCount, config);
        optimizedState.quests = questResult.cleaned;
        stats.questsArchived = questResult.archived;
        stats.totalTokensSaved += questResult.tokensSaved;

        // 4. Clean up statuses
        const statusResult = this.cleanupStatuses(optimizedState.statuses, config);
        optimizedState.statuses = statusResult.cleaned;
        stats.statusesRemoved = statusResult.removed;
        stats.totalTokensSaved += statusResult.tokensSaved;

        // 5. Clean up inactive entities
        const entityResult = this.cleanupInactiveEntities(
            optimizedState.knownEntities,
            gameState.gameHistory,
            gameState.turnCount,
            config
        );
        optimizedState.knownEntities = entityResult.cleaned;
        stats.entitiesArchived = entityResult.archived;
        stats.totalTokensSaved += entityResult.tokensSaved;

        const cleanupTime = performance.now() - cleanupStart;
        console.log(`✅ Cleanup completed in ${cleanupTime.toFixed(2)}ms:`, stats);

        return {
            optimizedState,
            stats,
        };
    }


    /**
     * Cleanup chronicle entries
     */
    private static cleanupChronicle(
        chronicle: Chronicle, 
        config: CleanupConfig
    ): { cleaned: Chronicle; removed: number; tokensSaved: number } {
        const originalCount = chronicle.memoir.length + chronicle.chapter.length + chronicle.turn.length;

        const cleaned: Chronicle = {
            memoir: chronicle.memoir.slice(-config.maxMemoirEntries),
            chapter: chronicle.chapter.slice(-config.maxChapterEntries),
            turn: chronicle.turn.slice(-config.maxTurnEntries)
        };

        const newCount = cleaned.memoir.length + cleaned.chapter.length + cleaned.turn.length;
        const removed = originalCount - newCount;
        const tokensSaved = removed * 100;

        return { cleaned, removed, tokensSaved };
    }

    /**
     * Cleanup completed/failed quests
     */
    private static cleanupQuests(
        quests: Quest[], 
        currentTurn: number, 
        config: CleanupConfig
    ): { cleaned: Quest[]; archived: number; tokensSaved: number } {
        const activeQuests = quests.filter(q => q.status === 'active');
        const completedQuests = quests.filter(q => q.status !== 'active');

        const recentCompleted = completedQuests
            .map(quest => ({
                ...quest,
                completedTurn: (quest as any).completedTurn || currentTurn
            }))
            .filter(quest => currentTurn - quest.completedTurn <= config.questRetentionTurns)
            .slice(-config.maxCompletedQuests);

        const cleaned = [...activeQuests, ...recentCompleted];
        const archived = quests.length - cleaned.length;
        const tokensSaved = archived * 200;

        return { cleaned, archived, tokensSaved };
    }

    /**
     * Cleanup status effects
     */
    private static cleanupStatuses(
        statuses: Status[], 
        config: CleanupConfig
    ): { cleaned: Status[]; removed: number; tokensSaved: number } {
        let cleaned = [...statuses];

        if (config.removeExpiredStatuses) {
            cleaned = cleaned.filter(status => 
                !status.duration?.toLowerCase().includes('hết') &&
                !status.duration?.toLowerCase().includes('kết thúc') &&
                status.duration !== '0'
            );
        }

        const entityStatuses: { [key: string]: Status[] } = {};

        cleaned.forEach(status => {
            if (!entityStatuses[status.owner]) {
                entityStatuses[status.owner] = [];
            }
            entityStatuses[status.owner].push(status);
        });

        const finalStatuses: Status[] = [];
        Object.entries(entityStatuses).forEach(([owner, ownerStatuses]) => {
            if (ownerStatuses.length > config.maxStatusesPerEntity) {
                const kept = ownerStatuses.slice(-config.maxStatusesPerEntity);
                finalStatuses.push(...kept);
                console.log(`🗑️ Removed ${ownerStatuses.length - kept.length} old statuses from ${owner}`);
            } else {
                finalStatuses.push(...ownerStatuses);
            }
        });

        const removed = statuses.length - finalStatuses.length;
        const tokensSaved = removed * 80;

        return { cleaned: finalStatuses, removed, tokensSaved };
    }

    /**
     * Archive inactive entities
     */
    private static cleanupInactiveEntities(
        entities: KnownEntities,
        gameHistory: any[],
        currentTurn: number,
        config: CleanupConfig
    ): { cleaned: KnownEntities; archived: number; tokensSaved: number } {
        const recentHistory = gameHistory.slice(-config.entityInactivityThreshold * 2);
        const mentionCounts: { [key: string]: number } = {};

        recentHistory.forEach(entry => {
            const text = entry.parts?.[0]?.text?.toLowerCase() || '';
            Object.keys(entities).forEach(entityName => {
                if (text.includes(entityName.toLowerCase())) {
                    mentionCounts[entityName] = (mentionCounts[entityName] || 0) + 1;
                }
            });
        });

        const protectedEntities = new Set<string>();
        Object.values(entities).forEach(entity => {
            if (entity.type === 'pc' || 
                entity.type === 'companion' ||
                entity.owner === 'pc' ||
                entity.pinned || // Protect pinned/starred entities
                (entity.type === 'location' && mentionCounts[entity.name] > 0)) {
                protectedEntities.add(entity.name);
            }
        });

        const cleaned: KnownEntities = {};
        let archived = 0;

        Object.entries(entities).forEach(([name, entity]) => {
            const mentions = mentionCounts[name] || 0;
            const isProtected = protectedEntities.has(name);
            const isRecent = mentions > 0;

            if (isProtected || isRecent) {
                cleaned[name] = entity;
            } else {
                cleaned[name] = {
                    ...entity,
                    archived: true,
                    archivedAt: currentTurn
                } as Entity & { archived: boolean; archivedAt: number };
                archived++;
            }
        });

        const archivedEntities = Object.entries(cleaned).filter(([_, entity]) => (entity as any).archived);
        if (archivedEntities.length > config.maxInactiveEntities) {
            const toRemove = archivedEntities
                .sort((a, b) => ((a[1] as any).archivedAt || 0) - ((b[1] as any).archivedAt || 0))
                .slice(0, archivedEntities.length - config.maxInactiveEntities);
            
            toRemove.forEach(([name]) => {
                delete cleaned[name];
            });
            
            console.log(`🗑️ Permanently removed ${toRemove.length} oldest archived entities`);
        }

        const tokensSaved = archived * 150;

        return { cleaned, archived, tokensSaved };
    }

    /**
     * Get cleanup statistics
     */
    static getCleanupStatistics(gameState: SaveData): {
        chronicleSize: { memoir: number; chapter: number; turn: number; total: number };
        questStatus: { active: number; completed: number; failed: number; total: number };
        statusDistribution: { [entityName: string]: number };
        entityTypes: { [type: string]: number };
        archivedEntities: number;
    } {
        const stats = {
            chronicleSize: {
                memoir: gameState.chronicle.memoir.length,
                chapter: gameState.chronicle.chapter.length,
                turn: gameState.chronicle.turn.length,
                total: gameState.chronicle.memoir.length + gameState.chronicle.chapter.length + gameState.chronicle.turn.length
            },
            questStatus: {
                active: gameState.quests.filter(q => q.status === 'active').length,
                completed: gameState.quests.filter(q => q.status === 'completed').length,
                failed: gameState.quests.filter(q => q.status === 'failed').length,
                total: gameState.quests.length
            },
            statusDistribution: {} as { [entityName: string]: number },
            entityTypes: {} as { [type: string]: number },
            archivedEntities: 0
        };

        gameState.statuses.forEach(status => {
            stats.statusDistribution[status.owner] = (stats.statusDistribution[status.owner] || 0) + 1;
        });

        Object.values(gameState.knownEntities).forEach(entity => {
            stats.entityTypes[entity.type] = (stats.entityTypes[entity.type] || 0) + 1;
            if ((entity as any).archived) {
                stats.archivedEntities++;
            }
        });

        return stats;
    }

    public static getEmptyStats(): CleanupStats {
        return {
            chronicleEntriesRemoved: 0,
            questsArchived: 0,
            statusesRemoved: 0,
            entitiesArchived: 0,
            totalTokensSaved: 0,
            lastCleanupTurn: 0
        };
    }

    /**
     * Force cleanup (for manual triggers)
     */
    public static forceCleanup(
        gameState: SaveData,
        aggressiveMode: boolean = false
    ): { optimizedState: SaveData; stats: CleanupStats } {
        const config = aggressiveMode ? {
            ...this.DEFAULT_CONFIG,
            maxMemoirEntries: 10,
            maxChapterEntries: 15,
            maxTurnEntries: 20,
            maxCompletedQuests: 5,
            questRetentionTurns: 30,
            maxStatusesPerEntity: 2,
            maxInactiveEntities: 50
        } : this.DEFAULT_CONFIG;

        return this._runCleanupLogic(gameState, config);
    }
}
