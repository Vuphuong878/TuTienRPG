// Enums
export enum GameScreen {
    MENU = 'MENU',
    WORLD_DESIGNER = 'WORLD_DESIGNER',
    CREATOR = 'CREATOR',
    WORLD = 'WORLD',
    COMBAT = 'COMBAT',
    FORGE = 'FORGE',
    IMAGE_LIBRARY = 'IMAGE_LIBRARY',
    SETTINGS = 'SETTINGS',
    SAVE_MANAGEMENT = 'SAVE_MANAGEMENT',
    DIALOGUE = 'DIALOGUE',
    DUNGEON = 'DUNGEON',
}

export enum Rarity {
    COMMON = 'Common',
    UNCOMMON = 'Uncommon',
    RARE = 'Rare',
    EPIC = 'Epic',
    LEGENDARY = 'Legendary',
}

export enum EquipmentSlot {
    VũKhí = 'Vũ Khí',
    Áo = 'Áo',
    Nón = 'Nón',
    Quần = 'Quần',
    Giày = 'Giày',
    PhụKiện = 'Phụ Kiện',
}

export enum ItemType {
    VũKhí = 'Vũ Khí',
    Áo = 'Áo',
    Nón = 'Nón',
    Quần = 'Quần',
    Giày = 'Giày',
    PhụKiện = 'Phụ Kiện',
    CULTIVATION_MANUAL = 'Công Pháp',
    SKILL_BOOK = 'Sách Kỹ Năng',
}

export enum Stat {
    STR = 'STR',
    AGI = 'AGI',
    INT = 'INT',
    SPI = 'SPI',
    CON = 'CON',
    DEX = 'DEX',
    // Derived stats sometimes used as keys
    HP = 'HP',
    MP = 'MP',
    ATK = 'ATK',
    MATK = 'MATK',
    DEF = 'DEF',
    Speed = 'Speed',
    PENETRATION = 'PENETRATION',
    EVASION = 'EVASION',
    CRIT_RATE = 'CRIT_RATE',
    ACCURACY = 'ACCURACY',
    LIFESTEAL = 'LIFESTEAL',
}

export enum SkillEffectType {
    DAMAGE = 'DAMAGE',
    HEAL = 'HEAL',
    BUFF = 'BUFF',
    DEBUFF = 'DEBUFF',
    DOT = 'DOT',
    HOT = 'HOT',
    STUN = 'STUN',
    DISABLE_SKILL = 'DISABLE_SKILL',
    SUMMON = 'SUMMON',
}

export enum TargetType {
    SELF = 'SELF',
    ENEMY = 'ENEMY',
    ALLY = 'ALLY',
    ALL_ENEMIES = 'ALL_ENEMIES',
    ALL_ALLIES = 'ALL_ALLIES',
}

export enum Element {
    KIM = 'Kim',
    MOC = 'Mộc',
    THUY = 'Thủy',
    HOA = 'Hỏa',
    THO = 'Thổ',
    VO = 'Vô', // Neutral/Void
}

export enum FactionType {
    CHINH_PHAI = 'Chính Phái',
    MA_DAO = 'Ma Đạo',
    TRUNG_LAP = 'Trung Lập',
}

export enum LogType {
    SYSTEM = 'SYSTEM',
    NARRATIVE = 'NARRATIVE',
    LOOT = 'LOOT',
    QUEST = 'QUEST',
    COMBAT = 'COMBAT',
    CRAFTING = 'CRAFTING',
    ERROR = 'ERROR',
    ADVICE = 'ADVICE',
}

export enum QuestStatus {
    AVAILABLE = 'AVAILABLE',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    TURNED_IN = 'TURNED_IN',
}

export enum QuestType {
    MAIN = 'MAIN',
    SIDE = 'SIDE',
    SECT_MISSION = 'SECT_MISSION',
    GATHER = 'GATHER',
    HUNT = 'HUNT',
}

export enum TerrainType {
    PLAIN = 'Đồng Bằng',
    FOREST = 'Rừng Rậm',
    MOUNTAIN = 'Núi non',
    VILLAGE = 'Làng Mạc',
    WATER = 'Sông Nước',
    VOLCANO = 'Núi Lửa',
}

export enum Difficulty {
    EASY = 'Dễ',
    NORMAL = 'Thường',
    HARD = 'Khó',
    NIGHTMARE = 'Ác Mộng',
}

