

import {
    AttackResult,
    Character,
    Item,
    Skill,
    EquipmentSlot,
    Rarity,
    ItemType,
    BaseStats,
    Stat,
    DerivedStats,
    ActiveEffect,
    SkillEffectType,
    TargetType,
    Combatant,
    Equipment,
    Element,
    Pet,
    SetBonus,
    MonsterRank,
    UpgradeMaterial,
    Retainer,
    PlayerClass,
} from '../types';
import { BOSS_SKILLS as ALL_SKILLS } from '../data/bossSkills';
import { RARITY_DATA, STAT_WEIGHTS, MONSTER_RANK_MODIFIERS, PLAYER_CLASS_BASE_STATS } from '../constants';
import { PREDEFINED_MONSTERS } from '../data/monsterData';

// Helper function to calculate derived stats from base stats
export const calculateDerivedStats = (
    character: Omit<Character, 'derivedStats' | 'currentHp' | 'currentMp'>
): DerivedStats => {
    const totalBaseStats = { ...character.baseStats };
    const bonusStats = calculateBonusStatsFromEquipment(character.equipment);
    const bonusBaseStats = calculateBaseStatBonusesFromEquipment(character.equipment);

    // Add equipment base stat bonuses
    for (const stat in bonusBaseStats) {
        totalBaseStats[stat as Stat] = (totalBaseStats[stat as Stat] || 0) + (bonusBaseStats[stat as Stat] || 0);
    }

    // Optimization: Adjusted scaling factors for better mid-late game balance (Xianxia Theme)
    // HP: Greatly increased. Cultivators have immense vitality.
    const HP = (totalBaseStats.CON * 25) + (character.level * 40) + (bonusStats.HP || 0);
    // MP: Spiritual power scales with Spirit and Level.
    const MP = (totalBaseStats.SPI * 20) + (character.level * 15) + (bonusStats.MP || 0);
    
    // Attack scaling optimized: Main stats contribute significantly more.
    const ATK = (totalBaseStats.STR * 4.0) + (totalBaseStats.DEX * 1.5) + (bonusStats.ATK || 0);
    const MATK = (totalBaseStats.INT * 4.0) + (totalBaseStats.SPI * 1.5) + (bonusStats.MATK || 0);
    
    // Defense: CON is king (Iron Body), but STR also helps (Muscle Density).
    const DEF = (totalBaseStats.CON * 3.0) + (totalBaseStats.STR * 1.0) + (bonusStats.DEF || 0);
    
    // Speed is crucial for initiative
    const Speed = (totalBaseStats.AGI * 2.0) + (bonusStats.Speed || 0);
    
    // Secondary Stats
    const PENETRATION = (totalBaseStats.DEX * 0.3) + (bonusStats.PENETRATION || 0);
    const EVASION = (totalBaseStats.AGI * 0.3) + (bonusStats.EVASION || 0);
    const CRIT_RATE = (totalBaseStats.DEX * 0.35) + (bonusStats.CRIT_RATE || 0);
    const ACCURACY = (totalBaseStats.DEX * 0.6) + 90 + (bonusStats.ACCURACY || 0); // Base 90% accuracy
    const LIFESTEAL = (bonusStats.LIFESTEAL || 0);


    return { HP, MP, ATK, MATK, DEF, Speed, PENETRATION, EVASION, CRIT_RATE, ACCURACY, LIFESTEAL, ...totalBaseStats };
};

