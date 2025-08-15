import React, { useState, useEffect } from 'react';
import type { Entity } from './types';
import { MBTI_PERSONALITIES } from './data/mbti';

export interface EditPCModalProps {
    isOpen: boolean;
    onClose: () => void;
    pc: Entity | null;
    onSavePC: (originalPC: Entity, editedPC: Entity) => void;
}

export const EditPCModal: React.FC<EditPCModalProps> = ({
    isOpen,
    onClose,
    pc,
    onSavePC
}) => {
    const [editedPC, setEditedPC] = useState<Entity | null>(null);

    useEffect(() => {
        if (pc && isOpen) {
            const editedPCData = { ...pc };
            // Initialize learnedSkillsText from learnedSkills array for the input field
            if (Array.isArray(pc.learnedSkills)) {
                editedPCData.learnedSkillsText = pc.learnedSkills.join(', ');
            }
            setEditedPC(editedPCData);
        }
    }, [pc, isOpen]);

    if (!isOpen || !editedPC) return null;

    const handleInputChange = (field: string, value: any) => {
        setEditedPC(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = () => {
        if (editedPC && pc) {
            // Clean up the final data before saving
            const finalPC = { ...editedPC };
            
            // Convert learnedSkillsText back to learnedSkills array if needed
            if ((finalPC as any).learnedSkillsText) {
                const skillsArray = (finalPC as any).learnedSkillsText.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0);
                finalPC.learnedSkills = skillsArray;
                delete (finalPC as any).learnedSkillsText; // Remove the temporary field
            }
            
            onSavePC(pc, finalPC);
            onClose();
        }
    };

    const handleCancel = () => {
        setEditedPC(null);
        onClose();
    };

    const handleLearnedSkillsChange = (skillsText: string) => {
        // Store the skills as a string directly to preserve cursor position
        // Only convert to array when saving
        handleInputChange('learnedSkillsText', skillsText);
        
        // Also update the learnedSkills array for consistency
        const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        handleInputChange('learnedSkills', skillsArray);
    };

    const availableMBTI = Object.keys(MBTI_PERSONALITIES);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[110] p-4" onClick={handleCancel}>
            <div 
                className="bg-slate-900/95 backdrop-blur-sm border-2 border-yellow-400 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] text-white flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b-2 border-slate-600/80 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-yellow-400">✏️</span>
                        CHỈNH SỬA NHÂN VẬT CHÍNH
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
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Tên nhân vật</label>
                            <input
                                type="text"
                                value={editedPC.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="Nhập tên nhân vật..."
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Giới tính</label>
                            <input
                                type="text"
                                value={editedPC.gender || ''}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="Nam, Nữ, Khác..."
                            />
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Tuổi</label>
                            <input
                                type="text"
                                value={editedPC.age || ''}
                                onChange={(e) => handleInputChange('age', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="Ví dụ: 25, Trung niên..."
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Vị trí</label>
                            <input
                                type="text"
                                value={editedPC.location || ''}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="Vị trí hiện tại..."
                            />
                        </div>
                    </div>

                    {/* Appearance */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Dung mạo</label>
                        <textarea
                            value={editedPC.appearance || ''}
                            onChange={(e) => handleInputChange('appearance', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                            placeholder="Mô tả ngoại hình nhân vật..."
                        />
                    </div>

                    {/* Power Level Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Realm */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Cảnh giới</label>
                            <input
                                type="text"
                                value={editedPC.realm || ''}
                                onChange={(e) => handleInputChange('realm', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="Cảnh giới tu luyện..."
                            />
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Kinh nghiệm</label>
                            <input
                                type="number"
                                value={editedPC.currentExp || 0}
                                onChange={(e) => handleInputChange('currentExp', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Fame */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Danh vọng</label>
                        <input
                            type="text"
                            value={editedPC.fame || ''}
                            onChange={(e) => handleInputChange('fame', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Mức độ nổi tiếng..."
                        />
                    </div>

                    {/* Personality */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Tính cách (Bề ngoài)</label>
                        <textarea
                            value={editedPC.personality || ''}
                            onChange={(e) => handleInputChange('personality', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                            placeholder="Mô tả tính cách bề ngoài..."
                        />
                    </div>

                    {/* MBTI Personality */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Tính cách (Cốt lõi - MBTI)</label>
                        <select
                            value={editedPC.personalityMbti || ''}
                            onChange={(e) => handleInputChange('personalityMbti', e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                            <option value="">-- Chọn loại tính cách --</option>
                            {availableMBTI.map(mbti => (
                                <option key={mbti} value={mbti}>
                                    {mbti} - {MBTI_PERSONALITIES[mbti].title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Motivation */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Động cơ</label>
                        <textarea
                            value={editedPC.motivation || ''}
                            onChange={(e) => handleInputChange('motivation', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                            placeholder="Động cơ và mục tiêu..."
                        />
                    </div>

                    {/* Learned Skills */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Kỹ năng đã học</label>
                        <input
                            type="text"
                            value={(editedPC as any).learnedSkillsText || (Array.isArray(editedPC.learnedSkills) ? editedPC.learnedSkills.join(', ') : '')}
                            onChange={(e) => handleLearnedSkillsChange(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Các kỹ năng đã học, cách nhau bằng dấu phẩy..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả</label>
                        <textarea
                            value={editedPC.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                            placeholder="Mô tả chi tiết về nhân vật..."
                        />
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
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md font-semibold transition-colors"
                    >
                        LƯU
                    </button>
                </div>
            </div>
        </div>
    );
};