export enum PlayerClass {
    THE_TU = 'Thể Tu',
    PHAP_TU = 'Pháp Tu',
    KIEM_TU = 'Kiếm Tu',
}

export enum SkillType {
    ACTIVE = 'Chủ động',
    PASSIVE = 'Bị động',
}

export enum UpgradeMaterial {
    TINH_THACH_HA_PHAM = 'Tinh Thạch Hạ Phẩm',
    TINH_THACH_TRUNG_PHAM = 'Tinh Thạch Trung Phẩm',
    TINH_THACH_CAO_PHAM = 'Tinh Thạch Cao Phẩm',
    LINH_HON_THACH = 'Linh Hồn Thạch',
}

export enum ServantTask {
    IDLE = 'Nghỉ ngơi',
    FORAGING = 'Hái lượm',
    MINING = 'Khai khoáng',
    DEFENDING = 'Hộ pháp',
}

export enum MonsterRank {
    Thường = 'Thường',
    TinhAnh = 'Tinh Anh',
    ThủLĩnh = 'Thủ Lĩnh',
}

export enum UpgradeConsumable {
    LINH_THU_THUC = 'Linh Thú Thực',
    HON_AN_PHU = 'Hồn Ấn Phù',
    LINH_THU_PHU = 'Linh Thú Phù',
}

export enum PetStatus {
    IDLE = 'Nghỉ ngơi',
    FOLLOWING = 'Đi theo',
    IN_COMBAT = 'Chiến đấu',
}

export enum CultivationTechniqueType {
    ATTACK = 'Công Kích',
    DEFENSE = 'Phòng Ngự',
    MOVEMENT = 'Thân Pháp',
    UTILITY = 'Phụ Trợ',
}

export enum DungeonFloorType {
    COMBAT = 'Chiến đấu',
    ELITE_COMBAT = 'Tinh Anh',
    BOSS = 'Trùm',
    TREASURE = 'Kho Báu',
    EMPTY = 'Trống',
}

export enum ColorTheme {
    DEFAULT = 'default',
    DEUTERANOPIA = 'deuteranopia',
    TRITANOPIA = 'tritanopia',
    HIGH_CONTRAST = 'high-contrast',
    SEPIA = 'sepia',
    DARK_PURPLE = 'dark-purple',
}

// Interfaces and Types
export interface BaseStats {
    [Stat.STR]: number;
    [Stat.AGI]: number;
    [Stat.INT]: number;
    [Stat.SPI]: number;
    [Stat.CON]: number;
    [Stat.DEX]: number;
}

export interface DerivedStats extends BaseStats {
    HP: number;
    MP: number;
    ATK: number;
    MATK: number;
    DEF: number;
    Speed: number;
    PENETRATION: number;
    EVASION: number;
    CRIT_RATE: number;
    ACCURACY: number;
    LIFESTEAL: number;
}

export interface SkillEffect {
    type: SkillEffectType;
    target: TargetType;
    powerMultiplier?: number;
    duration?: number;
    description: string;
    summonCount?: number;
    summonMonsterName?: string;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    type: SkillType;
    levelRequired: number;
    class: string;
    mpCost: number;
    effects: SkillEffect[];
    useMagicAttack?: boolean;
    element?: Element;
    realmRequired?: string;
}

export interface ActiveEffect {
    id: string;
    effect: SkillEffect;
    remainingTurns: number;
    sourceSkillName: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: Rarity;
    level: number;
    slot?: EquipmentSlot;
    baseStats: Partial<BaseStats>;
    bonusStats: Partial<DerivedStats>;
    upgradeLevel: number;
    maxUpgrade: number;
    element?: Element;
    setName?: string;
    setBonuses?: SetBonus[];
    cultivationTechniqueDetails?: CultivationTechnique;
    skillDetails?: Skill;
    affix?: { name: string; description: string; };
    soulEffect?: { name: string; description: string; };
}

export type Equipment = {
    [key in EquipmentSlot]?: Item;
};

export interface SetBonus {
    pieces: number;
    description: string;
    stats: Partial<DerivedStats>;
}

