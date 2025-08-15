import React, { useMemo } from 'react';
import type { KnownEntities, EntityType } from './types.ts';
import { getIconForEntity } from './utils.ts';

export const InteractiveText: React.FC<{
    text: string;
    onEntityClick: (entityName: string) => void;
    knownEntities: KnownEntities;
}> = ({ text, onEntityClick, knownEntities }) => {
    const typeColors: { [key in EntityType | string]: string } = {
        pc: 'text-yellow-700 dark:text-yellow-400 font-bold',
        npc: 'text-blue-700 dark:text-blue-400 font-semibold',
        companion: 'text-blue-700 dark:text-blue-400 font-semibold',
        location: 'text-green-700 dark:text-green-400 font-semibold',
        faction: 'text-red-700 dark:text-red-500 font-semibold',
        item: 'am-kim', // custom class
        skill: 'am-kim', // custom class
        concept: 'text-purple-700 dark:text-purple-400 font-semibold'
    };

    const entityNames = useMemo(() =>
        Object.keys(knownEntities).sort((a, b) => b.length - a.length),
        [knownEntities]
    );

    const regex = useMemo(() => {
        if (entityNames.length === 0) {
            return /(\`.*?\`|\*\*⭐.*?\*⭐\*\*)/g;
        }
        const escapedNames = entityNames.map(name =>
            name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        );
        return new RegExp(`(${escapedNames.join('|')}|` + '`.*?`' + `|` + '\\*\\*⭐.*?⭐\\*\\*' + `)`, 'g');
    }, [entityNames]);

    const parts = text.split(regex);

    return (
        <div className="text-slate-900 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (!part) return null;

                const isEntity = knownEntities[part];
                const isThought = part.startsWith('`') && part.endsWith('`');
                const isAnnouncement = part.startsWith('**⭐') && part.endsWith('⭐**');

                if (isAnnouncement) {
                     return (
                        <div key={index} className="my-2 p-3 bg-yellow-400/10 dark:bg-yellow-500/10 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-r-md">
                            <p className="font-semibold text-yellow-700 dark:text-yellow-200">
                               <span className="mr-2">⭐</span>
                               {part.slice(3, -3).trim()}
                            </p>
                        </div>
                    );
                }

                if (isEntity) {
                    const entity = knownEntities[part];
                    const styleClass = typeColors[entity.type] || 'text-slate-900 dark:text-white font-semibold';
                    return (
                        <span
                            key={index}
                            onClick={() => onEntityClick(part)}
                            className={`${styleClass} cursor-pointer hover:underline transition-all`}
                        >
                            <span className="inline-block w-[1em] h-[1em] align-middle -mt-px mr-1.5">{getIconForEntity(entity)}</span>
                            {part}
                        </span>
                    );
                }
                
                if (isThought) {
                    return <i key={index} className="text-slate-600 dark:text-slate-400">{part.slice(1, -1)}</i>;
                }

                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};
