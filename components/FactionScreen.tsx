import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Faction, FactionType, Item, ItemType, QuestStatus, QuestType, SectStoreItem, LogType, Rarity } from '../types';
import ItemCard from './ItemCard';
import { RARITY_DATA } from '../constants';

interface ReputationDetails {
    label: string;
    colorClass: string;
    min: number;
    max: number;
}

const getReputationDetails = (score: number): ReputationDetails => {
    if (score <= -50) return { label: 'Thù Địch', colorClass: 'bg-red-600', min: -100, max: -50 };
    if (score < 0) return { label: 'Ghét Bỏ', colorClass: 'bg-red-400', min: -49, max: -1 };
    if (score === 0) return { label: 'Trung Lập', colorClass: 'bg-gray-400', min: 0, max: 0 };
    if (score < 50) return { label: 'Thân Thiện', colorClass: 'bg-green-400', min: 1, max: 49 };
    return { label: 'Tôn Kính', colorClass: 'bg-green-600', min: 50, max: 100 };
};

const FactionListScreen: React.FC = () => {
    const { character, worldState, handleJoinSectRequest } = useGame();
    if (!character || !worldState || !worldState.factions) return null;

    const { factions } = worldState;
    const { reputation } = character;

    const getFactionTypeColor = (type: FactionType) => {
        switch (type) {
            case FactionType.CHINH_PHAI: return 'text-cyan-300 bg-cyan-900/50';
            case FactionType.MA_DAO: return 'text-red-300 bg-red-900/50';
            case FactionType.TRUNG_LAP: return 'text-yellow-300 bg-yellow-900/50';
            default: return 'text-gray-300 bg-gray-700';
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">Các Thế Lực Trong Thiên Hạ</h2>
            {factions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {factions.map(faction => {
                        const rep = reputation[faction.id] || 0;
                        const repDetails = getReputationDetails(rep);
                        const range = repDetails.max - repDetails.min;
                        const progressInRange = rep - repDetails.min;
                        const percentage = range > 0 ? (progressInRange / range) * 100 : (rep === 0 ? 50 : 100);
                        const canJoin = faction.isJoinable && !character.sectId && rep >= 50;

                        const handleJoinClick = () => {
                            if (!canJoin) return;
                            if(window.confirm(`Bạn có muốn thực hiện nhiệm vụ khảo hạch để gia nhập ${faction.name} không?`)) {
                                handleJoinSectRequest(faction.id);
                            }
                        }

                        return (
                             <div key={faction.id} className="bg-gray-800/60 p-4 rounded-lg border border-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary-dark)] shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-purple-300">{faction.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getFactionTypeColor(faction.type)}`}>
                                            {faction.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 italic mb-4">"{faction.description}"</p>
                                    <div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-sm font-semibold text-gray-200">Danh Vọng</span>
                                            <span className={`font-bold ${repDetails.colorClass.replace('bg-', 'text-')}`}>{repDetails.label} ({rep})</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                                            <div className={`${repDetails.colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                {canJoin && (
                                    <button onClick={handleJoinClick} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                        Xin Gia Nhập
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center text-gray-500 p-10 bg-gray-700/50 rounded-lg">
                     <p className="text-2xl mb-2">🌀</p>
                    <p>Thế giới này không có các phe phái lớn mạnh, chỉ có những cá nhân và thế lực nhỏ lẻ.</p>
                </div>
            )}
        </div>
    );
}

type SectTab = 'missions' | 'contribute' | 'store';

const SectScreen: React.FC<{faction: Faction}> = ({ faction }) => {
    const { character, handleRequestSectMission, handleContributeItemToSect, handleBuyFromSectStore, setOneTimeMessages } = useGame();
    const [activeTab, setActiveTab] = useState<SectTab>('missions');
    const [isLoading, setIsLoading] = useState(false);
    
    if(!character) return null;

    const TabButton: React.FC<{ tab: SectTab; label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {label}
        </button>
    );

    const renderMissionsTab = () => {
        const activeMission = character.quests.find(q => q.type === QuestType.SECT_MISSION && q.status !== QuestStatus.TURNED_IN);
        
        const handleRequestMission = async () => {
            setIsLoading(true);
            await handleRequestSectMission();
            setIsLoading(false);
        }

        return (
            <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Nhiệm Vụ Tông Môn</h3>
                {activeMission ? (
                    <div>
                        <p className="font-bold">{activeMission.title}</p>
                        <p className="text-sm text-gray-400 italic my-1">"{activeMission.description}"</p>
                        <p className="text-sm">Mục tiêu: {activeMission.target.targetName} ({activeMission.target.current}/{activeMission.target.count})</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-400 mb-3">Bạn không có nhiệm vụ tông môn nào đang hoạt động.</p>
                        <button onClick={handleRequestMission} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                           {isLoading ? 'Đang nhận...' : 'Nhận Nhiệm Vụ'}
                        </button>
                    </div>
                )}
            </div>
        )
    };
    
    const renderContributeTab = () => {
        const [contributingId, setContributingId] = useState<string | null>(null);

        const handleContribute = async (item: Item) => {
            if(window.confirm(`Bạn có chắc muốn cống hiến ${item.name} cho tông môn?`)) {
                setContributingId(item.id);
                try {
                    const result = await handleContributeItemToSect(item);
                    setOneTimeMessages([{id: crypto.randomUUID(), text: result.message, type: LogType.SYSTEM}]);
                } catch(e: any) {
                    setOneTimeMessages([{id: crypto.randomUUID(), text: `Lỗi cống hiến: ${e.message}`, type: LogType.ERROR}]);
                } finally {
                    setContributingId(null);
                }
            }
        };

        return (
             <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Cống Hiến Vật Phẩm</h3>
                 <div className="space-y-2 h-[40vh] overflow-y-auto pr-2">
                    {character.inventory.filter(i => i.type !== ItemType.CULTIVATION_MANUAL).map(item => {
                        const rarityInfo = RARITY_DATA[item.rarity] || RARITY_DATA[Rarity.COMMON];
                        return (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
                                <p className={rarityInfo.color}>{item.name} {item.upgradeLevel > 0 && `+${item.upgradeLevel}`}</p>
                                <button onClick={() => handleContribute(item)} disabled={!!contributingId} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded disabled:bg-gray-500">
                                    {contributingId === item.id ? '...' : 'Cống Hiến'}
                                </button>
                            </div>
                        )
                    })}
                    {character.inventory.filter(i => i.type !== ItemType.CULTIVATION_MANUAL).length === 0 && <p className="text-gray-500 italic">Túi đồ trống.</p>}
                 </div>
            </div>
        )
    };
    
    const renderStoreTab = () => {
         const [buyingId, setBuyingId] = useState<string | null>(null);

        const handleBuy = async (storeItem: SectStoreItem) => {
            setBuyingId(storeItem.id);
            try {
                const result = await handleBuyFromSectStore(storeItem);
                setOneTimeMessages([{id: crypto.randomUUID(), text: result.message, type: LogType.LOOT}]);
            } catch(e: any) {
                setOneTimeMessages([{id: crypto.randomUUID(), text: `Lỗi: ${e.message}`, type: LogType.ERROR}]);
            } finally {
                setBuyingId(null);
            }
        };

        return (
            <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Tàng Kinh Các (Cửa Hàng)</h3>
                <div className="space-y-3 h-[40vh] overflow-y-auto pr-2">
                    {faction.store.map(storeItem => {
                        const canAfford = character.sectContributionPoints >= storeItem.cost;
                        const rarityInfo = RARITY_DATA[storeItem.item.rarity] || RARITY_DATA[Rarity.COMMON];
                        return (
                            <div key={storeItem.id} className="p-3 bg-gray-900/50 rounded-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className={`font-bold ${rarityInfo.color}`}>{storeItem.item.name}</p>
                                        <p className="text-xs text-gray-400 italic mt-1">"{storeItem.item.description || "Một vật phẩm từ tông môn."}"</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <p className="font-bold text-yellow-400">{storeItem.cost} Cống Hiến</p>
                                        <button onClick={() => handleBuy(storeItem)} disabled={!canAfford || !!buyingId} className="mt-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1 px-3 rounded disabled:bg-gray-600 disabled:cursor-not-allowed">
                                            {buyingId === storeItem.id ? '...' : 'Đổi'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-4">
            <div className="text-center bg-gray-800/80 p-4 rounded-lg">
                 <h2 className="text-2xl font-bold text-purple-300">{faction.name}</h2>
                 <p className="text-gray-300">Cấp bậc: <span className="font-semibold text-white">{character.sectRank}</span></p>
                 <p className="text-gray-300">Điểm Cống Hiến: <span className="font-semibold text-yellow-400">{character.sectContributionPoints}</span></p>
            </div>
            
            <div className="flex justify-center gap-2 p-2 bg-black/20 rounded-lg">
                <TabButton tab="missions" label="Nhiệm Vụ" />
                <TabButton tab="contribute" label="Cống Hiến" />
                <TabButton tab="store" label="Tàng Kinh Các" />
            </div>

            <div>
                {activeTab === 'missions' && renderMissionsTab()}
                {activeTab === 'contribute' && renderContributeTab()}
                {activeTab === 'store' && renderStoreTab()}
            </div>
        </div>
    )
}

const FactionScreen: React.FC = () => {
    const { character, worldState } = useGame();

    if (!character || !worldState || !worldState.factions) {
        return <p>Không có dữ liệu về phe phái.</p>;
    }

    const playerSect = worldState.factions.find(f => f.id === character.sectId);

    return (
        <div className="max-h-[70vh] overflow-y-auto pr-3">
            {playerSect ? <SectScreen faction={playerSect} /> : <FactionListScreen />}
        </div>
    );
};

export default FactionScreen;