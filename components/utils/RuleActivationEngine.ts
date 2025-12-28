import { CustomRule, RuleLogic, SaveData, Entity, Memory, GameHistoryEntry } from '../types.ts';

export interface ActivationContext {
    // Chat context
    playerInput?: string;
    aiResponse?: string;
    gameHistory?: GameHistoryEntry[];
    
    // Game state
    entities?: { [name: string]: Entity };
    memories?: Memory[];
    currentTurn?: number;
    
    // Scanning options
    scanDepth?: number;
    tokenBudget?: number;
    caseSensitive?: boolean;
    matchWholeWords?: boolean;
}

export interface ActivatedRule {
    rule: CustomRule;
    activationReason: string;
    matchedKeywords: string[];
    tokenCost: number;
    priority: number;
}

export interface ActivationResult {
    activatedRules: ActivatedRule[];
    totalTokens: number;
    budgetExceeded: boolean;
    skippedRules: CustomRule[];
}

/**
 * Advanced rule activation engine inspired by SillyTavern's World Info system
 */
export class RuleActivationEngine {
    private activationHistory: Map<string, number[]> = new Map(); // ruleId -> turn numbers

    /**
     * Estimate token count for text (simplified)
     */
    private estimateTokens(text: string): number {
        if (!text) return 0;
        return Math.ceil(text.length / 4); // Rough estimation: 4 chars per token
    }

