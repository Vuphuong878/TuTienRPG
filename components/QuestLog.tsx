
import React from 'react';
import { Quest, QuestStatus, QuestType } from '../types';
import { useGame } from '../contexts/GameContext';

const QuestStatusBadge: React.FC<{ status: QuestStatus }> = ({ status }) => {
    const statusMap = {
        [QuestStatus.ACTIVE]: { text: 'Đang làm', color: 'bg-blue-600' },
        [QuestStatus.AVAILABLE]: { text: 'Có sẵn', color: 'bg-gray-600' },
        [QuestStatus.COMPLETED]: { text: 'Hoàn thành', color: 'bg-yellow-500 text-black' },
        [QuestStatus.TURNED_IN]: { text: 'Đã trả', color: 'bg-green-600' },
    };
    const { text, color } = statusMap[status];
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${color}`}>{text}</span>;
};


const QuestLog: React.FC = () => {
    const { character, worldState } = useGame();
    if (!character || !worldState) return null;
    
    const activeQuests = character.quests.filter(q => q.status === QuestStatus.ACTIVE || q.status === QuestStatus.COMPLETED);
    const completedQuests = character.quests.filter(q => q.status === QuestStatus.TURNED_IN);

    const renderQuestList = (quests: Quest[], title: string) => (
        <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-3">{title} ({quests.length})</h3>
            {quests.length === 0 ? (
                <p className="text-gray-500 italic">Không có nhiệm vụ nào.</p>
            ) : (
                <div className="space-y-4">
                    {quests.map(quest => {
                        const reputationRewards = quest.rewards.reputationChange?.map(change => {
                            const faction = worldState.factions.find(f => f.id === change.factionId);
                            if (!faction) return null;
                            const amountText = change.amount > 0 ? `+${change.amount}` : `${change.amount}`;
                            const colorClass = change.amount > 0 ? 'text-green-400' : 'text-red-400';
                            return <span key={faction.id} className="mr-2">Danh vọng {faction.name} <span className={colorClass}>{amountText}</span></span>;
                        }).filter(Boolean);

                        return (
                            <div key={quest.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-lg font-semibold text-cyan-300">{quest.title}</h4>
                                    <QuestStatusBadge status={quest.status} />
                                </div>
                                <p className="text-sm text-gray-400 mb-3">{quest.description}</p>
                                <div className="text-xs space-y-1">
                                    <p><span className="font-semibold">Mục tiêu:</span> {quest.type === QuestType.GATHER ? 'Thu thập' : 'Săn'} {quest.target.count} {quest.target.targetName} ({quest.target.current}/{quest.target.count})</p>
                                    <div>
                                        <span className="font-semibold">Phần thưởng:</span> {quest.rewards.exp} EXP
                                        {reputationRewards && reputationRewards.length > 0 && (
                                            <span className="ml-2">{reputationRewards}</span>
                                        )}
                                        {quest.rewards.contributionPoints && (
                                            <span className="ml-2 text-purple-400">{quest.rewards.contributionPoints} Điểm Cống Hiến</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-3">
            {renderQuestList(activeQuests, "Nhiệm vụ Đang Theo Dõi")}
            {renderQuestList(completedQuests, "Nhiệm vụ Đã Hoàn Thành")}
        </div>
    );
};

export default QuestLog;