export interface Pet {
    id: string;
    name: string;
    monsterClass: string;
    level: number;
    exp: number;
    expToNextLevel: number;
    baseStats: BaseStats;
    derivedStats: DerivedStats;
    skills: Skill[];
    loyalty: number;
    loyaltyDescription: string;
    oneWordStatus: string;
    imageUrl?: string;
    isEvolved: boolean;
    activeEffects: ActiveEffect[];
    currentHp: number;
    status: PetStatus;
}

export interface Character {
    id: string;
    name: string;
    playerClass: string;
    level: number;
    exp: number;
    expToNextLevel: number;
    realm: { name: string, level: number };
    baseStats: BaseStats;
    derivedStats: DerivedStats;
    currentHp: number;
    currentMp: number;
    backstory: string;
    equipment: Equipment;
    inventory: Item[];
    skills: Skill[];
    activeEffects: ActiveEffect[];
    position: { x: number, y: number };
    isHumanoid: boolean;
    isBoss: boolean;
    pets: Pet[];
    retainers: Retainer[];
    servants: Servant[];
    metNpcs: MetNpcInfo[];
    quests: Quest[];
    reputation: { [factionId: number]: number };
    materials: { [key in UpgradeMaterial]?: number };
    consumables: { [key in UpgradeConsumable]?: number };
    activePetId?: string | null;
    activeRetainerId?: string | null;
    linhCan?: {
        elements: Element[];
        quality: string;
        description: string;
    };
    unallocatedStatPoints?: number;
    classDefinition?: BaseStats;
    currentDungeonId?: number;
    sectId?: number;
    sectRank?: string;
    sectContributionPoints: number;
    learnedCultivationTechniques: CultivationTechnique[];
    activeCultivationTechniqueId?: string;
    rank?: MonsterRank;
    imageUrl?: string;
    // Boss specific properties
    bossInfo?: {
        phases: BossPhase[];
    };
    currentPhaseIndex?: number;
}

// Retainers are essentially simpler Characters managed by the player
export interface Retainer extends Omit<Character, 'pets' | 'retainers' | 'servants' | 'quests' | 'metNpcs' | 'reputation' | 'materials' | 'consumables' | 'activePetId' | 'activeRetainerId' | 'currentDungeonId' | 'sectId' | 'sectRank' | 'sectContributionPoints'> {
    loyalty: number;
    potential: number; // Multiplier for stat growth (e.g. 1.0, 1.2, 1.5)
    specialization: PlayerClass;
    masterId: string;
}

export interface Servant extends Omit<Character, 'pets' | 'retainers' | 'servants'> {
    task: ServantTask;
    characterClass: string;
}

export type Combatant = Character | Pet | Retainer;

export interface AttackResult {
    damage: number;
    messages: string[];
    appliedEffects: ActiveEffect[];
    lifestealAmount: number;
    elementalEffect: 'strong' | 'weak' | 'proficient' | null;
    isCritical?: boolean;
}

export interface Faction {
    id: number;
    name: string;
    description: string;
    type: FactionType;
    isJoinable: boolean;
    store: SectStoreItem[];
}

export interface DesignedWorld {
    worldName: string;
    worldLore: string;
    mainConflict: string;
    majorFactions: Omit<Faction, 'id' | 'store'>[];
    uniqueRaces: { name: string; description: string; }[];
    magicSystem: string;
}

export interface ImageLibraryItem {
    id: string;
    url: string;
    description: string;
    tags: string[];
    isMonster: boolean;
}

export interface QuestTarget {
    targetId?: string; // e.g. monster name
    targetName: string;
    count: number;
    current: number;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    status: QuestStatus;
    target: QuestTarget;
    rewards: {
        exp: number;
        items?: Item[];
        reputationChange?: { factionId: number, amount: number }[];
        contributionPoints?: number;
    };
    giverPoiId?: number;
    giverNpcName?: string;
}

export interface StoryInfo {
    title: string;
    author: string;
}

export interface WorldSummary {
    prompt: string;
    keywords: string[];
}

export interface AppSettings {
    difficulty: Difficulty;
    eventFrequency: number;
    autoDismantleRarities: { [key in Rarity]: boolean };
    colorTheme: ColorTheme;
    reduceMotion: boolean;
    displaySettings: DisplaySettings;
    proactiveNarrationFrequency: number;
}

