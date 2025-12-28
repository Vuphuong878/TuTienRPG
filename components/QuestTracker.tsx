

import React from 'react';
import { Quest, QuestStatus } from '../types';
import { useGame } from '../contexts/GameContext';

const QuestTracker: React.FC = () => {
    const { character } = useGame();

    if (!character) {
        return null;
    }

    const trackedQuests = character.quests.filter(q => q.status === QuestStatus.ACTIVE || q.status === QuestStatus.COMPLETED).slice(0, 5); // Show max 5 quests

    return (
        <div className="w-full h-full">
            <h3 className="text-lg font-bold text-yellow-400 mb-3 border-b border-yellow-500/20 pb-2">Nhiệm Vụ</h3>
            {trackedQuests.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Không có nhiệm vụ để theo dõi.</p>
            ) : (
                <div className="space-y-4">
                    {trackedQuests.map(quest => {
                        const bar = getQuestBarDetails(quest);
                        return (
                            <div key={quest.id}>
                                <p className="font-semibold text-gray-200 truncate" title={quest.title}>{quest.title}</p>
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <span className="text-gray-400 truncate">{quest.target.targetName}</span>
                                    <span className="font-bold text-white flex-shrink-0 ml-2">{bar.label}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                    <div 
                                        className={`${bar.color} h-1.5 rounded-full transition-all duration-300`}
                                        style={{ width: `${bar.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const getQuestBarDetails = (quest: Quest) => {
    if (quest.status === QuestStatus.COMPLETED) {
        return {
            label: 'Sẵn sàng trả!',
            color: 'bg-green-500 animate-pulse',
            percentage: 100
        };
    }
    return {
        label: `${quest.target.current} / ${quest.target.count}`,
        color: 'bg-yellow-500',
        percentage: (quest.target.current / quest.target.count) * 100
    };
};

export default QuestTracker;