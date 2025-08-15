import React, { useState } from 'react';
import type { Entity } from './types';

// Utility function to format numbers properly, removing trailing commas
const formatNumber = (value: number): string => {
    if (value === 0) return '0';
    return value.toLocaleString().replace(/,$/, '');
};

export interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddExp?: (amount: number) => void;
    onAddItem?: (itemData: Partial<Entity>) => void;
    onAddSkill?: (skillData: Partial<Entity>) => void;
    currentPlayerExp?: number;
}

export const AdminModal: React.FC<AdminModalProps> = ({
    isOpen,
    onClose,
    onAddExp,
    onAddItem,
    onAddSkill,
    currentPlayerExp = 0
}) => {
    const [activeTab, setActiveTab] = useState<'EXP' | 'ITEM' | 'SKILL'>('EXP');
    
    // Experience form state
    const [expAmount, setExpAmount] = useState<string>('');
    
    // Item form state
    const [itemName, setItemName] = useState<string>('');
    const [itemDescription, setItemDescription] = useState<string>('');
    const [itemType, setItemType] = useState<'usable' | 'equippable' | 'other'>('other');
    const [itemQuantities, setItemQuantities] = useState<string>('');
    const [itemDurability, setItemDurability] = useState<string>('');

    // Skill form state
    const [skillName, setSkillName] = useState<string>('');
    const [skillDescription, setSkillDescription] = useState<string>('');
    const [skillType, setSkillType] = useState<'combat' | 'movement' | 'cultivation' | 'utility' | 'passive'>('combat');
    const [skillMastery, setSkillMastery] = useState<string>('');
    const [skillElement, setSkillElement] = useState<string>('');
    const [skillCooldown, setSkillCooldown] = useState<string>('');
    const [skillManaCost, setSkillManaCost] = useState<string>('');

    if (!isOpen) return null;

    const handleAddExp = () => {
        const amount = parseInt(expAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Vui lòng nhập số kinh nghiệm hợp lệ (số dương)');
            return;
        }
        onAddExp?.(amount);
        setExpAmount('');
        alert(`Đã thêm ${formatNumber(amount)} kinh nghiệm!`);
    };

    const handleAddItem = () => {
        if (!itemName.trim()) {
            alert('Vui lòng nhập tên vật phẩm');
            return;
        }

        const itemData: Partial<Entity> = {
            name: itemName.trim(),
            type: 'item',
            description: itemDescription.trim() || 'Vật phẩm được tạo bởi Admin',
            owner: 'pc',
            usable: itemType === 'usable',
            equippable: itemType === 'equippable'
        };

        // Add optional properties
        if (itemQuantities && !isNaN(parseInt(itemQuantities))) {
            itemData.quantities = parseInt(itemQuantities);
        }
        
        if (itemDurability && !isNaN(parseInt(itemDurability))) {
            itemData.durability = parseInt(itemDurability);
        }

        onAddItem?.(itemData);
        
        // Reset form
        setItemName('');
        setItemDescription('');
        setItemType('other');
        setItemQuantities('');
        setItemDurability('');
        
        alert(`Đã thêm vật phẩm "${itemData.name}" vào túi đồ!`);
    };

    const handleAddSkill = () => {
        if (!skillName.trim()) {
            alert('Vui lòng nhập tên kỹ năng');
            return;
        }

        const skillData: Partial<Entity> = {
            name: skillName.trim(),
            type: 'skill',
            description: skillDescription.trim() || 'Kỹ năng được tạo bởi Admin',
            mastery: skillMastery.trim() || undefined,
            element: skillElement.trim() || undefined
        };

        // Add optional properties
        if (skillCooldown && !isNaN(parseInt(skillCooldown))) {
            (skillData as any).cooldown = skillCooldown;
        }
        
        if (skillManaCost && !isNaN(parseInt(skillManaCost))) {
            (skillData as any).manaCost = parseInt(skillManaCost);
        }

        // Add skill type as a custom property
        (skillData as any).skillType = skillType;

        onAddSkill?.(skillData);
        
        // Reset form
        setSkillName('');
        setSkillDescription('');
        setSkillType('combat');
        setSkillMastery('');
        setSkillElement('');
        setSkillCooldown('');
        setSkillManaCost('');
        
        alert(`Đã tạo kỹ năng "${skillData.name}" và thêm vào danh sách kỹ năng đã học!`);
    };

    const quickExpButtons = [100, 500, 1000, 5000, 10000, 50000];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div 
                className="bg-slate-900/95 backdrop-blur-sm border-2 border-red-600/80 rounded-lg shadow-2xl w-full max-w-2xl text-white flex flex-col max-h-[90vh] md:max-h-[80vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b-2 border-red-600/80 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                            <span className="w-6 h-6">⚙️</span>
                            ADMIN PANEL
                        </h3>
                        
                        {/* Tab buttons */}
                        <div className="flex gap-1 md:gap-2">
                            <button
                                onClick={() => setActiveTab('EXP')}
                                className={`px-2 md:px-3 py-2 rounded-md font-semibold transition-colors text-xs md:text-sm ${
                                    activeTab === 'EXP' 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                EXP
                            </button>
                            <button
                                onClick={() => setActiveTab('ITEM')}
                                className={`px-2 md:px-3 py-2 rounded-md font-semibold transition-colors text-xs md:text-sm ${
                                    activeTab === 'ITEM' 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                ITEM
                            </button>
                            <button
                                onClick={() => setActiveTab('SKILL')}
                                className={`px-2 md:px-3 py-2 rounded-md font-semibold transition-colors text-xs md:text-sm ${
                                    activeTab === 'SKILL' 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                SKILL
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white text-3xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 flex-1 overflow-y-auto min-h-0">
                    {activeTab === 'EXP' && (
                        <div className="space-y-6">
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                <h4 className="text-lg font-semibold text-blue-400 mb-2">Kinh nghiệm hiện tại</h4>
                                <p className="text-2xl font-bold text-green-400">
                                    {formatNumber(currentPlayerExp)}
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-white">Thêm kinh nghiệm</h4>
                                
                                {/* Quick buttons */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nhanh chóng:
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {quickExpButtons.map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => {
                                                    onAddExp?.(amount);
                                                    alert(`Đã thêm ${formatNumber(amount)} kinh nghiệm!`);
                                                }}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold transition-colors"
                                            >
                                                +{formatNumber(amount)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Custom amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Số lượng tùy chỉnh:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={expAmount}
                                            onChange={(e) => setExpAmount(e.target.value)}
                                            placeholder="Nhập số kinh nghiệm..."
                                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                        />
                                        <button
                                            onClick={handleAddExp}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition-colors"
                                        >
                                            THÊM
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ITEM' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">Tạo vật phẩm mới</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tên vật phẩm *
                                    </label>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="Nhập tên vật phẩm..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Loại vật phẩm
                                    </label>
                                    <select
                                        value={itemType}
                                        onChange={(e) => setItemType(e.target.value as any)}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="other">Khác</option>
                                        <option value="usable">Có thể sử dụng</option>
                                        <option value="equippable">Có thể trang bị</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    placeholder="Nhập mô tả vật phẩm..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Số lượng
                                    </label>
                                    <input
                                        type="number"
                                        value={itemQuantities}
                                        onChange={(e) => setItemQuantities(e.target.value)}
                                        placeholder="Để trống nếu không giới hạn"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Độ bền
                                    </label>
                                    <input
                                        type="number"
                                        value={itemDurability}
                                        onChange={(e) => setItemDurability(e.target.value)}
                                        placeholder="Để trống nếu không có"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SKILL' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">Tạo kỹ năng mới</h4>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tên kỹ năng *
                                    </label>
                                    <input
                                        type="text"
                                        value={skillName}
                                        onChange={(e) => setSkillName(e.target.value)}
                                        placeholder="Nhập tên kỹ năng..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Loại kỹ năng
                                    </label>
                                    <select
                                        value={skillType}
                                        onChange={(e) => setSkillType(e.target.value as any)}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="combat">Chiến đấu</option>
                                        <option value="movement">Di chuyển</option>
                                        <option value="cultivation">Tu luyện</option>
                                        <option value="utility">Hỗ trợ</option>
                                        <option value="passive">Bị động</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Mô tả kỹ năng
                                </label>
                                <textarea
                                    value={skillDescription}
                                    onChange={(e) => setSkillDescription(e.target.value)}
                                    placeholder="Nhập mô tả chi tiết về kỹ năng..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mức độ thành thạo
                                    </label>
                                    <input
                                        type="text"
                                        value={skillMastery}
                                        onChange={(e) => setSkillMastery(e.target.value)}
                                        placeholder="VD: Sơ cấp, Trung cấp, Cao cấp..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Thuộc tính
                                    </label>
                                    <input
                                        type="text"
                                        value={skillElement}
                                        onChange={(e) => setSkillElement(e.target.value)}
                                        placeholder="VD: Hỏa, Thủy, Phong..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Thời gian hồi chiêu
                                    </label>
                                    <input
                                        type="text"
                                        value={skillCooldown}
                                        onChange={(e) => setSkillCooldown(e.target.value)}
                                        placeholder="VD: 10 giây, 1 phút..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tiêu hao nội lực
                                    </label>
                                    <input
                                        type="number"
                                        value={skillManaCost}
                                        onChange={(e) => setSkillManaCost(e.target.value)}
                                        placeholder="Lượng nội lực cần dùng"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-red-600/80 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-semibold transition-colors"
                    >
                        ĐÓNG
                    </button>
                    
                    {activeTab === 'ITEM' && (
                        <button
                            onClick={handleAddItem}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition-colors"
                        >
                            TẠO VẬT PHẨM
                        </button>
                    )}
                    
                    {activeTab === 'SKILL' && (
                        <button
                            onClick={handleAddSkill}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-semibold transition-colors"
                        >
                            TẠO KỸ NĂNG
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};