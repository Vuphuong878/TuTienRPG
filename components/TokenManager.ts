/**
 * Unified Token Management System
 * Centralizes all token estimation and management across the application
 */

export interface TokenEstimationConfig {
    charsPerToken: number;
    safetyMargin: number;
    maxTokensPerTurn: number;
    tokenBuffer: number;
}

export interface TokenAllocation {
    critical: number;
    important: number;
    contextual: number;
    supplemental: number;
}

export interface TokenUsageStats {
    estimated: number;
    actual?: number;
    efficiency: number; // actual/estimated ratio
    category: 'critical' | 'important' | 'contextual' | 'supplemental' | 'total';
}

export class TokenManager {
    // Centralized configuration - single source of truth
    private static readonly CONFIG: TokenEstimationConfig = {
        charsPerToken: 0.75,        // Vietnamese approximation (conservative)
        safetyMargin: 0.1,          // 10% safety buffer for estimation errors
        maxTokensPerTurn: 80000,    // Maximum tokens per AI turn
        tokenBuffer: 5000           // Reserve buffer for system overhead
    };

    // Standard allocation ratios
    private static readonly ALLOCATION_RATIOS = {
        CRITICAL: 0.40,      // Action context + immediately relevant entities
        IMPORTANT: 0.30,     // Related entities + active quests + recent history  
        CONTEXTUAL: 0.20,    // World context + chronicle + memories
        SUPPLEMENTAL: 0.10   // Additional context + rules
    };

    // Token costs for different content types (for accurate estimation)
    private static readonly CONTENT_MULTIPLIERS = {
        plainText: 1.0,
        structuredData: 1.2,    // JSON, lists, etc need more tokens
        dialogue: 0.9,          // Conversations are more efficient
        descriptions: 1.1,      // Narrative text slightly more expensive
        code: 1.3,             // Code/commands use more tokens
        metadata: 0.8          // Tags, labels are compact
    };

    /**
     * Core token estimation method - used everywhere
     */
    static estimate(text: string, contentType: keyof typeof TokenManager.CONTENT_MULTIPLIERS = 'plainText'): number {
        if (!text || typeof text !== 'string') return 0;
        
        const baseEstimate = Math.ceil(text.length * this.CONFIG.charsPerToken);
        const multiplier = this.CONTENT_MULTIPLIERS[contentType];
        const adjusted = Math.ceil(baseEstimate * multiplier);
        
        // Apply safety margin
        return Math.ceil(adjusted * (1 + this.CONFIG.safetyMargin));
    }

    /**
     * Estimate tokens for complex objects
     */
    static estimateObject(obj: any, contentType: keyof typeof TokenManager.CONTENT_MULTIPLIERS = 'structuredData'): number {
        if (obj === null || obj === undefined) return 0;
        
        let text: string;
        if (typeof obj === 'string') {
            text = obj;
        } else if (typeof obj === 'object') {
            text = JSON.stringify(obj);
        } else {
            text = String(obj);
        }
        
        return this.estimate(text, contentType);
    }

    /**
     * Calculate token allocation based on available budget
     */
    static calculateAllocation(contextComplexity: 'low' | 'medium' | 'high' = 'medium'): TokenAllocation {
        const baseLimit = this.CONFIG.maxTokensPerTurn - this.CONFIG.tokenBuffer;
        
        // Adjust ratios based on complexity
        let ratios = { ...this.ALLOCATION_RATIOS };
        
        switch (contextComplexity) {
            case 'high':
                // More focus on critical content when complex
                ratios.CRITICAL += 0.05;
                ratios.IMPORTANT -= 0.03;
                ratios.CONTEXTUAL -= 0.02;
                break;
            case 'low':
                // More room for context when simple
                ratios.CRITICAL -= 0.05;
                ratios.CONTEXTUAL += 0.03;
                ratios.SUPPLEMENTAL += 0.02;
                break;
            // 'medium' uses default ratios
        }

        return {
            critical: Math.floor(baseLimit * ratios.CRITICAL),
            important: Math.floor(baseLimit * ratios.IMPORTANT),
            contextual: Math.floor(baseLimit * ratios.CONTEXTUAL),
            supplemental: Math.floor(baseLimit * ratios.SUPPLEMENTAL)
        };
    }

