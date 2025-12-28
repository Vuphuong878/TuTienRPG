
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// Fix: Corrected import paths for types and constants.
import { Character, Stat, Skill, SkillType, DerivedStats, BaseStats, SkillEffectType, TargetType, Element } from '../types';
import { getActiveSetBonuses, calculateBonusStatsFromEquipment, calculateBaseStatBonusesFromEquipment } from '../services/gameLogic';
import { ELEMENT_ICONS, ELEMENT_COLORS } from '../constants';
import { useGame } from '../contexts/GameContext';

interface CharacterSheetProps {
  character: Character;
}

// Helper to explain stats
const getStatTooltip = (stat: string): string => {
    switch(stat) {
        case 'STR': return 'Sức Mạnh: Tăng Vật Công (ATK) và Thủ Vật Lý (DEF).';
        case 'AGI': return 'Nhanh Nhẹn: Tăng Tốc Độ (Speed) và Né Tránh (Evasion).';
        case 'INT': return 'Trí Tuệ: Tăng Phép (MATK).';
        case 'SPI': return 'Tinh Thần: Tăng MP tối đa và Phép (MATK).';
        case 'CON': return 'Thể Chất: Tăng HP tối đa và Thủ Vật Lý (DEF).';
        case 'DEX': return 'Khéo Léo: Tăng Chính Xác (Accuracy), Chí Mạng (Crit) và Xuyên Giáp.';
        default: return '';
    }
}

// Memoized StatItem to prevent re-renders when other parts of the sheet update
// Updated to accept a generic handler to avoid inline function creation in parent
const StatItem: React.FC<{ 
    label: string; 
    statKey: string; 
    value: number; 
    bonus: number; 
    icon: React.ReactNode; 
    onAllocate?: (stat: string) => void; 
    canAllocate: boolean; 
}> = React.memo(({ label, statKey, value, bonus, icon, onAllocate, canAllocate }) => {
    
    const handleAllocate = useCallback(() => {
        if (onAllocate) {
            onAllocate(statKey);
        }
    }, [onAllocate, statKey]);

    return (
        <div title={getStatTooltip(statKey)} className="group flex items-center justify-between bg-gray-800/40 p-2.5 rounded-lg border border-white/5 hover:border-[var(--color-primary)] hover:bg-gray-800/80 transition-all cursor-help relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex items-center space-x-3 relative z-10">
                <span className="text-[var(--color-primary-light)] text-xl drop-shadow filter">{icon}</span>
                <div>
                    <span className="text-gray-300 font-bold text-sm block">{label}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{statKey}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="text-right">
                    <div className="font-mono font-bold text-white text-lg leading-none">{value}</div>
                    {bonus > 0 && <div className="text-green-400 text-[10px] font-mono">+{bonus} trang bị</div>}
                </div>
                {canAllocate && (
                    <button onClick={handleAllocate} className="bg-yellow-600 hover:bg-yellow-500 rounded-md w-7 h-7 flex items-center justify-center font-bold text-lg text-black shadow-lg transition-transform transform hover:scale-110 active:scale-95">
                        +
                    </button>
                )}
            </div>
        </div>
    );
});


// Memoized SkillItem
const SkillItem: React.FC<{ skill: Skill }> = React.memo(({ skill }) => (
    <div className="bg-gray-800/40 p-3 rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
             <span className="text-4xl">{skill.type === SkillType.ACTIVE ? '⚡' : '🛡️'}</span>
        </div>
        
        <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
                 {skill.element && skill.element !== Element.VO && (
                    <span className={`text-lg ${ELEMENT_COLORS[skill.element]}`} title={`Hệ: ${skill.element}`}>
                        {ELEMENT_ICONS[skill.element]}
                    </span>
                )}
                <div>
                    <h4 className={`font-bold text-sm ${skill.type === SkillType.ACTIVE ? 'text-cyan-300' : 'text-green-300'} group-hover:text-white transition-colors`}>{skill.name}</h4>
                    <div className="flex gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span>{skill.type === SkillType.ACTIVE ? 'Chủ động' : 'Bị động'}</span>
                        {skill.mpCost && <span className="text-blue-400 font-mono">• {skill.mpCost} MP</span>}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-400 italic line-clamp-2 border-l-2 border-gray-600 pl-2">
            {skill.description}
        </div>
        
        <div className="mt-2 space-y-1">
            {skill.effects.map((effect, index) => (
                 <div key={index} className="text-[10px] text-gray-300 bg-black/20 px-2 py-1 rounded inline-block mr-1">
                    {effect.description}
                 </div>
            ))}
        </div>
    </div>
));

