import type { Memory, SaveData, Entity } from '../types';
import { ImportanceScorer } from './ImportanceScorer';

export interface RAGContext {
    relevantMemories: Memory[];
    contextualEntities: Entity[];
    relationshipContext: string[];
    recentEvents: string[];
    importance: number;
    tokenUsage: number;
}

export interface RAGConfig {
    maxMemories: number;
    maxTokens: number;
    importanceThreshold: number;
    recencyWeight: number;
    relevanceWeight: number;
    diversityWeight: number;
    includeArchived: boolean;
}

export class EnhancedRAG {
    private static readonly DEFAULT_CONFIG: RAGConfig = {
        maxMemories: 10,
        maxTokens: 2000,
        importanceThreshold: 30,
        recencyWeight: 0.3,
        relevanceWeight: 0.5,
        diversityWeight: 0.2,
        includeArchived: false
    };

    /**
     * Build intelligent context from memories for AI prompts
     */
    public static buildIntelligentContext(
        gameState: SaveData,
        currentAction: string,
        config: RAGConfig = this.DEFAULT_CONFIG
    ): RAGContext {
        const memories = config.includeArchived ? 
            [...gameState.memories, ...(gameState.archivedMemories || [])] : 
            gameState.memories;
        
        console.log(`🧠 Enhanced RAG: Building context from ${memories.length} memories for action: "${currentAction.substring(0, 50)}..."`);
        
        // Calculate relevance scores for each memory
        const scoredMemories = memories.map(memory => ({
            memory,
            relevanceScore: this.calculateRelevanceScore(memory, currentAction, gameState, config)
        }));
        
        // Sort by relevance and filter by threshold
        const relevantMemories = scoredMemories
            .filter(({ relevanceScore }) => relevanceScore >= config.importanceThreshold)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, config.maxMemories)
            .map(({ memory }) => memory);
        
        // Ensure diversity in selected memories
        const diverseMemories = this.ensureMemoryDiversity(relevantMemories, config);
        
        // Build contextual entities from selected memories
        const contextualEntities = this.extractContextualEntities(diverseMemories, gameState);
        
        // Generate relationship context
        const relationshipContext = this.buildRelationshipContext(diverseMemories, gameState);
        
        // Extract recent events for temporal context
        const recentEvents = this.extractRecentEvents(diverseMemories, gameState.turnCount);
        
        // Calculate overall importance and token usage
        const importance = this.calculateContextImportance(diverseMemories);
        const tokenUsage = this.estimateTokenUsage(diverseMemories, contextualEntities, relationshipContext);
        
        console.log(`✅ Enhanced RAG: Selected ${diverseMemories.length} memories, ${contextualEntities.length} entities, importance: ${importance.toFixed(1)}, tokens: ${tokenUsage}`);
        
