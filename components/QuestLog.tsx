import React from 'react';
import type { Quest } from './types';
import * as GameIcons from './GameIcons';
import { CrossIcon } from './Icons';

const getIconForQuest = (quest: Quest): React.ReactNode => {
    if (!quest) return <GameIcons.ScrollIcon />;
    if (quest.status === 'completed') return <GameIcons.CheckmarkIcon />;
    if (quest.status === 'failed') return <CrossIcon />;
    return <GameIcons.ScrollIcon />;
};

export const QuestLog: React.FC<{ quests: Quest[]; onQuestClick: (quest: Quest) => void }> = ({ quests, onQuestClick }) => {
    // Handle undefined quests prop
    const questsArray = quests || [];
    const activeQuests = questsArray.filter(q => q.status === 'active');
    const finishedQuests = questsArray.filter(q => q.status !== 'active');

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2 border-b border-yellow-400/20 pb-1">Đang Thực Hiện</h4>
                    {activeQuests.length > 0 ? (
                        <ul className="space-y-2">
                            {activeQuests.map(quest => (
                                <li key={quest.title} onClick={() => onQuestClick(quest)} className="text-sm p-2 bg-yellow-400/10 dark:bg-yellow-500/10 border-l-4 border-yellow-600 dark:border-yellow-400 rounded-r-md hover:bg-yellow-400/20 dark:hover:bg-yellow-500/20 transition-colors cursor-pointer">
                                    <p className="font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                                        <span className="w-4 h-4">{getIconForQuest(quest)}</span>
                                        {quest.title}
                                    </p>
                                    <p className="text-xs text-yellow-800/80 dark:text-yellow-200/80 pl-6 mt-1">- {quest.objectives.find(o => !o.completed)?.description || "Hoàn thành các mục tiêu."}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-xs text-slate-600 dark:text-slate-400 pl-2 italic">Không có nhiệm vụ nào đang hoạt động.</p>}
                </div>

                {finishedQuests.length > 0 && (
                    <div className="pt-2">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 border-b border-slate-300 dark:border-slate-600 pb-1">Đã Kết Thúc</h4>
                        <ul className="space-y-2">
                            {finishedQuests.sort((a,b) => a.title.localeCompare(b.title)).map(quest => (
                                <li key={quest.title} onClick={() => onQuestClick(quest)} className="text-sm p-2 bg-slate-200/50 dark:bg-slate-700/50 border-l-4 border-slate-400 dark:border-slate-500 rounded-r-md hover:bg-slate-300/50 dark:hover:bg-slate-600/50 transition-colors cursor-pointer opacity-70">
                                    <p className={`font-semibold ${quest.status === 'completed' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} flex items-center gap-2`}>
                                        <span className="w-4 h-4">{getIconForQuest(quest)}</span>
                                        <span className="line-through">{quest.title}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};