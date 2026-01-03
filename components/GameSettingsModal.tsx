import React, { useState, useEffect } from 'react';
import { CrossIcon } from './Icons.tsx';

export interface GameSettings {
    fontSize: number;
    fontFamily: string;
    memoryAutoClean: boolean;
    historyAutoCompress: boolean;
    themeColor: string;
}

const DEFAULT_SETTINGS: GameSettings = {
    fontSize: 16,
    fontFamily: 'Inter',
    memoryAutoClean: true,
    historyAutoCompress: true,
    themeColor: 'purple',
};

const FONT_FAMILIES = [
    { value: 'Inter', label: 'Inter (Mặc định)' },
    { value: 'Merriweather', label: 'Merriweather (Serif)' },
    { value: 'Lora', label: 'Lora (Serif)' },
    { value: 'Roboto Mono', label: 'Roboto Mono (Monospace)' },
    { value: 'Source Code Pro', label: 'Source Code Pro (Monospace)' }
];

export const THEME_COLORS = [
    {
        id: 'dark-slate',
        name: 'Đen Xám Đậm',
        description: 'Tối tăm và bí ẩn',
        colors: {
            primary: 'from-slate-900 via-slate-800 to-slate-900',
            secondary: 'from-gray-800 to-slate-900',
            accent: 'from-slate-600 to-gray-700',
            text: 'slate-200'
        },
        preview: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    },
    {
        id: 'deep-blue',
        name: 'Xanh Dương Đậm',
        description: 'Sâu thẳm như đại dương',
        colors: {
            primary: 'from-slate-900 via-blue-900 to-slate-900',
            secondary: 'from-blue-800 to-slate-900',
            accent: 'from-blue-600 to-indigo-700',
            text: 'blue-200'
        },
        preview: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
    },
    {
        id: 'purple',
        name: 'Tím Hoàng Gia',
        description: 'Hiện tại (Mặc định)',
        colors: {
            primary: 'from-slate-900 via-purple-900 to-slate-900',
            secondary: 'from-purple-800 to-slate-900',
            accent: 'from-purple-600 to-pink-700',
            text: 'purple-200'
        },
        preview: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    },
    {
        id: 'emerald',
        name: 'Ngọc Lục Bảo',
        description: 'Tươi mát và thanh lịch',
        colors: {
            primary: 'from-slate-900 via-emerald-900 to-slate-900',
            secondary: 'from-emerald-800 to-slate-900',
            accent: 'from-emerald-600 to-teal-700',
            text: 'emerald-200'
        },
        preview: 'bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900'
    },
    {
        id: 'rose-gold',
        name: 'Hồng Vàng',
        description: 'Ấm áp và lãng mạn',
        colors: {
            primary: 'from-slate-800 via-rose-900 to-orange-900',
            secondary: 'from-rose-800 to-orange-800',
            accent: 'from-rose-600 to-orange-600',
            text: 'rose-200'
        },
        preview: 'bg-gradient-to-br from-slate-800 via-rose-900 to-orange-900'
    },
    {
        id: 'sunset',
        name: 'Hoàng Hôn',
        description: 'Sáng sủa như hoàng hôn',
        colors: {
            primary: 'from-orange-800 via-red-900 to-pink-800',
            secondary: 'from-red-700 to-pink-800',
            accent: 'from-orange-500 to-red-600',
            text: 'orange-200'
        },
        preview: 'bg-gradient-to-br from-orange-800 via-red-900 to-pink-800'
    }
];

