


import React, { useState } from 'react';
// Fix: Corrected import path for types.
import { useGame } from '../contexts/GameContext';
import { CultivationTechnique, CultivationTechniqueType } from '../types';

const TechniqueCard: React.FC<{ 
    technique: CultivationTechnique, 
    isActive: boolean,
    canLevelUp: boolean,
    levelUpCost: number,
    onActivate: () => void,
    onLevelUp: () => Promise<void>
}> = ({ technique, isActive, canLevelUp, levelUpCost, onActivate, onLevelUp }) => {
    const [isLevelingUp, setIsLevelingUp] = useState(false);

    const handleLevelUpClick = async () => {
        setIsLevelingUp(true);
        await onLevelUp();
        setIsLevelingUp(false);
    };

    return (
        <div className={`bg-gray-800/60 p-4 rounded-lg border-2 shadow-lg transition-all duration-300 flex flex-col justify-between ${isActive ? 'border-yellow-400 shadow-yellow-500/20' : 'border-purple-500/30'}`}>
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-purple-300">{technique.name}</h3>
                    <span className="text-sm font-semibold text-gray-300">Tầng {technique.level}/{technique.maxLevel}</span>
                </div>
                <p className="text-sm text-gray-400 italic my-2">"{technique.description}"</p>
                <div className="border-t border-gray-700 pt-2 mt-2">
                    <h4 className="font-semibold text-gray-200 mb-1">Chỉ số cộng thêm (Tầng hiện tại):</h4>
                    <div className="space-y-1 text-sm">
                        {technique.bonuses.map((bonus, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-gray-300">{bonus.stat}:</span>
                                <span className="font-mono text-green-400">+{bonus.value.toFixed(2)}{bonus.isPercent ? '%' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                {technique.level < technique.maxLevel && (
                    <div className="p-2 bg-black/20 rounded-md text-center">
                         <p className="text-xs text-gray-400">Nâng cấp: {levelUpCost.toLocaleString()} EXP</p>
                        <button onClick={handleLevelUpClick} disabled={!canLevelUp || isLevelingUp} className="w-full mt-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isLevelingUp ? 'Đang tu luyện...' : 'Tu Luyện'}
                        </button>
                    </div>
                )}
                 {isActive ? (
                    <p className="text-center font-bold text-yellow-400 bg-yellow-900/50 py-2 rounded-lg">ĐANG VẬN CHUYỂN</p>
                ) : (
                    <button onClick={onActivate} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition">
                        Kích Hoạt
                    </button>
                )}
            </div>
        </div>
    );
};


const CultivationScreen: React.FC = () => {
    const { character, handleActivateCultivationTechnique, handleLevelUpCultivationTechnique } = useGame();
    const [activeFilter, setActiveFilter] = useState<CultivationTechniqueType | 'all'>('all');

    if (!character) return null;

    const { learnedCultivationTechniques, activeCultivationTechniqueId, exp } = character;

    const onLevelUp = async (techniqueId: string) => {
        await handleLevelUpCultivationTechnique(techniqueId);
    }
    
    const filteredTechniques = activeFilter === 'all' 
        ? learnedCultivationTechniques
        : learnedCultivationTechniques.filter(t => t.type === activeFilter);
        
    const techniqueTypes = Object.values(CultivationTechniqueType);

    return (
        <div className="max-h-[70vh] overflow-y-auto pr-3">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">Công Pháp Đã Lĩnh Hội</h2>

            <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-900/50 rounded-lg">
                <button onClick={() => setActiveFilter('all')} className={`px-3 py-1 text-sm rounded-md transition ${activeFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Tất Cả</button>
                {techniqueTypes.map((type: CultivationTechniqueType) => (
                     <button key={type} onClick={() => setActiveFilter(type)} className={`px-3 py-1 text-sm rounded-md transition ${activeFilter === type ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{type}</button>
                ))}
            </div>

            {filteredTechniques.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTechniques.map(tech => {
                        const levelUpCost = 100 * Math.pow(tech.level, 1.8);
                        return (
                            <TechniqueCard 
                                key={tech.id} 
                                technique={tech} 
                                isActive={tech.id === activeCultivationTechniqueId}
                                onActivate={() => handleActivateCultivationTechnique(tech.id)}
                                onLevelUp={() => onLevelUp(tech.id)}
                                canLevelUp={exp >= levelUpCost}
                                levelUpCost={levelUpCost}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="text-center text-gray-500 p-10 mt-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg text-gray-400">Bạn chưa học được công pháp loại này.</p>
                    <p className="mt-2 text-gray-500">Hãy đánh bại kẻ địch hoặc khám phá thế giới để tìm bí kíp công pháp.</p>
                </div>
            )}
        </div>
    );
};

export default CultivationScreen;