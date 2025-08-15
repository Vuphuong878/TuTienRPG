import type { Memory, SaveData, Entity, KnownEntities } from '../types';

export interface ImportanceAnalysis {
    score: number;
    reasons: string[];
    suggestions: string[];
}

export class ImportanceScorer {
    
    /**
     * Calculate dynamic importance score for a memory
     * Range: 0-100, higher = more important
     */
    static calculateMemoryScore(memory: Memory, gameState: SaveData): ImportanceAnalysis {
        let score = 0;
        const reasons: string[] = [];
        const suggestions: string[] = [];
        
        // Base importance by source
        if (memory.source === 'chronicle') {
            score += 30;
            reasons.push('Chronicle origin (+30)');
        } else if (memory.source === 'manual') {
            score += 20;
            reasons.push('Manually created (+20)');
        } else {
            score += 10;
            reasons.push('Auto-generated (+10)');
        }
        
        // Pinned memories get significant boost
        if (memory.pinned) {
            score += 50;
            reasons.push('User pinned (+50)');
        }
        
        // Recency bonus (decays over time)
        if (memory.createdAt) {
            const turnsSinceCreated = gameState.turnCount - memory.createdAt;
            const recencyBonus = Math.max(0, 20 - (turnsSinceCreated * 0.5));
            if (recencyBonus > 0) {
                score += recencyBonus;
                reasons.push(`Recent creation (+${recencyBonus.toFixed(1)})`);
            }
        }
        
        // Access frequency bonus
        if (memory.lastAccessed) {
            const turnsSinceAccess = gameState.turnCount - memory.lastAccessed;
            const accessBonus = Math.max(0, 15 - (turnsSinceAccess * 0.3));
            if (accessBonus > 0) {
                score += accessBonus;
                reasons.push(`Recently accessed (+${accessBonus.toFixed(1)})`);
            }
        }
        
        // Entity relevance (active characters boost score)
        if (memory.relatedEntities && memory.relatedEntities.length > 0) {
            let entityBonus = 0;
            memory.relatedEntities.forEach(entityName => {
                const entity = gameState.knownEntities[entityName];
                if (entity) {
                    if (entity.type === 'companion') {
                        entityBonus += 10;
                    } else if (entity.type === 'pc') {
                        entityBonus += 5;
                    } else if (entity.owner === 'pc') {
                        entityBonus += 5;
                    } else if (entity.type === 'npc') {
                        entityBonus += 3;
                    }
                }
            });
            if (entityBonus > 0) {
                score += entityBonus;
                reasons.push(`Related entities (+${entityBonus})`);
            }
        }
        
        // Emotional weight bonus
        if (memory.emotionalWeight) {
            const emotionalBonus = Math.abs(memory.emotionalWeight) * 2;
            score += emotionalBonus;
            reasons.push(`Emotional significance (+${emotionalBonus})`);
        }
        
        // Category importance
        if (memory.category) {
            switch (memory.category) {
                case 'story':
                    score += 15;
                    reasons.push('Story category (+15)');
                    break;
                case 'relationship':
                    score += 10;
                    reasons.push('Relationship category (+10)');
                    break;
                case 'combat':
                    score += 8;
                    reasons.push('Combat category (+8)');
                    break;
                case 'discovery':
                    score += 6;
                    reasons.push('Discovery category (+6)');
                    break;
                case 'social':
                    score += 5;
                    reasons.push('Social category (+5)');
                    break;
                default:
                    // general gets no bonus
                    break;
            }
        }
        
        // Content analysis bonus
        const contentBonus = this.analyzeContentImportance(memory.text);
        if (contentBonus > 0) {
            score += contentBonus;
            reasons.push(`Content keywords (+${contentBonus})`);
        }
        
        // Generate suggestions for improvement
        if (!memory.createdAt) {
            suggestions.push('Add creation timestamp for recency tracking');
        }
        if (!memory.category) {
            suggestions.push('Categorize memory for better importance scoring');
        }
        if (!memory.relatedEntities || memory.relatedEntities.length === 0) {
            suggestions.push('Link to related entities for context');
        }
        if (score < 30 && !memory.pinned) {
            suggestions.push('Consider pinning if this memory is important to you');
        }
        if (score > 80 && !memory.pinned) {
            suggestions.push('High-importance memory - consider auto-pinning');
        }
        
        // Normalize score to 0-100 range
        const finalScore = Math.min(100, Math.max(0, score));
        
        return {
            score: finalScore,
            reasons,
            suggestions
        };
    }
    
