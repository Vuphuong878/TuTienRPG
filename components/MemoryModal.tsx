import React, { useMemo } from 'react';
import type { Memory } from './types.ts';
import { PinIcon } from './Icons.tsx';
import { ImportanceScorer } from './utils/ImportanceScorer.ts';

export const MemoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    memories: Memory[];
    onTogglePin: (index: number) => void;
    gameState?: {
        knownEntities: any;
        turnCount: number;
        statuses: any[];
        party: any[];
        quests: any[];
    };
}> = ({ isOpen, onClose, memories, onTogglePin, gameState }) => {
    if (!isOpen) return null;

    const MAX_UNPINNED_MEMORIES = 50;

    // Calculate importance scores for all memories if gameState is available
    const memoriesWithScores = useMemo(() => {
        if (!gameState) {
            return memories.map((mem, index) => ({ 
                ...mem, 
                originalIndex: index, 
                importanceScore: mem.importance || 0,
                importanceReasons: []
            }));
        }

        return memories.map((mem, index) => {
            const analysis = ImportanceScorer.calculateMemoryScore(mem, gameState);
            return {
                ...mem,
                originalIndex: index,
                importanceScore: analysis.score,
                importanceReasons: analysis.reasons
            };
        });
    }, [memories, gameState]);

    const pinnedMemories = memoriesWithScores.filter(mem => mem.pinned);
    const unpinnedMemories = memoriesWithScores.filter(mem => !mem.pinned);

    // Sort unpinned memories by importance score (highest first), then by recency
    const sortedUnpinned = unpinnedMemories.sort((a, b) => {
        if (b.importanceScore !== a.importanceScore) {
            return b.importanceScore - a.importanceScore;
        }
        return b.originalIndex - a.originalIndex; // More recent first if same importance
    });

    const displayedUnpinned = sortedUnpinned.slice(0, MAX_UNPINNED_MEMORIES);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Dòng Ký Ức</h3>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-2xl leading-none">&times;</button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                        <span>📌 {pinnedMemories.length} đã ghim</span>
                        <span>📄 {memories.length} tổng cộng</span>
                        {gameState && (
                            <span>🎯 Sắp xếp theo độ quan trọng</span>
                        )}
                    </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    {(pinnedMemories.length > 0 || displayedUnpinned.length > 0) ? (
                        <ul className="space-y-3">
                            {/* Pinned Memories */}
                            {pinnedMemories.map((mem) => (
                                <li key={mem.originalIndex} className="flex flex-col gap-2 text-sm text-slate-700 dark:text-gray-300 border-l-4 border-yellow-400 pl-3 py-2 bg-yellow-400/10 rounded-r-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                                    📌 PINNED
                                                </span>
                                                {gameState && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded">
                                                        {mem.importanceScore}/100
                                                    </span>
                                                )}
                                                {mem.category && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                                                        {mem.category}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="leading-relaxed">{mem.text}</span>
                                            {mem.relatedEntities && mem.relatedEntities.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {mem.relatedEntities.slice(0, 3).map(entity => (
                                                        <span key={entity} className="text-xs px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                                            {entity}
                                                        </span>
                                                    ))}
                                                    {mem.relatedEntities.length > 3 && (
                                                        <span className="text-xs text-slate-500">+{mem.relatedEntities.length - 3} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => onTogglePin(mem.originalIndex)}
                                            className="p-1 rounded-full transition-colors bg-yellow-400 text-slate-800 hover:bg-yellow-500 flex-shrink-0"
                                            aria-label="Bỏ ghim"
                                        >
                                            <PinIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}

                            {/* Separator */}
                            {pinnedMemories.length > 0 && displayedUnpinned.length > 0 && (
                                <hr className="my-3 border-slate-300 dark:border-slate-600" />
                            )}
                            
                            {/* Unpinned Memories */}
                            {displayedUnpinned.map((mem) => {
                                // Color code based on importance score
                                const getImportanceColor = (score: number) => {
                                    if (score >= 80) return 'border-red-500 bg-red-50 dark:bg-red-900/20'; // Very important
                                    if (score >= 60) return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'; // Important
                                    if (score >= 40) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'; // Moderate
                                    return 'border-slate-400 bg-slate-50 dark:bg-slate-800/20'; // Low importance
                                };

                                const getScoreTextColor = (score: number) => {
                                    if (score >= 80) return 'text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-800';
                                    if (score >= 60) return 'text-orange-700 dark:text-orange-300 bg-orange-200 dark:bg-orange-800';
                                    if (score >= 40) return 'text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800';
                                    return 'text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700';
                                };

                                return (
                                    <li key={mem.originalIndex} className={`flex flex-col gap-2 text-sm text-slate-700 dark:text-gray-300 border-l-2 pl-3 py-2 rounded-r-md ${getImportanceColor(mem.importanceScore)}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {gameState && (
                                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getScoreTextColor(mem.importanceScore)}`}>
                                                            {mem.importanceScore}/100
                                                        </span>
                                                    )}
                                                    {mem.category && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                                                            {mem.category}
                                                        </span>
                                                    )}
                                                    {mem.source && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                                                            {mem.source}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="leading-relaxed">{mem.text}</span>
                                                {mem.relatedEntities && mem.relatedEntities.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {mem.relatedEntities.slice(0, 3).map(entity => (
                                                            <span key={entity} className="text-xs px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                                                {entity}
                                                            </span>
                                                        ))}
                                                        {mem.relatedEntities.length > 3 && (
                                                            <span className="text-xs text-slate-500">+{mem.relatedEntities.length - 3} more</span>
                                                        )}
                                                    </div>
                                                )}
                                                {mem.tags && mem.tags.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {mem.tags.slice(0, 4).map(tag => (
                                                            <span key={tag} className="text-xs px-1 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => onTogglePin(mem.originalIndex)}
                                                className="p-1 rounded-full transition-colors bg-slate-500 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-white flex-shrink-0"
                                                aria-label="Ghim"
                                            >
                                                <PinIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}

                            {/* Hidden memories notice */}
                            {unpinnedMemories.length > MAX_UNPINNED_MEMORIES && (
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
                                    ...và {unpinnedMemories.length - MAX_UNPINNED_MEMORIES} ký ức cũ hơn đã bị ẩn. Ghim lại ký ức quan trọng để chúng luôn hiển thị.
                                </p>
                            )}

                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Chưa có ký ức mới.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