export interface DisplaySettings {
    aiNarrative: { font: string, size: string, textColor: string };
    playerDialogue: { font: string, size: string, textColor: string, bgColor?: string };
    npcDialogue: { font: string, size: string, textColor: string, bgColor?: string };
    characterName: { font: string, size: string, textColor: string };
}

export interface SaveFile {
    character: Character;
    worldState: WorldState;
    saveDate: string;
}

export interface SaveSlot {
    slotId: number;
    characterName: string;
    level: number;
    realm: string;
    saveDate: string;
}

export interface BossPhase {
    name: string;
    hpThreshold: number;
    statMultiplier: number;
    skills: string[];
    description: string;
    isImmuneWhileMinionsExist: boolean;
}

export interface MonsterTemplate {
    name: string;
    level: number;
    description: string;
    habitats: TerrainType[];
    baseClass: string;
    element: Element;
    discovered: boolean;
    imagePrompt: string;
    skills?: string[];
    imageUrl?: string;
    rank?: MonsterRank;
}

export interface Poi {
    id: number;
    coords: { x: number, y: number };
    type: string;
    region: string;
    name: string;
    description: string;
    isLoading?: boolean;
    dialogue?: DialogueState;
    factionId?: number;
    dungeonId?: number;
}

export interface WorldState {
    pois: Poi[];
    factions: Faction[];
    dungeons: Dungeon[];
    bestiary: MonsterTemplate[];
}

export interface ExplorationEventLog {
    id: string;
    text: string;
    type: LogType;
    sources?: { uri: string; title: string; }[];
}

export interface LevelUpInfo {
    newLevel: number;
    realmChanged: boolean;
    newRealm: string;
}

export interface CombatLogEntry {
    id: string;
    text: string;
    type: 'action' | 'system' | 'info' | 'error' | 'narration';
}

export interface CultivationTechniqueBonus {
    stat: keyof DerivedStats;
    value: number;
    isPercent: boolean;
}

export interface CultivationTechnique {
    id: string;
    name: string;
    description: string;
    type: CultivationTechniqueType;
    level: number;
    maxLevel: number;
    bonuses: CultivationTechniqueBonus[];
}

export interface DialogueTurn {
    speaker: 'player' | 'npc' | 'system';
    text: string;
}

export interface DialogueState {
    npcName: string;
    npcRole: string;
    npcImageUrl?: string;
    affinity: number;
    history: DialogueTurn[];
    options?: string[];
    factionId?: number;
    factionName?: string;
    preferredElement?: string;
    weakness?: string;
    questOffer?: Omit<Quest, 'id' | 'status'>;
}

export interface DungeonFloor {
    type: DungeonFloorType;
    description: string;
    isCompleted: boolean;
    monsterName?: string;
    monsterRank?: MonsterRank;
    monsterLevel?: number;
    rewards?: {
        exp?: number;
        items?: Item[];
        materials?: { [key in UpgradeMaterial]?: number };
    };
}

export interface Dungeon {
    id: number;
    poiId: number;
    name: string;
    description: string;
    floors: DungeonFloor[];
    currentFloorIndex: number;
    isCompleted: boolean;
}

export interface SectStoreItem {
    id: string;
    item: Item;
    cost: number; // contribution points
}

export interface MetNpcInfo {
    name: string;
    role: string;
    affinity: number;
    factionName?: string;
    imageUrl?: string;
}

// --- New Random Event System ---
export type EventOutcomeType = 'ITEM' | 'STAT_CHANGE' | 'COMBAT' | 'REPUTATION' | 'QUEST' | 'NARRATIVE';

export interface EventOutcome {
    type: EventOutcomeType;
    description: string; // e.g., "Bạn nhận được 1 Linh Thảo."
    itemName?: string;
    itemRarity?: Rarity;
    itemCount?: number;
    stat?: keyof DerivedStats;
    amount?: number;
    isPercent?: boolean;
    monsterName?: string;
    factionId?: number;
    reputationChange?: number;
}

export interface EventChoice {
    text: string;
    outcomes: EventOutcome[];
}

export interface RandomEvent {
    id: string;
    title: string;
    description: string;
    choices: EventChoice[];
}


