import React, { useState, useEffect } from 'react';
import type { Entity } from './types';

export interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerInventory: Entity[];
    onUseItem?: (item: Entity) => void;
    onEquipItem?: (item: Entity) => void;
    onUnequipItem?: (item: Entity) => void;
    onDiscardItem?: (item: Entity) => void;
    onEditItem?: (item: Entity) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen,
    onClose,
    playerInventory,
    onUseItem,
    onEquipItem,
    onUnequipItem,
    onDiscardItem,
    onEditItem
}) => {
    const [selectedItem, setSelectedItem] = useState<Entity | null>(null);

    // Reset selected item when modal opens/closes to ensure fresh state
    useEffect(() => {
        if (!isOpen) {
            setSelectedItem(null);
        }
    }, [isOpen]);

    // Reset selected item when inventory changes and the selected item is no longer in the inventory
    useEffect(() => {
        if (selectedItem && !playerInventory.find(item => item.name === selectedItem.name)) {
            console.log(`🔄 Inventory cleanup: Selected item "${selectedItem.name}" no longer in inventory, clearing selection`);
            setSelectedItem(null);
        }
    }, [playerInventory, selectedItem]);

    if (!isOpen) return null;

    // Display all items belonging to PC
    const allItems = playerInventory;

    const getItemIcon = (item: Entity) => {
        // Return appropriate icon based on item type
        if (item.name.includes('kiếm')) return '⚔️';
        if (item.name.includes('dao')) return '🗡️';
        if (item.name.includes('cung')) return '🏹';
        if (item.name.includes('thương')) return '🗿';
        if (item.name.includes('giáp')) return '🛡️';
        if (item.name.includes('áo')) return '👕';
        if (item.name.includes('mũ')) return '🎩';
        if (item.name.includes('ủng')) return '👢';
        return '📦';
    };

    const getItemQuality = (item: Entity) => {
        // Determine item quality based on description or other properties
        if (item.description?.includes('thần') || item.description?.includes('huyền thoại')) return 'legendary';
        if (item.description?.includes('hiếm') || item.description?.includes('quý')) return 'rare';
        if (item.description?.includes('phổ thông') || item.description?.includes('thường')) return 'common';
        return 'uncommon';
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'legendary': return 'border-purple-500 bg-purple-500/10';
            case 'rare': return 'border-blue-500 bg-blue-500/10';
            case 'uncommon': return 'border-green-500 bg-green-500/10';
            default: return 'border-gray-500 bg-gray-500/10';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[90] p-4" onClick={onClose}>
            <div 
                className="bg-slate-900/95 backdrop-blur-sm border-2 border-slate-600/80 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl h-[85vh] sm:h-[80vh] text-white flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-3 sm:p-4 border-b-2 border-slate-600/80 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 sm:w-6 sm:h-6">🎒</span>
                            TÚI ĐỒ
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-400">
                            {allItems.length} vật phẩm
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white text-2xl sm:text-3xl leading-none p-1"
                    >
                        &times;
                    </button>
                </div>

                {/* Inventory Grid */}
                <div className="p-2 sm:p-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 w-full">
                        {Array.from({ length: 48 }, (_, index) => {
                            const item = allItems[index];
                            
                            if (!item) {
                                return (
                                    <div
                                        key={index}
                                        className="aspect-square border-2 border-slate-700/60 bg-slate-800/30 rounded-md min-h-[60px] sm:min-h-[70px] lg:min-h-[80px]"
                                    />
                                );
                            }

                            const quality = getItemQuality(item);
                            const qualityColor = getQualityColor(quality);

                            return (
                                <div
                                    key={item.name}
                                    className={`aspect-square border-2 ${qualityColor} rounded-md p-1 sm:p-2 relative cursor-pointer hover:scale-105 transition-transform group min-h-[60px] sm:min-h-[70px] lg:min-h-[80px] ${
                                        selectedItem?.name === item.name ? 'ring-2 ring-blue-400 bg-blue-500/20' : ''
                                    }`}
                                    title={item.description}
                                    onClick={() => setSelectedItem(selectedItem?.name === item.name ? null : item)}
                                >
                                    {/* Item Icon */}
                                    <div className="text-lg sm:text-xl lg:text-2xl mb-1 text-center">
                                        {getItemIcon(item)}
                                    </div>
                                    
                                    {/* Item Count */}
                                    {(item.quantities || item.uses) && (
                                        <div className="absolute bottom-1 right-1 bg-slate-900/80 text-xs px-1 rounded text-white">
                                            {String(item.quantities || item.uses).replace(/,/g, '')}
                                        </div>
                                    )}
                                    
                                    {/* Equipped indicator */}
                                    {item.equipped && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
                                    )}

                                    {/* Hover tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900/95 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none min-w-max max-w-xs">
                                        <div className="font-semibold">{item.name}</div>
                                        {item.description && (
                                            <div className="mt-1 text-gray-300">{item.description}</div>
                                        )}
                                        {item.durability && (
                                            <div className="mt-1 text-blue-300">Độ bền: {item.durability}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer with action buttons */}
                <div className="p-4 border-t-2 border-slate-600/80 flex-shrink-0">
                    {selectedItem ? (
                        <div className="space-y-3">
                            {/* Selected item info */}
                            <div className="bg-slate-800/50 rounded-md p-3 border border-slate-600">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getItemIcon(selectedItem)}</span>
                                    <div>
                                        <h4 className="font-semibold text-white">{selectedItem.name}</h4>
                                        {selectedItem.description && (
                                            <p className="text-sm text-gray-400">{selectedItem.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action buttons for selected item */}
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                                {selectedItem.usable && onUseItem && ((selectedItem.quantities === undefined || selectedItem.quantities > 0) || (selectedItem.uses === undefined || selectedItem.uses > 0)) && (
                                    <button
                                        className="px-3 py-2 sm:px-4 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition-colors text-sm sm:text-base"
                                        onClick={() => {
                                            onUseItem(selectedItem);
                                            setSelectedItem(null);
                                        }}
                                    >
                                        SỬ DỤNG {(selectedItem.quantities && `(${String(selectedItem.quantities).replace(/,/g, '')} lần)`) || (selectedItem.uses && `(${String(selectedItem.uses).replace(/,/g, '')} lần)`)}
                                    </button>
                                )}
                                
                                {selectedItem.equippable && (
                                    <>
                                        {selectedItem.equipped ? (
                                            onUnequipItem && (
                                                <button
                                                    className="px-3 py-2 sm:px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-md font-semibold transition-colors text-sm sm:text-base"
                                                    onClick={() => {
                                                        onUnequipItem(selectedItem);
                                                        setSelectedItem(null);
                                                    }}
                                                >
                                                    TỰA BỎ
                                                </button>
                                            )
                                        ) : (
                                            onEquipItem && (
                                                <button
                                                    className="px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold transition-colors text-sm sm:text-base"
                                                    onClick={() => {
                                                        onEquipItem(selectedItem);
                                                        setSelectedItem(null);
                                                    }}
                                                >
                                                    TRANG BỊ
                                                </button>
                                            )
                                        )}
                                    </>
                                )}
                                
                                {onEditItem && (
                                    <button
                                        className="px-3 py-2 sm:px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-semibold transition-colors text-sm sm:text-base"
                                        onClick={() => {
                                            onEditItem(selectedItem);
                                            setSelectedItem(null);
                                        }}
                                    >
                                        CHỈNH SỬA
                                    </button>
                                )}

                                {onDiscardItem && (
                                    <button
                                        className="px-3 py-2 sm:px-4 bg-red-600 hover:bg-red-500 text-white rounded-md font-semibold transition-colors text-sm sm:text-base"
                                        onClick={() => {
                                            if (window.confirm(`Bạn có chắc muốn vứt bỏ "${selectedItem.name}"?`)) {
                                                console.log(`🗑️ Inventory Modal: Discarding item "${selectedItem.name}"`);
                                                const itemToDiscard = selectedItem;
                                                setSelectedItem(null); // Clear selection immediately
                                                onDiscardItem(itemToDiscard);
                                            }
                                        }}
                                    >
                                        VỨT BỎ
                                    </button>
                                )}
                                
                                <button
                                    className="px-3 py-2 sm:px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-md font-semibold transition-colors text-sm sm:text-base"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    HỦY
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                            <button
                                className="px-4 py-2 sm:px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-semibold transition-colors text-sm sm:text-base"
                                onClick={onClose}
                            >
                                ĐÓNG
                            </button>
                            <div className="text-xs sm:text-sm text-gray-400 text-center">
                                Chọn một vật phẩm để thực hiện hành động
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};