export const calculatePetDerivedStats = (pet: Pet): DerivedStats => {
    const { baseStats, level, isEvolved } = pet;
    
    // Evolution grants a 20% multiplier to raw stats calculations
    const evoMult = isEvolved ? 1.2 : 1.0;

    const stats: DerivedStats = {
        ...baseStats,
        // HP: Massive scaling for Pets to act as tanks.
        // Formula: (CON * 35 + Level * 60) * EvoMult
        HP: Math.floor((baseStats.CON * 35 + level * 60) * evoMult),
        
        MP: 0, // Pets don't use MP in this model
        
        // ATK/MATK: High multiplier (5.0) for primary stats to make them hit hard without equipment.
        ATK: Math.floor((baseStats.STR * 5.0 + baseStats.DEX * 2.0) * evoMult),
        MATK: Math.floor((baseStats.INT * 5.0 + baseStats.SPI * 2.0) * evoMult),
        
        // DEF: High CON scaling for survivability.
        DEF: Math.floor((baseStats.CON * 4.0 + baseStats.STR * 1.5) * evoMult),
        
        // Speed
        Speed: Math.floor((baseStats.AGI * 2.2) * evoMult),
        
        // Secondary Stats: Improved scaling from DEX/AGI
        PENETRATION: (baseStats.DEX * 0.4) * evoMult,
        EVASION: (baseStats.AGI * 0.4) * evoMult,
        CRIT_RATE: (baseStats.DEX * 0.5) * evoMult,
        ACCURACY: (baseStats.DEX * 0.8 + 90) * evoMult,
        
        // Evolved pets get native Lifesteal for sustainability
        LIFESTEAL: isEvolved ? 5 : 0,
    };
    return stats;
};

export const calculateRetainerStats = (retainer: Retainer): DerivedStats => {
    const { baseStats, level, potential, equipment } = retainer;
    
    const bonusStats = calculateBonusStatsFromEquipment(equipment);
    const bonusBaseStats = calculateBaseStatBonusesFromEquipment(equipment);
    
    const totalBaseStats = { ...baseStats };
    // Add equipment base stat bonuses
    for (const stat in bonusBaseStats) {
        totalBaseStats[stat as Stat] = (totalBaseStats[stat as Stat] || 0) + (bonusBaseStats[stat as Stat] || 0);
    }

    // Retainers scale based on potential. Higher potential = better stats per stat point.
    const p = potential || 1.0;

    const HP = (totalBaseStats.CON * 20 * p) + (level * 30 * p) + (bonusStats.HP || 0);
    const MP = (totalBaseStats.SPI * 15 * p) + (level * 10 * p) + (bonusStats.MP || 0);
    
    const ATK = (totalBaseStats.STR * 3.5 * p) + (totalBaseStats.DEX * 1.2) + (bonusStats.ATK || 0);
    const MATK = (totalBaseStats.INT * 3.5 * p) + (totalBaseStats.SPI * 1.2) + (bonusStats.MATK || 0);
    const DEF = (totalBaseStats.CON * 2.5 * p) + (totalBaseStats.STR * 0.8) + (bonusStats.DEF || 0);
    
    const Speed = (totalBaseStats.AGI * 1.8 * p) + (bonusStats.Speed || 0);
    
    const PENETRATION = (totalBaseStats.DEX * 0.25) + (bonusStats.PENETRATION || 0);
    const EVASION = (totalBaseStats.AGI * 0.25) + (bonusStats.EVASION || 0);
    const CRIT_RATE = (totalBaseStats.DEX * 0.3) + (bonusStats.CRIT_RATE || 0);
    const ACCURACY = (totalBaseStats.DEX * 0.5) + 85 + (bonusStats.ACCURACY || 0);
    const LIFESTEAL = (bonusStats.LIFESTEAL || 0);

    return { HP, MP, ATK, MATK, DEF, Speed, PENETRATION, EVASION, CRIT_RATE, ACCURACY, LIFESTEAL, ...totalBaseStats };
};