// Define the shape of the context
export interface GameContextType {
    screen: GameScreen;
    character: Character | null;
    enemy: Character | null;
    worldState: WorldState;
    appSettings: AppSettings;
    saveSlots: SaveSlot[];
    isQuickPlayLoading: boolean;
    designedWorld: DesignedWorld | null;
    designedWorldPrompt: WorldSummary | null;
    designedWorldStoryInfo: StoryInfo | null;
    activePoiIdForDialogue: number | null;
    transientDialogue: any;
    contextualActions: string[];
    isActionLocked: boolean;
    levelUpInfo: LevelUpInfo | null;
    oneTimeMessages: ExplorationEventLog[];
    activeEvent: RandomEvent | null;

    handleStartNewGame: () => void;
    handleQuickPlay: () => void;
    handleDevQuickStart: () => void;
    handleBackToMenu: () => void;
    handleOpenMenu: (menu: GameScreen) => void;
    handleCreateGame: (
        name: string,
        playerClass: string,
        classDefinition: BaseStats | undefined,
        characterContext: string,
        worldPrompt: string,
        worldKeywords: string[],
        difficulty: Difficulty,
        storyInfo?: StoryInfo
    ) => Promise<void>;
    handleLoadGame: (slotId: number) => void;
    handleSaveGame: (slotId: number) => void;
    handleDeleteSave: (slotId: number) => void;
    handleSettingsChange: (settings: AppSettings) => void;
    refreshSaveSlots: () => void;
    handleOpenImageLibrary: () => void;
    handleToggleFullscreen: () => void;
    isFullscreen: boolean;
    handleCombatEnd: (playerWon: boolean, finalPlayer: Character, finalPet: Pet | null, expGained: number, itemsDropped: Item[], materialsDropped: { [key in UpgradeMaterial]?: number }, consumablesDropped: any, isInDungeon?: boolean) => void;
    handleContinueAfterCombat: () => void;
    handleStartCombat: (monsterName?: string, levelOverride?: number) => void;
    handleOpenForge: () => void;
    handleDesignWorldComplete: (world: DesignedWorld, summary: WorldSummary, storyInfo?: StoryInfo) => void;
    handleOpenDialogue: (poiId: number) => void;
    handleCloseDialogue: () => void;
    handleSendDialogueMessage: (message: string) => Promise<void>;
    handleContinueTransientDialogue: (message: string) => Promise<void>;
    handleProceedInDungeon: () => Promise<void>;
    handleExitDungeon: (force?: boolean) => void;
    handleCatchPet: () => Promise<{ success: boolean; message: string; }>;
    handleEnslaveTarget: () => Promise<{ success: boolean; message: string; }>;
    handleAssignServantTask: (servantId: string, task: ServantTask) => void;
    handleRequestSectMission: () => Promise<void>;
    handleContributeItemToSect: (item: Item) => Promise<{success: boolean, message: string}>;
    handleBuyFromSectStore: (storeItem: any) => Promise<{success: boolean, message: string}>;
    handleJoinSectRequest: (factionId: number) => void;
    handleUpdateImageLibrary: (library: any[]) => void;
    imageLibrary: any[];
    handleAllocateStatPoint: (stat: keyof BaseStats) => void;
    handleSetActivePet: (petId: string | null) => void;
    handleReleasePet: (petId: string) => void;
    handleRenamePet: (petId: string, newName: string) => void;
    handleFeedPet: (petId: string) => Promise<void>;
    handleEvolvePet: (petId: string) => Promise<void>;
    handleActivateCultivationTechnique: (techniqueId: string) => void;
    handleLevelUpCultivationTechnique: (techniqueId: string) => Promise<void>;
    clearLevelUpInfo: () => void;
    setOneTimeMessages: (messages: ExplorationEventLog[]) => void;
    handleGenerateContextualActions: () => void;
    clearContextualActions: () => void;
    handleUpgradeItem: (itemId: string) => Promise<{ success: boolean; message: string; }>;
    handleEquipItem: (item: Item) => void;
    handleUnequipItem: (slot: EquipmentSlot) => void;
    handleLearnItem: (item: Item) => void;
    handleGetAIAdvice: () => Promise<void>;
    handlePlayerAction: (action: string) => Promise<void>;
    handleResolveEventChoice: (choice: EventChoice) => Promise<void>;
    
    // Retainer Methods
    handleRecruitRetainer: () => Promise<void>;
    handleTrainRetainer: (retainerId: string) => Promise<void>;
    handleSetActiveRetainer: (retainerId: string | null) => void;
}