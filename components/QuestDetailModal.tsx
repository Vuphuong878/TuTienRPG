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

export const QuestDetailModal: React.FC<{ quest: Quest | null; onClose: () => void; }> = ({ quest, onClose }) => {
    if (!quest) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[105] p-4" onClick={onClose}>
            <div 
                className="bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 border-yellow-400/80 rounded-lg shadow-2xl w-full max-w-lg text-slate-900 dark:text-white" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b-2 border-yellow-400/80 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                        <span className="w-6 h-6">{getIconForQuest(quest)}</span>
                        {quest.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="p-5 space-y-4 text-slate-700 dark:text-gray-300 max-h-[60vh] overflow-y-auto">
                    <p className="italic">{quest.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-yellow-500/30">
                        <h4 className="font-semibold text-slate-800 dark:text-gray-100 mb-2">Mục tiêu:</h4>
                        <ul className="space-y-1.5 list-inside">
                            {quest.objectives.map((obj, index) => (
                                <li key={index} className={`flex items-center ${obj.completed ? 'text-gray-500 line-through' : 'text-yellow-800 dark:text-yellow-100'}`}>
                                    <span className="mr-3">{obj.completed ? '✅' : '🟡'}</span>
                                    <span>{obj.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-yellow-500/30 grid grid-cols-2 gap-4 text-sm">
                         {quest.giver && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 block">Người giao:</strong> {quest.giver}</p>}
                         <p><strong className="font-semibold text-slate-800 dark:text-gray-100 block">Trạng thái:</strong> <span className="capitalize">{quest.status}</span></p>
                         {quest.reward && <p className="col-span-2"><strong className="font-semibold text-slate-800 dark:text-gray-100 block">Phần thưởng:</strong> {quest.reward}</p>}
                    </div>

                </div>
            </div>
        </div>
    );
};