export const generateRandomRetainer = (level: number, masterId: string): Retainer => {
    const classes = Object.values(PlayerClass);
    const selectedClass = classes[Math.floor(Math.random() * classes.length)];
    const potentialRoll = Math.random();
    let potential = 1.0;
    let potentialDesc = 'Phàm nhân';
    
    if (potentialRoll > 0.95) { potential = 1.5; potentialDesc = 'Thiên Tài Ngàn Năm'; }
    else if (potentialRoll > 0.8) { potential = 1.3; potentialDesc = 'Kỳ Tài'; }
    else if (potentialRoll > 0.5) { potential = 1.1; potentialDesc = 'Có Tư Chất'; }
    
    const baseStats = { ...PLAYER_CLASS_BASE_STATS[selectedClass] };
    // Randomize stats slightly
    for (const key in baseStats) {
        baseStats[key as Stat] += Math.floor(Math.random() * 5);
    }

    const retainer: Retainer = {
        id: crypto.randomUUID(),
        masterId,
        name: `Đệ Tử ${selectedClass}`, // Ideally generate a name
        playerClass: selectedClass,
        specialization: selectedClass,
        level: Math.max(1, level - 5),
        exp: 0,
        expToNextLevel: 200,
        realm: { name: 'Luyện Khí Kỳ', level: 1 },
        baseStats,
        derivedStats: {} as any, // Recalculated below
        currentHp: 0,
        currentMp: 0,
        backstory: `Một ${potentialDesc.toLowerCase()} được bạn tìm thấy trên đường tu tiên.`,
        equipment: {},
        inventory: [],
        skills: [], // Could assign basic skills
        activeEffects: [],
        position: { x: 0, y: 0 },
        isHumanoid: true,
        isBoss: false,
        loyalty: 60,
        potential,
        linhCan: { elements: [Element.VO], quality: potentialDesc, description: '...' },
        learnedCultivationTechniques: []
    };
    
    const derived = calculateRetainerStats(retainer);
    retainer.derivedStats = derived;
    retainer.currentHp = derived.HP;
    retainer.currentMp = derived.MP;
    
    return retainer;
};


export const getTerrainFromPosition = (position: { x: number, y: number }): string => {
    // Placeholder logic for terrain. In a real game, this would be more complex.
    if (position.y < 1024) return 'Bắc Hoang';
    if (position.y > 3072) return 'Nam Cương';
    return 'Trung Vực';
};

export const performAttack = (attacker: Combatant, defender: Combatant): AttackResult => {
    const messages: string[] = [];
    let damage = 0;
    let lifestealAmount = 0;
    let isCritical = false;
    
    // 1. Accuracy Check
    const accuracyRoll = Math.random() * 100;
    if (accuracyRoll > (attacker.derivedStats.ACCURACY - defender.derivedStats.EVASION)) {
        messages.push(`${attacker.name} tấn công ${defender.name} nhưng đã bị né!`);
        return { damage, messages, appliedEffects: [], lifestealAmount, elementalEffect: null, isCritical: false };
    }

    // 2. Damage Calculation (NEW FORMULA)
    const baseDamage = attacker.derivedStats.ATK;
    const defense = defender.derivedStats.DEF;
    const penetration = attacker.derivedStats.PENETRATION;
    
    const effectiveDefense = Math.max(0, defense * (1 - penetration / 100));
    
    // New formula: Damage reduction is not linear. ATK damage is reduced by a percentage based on defense.
    const damageReduction = effectiveDefense / (effectiveDefense + 500 + attacker.level * 15);
    let rawDamage = baseDamage * (1 - damageReduction);

    // Guaranteed minimum damage based on attacker level to prevent stalemate
    const minDamage = 1 + Math.floor(attacker.level * 0.5); 
    rawDamage = Math.max(minDamage, rawDamage);

    // 3. Critical Hit Check
    const critRoll = Math.random() * 100;
    if (critRoll < attacker.derivedStats.CRIT_RATE) {
        rawDamage *= 1.75; // Buffed to 175% crit damage for satisfaction
        messages.push(`💥 Đòn chí mạng!`);
        isCritical = true;
    }

    // 4. Randomization (+/- 10%)
    damage = Math.round(rawDamage * (0.9 + Math.random() * 0.2));
    
    // 5. Lifesteal
    if(attacker.derivedStats.LIFESTEAL > 0) {
        lifestealAmount = Math.floor(damage * (attacker.derivedStats.LIFESTEAL / 100));
        if (lifestealAmount > 0) {
             messages.push(`${attacker.name} hồi ${lifestealAmount} HP nhờ hút máu.`);
        }
    }

    messages.push(`${attacker.name} tấn công ${defender.name}, gây ${damage} sát thương.`);
    
    return { damage, messages, appliedEffects: [], lifestealAmount, elementalEffect: null, isCritical };
};

