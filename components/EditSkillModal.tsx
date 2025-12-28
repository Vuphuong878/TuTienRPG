import React, { useState, useEffect } from 'react';
import type { Entity } from './types';

export interface EditSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    skill: Entity | null;
    onSaveSkill: (originalSkill: Entity, editedSkill: Entity) => void;
}

export const EditSkillModal: React.FC<EditSkillModalProps> = ({
    isOpen,
    onClose,
    skill,
    onSaveSkill
}) => {
    const [editedSkill, setEditedSkill] = useState<Entity | null>(null);

    useEffect(() => {
        if (skill && isOpen) {
            setEditedSkill({ ...skill });
        }
    }, [skill, isOpen]);

    if (!isOpen || !editedSkill) return null;

    const handleInputChange = (field: string, value: any) => {
        setEditedSkill(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = () => {
        if (editedSkill && skill) {
            onSaveSkill(skill, editedSkill);
            onClose();
        }
    };

    const handleCancel = () => {
        setEditedSkill(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[110] p-4" onClick={handleCancel}>
            <div 
                className="bg-slate-900/95 backdrop-blur-sm border-2 border-amber-400 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] text-white flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b-2 border-slate-600/80 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-amber-400">✏️</span>
                        CHỈNH SỬA KỸ NĂNG
                    </h3>
                    <button 
                        onClick={handleCancel} 
                        className="text-gray-400 hover:text-white text-3xl leading-none p-1"
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Tên kỹ năng</label>
                        <input
                            type="text"
                            value={editedSkill.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Nhập tên kỹ năng..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả</label>
                        <textarea
                            value={editedSkill.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                            placeholder="Nhập mô tả kỹ năng..."
                        />
                    </div>

                    {/* Mastery Level */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Mức độ thành thạo</label>
                        <select
                            value={editedSkill.mastery || ''}
                            onChange={(e) => handleInputChange('mastery', e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="">-- Chọn mức độ thành thạo --</option>
                            <option value="Mới học">Mới học</option>
                            <option value="Bậc nhập môn">Bậc nhập môn</option>
                            <option value="Bậc tiểu thành">Bậc tiểu thành</option>
                            <option value="Bậc tinh thông">Bậc tinh thông</option>
                            <option value="Bậc đại thành">Bậc đại thành</option>
                            <option value="Bậc viên mãn">Bậc viên mãn</option>
                            <option value="Bậc thần thông">Bậc thần thông</option>
                            <option value="Bậc huyền diệu">Bậc huyền diệu</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-slate-600/80 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md font-semibold transition-colors"
                    >
                        HỦY
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-semibold transition-colors"
                    >
                        LƯU
                    </button>
                </div>
            </div>
        </div>
    );
};