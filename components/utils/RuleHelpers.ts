import { CustomRule, RuleLogic } from '../types.ts';

/**
 * Helper functions for managing custom rules
 */
export class RuleHelpers {
    /**
     * Create a new rule with default values
     */
    static createDefaultRule(): CustomRule {
        return {
            id: Date.now().toString(),
            content: '',
            isActive: true,
            title: '',
            keywords: [],
            secondaryKeywords: [],
            logic: RuleLogic.AND_ANY,
            alwaysActive: false,
            order: 100,
            caseSensitive: false,
            matchWholeWords: false,
            probability: 100,
            maxActivationsPerTurn: undefined,
            scanDepth: 5,
            scanPlayerInput: true,
            scanAIOutput: true,
            scanMemories: true,
            tokenWeight: undefined,
            tokenPriority: 100,
            createdAt: Date.now(),
            lastActivated: undefined,
            activationCount: 0,
            category: 'general'
        };
    }

    /**
     * Estimate token weight for a rule based on content length
     */
    static estimateTokenWeight(content: string): number {
        if (!content) return 0;
        return Math.ceil(content.length / 4); // Rough estimation: 4 chars per token
    }

    /**
     * Validate rule configuration
     */
    static validateRule(rule: CustomRule): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!rule.content.trim()) {
            errors.push('Rule content cannot be empty');
        }

        if (rule.keywords && rule.keywords.some(k => !k.trim())) {
            errors.push('Keywords cannot be empty');
        }

        if (rule.secondaryKeywords && rule.secondaryKeywords.some(k => !k.trim())) {
            errors.push('Secondary keywords cannot be empty');
        }

        if (rule.probability !== undefined && (rule.probability < 0 || rule.probability > 100)) {
            errors.push('Probability must be between 0 and 100');
        }

        if (rule.alwaysActive && (rule.keywords?.length || rule.secondaryKeywords?.length)) {
            errors.push('Always active rules should not have keywords (keywords will be ignored)');
        }

        if (rule.order !== undefined && rule.order < 0) {
            errors.push('Order must be a positive number');
        }

        if (rule.maxActivationsPerTurn !== undefined && rule.maxActivationsPerTurn < 1) {
            errors.push('Max activations per turn must be at least 1');
        }

        if (rule.scanDepth !== undefined && rule.scanDepth < 1) {
            errors.push('Scan depth must be at least 1');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sort rules by priority (order field)
     */
    static sortByPriority(rules: CustomRule[]): CustomRule[] {
        return [...rules].sort((a, b) => (b.order || 0) - (a.order || 0));
    }

    /**
     * Get rule logic display name
     */
    static getLogicDisplayName(logic: RuleLogic): string {
        switch (logic) {
            case RuleLogic.AND_ANY:
                return 'ANY (Bất kỳ từ khóa nào)';
            case RuleLogic.AND_ALL:
                return 'ALL (Tất cả từ khóa)';
            case RuleLogic.NOT_ALL:
                return 'NOT ALL (Không phải tất cả)';
            case RuleLogic.NOT_ANY:
                return 'NOT ANY (Không có từ khóa nào)';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get rule category display name
     */
    static getCategoryDisplayName(category?: string): string {
        switch (category) {
            case 'combat':
                return '⚔️ Chiến đấu';
            case 'social':
                return '👥 Xã hội';
            case 'exploration':
                return '🗺️ Khám phá';
            case 'story':
                return '📖 Cốt truyện';
            case 'items':
                return '🎒 Vật phẩm';
            case 'skills':
                return '⭐ Kỹ năng';
            case 'world':
                return '🌍 Thế giới';
            case 'worldinfo':
                return '🌐 WorldInfo';
            case 'general':
            default:
                return '📋 Tổng quát';
        }
    }

    /**
     * Get available categories
     */
    static getAvailableCategories(): Array<{ value: string; label: string }> {
        return [
            { value: 'general', label: '📋 Tổng quát' },
            { value: 'combat', label: '⚔️ Chiến đấu' },
            { value: 'social', label: '👥 Xã hội' },
            { value: 'exploration', label: '🗺️ Khám phá' },
            { value: 'story', label: '📖 Cốt truyện' },
            { value: 'items', label: '🎒 Vật phẩm' },
            { value: 'skills', label: '⭐ Kỹ năng' },
            { value: 'world', label: '🌍 Thế giới' },
            { value: 'worldinfo', label: '🌐 WorldInfo' }
        ];
    }

    /**
     * Convert legacy rules to new format
     */
    static migrateLegacyRule(legacyRule: any): CustomRule {
        const newRule = this.createDefaultRule();
        
        // Preserve original properties
        newRule.id = legacyRule.id || newRule.id;
        newRule.content = legacyRule.content || '';
        newRule.isActive = legacyRule.isActive !== undefined ? legacyRule.isActive : true;
        
        // Estimate token weight if not provided
        if (newRule.content) {
            newRule.tokenWeight = this.estimateTokenWeight(newRule.content);
        }

        return newRule;
    }

    /**
     * Export rules to JSON with metadata
     */
    static exportRulesToJSON(rules: CustomRule[]): string {
        const exportData = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            rulesCount: rules.length,
            rules: rules
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import rules from JSON with validation
     */
    static importRulesFromJSON(jsonString: string): { rules: CustomRule[]; errors: string[] } {
        const errors: string[] = [];
        let rules: CustomRule[] = [];

        try {
            const data = JSON.parse(jsonString);
            
            // Handle legacy format (direct array)
            if (Array.isArray(data)) {
                rules = data.map(rule => this.migrateLegacyRule(rule));
            }
            // Handle new format (with metadata)
            else if (data.rules && Array.isArray(data.rules)) {
                rules = data.rules.map(rule => {
                    // Check if rule needs migration
                    if (!rule.keywords && !rule.title && !rule.order) {
                        return this.migrateLegacyRule(rule);
                    }
                    return rule;
                });
            }
            else {
                errors.push('Invalid file format. Expected rules array or export object.');
                return { rules: [], errors };
            }

            // Validate imported rules
            rules.forEach((rule, index) => {
                const validation = this.validateRule(rule);
                if (!validation.isValid) {
                    errors.push(`Rule ${index + 1}: ${validation.errors.join(', ')}`);
                }
            });

        } catch (error) {
            errors.push('Failed to parse JSON file: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }

        return { rules, errors };
    }
}