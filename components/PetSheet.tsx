



import React from 'react';
import { Pet, Stat, Skill, SkillType } from '../types';

const StatItem: React.FC<{ label: string; value: number | string; icon?: string; }> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md">
        <span className="text-gray-300 font-semibold">{label}</span>
        <span className="font-mono text-white">{value}</span>
    </div>
);

const SkillItem: React.FC<{ skill: Skill }> = ({ skill }) => (
    <div className="bg-gray-800/50 p-2 rounded-md">
        <h4 className={`font-bold text-sm ${skill.type === SkillType.ACTIVE ? 'text-cyan-300' : 'text-green-300'}`}>{skill.name}</h4>
        <p className="text-xs text-gray-300 mt-1 italic">"{skill.description}"</p>
    </div>
);


const PetSheet: React.FC<{ pet: Pet; onRename: () => void; }> = ({ pet, onRename }) => {
    const { name, monsterClass, level, exp, expToNextLevel, derivedStats, skills, loyalty, loyaltyDescription, oneWordStatus, imageUrl, isEvolved } = pet;
    const expPercentage = (exp / expToNextLevel) * 100;

    const getLoyaltyColor = (l: number) => {
        if (l > 75) return 'bg-green-500';
        if (l > 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    
    return (
        <div className="bg-gray-900/50 text-white p-4 rounded-2xl shadow-lg border border-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary-dark)] w-full max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {imageUrl && <img src={imageUrl} alt={name} className="w-24 h-24 rounded-full border-4 border-purple-500 object-cover" />}
                <div className="text-center sm:text-left flex-grow">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h2 className={`text-2xl font-bold text-purple-400 ${isEvolved ? 'animate-pulse-glow' : ''}`}>{isEvolved && '🌟 '}{name}</h2>
                        <button onClick={onRename} className="text-sm text-gray-400 hover:text-white">✏️</button>
                    </div>
                    <p className="text-md text-gray-400">{monsterClass} - Cấp {level}</p>
                    <p className="text-lg font-semibold text-yellow-400 mt-1">Trạng thái: {oneWordStatus}</p>
                </div>
            </div>
            
            <p className="text-center text-gray-300 italic bg-black/20 p-3 rounded-lg">"{loyaltyDescription}"</p>

            <div className="space-y-1">
                 <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Độ Trung Thành</span>
                        <span>{loyalty} / 100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className={`${getLoyaltyColor(loyalty)} h-2.5 rounded-full`} style={{ width: `${loyalty}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Kinh nghiệm (EXP)</span>
                        <span>{exp.toLocaleString()} / {expToNextLevel.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${expPercentage}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-200 border-b border-gray-700 pb-1">Thuộc tính</h3>
                    <div className="space-y-1 text-sm">
                        <StatItem label="HP" value={derivedStats.HP.toLocaleString()} />
                        <StatItem label="Tấn công" value={derivedStats.ATK} />
                        <StatItem label="Công phép" value={derivedStats.MATK} />
                        <StatItem label="Phòng thủ" value={derivedStats.DEF.toFixed(2)} />
                        <StatItem label="Tốc độ" value={derivedStats.Speed.toFixed(1)} />
                        <StatItem label="Xuyên giáp" value={derivedStats[Stat.PENETRATION].toFixed(2)} />
                        <StatItem label="Né tránh" value={`${derivedStats[Stat.EVASION].toFixed(2)}%`} />
                        <StatItem label="Chí mạng" value={`${derivedStats[Stat.CRIT_RATE].toFixed(2)}%`} />
                        <StatItem label="Chính xác" value={`${derivedStats[Stat.ACCURACY].toFixed(2)}%`} />
                    </div>
                </div>
            
                {skills?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-200 border-b border-gray-700 pb-1">Kỹ Năng</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {skills.map(skill => <SkillItem key={skill.id} skill={skill} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PetSheet;
