import React, { useState, useEffect } from 'react';
import type { Entity } from './types';

export interface EditLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: Entity | null;
    onSaveLocation: (originalLocation: Entity, editedLocation: Entity) => void;
}

export const EditLocationModal: React.FC<EditLocationModalProps> = ({
    isOpen,
    onClose,
    location,
    onSaveLocation
}) => {
    const [editedLocation, setEditedLocation] = useState<Entity | null>(null);

    useEffect(() => {
        if (location && isOpen) {
            setEditedLocation({ ...location });
        }
    }, [location, isOpen]);

    if (!isOpen || !editedLocation) return null;

    const handleInputChange = (field: string, value: any) => {
        setEditedLocation(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = () => {
        if (editedLocation && location) {
            onSaveLocation(location, editedLocation);
            onClose();
        }
    };

    const handleCancel = () => {
        setEditedLocation(null);
        onClose();
    };

    const getSafetyStatus = () => {
        if (!editedLocation.description) return '';
        return editedLocation.description.toLowerCase().includes('an toàn') ? 'safe' : 'unknown';
    };

    const handleSafetyChange = (safetyStatus: string) => {
        let currentDesc = editedLocation.description || '';
        
        // Remove existing safety indicators
        currentDesc = currentDesc.replace(/\b(an toàn|không an toàn|nguy hiểm)\b/gi, '').trim();
        
        if (safetyStatus === 'safe') {
            currentDesc = currentDesc ? `${currentDesc}. Khu vực này an toàn.` : 'Khu vực này an toàn.';
        } else if (safetyStatus === 'dangerous') {
            currentDesc = currentDesc ? `${currentDesc}. Khu vực này không an toàn.` : 'Khu vực này không an toàn.';
        }
        
        handleInputChange('description', currentDesc);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[110] p-4" onClick={handleCancel}>
            <div 
                className="bg-slate-900/95 backdrop-blur-sm border-2 border-green-400 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] text-white flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b-2 border-slate-600/80 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-green-400">✏️</span>
                        CHỈNH SỬA ĐỊA ĐIỂM
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Tên địa điểm</label>
                            <input
                                type="text"
                                value={editedLocation.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Nhập tên địa điểm..."
                            />
                        </div>

                        {/* Parent Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Thuộc khu vực</label>
                            <input
                                type="text"
                                value={editedLocation.location || ''}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Khu vực lớn hơn chứa địa điểm này..."
                            />
                        </div>

                        {/* Discovery Status (Read-only display) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Trạng thái khám phá</label>
                            <div className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-400 cursor-not-allowed">
                                🗺️ Đã khám phá
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Trạng thái này được tự động quản lý bởi hệ thống</p>
                        </div>
                    </div>

                    {/* Safety Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Tình trạng an toàn</label>
                        <select
                            value={getSafetyStatus()}
                            onChange={(e) => handleSafetyChange(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">-- Chưa rõ --</option>
                            <option value="safe">🛡️ An toàn</option>
                            <option value="dangerous">⚠️ Nguy hiểm</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Thông tin này sẽ được thêm vào mô tả địa điểm</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả</label>
                        <textarea
                            value={editedLocation.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Mô tả chi tiết về địa điểm, bao gồm cảnh quan, đặc điểm, tình trạng an toàn..."
                        />
                    </div>

                    {/* Additional Location Properties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Climate/Environment */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Khí hậu/Môi trường</label>
                            <input
                                type="text"
                                value={(editedLocation as any).climate || ''}
                                onChange={(e) => handleInputChange('climate', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ví dụ: Ôn đới, Sa mạc, Nhiệt đới..."
                            />
                        </div>

                        {/* Notable Features */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Đặc điểm nổi bật</label>
                            <input
                                type="text"
                                value={(editedLocation as any).features || ''}
                                onChange={(e) => handleInputChange('features', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ví dụ: Núi cao, Hồ lớn, Thành phố cổ..."
                            />
                        </div>
                    </div>

                    {/* Resources/Economy */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Tài nguyên/Kinh tế</label>
                        <textarea
                            value={(editedLocation as any).resources || ''}
                            onChange={(e) => handleInputChange('resources', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Các tài nguyên, hoạt động kinh tế chính của địa điểm..."
                        />
                    </div>

                    {/* Inhabitants */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Cư dân</label>
                        <textarea
                            value={(editedLocation as any).inhabitants || ''}
                            onChange={(e) => handleInputChange('inhabitants', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Thông tin về những ai sống tại đây, dân số, văn hóa..."
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
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition-colors"
                    >
                        LƯU
                    </button>
                </div>
            </div>
        </div>
    );
};