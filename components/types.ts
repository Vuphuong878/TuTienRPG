

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
  [key: string]: any;
  archived?: boolean;           // Đánh dấu entity đã được archive
    archivedAt?: number;         // Turn number khi archive
    lastMentioned?: number;      // Turn cuối cùng được nhắc đến
    referenceId?: string;        // Unique identifier for exports and cross-referencing
}

export interface KnownEntities {
    [name: string]: Entity;
}

export interface CustomRule {
  id: string;
  content: string;
  isActive: boolean;
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