export const GameSettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: GameSettings;
    onSettingsChange: (settings: GameSettings) => void;
}> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const [localSettings, setLocalSettings] = useState<GameSettings>(() => ({
        ...DEFAULT_SETTINGS,
        ...settings
    }));

    useEffect(() => {
        setLocalSettings(prev => ({
            ...DEFAULT_SETTINGS,
            ...settings
        }));
    }, [settings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSettingsChange(localSettings);
        onClose();
    };

    const handleReset = () => {
        setLocalSettings(DEFAULT_SETTINGS);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white/95 dark:bg-[#2a2f4c]/95 backdrop-blur-sm border-2 border-blue-400 rounded-lg shadow-2xl w-full max-w-2xl text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b-2 border-blue-400 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3">
                        <span className="text-3xl">⚙️</span>
                        Cài Đặt Game
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none"
                    >
                        <CrossIcon className="w-6 h-6"/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Font Settings */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-gray-100 border-b border-slate-300 dark:border-slate-600 pb-2">
                            🔤 Cài Đặt Font
                        </h4>
                        
                        {/* Font Size */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                                Kích cỡ font: {localSettings.fontSize}px
                            </label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500">12px</span>
                                <input
                                    type="range"
                                    min="12"
                                    max="24"
                                    step="1"
                                    value={localSettings.fontSize || 16}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <span className="text-sm text-slate-500">24px</span>
                            </div>
                            <div 
                                className="p-3 bg-slate-100 dark:bg-slate-800 rounded border text-center"
                                style={{ fontSize: `${localSettings.fontSize}px`, fontFamily: localSettings.fontFamily }}
                            >
                                Đây là văn bản mẫu với font hiện tại
                            </div>
                        </div>

                        {/* Font Family */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                                Loại font
                            </label>
                            <select
                                value={localSettings.fontFamily || 'Inter'}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {FONT_FAMILIES.map(font => (
                                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Theme Color Settings */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-gray-100 border-b border-slate-300 dark:border-slate-600 pb-2">
                            🎨 Màu Chủ Đề
                        </h4>
                        
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Chọn bảng màu để thay đổi giao diện game
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {THEME_COLORS.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setLocalSettings(prev => ({ ...prev, themeColor: theme.id }))}
                                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                            localSettings.themeColor === theme.id
                                                ? 'border-blue-500 shadow-lg scale-105'
                                                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:scale-102'
                                        }`}
                                    >
                                        {/* Preview */}
                                        <div className={`w-full h-16 rounded-lg mb-3 ${theme.preview} relative overflow-hidden`}>
                                            {/* Floating orbs simulation */}
                                            <div className="absolute top-2 left-2 w-4 h-4 bg-white/20 rounded-full blur-sm"></div>
                                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-white/10 rounded-full blur-md"></div>
                                            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/15 rounded-full blur-sm"></div>
                                        </div>
                                        
                                        {/* Theme Info */}
                                        <div className="text-left">
                                            <h5 className="font-semibold text-slate-800 dark:text-gray-100 text-sm">
                                                {theme.name}
                                            </h5>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                {theme.description}
                                            </p>
                                        </div>
                                        
                                        {/* Selected indicator */}
                                        {localSettings.themeColor === theme.id && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Performance Settings */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-gray-100 border-b border-slate-300 dark:border-slate-600 pb-2">
                            ⚡ Cài Đặt Hiệu Suất
                        </h4>

                        {/* Memory Auto Clean */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🧹</span>
                                    <span className="font-semibold text-slate-800 dark:text-gray-100">
                                        Tự động dọn dẹp bộ nhớ
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Tự động xóa các thông tin cũ để giảm tải bộ nhớ và cải thiện hiệu suất
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSettings.memoryAutoClean ?? true}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, memoryAutoClean: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* History Auto Compress */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📦</span>
                                    <span className="font-semibold text-slate-800 dark:text-gray-100">
                                        Tự động nén lịch sử
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Tự động nén lịch sử game cũ để tiết kiệm dung lượng lưu trữ
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSettings.historyAutoCompress ?? true}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, historyAutoCompress: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Current Settings Info */}
                    <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h5 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                            <span>ℹ️</span>
                            Cài đặt hiện tại
                        </h5>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <div>Font: {localSettings.fontFamily} - {localSettings.fontSize}px</div>
                            <div>Màu chủ đề: {THEME_COLORS.find(t => t.id === localSettings.themeColor)?.name || 'Tím Hoàng Gia'}</div>
                            <div>Dọn dẹp bộ nhớ: {localSettings.memoryAutoClean ? '✅ Bật' : '❌ Tắt'}</div>
                            <div>Nén lịch sử: {localSettings.historyAutoCompress ? '✅ Bật' : '❌ Tắt'}</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors duration-200 flex items-center gap-2"
                    >
                        🔄 Đặt lại mặc định
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors duration-200"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                            💾 Lưu cài đặt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};