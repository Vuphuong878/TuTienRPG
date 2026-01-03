

import type { GoogleGenAI } from "@google/genai";

export type EntityType = 'pc' | 'npc' | 'location' | 'faction' | 'item' | 'skill' | 'status_effect' | 'companion' | 'concept';

export interface Entity {
  name: string;
  type: EntityType;
  description: string;
  gender?: string;
  age?: string;
  appearance?: string;
  fame?: string; // New: For reputation
  personality?: string;
  personalityMbti?: string;
  motivation?: string;
  location?: string;
  relationship?: string; // For relationship tracking
  uses?: number; // For consumable items (legacy)
  quantities?: number; // For usable items (new)
  realm?: string; // For character power levels
  mastery?: string; // For skill mastery levels
  currentExp?: number; // For current experience points
  durability?: number;
  usable?: boolean;
  equippable?: boolean;
  equipped?: boolean; // New: For tracking equipped status
  consumable?: boolean;
  learnable?: boolean; // For 'công pháp' items
  owner?: string; // 'pc' or npc name for items
  skills?: string[]; // For NPCs
  learnedSkills?: string[]; // For PC
  state?: 'dead' | 'broken' | 'destroyed';
  pinned?: boolean;             // Đánh dấu entity quan trọng, sẽ được đưa vào context prompt
  archived?: boolean;           // Đánh dấu entity đã được archive
  archivedAt?: number;         // Turn number khi archive
  lastMentioned?: number;      // Turn cuối cùng được nhắc đến
  referenceId?: string;        // Unique identifier for exports and cross-referencing
}

export interface KnownEntities {
    [name: string]: Entity;
}

export enum RuleLogic {
  AND_ANY = 0,    // Any primary keyword OR any secondary keyword
  NOT_ALL = 1,    // Not all keywords must be present
  NOT_ANY = 2,    // None of the keywords should be present
  AND_ALL = 3     // All primary keywords AND all secondary keywords
}

export interface CustomRule {
  id: string;
  content: string;
  isActive: boolean;
  
  // Enhanced activation system
  title?: string;                    // Rule display name
  keywords?: string[];               // Primary activation keywords
  secondaryKeywords?: string[];      // Secondary keywords for logic
  logic?: RuleLogic;                // How keywords are evaluated
  order?: number;                   // Priority (higher = more important)
  
  // Activation conditions
  alwaysActive?: boolean;           // Always include in prompt (ignores keywords)
  caseSensitive?: boolean;          // Case sensitive keyword matching
  matchWholeWords?: boolean;        // Match whole words only
  probability?: number;             // Activation chance (0-100)
  maxActivationsPerTurn?: number;   // Limit activations per turn
  
  // Scanning settings
  scanDepth?: number;               // How many messages back to scan
  scanPlayerInput?: boolean;        // Scan user commands
  scanAIOutput?: boolean;          // Scan AI responses
  scanMemories?: boolean;          // Scan memory content
  
  // Token management
  tokenWeight?: number;            // Estimated token cost
  tokenPriority?: number;          // Priority for token budget selection
  
  // Metadata
  createdAt?: number;              // Creation timestamp
  lastActivated?: number;          // Last activation turn
  activationCount?: number;        // Total activation count
  category?: string;               // Rule category for organization
}

export interface RealmTier {
  id: string;
  name: string;
  requiredExp: number;
}

export interface FormData {
    storyName: string; // Changed from 'genre' 
    genre: string; // New field for story genre
    worldDetail: string;
    worldTime: { day: number; month: number; year: number }; // New field for world start time
    startLocation: string; // New field for start location
    customStartLocation: string; // New field for custom start location when "Tuỳ chọn" is selected
    expName: string; // New field for realm system - experience unit name
    realmTiers: RealmTier[]; // New field for realm system tiers
    writingStyle: string;
    difficulty: string;
    allowNsfw: boolean;
    characterName: string;
    characterAge: string;
    characterAppearance: string;
    customPersonality: string;
    personalityFromList: string;
    gender: string;
    bio: string;
    startSkills: { name: string; description: string; mastery: string }[];
    addGoal: string;
    customRules: CustomRule[];
}

export interface Status {
    name:string;
    description: string;
    type: 'buff' | 'debuff' | 'neutral' | 'injury';
    source: string;
    duration?: string; // e.g., '3 turns', 'permanent'
    effects?: string;
    cureConditions?: string;
    owner: string; // 'pc' or an NPC's name
}

export interface Memory {
    text: string;
    pinned: boolean;
    createdAt?: number;           // Turn number when created
    lastAccessed?: number;        // Turn number when last referenced
    source?: 'chronicle' | 'manual' | 'auto_generated';
    category?: 'combat' | 'social' | 'discovery' | 'story' | 'relationship' | 'general';
    importance?: number;          // 0-100 dynamic score
    relatedEntities?: string[];   // Connected entity names
    tags?: string[];             // User or AI generated tags
    emotionalWeight?: number;    // Story significance (-10 to 10)
}