    /**
     * Escape regex special characters
     */
    private escapeRegex(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Check if keywords match in text based on rule settings
     */
    private checkKeywordMatch(
        text: string, 
        keywords: string[], 
        caseSensitive: boolean = false, 
        matchWholeWords: boolean = false
    ): { matches: boolean; matchedKeywords: string[] } {
        if (!keywords || keywords.length === 0) {
            return { matches: false, matchedKeywords: [] };
        }

        const searchText = caseSensitive ? text : text.toLowerCase();
        const matchedKeywords: string[] = [];

        for (const keyword of keywords) {
            if (!keyword.trim()) continue;

            const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
            
            if (matchWholeWords) {
                // Use word boundary regex
                const regex = new RegExp(`\\b${this.escapeRegex(searchKeyword)}\\b`, caseSensitive ? 'g' : 'gi');
                if (regex.test(searchText)) {
                    matchedKeywords.push(keyword);
                }
            } else {
                // Simple string contains
                if (searchText.includes(searchKeyword)) {
                    matchedKeywords.push(keyword);
                }
            }
        }

        return { matches: matchedKeywords.length > 0, matchedKeywords };
    }

    /**
     * Evaluate rule logic for keyword matching
     */
    private evaluateRuleLogic(
        rule: CustomRule,
        primaryMatches: string[],
        secondaryMatches: string[],
        allText: string
    ): { activated: boolean; reason: string; matchedKeywords: string[] } {
        const logic = rule.logic || RuleLogic.AND_ANY;
        const hasKeywords = rule.keywords && rule.keywords.length > 0;
        const hasSecondaryKeywords = rule.secondaryKeywords && rule.secondaryKeywords.length > 0;

        // Check if rule is always active (constant rule)
        if (rule.alwaysActive) {
            return {
                activated: true,
                reason: 'Always active (constant rule)',
                matchedKeywords: []
            };
        }

        // If no keywords defined and not always active, never activate (keyword matching required)
        if (!hasKeywords && !hasSecondaryKeywords) {
            return {
                activated: false,
                reason: 'No keywords defined - rule requires keywords to activate or alwaysActive flag',
                matchedKeywords: []
            };
        }

        const allMatched = [...primaryMatches, ...secondaryMatches];

        switch (logic) {
            case RuleLogic.AND_ANY:
                // Any primary keyword OR any secondary keyword
                if (primaryMatches.length > 0 || secondaryMatches.length > 0) {
                    return {
                        activated: true,
                        reason: `AND_ANY: Matched ${allMatched.length} keywords`,
                        matchedKeywords: allMatched
                    };
                }
                break;

            case RuleLogic.AND_ALL:
                // All primary keywords AND all secondary keywords
                const primaryRequired = rule.keywords?.length || 0;
                const secondaryRequired = rule.secondaryKeywords?.length || 0;
                
                if (primaryMatches.length === primaryRequired && 
                    secondaryMatches.length === secondaryRequired) {
                    return {
                        activated: true,
                        reason: `AND_ALL: All ${primaryRequired + secondaryRequired} keywords matched`,
                        matchedKeywords: allMatched
                    };
                }
                break;

            case RuleLogic.NOT_ALL:
                // Not all keywords must be present
                const totalRequired = (rule.keywords?.length || 0) + (rule.secondaryKeywords?.length || 0);
                if (allMatched.length < totalRequired && allMatched.length > 0) {
                    return {
                        activated: true,
                        reason: `NOT_ALL: ${allMatched.length}/${totalRequired} keywords matched`,
                        matchedKeywords: allMatched
                    };
                }
                break;

            case RuleLogic.NOT_ANY:
                // None of the keywords should be present
                if (allMatched.length === 0) {
                    return {
                        activated: true,
                        reason: 'NOT_ANY: No keywords found',
                        matchedKeywords: []
                    };
                }
                break;
        }

        return {
            activated: false,
            reason: `Logic ${RuleLogic[logic]} not satisfied`,
            matchedKeywords: allMatched
        };
    }

    /**
     * Check if rule should activate based on probability
     */
    private checkProbability(rule: CustomRule): boolean {
        if (rule.probability === undefined || rule.probability >= 100) {
            return true;
        }
        if (rule.probability <= 0) {
            return false;
        }
        return Math.random() * 100 < rule.probability;
    }

    /**
     * Check activation limits per turn
     */
    private checkActivationLimits(rule: CustomRule, currentTurn: number): boolean {
        if (!rule.maxActivationsPerTurn || rule.maxActivationsPerTurn <= 0) {
            return true;
        }

        const history = this.activationHistory.get(rule.id) || [];
        const activationsThisTurn = history.filter(turn => turn === currentTurn).length;
        
        return activationsThisTurn < rule.maxActivationsPerTurn;
    }

    /**
     * Collect text to scan based on rule settings
     */
    private collectScanText(rule: CustomRule, context: ActivationContext): string {
        let scanText = '';
        const depth = rule.scanDepth || context.scanDepth || 5;

        // Player input
        if (rule.scanPlayerInput !== false && context.playerInput) {
            scanText += context.playerInput + ' ';
        }

        // AI response
        if (rule.scanAIOutput !== false && context.aiResponse) {
            scanText += context.aiResponse + ' ';
        }

        // Game history
        if (context.gameHistory && context.gameHistory.length > 0) {
            const recentHistory = context.gameHistory.slice(-depth);
            for (const entry of recentHistory) {
                if (entry.type === 'user_action' && rule.scanPlayerInput !== false) {
                    scanText += entry.content + ' ';
                } else if (entry.type === 'ai_response' && rule.scanAIOutput !== false) {
                    scanText += entry.content + ' ';
                }
            }
        }

        // Memory content
        if (rule.scanMemories !== false && context.memories) {
            const recentMemories = context.memories
                .filter(m => !m.pinned || m.importance && m.importance > 70)
                .slice(-depth);
            
            for (const memory of recentMemories) {
                scanText += memory.text + ' ';
            }
        }

        return scanText.trim();
    }

    /**
     * Process all rules and return activated ones
     */
    processRules(rules: CustomRule[], context: ActivationContext): ActivationResult {
        console.log(`🔄 Processing ${rules.length} rules with context`);
        
        const activated: ActivatedRule[] = [];
        const skipped: CustomRule[] = [];
        let totalTokens = 0;
        const tokenBudget = context.tokenBudget || 5000; // Default 5K token budget
        const currentTurn = context.currentTurn || 0;

        // Filter active rules and sort by priority
        const activeRules = rules
            .filter(rule => rule.isActive)
            .sort((a, b) => (b.order || 0) - (a.order || 0)); // Higher order first

        console.log(`📋 ${activeRules.length} active rules to process`);

        for (const rule of activeRules) {
            try {
                // Check activation limits
                if (!this.checkActivationLimits(rule, currentTurn)) {
                    console.log(`⏭️ Rule "${rule.title || rule.id}" skipped: activation limit reached`);
                    skipped.push(rule);
                    continue;
                }

                // Check probability
                if (!this.checkProbability(rule)) {
                    console.log(`⏭️ Rule "${rule.title || rule.id}" skipped: probability check failed`);
                    skipped.push(rule);
                    continue;
                }

                // Collect text to scan
                const scanText = this.collectScanText(rule, context);
                if (!scanText) {
                    console.log(`⏭️ Rule "${rule.title || rule.id}" skipped: no text to scan`);
                    continue;
                }

                // Check keyword matches
                const primaryMatch = this.checkKeywordMatch(
                    scanText,
                    rule.keywords || [],
                    rule.caseSensitive || context.caseSensitive,
                    rule.matchWholeWords || context.matchWholeWords
                );

                const secondaryMatch = this.checkKeywordMatch(
                    scanText,
                    rule.secondaryKeywords || [],
                    rule.caseSensitive || context.caseSensitive,
                    rule.matchWholeWords || context.matchWholeWords
                );

                // Evaluate rule logic
                const logicResult = this.evaluateRuleLogic(
                    rule,
                    primaryMatch.matchedKeywords,
                    secondaryMatch.matchedKeywords,
                    scanText
                );

                if (!logicResult.activated) {
                    console.log(`⏭️ Rule "${rule.title || rule.id}" skipped: ${logicResult.reason}`);
                    continue;
                }

                // Calculate token cost
                const tokenCost = rule.tokenWeight || this.estimateTokens(rule.content);
                
                // Check token budget
                if (totalTokens + tokenCost > tokenBudget) {
                    console.log(`⏭️ Rule "${rule.title || rule.id}" skipped: would exceed token budget`);
                    skipped.push(rule);
                    continue;
                }

                // Rule activated!
                const activatedRule: ActivatedRule = {
                    rule,
                    activationReason: logicResult.reason,
                    matchedKeywords: logicResult.matchedKeywords,
                    tokenCost,
                    priority: rule.order || 0
                };

                activated.push(activatedRule);
                totalTokens += tokenCost;

                // Update activation history
                const history = this.activationHistory.get(rule.id) || [];
                history.push(currentTurn);
                this.activationHistory.set(rule.id, history);

                // Update rule metadata
                rule.lastActivated = currentTurn;
                rule.activationCount = (rule.activationCount || 0) + 1;

                console.log(`✅ Rule "${rule.title || rule.id}" activated: ${logicResult.reason}`);

            } catch (error) {
                console.error(`❌ Error processing rule "${rule.title || rule.id}":`, error);
                skipped.push(rule);
            }
        }

        // Sort activated rules by priority (higher first)
        activated.sort((a, b) => b.priority - a.priority);

        console.log(`🎯 Activation complete: ${activated.length} rules activated, ${totalTokens} tokens used`);

        return {
            activatedRules: activated,
            totalTokens,
            budgetExceeded: totalTokens > tokenBudget,
            skippedRules: skipped
        };
    }

    /**
     * Format activated rules for prompt injection
     */
    formatForPrompt(activationResult: ActivationResult): string {
        if (activationResult.activatedRules.length === 0) {
            return '';
        }

        let prompt = '\n=== LUẬT LỆ TÙY CHỈNH ĐƯỢC KÍCH HOẠT ===\n';
        
        for (const activated of activationResult.activatedRules) {
            const rule = activated.rule;
            const title = rule.title || `Luật ${rule.id}`;
            
            prompt += `\n[${title}] (Độ ưu tiên: ${rule.order || 0})`;
            if (activated.matchedKeywords.length > 0) {
                prompt += ` - Khớp từ khóa: ${activated.matchedKeywords.join(', ')}`;
            }
            prompt += `\n${rule.content}\n`;
        }

        prompt += `\n=== Tổng cộng: ${activationResult.activatedRules.length} luật, ${activationResult.totalTokens} tokens ===\n`;
        
        return prompt;
    }

    /**
     * Clear activation history (call on new game)
     */
    clearHistory(): void {
        this.activationHistory.clear();
    }

    /**
     * Get activation statistics
     */
    getStats(): { totalRules: number; activeRules: number; averageActivations: number } {
        const activeRules = Array.from(this.activationHistory.keys()).length;
        const totalActivations = Array.from(this.activationHistory.values())
            .reduce((sum, history) => sum + history.length, 0);
        
        return {
            totalRules: this.activationHistory.size,
            activeRules,
            averageActivations: activeRules > 0 ? totalActivations / activeRules : 0
        };
    }
}

// Export singleton instance
export const ruleActivationEngine = new RuleActivationEngine();