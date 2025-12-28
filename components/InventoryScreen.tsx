
import React, { useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { Item, EquipmentSlot, Rarity, ItemType } from '../types';
import ItemCard from './ItemCard';
import { RARITY_DATA } from '../constants';

const InventoryScreen: React.FC = () => {
    const { character, handleEquipItem, handleUnequipItem, handleLearnItem } = useGame();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const selectedItem = useMemo(() => {
        return character?.inventory.find(i => i.id === selectedItemId) || 
               Object.values(character?.equipment || {}).find(i => i?.id === selectedItemId) || null;
    }, [character, selectedItemId]);

    if (!character) {
        return <p>Loading character...</p>;
    }

    const { inventory, equipment } = character;

    const handleEquip = (item: Item) => {
        handleEquipItem(item);
        setSelectedItemId(null);
    };

    const handleUnequip = (slot: EquipmentSlot) => {
        handleUnequipItem(slot);
        // The item moves to inventory, maybe keep selectedItemId if we can find it there?
        // For simplicity, verify logic later or deselect
    };
    
    const handleLearn = (item: Item) => {
        handleLearnItem(item);
        setSelectedItemId(null);
    }
    
    const isEquipped = (item: Item) => {
        return Object.values(equipment).some(equipped => equipped?.id === item.id);
    }

    const unequippedInventory = inventory.filter(item => !isEquipped(item));

    const getPrimaryAction = (item: Item) => {
        if (!item) return undefined;
        if (item.type === ItemType.CULTIVATION_MANUAL || item.type === ItemType.SKILL_BOOK) {
            return () => handleLearn(item);
        }
        if (isEquipped(item) && item.slot) {
            return () => handleUnequip(item.slot!);
        }
        return () => handleEquip(item);
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Equipped Items */}
            <div className="lg:col-span-1">
                <h3 className="text-xl font-bold text-cyan-300 mb-3">Trang Bị</h3>
                <div className="space-y-3">
                    {Object.values(EquipmentSlot).map(slot => {
                        const item = equipment[slot];
                        return (
                            <div key={slot} className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-md">
                                <div className="w-16 text-center text-sm text-gray-400 font-semibold">{slot}</div>
                                {item ? (
                                    <div
                                        onClick={() => setSelectedItemId(item.id)}
                                        className={`flex-1 p-2 bg-gray-700 rounded-md cursor-pointer border-2 ${selectedItemId === item.id ? 'border-purple-500' : 'border-transparent hover:border-purple-500/50'}`}
                                    >
                                        <p>{item.name} {item.upgradeLevel > 0 && `+${item.upgradeLevel}`}</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 p-2 text-center bg-gray-900/50 text-gray-500 rounded-md italic">
                                        [Trống]
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Middle: Inventory List */}
            <div className="lg:col-span-1">
                 <h3 className="text-xl font-bold text-cyan-300 mb-3">Hành Trang</h3>
                 <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 bg-gray-900/30 p-2 rounded-lg">
                    {unequippedInventory.length > 0 ? (
                        unequippedInventory.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItemId(item.id)}
                                className={`p-2 rounded-md cursor-pointer border-l-4 transition-colors ${selectedItemId === item.id ? 'bg-gray-700 border-purple-500' : 'bg-gray-900/50 border-transparent hover:border-gray-600'}`}
                            >
                                <p className={`font-semibold text-sm`} style={{color: RARITY_DATA[item.rarity]?.color || '#FFFFFF'}}>{item.name} {item.upgradeLevel > 0 && `+${item.upgradeLevel}`}</p>
                                <p className="text-xs text-gray-400">{item.type}</p>
                            </div>
                        ))
                    ) : (
                         <div className="text-center text-gray-500 p-8 italic">
                            Túi đồ trống
                         </div>
                    )}
                 </div>
            </div>

            {/* Right: Item Details */}
            <div className="lg:col-span-1">
                 <h3 className="text-xl font-bold text-cyan-300 mb-3">Chi Tiết</h3>
                 {selectedItem ? (
                    <ItemCard 
                        item={selectedItem}
                        isEquipped={isEquipped(selectedItem)}
                        onPrimaryAction={getPrimaryAction(selectedItem)}
                    />
                 ) : (
                    <div className="text-center text-gray-500 p-8 bg-gray-800/50 rounded-lg h-full flex items-center justify-center">
                        Chọn một vật phẩm để xem chi tiết.
                    </div>
                 )}
            </div>
        </div>
    );
};

export default InventoryScreen;