    /**
     * Check if content fits within token limit
     */
    static validateLimit(text: string, limit: number, contentType: keyof typeof TokenManager.CONTENT_MULTIPLIERS = 'plainText'): boolean {
        return this.estimate(text, contentType) <= limit;
    }

    /**
     * Truncate text to fit within token limit
     */
    static truncateToLimit(text: string, maxTokens: number, contentType: keyof typeof TokenManager.CONTENT_MULTIPLIERS = 'plainText'): string {
        if (this.validateLimit(text, maxTokens, contentType)) {
            return text;
        }

        // Calculate approximate character limit
        const multiplier = this.CONTENT_MULTIPLIERS[contentType];
        const safetyFactor = 1 + this.CONFIG.safetyMargin;
        const effectiveCharsPerToken = this.CONFIG.charsPerToken * multiplier * safetyFactor;
        
        const charLimit = Math.floor(maxTokens / effectiveCharsPerToken);
        
        if (text.length <= charLimit) {
            return text;
        }

        // Smart truncation - try to break at sentence boundaries
        const truncated = text.substring(0, charLimit);
        const lastPeriod = truncated.lastIndexOf('.');
        const lastExclamation = truncated.lastIndexOf('!');
        const lastQuestion = truncated.lastIndexOf('?');
        const lastNewline = truncated.lastIndexOf('\n');
        
        // Find the best break point
        const breakPoints = [lastPeriod, lastExclamation, lastQuestion, lastNewline].filter(pos => pos > 0);
        const bestBreak = Math.max(...breakPoints);
        
        // Use best break point if it's not too far back (at least 80% of char limit)
        if (bestBreak > charLimit * 0.8) {
            return text.substring(0, bestBreak + 1);
        }
        
        // Otherwise, find last space
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > charLimit * 0.9) {
            return text.substring(0, lastSpace) + '...';
        }
        
