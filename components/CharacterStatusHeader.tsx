


import React from 'react';
// Fix: Corrected import path for types.
import { Character } from '../types';
import { useGame } from '../contexts/GameContext';
import StatusEffectDisplay from './StatusEffectDisplay';

const StatBar: React.FC<{ current: number, max: number, barGradient: string, label: string, labelColor: string }> = ({ current, max, barGradient, label, labelColor }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="flex items-center gap-2">
            <div className={`flex-shrink-0 w-12 text-center text-sm font-bold px-2 py-1 rounded-md text-white ${labelColor}`}>
                {label}
            </div>
            <div className="flex-grow bg-black/50 rounded-full h-5 relative overflow-hidden border border-white/10">
                <div className={`h-full rounded-full transition-all duration-300 ${barGradient}`} style={{ width: `${percentage}%` }}></div>
                <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-semibold text-white" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.8)' }}>
                    <span>{Math.round(current).toLocaleString()} / {max.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

const ExpBar: React.FC<{ current: number, max: number }> = ({ current, max }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-12 text-center text-sm font-bold px-2 py-1 rounded-md text-white bg-gray-600">
                EXP
            </div>
            <div className="flex-grow bg-black/50 rounded-full h-5 relative overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const CharacterStatusHeader: React.FC<{ character: Character }> = ({ character }) => {
    const { appSettings } = useGame();
    
    const characterNameStyle: React.CSSProperties = {
        fontFamily: `'${appSettings.displaySettings.characterName.font}', sans-serif`,
        fontSize: appSettings.displaySettings.characterName.size,
        color: appSettings.displaySettings.characterName.textColor,
    };

    return (
        <div className="bg-[var(--color-backdrop-bg)] p-3 rounded-xl border border-[var(--color-border-base)] backdrop-blur-sm shadow-lg flex items-center gap-4 w-fit">
            <div className="flex-shrink-0">
                <h2 className="font-bold text-xl truncate" style={characterNameStyle}>{character.name}</h2>
                <p className="text-sm text-[var(--color-text-medium)]">Cấp {character.level} {character.playerClass}</p>
            </div>
            
            <div className="space-y-1.5 w-60">
                <StatBar current={character.currentHp} max={character.derivedStats.HP} barGradient="bg-gradient-to-r from-red-500 to-red-700" label="HP" labelColor="bg-red-600" />
                <StatBar current={character.currentMp} max={character.derivedStats.MP} barGradient="bg-gradient-to-r from-blue-500 to-blue-700" label="MP" labelColor="bg-blue-600" />
                <ExpBar current={character.exp} max={character.expToNextLevel} />
            </div>
            {character.activeEffects.length > 0 && (
                 <div className="border-l-2 border-[var(--color-border-base)] pl-4 ml-2">
                     <StatusEffectDisplay effects={character.activeEffects} />
                </div>
            )}
        </div>
    );
};

export default CharacterStatusHeader;