import { RegexRule, RegexPlacement, RegexSubstituteMode } from '../types';

// Re-export for convenience
export { RegexPlacement, RegexSubstituteMode } from '../types';

export interface RegexProcessingParams {
    characterOverride?: string;
    isMarkdown?: boolean;
    isPrompt?: boolean;
    isEdit?: boolean;
    depth?: number;
    currentTurn?: number;
}

export interface MacroContext {
    playerName?: string;
    currentLocation?: string;
    currentTime?: { day: number; month: number; year: number; hour?: number };
    lastAction?: string;
    currentHp?: number;
    currentMana?: number;
    level?: string;
    experience?: number;
    [key: string]: any;
}

/**
 * Core regex processing engine adapted from SillyTavern for RPG AI Simulator
 */
export class RegexEngine {
    private macroContext: MacroContext = {};

    /**
     * Update the macro context with current game state
     */
    updateMacroContext(context: MacroContext) {
        this.macroContext = { ...this.macroContext, ...context };
    }

    /**
     * Sanitize a string for use in regex (escape special characters)
     */
    private sanitizeRegexMacro(text: string): string {
        if (!text || typeof text !== 'string') return text;
        
        return text.replace(/[\n\r\t\v\f\0.^$*+?{}[\]\\/|()]/gs, (match) => {
            switch (match) {
                case '\n': return '\\n';
                case '\r': return '\\r';
                case '\t': return '\\t';
                case '\v': return '\\v';
                case '\f': return '\\f';
                case '\0': return '\\0';
                default: return '\\' + match;
            }
        });
    }

    /**
     * Substitute macros in regex pattern or replacement string
     */
    private substituteMacros(text: string, shouldEscape: boolean = false): string {
        let result = text;

        // Define macro substitutions
        const macros: Record<string, string> = {
            '{{player}}': this.macroContext.playerName || 'Player',
            '{{character}}': this.macroContext.playerName || 'Player',
            '{{location}}': this.macroContext.currentLocation || 'Unknown Location',
            '{{time}}': this.formatTime(),
            '{{hp}}': String(this.macroContext.currentHp || 0),
            '{{mana}}': String(this.macroContext.currentMana || 0),
            '{{level}}': this.macroContext.level || '1',
            '{{exp}}': String(this.macroContext.experience || 0),
            '{{action}}': this.macroContext.lastAction || ''
        };

        // Replace macros
        for (const [macro, value] of Object.entries(macros)) {
            const processedValue = shouldEscape ? this.sanitizeRegexMacro(value) : value;
            result = result.replace(new RegExp(macro.replace(/[{}]/g, '\\$&'), 'gi'), processedValue);
        }

        return result;
    }

    /**
     * Format time for macro substitution
     */
    private formatTime(): string {
        const time = this.macroContext.currentTime;
        if (!time) return 'Unknown Time';
        
        const hour = time.hour !== undefined ? `:${time.hour}` : '';
        return `${time.day}/${time.month}/${time.year}${hour}`;
    }

    /**
     * Create a regex object from a string pattern
     */
    private createRegexFromString(pattern: string): RegExp | null {
        try {
            // Handle patterns with flags like /pattern/flags
            const match = pattern.match(/^\/(.+)\/([gimuy]*)$/);
            if (match) {
                return new RegExp(match[1], match[2]);
            }
            // Default to global flag if no flags specified
            return new RegExp(pattern, 'g');
        } catch (error) {
            console.warn('Invalid regex pattern:', pattern, error);
            return null;
        }
    }

    /**
     * Filter trim strings from matched text
     */
    private filterTrimStrings(text: string, trimStrings: string[]): string {
        let result = text;
        
        for (const trimString of trimStrings) {
            if (trimString) {
                const processedTrimString = this.substituteMacros(trimString);
                result = result.replace(new RegExp(processedTrimString, 'g'), '');
            }
        }
        
        return result;
    }