export interface QuestObjective {
    description: string;
    completed: boolean;
}

export interface Quest {
    title: string;
    description: string;
    objectives: QuestObjective[];
    giver?: string;
    reward?: string;
    isMainQuest: boolean;
    status: 'active' | 'completed' | 'failed';
}

export interface GameHistoryEntry {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface Chronicle {
    memoir: string[];
    chapter: string[];
    turn: string[];
}

export interface ChangeItem {
  type: 'feature' | 'fix' | 'improvement';
  text: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: ChangeItem[];
}
export interface CompressedHistorySegment {
    turnRange: string;
    summary: string;
    keyActions: string[];
    importantEvents: string[];
    tokenCount: number;
    compressedAt: number;
}
// --- Save Game Data Structure ---
export interface SaveData {
    worldData: Omit<FormData, 'customRules'>;
    knownEntities: KnownEntities;
    statuses: Status[];
    quests: Quest[];
    gameHistory: GameHistoryEntry[];
    memories: Memory[];
    party: Entity[];
    customRules: CustomRule[];
    systemInstruction: string;
    turnCount: number;
    totalTokens?: number;
    gameTime: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
    };
    chronicle: Chronicle;
    
    // Explicit state saving
    storyLog?: string[];
    choices?: string[];
    locationDiscoveryOrder?: string[];

    // Thêm fields mới cho sliding window
    compressedHistory?: CompressedHistorySegment[];
    lastCompressionTurn?: number;
    historyStats?: {
        totalEntriesProcessed: number;
        totalTokensSaved: number;
        compressionCount: number;
        lastCompressionTurn?: number;
    };
    cleanupStats?: {
        totalCleanupsPerformed: number;
        totalTokensSavedFromCleanup: number;
        lastCleanupTurn: number;
        cleanupHistory: Array<{
            turn: number;
            tokensSaved: number;
            itemsRemoved: number;
        }>;
    };
    
    // Unified Memory Management
    archivedMemories?: Memory[];
    memoryStats?: {
        totalMemoriesArchived: number;
        totalMemoriesEnhanced: number;
        averageImportanceScore: number;
        lastMemoryCleanupTurn: number;
    };
    
    // Choice History for Intelligent Generation
    choiceHistory?: Array<{
        turn: number;
        choices: string[];
        selectedChoice?: string;
        context?: string; // Brief context when choices were presented
    }>;
    
    // Regex System
    regexRules?: RegexRule[];
    regexSettings?: {
        enabled: boolean;
        processingOrder: string[]; // Array of rule IDs in execution order
        defaultPlacement: RegexPlacement[];
    };
}

export interface AIContextType {
    ai: GoogleGenAI | null;
    isAiReady: boolean;
    apiKeyError: string | null;
    isUsingDefaultKey: boolean;
    userApiKeyCount: number;
    rotateKey: () => void;
    selectedModel: string;
}

// --- Regex System Types ---
export enum RegexPlacement {
    PLAYER_INPUT = 1,      // Process player commands before parsing
    AI_OUTPUT = 2,         // Format AI responses
    MEMORY_PROCESSING = 3, // Process memories before storage
    ENTITY_DETECTION = 4,  // Extract entities from text
    QUEST_PROCESSING = 5,  // Process quest-related text
    DIALOGUE_FORMATTING = 6, // Format dialogue and conversations
    STAT_EXTRACTION = 7,   // Extract stat changes and numbers
    COMBAT_FORMATTING = 8  // Format combat descriptions
}

export enum RegexSubstituteMode {
    NONE = 0,    // Use regex as-is
    RAW = 1,     // Substitute macros without escaping
    ESCAPED = 2  // Substitute macros with regex escaping
}

export interface RegexRule {
    id: string;
    name: string;
    findRegex: string;
    replaceString: string;
    trimStrings: string[];
    placement: RegexPlacement[];
    disabled: boolean;
    isScoped: boolean;          // Character/world specific vs global
    markdownOnly: boolean;      // Only apply to markdown rendering
    promptOnly: boolean;        // Only apply to prompt generation
    runOnEdit: boolean;         // Run when editing existing content
    substituteRegex: RegexSubstituteMode;
    minDepth?: number;          // Minimum message depth to apply
    maxDepth?: number;          // Maximum message depth to apply
    category?: string;          // User-defined category for organization
    description?: string;       // User description of what the rule does
    createdAt?: number;         // Timestamp when rule was created
    lastUsed?: number;          // Timestamp when rule was last applied
}

export interface RegexRuleTemplate {
    name: string;
    description: string;
    category: string;
    rules: Omit<RegexRule, 'id' | 'createdAt' | 'lastUsed'>[];
}