        // Hard truncation as last resort
        return text.substring(0, charLimit - 3) + '...';
    }

    /**
     * Calculate token efficiency (actual vs estimated)
     */
    static calculateEfficiency(estimated: number, actual: number): number {
        if (estimated === 0) return actual === 0 ? 1 : 0;
        return Math.round((actual / estimated) * 100) / 100;
    }

    /**
     * Get current token limits and configurations
     */
    static getConfig(): Readonly<TokenEstimationConfig> {
        return { ...this.CONFIG };
    }

    /**
     * Memory/Entity specific token estimation
     */
    static estimateMemory(memory: { text: string; pinned?: boolean }): number {
        // Pinned memories might be referenced more, so slightly higher cost
        const multiplier = memory.pinned ? 1.1 : 1.0;
        return Math.ceil(this.estimate(memory.text, 'plainText') * multiplier);
    }

    static estimateEntity(entity: any): number {
        let totalTokens = 0;
        
        // Base info
        totalTokens += this.estimate(entity.name || '', 'metadata');
        totalTokens += this.estimate(entity.type || '', 'metadata');
        totalTokens += this.estimate(entity.description || '', 'descriptions');
        
        // Optional fields
        if (entity.personality) totalTokens += this.estimate(entity.personality, 'plainText');
        if (entity.motivation) totalTokens += this.estimate(entity.motivation, 'plainText');
        if (entity.skills?.length) totalTokens += this.estimate(entity.skills.join(', '), 'metadata');
        if (entity.location) totalTokens += this.estimate(entity.location, 'metadata');
        if (entity.realm) totalTokens += this.estimate(entity.realm, 'metadata');
        
        return totalTokens;
    }

    static estimateQuest(quest: any): number {
        let totalTokens = 0;
        
        totalTokens += this.estimate(quest.title || '', 'plainText');
        totalTokens += this.estimate(quest.description || '', 'descriptions');
        
        if (quest.objectives?.length) {
            quest.objectives.forEach((obj: any) => {
                totalTokens += this.estimate(obj.description || '', 'plainText');
            });
        }
        
        return totalTokens;
    }

    static estimateStatus(status: any): number {
        let totalTokens = 0;
        
        totalTokens += this.estimate(status.name || '', 'metadata');
        totalTokens += this.estimate(status.description || '', 'descriptions');
        totalTokens += this.estimate(status.duration || '', 'metadata');
        totalTokens += this.estimate(status.owner || '', 'metadata');
        
        return totalTokens;
    }

    /**
     * Chronicle/History estimation
     */
    static estimateChronicleEntry(entry: string, type: 'memoir' | 'chapter' | 'turn'): number {
        const typeMultipliers = {
            memoir: 1.3,    // More detailed, important content
            chapter: 1.1,   // Moderate detail
            turn: 0.9       // Brief summaries
        };
        
        return Math.ceil(this.estimate(entry, 'plainText') * typeMultipliers[type]);
    }

    static estimateGameHistoryEntry(entry: any): number {
        if (!entry?.parts?.[0]?.text) return 0;
        
        const text = entry.parts[0].text;
        
        // User entries are typically actions (more structured)
        // Model entries are typically stories (more descriptive)
        const contentType = entry.role === 'user' ? 'structuredData' : 'descriptions';
        
        return this.estimate(text, contentType);
    }

    /**
     * Budget validation and warnings
     */
    static validateBudget(allocation: TokenAllocation, usage: Partial<TokenAllocation>): {
        isValid: boolean;
        warnings: string[];
        totalUsage: number;
        totalBudget: number;
    } {
        const warnings: string[] = [];
        let totalUsage = 0;
        const totalBudget = allocation.critical + allocation.important + allocation.contextual + allocation.supplemental;
        
        // Check individual categories
        Object.entries(usage).forEach(([category, used]) => {
            if (used !== undefined) {
                const categoryBudget = allocation[category as keyof TokenAllocation];
                totalUsage += used;
                
                if (used > categoryBudget) {
                    warnings.push(`${category} category exceeded budget: ${used}/${categoryBudget} tokens`);
                }
                
                if (used > categoryBudget * 1.2) {
                    warnings.push(`${category} category critically over budget (20%+)`);
                }
            }
        });
        
        // Check total budget
        if (totalUsage > totalBudget) {
            warnings.push(`Total usage exceeded budget: ${totalUsage}/${totalBudget} tokens`);
        }
        
        const hardLimit = this.CONFIG.maxTokensPerTurn;
        if (totalUsage > hardLimit) {
            warnings.push(`CRITICAL: Hard limit exceeded: ${totalUsage}/${hardLimit} tokens`);
        }
        
        return {
            isValid: warnings.length === 0,
            warnings,
            totalUsage,
            totalBudget
        };
    }

    /**
     * Performance monitoring
     */
    static createUsageStats(category: TokenUsageStats['category'], estimated: number, actual?: number): TokenUsageStats {
        return {
            estimated,
            actual,
            efficiency: actual ? this.calculateEfficiency(estimated, actual) : 1,
            category
        };
    }

    /**
     * Utility: Format token count for display
     */
    static formatTokenCount(tokens: number): string {
        if (tokens >= 1000) {
            return `${Math.round(tokens / 100) / 10}k`;
        }
        return tokens.toString();
    }

    /**
     * Utility: Get token usage color for UI
     */
    static getUsageColor(used: number, budget: number): string {
        const percentage = used / budget;
        
        if (percentage <= 0.7) return 'text-green-500';      // Good
        if (percentage <= 0.85) return 'text-yellow-500';    // Warning
        if (percentage <= 1.0) return 'text-orange-500';     // Near limit
        return 'text-red-500';                               // Over limit
    }

    /**
     * Debug: Log detailed token usage breakdown
     */
    static logTokenUsage(context: string, allocation: TokenAllocation, usage: Partial<TokenAllocation>): void {
        console.group(`🔍 Token Usage: ${context}`);
        
        const validation = this.validateBudget(allocation, usage);
        
        console.log('📊 Budget vs Usage:');
        Object.entries(allocation).forEach(([category, budget]) => {
            const used = usage[category as keyof TokenAllocation] || 0;
            const percentage = Math.round((used / budget) * 100);
            console.log(`  ${category}: ${used}/${budget} (${percentage}%)`);
        });
        
        console.log(`📈 Total: ${validation.totalUsage}/${validation.totalBudget} tokens`);
        
        if (validation.warnings.length > 0) {
            console.warn('⚠️ Warnings:', validation.warnings);
        }
        
        console.groupEnd();
    }
}

// Export commonly used functions for convenience
export const estimateTokens = TokenManager.estimate.bind(TokenManager);
export const truncateToTokenLimit = TokenManager.truncateToLimit.bind(TokenManager);
export const validateTokenLimit = TokenManager.validateLimit.bind(TokenManager);

// Type exports for other modules
export type { TokenEstimationConfig, TokenAllocation, TokenUsageStats };