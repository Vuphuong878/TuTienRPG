


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Character, Item, UpgradeMaterial, AttackResult, Skill, SkillType, ActiveEffect, TargetType, Pet, Combatant, UpgradeConsumable, Rarity, CombatLogEntry, MonsterRank, Element, SkillEffectType, BossPhase } from '../types';
import { performAttack, useSkill, generateItem, calculateDerivedStats, createMonster } from '../services/gameLogic';
import ItemCard from './ItemCard';
import { useGame } from '../contexts/GameContext';
import { DIFFICULTY_MODIFIERS, MONSTER_RANK_MODIFIERS, ELEMENT_ICONS } from '../constants';
import StatusEffectDisplay from './StatusEffectDisplay';
import { BOSS_DEFINITIONS } from '../data/bossData';
import { BOSS_SKILLS as ALL_SKILLS } from '../data/bossSkills';

const CombatantDisplay: React.FC<{ combatant: Combatant, isPlayerSide: boolean, isActiveTurn: boolean }> = ({ combatant, isPlayerSide, isActiveTurn }) => {
    const hpPercentage = combatant.derivedStats.HP > 0 ? (combatant.currentHp / combatant.derivedStats.HP) * 100 : 0;
    const mpPercentage = 'currentMp' in combatant && combatant.derivedStats.MP > 0 ? (combatant.currentMp / combatant.derivedStats.MP) * 100 : 0;

    const isCharacter = 'playerClass' in combatant;
    const combatantName = ('bossInfo' in combatant && combatant.bossInfo && typeof combatant.currentPhaseIndex === 'number')
        ? combatant.bossInfo.phases[combatant.currentPhaseIndex].name
        : combatant.name;
    const isBoss = isCharacter && (combatant as Character).isBoss;
    const elements = 'linhCan' in combatant && combatant.linhCan ? combatant.linhCan.elements : [];


    return (
        <div className={`flex flex-col items-center p-2 sm:p-4 rounded-xl transition-all duration-300 bg-[var(--color-backdrop-bg)] backdrop-blur-md border shadow-[0_0_8px_var(--color-primary-dark)] ${isActiveTurn ? 'border-[var(--color-primary-light)] animate-pulse-border' : 'border-[var(--color-primary)]'}`}>
            {combatant.imageUrl && (
                 <div className={`w-24 h-24 sm:w-32 sm:h-32 mb-4 rounded-lg overflow-hidden border-2 ${isPlayerSide ? 'border-cyan-500/50' : 'border-red-500/50'} shadow-lg`}>
                    <img src={combatant.imageUrl} alt={combatantName} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="w-full text-center">
                 <div className="flex justify-center items-baseline mb-1 gap-2">
                    {elements.length > 0 && (
                         <div className="relative group flex gap-1">
                            {elements.map(el => <span key={el} style={{color: `var(--element-${el.toLowerCase()}-text)`}} className={`text-lg font-bold`}>{ELEMENT_ICONS[el]}</span>)}
                            <div className="absolute bottom-full mb-2 w-28 text-center left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Hệ: {elements.join(', ')}
                            </div>
                        </div>
                    )}
                    <span className="font-bold text-md sm:text-lg text-white">{isBoss && '👑 '}{combatantName}</span>
                    <span className="text-xs sm:text-sm text-gray-400">Lv. {combatant.level}</span>
                </div>
                <div className="space-y-2">
                    <div className="w-full bg-black/30 rounded-full h-5 sm:h-6 border border-white/10 relative">
                        <div className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-green-400 to-green-600`} style={{ width: `${hpPercentage}%` }}></div>
                        <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                           HP: {Math.round(combatant.currentHp).toLocaleString()} / {combatant.derivedStats.HP.toLocaleString()}
                        </div>
                    </div>
                    {isCharacter && (
                         <div className="w-full bg-black/30 rounded-full h-5 sm:h-6 border border-white/10 relative">
                            <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${mpPercentage}%` }}></div>
                            <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                               MP: {Math.round((combatant as Character).currentMp).toLocaleString()} / {combatant.derivedStats.MP.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-3 min-h-[32px] flex items-center justify-center">
                    <StatusEffectDisplay effects={combatant.activeEffects} />
                </div>
            </div>
        </div>
    );
};

const TurnOrderDisplay: React.FC<{ participants: Combatant[]; currentIndex: number }> = ({ participants, currentIndex }) => {
    return (
        <div className="flex justify-center items-end gap-2 sm:gap-4 my-4 p-2 bg-black/40 rounded-lg h-20">
            <span className="text-sm font-bold text-gray-300 self-center px-2">THỨ TỰ</span>
            {participants.map((p, index) => (
                <div key={p.id} className="relative group flex flex-col items-center">
                    <div 
                        className={`absolute -top-6 text-yellow-400 text-2xl transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        ▼
                    </div>
                    <img 
                        src={p.imageUrl || 'https://via.placeholder.com/40'} 
                        alt={p.name} 
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-4 transition-all duration-300 ${
                            index === currentIndex 
                            ? 'border-yellow-400 scale-110' 
                            : 'border-gray-500 opacity-70'
                        }`}
                    />
                    <div className="absolute top-full mt-2 w-max bg-black/80 text-white text-xs rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        {p.name}
                    </div>
                </div>
            ))}
        </div>
    );
};


export const CombatScreen: React.FC = () => {
  const { character: player, enemy: initialEnemy, handleCombatEnd, handleContinueAfterCombat, appSettings, handleCatchPet, handleEnslaveTarget } = useGame();
  
  if (!player || !initialEnemy) return null; 

  const [participants, setParticipants] = useState<Combatant[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);

  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [isCombatOver, setIsCombatOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [rewards, setRewards] = useState<{exp: number, items: Item[], materials: { [key in UpgradeMaterial]?: number }, consumables: { [key in UpgradeConsumable]?: number }}|null>(null);
  const [showSkillList, setShowSkillList] = useState(false);
  
  const [floatingTexts, setFloatingTexts] = useState<{id: string, text: string, type: 'damage' | 'heal' | 'lifesteal' | 'dot' | 'strong' | 'weak' | 'proficient' | 'crit', side: 'player' | 'enemy' | 'pet'}[]>([]);
  const [shake, setShake] = useState(false);

  const combatEndedRef = useRef(false);
  const participantsRef = useRef(participants);
  useEffect(() => {
      participantsRef.current = participants;
  }, [participants]);


  const addToLog = useCallback((messages: string | string[], type: CombatLogEntry['type'] = 'action') => {
      const msgs = Array.isArray(messages) ? messages : [messages];
      const newEntries: CombatLogEntry[] = msgs.map(m => ({ id: crypto.randomUUID(), text: m, type }));
      setCombatLog(prev => [...newEntries.reverse(), ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    combatEndedRef.current = false;
    setIsCombatOver(false);
    setPlayerWon(false);
    setRewards(null);
    
    let enemyWithBossData = { ...initialEnemy };
    if (enemyWithBossData.isBoss && BOSS_DEFINITIONS[enemyWithBossData.name]) {
        enemyWithBossData.bossInfo = BOSS_DEFINITIONS[enemyWithBossData.name];
        enemyWithBossData.currentPhaseIndex = 0;
    }


    const activePet = player.activePetId ? player.pets.find(p => p.id === player.activePetId) : null;
    const activeRetainer = player.activeRetainerId ? player.retainers.find(r => r.id === player.activeRetainerId) : null;
    
    const initialParticipants: Combatant[] = [player, enemyWithBossData];
    if (activePet) initialParticipants.push(activePet);
    if (activeRetainer) initialParticipants.push(activeRetainer);

    initialParticipants.sort((a, b) => b.derivedStats.Speed - a.derivedStats.Speed);
    
    setParticipants(initialParticipants);
    setTurnIndex(0);
    setCombatLog([{ id: crypto.randomUUID(), text: 'Trận chiến bắt đầu!', type: 'system' }]);
  }, [player, initialEnemy]);
  

  const playerInCombat = useMemo(() => participants.find(p => p.id === player.id) as Character | undefined, [participants, player.id]);
  const enemyInCombat = useMemo(() => participants.find(p => p.id === initialEnemy.id) as Character | undefined, [participants, initialEnemy.id]);
  const petInCombat = useMemo(() => {
      if (!player.activePetId) return null;
      return participants.find(p => p.id === player.activePetId) as Pet | undefined;
  }, [participants, player.activePetId]);
  const retainerInCombat = useMemo(() => {
      if (!player.activeRetainerId) return null;
      return participants.find(p => p.id === player.activeRetainerId) as Character | undefined;
  }, [participants, player.activeRetainerId]);


  const isPlayerTurn = useMemo(() => participants[turnIndex]?.id === player.id, [participants, turnIndex, player.id]);

  const addFloatingText = useCallback((text: string, type: 'damage' | 'heal' | 'lifesteal' | 'dot' | 'strong' | 'weak' | 'proficient' | 'crit', side: 'player' | 'enemy' | 'pet') => {
      const newText = { id: crypto.randomUUID(), text, type, side };
      setFloatingTexts(prev => [...prev, newText]);
      setTimeout(() => {
          setFloatingTexts(current => current.filter(t => t.id !== newText.id));
      }, 1900);
  }, []);
  
  const updateMultipleParticipantsState = useCallback((updatedCombatants: Combatant[]) => {
      setParticipants(prev => {
        const updatedMap = new Map(updatedCombatants.map(u => [u.id, u]));
        return prev.map(p => updatedMap.get(p.id) || p);
      });
  }, []);

  const endCombat = useCallback(async (won: boolean) => {
    if (combatEndedRef.current) return;
    combatEndedRef.current = true;
    
    const finalPlayer = participantsRef.current.find(p => p.id === player.id) as Character;
    const finalPet = participantsRef.current.find(p => p.id === player.activePetId) as Pet | undefined;

    let expGained = 0;
    let itemsDropped: Item[] = [];
    let materialsDropped: { [key in UpgradeMaterial]?: number } = {};
    let consumablesDropped: { [key in UpgradeConsumable]?: number } = {};

    if (won && finalPlayer) {
        setPlayerWon(true);
        const difficultyMods = DIFFICULTY_MODIFIERS[appSettings.difficulty];
        const enemyRank = initialEnemy.rank || MonsterRank.Thường;
        const rankMods = MONSTER_RANK_MODIFIERS[enemyRank];
        const lootMultiplier = rankMods.lootMultiplier;
        
        let baseExpGained = Math.floor(10 * (initialEnemy.level * 0.5));
        if (initialEnemy.isBoss) baseExpGained *= 3;
        expGained = Math.floor(baseExpGained * difficultyMods.expRate * lootMultiplier);

        const finalLootRate = difficultyMods.lootRate * lootMultiplier;
        if (initialEnemy.isBoss) {
            itemsDropped.push(await generateItem(initialEnemy.level, finalPlayer, Rarity.EPIC));
            if(Math.random() < 0.5 * finalLootRate) itemsDropped.push(await generateItem(initialEnemy.level, finalPlayer, Rarity.RARE));
        } else {
             if (Math.random() < 0.7 * finalLootRate) itemsDropped.push(await generateItem(initialEnemy.level, finalPlayer));
             if (Math.random() < 0.2 * finalLootRate) itemsDropped.push(await generateItem(initialEnemy.level, finalPlayer));
        }
        
        const materialAmount = Math.floor((Math.random() * 2 + 1) * lootMultiplier);
        if(initialEnemy.level < 20) materialsDropped[UpgradeMaterial.TINH_THACH_HA_PHAM] = materialAmount;
        else if (initialEnemy.level < 50) materialsDropped[UpgradeMaterial.TINH_THACH_TRUNG_PHAM] = materialAmount;
        else materialsDropped[UpgradeMaterial.TINH_THACH_CAO_PHAM] = materialAmount;
        if (Math.random() < 0.1 * finalLootRate) materialsDropped[UpgradeMaterial.LINH_HON_THACH] = (materialsDropped[UpgradeMaterial.LINH_HON_THACH] || 0) + 1;
        if(initialEnemy.isBoss) materialsDropped[UpgradeMaterial.LINH_HON_THACH] = (materialsDropped[UpgradeMaterial.LINH_HON_THACH] || 0) + 1;

        if (Math.random() < 0.20 * finalLootRate) {
            const amount = 1 + (enemyRank === MonsterRank.TinhAnh ? 1 : 0) + (enemyRank === MonsterRank.ThủLĩnh ? 2 : 0);
            consumablesDropped[UpgradeConsumable.LINH_THU_THUC] = (consumablesDropped[UpgradeConsumable.LINH_THU_THUC] || 0) + amount;
        }
        if (initialEnemy.isBoss) {
            const amount = Math.floor(Math.random() * 3) + 3;
            consumablesDropped[UpgradeConsumable.LINH_THU_THUC] = (consumablesDropped[UpgradeConsumable.LINH_THU_THUC] || 0) + amount;
        }
        
        setRewards({exp: expGained, items: itemsDropped, materials: materialsDropped, consumables: consumablesDropped});
        addToLog([`Bạn đã chiến thắng! Nhận được ${expGained} EXP.`], 'info');
    } else {
        setPlayerWon(false);
        addToLog('Bạn đã bị đánh bại!', 'error');
    }
    
    // This will update the character state and handle level ups, but not change screen
    handleCombatEnd(won, finalPlayer, finalPet, expGained, itemsDropped, materialsDropped, consumablesDropped, !!player.currentDungeonId);

    // This will trigger the rewards UI
    setTimeout(() => setIsCombatOver(true), 1000);

  }, [initialEnemy, appSettings.difficulty, addToLog, player, handleCombatEnd]);

    const nextTurn = useCallback(() => {
        if (combatEndedRef.current) return;
    
        const currentParticipants = participantsRef.current;
        let participantsWithUpdates = JSON.parse(JSON.stringify(currentParticipants));
        const actorOfPreviousTurn = currentParticipants[turnIndex];
        
        // 1. Apply end-of-turn effects for the actor who just finished
        if (actorOfPreviousTurn && actorOfPreviousTurn.currentHp > 0) {
            let actorState = participantsWithUpdates.find((p: Combatant) => p.id === actorOfPreviousTurn.id)!;
            let wasModified = false;
            
            const dotHotEffects = actorState.activeEffects.filter((e: ActiveEffect) => e.effect.type === SkillEffectType.DOT || e.effect.type === SkillEffectType.HOT);
            if (dotHotEffects.length > 0) {
                wasModified = true;
                dotHotEffects.forEach((activeEffect: ActiveEffect) => {
                    const { effect } = activeEffect;
                    const baseValue = 'playerClass' in actorState ? actorState.derivedStats.MATK : (actorState as Pet).derivedStats.MATK;
                    const value = Math.floor(baseValue * (effect.powerMultiplier || 0));
                    const side = actorState.id === player.id ? 'player' : (actorState.id === player.activePetId ? 'pet' : 'enemy');
    
                    if (effect.type === SkillEffectType.DOT && value > 0) {
                        actorState.currentHp = Math.max(0, actorState.currentHp - value);
                        addToLog(`${actorState.name} chịu ${value} sát thương từ ${activeEffect.sourceSkillName}.`);
                        addFloatingText(value.toString(), 'dot', side);
                    } else if (effect.type === SkillEffectType.HOT && value > 0) {
                        actorState.currentHp = Math.min(actorState.derivedStats.HP, actorState.currentHp + value);
                        addToLog(`${actorState.name} được hồi ${value} HP từ ${activeEffect.sourceSkillName}.`);
                        addFloatingText(value.toString(), 'heal', side);
                    }
                });
            }
            
            if (actorState.activeEffects.length > 0) {
                actorState.activeEffects = actorState.activeEffects
                    .map((e: ActiveEffect) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
                    .filter((e: ActiveEffect) => e.remainingTurns > 0);
                wasModified = true;
            }
            
            if (wasModified) {
                participantsWithUpdates = participantsWithUpdates.map((p: Combatant) => p.id === actorState.id ? actorState : p);
            }
            
            if (actorState.currentHp <= 0) {
                addToLog(`${actorState.name} đã gục ngã vì hiệu ứng!`, 'system');
                const playerTeamAlive = participantsWithUpdates.filter((p: Combatant) => (p.id === player.id || p.id === player.activePetId || p.id === player.activeRetainerId) && p.currentHp > 0).length > 0;
                const enemyTeamAlive = participantsWithUpdates.filter((p: Combatant) => !(p.id === player.id || p.id === player.activePetId || p.id === player.activeRetainerId) && p.currentHp > 0).length > 0;

                if (!playerTeamAlive) { endCombat(false); return; }
                if (!enemyTeamAlive) { endCombat(true); return; }
            }
        }
    
        // 2. Find next valid actor
        let nextIndex = (turnIndex + 1) % participantsWithUpdates.length;
        let attempts = 0;
        while (attempts < participantsWithUpdates.length) {
            const nextCombatant = participantsWithUpdates[nextIndex];
    
            if (nextCombatant.currentHp <= 0) {
                nextIndex = (nextIndex + 1) % participantsWithUpdates.length;
                attempts++;
                continue;
            }
            
            const isStunned = nextCombatant.activeEffects.some((e: ActiveEffect) => e.effect.type === SkillEffectType.STUN);
            if (isStunned) {
                addToLog(`🌀 ${nextCombatant.name} bị choáng và mất lượt!`, 'info');
                
                let stunnedCombatant = participantsWithUpdates.find((p: Combatant) => p.id === nextCombatant.id)!;
                stunnedCombatant.activeEffects = stunnedCombatant.activeEffects
                    .map((e: ActiveEffect) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
                    .filter((e: ActiveEffect) => e.remainingTurns > 0);
                
                nextIndex = (nextIndex + 1) % participantsWithUpdates.length;
                attempts++;
                continue;
            }
    
            break; // Found valid actor
        }
    
        // 3. Commit state changes
        setParticipants(participantsWithUpdates);
        setTurnIndex(nextIndex);
    
    }, [turnIndex, addToLog, addFloatingText, player, endCombat]);

  const processAction = useCallback(async (result: AttackResult, attacker: Combatant, defender: Combatant, skill?: Skill) => {
    let newAttackerState = { ...attacker };
    let newDefenderState = { ...defender } as Character; // Assume Character for boss logic

    // Boss Phase Transition & Immunity Logic
    if (newDefenderState.isBoss && newDefenderState.bossInfo) {
        const currentPhase = newDefenderState.bossInfo.phases[newDefenderState.currentPhaseIndex || 0];
        
        // Check for immunity
        if (currentPhase.isImmuneWhileMinionsExist) {
            const minionsExist = participantsRef.current.some(p => p.name === 'Thánh Trí Mảnh Vỡ' && p.currentHp > 0);
            if (minionsExist) {
                addToLog(`${newDefenderState.name} được bảo vệ bởi các mảnh vỡ. Miễn nhiễm sát thương!`, 'narration');
                result.damage = 0; // Nullify damage
            }
        }
        
        // Check for phase transition
        const hpPercent = (newDefenderState.currentHp - result.damage) / newDefenderState.derivedStats.HP; // Check HP after damage
        const nextPhaseIndex = (newDefenderState.currentPhaseIndex || 0) + 1;
        if (nextPhaseIndex < newDefenderState.bossInfo.phases.length) {
            const nextPhase = newDefenderState.bossInfo.phases[nextPhaseIndex];
            if (hpPercent <= nextPhase.hpThreshold) {
                newDefenderState.currentPhaseIndex = nextPhaseIndex;
                const originalStats = calculateDerivedStats({ ...newDefenderState, currentPhaseIndex: 0 }); // Calculate based on base phase
                newDefenderState.derivedStats.ATK = Math.floor(originalStats.ATK * nextPhase.statMultiplier);
                newDefenderState.derivedStats.DEF = Math.floor(originalStats.DEF * nextPhase.statMultiplier);
                newDefenderState.skills = ALL_SKILLS.filter(s => nextPhase.skills.includes(s.id));
                addToLog(`🔥 ${newDefenderState.name} chuyển sang ${nextPhase.name}! Sức mạnh của nó tăng vọt!`, 'narration');
                
                // Handle summoning for the new phase
                const summonSkill = newDefenderState.skills.find(s => s.effects.some(e => e.type === SkillEffectType.SUMMON));
                if (summonSkill) {
                    const summonEffect = summonSkill.effects.find(e => e.type === SkillEffectType.SUMMON)!;
                    const newMinions: Character[] = [];
                    for(let i=0; i < (summonEffect.summonCount || 0); i++) {
                         newMinions.push(createMonster(summonEffect.summonMonsterName!, newDefenderState.level));
                    }
                    if (newMinions.length > 0) {
                        setParticipants(prev => [...prev, ...newMinions].sort((a,b) => b.derivedStats.Speed - a.derivedStats.Speed));
                        addToLog(`${newDefenderState.name} sử dụng ${summonSkill.name}!`, 'action');
                    }
                }
            }
        }
    }

    const isPlayerSideDefender = newDefenderState.id === player.id || newDefenderState.id === player.activePetId || newDefenderState.id === player.activeRetainerId;
    addToLog(result.messages);

    if (result.damage > 0) {
        newDefenderState.currentHp = Math.max(0, newDefenderState.currentHp - result.damage);
        const defenderSide = newDefenderState.id === player.id ? 'player' : (newDefenderState.id === player.activePetId ? 'pet' : 'enemy');
        if (result.isCritical) {
             addFloatingText(`💥 ${result.damage}`, 'crit', defenderSide);
        } else {
             addFloatingText(result.damage.toString(), 'damage', defenderSide);
        }
        if (attacker.id === player.id || attacker.id === player.activePetId) {
            setShake(true);
            setTimeout(() => setShake(false), 300);
        }
    } else if (result.damage < 0) { // Healing
        const healAmount = Math.abs(result.damage);
        newDefenderState.currentHp = Math.min(newDefenderState.derivedStats.HP, newDefenderState.currentHp + healAmount);
        const defenderSide = newDefenderState.id === player.id ? 'player' : (newDefenderState.id === player.activePetId ? 'pet' : 'enemy');
        addFloatingText(healAmount.toString(), 'heal', defenderSide);
    }
    
    if(result.lifestealAmount > 0) {
        newAttackerState.currentHp = Math.min(newAttackerState.derivedStats.HP, newAttackerState.currentHp + result.lifestealAmount);
        const attackerSide = newAttackerState.id === player.id ? 'player' : (newAttackerState.id === player.activePetId ? 'pet' : 'enemy');
        addFloatingText(result.lifestealAmount.toString(), 'lifesteal', attackerSide);
    }

    if(result.elementalEffect) {
        const side = isPlayerSideDefender ? (newDefenderState.id === player.id ? 'player' : 'pet') : 'enemy';
        addFloatingText(result.elementalEffect, result.elementalEffect, side);
    }

    if (result.appliedEffects.length > 0) {
        newDefenderState.activeEffects = [...newDefenderState.activeEffects, ...result.appliedEffects];
    }

    updateMultipleParticipantsState([newAttackerState, newDefenderState]);

    if (newDefenderState.currentHp <= 0) {
        addToLog(`${newDefenderState.name} đã bị đánh bại!`, 'system');
        const remainingEnemies = participantsRef.current.filter(p => p.id !== player.id && p.id !== player.activePetId && p.id !== player.activeRetainerId && p.currentHp > 0 && p.id !== newDefenderState.id);
        if (remainingEnemies.length === 0) {
             setTimeout(() => endCombat(true), 500);
        } else {
             // Check if only minions remain for an immune boss, if so, something is wrong, end combat
             const nonMinionEnemies = remainingEnemies.filter(p => p.name !== 'Thánh Trí Mảnh Vỡ');
             if (nonMinionEnemies.length === 0) {
                setTimeout(() => endCombat(true), 500);
             }
        }
    }
  }, [addToLog, endCombat, addFloatingText, updateMultipleParticipantsState, player.id, player.activePetId, player.activeRetainerId]);


useEffect(() => {
    if (isCombatOver || combatEndedRef.current || participants.length === 0 || isPlayerTurn) {
        return; 
    }

    const actionDelay = 1000;

    const performAIAction = async () => {
        if (combatEndedRef.current) return;

        const currentParticipants = participantsRef.current;
        const attacker = currentParticipants.find(p => p.id === participants[turnIndex]?.id);

        if (!attacker || attacker.currentHp <= 0) {
            nextTurn();
            return;
        }

        const isPlayerSideAttacker = attacker.id === player.activePetId || attacker.id === player.activeRetainerId;
        let potentialTargets = currentParticipants.filter(p => p.currentHp > 0);
        
        if (isPlayerSideAttacker) {
            potentialTargets = potentialTargets.filter(p => p.id !== player.id && p.id !== player.activePetId && p.id !== player.activeRetainerId);
        } else {
            potentialTargets = potentialTargets.filter(p => p.id === player.id || p.id === player.activePetId || p.id === player.activeRetainerId);
        }

        if (potentialTargets.length === 0) {
             // This case means the battle should be over, but let's just advance the turn to be safe
            nextTurn();
            return;
        }

        const target = potentialTargets.sort((a, b) => a.currentHp - b.currentHp)[0];
        
        let skillToUse: Skill | undefined = undefined;
        let attackerAfterAction = { ...attacker };

        const usableSkills = attacker.skills.filter(s => s.type === SkillType.ACTIVE && (!s.mpCost || ('currentMp' in attacker && attacker.currentMp >= s.mpCost)));
        if (usableSkills.length > 0 && Math.random() < 0.6) {
            skillToUse = usableSkills[Math.floor(Math.random() * usableSkills.length)];
            if (skillToUse.mpCost && 'currentMp' in attackerAfterAction) {
                attackerAfterAction.currentMp -= skillToUse.mpCost;
            }
        }

        const finalTarget = currentParticipants.find(p => p.id === target.id);
        if (!finalTarget || finalTarget.currentHp <= 0) { // Re-validate target
             nextTurn();
             return;
        }

        const result = skillToUse 
            ? useSkill(attackerAfterAction, finalTarget, skillToUse)
            : performAttack(attackerAfterAction, finalTarget);

        await processAction(result, attackerAfterAction, finalTarget, skillToUse);

        if (!combatEndedRef.current) setTimeout(nextTurn, 500);
    };

    setTimeout(performAIAction, actionDelay);
    
}, [turnIndex, participants, isCombatOver, isPlayerTurn, nextTurn, player.id, player.activePetId, player.activeRetainerId, processAction]);

  const handleAttack = () => {
      if (!playerInCombat || !enemyInCombat) return;
      const result = performAttack(playerInCombat, enemyInCombat);
      processAction(result, playerInCombat, enemyInCombat);
      if (!combatEndedRef.current) setTimeout(nextTurn, 500);
  };

  const handleUseSkill = (skill: Skill) => {
      if (!playerInCombat || !enemyInCombat) return;
      const newPlayer = {...playerInCombat};
      if (skill.mpCost && newPlayer.currentMp < skill.mpCost) {
          addToLog("Không đủ MP!", 'error');
          return;
      }
      if (skill.mpCost) {
          newPlayer.currentMp -= skill.mpCost;
      }
      
      const result = useSkill(newPlayer, enemyInCombat, skill);
      processAction(result, newPlayer, enemyInCombat, skill);
      setShowSkillList(false);
      if (!combatEndedRef.current) setTimeout(nextTurn, 500);
  };

  const canCatchPet = useMemo(() => {
    if (!playerInCombat || !enemyInCombat) return false;
    if (enemyInCombat.isBoss || enemyInCombat.isHumanoid) return false;
    return (playerInCombat.consumables[UpgradeConsumable.LINH_THU_PHU] || 0) > 0;
  }, [playerInCombat, enemyInCombat]);

  const canEnslave = useMemo(() => {
    if (!playerInCombat || !enemyInCombat) return false;
    const hpPercent = enemyInCombat.currentHp / enemyInCombat.derivedStats.HP;
    return enemyInCombat.isHumanoid && hpPercent < 0.2 && (playerInCombat.consumables[UpgradeConsumable.HON_AN_PHU] || 0) > 0;
  }, [playerInCombat, enemyInCombat]);

  const linhThuPhuCount = playerInCombat?.consumables[UpgradeConsumable.LINH_THU_PHU] || 0;
  const honAnPhuCount = playerInCombat?.consumables[UpgradeConsumable.HON_AN_PHU] || 0;

  const handleCatchAttempt = async () => {
    if (!canCatchPet) return;
    const result = await handleCatchPet();
    addToLog(result.message, result.success ? 'info' : 'action');
    if (!result.success) {
        if (!combatEndedRef.current) setTimeout(nextTurn, 500);
    }
  };

  const handleEnslaveAttempt = async () => {
      if (!canEnslave) return;
      const result = await handleEnslaveTarget();
      addToLog(result.message, result.success ? 'info' : 'action');
      if (!result.success) {
          if (!combatEndedRef.current) setTimeout(nextTurn, 500);
      }
  };
  
  const handleRunAway = () => {
    if (window.confirm("Bỏ chạy sẽ khiến bạn mất một lượng nhỏ EXP. Bạn có chắc không?")) {
        endCombat(false);
    }
  }

  if (isCombatOver) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-purple-500/30 text-center">
                <h1 className="text-4xl font-bold mb-4">{playerWon ? "Chiến Thắng!" : "Thất Bại"}</h1>
                {playerWon && rewards && (
                    <div className="space-y-3 text-left">
                        <p className="text-lg text-yellow-300">EXP nhận được: <span className="font-bold">{rewards.exp}</span></p>
                        {rewards.items.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-cyan-300">Vật phẩm rơi ra:</h3>
                                <div className="pl-4 space-y-1">
                                    {rewards.items.map(item => <p key={item.id} className="text-sm">{item.name}</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!playerWon && <p className="text-gray-400">Bạn đã bị đánh bại. Hãy mạnh mẽ hơn và thử lại!</p>}
                 <button onClick={handleContinueAfterCombat} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                    Tiếp tục
                </button>
            </div>
        </div>
    );
  }


  if (participants.length === 0) {
    const activePet = player.pets.find(p => p.id === player.activePetId);
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 animate-fade-in"
             style={{ backgroundImage: `url('https://i.pinimg.com/originals/a3/52/65/a35265a7593a1136293521d74a0063c8.gif')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-4xl text-center">
                <div className="grid grid-cols-3 items-center gap-4">
                    <div className="flex flex-col items-center gap-4 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
                        <img src={player.imageUrl || 'https://via.placeholder.com/150'} alt={player.name} className="w-40 h-40 rounded-full border-4 border-cyan-500 shadow-lg object-cover" />
                        <h2 className="text-2xl font-bold text-cyan-300">{player.name}</h2>
                        {activePet && (
                            <div className="flex items-center gap-2 mt-2 opacity-80">
                                <img src={activePet.imageUrl || 'https://via.placeholder.com/50'} alt={activePet.name} className="w-12 h-12 rounded-full border-2 border-green-500 object-cover" />
                                <span className="text-lg font-semibold text-green-300">{activePet.name}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-6xl font-extrabold text-red-500 animate-pulse drop-shadow-[0_0_15px_#ef4444]">VS</div>
                    <div className="flex flex-col items-center gap-4 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
                         <img src={initialEnemy.imageUrl || 'https://via.placeholder.com/150'} alt={initialEnemy.name} className="w-40 h-40 rounded-full border-4 border-red-500 shadow-lg object-cover" />
                        <h2 className="text-2xl font-bold text-red-300">{initialEnemy.name}</h2>
                    </div>
                </div>
                <div className="mt-12 flex items-center justify-center gap-3 text-xl text-gray-300 animate-pulse">
                     <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            </div>
        </div>
    );
  }
};
