import { AppSettings, Rarity, Stat, ItemType, Difficulty, MonsterRank, UpgradeMaterial, UpgradeConsumable, ColorTheme, DisplaySettings, Element, PlayerClass, BaseStats } from './types';

export const NUM_SAVE_SLOTS = 5;
export const LOCAL_STORAGE_KEY_SETTINGS = 'tu_tien_settings';
export const LOCAL_STORAGE_KEY_SAVE_GAME = 'tu_tien_save_';
export const CUSTOM_CLASS_CREATION_POINTS = 20;
export const PET_EVOLUTION_LEVEL = 30;

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
    aiNarrative: { font: 'Inter', size: '16px', textColor: '#e5e7eb' },
    playerDialogue: { font: 'Inter', size: '16px', textColor: '#ffffff', bgColor: '#581c87' },
    npcDialogue: { font: 'Inter', size: '16px', textColor: '#e5e7eb', bgColor: '#374151' },
    characterName: { font: 'Inter', size: '20px', textColor: '#ffffff' },
};

export const DEFAULT_SETTINGS: AppSettings = {
    difficulty: Difficulty.NORMAL,
    eventFrequency: 0.5,
    autoDismantleRarities: {
        [Rarity.COMMON]: true,
        [Rarity.UNCOMMON]: false,
        [Rarity.RARE]: false,
        [Rarity.EPIC]: false,
        [Rarity.LEGENDARY]: false,
    },
    colorTheme: ColorTheme.DARK_PURPLE,
    reduceMotion: false,
    displaySettings: DEFAULT_DISPLAY_SETTINGS,
    proactiveNarrationFrequency: 0.25,
};

export const RARITY_DATA: { [key in Rarity]: { color: string, borderColor: string, statBudget: number, maxUpgrade: number } } = {
    [Rarity.COMMON]: { color: '#d1d5db', borderColor: '#6b7280', statBudget: 10, maxUpgrade: 5 },
    [Rarity.UNCOMMON]: { color: '#6ee7b7', borderColor: '#10b981', statBudget: 15, maxUpgrade: 10 },
    [Rarity.RARE]: { color: '#60a5fa', borderColor: '#2563eb', statBudget: 22, maxUpgrade: 15 },
    [Rarity.EPIC]: { color: '#c084fc', borderColor: '#9333ea', statBudget: 35, maxUpgrade: 20 },
    [Rarity.LEGENDARY]: { color: '#facc15', borderColor: '#f59e0b', statBudget: 50, maxUpgrade: 25 },
};

export const STAT_WEIGHTS: { [key in ItemType]?: Partial<{ [key in Stat]: number }> } = {
    [ItemType.VũKhí]: { [Stat.STR]: 4, [Stat.DEX]: 2, [Stat.INT]: 4 },
    [ItemType.Áo]: { [Stat.CON]: 4, [Stat.SPI]: 2 },
    [ItemType.Nón]: { [Stat.INT]: 3, [Stat.SPI]: 3 },
    [ItemType.Quần]: { [Stat.CON]: 3, [Stat.AGI]: 2 },
    [ItemType.Giày]: { [Stat.AGI]: 4 },
    [ItemType.PhụKiện]: { [Stat.STR]: 1, [Stat.AGI]: 1, [Stat.INT]: 1, [Stat.SPI]: 1, [Stat.CON]: 1, [Stat.DEX]: 1 },
};

export const DIFFICULTY_MODIFIERS = {
    [Difficulty.EASY]: { enemyHp: 0.8, enemyDmg: 0.7, expRate: 1.2, lootRate: 1.2 },
    [Difficulty.NORMAL]: { enemyHp: 1.0, enemyDmg: 1.0, expRate: 1.0, lootRate: 1.0 },
    [Difficulty.HARD]: { enemyHp: 1.5, enemyDmg: 1.3, expRate: 0.9, lootRate: 0.9 },
    [Difficulty.NIGHTMARE]: { enemyHp: 2.0, enemyDmg: 1.8, expRate: 0.8, lootRate: 0.8 },
};

export const MONSTER_RANK_MODIFIERS = {
    [MonsterRank.Thường]: { statMultiplier: 1.0, lootMultiplier: 1.0 },
    [MonsterRank.TinhAnh]: { statMultiplier: 1.5, lootMultiplier: 1.8 },
    [MonsterRank.ThủLĩnh]: { statMultiplier: 2.5, lootMultiplier: 3.0 },
};

export const ELEMENT_ICONS: { [key in Element]: string } = {
    [Element.KIM]: '⚔️', [Element.MOC]: '🌿', [Element.THUY]: '💧', [Element.HOA]: '🔥', [Element.THO]: '⛰️', [Element.VO]: '🌀'
};

export const ELEMENT_COLORS: { [key in Element]: string } = {
    [Element.KIM]: 'text-gray-300', [Element.MOC]: 'text-green-400', [Element.THUY]: 'text-blue-400', [Element.HOA]: 'text-red-400', [Element.THO]: 'text-yellow-500', [Element.VO]: 'text-purple-400'
};

export const UPGRADE_MATERIALS_DATA: { [key in UpgradeMaterial]: { name: string, description: string } } = {
    [UpgradeMaterial.TINH_THACH_HA_PHAM]: { name: 'Tinh Thạch Hạ Phẩm', description: 'Dùng để cường hóa trang bị cấp thấp.' },
    [UpgradeMaterial.TINH_THACH_TRUNG_PHAM]: { name: 'Tinh Thạch Trung Phẩm', description: 'Dùng để cường hóa trang bị cấp trung.' },
    [UpgradeMaterial.TINH_THACH_CAO_PHAM]: { name: 'Tinh Thạch Cao Phẩm', description: 'Dùng để cường hóa trang bị cấp cao.' },
    [UpgradeMaterial.LINH_HON_THACH]: { name: 'Linh Hồn Thạch', description: 'Một viên đá quý hiếm dùng cho các cường hóa đặc biệt.' },
};

export const UPGRADE_CONSUMABLES_DATA: { [key in UpgradeConsumable]: { name: string, description: string } } = {
    [UpgradeConsumable.LINH_THU_THUC]: { name: 'Linh Thú Thực', description: 'Thức ăn đặc biệt giúp thú cưng tăng kinh nghiệm.' },
    [UpgradeConsumable.HON_AN_PHU]: { name: 'Hồn Ấn Phù', description: 'Bùa chú dùng để nô dịch kẻ địch hình người.' },
    [UpgradeConsumable.LINH_THU_PHU]: { name: 'Linh Thú Phù', description: 'Bùa chú dùng để thu phục yêu thú.' },
};

export const PET_EVOLUTION_COST = {
    [UpgradeMaterial.TINH_THACH_CAO_PHAM]: 10,
    [UpgradeMaterial.LINH_HON_THACH]: 3,
};

export const PLAYER_CLASS_BASE_STATS: { [key in PlayerClass]: BaseStats } = {
    [PlayerClass.THE_TU]: { [Stat.STR]: 8, [Stat.AGI]: 5, [Stat.INT]: 2, [Stat.SPI]: 3, [Stat.CON]: 10, [Stat.DEX]: 7 },
    [PlayerClass.PHAP_TU]: { [Stat.STR]: 2, [Stat.AGI]: 4, [Stat.INT]: 10, [Stat.SPI]: 8, [Stat.CON]: 5, [Stat.DEX]: 6 },
    [PlayerClass.KIEM_TU]: { [Stat.STR]: 7, [Stat.AGI]: 8, [Stat.INT]: 4, [Stat.SPI]: 4, [Stat.CON]: 6, [Stat.DEX]: 9 },
};