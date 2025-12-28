import React, { useState, useEffect } from 'react';
import type { Entity } from './types';
import { MBTI_PERSONALITIES } from './data/mbti';

export interface EditNPCModalProps {
    isOpen: boolean;
    onClose: () => void;
    npc: Entity | null;
    onSaveNPC: (originalNPC: Entity, editedNPC: Entity) => void;
}

export const EditNPCModal: React.FC<EditNPCModalProps> = ({
    isOpen,
    onClose,
    npc,
    onSaveNPC
}) => {
    const [editedNPC, setEditedNPC] = useState<Entity | null>(null);

    useEffect(() => {
        if (npc && isOpen) {
            const editedNPCData = { ...npc };
            // Initialize skillsText from skills array for the input field
            if (Array.isArray(npc.skills)) {
                editedNPCData.skillsText = npc.skills.join(', ');
            }
            setEditedNPC(editedNPCData);
        }
    }, [npc, isOpen]);

    if (!isOpen || !editedNPC) return null;

    const handleInputChange = (field: string, value: any) => {
        setEditedNPC(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = () => {
        if (editedNPC && npc) {
            // Clean up the final data before saving
            const finalNPC = { ...editedNPC };
            
            // Convert skillsText back to skills array if needed
            if ((finalNPC as any).skillsText) {
                const skillsArray = (finalNPC as any).skillsText.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0);
                finalNPC.skills = skillsArray;
                delete (finalNPC as any).skillsText; // Remove the temporary field
                console.log(`✏️ NPC Skills Debug - Converting skillsText: "${(editedNPC as any).skillsText}" to skills array:`, skillsArray);
            } else if (!finalNPC.skills) {
                // Ensure skills is at least an empty array
                finalNPC.skills = [];
                console.log(`✏️ NPC Skills Debug - No skillsText found, setting skills to empty array for "${finalNPC.name}"`);
            }
            
            console.log(`✏️ NPC Edit Save Debug - Final NPC "${finalNPC.name}" skills:`, finalNPC.skills);
            
            onSaveNPC(npc, finalNPC);
            onClose();
        }
    };

    const handleCancel = () => {
        setEditedNPC(null);
        onClose();
    };

    const handleSkillsChange = (skillsText: string) => {
        // Store the skills as a string directly to preserve cursor position
        // Only convert to array when saving
        handleInputChange('skillsText', skillsText);
        
        // Also update the skills array for consistency
        const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        handleInputChange('skills', skillsArray);
    };

    const availableMBTI = Object.keys(MBTI_PERSONALITIES);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[110] p-4" onClick={handleCancel}>
            <div 
                className="bg-slate-900/95 backdrop-blur-sm border-2 border-blue-400 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] text-white flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b-2 border-slate-600/80 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-blue-400">✏️</span>
                        CHỈNH SỬA NPC
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
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Tên NPC</label>
                            <input
                                type="text"
                                value={editedNPC.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tên NPC..."
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Giới tính</label>
                            <input
                                type="text"
                                value={editedNPC.gender || ''}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nam, Nữ, Khác..."
                            />
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Tuổi</label>
                            <input
                                type="text"
                                value={editedNPC.age || ''}
                                onChange={(e) => handleInputChange('age', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ví dụ: 25, Trung niên, Già..."
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Vị trí</label>
                            <input
                                type="text"
                                value={editedNPC.location || ''}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Vị trí hiện tại của NPC..."
                            />
                        </div>
                    </div>

                    {/* Appearance */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Dung mạo</label>
                        <textarea
                            value={editedNPC.appearance || ''}
                            onChange={(e) => handleInputChange('appearance', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Mô tả ngoại hình của NPC..."
                        />
                    </div>

                    {/* Power Level Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Realm */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Cảnh giới</label>
                            <input
                                type="text"
                                value={editedNPC.realm || ''}
                                onChange={(e) => handleInputChange('realm', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Cảnh giới tu luyện..."
                            />
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Kinh nghiệm</label>
                            <input
                                type="number"
                                value={editedNPC.currentExp || 0}
                                onChange={(e) => handleInputChange('currentExp', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Fame */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Danh vọng</label>
                        <input
                            type="text"
                            value={editedNPC.fame || ''}
                            onChange={(e) => handleInputChange('fame', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mức độ nổi tiếng của NPC..."
                        />
                    </div>

                    {/* Personality */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Tính cách (Bề ngoài)</label>
                        <textarea
                            value={editedNPC.personality || ''}
                            onChange={(e) => handleInputChange('personality', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Mô tả tính cách bề ngoài của NPC..."
                        />
                    </div>

                    {/* MBTI Personality */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Tính cách (Cốt lõi - MBTI)</label>
                        <select
                            value={editedNPC.personalityMbti || ''}
                            onChange={(e) => handleInputChange('personalityMbti', e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={editedNPC.motivation || ''}
                            onChange={(e) => handleInputChange('motivation', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Động cơ và mục tiêu của NPC..."
                        />
                    </div>

                    {/* Relationship */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Quan hệ</label>
                        <select
                            value={editedNPC.relationship || ''}
                            onChange={(e) => handleInputChange('relationship', e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">-- Chọn quan hệ --</option>
                            <option value="Người yêu">Người yêu</option>
                            <option value="Tận tụy">Tận tụy</option>
                            <option value="Thù địch">Thù địch</option>
                            <option value="Gia đình">Gia đình</option>
                            <option value="Đồng đội">Đồng đội</option>
                            <option value="Bạn thân">Bạn thân</option>
                            <option value="Thân thiện">Thân thiện</option>
                            <option value="Tôn kính">Tôn kính</option>
                            <option value="Tin tưởng">Tin tưởng</option>
                            <option value="Biết ơn">Biết ơn</option>
                            <option value="Nghi ngờ">Nghi ngờ</option>
                            <option value="Cạnh tranh">Cạnh tranh</option>
                            <option value="Sợ hãi">Sợ hãi</option>
                            <option value="Tò mò">Tò mò</option>
                            <option value="Thận trọng">Thận trọng</option>
                            <option value="Trung lập">Trung lập</option>
                            <option value="Chưa xác định">Chưa xác định</option>
                        </select>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Kỹ năng</label>
                        <input
                            type="text"
                            value={(editedNPC as any).skillsText || (Array.isArray(editedNPC.skills) ? editedNPC.skills.join(', ') : '')}
                            onChange={(e) => handleSkillsChange(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Các kỹ năng, cách nhau bằng dấu phẩy..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả</label>
                        <textarea
                            value={editedNPC.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Mô tả chi tiết về NPC..."
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold transition-colors"
                    >
                        LƯU
                    </button>
                </div>
            </div>
        </div>
    );
};