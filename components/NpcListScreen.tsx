
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { MetNpcInfo } from '../types';

const getAffinityDetails = (score: number) => {
    if (score <= -50) return { label: 'Thù Địch', bgColor: 'bg-red-700', textColor: 'text-red-200' };
    if (score < 0) return { label: 'Ghét Bỏ', bgColor: 'bg-red-800', textColor: 'text-red-300' };
    if (score < 50) return { label: 'Thân Thiện', bgColor: 'bg-green-800', textColor: 'text-green-300' };
    if (score >= 50) return { label: 'Quý Mến', bgColor: 'bg-emerald-700', textColor: 'text-emerald-200' };
    return { label: 'Trung Lập', bgColor: 'bg-gray-700', textColor: 'text-gray-300' };
};

const NpcCard: React.FC<{ npc: MetNpcInfo }> = ({ npc }) => {
    const affinityDetails = getAffinityDetails(npc.affinity);
    // Giả sử mức độ thân thiết trong khoảng từ -100 đến 100.
    const normalizedAffinity = Math.max(-100, Math.min(100, npc.affinity));
    const affinityPercentage = (normalizedAffinity + 100) / 200 * 100;

    return (
        <div className="bg-gray-800/60 p-4 rounded-lg border border-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary-dark)] shadow-lg flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 hover:bg-gray-800 hover:border-purple-400 hover:shadow-purple-500/20">
            <img 
                src={npc.imageUrl || 'https://via.placeholder.com/150'} 
                alt={npc.name} 
                className="w-20 h-20 rounded-full border-4 border-purple-400 object-cover flex-shrink-0" 
            />
            <div className="flex-grow text-center sm:text-left w-full">
                <h3 className="text-xl font-bold text-purple-300">{npc.name}</h3>
                <p className="text-sm text-gray-400">{npc.role}{npc.factionName ? ` (${npc.factionName})` : ''}</p>
                <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Mức độ thân thiết</span>
                        <span className={`font-bold ${affinityDetails.textColor}`}>{affinityDetails.label} ({npc.affinity})</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-2.5">
                        <div className={`${affinityDetails.bgColor} h-2.5 rounded-full`} style={{ width: `${affinityPercentage}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NpcListScreen: React.FC = () => {
    const { character } = useGame();

    if (!character || !character.metNpcs || character.metNpcs.length === 0) {
        return (
            <div className="text-center text-gray-500 p-10 bg-gray-700/50 rounded-lg h-full flex flex-col items-center justify-center">
                 <p className="text-3xl mb-4">👥</p>
                 <h3 className="text-xl font-semibold text-gray-300">Nhân Mạch Trống Rỗng</h3>
                 <p>Bạn chưa từng trò chuyện với bất kỳ ai.</p>
                 <p className="text-sm mt-1">Hãy khám phá thế giới và giao lưu với các nhân vật khác!</p>
            </div>
        );
    }

    const sortedNpcs = [...character.metNpcs].sort((a, b) => b.affinity - a.affinity);

    return (
        <div>
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">Nhân Mạch ({sortedNpcs.length})</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-3">
                {sortedNpcs.map((npc) => <NpcCard key={npc.name} npc={npc} />)}
            </div>
        </div>
    );
};

export default NpcListScreen;