// Optimized SkillList with React.memo and useMemo for filtering
const SkillList: React.FC<{ skills: Skill[] }> = React.memo(({ skills }) => {
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PASSIVE'>('ALL');

    const filteredSkills = useMemo(() => {
        if (filter === 'ALL') return skills;
        if (filter === 'ACTIVE') return skills.filter(s => s.type === SkillType.ACTIVE);
        return skills.filter(s => s.type === SkillType.PASSIVE);
    }, [skills, filter]);

    return (
        <div>
            <div className="flex gap-2 mb-3 bg-gray-900/50 p-1 rounded-lg w-fit">
                <button onClick={() => setFilter('ALL')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filter === 'ALL' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}>Tất cả</button>
                <button onClick={() => setFilter('ACTIVE')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filter === 'ACTIVE' ? 'bg-cyan-700 text-white' : 'text-gray-400 hover:text-white'}`}>Chủ động</button>
                <button onClick={() => setFilter('PASSIVE')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filter === 'PASSIVE' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}>Bị động</button>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {filteredSkills.length > 0 ? (
                    filteredSkills.map(skill => <SkillItem key={skill.id} skill={skill} />)
                ) : (
                    <p className="text-gray-500 text-sm italic text-center py-4">Không tìm thấy kỹ năng phù hợp.</p>
                )}
            </div>
        </div>
    );
});

// Component for Highlighting Primary Stats (ATK, DEF, SPD)
const PrimaryStatBox: React.FC<{ label: string; value: number; subValue?: string; icon: string; color: string }> = React.memo(({ label, value, subValue, icon, color }) => (
    <div className={`bg-gray-800/60 p-3 rounded-lg border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group`}>
        <div className={`absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity ${color.replace('text-', 'bg-')}`}></div>
        <span className="text-2xl mb-1 filter drop-shadow-md">{icon}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{label}</span>
        <span className={`text-xl font-mono font-bold ${color}`}>{value.toLocaleString()}</span>
        {subValue && <span className="text-[10px] text-gray-500">{subValue}</span>}
    </div>
));

// Component for Secondary Stats (Crit, Eva, etc.)
const SecondaryStatRow: React.FC<{ label: string; value: string; icon: string; change?: 'increase' | 'decrease' }> = React.memo(({ label, value, icon, change }) => {
    const changeClass = change === 'increase' ? 'text-green-400' : (change === 'decrease' ? 'text-red-400' : 'text-white');
    return (
        <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">{icon}</span>
                <span className="text-sm text-gray-400">{label}</span>
            </div>
            <span className={`font-mono font-bold text-sm ${changeClass}`}>{value}</span>
        </div>
    );
});


const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
    const { handleAllocateStatPoint } = useGame();
    const { name, playerClass, level, exp, expToNextLevel, realm, baseStats, derivedStats, backstory, equipment, skills, linhCan, unallocatedStatPoints, classDefinition, imageUrl } = character;
    const expPercentage = (exp / expToNextLevel) * 100;
    
    // Memoize set bonuses calculation to avoid it on every render (e.g. during HP updates)
    const activeSetBonuses = useMemo(() => getActiveSetBonuses(equipment), [equipment]);

    const equipmentBaseStatBonuses = useMemo(() => calculateBaseStatBonusesFromEquipment(equipment), [equipment]);

    const [statChanges, setStatChanges] = useState<{ [key: string]: 'increase' | 'decrease' }>({});
    const prevStatsRef = useRef<DerivedStats | null>(null);
    
    const isCustomClass = !!classDefinition;
    const canAllocate = isCustomClass && (unallocatedStatPoints || 0) > 0;

    // Wrap the handler to ensure type safety with the StatItem component
    const onStatAllocate = useCallback((statKey: string) => {
        handleAllocateStatPoint(statKey as keyof BaseStats);
    }, [handleAllocateStatPoint]);

    useEffect(() => {
        if (prevStatsRef.current) {
            const changes: { [key: string]: 'increase' | 'decrease' } = {};
            (Object.keys(character.derivedStats) as Array<keyof DerivedStats>).forEach(statKey => {
                const prevValue = prevStatsRef.current![statKey as keyof DerivedStats];
                const currentValue = character.derivedStats[statKey as keyof DerivedStats];
                if (typeof prevValue === 'number' && typeof currentValue === 'number') {
                    if (prevValue < currentValue) changes[statKey] = 'increase';
                    else if (prevValue > currentValue) changes[statKey] = 'decrease';
                }
            });
            if (Object.keys(changes).length > 0) {
                setStatChanges(changes);
                const timer = setTimeout(() => setStatChanges({}), 1000);
                return () => clearTimeout(timer);
            }
        }
        prevStatsRef.current = character.derivedStats;
    }, [character.derivedStats]);

    // Stat Icons
    const statIcons = useMemo(() => ({
        STR: <span title="Sức Mạnh">💪</span>,
        AGI: <span title="Nhanh Nhẹn">🦶</span>,
        INT: <span title="Trí Tuệ">🧠</span>,
        SPI: <span title="Tinh Thần">👁️</span>,
        CON: <span title="Thể Chất">❤️</span>,
        DEX: <span title="Khéo Léo">🎯</span>,
    }), []);

return (
    <div className="bg-[var(--color-bg-secondary)] text-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-[var(--color-primary)] relative overflow-hidden w-full max-w-6xl mx-auto space-y-6">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none"></div>
        
        {/* Header Section */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-[var(--color-border-base)] pb-6">
             <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)] overflow-hidden bg-black flex-shrink-0">
                 <img src={imageUrl || 'https://via.placeholder.com/150'} alt={name} className="w-full h-full object-cover" />
             </div>
             
             <div className="flex-grow text-center md:text-left w-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white drop-shadow-md">{name}</h2>
                    <div className="flex gap-2 mt-2 md:mt-0">
                        <span className="px-3 py-1 bg-[var(--color-bg-tertiary)] rounded-full text-xs font-bold uppercase tracking-wider">{playerClass}</span>
                        <span className="px-3 py-1 bg-yellow-900/40 border border-yellow-600/30 rounded-full text-yellow-400 font-bold text-xs">Cấp {level}</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="text-2xl animate-pulse">⚡</span>
                    <p className="text-xl font-semibold text-[var(--color-primary-light)] font-serif italic">{realm.name} <span className="text-sm not-italic text-gray-400">Tầng {realm.level}</span></p>
                </div>

                <div className="w-full bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">
                        <span>Kinh Nghiệm Tu Vi</span>
                        <span>{Math.floor(expPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-[var(--color-primary)] to-purple-400 h-full rounded-full shadow-[0_0_10px_var(--color-primary)] transition-all duration-500" style={{ width: `${expPercentage}%` }}></div>
                    </div>
                    <div className="text-right text-[10px] text-gray-500 mt-1 font-mono">
                        {exp.toLocaleString()} / {expToNextLevel.toLocaleString()} EXP
                    </div>
                </div>
             </div>
        </div>
        
        {backstory && <p className="text-center text-sm text-gray-400 italic bg-black/20 p-3 rounded-lg border-l-2 border-[var(--color-primary)] relative z-10 mx-auto max-w-4xl">"{backstory}"</p>}

        {canAllocate && (
            <div className="flex items-center justify-center gap-2 bg-yellow-900/20 border border-yellow-500/30 text-yellow-200 p-2 rounded-lg animate-pulse relative z-10">
                <span className="text-xl">✨</span>
                <span className="font-bold">Bạn có {unallocatedStatPoints} điểm tiềm năng!</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Left Column: Base Stats & Linh Can (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
                {linhCan && (
                    <div className="p-3 rounded-xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-black/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex text-2xl gap-1 filter drop-shadow">
                                {linhCan.elements.map(el => <span key={el} className={ELEMENT_COLORS[el]}>{ELEMENT_ICONS[el]}</span>)}
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide">{linhCan.quality} Linh Căn</h3>
                        </div>
                        <p className="text-xs text-gray-400 italic">"{linhCan.description}"</p>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-bold mb-3 text-gray-400 uppercase tracking-widest border-b border-gray-700 pb-1">Chỉ số Gốc</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <StatItem label="Sức Mạnh" statKey="STR" value={baseStats.STR} bonus={equipmentBaseStatBonuses.STR || 0} icon={statIcons.STR} canAllocate={canAllocate} onAllocate={onStatAllocate} />
                        <StatItem label="Nhanh Nhẹn" statKey="AGI" value={baseStats.AGI} bonus={equipmentBaseStatBonuses.AGI || 0} icon={statIcons.AGI} canAllocate={canAllocate} onAllocate={onStatAllocate} />
                        <StatItem label="Trí Tuệ" statKey="INT" value={baseStats.INT} bonus={equipmentBaseStatBonuses.INT || 0} icon={statIcons.INT} canAllocate={canAllocate} onAllocate={onStatAllocate} />
                        <StatItem label="Tinh Thần" statKey="SPI" value={baseStats.SPI} bonus={equipmentBaseStatBonuses.SPI || 0} icon={statIcons.SPI} canAllocate={canAllocate} onAllocate={onStatAllocate} />
                        <StatItem label="Thể Chất" statKey="CON" value={baseStats.CON} bonus={equipmentBaseStatBonuses.CON || 0} icon={statIcons.CON} canAllocate={canAllocate} onAllocate={onStatAllocate} />
                        <StatItem label="Khéo Léo" statKey="DEX" value={baseStats.DEX} bonus={equipmentBaseStatBonuses.DEX || 0} icon={statIcons.DEX} canAllocate={canAllocate} onAllocate={onStatAllocate} />
                    </div>
                </div>
            </div>

            {/* Middle Column: Combat Stats (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
                <h3 className="text-sm font-bold mb-3 text-gray-400 uppercase tracking-widest border-b border-gray-700 pb-1">Thuộc tính Chiến Đấu</h3>
                
                {/* Primary Combat Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-4">
                    <PrimaryStatBox label="Vật Công" value={derivedStats.ATK} icon="⚔️" color="text-red-400" />
                    <PrimaryStatBox label="Phép Thuật" value={derivedStats.MATK} icon="🔮" color="text-blue-400" />
                    <PrimaryStatBox label="Phòng Thủ" value={derivedStats.DEF} icon="🛡️" color="text-yellow-400" />
                    <PrimaryStatBox label="Tốc Độ" value={derivedStats.Speed} icon="👟" color="text-green-400" />
                </div>

                {/* Secondary Stats Grouped */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                        <h4 className="text-xs font-bold text-red-300 uppercase mb-2">Tấn Công</h4>
                        <SecondaryStatRow label="Chí Mạng" value={`${derivedStats.CRIT_RATE.toFixed(1)}%`} icon="💥" change={statChanges['CRIT_RATE']} />
                        <SecondaryStatRow label="Xuyên Giáp" value={`${derivedStats.PENETRATION.toFixed(1)}%`} icon="🏹" change={statChanges['PENETRATION']} />
                        <SecondaryStatRow label="Chính Xác" value={`${derivedStats.ACCURACY.toFixed(1)}%`} icon="🎯" change={statChanges['ACCURACY']} />
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                        <h4 className="text-xs font-bold text-blue-300 uppercase mb-2">Phòng Thủ</h4>
                        <SecondaryStatRow label="Né Tránh" value={`${derivedStats.EVASION.toFixed(1)}%`} icon="💨" change={statChanges['EVASION']} />
                        <SecondaryStatRow label="Hút Máu" value={`${derivedStats.LIFESTEAL.toFixed(1)}%`} icon="🧛" change={statChanges['LIFESTEAL']} />
                        <SecondaryStatRow label="Sinh Lực" value={derivedStats.HP.toLocaleString()} icon="❤️" change={statChanges['HP']} />
                    </div>
                </div>
            </div>

            {/* Right Column: Skills & Sets (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
                 <div>
                    <h3 className="text-sm font-bold mb-3 text-gray-400 uppercase tracking-widest border-b border-gray-700 pb-1">Kỹ Năng</h3>
                    <SkillList skills={skills} />
                </div>

                <div>
                    <h3 className="text-sm font-bold mb-3 text-gray-400 uppercase tracking-widest border-b border-gray-700 pb-1">Bộ Trang Bị</h3>
                    {activeSetBonuses.length > 0 ? (
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {activeSetBonuses.map(set => (
                                <div key={set.setName} className="bg-purple-900/20 p-2 rounded-lg border border-purple-500/30">
                                    <h4 className="text-purple-300 font-bold text-xs">{set.setName} <span className="text-[10px] font-normal text-gray-400">({set.pieceCount}/{set.totalPieces})</span></h4>
                                    <ul className="mt-1 space-y-1">
                                        {set.bonuses.map(({ bonus, active }) => (
                                            <li key={bonus.pieces} className={`text-[10px] ${active ? 'text-green-300' : 'text-gray-600'}`}>
                                                [{bonus.pieces} món] {bonus.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-xs text-center py-2">Chưa kích hoạt bộ nào.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);
};

export default CharacterSheet;
