import React, { useState, useEffect, useRef } from 'react';
import PickColourPanel from './PickColourPanel';
import { useGame } from '../contexts/GameContext';
import { DisplaySettings } from '../types';
import { DEFAULT_DISPLAY_SETTINGS } from '../constants';

// Reusable component for color picker input
const ColorPickerInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="p-[1px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg shadow-md">
                <button
                    type="button"
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    style={{ backgroundColor: value }}
                    className="w-full h-10 border-none rounded-[7px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 cursor-pointer"
                    aria-label={`${label}: ${value}. Click to change color.`}
                />
            </div>
            {isPickerOpen && (
                <div className="absolute top-full mt-2 z-10 left-0">
                    <PickColourPanel color={value} onChange={onChange} onClose={() => setIsPickerOpen(false)} />
                </div>
            )}
        </div>
    );
};

// Reusable component for font/size dropdowns
const SelectInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; children: React.ReactNode; id: string; }> = ({ label, value, onChange, children, id }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="relative p-[1px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-md shadow-md">
            <select 
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 px-3 bg-slate-700 border-none rounded-[5px] text-slate-200 focus:outline-none focus:ring-0 appearance-none"
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    </div>
);

// Reusable component for a titled section of controls
const SettingsSection: React.FC<{ title: string; onRestore: () => void; children: React.ReactNode }> = ({ title, onRestore, children }) => (
    <div className="p-[1px] bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-secondary-dark)] rounded-lg">
        <div className="bg-slate-800 rounded-[7px] p-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)]">{title}</h4>
                <div className="p-[1px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-md">
                    <button
                        onClick={onRestore}
                        className="px-3 py-1.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-[var(--color-accent-light)] rounded-[5px] transition-colors"
                    >
                        Khôi phục
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {children}
            </div>
        </div>
    </div>
);

interface FontAndColorSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const FontAndColorSettings: React.FC<FontAndColorSettingsProps> = ({ isOpen, onClose }) => {
    const { appSettings, handleSettingsChange } = useGame();
    const [settings, setSettings] = useState<DisplaySettings>(appSettings.displaySettings);
    
    const fontOptions = ['Arial', 'Times New Roman', 'Inter', 'Be Vietnam Pro', 'Courier New'];
    const sizeOptions = ['12px', '14px', '16px', '18px', '20px', '22px', '24px'];

    useEffect(() => {
        if (isOpen) {
            setSettings(appSettings.displaySettings);
        }
    }, [isOpen, appSettings.displaySettings]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        handleSettingsChange({ ...appSettings, displaySettings: settings });
        onClose();
    };
    