export const useSkill = (caster: Combatant, target: Combatant, skill: Skill): AttackResult => {
    const messages: string[] = [`${caster.name} sử dụng [${skill.name}] lên ${target.name}!`];
    let totalDamage = 0;
    let lifestealAmount = 0;
    const appliedEffects: ActiveEffect[] = [];

    skill.effects.forEach(effect => {
        switch (effect.type) {
            case SkillEffectType.DAMAGE: {
                const baseDamageStat = skill.useMagicAttack ? caster.derivedStats.MATK : caster.derivedStats.ATK;
                // Since there is no MDEF, skills also target DEF.
                const defense = target.derivedStats.DEF;
                
                // Skills have innate penetration against defense.
                const skillInnatePen = 0.2; // 20% penetration
                const effectiveDefense = Math.max(0, defense * (1 - skillInnatePen));

                // Use the same percentage-based reduction formula
                const damageReduction = effectiveDefense / (effectiveDefense + 500 + caster.level * 15);
                let rawDamage = baseDamageStat * (1 - damageReduction);
                
                // Multiplier
                rawDamage *= (effect.powerMultiplier || 1);
                
                // Skills have higher min damage
                const minDamage = 5 + caster.level; 
                rawDamage = Math.max(minDamage, rawDamage);
                
                const damage = Math.round(rawDamage * (0.9 + Math.random() * 0.2));
                totalDamage += damage;
                messages.push(`Gây ${damage} sát thương.`);
                
                 if(caster.derivedStats.LIFESTEAL > 0) {
                    const ls = Math.floor(damage * (caster.derivedStats.LIFESTEAL / 100));
                    if (ls > 0) {
                        lifestealAmount += ls;
                        messages.push(`${caster.name} hồi ${ls} HP nhờ hút máu.`);
                    }
                }
                break;
            }
            case SkillEffectType.HEAL: {
                const healAmount = Math.round(caster.derivedStats.MATK * (effect.powerMultiplier || 1));
                totalDamage -= healAmount; // Negative damage is healing
                messages.push(`Hồi ${healAmount} HP.`);
                break;
            }
            case SkillEffectType.BUFF:
            case SkillEffectType.DEBUFF:
            case SkillEffectType.DOT:
            case SkillEffectType.HOT:
            case SkillEffectType.STUN:
            case SkillEffectType.DISABLE_SKILL: {
                 const newEffect: ActiveEffect = {
                    id: crypto.randomUUID(),
                    effect: effect,
                    remainingTurns: effect.duration || 3,
                    sourceSkillName: skill.name,
                };
                appliedEffects.push(newEffect);
                messages.push(`${target.name} bị ảnh hưởng bởi ${effect.description}.`);
                break;
            }
             case SkillEffectType.SUMMON:
                // Summoning logic would be handled at a higher level (e.g., in CombatScreen)
                messages.push(effect.description);
                break;

        }
    });

    return { damage: totalDamage, messages, appliedEffects, lifestealAmount, elementalEffect: null, isCritical: false };
};

export const generateItem = async (level: number, character: Character, forceRarity?: Rarity): Promise<Item> => {
    const rarity = forceRarity || getWeightedRarity();
    const rarityData = RARITY_DATA[rarity];
    
    const itemType = getRandomItemType();
    
    const baseItem = {
        id: crypto.randomUUID(),
        level: Math.max(1, level + Math.floor(Math.random() * 6) - 3),
        type: itemType,
        rarity,
        upgradeLevel: 0,
        maxUpgrade: rarityData.maxUpgrade,
        baseStats: {},
        bonusStats: {},
    };

    const budget = rarityData.statBudget * (1 + itemType.length/10) * (1 + baseItem.level/15); // Slightly reduced budget scaling to prevent overflow
    
    let allocatedPoints = 0;
    const baseStats: Partial<BaseStats> = {};

    // Allocate primary stats
    const primaryStats = STAT_WEIGHTS[itemType] || {};
    while (allocatedPoints < budget) {
        const randomStat = getRandomStat(primaryStats);
        const points = Math.min(budget - allocatedPoints, Math.floor(Math.random() * (budget / 4)) + 1);
        baseStats[randomStat] = (baseStats[randomStat] || 0) + points;
        allocatedPoints += points;
    }
    
    const name = await generateItemName(itemType, rarity, character);
    
    return {
        ...baseItem,
        name,
        description: `Một ${itemType} ${rarity} mạnh mẽ.`,
        // Fix: Cast to 'unknown' first to resolve the TypeScript conversion error.
        slot: itemType as unknown as EquipmentSlot, // This is a simplification
        baseStats,
    };
};

