import { RegexRule, RegexPlacement, RegexSubstituteMode, RegexRuleTemplate } from '../types';

/**
 * Default regex rule templates for common RPG text processing tasks
 */
export const DEFAULT_REGEX_TEMPLATES: RegexRuleTemplate[] = [
    {
        name: "Combat & Action Formatting",
        description: "Format combat descriptions and action text",
        category: "Combat",
        rules: [
            {
                name: "Bold Actions",
                findRegex: "/\\*([^*]+)\\*/g",
                replaceString: "**$1**",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Combat",
                description: "Convert *action* to **action** for bold formatting",
                createdAt: Date.now()
            },
            {
                name: "Damage Numbers",
                findRegex: "/\\b(\\d+)\\s*(damage|hp|health|points?)\\b/gi",
                replaceString: "**$1** $2",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT, RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Combat",
                description: "Highlight damage numbers in combat descriptions",
                createdAt: Date.now()
            },
            {
                name: "Critical Hits",
                findRegex: "/\\b(critical|crit|devastating|massive)\\s+(hit|strike|blow|attack)\\b/gi",
                replaceString: "***$1 $2***",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Combat",
                description: "Emphasize critical hits with triple asterisks",
                createdAt: Date.now()
            }
        ]
    },
    {
        name: "Dialogue & Speech",
        description: "Format dialogue and character speech",
        category: "Dialogue",
        rules: [
            {
                name: "Quote Formatting",
                findRegex: "/\"([^\"]+)\"/g",
                replaceString: "\"*$1*\"",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Dialogue",
                description: "Italicize text within quotes for dialogue emphasis",
                createdAt: Date.now()
            },
            {
                name: "Thoughts",
                findRegex: "/\\(([^)]+)\\)/g",
                replaceString: "(*$1*)",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Dialogue",
                description: "Italicize thoughts in parentheses",
                createdAt: Date.now()
            },
            {
                name: "Character Names",
                findRegex: "/^([A-Z][a-zA-Z]+):/gm",
                replaceString: "**$1:**",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Dialogue",
                description: "Bold character names in dialogue",
                createdAt: Date.now()
            }
        ]
    },
    {
        name: "Stats & Experience",
        description: "Format statistics and experience gains",
        category: "Stats",
        rules: [
            {
                name: "Level Up",
                findRegex: "/\\b(level\\s+up|leveled\\s+up|reached\\s+level)\\s*(\\d+)?/gi",
                replaceString: "🎉 **$1** $2",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT, RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Stats",
                description: "Highlight level up notifications with emoji and bold",
                createdAt: Date.now()
            },
            {
                name: "Experience Gained",
                findRegex: "/\\b(gained|earned|received)\\s+(\\d+)\\s+(exp|experience|xp)\\b/gi",
                replaceString: "✨ $1 **$2** $3",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Stats",
                description: "Highlight experience gains with sparkle emoji",
                createdAt: Date.now()
            },
            {
                name: "Stat Changes",
                findRegex: "/\\b(strength|dexterity|intelligence|wisdom|constitution|charisma|agility|stamina)\\s*(increased|decreased|improved|reduced)\\s*(?:by\\s*)?(\\d+)?/gi",
                replaceString: "📊 **$1** $2 $3",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT, RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Stats",
                description: "Highlight stat changes with chart emoji",
                createdAt: Date.now()
            }
        ]
    },
    {
        name: "Items & Loot",
        description: "Format item discoveries and loot",
        category: "Items",
        rules: [
            {
                name: "Item Found",
                findRegex: "/\\b(found|discovered|obtained|acquired|received)\\s+(?:a\\s+|an\\s+|the\\s+)?([^.!?]+?)\\s*[.!]?$/gim",
                replaceString: "💰 $1 **$2**",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Items",
                description: "Highlight item discoveries with money bag emoji",
                createdAt: Date.now()
            },
            {
                name: "Rare Items",
                findRegex: "/\\b(legendary|epic|rare|magical|enchanted|mystical)\\s+([^.!?]+?)\\b/gi",
                replaceString: "✨ **$1 $2** ✨",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT, RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Items",
                description: "Emphasize rare/magical items with sparkles",
                createdAt: Date.now()
            },
            {
                name: "Gold/Currency",
                findRegex: "/\\b(\\d+)\\s*(gold|coins?|silver|copper|money|currency)\\b/gi",
                replaceString: "💰**$1** $2",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Items",
                description: "Highlight currency amounts",
                createdAt: Date.now()
            }
        ]
    },
    {
        name: "Location & Environment",
        description: "Format location descriptions and environmental text",
        category: "Environment",
        rules: [
            {
                name: "Location Names",
                findRegex: "/\\b(entered|arrived at|reached|found)\\s+(?:the\\s+)?([A-Z][a-zA-Z\\s]+?)(?:\\s*[.!]|$)/g",
                replaceString: "$1 **$2**",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT, RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Environment",
                description: "Bold location names when entered or discovered",
                createdAt: Date.now()
            },
            {
                name: "Weather & Atmosphere",
                findRegex: "/\\b(stormy|sunny|rainy|foggy|misty|windy|snowy|cloudy|clear)\\s+(weather|sky|atmosphere|air)/gi",
                replaceString: "🌤️ *$1 $2*",
                trimStrings: [],
                placement: [RegexPlacement.AI_OUTPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Environment",
                description: "Add weather emoji to atmospheric descriptions",
                createdAt: Date.now()
            }
        ]
    },
    {
        name: "Player Input Cleanup",
        description: "Clean and format player input commands",
        category: "Input Processing",
        rules: [
            {
                name: "Remove Extra Spaces",
                findRegex: "/\\s+/g",
                replaceString: " ",
                trimStrings: [],
                placement: [RegexPlacement.PLAYER_INPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Input Processing",
                description: "Remove multiple spaces from player input",
                createdAt: Date.now()
            },
            {
                name: "Capitalize First Letter",
                findRegex: "/^([a-z])/",
                replaceString: "$1",
                trimStrings: [],
                placement: [RegexPlacement.PLAYER_INPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Input Processing",
                description: "Capitalize first letter of player input",
                createdAt: Date.now()
            },
            {
                name: "Action Shorthand",
                findRegex: "/^(atk|att)\\s+(.+)/i",
                replaceString: "Attack $2",
                trimStrings: [],
                placement: [RegexPlacement.PLAYER_INPUT],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Input Processing",
                description: "Convert 'atk' shorthand to 'Attack'",
                createdAt: Date.now()
            }
        ]
    },
    {
        name: "Memory Enhancement",
        description: "Enhance and categorize memory entries",
        category: "Memory",
        rules: [
            {
                name: "Combat Memory Tags",
                findRegex: "/\\b(fought|defeated|killed|slain|battle|combat|attack)\\b/gi",
                replaceString: "[COMBAT] $1",
                trimStrings: [],
                placement: [RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Memory",
                description: "Tag combat-related memories",
                createdAt: Date.now()
            },
            {
                name: "Social Memory Tags",
                findRegex: "/\\b(met|spoke|talked|conversation|dialogue|said)\\b/gi",
                replaceString: "[SOCIAL] $1",
                trimStrings: [],
                placement: [RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Memory",
                description: "Tag social interaction memories",
                createdAt: Date.now()
            },
            {
                name: "Discovery Memory Tags",
                findRegex: "/\\b(found|discovered|explored|learned|revealed)\\b/gi",
                replaceString: "[DISCOVERY] $1",
                trimStrings: [],
                placement: [RegexPlacement.MEMORY_PROCESSING],
                disabled: false,
                isScoped: false,
                markdownOnly: false,
                promptOnly: false,
                runOnEdit: true,
                substituteRegex: RegexSubstituteMode.NONE,
                category: "Memory",
                description: "Tag discovery and exploration memories",
                createdAt: Date.now()
            }
        ]
    }
];

/**
 * Generate unique IDs for template rules
 */
export const generateTemplateRules = (templates: RegexRuleTemplate[]): RegexRule[] => {
    const rules: RegexRule[] = [];
    
    templates.forEach(template => {
        template.rules.forEach(rule => {
            rules.push({
                ...rule,
                id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: Date.now()
            });
        });
    });
    
    return rules;
};

/**
 * Get rules by category
 */
export const getRulesByCategory = (category: string): RegexRule[] => {
    return generateTemplateRules(
        DEFAULT_REGEX_TEMPLATES.filter(template => 
            template.category.toLowerCase() === category.toLowerCase()
        )
    );
};

/**
 * Get all available categories
 */
export const getAvailableCategories = (): string[] => {
    return [...new Set(DEFAULT_REGEX_TEMPLATES.map(template => template.category))];
};