    const updateSetting = (section: keyof DisplaySettings, key: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const restoreSection = (section: keyof DisplaySettings) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...DEFAULT_DISPLAY_SETTINGS[section]
            }
        }));
    };

    return (
        <>
            <style>{`
                .scrollbar-custom::-webkit-scrollbar { width: 8px; }
                .scrollbar-custom::-webkit-scrollbar-track { background-color: #1e293b; }
                .scrollbar-custom::-webkit-scrollbar-thumb { background-color: var(--color-primary); border-radius: 4px; }
                .scrollbar-custom::-webkit-scrollbar-thumb:hover { background-color: var(--color-primary-light); }
            `}</style>
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="display-settings-title"
            >
                <div 
                    className="p-[1px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg shadow-2xl w-11/12 max-w-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-slate-800 rounded-[7px] flex flex-col max-h-[90vh]">
                        <header className="p-4 flex justify-between items-center flex-shrink-0">
                            <h3 id="display-settings-title" className="text-xl font-bold text-slate-100">Cài Đặt Hiển Thị Gameplay</h3>
                        </header>
                         <hr className="border-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent flex-shrink-0" />
                        <main className="p-6 flex-grow overflow-y-auto space-y-4 scrollbar-custom">
                            <SettingsSection title="Diễn Biến (Tường Thuật)" onRestore={() => restoreSection('aiNarrative')}>
                                 <SelectInput label="Font Chữ" id="ai-font" value={settings.aiNarrative.font} onChange={v => updateSetting('aiNarrative', 'font', v)}>
                                     {fontOptions.map(font => <option key={font}>{font}</option>)}
                                 </SelectInput>
                                 <SelectInput label="Cỡ Chữ" id="ai-size" value={settings.aiNarrative.size} onChange={v => updateSetting('aiNarrative', 'size', v)}>
                                     {sizeOptions.map(size => <option key={size}>{size}</option>)}
                                 </SelectInput>
                                 <ColorPickerInput label="Màu Chữ" value={settings.aiNarrative.textColor} onChange={v => updateSetting('aiNarrative', 'textColor', v)} />
                            </SettingsSection>
                             <SettingsSection title="Hộp Thoại Người Chơi" onRestore={() => restoreSection('playerDialogue')}>
                                 <SelectInput label="Font Chữ" id="player-font" value={settings.playerDialogue.font} onChange={v => updateSetting('playerDialogue', 'font', v)}>
                                     {fontOptions.map(font => <option key={font}>{font}</option>)}
                                 </SelectInput>
                                 <SelectInput label="Cỡ Chữ" id="player-size" value={settings.playerDialogue.size} onChange={v => updateSetting('playerDialogue', 'size', v)}>
                                     {sizeOptions.map(size => <option key={size}>{size}</option>)}
                                 </SelectInput>
                                 <ColorPickerInput label="Màu Chữ" value={settings.playerDialogue.textColor} onChange={v => updateSetting('playerDialogue', 'textColor', v)} />
                                 <ColorPickerInput label="Màu Nền" value={settings.playerDialogue.bgColor!} onChange={v => updateSetting('playerDialogue', 'bgColor', v)} />
                            </SettingsSection>
                             <SettingsSection title="Hộp Thoại NPC" onRestore={() => restoreSection('npcDialogue')}>
                                 <SelectInput label="Font Chữ" id="npc-font" value={settings.npcDialogue.font} onChange={v => updateSetting('npcDialogue', 'font', v)}>
                                     {fontOptions.map(font => <option key={font}>{font}</option>)}
                                 </SelectInput>
                                 <SelectInput label="Cỡ Chữ" id="npc-size" value={settings.npcDialogue.size} onChange={v => updateSetting('npcDialogue', 'size', v)}>
                                     {sizeOptions.map(size => <option key={size}>{size}</option>)}
                                 </SelectInput>
                                 <ColorPickerInput label="Màu Chữ" value={settings.npcDialogue.textColor} onChange={v => updateSetting('npcDialogue', 'textColor', v)} />
                                 <ColorPickerInput label="Màu Nền" value={settings.npcDialogue.bgColor!} onChange={v => updateSetting('npcDialogue', 'bgColor', v)} />
                            </SettingsSection>
                             <SettingsSection title="Tên Nhân Vật" onRestore={() => restoreSection('characterName')}>
                                 <SelectInput label="Font Chữ" id="char-name-font" value={settings.characterName.font} onChange={v => updateSetting('characterName', 'font', v)}>
                                    {fontOptions.map(font => <option key={font}>{font}</option>)}
                                 </SelectInput>
                                 <SelectInput label="Cỡ Chữ" id="char-name-size" value={settings.characterName.size} onChange={v => updateSetting('characterName', 'size', v)}>
                                    {sizeOptions.map(size => <option key={size}>{size}</option>)}
                                 </SelectInput>
                                 <ColorPickerInput label="Màu Chữ" value={settings.characterName.textColor} onChange={v => updateSetting('characterName', 'textColor', v)} />
                            </SettingsSection>
                        </main>
                         <hr className="border-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent flex-shrink-0" />
                        <footer className="relative p-4 bg-slate-800/80 flex justify-end flex-shrink-0 space-x-3">
                            <button onClick={onClose} className="px-5 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm font-semibold transition-colors duration-200">
                                Hủy
                            </button>
                            <button onClick={handleSave} className="px-5 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:from-[var(--color-primary-light)] hover:to-[var(--color-primary)] rounded-md text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[var(--color-primary)]">
                                Lưu
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FontAndColorSettings;