const getWeightedRarity = (): Rarity => {
    const roll = Math.random() * 100;
    if (roll < 50) return Rarity.COMMON;     // 50%
    if (roll < 80) return Rarity.UNCOMMON;   // 30%
    if (roll < 95) return Rarity.RARE;       // 15%
    if (roll < 99) return Rarity.EPIC;       // 4%
    return Rarity.LEGENDARY; // 1%
};

const getRandomItemType = (): ItemType => {
    const types = Object.values(ItemType).filter(t => t !== ItemType.CULTIVATION_MANUAL && t !== ItemType.SKILL_BOOK);
    return types[Math.floor(Math.random() * types.length)];
};

const getRandomStat = (weights: {[key in Stat]?: number}): Stat => {
    const stats = Object.values(Stat);
    if (Object.keys(weights).length === 0) {
        return stats[Math.floor(Math.random() * stats.length)];
    }

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + (weight || 0), 0);
    let random = Math.random() * totalWeight;

    for (const [stat, weight] of Object.entries(weights)) {
        if (random < (weight || 0)) {
            return stat as Stat;
        }
        random -= (weight || 0);
    }
    
    return stats[Math.floor(Math.random() * stats.length)];
};

const generateItemName = async (itemType: ItemType, rarity: Rarity, character: Character): Promise<string> => {
    // This would ideally use a Gemini call for dynamic names, but for now, we use templates.
    const templates = {
        [ItemType.VũKhí]: ["Kiếm", "Đao", "Thương", "Cung", "Trượng"],
        [ItemType.Áo]: ["Giáp", "Bào", "Y"],
        [ItemType.Nón]: ["Mũ", "Khôi", "Quán"],
        [ItemType.Quần]: ["Quần", "Hài"],
        [ItemType.Giày]: ["Ủng", "Giày", "Hài"],
        [ItemType.PhụKiện]: ["Nhẫn", "Dây chuyền", "Ngọc bội"],
    };
    const prefixes = {
        [Rarity.COMMON]: ["Sắt", "Gỗ", "Thường"],
        [Rarity.UNCOMMON]: ["Đồng", "Tinh xảo", "Bền"],
        [Rarity.RARE]: ["Bạc", "Linh xảo", "Ma pháp"],
        [Rarity.EPIC]: ["Vàng", "Huyền ảo", "Thánh quang"],
        [Rarity.LEGENDARY]: ["Hắc kim", "Thần thoại", "Vô cực"],
    };
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const base = templates[itemType][Math.floor(Math.random() * templates[itemType].length)];
    
    return `${prefix} ${base}`;
};


export const calculateBaseStatBonusesFromEquipment = (equipment: Equipment): Partial<BaseStats> => {
    const bonuses: Partial<BaseStats> = {};
    for (const slot in equipment) {
        const item = equipment[slot as EquipmentSlot];
        if (item) {
            for (const stat in item.baseStats) {
                bonuses[stat as Stat] = (bonuses[stat as Stat] || 0) + item.baseStats[stat as Stat]!;
            }
        }
    }
    return bonuses;
};

export const calculateBonusStatsFromEquipment = (equipment: Equipment): Partial<DerivedStats> => {
    const bonuses: Partial<DerivedStats> = {};
    for (const slot in equipment) {
        const item = equipment[slot as EquipmentSlot];
        if (item) {
            for (const stat in item.bonusStats) {
                 const key = stat as keyof DerivedStats;
                 bonuses[key] = (bonuses[key] || 0) + (item.bonusStats as any)[key]!;
            }
        }
    }
    
    // Add set bonuses
    const activeSetBonuses = getActiveSetBonuses(equipment);
    activeSetBonuses.forEach(set => {
        set.bonuses.forEach(bonusInfo => {
            if (bonusInfo.active) {
                 for (const stat in bonusInfo.bonus.stats) {
                    const key = stat as keyof DerivedStats;
                    bonuses[key] = (bonuses[key] || 0) + (bonusInfo.bonus.stats as any)[key]!;
                }
            }
        });
    });

    return bonuses;
};

