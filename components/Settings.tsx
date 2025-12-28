import React, { useState, useEffect } from 'react';
import { AppSettings, Rarity, ColorTheme } from '../types';
import { deleteAllData, saveApiKeys, loadApiKeys } from '../services/storageService';
import { useGame } from '../contexts/GameContext';
import { reinitializeAiClient } from '../services/geminiService';
import FontAndColorSettings from './FontAndColorSettings';

interface SettingsProps {
    onClose: () => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number, step?: number, displayFormat?: (value: number) => string }> = ({ label, value, onChange, min = 0, max = 1, step = 0.01, displayFormat }) => (
    <div>
        <label className="block text-[var(--color-text-medium)] mb-2">{label}: {displayFormat ? displayFormat(value) : `${Math.round(value * 100)}%`}</label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
    const { appSettings, handleSettingsChange } = useGame();
    const [currentSettings, setCurrentSettings] = useState<AppSettings>(appSettings);
    const [apiKeysInput, setApiKeysInput] = useState('');
    const [notification, setNotification] = useState('');
    const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);


    useEffect(() => {
        const savedKeys = loadApiKeys();
        setApiKeysInput(savedKeys.join('\n'));
    }, []);
    
    useEffect(() => {
        // When the modal is re-opened, sync with the global state.
        setCurrentSettings(appSettings);
    }, [appSettings]);


    const handleChange = (field: keyof AppSettings, value: any) => {
        setCurrentSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleAutoDismantleChange = (rarity: Rarity) => (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange('autoDismantleRarities', { ...currentSettings.autoDismantleRarities, [rarity]: e.target.checked });
    };

    const handleSave = () => {
        const keysToSave = apiKeysInput.split('\n').map(k => k.trim()).filter(Boolean);
        saveApiKeys(keysToSave);
        reinitializeAiClient();
        handleSettingsChange(currentSettings);
        setNotification('Cài đặt đã được lưu!');
        setTimeout(() => setNotification(''), 3000);
    };

    const handleDeleteAll = () => {
        if (window.confirm("BẠN CÓ CHẮC KHÔNG? Hành động này sẽ xóa TẤT CẢ dữ liệu game, bao gồm các file lưu và cài đặt API Key. KHÔNG THỂ HOÀN TÁC.")) {
            deleteAllData();
            alert("Đã xóa tất cả dữ liệu. Trang sẽ được tải lại.");
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl text-white relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10">&times;</button>
                <h2 className="text-3xl font-bold text-center text-purple-400 mb-6 flex-shrink-0">Thiết Lập</h2>
                
                {notification && <div className="bg-green-800 text-green-200 p-3 rounded-lg mb-4 text-center">{notification}</div>}

                <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                    {/* API Keys Section */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">Google Gemini API Keys</h3>
                        <p className="text-sm text-gray-400 mb-2">Nhập API Key của bạn tại đây. Nếu bạn đặt biến môi trường API_KEY, nó sẽ được ưu tiên sử dụng.</p>
                        <textarea
                            value={apiKeysInput}
                            onChange={(e) => setApiKeysInput(e.target.value)}
                            rows={4}
                            placeholder="Nhập API Key của bạn..."
                            className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:border-purple-500 outline-none"
                        />
                    </div>
                    
                    {/* Gameplay Section */}
                    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">Gameplay</h3>
                        <Slider 
                            label="Tần suất sự kiện ngẫu nhiên" 
                            value={currentSettings.eventFrequency} 
                            onChange={e => handleChange('eventFrequency', parseFloat(e.target.value))}
                        />
                         <Slider 
                            label="Tần suất Lời kể AI" 
                            value={currentSettings.proactiveNarrationFrequency} 
                            onChange={e => handleChange('proactiveNarrationFrequency', parseFloat(e.target.value))}
                        />
                         <div>
                            <label className="block text-gray-300 mb-2">Tự động phân giải vật phẩm</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.values(Rarity).map(rarity => (
                                    <div key={rarity} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`dismantle-${rarity}`}
                                            checked={currentSettings.autoDismantleRarities[rarity]}
                                            onChange={handleAutoDismantleChange(rarity)}
                                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <label htmlFor={`dismantle-${rarity}`} className="ml-2 text-sm text-gray-400">{rarity}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Accessibility & Display Section */}
                    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">Hiển Thị & Trợ Năng</h3>
                        <div>
                            <label htmlFor="color-theme" className="block text-gray-300 mb-2">Chủ đề màu sắc</label>
                            <select
                                id="color-theme"
                                value={currentSettings.colorTheme}
                                onChange={(e) => handleChange('colorTheme', e.target.value as ColorTheme)}
                                className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"
                            >
                                {Object.values(ColorTheme).map(theme => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="reduce-motion"
                                checked={currentSettings.reduceMotion}
                                onChange={(e) => handleChange('reduceMotion', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="reduce-motion" className="ml-2 text-sm text-gray-300">Giảm chuyển động (tắt hiệu ứng)</label>
                        </div>
                         <button onClick={() => setIsDisplaySettingsOpen(true)} className="w-full mt-2 text-white font-bold py-2 px-4 rounded-lg transition duration-300 bg-blue-600 hover:bg-blue-700">
                            Tùy Chỉnh Font & Màu Sắc...
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-red-300">Vùng Nguy Hiểm</h3>
                        <button onClick={handleDeleteAll} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                            Xóa Toàn Bộ Dữ Liệu Game
                        </button>
                    </div>
                </div>

                <div className="flex-shrink-0 pt-6 flex justify-end gap-4 border-t border-gray-700">
                     <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">
                        Đóng
                    </button>
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg">
                        Lưu Cài Đặt
                    </button>
                </div>
            </div>
            <FontAndColorSettings isOpen={isDisplaySettingsOpen} onClose={() => setIsDisplaySettingsOpen(false)} />
        </div>
    );
};

export default Settings;