    /**
     * Analyze memory text content for important keywords
     */
    private static analyzeContentImportance(text: string): number {
        let score = 0;
        const lowerText = text.toLowerCase();
        
        // High importance patterns (death, major events)
        const highImportancePatterns = [
            /chết|tử vong|hi sinh|thiệt mạng/g,
            /cưới|kết hôn|đính hôn/g,
            /chiến thắng|thắng lợi|đại thắng/g,
            /thua cuộc|thất bại|thảm bại/g,
            /yêu|phải lòng|si mê/g
        ];
        
        highImportancePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) {
                score += matches.length * 10;
            }
        });
        
        // Medium importance patterns (progression, relationships)
        const mediumImportancePatterns = [
            /học được|nâng cấp|tiến bộ|thăng cấp/g,
            /gặp gỡ|kết bạn|đồng minh|thù địch/g,
            /nhận được|tìm thấy|thu thập|mua được/g,
            /bí mật|bí ẩn|khám phá|phát hiện/g
        ];
        
        mediumImportancePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) {
                score += matches.length * 5;
            }
        });
        
        // Low importance patterns (daily activities)
        const lowImportancePatterns = [
            /ăn|uống|ngủ|nghỉ ngơi/g,
            /mua sắm|đi chợ|dạo phố/g,
            /trò chuyện|nói chuyện|tám/g
        ];
        
        lowImportancePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) {
                score += matches.length * 1;
            }
        });
        
        return Math.min(50, score); // Cap content bonus at 50 points
    }
    
    /**
     * Calculate entity relevance score based on current game state
     */
    static calculateEntityRelevance(entityName: string, gameState: SaveData): number {
        const entity = gameState.knownEntities[entityName];
        if (!entity) return 0;
        
        let score = 0;
        
        // Base score by entity type
        switch (entity.type) {
            case 'pc':
                score += 50; // Player character always highly relevant
                break;
            case 'companion':
                score += 40; // Companions are very relevant
                break;
            case 'npc':
                score += 20; // NPCs moderately relevant
                break;
            case 'location':
                score += 15; // Locations somewhat relevant
                break;
            case 'item':
                if (entity.owner === 'pc') {
                    score += 25; // Player-owned items are relevant
                } else {
                    score += 5;
                }
                break;
            case 'skill':
                score += 30; // Skills are important
                break;
            default:
                score += 10;
        }
        
        // Boost for recently mentioned entities
        if (entity.lastMentioned) {
            const turnsSinceLastMention = gameState.turnCount - entity.lastMentioned;
            const recencyBonus = Math.max(0, 20 - turnsSinceLastMention);
            score += recencyBonus;
        }
        
        // Boost for party members
        if (gameState.party && gameState.party.some(p => p.name === entityName)) {
            score += 30;
        }
        
        // Penalty for archived entities
        if (entity.archived) {
            score *= 0.3;
        }
        
        return Math.min(100, score);
    }
    
    /**
     * Suggest memory category based on content analysis
     */
    static suggestCategory(text: string, relatedEntities?: string[]): 'combat' | 'social' | 'discovery' | 'story' | 'relationship' | 'general' {
        const lowerText = text.toLowerCase();
        
        // Combat patterns
        if (/tấn công|đánh|chiến đấu|giết|chém|đâm|phòng thủ|né tránh/.test(lowerText)) {
            return 'combat';
        }
        
        // Relationship patterns
        if (/yêu|ghét|bạn|thù|cưới|hôn|thân thiết|xa cách/.test(lowerText)) {
            return 'relationship';
        }
        
        // Discovery patterns
        if (/tìm thấy|khám phá|phát hiện|bí mật|bí ẩn|tìm kiếm/.test(lowerText)) {
            return 'discovery';
        }
        
        // Social patterns
        if (/nói|thuyết phục|giao dịch|mua|bán|gặp gỡ|trò chuyện/.test(lowerText)) {
            return 'social';
        }
        
        // Story patterns (major events)
        if (/chết|cưới|chiến thắng|thất bại|kết thúc|bắt đầu/.test(lowerText)) {
            return 'story';
        }
        
        return 'general';
    }
    
    /**
     * Extract emotional weight from text content
     */
    static analyzeEmotionalWeight(text: string): number {
        const lowerText = text.toLowerCase();
        let weight = 0;
        
        // Very positive emotions (+3 to +5)
        const veryPositivePatterns = [
            /hạnh phúc|vui mừng|phấn khích|tuyệt vời/g,
            /yêu|phải lòng|si mê|đam mê/g,
            /chiến thắng|thành công|đại thắng/g
        ];
        
        veryPositivePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) weight += matches.length * 4;
        });
        
        // Positive emotions (+1 to +2)
        const positivePatterns = [
            /vui|thoải mái|hài lòng|tốt/g,
            /bạn bè|đồng minh|tin tưởng/g
        ];
        
        positivePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) weight += matches.length * 1.5;
        });
        
        // Very negative emotions (-3 to -5)
        const veryNegativePatterns = [
            /chết|tử vong|thảm kịch|đau khổ/g,
            /ghét|căm thù|thù địch|phản bội/g,
            /thất bại|thảm bại|thua cuộc/g
        ];
        
        veryNegativePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) weight -= matches.length * 4;
        });
        
        // Negative emotions (-1 to -2)
        const negativePatterns = [
            /buồn|khó chịu|thất望|lo lắng/g,
            /kẻ thù|đối địch|xung đột/g
        ];
        
        negativePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) weight -= matches.length * 1.5;
        });
        
        // Clamp to -10 to +10 range
        return Math.max(-10, Math.min(10, weight));
    }
}