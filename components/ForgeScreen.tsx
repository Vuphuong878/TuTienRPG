import React, { useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { ItemType, UpgradeMaterial, Item, GameScreen } from '../types';
import ItemCard from './ItemCard';
import { UPGRADE_MATERIALS_DATA, RARITY_DATA } from '../constants';
import { getUpgradeCost, processItemUpgrade } from '../services/gameLogic';

// Helper component for stat comparison
const StatComparison: React.FC<{ label: string; current: number; next: number }> = ({ label, current, next }) => {
    const diff = next - current;
    return (
        <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-1 mb-1">
            <span className="text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-gray-200">{current}</span>
                {diff > 0 && (
                    <>
                        <span className="text-gray-500">→</span>
                        <span className="text-green-400 font-bold">{next} (+{diff})</span>
                    </>
                )}
            </div>
        </div>
    );
};

export const ForgeScreen: React.FC = () => {
    const { character, handleOpenMenu, handleUpgradeItem } = useGame();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    if (!character) return null;

    // Check inventory and equipment for the selected item
    const selectedItem = useMemo(() => {
        return character.inventory.find(i => i.id === selectedItemId) || 
               Object.values(character.equipment).find(i => i?.id === selectedItemId);
    }, [character, selectedItemId]);

    // Calculate preview item for "After" view
    const nextLevelItem = useMemo(() => {
        if (!selectedItem || selectedItem.upgradeLevel >= selectedItem.maxUpgrade) return null;
        return processItemUpgrade(selectedItem);
    }, [selectedItem]);

    const equipmentAndInventory = [
        ...character.inventory.filter(i => i.type !== ItemType.CULTIVATION_MANUAL && i.type !== ItemType.SKILL_BOOK),
        ...Object.values(character.equipment).filter((i): i is Item => !!i)
    ];

    const handleUpgrade = async () => {
        if (!selectedItem) return;
        setIsUpgrading(true);
        setNotification(null);
        
        try {
            const result = await handleUpgradeItem(selectedItem.id);
            setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
        } catch (e: any) {
             setNotification({ message: "Lỗi không xác định: " + e.message, type: 'error' });
        } finally {
            setIsUpgrading(false);
        }
    };

    const cost = selectedItem ? getUpgradeCost(selectedItem) : null;
    const canAfford = cost && (character.materials[cost.material] || 0) >= cost.amount;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
             <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://cdn.openart.ai/stable_diffusion/2078347a82413155705a61d1757276532454a840_2048x2048.webp')`, opacity: 0.2 }}></div>
            <div className="relative z-10 w-full max-w-7xl h-[90vh] bg-black/60 p-6 rounded-2xl shadow-2xl border border-orange-500/30 flex flex-col backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-orange-400 flex items-center gap-3">
                        <span className="text-4xl">⚒️</span> Lò Rèn Thần Bí
                    </h1>
                    <button onClick={() => handleOpenMenu(GameScreen.WORLD)} className="text-gray-400 hover:text-white transition bg-gray-800 px-4 py-2 rounded-lg">&times; Đóng</button>
                </div>
                
                {notification && (
                    <div className={`mb-4 p-3 rounded text-center font-bold animate-fade-in ${notification.type === 'success' ? 'bg-green-900/80 text-green-200 border border-green-500' : 'bg-red-900/80 text-red-200 border border-red-500'}`}>
                        {notification.message}
                    </div>
                )}

                <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                    {/* Left: Item List (3 cols) */}
                    <div className="lg:col-span-3 bg-gray-800/60 p-3 rounded-lg flex flex-col border border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-300 mb-3 flex-shrink-0">Kho Trang Bị</h2>
                        <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {equipmentAndInventory.map(item => {
                                const rarityInfo = RARITY_DATA[item.rarity];
                                const isEquipped = Object.values(character.equipment).some(e => e?.id === item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => { setSelectedItemId(item.id); setNotification(null); }}
                                        className={`p-3 rounded-md cursor-pointer border-l-4 transition-all duration-200 ${selectedItemId === item.id ? 'bg-gray-700 border-orange-500 shadow-md transform scale-[1.02]' : 'bg-gray-900/50 border-transparent hover:border-gray-600 hover:bg-gray-800'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className={`font-semibold text-sm ${rarityInfo.color}`}>{item.name} {item.upgradeLevel > 0 && `+${item.upgradeLevel}`}</p>
                                            {isEquipped && <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Đang dùng</span>}
                                        </div>
                                        <div className="flex justify-between mt-1">
                                             <p className="text-xs text-gray-400">Lv.{item.level} {item.type}</p>
                                             <p className="text-xs font-mono text-gray-500">{item.rarity}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {equipmentAndInventory.length === 0 && <p className="text-gray-500 text-center italic mt-4">Không có trang bị nào.</p>}
                        </div>
                    </div>

                    {/* Center & Right: Details Panel (9 cols) */}
                     <div className="lg:col-span-9 bg-gray-800/60 p-6 rounded-lg border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-purple-900/10 pointer-events-none"></div>

                        {selectedItem ? (
                            <div className="w-full h-full flex flex-col relative z-10 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-6">
                                    {/* Current Stats */}
                                    <div className="bg-gray-900/80 p-5 rounded-xl border border-gray-600 shadow-lg">
                                        <h3 className="text-lg font-bold text-gray-400 mb-3 border-b border-gray-700 pb-2">Hiện Tại (+{selectedItem.upgradeLevel})</h3>
                                        <div className="space-y-2">
                                            {Object.entries(selectedItem.baseStats).map(([stat, val]) => (
                                                <div key={stat} className="flex justify-between text-sm">
                                                    <span className="text-gray-500">{stat}</span>
                                                    <span className="text-gray-300">{val}</span>
                                                </div>
                                            ))}
                                            <div className="mt-2 pt-2 border-t border-gray-700">
                                                {Object.entries(selectedItem.bonusStats).map(([stat, val]) => (
                                                    <div key={stat} className="flex justify-between text-sm">
                                                        <span className="text-gray-500">{stat}</span>
                                                        <span className="text-blue-300">+{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Stats */}
                                    {nextLevelItem ? (
                                        <div className="bg-gray-900/80 p-5 rounded-xl border border-orange-500/50 shadow-lg shadow-orange-900/20 relative">
                                            <div className="absolute -top-3 -right-3 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-md">
                                                Dự đoán
                                            </div>
                                            <h3 className="text-lg font-bold text-orange-400 mb-3 border-b border-orange-500/30 pb-2">Sau Cường Hóa (+{nextLevelItem.upgradeLevel})</h3>
                                            
                                            <div className="space-y-2">
                                                 {/* Compare Base Stats (Usually unchanged, but consistent display) */}
                                                {Object.entries(selectedItem.baseStats).map(([stat, val]) => (
                                                    <StatComparison key={stat} label={stat} current={val || 0} next={nextLevelItem.baseStats[stat as any] || 0} />
                                                ))}
                                                
                                                <div className="mt-2 pt-2 border-t border-gray-700">
                                                    {/* Compare Bonus Stats */}
                                                     {Object.keys({...selectedItem.bonusStats, ...nextLevelItem.bonusStats}).map((stat) => {
                                                        const currentVal = (selectedItem.bonusStats as any)[stat] || 0;
                                                        const nextVal = (nextLevelItem.bonusStats as any)[stat] || 0;
                                                        return <StatComparison key={stat} label={stat} current={currentVal} next={nextVal} />;
                                                     })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center bg-gray-900/50 rounded-xl border border-gray-700 border-dashed">
                                            <span className="text-4xl mb-2">✨</span>
                                            <p className="text-yellow-500 font-bold">Đã đạt cấp tối đa</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Bar */}
                                <div className="mt-auto bg-black/40 p-4 rounded-xl border border-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4">
                                     <div className="flex items-center gap-4">
                                        <div className="text-center sm:text-left">
                                            <p className="text-sm text-gray-400">Tỷ lệ thành công</p>
                                            <p className="text-xl font-bold text-green-400">100%</p>
                                        </div>
                                        {cost && (
                                            <div className="text-center sm:text-left pl-4 border-l border-gray-600">
                                                <p className="text-sm text-gray-400">Chi phí</p>
                                                <p className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                                                    {cost.amount} x {UPGRADE_MATERIALS_DATA[cost.material].name}
                                                </p>
                                                <p className="text-xs text-gray-500">Hiện có: {character.materials[cost.material] || 0}</p>
                                            </div>
                                        )}
                                     </div>

                                    {cost ? (
                                        <button 
                                            onClick={handleUpgrade}
                                            disabled={!canAfford || isUpgrading || selectedItem.upgradeLevel >= selectedItem.maxUpgrade}
                                            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isUpgrading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Đang rèn...
                                                </>
                                            ) : (
                                                <>
                                                    <span>🔨</span> Cường Hóa
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                         <div className="px-8 py-3 bg-gray-700 text-gray-400 font-bold rounded-lg cursor-not-allowed">
                                            Tối Đa
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 animate-pulse">
                                <p className="text-6xl mb-4">⚒️</p>
                                <p className="text-xl font-semibold">Chọn một trang bị để bắt đầu cường hóa</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};