export const getActiveSetBonuses = (equipment: Equipment): { setName: string; pieceCount: number; totalPieces: number; bonuses: { bonus: SetBonus; active: boolean }[] }[] => {
    const setPiecesCount: { [setName: string]: number } = {};
    const setsData: { [setName: string]: { bonuses: SetBonus[], totalPieces: number } } = {};

    // 1. Count pieces of each set and gather set data
    for (const slot in equipment) {
        const item = equipment[slot as EquipmentSlot];
        if (item && item.setName && item.setBonuses) {
            setPiecesCount[item.setName] = (setPiecesCount[item.setName] || 0) + 1;
            
            // Store set data if not already present, ensuring no mutation
            if (!setsData[item.setName]) {
                const sortedBonuses = [...item.setBonuses].sort((a, b) => b.pieces - a.pieces);
                setsData[item.setName] = {
                    bonuses: item.setBonuses, // Store original, unsorted bonus array
                    totalPieces: sortedBonuses.length > 0 ? sortedBonuses[0].pieces : 0,
                };
            }
        }
    }

    const activeBonusesList = [];

    // 2. Determine active bonuses for each set
    for (const setName in setPiecesCount) {
        const count = setPiecesCount[setName];
        const setData = setsData[setName];
        if (setData) {
            activeBonusesList.push({
                setName,
                pieceCount: count,
                totalPieces: setData.totalPieces,
                bonuses: setData.bonuses
                    .map(bonus => ({
                        bonus,
                        active: count >= bonus.pieces,
                    }))
                    .sort((a, b) => a.bonus.pieces - b.bonus.pieces),
            });
        }
    }

    return activeBonusesList;
};

export const createMonster = (templateName: string, levelOverride?: number): Character => {
    const template = PREDEFINED_MONSTERS.find(m => m.name === templateName);
    if (!template) throw new Error(`Monster template not found: ${templateName}`);

    const level = levelOverride || template.level;
    
    // Apply Rank Modifiers
    const rank = template.rank || MonsterRank.Thường;
    const rankMultiplier = MONSTER_RANK_MODIFIERS[rank].statMultiplier;

    // Enhanced monster stats scaling: (Base + Level * Growth) * RankMultiplier
    const baseStats: BaseStats = {
        STR: Math.floor((10 + level * 2.5) * rankMultiplier),
        AGI: Math.floor((10 + level * 1.8) * rankMultiplier),
        INT: Math.floor((10 + level * 1.5) * rankMultiplier),
        SPI: Math.floor((10 + level * 1.5) * rankMultiplier),
        CON: Math.floor((15 + level * 3.0) * rankMultiplier), // High CON for monster durability
        DEX: Math.floor((10 + level * 1.8) * rankMultiplier),
    };

    const derived = calculateDerivedStats({
        id: crypto.randomUUID(),
        name: template.name,
        level,
        baseStats,
        equipment: {},
        skills: [], // Will be populated later
    } as any);
    
    // Boost Boss HP further
    if (template.name === 'Nguyên Chủ Thánh Trí' || template.rank === MonsterRank.ThủLĩnh) {
        derived.HP *= 3;
    }

    const monster: Character = {
        id: crypto.randomUUID(),
        name: template.name,
        playerClass: template.baseClass,
        level: level,
        exp: 0,
        expToNextLevel: 100, // Not relevant for monsters
        realm: { name: 'Yêu Thú', level: 1 },
        baseStats,
        derivedStats: derived,
        currentHp: derived.HP,
        currentMp: derived.MP,
        backstory: template.description,
        equipment: {},
        inventory: [],
        skills: ALL_SKILLS.filter(s => template.skills?.includes(s.id)),
        activeEffects: [],
        position: { x: 0, y: 0 },
        isHumanoid: ['Ma Thú', 'Ma Vật'].includes(template.baseClass), // Example logic
        isBoss: template.name === 'Nguyên Chủ Thánh Trí',
        pets: [],
        retainers: [],
        servants: [],
        metNpcs: [],
        quests: [],
        reputation: {},
        materials: {},
        consumables: {},
        sectContributionPoints: 0,
        learnedCultivationTechniques: [],
        rank: rank,
        imageUrl: template.imageUrl
    };

    return monster;
};

// --- Upgrade Logic ---