    /**
     * Run a single regex rule on input text
     */
    runRegexRule(rule: RegexRule, inputText: string, params: RegexProcessingParams = {}): string {
        // Skip if rule is disabled or empty
        if (!rule || rule.disabled || !rule.findRegex || !inputText) {
            return inputText;
        }

        // Check depth constraints
        if (typeof params.depth === 'number') {
            if (rule.minDepth !== undefined && params.depth < rule.minDepth) {
                return inputText;
            }
            if (rule.maxDepth !== undefined && params.depth > rule.maxDepth) {
                return inputText;
            }
        }

        // Check processing conditions
        if (params.isEdit && !rule.runOnEdit) {
            return inputText;
        }

        // Check markdown/prompt conditions
        const shouldProcess = 
            (rule.markdownOnly && params.isMarkdown) ||
            (rule.promptOnly && params.isPrompt) ||
            (!rule.markdownOnly && !rule.promptOnly && !params.isMarkdown && !params.isPrompt);

        if (!shouldProcess) {
            return inputText;
        }

        try {
            // Process the find regex based on substitution mode
            let processedPattern = rule.findRegex;
            switch (rule.substituteRegex) {
                case RegexSubstituteMode.RAW:
                    processedPattern = this.substituteMacros(processedPattern, false);
                    break;
                case RegexSubstituteMode.ESCAPED:
                    processedPattern = this.substituteMacros(processedPattern, true);
                    break;
                case RegexSubstituteMode.NONE:
                default:
                    // Use pattern as-is
                    break;
            }

            const regex = this.createRegexFromString(processedPattern);
            if (!regex) {
                console.warn(`Invalid regex in rule "${rule.name}":`, processedPattern);
                return inputText;
            }

            // Update last used timestamp
            rule.lastUsed = Date.now();

            // Perform replacement
            const result = inputText.replace(regex, (...args) => {
                const match = args[0];
                const groups = args.slice(1, -2); // Capture groups
                
                // Process replacement string
                let replacement = rule.replaceString;
                
                // Handle {{match}} macro
                replacement = replacement.replace(/\{\{match\}\}/gi, match);
                
                // Handle capture groups ($1, $2, etc.)
                replacement = replacement.replace(/\$(\d+)/g, (_, groupNum) => {
                    const groupIndex = parseInt(groupNum);
                    if (groupIndex === 0) return match; // $0 is full match
                    
                    const groupValue = groups[groupIndex - 1];
                    if (groupValue === undefined) return '';
                    
                    // Apply trim strings to captured groups
                    return this.filterTrimStrings(groupValue, rule.trimStrings);
                });

                // Substitute macros in final replacement
                replacement = this.substituteMacros(replacement);
                
                return replacement;
            });

            return result;
        } catch (error) {
            console.error(`Error executing regex rule "${rule.name}":`, error);
            return inputText;
        }
    }

    /**
     * Process text through multiple regex rules for a specific placement
     */
    processText(
        text: string, 
        placement: RegexPlacement, 
        rules: RegexRule[], 
        params: RegexProcessingParams = {}
    ): string {
        if (!text || !rules || rules.length === 0) {
            return text;
        }

        let result = text;
        
        // Filter rules that apply to this placement and are enabled
        const applicableRules = rules.filter(rule => 
            !rule.disabled && 
            rule.placement.includes(placement)
        );

        // Sort rules by creation time to ensure consistent execution order
        applicableRules.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        // Apply each rule sequentially
        for (const rule of applicableRules) {
            result = this.runRegexRule(rule, result, params);
        }

        return result;
    }

    /**
     * Get all available placement types with descriptions
     */
    static getPlacementDescriptions(): Record<RegexPlacement, string> {
        return {
            [RegexPlacement.PLAYER_INPUT]: 'Player Commands - Process user input before parsing',
            [RegexPlacement.AI_OUTPUT]: 'AI Responses - Format AI-generated text',
            [RegexPlacement.MEMORY_PROCESSING]: 'Memory Storage - Process memories before saving',
            [RegexPlacement.ENTITY_DETECTION]: 'Entity Extraction - Extract entities from text',
            [RegexPlacement.QUEST_PROCESSING]: 'Quest Updates - Process quest-related content',
            [RegexPlacement.DIALOGUE_FORMATTING]: 'Dialogue - Format conversations and speech',
            [RegexPlacement.STAT_EXTRACTION]: 'Statistics - Extract numbers and stat changes',
            [RegexPlacement.COMBAT_FORMATTING]: 'Combat - Format battle descriptions'
        };
    }

    /**
     * Validate a regex pattern without executing it
     */
    static validateRegexPattern(pattern: string): { isValid: boolean; error?: string } {
        try {
            new RegExp(pattern);
            return { isValid: true };
        } catch (error) {
            return { 
                isValid: false, 
                error: error instanceof Error ? error.message : 'Invalid regex pattern'
            };
        }
    }
}

// Export singleton instance
export const regexEngine = new RegexEngine();