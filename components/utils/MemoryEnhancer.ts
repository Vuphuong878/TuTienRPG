import type { Memory, SaveData, Entity } from '../types';
import { ImportanceScorer } from './ImportanceScorer';

export interface MemoryEnhancementResult {
    enhanced: Memory;
    changes: string[];
    suggestions: string[];
}

export class MemoryEnhancer {
    
    /**
     * Enhance a basic memory with metadata and analysis
     */
    static enhanceMemory(memory: Memory, gameState: SaveData): MemoryEnhancementResult {
        const enhanced = { ...memory };
        const changes: string[] = [];
        const suggestions: string[] = [];
        
        // Add creation timestamp if missing
        if (!enhanced.createdAt) {
            enhanced.createdAt = gameState.turnCount;
            changes.push('Added creation timestamp');
        }
        
        // Add last accessed timestamp if missing
        if (!enhanced.lastAccessed) {
            enhanced.lastAccessed = gameState.turnCount;
            changes.push('Added last accessed timestamp');
        }
        
        // Auto-detect and set source if missing
        if (!enhanced.source) {
            enhanced.source = this.detectSource(enhanced.text);
            changes.push(`Detected source: ${enhanced.source}`);
        }
        
        // Auto-categorize if missing
        if (!enhanced.category) {
            enhanced.category = ImportanceScorer.suggestCategory(enhanced.text, enhanced.relatedEntities);
            changes.push(`Auto-categorized as: ${enhanced.category}`);
        }
        
        // Extract related entities if missing
        if (!enhanced.relatedEntities || enhanced.relatedEntities.length === 0) {
            enhanced.relatedEntities = this.extractRelatedEntities(enhanced.text, gameState.knownEntities);
            if (enhanced.relatedEntities.length > 0) {
                changes.push(`Found related entities: ${enhanced.relatedEntities.join(', ')}`);
            }
        }
        
        // Analyze emotional weight if missing
        if (enhanced.emotionalWeight === undefined) {
            enhanced.emotionalWeight = ImportanceScorer.analyzeEmotionalWeight(enhanced.text);
            if (enhanced.emotionalWeight !== 0) {
                changes.push(`Emotional weight: ${enhanced.emotionalWeight}`);
            }
        }
        
        // Generate tags if missing
        if (!enhanced.tags || enhanced.tags.length === 0) {
            enhanced.tags = this.generateTags(enhanced.text, enhanced.relatedEntities || []);
            if (enhanced.tags.length > 0) {
                changes.push(`Generated tags: ${enhanced.tags.join(', ')}`);
            }
        }
        
        // Calculate importance score
        const importanceAnalysis = ImportanceScorer.calculateMemoryScore(enhanced, gameState);
        enhanced.importance = importanceAnalysis.score;
        changes.push(`Importance score: ${importanceAnalysis.score}/100`);
        
        // Add importance-based suggestions
        suggestions.push(...importanceAnalysis.suggestions);
        
        return {
            enhanced,
            changes,
            suggestions
        };
    }
    
    /**
     * Detect memory source based on content patterns
     */
    private static detectSource(text: string): 'chronicle' | 'manual' | 'auto_generated' {
        // Chronicle patterns (usually start with stars or specific markers)
        if (text.startsWith('⭐') || text.includes('Biên niên sử') || text.includes('Chronicle')) {
            return 'chronicle';
        }
        
        // Auto-generated patterns (usually descriptive or system-like)
        if (text.includes('tự động') || text.includes('hệ thống') || text.includes('AI generated')) {
            return 'auto_generated';
        }
        
        // Default to manual if no clear indicators
        return 'manual';
    }
    
    /**
     * Extract entity names mentioned in the memory text
     */
    private static extractRelatedEntities(text: string, knownEntities: { [name: string]: Entity }): string[] {
        const relatedEntities: string[] = [];
        const lowerText = text.toLowerCase();
        
        // Check each known entity
        Object.entries(knownEntities).forEach(([name, entity]) => {
            // Check for exact name match
            if (lowerText.includes(name.toLowerCase())) {
                relatedEntities.push(name);
                return;
            }
            
            // Check for name variations (first word, last word, etc.)
            const nameVariations = this.generateNameVariations(name);
            for (const variation of nameVariations) {
                if (lowerText.includes(variation.toLowerCase())) {
                    relatedEntities.push(name);
                    break;
                }
            }
            
            // Check for skills if it's an NPC/PC
            if (entity.skills) {
                for (const skill of entity.skills) {
                    if (lowerText.includes(skill.toLowerCase())) {
                        relatedEntities.push(name);
                        break;
                    }
                }
            }
        });
        
        // Remove duplicates and return
        return Array.from(new Set(relatedEntities));
    }
    