export const getUpgradeCost = (item: Item): { material: UpgradeMaterial, amount: number } | null => {
    if (item.upgradeLevel >= item.maxUpgrade) return null;
    
    const level = item.level;
    let material: UpgradeMaterial;
    if (level < 20) material = UpgradeMaterial.TINH_THACH_HA_PHAM;
    else if (level < 50) material = UpgradeMaterial.TINH_THACH_TRUNG_PHAM;
    else material = UpgradeMaterial.TINH_THACH_CAO_PHAM;
    
    const amount = (item.upgradeLevel + 1) * 2;
    
    return { material, amount };
};

export const processItemUpgrade = (item: Item): Item => {
    // IMPORTANT: Use deep shallow copy for bonusStats to avoid mutating the original item reference in preview
    const newItem = { 
        ...item,
        bonusStats: { ...item.bonusStats } 
    };
    newItem.upgradeLevel += 1;
    
    // Increase stats
    // Example formula: Each level adds 10% of base stats to bonus stats (cumulative)
    for (const stat in newItem.baseStats) {
        const key = stat as Stat;
        const baseVal = newItem.baseStats[key] || 0;
        // Add 10% of base stat per upgrade level
        const bonusAdd = Math.ceil(baseVal * 0.1); 
        
        newItem.bonusStats[key] = (newItem.bonusStats[key] || 0) + bonusAdd;
    }

    return newItem;
}

// --- New Logic for Game Loop ---

export const generateRandomMonster = (playerLevel: number, terrain: string): Character => {
    // Filter monsters by terrain if possible, otherwise pick random
    let availableTemplates = PREDEFINED_MONSTERS.filter(m => m.habitats.includes(terrain as any));
    if (availableTemplates.length === 0) {
        availableTemplates = PREDEFINED_MONSTERS;
    }
    
    const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    // Randomize level slightly around player level
    const levelVariance = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const level = Math.max(1, playerLevel + levelVariance);
    
    return createMonster(template.name, level);
};

export const calculateLevelUp = (character: Character, expGained: number): { newCharacter: Character, levelUpInfo: { newLevel: number, realmChanged: boolean, newRealm: string } | null } => {
    let newCharacter = { ...character };
    newCharacter.exp += expGained;
    
    let levelUpInfo = null;

    if (newCharacter.exp >= newCharacter.expToNextLevel) {
        newCharacter.level += 1;
        newCharacter.exp -= newCharacter.expToNextLevel;
        // Increase EXP requirement
        newCharacter.expToNextLevel = Math.floor(newCharacter.expToNextLevel * 1.5);
        
        // Stat Growth
        newCharacter.baseStats.STR += 2;
        newCharacter.baseStats.AGI += 2;
        newCharacter.baseStats.INT += 2;
        newCharacter.baseStats.SPI += 2;
        newCharacter.baseStats.CON += 3;
        newCharacter.baseStats.DEX += 2;
        newCharacter.unallocatedStatPoints = (newCharacter.unallocatedStatPoints || 0) + 5;

        // Realm Breakthrough every 10 levels
        let realmChanged = false;
        if (newCharacter.level % 10 === 0) {
            newCharacter.realm.level += 1;
            if (newCharacter.realm.level > 9) {
                // Determine new realm name (simplified logic)
                const realms = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp'];
                const currentRealmIndex = realms.indexOf(newCharacter.realm.name.replace(' Kỳ', ''));
                if (currentRealmIndex !== -1 && currentRealmIndex < realms.length - 1) {
                    newCharacter.realm.name = realms[currentRealmIndex + 1] + ' Kỳ';
                    newCharacter.realm.level = 1;
                    realmChanged = true;
                    // Realm Bonus
                    newCharacter.baseStats.STR += 10;
                    newCharacter.baseStats.INT += 10;
                    newCharacter.baseStats.CON += 10;
                }
            }
        }

        // Recalculate derived
        newCharacter.derivedStats = calculateDerivedStats(newCharacter);
        // Full heal on level up
        newCharacter.currentHp = newCharacter.derivedStats.HP;
        newCharacter.currentMp = newCharacter.derivedStats.MP;

        levelUpInfo = {
            newLevel: newCharacter.level,
            realmChanged,
            newRealm: newCharacter.realm.name
        };
    }

    return { newCharacter, levelUpInfo };
};