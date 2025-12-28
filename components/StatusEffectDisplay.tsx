import React from 'react';
import { ActiveEffect, SkillEffectType } from '../types';

const getEffectIcon = (type: SkillEffectType): string => {
    switch (type) {
        case SkillEffectType.BUFF: return '⬆️';
        case SkillEffectType.DEBUFF: return '⬇️';
        case SkillEffectType.DOT: return '🔥';
        case SkillEffectType.HOT: return '💚';
        case SkillEffectType.STUN: return '💫';
        case SkillEffectType.DISABLE_SKILL: return '🚫';
        default: return '🌀';
    }
};

const EffectIcon: React.FC<{ effect: ActiveEffect }> = ({ effect }) => {
    const icon = getEffectIcon(effect.effect.type);

    return (
        <div className="relative group flex-shrink-0" aria-label={`Status Effect: ${effect.effect.description}`}>
            <span className="text-xl sm:text-2xl cursor-pointer drop-shadow-lg">{icon}</span>
            <div 
                role="tooltip"
                className="absolute bottom-full mb-2 w-48 bg-black/90 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 left-1/2 -translate-x-1/2 backdrop-blur-sm border border-white/20"
            >
                <p className="font-bold text-purple-300 break-words">Từ: {effect.sourceSkillName}</p>
                <p className="mt-1 break-words">{effect.effect.description}</p>
                <p className="mt-1 text-yellow-300">Còn {effect.remainingTurns} lượt.</p>
            </div>
        </div>
    );
};


const StatusEffectDisplay: React.FC<{ effects: ActiveEffect[] }> = ({ effects }) => {
    if (!effects || effects.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 items-center justify-center">
            {effects.map((effect) => (
                <EffectIcon key={effect.id} effect={effect} />
            ))}
        </div>
    );
};

export default StatusEffectDisplay;
