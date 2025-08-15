import type { Entity, Memory, SaveData, Status } from '../types';
import { EnhancedRAG, RAGContext, RAGConfig } from './EnhancedRAG';

export interface EntityReference {
    referenceId: string;
    name: string;
    type: string;
    summary: string;
    relevanceScore: number;
    lastAccessed?: number;
}

export interface ReferenceRegistry {
    entities: Map<string, Entity>;
    memories: Map<string, Memory>;
    relationships: Map<string, string>;
    lastUpdate: number;
}

export interface CompactRAGContext {
    entityReferences: EntityReference[];
    memoryReferences: string[];
    relationshipKeys: string[];
    recentEventSummaries: string[];
    externalRegistry: ReferenceRegistry;
    tokensSaved: number;
    originalTokens: number;
}

export class ReferenceBasedRAG {
    private static registry: ReferenceRegistry = {
        entities: new Map(),
        memories: new Map(),
        relationships: new Map(),
        lastUpdate: 0
    };

    private static readonly SUMMARY_MAX_CHARS = 120;
    private static readonly REFERENCE_ID_PATTERN = /REF_[A-Z]{2}_[A-Z]{3}_[A-F0-9]{8}/g;

    /**
     * Build compact context using reference IDs to minimize token usage
     */
    public static buildCompactContext(
        gameState: SaveData,
        currentAction: string,
        config: RAGConfig = {
            maxMemories: 8,
            maxTokens: 800, // Reduced from 2000
            importanceThreshold: 35,
            recencyWeight: 0.3,
            relevanceWeight: 0.5,
            diversityWeight: 0.2,
            includeArchived: false
        }
    ): CompactRAGContext {
        const startTime = performance.now();
        
        // Step 1: Update reference registry
        this.updateRegistry(gameState);
        
        // Step 2: Get traditional RAG context for comparison
        const fullContext = EnhancedRAG.buildIntelligentContext(gameState, currentAction, config);
        
        // Step 3: Convert to reference-based format
        const entityReferences = this.createEntityReferences(fullContext.contextualEntities, currentAction);
        const memoryReferences = this.createMemoryReferences(fullContext.relevantMemories);
        const relationshipKeys = this.createRelationshipKeys(fullContext.relationshipContext);
        const recentEventSummaries = this.createEventSummaries(fullContext.recentEvents);
        
        // Step 4: Calculate token savings
        const originalTokens = fullContext.tokenUsage;
        const compactTokens = this.estimateCompactTokens(
            entityReferences,
            memoryReferences,
            relationshipKeys,
            recentEventSummaries
        );
        
        const endTime = performance.now();
        console.log(`🔗 Reference-based RAG: Built compact context in ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`💾 Token savings: ${originalTokens} → ${compactTokens} (${((originalTokens - compactTokens) / originalTokens * 100).toFixed(1)}% reduction)`);
        
        return {
            entityReferences,
            memoryReferences,
            relationshipKeys,
            recentEventSummaries,
            externalRegistry: this.registry,
            tokensSaved: originalTokens - compactTokens,
            originalTokens
        };
    }

    /**
     * Update the reference registry with current game state
     */
    private static updateRegistry(gameState: SaveData): void {
        if (!gameState) {
            console.warn('🚨 ReferenceBasedRAG: gameState is null/undefined');
            return;
        }
        
        // Update entities
        for (const [name, entity] of Object.entries(gameState.knownEntities || {})) {
            if (!entity.referenceId) {
                // Generate reference ID if missing (legacy entities)
                entity.referenceId = this.generateLegacyReferenceId(entity);
                console.log(`🔗 Generated legacy reference ID for ${entity.name} (${entity.type}): ${entity.referenceId}`);
            }
            this.registry.entities.set(entity.referenceId, entity);
        }

        // Update memories with temporary reference IDs
        gameState.memories?.forEach((memory, index) => {
            const memRef = `MEM_${Date.now()}_${index}`;
            this.registry.memories.set(memRef, memory);
        });

        // Update relationships
        gameState.party?.forEach(member => {
            if (member.relationship) {
                const relKey = `REL_${member.name}_PC`;
                this.registry.relationships.set(relKey, member.relationship);
            }
        });

        this.registry.lastUpdate = Date.now();
    }

    /**
     * Generate legacy reference ID for entities without one
     */
    private static generateLegacyReferenceId(entity: Entity): string {
        const baseString = `${entity.type}_${entity.name}_${Date.now()}`;
        let hash = 0;
        for (let i = 0; i < baseString.length; i++) {
            const char = baseString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
        const typePrefix = entity.type.substring(0, 2).toUpperCase();
        return `REF_${typePrefix}_LEG_${hashHex}`;
    }

    /**
     * Create compact entity references with summaries
     */
    private static createEntityReferences(entities: Entity[], currentAction: string): EntityReference[] {
        return entities.map(entity => {
            const summary = this.createEntitySummary(entity);
            const relevanceScore = this.calculateEntityRelevance(entity, currentAction);
            
            return {
                referenceId: entity.referenceId || this.generateLegacyReferenceId(entity),
                name: entity.name,
                type: entity.type,
                summary,
                relevanceScore,
                lastAccessed: Date.now()
            };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * Create compact entity summary for prompt inclusion
     */
    private static createEntitySummary(entity: Entity): string {
        const parts: string[] = [];
        
        // Core identity
        if (entity.type === 'pc') {
            parts.push('Nhân vật chính');
        } else if (entity.type === 'companion') {
            parts.push('Đồng hành');
        } else if (entity.type === 'npc') {
            parts.push('NPC');
        }

        // Key attributes
        if (entity.realm) parts.push(`Cảnh giới: ${entity.realm}`);
        if (entity.relationship) parts.push(`Quan hệ: ${entity.relationship}`);
        if (entity.location) parts.push(`Tại: ${entity.location}`);
        
        // Condensed description
        if (entity.description) {
            const shortDesc = entity.description.length > 60 ? 
                entity.description.substring(0, 57) + '...' : 
                entity.description;
            parts.push(shortDesc);
        }

        const summary = parts.join(' | ');
        return summary.length > this.SUMMARY_MAX_CHARS ? 
            summary.substring(0, this.SUMMARY_MAX_CHARS - 3) + '...' : 
            summary;
    }

    /**
     * Calculate entity relevance for sorting
     */
    private static calculateEntityRelevance(entity: Entity, currentAction: string): number {
        let score = 0;
        
        // Type-based relevance
        if (entity.type === 'companion') score += 40;
        else if (entity.type === 'pc') score += 50;
        else if (entity.type === 'npc') score += 20;
        else score += 10;

        // Name mention in action
        if (currentAction.toLowerCase().includes(entity.name.toLowerCase())) {
            score += 30;
        }

        // Recent interaction
        if (entity.lastInteraction) {
            const age = Date.now() - entity.lastInteraction;
            if (age < 300000) score += 20; // 5 minutes
            else if (age < 3600000) score += 10; // 1 hour
        }

        return Math.min(100, score);
    }

    /**
     * Create memory references with compact format
     */
    private static createMemoryReferences(memories: Memory[]): string[] {
        return memories.map((memory, index) => {
            const summary = memory.text.length > 80 ? 
                memory.text.substring(0, 77) + '...' : 
                memory.text;
            const category = memory.category ? `[${memory.category.toUpperCase()}]` : '[GENERAL]';
            const importance = memory.importance ? `(${memory.importance})` : '';
            
            return `${category}${importance} ${summary}`;
        });
    }

    /**
     * Create relationship keys for external lookup
     */
    private static createRelationshipKeys(relationships: string[]): string[] {
        return relationships.map(rel => {
            // Extract key relationship info
            const parts = rel.split(':');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const status = parts[1].trim().substring(0, 30);
                return `${name}: ${status}`;
            }
            return rel.length > 50 ? rel.substring(0, 47) + '...' : rel;
        });
    }

    /**
     * Create event summaries
     */
    private static createEventSummaries(events: string[]): string[] {
        return events.map(event => 
            event.length > 60 ? event.substring(0, 57) + '...' : event
        );
    }

    /**
     * Estimate token usage for compact context
     */
    private static estimateCompactTokens(
        entityRefs: EntityReference[],
        memoryRefs: string[],
        relationshipKeys: string[],
        eventSummaries: string[]
    ): number {
        let tokens = 0;

        // Entity references (much smaller than full entities)
        tokens += entityRefs.reduce((sum, ref) => 
            sum + Math.ceil((ref.name.length + ref.summary.length + 20) * 0.8), 0
        );

        // Memory references (compressed)
        tokens += memoryRefs.reduce((sum, ref) => 
            sum + Math.ceil(ref.length * 0.8), 0
        );

        // Relationship keys (compressed)
        tokens += relationshipKeys.reduce((sum, key) => 
            sum + Math.ceil(key.length * 0.8), 0
        );

        // Event summaries (compressed)
        tokens += eventSummaries.reduce((sum, event) => 
            sum + Math.ceil(event.length * 0.8), 0
        );

        // Add overhead for formatting
        tokens += 100;

        return tokens;
    }

    /**
     * Format compact context for AI prompt
     */
    public static formatCompactContextForPrompt(context: CompactRAGContext): string {
        let formattedContext = '';

        // Entity references with IDs
        if (context.entityReferences.length > 0) {
            formattedContext += '--- ENTITY REFERENCES ---\n';
            context.entityReferences.forEach(ref => {
                formattedContext += `• ${ref.name} [${ref.referenceId}]: ${ref.summary}\n`;
            });
            formattedContext += '\n';
        }

        // Compact memory references
        if (context.memoryReferences.length > 0) {
            formattedContext += '--- MEMORY HIGHLIGHTS ---\n';
            context.memoryReferences.forEach((memRef, index) => {
                formattedContext += `${index + 1}. ${memRef}\n`;
            });
            formattedContext += '\n';
        }

        // Relationship summaries
        if (context.relationshipKeys.length > 0) {
            formattedContext += '--- RELATIONSHIP STATUS ---\n';
            context.relationshipKeys.forEach(rel => {
                formattedContext += `• ${rel}\n`;
            });
            formattedContext += '\n';
        }

        // Recent event summaries
        if (context.recentEventSummaries.length > 0) {
            formattedContext += '--- RECENT EVENTS ---\n';
            context.recentEventSummaries.forEach(event => {
                formattedContext += `• ${event}\n`;
            });
            formattedContext += '\n';
        }

        // Add instruction for AI to use reference system
        formattedContext += '--- REFERENCE SYSTEM ---\n';
        formattedContext += 'Entities are referenced by ID (e.g., REF_NP_CHA_12345678). Use these IDs when referencing entities.\n';
        formattedContext += 'For detailed entity information, use the reference ID to look up full details.\n\n';

        return formattedContext;
    }

    /**
     * Retrieve entity details by reference ID (for external API calls)
     */
    public static getEntityByReference(referenceId: string): Entity | null {
        return this.registry.entities.get(referenceId) || null;
    }

    /**
     * Retrieve memory by reference ID
     */
    public static getMemoryByReference(referenceId: string): Memory | null {
        return this.registry.memories.get(referenceId) || null;
    }

    /**
     * Get all reference mappings for debugging
     */
    public static getRegistrySnapshot(): {
        entitiesCount: number;
        memoriesCount: number;
        relationshipsCount: number;
        lastUpdate: number;
    } {
        return {
            entitiesCount: this.registry.entities.size,
            memoriesCount: this.registry.memories.size,
            relationshipsCount: this.registry.relationships.size,
            lastUpdate: this.registry.lastUpdate
        };
    }

    /**
     * Clear registry (for testing or memory management)
     */
    public static clearRegistry(): void {
        this.registry.entities.clear();
        this.registry.memories.clear();
        this.registry.relationships.clear();
        this.registry.lastUpdate = 0;
    }

    /**
     * Find entities by pattern or keyword (for AI queries)
     */
    public static findEntitiesByKeyword(keyword: string, limit: number = 5): EntityReference[] {
        const results: EntityReference[] = [];
        const keywordLower = keyword.toLowerCase();

        for (const [refId, entity] of this.registry.entities) {
            if (entity.name.toLowerCase().includes(keywordLower) ||
                entity.description?.toLowerCase().includes(keywordLower) ||
                entity.type.toLowerCase().includes(keywordLower)) {
                
                results.push({
                    referenceId: refId,
                    name: entity.name,
                    type: entity.type,
                    summary: this.createEntitySummary(entity),
                    relevanceScore: this.calculateKeywordRelevance(entity, keyword),
                    lastAccessed: Date.now()
                });
            }
        }

        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    /**
     * Calculate keyword relevance for search
     */
    private static calculateKeywordRelevance(entity: Entity, keyword: string): number {
        const keywordLower = keyword.toLowerCase();
        let score = 0;

        // Exact name match
        if (entity.name.toLowerCase() === keywordLower) score += 50;
        else if (entity.name.toLowerCase().includes(keywordLower)) score += 30;

        // Type match
        if (entity.type.toLowerCase().includes(keywordLower)) score += 20;

        // Description match
        if (entity.description?.toLowerCase().includes(keywordLower)) score += 15;

        return score;
    }
}

// Export singleton for easy access
export const referenceBasedRAG = ReferenceBasedRAG;