    /**
     * Generate name variations for better entity matching
     */
    private static generateNameVariations(name: string): string[] {
        const variations: string[] = [];
        
        // Split by spaces and get individual words
        const words = name.split(' ').filter(word => word.length > 1);
        
        // Add each significant word
        words.forEach(word => {
            if (word.length > 2) { // Only include words longer than 2 characters
                variations.push(word);
            }
        });
        
        // Add first and last name combinations
        if (words.length > 1) {
            variations.push(words[0]); // First name
            variations.push(words[words.length - 1]); // Last name
            variations.push(`${words[0]} ${words[words.length - 1]}`); // First + Last
        }
        
        return variations;
    }
    
    /**
     * Generate relevant tags for the memory
     */
    private static generateTags(text: string, relatedEntities: string[]): string[] {
        const tags: string[] = [];
        const lowerText = text.toLowerCase();
        
        // Action-based tags
        const actionTags = [
            { keywords: ['tấn công', 'đánh', 'chiến đấu'], tag: 'combat' },
            { keywords: ['nói', 'thuyết phục', 'trò chuyện'], tag: 'dialogue' },
            { keywords: ['mua', 'bán', 'giao dịch'], tag: 'trade' },
            { keywords: ['học', 'nâng cấp', 'tiến bộ'], tag: 'progression' },
            { keywords: ['tìm', 'khám phá', 'phát hiện'], tag: 'exploration' },
            { keywords: ['yêu', 'cưới', 'hôn'], tag: 'romance' },
            { keywords: ['chết', 'tử vong', 'hi sinh'], tag: 'death' },
            { keywords: ['bí mật', 'bí ẩn', 'ẩn giấu'], tag: 'mystery' }
        ];
        
        actionTags.forEach(({ keywords, tag }) => {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                tags.push(tag);
            }
        });
        
        // Entity type tags
        relatedEntities.forEach(entityName => {
            tags.push(`entity:${entityName.toLowerCase().replace(/\s+/g, '-')}`);
        });
        
        // Emotional tags
        if (lowerText.includes('vui') || lowerText.includes('hạnh phúc')) {
            tags.push('positive');
        }
        if (lowerText.includes('buồn') || lowerText.includes('khó chịu')) {
            tags.push('negative');
        }
        if (lowerText.includes('quan trọng') || lowerText.includes('đặc biệt')) {
            tags.push('important');
        }
        
        // Time-based tags (if content suggests specific timing)
        if (lowerText.includes('đêm') || lowerText.includes('tối')) {
            tags.push('night');
        }
        if (lowerText.includes('ngày') || lowerText.includes('sáng')) {
            tags.push('day');
        }
        
        // Remove duplicates and limit to reasonable number
        return Array.from(new Set(tags)).slice(0, 10);
    }
    
    /**
     * Update memory when it's accessed (for tracking last accessed time)
     */
    static trackMemoryAccess(memory: Memory, currentTurn: number): Memory {
        return {
            ...memory,
            lastAccessed: currentTurn
        };
    }
    
    /**
     * Batch enhance multiple memories
     */
    static batchEnhanceMemories(memories: Memory[], gameState: SaveData): Memory[] {
        return memories.map(memory => {
            const result = this.enhanceMemory(memory, gameState);
            return result.enhanced;
        });
    }
    
    /**
     * Find related memories based on shared entities or content
     */
    static findRelatedMemories(targetMemory: Memory, allMemories: Memory[]): Memory[] {
        const related: Memory[] = [];
        
        if (!targetMemory.relatedEntities) return related;
        
        allMemories.forEach(memory => {
            if (memory === targetMemory) return;
            
            // Check for shared entities
            if (memory.relatedEntities) {
                const sharedEntities = memory.relatedEntities.filter(entity => 
                    targetMemory.relatedEntities!.includes(entity)
                );
                
                if (sharedEntities.length > 0) {
                    related.push(memory);
                }
            }
            
            // Check for shared tags
            if (memory.tags && targetMemory.tags) {
                const sharedTags = memory.tags.filter(tag => 
                    targetMemory.tags!.includes(tag)
                );
                
                if (sharedTags.length >= 2) { // At least 2 shared tags
                    related.push(memory);
                }
            }
        });
        
        // Remove duplicates and sort by importance
        const uniqueRelated = Array.from(new Set(related));
        return uniqueRelated.sort((a, b) => (b.importance || 0) - (a.importance || 0));
    }
}