        return {
            relevantMemories: diverseMemories,
            contextualEntities,
            relationshipContext,
            recentEvents,
            importance,
            tokenUsage
        };
    }

    /**
     * Calculate relevance score for a memory given the current context
     */
    private static calculateRelevanceScore(
        memory: Memory,
        currentAction: string,
        gameState: SaveData,
        config: RAGConfig
    ): number {
        let score = 0;
        
        // Base importance score (40% weight)
        const baseImportance = memory.importance || 0;
        score += baseImportance * 0.4;
        
        // Text relevance (30% weight)
        const textRelevance = this.calculateTextRelevance(memory.text, currentAction);
        score += textRelevance * 30;
        
        // Recency factor (20% weight)
        const recencyScore = this.calculateRecencyScore(memory, gameState.turnCount);
        score += recencyScore * config.recencyWeight * 100;
        
        // Entity relevance (10% weight)
        const entityRelevance = this.calculateEntityRelevance(memory, currentAction, gameState);
        score += entityRelevance * 10;
        
        // Category bonus
        if (memory.category) {
            const categoryBonus = this.getCategoryBonus(memory.category, currentAction);
            score += categoryBonus;
        }
        
        // Source reliability bonus
        if (memory.source === 'chronicle') {
            score += 5; // Chronicle memories are generally more reliable
        }
        
        return Math.min(100, Math.max(0, score));
    }

    /**
     * Calculate text relevance using keyword matching and semantic similarity
     */
    private static calculateTextRelevance(memoryText: string, currentAction: string): number {
        const memoryWords = memoryText.toLowerCase().split(/\s+/);
        const actionWords = currentAction.toLowerCase().split(/\s+/);
        
        // Direct keyword matches
        const commonWords = memoryWords.filter(word => 
            actionWords.some(actionWord => 
                word.includes(actionWord) || actionWord.includes(word)
            )
        );
        
        const directMatch = memoryWords.length > 0 ? commonWords.length / memoryWords.length : 0;
        
        // Contextual keywords for Vietnamese RPG
        const contextKeywords = this.extractContextKeywords(currentAction);
        const memoryKeywords = this.extractContextKeywords(memoryText);
        
        const contextMatch = contextKeywords.filter(keyword => 
            memoryKeywords.includes(keyword)
        ).length;
        
        const contextScore = Math.min(1, contextMatch * 0.2);
        
        return Math.min(100, (directMatch * 70) + (contextScore * 30));
    }

    /**
     * Calculate recency score (newer memories are more relevant)
     */
    private static calculateRecencyScore(memory: Memory, currentTurn: number): number {
        const memoryAge = currentTurn - (memory.createdAt || currentTurn);
        const maxAge = 50; // Consider memories older than 50 turns as "old"
        
        if (memoryAge <= 0) return 1;
        if (memoryAge >= maxAge) return 0.1;
        
        return Math.max(0.1, 1 - (memoryAge / maxAge));
    }

    /**
     * Calculate entity relevance based on related entities
     */
    private static calculateEntityRelevance(
        memory: Memory,
        currentAction: string,
        gameState: SaveData
    ): number {
        if (!memory.relatedEntities?.length) return 0;
        
        const actionLower = currentAction.toLowerCase();
        let relevantEntities = 0;
        
        for (const entityName of memory.relatedEntities) {
            // Check if entity is mentioned in current action
            if (actionLower.includes(entityName.toLowerCase())) {
                relevantEntities++;
                continue;
            }
            
            // Check if entity is currently in party
            if (gameState.party?.some(member => member.name === entityName)) {
                relevantEntities += 0.5;
                continue;
            }
            
            // Check if entity is in known entities and recently accessed
            const entity = gameState.knownEntities[entityName];
            if (entity && entity.lastInteraction) {
                const interactionAge = gameState.turnCount - entity.lastInteraction;
                if (interactionAge < 10) {
                    relevantEntities += 0.3;
                }
            }
        }
        
        return Math.min(10, relevantEntities * 2);
    }

    /**
     * Get category-specific bonus based on action type
     */
    private static getCategoryBonus(category: string, currentAction: string): number {
        const actionLower = currentAction.toLowerCase();
        
        const categoryMappings: Record<string, string[]> = {
            'combat': ['tấn công', 'đánh', 'chiến đấu', 'giết', 'chém', 'bắn'],
            'social': ['nói', 'hỏi', 'thuyết phục', 'giao dịch', 'mua', 'bán'],
            'discovery': ['khám phá', 'tìm kiếm', 'điều tra', 'quan sát'],
            'relationship': ['yêu', 'ghét', 'bạn', 'thù', 'tin tướng'],
            'story': ['nhiệm vụ', 'quest', 'mục tiêu', 'hoàn thành']
        };
        
        const keywords = categoryMappings[category] || [];
        const matches = keywords.filter(keyword => actionLower.includes(keyword));
        
        return matches.length * 3;
    }

    /**
     * Extract contextual keywords from text
     */
    private static extractContextKeywords(text: string): string[] {
        const keywords: string[] = [];
        const textLower = text.toLowerCase();
        
        // Action keywords
        const actionPatterns = [
            'tấn công', 'đánh', 'chiến đấu', 'khám phá', 'nói chuyện', 
            'mua', 'bán', 'học', 'sử dụng', 'đi đến', 'rời khỏi'
        ];
        
        // Object keywords
        const objectPatterns = [
            'kiếm', 'khiên', 'áo giáp', 'thuốc', 'ma pháp', 'kỹ năng',
            'vàng', 'bạc', 'đồng', 'rương', 'cửa', 'chìa khóa'
        ];
        
        // Location keywords
        const locationPatterns = [
            'thành phố', 'làng', 'rừng', 'núi', 'biển', 'hang động',
            'lâu đài', 'đền', 'chợ', 'tavern', 'khách sạn'
        ];
        
        [...actionPatterns, ...objectPatterns, ...locationPatterns].forEach(pattern => {
            if (textLower.includes(pattern)) {
                keywords.push(pattern);
            }
        });
        
        return keywords;
    }

    /**
     * Ensure diversity in selected memories to avoid redundancy
     */
    private static ensureMemoryDiversity(memories: Memory[], config: RAGConfig): Memory[] {
        if (memories.length <= 3) return memories;
        
        const diverse: Memory[] = [];
        const usedCategories = new Set<string>();
        const usedTopics = new Set<string>();
        
        // First pass: ensure category diversity
        for (const memory of memories) {
            if (diverse.length >= config.maxMemories) break;
            
            const category = memory.category || 'general';
            if (!usedCategories.has(category) || usedCategories.size < 3) {
                diverse.push(memory);
                usedCategories.add(category);
                
                // Track topic diversity using first few words
                const topic = memory.text.split(' ').slice(0, 3).join(' ').toLowerCase();
                usedTopics.add(topic);
            }
        }
        
        // Second pass: fill remaining slots with non-redundant memories
        for (const memory of memories) {
            if (diverse.length >= config.maxMemories) break;
            if (diverse.includes(memory)) continue;
            
            const topic = memory.text.split(' ').slice(0, 3).join(' ').toLowerCase();
            if (!usedTopics.has(topic)) {
                diverse.push(memory);
                usedTopics.add(topic);
            }
        }
        
        return diverse;
    }

    /**
     * Extract contextual entities from selected memories
     */
    private static extractContextualEntities(memories: Memory[], gameState: SaveData): Entity[] {
        const entityNames = new Set<string>();
        
        memories.forEach(memory => {
            memory.relatedEntities?.forEach(name => entityNames.add(name));
        });
        
        const entities: Entity[] = [];
        entityNames.forEach(name => {
            const entity = gameState.knownEntities[name];
            if (entity) {
                entities.push(entity);
            }
        });
        
        // Sort by relevance (party members first, then by recent interaction)
        return entities.sort((a, b) => {
            const aInParty = gameState.party?.some(p => p.name === a.name);
            const bInParty = gameState.party?.some(p => p.name === b.name);
            
            if (aInParty && !bInParty) return -1;
            if (!aInParty && bInParty) return 1;
            
            const aLastInteraction = a.lastInteraction || 0;
            const bLastInteraction = b.lastInteraction || 0;
            return bLastInteraction - aLastInteraction;
        });
    }

    /**
     * Build relationship context from memories
     */
    private static buildRelationshipContext(memories: Memory[], gameState: SaveData): string[] {
        const relationships: string[] = [];
        
        // Extract relationship info from party members
        gameState.party?.forEach(member => {
            if (member.relationship) {
                relationships.push(`${member.name}: ${member.relationship}`);
            }
        });
        
        // Extract relationship mentions from memories
        memories.forEach(memory => {
            if (memory.category === 'relationship' || memory.text.includes('quan hệ')) {
                const relationshipInfo = this.extractRelationshipInfo(memory.text);
                if (relationshipInfo) {
                    relationships.push(relationshipInfo);
                }
            }
        });
        
        return [...new Set(relationships)]; // Remove duplicates
    }

    /**
     * Extract relationship information from memory text
     */
    private static extractRelationshipInfo(text: string): string | null {
        // Look for relationship patterns in Vietnamese
        const patterns = [
            /quan hệ với ([^:]+): ([^.!?]+)/i,
            /([^,]+) là ([^.!?]+) của/i,
            /tin tưởng ([^.!?]+)/i,
            /thù địch với ([^.!?]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0].trim();
            }
        }
        
        return null;
    }

    /**
     * Extract recent events for temporal context
     */
    private static extractRecentEvents(memories: Memory[], currentTurn: number): string[] {
        const recentEvents: string[] = [];
        
        const recentMemories = memories
            .filter(m => (currentTurn - (m.createdAt || currentTurn)) <= 5)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        recentMemories.forEach(memory => {
            // Extract key events from memory text
            const events = this.extractKeyEvents(memory.text);
            recentEvents.push(...events);
        });
        
        return recentEvents.slice(0, 5); // Limit to 5 most recent events
    }

    /**
     * Extract key events from memory text
     */
    private static extractKeyEvents(text: string): string[] {
        const events: string[] = [];
        
        // Look for action patterns
        const actionPatterns = [
            /hoàn thành ([^.!?]+)/gi,
            /đánh bại ([^.!?]+)/gi,
            /khám phá ([^.!?]+)/gi,
            /gặp ([^.!?]+)/gi,
            /nhận được ([^.!?]+)/gi
        ];
        
        actionPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                events.push(...matches.map(match => match.trim()));
            }
        });
        
        return events;
    }

    /**
     * Calculate overall importance of the context
     */
    private static calculateContextImportance(memories: Memory[]): number {
        if (memories.length === 0) return 0;
        
        const totalImportance = memories.reduce((sum, memory) => 
            sum + (memory.importance || 0), 0
        );
        
        return totalImportance / memories.length;
    }

    /**
     * Estimate token usage for the context
     */
    private static estimateTokenUsage(
        memories: Memory[],
        entities: Entity[],
        relationships: string[]
    ): number {
        let tokens = 0;
        
        // Memory tokens
        tokens += memories.reduce((sum, memory) => 
            sum + Math.ceil(memory.text.length * 0.8), 0
        );
        
        // Entity tokens
        tokens += entities.reduce((sum, entity) => 
            sum + Math.ceil((entity.description?.length || 0) * 0.8), 0
        );
        
        // Relationship tokens
        tokens += relationships.reduce((sum, rel) => 
            sum + Math.ceil(rel.length * 0.8), 0
        );
        
        return tokens;
    }

    /**
     * Format context for AI prompt inclusion
     */
    public static formatContextForPrompt(context: RAGContext): string {
        let formattedContext = '';
        
        if (context.relevantMemories.length > 0) {
            formattedContext += '--- RELEVANT MEMORIES ---\n';
            context.relevantMemories.forEach((memory, index) => {
                formattedContext += `${index + 1}. [${memory.category?.toUpperCase() || 'GENERAL'}] ${memory.text}\n`;
            });
            formattedContext += '\n';
        }
        
        if (context.relationshipContext.length > 0) {
            formattedContext += '--- RELATIONSHIPS ---\n';
            context.relationshipContext.forEach(rel => {
                formattedContext += `• ${rel}\n`;
            });
            formattedContext += '\n';
        }
        
        if (context.recentEvents.length > 0) {
            formattedContext += '--- RECENT EVENTS ---\n';
            context.recentEvents.forEach(event => {
                formattedContext += `• ${event}\n`;
            });
            formattedContext += '\n';
        }
        
        return formattedContext;
    }
}