import React, { useState, useCallback, useEffect } from 'react';
import { Character, GameScreen, ExplorationEventLog, Poi, LogType } from '../types';
import { useGame } from '../contexts/GameContext';
import InventoryScreen from './InventoryScreen';
import ResourcesScreen from './ResourcesScreen';
import QuestLog from './QuestLog';
import PetScreen from './PetScreen';
import CharacterSheet from './CharacterSheet';
import CultivationScreen from './CultivationScreen';
import FactionScreen from './FactionScreen';
import BestiaryScreen from './BestiaryScreen';
import WorldMap from './WorldMap'; // Import WorldMap directly
import NpcListScreen from './NpcListScreen';
import StoryLog from './StoryLog';
import CompanionScreen from './CompanionScreen';
import LibraryModal from './LibraryModal';

type MainView = 'overview' | 'inventory' | 'resources' | 'quests' | 'pets' | 'companions' | 'cultivation' | 'factions' | 'npcs' | 'bestiary' | 'map';

// --- SUB-COMPONENTS for the new layout ---

const StatBox: React.FC<{ label: string; value: string | number; colorClass?: string }> = ({ label, value, colorClass = "text-[var(--color-text-light)]" }) => (
    <div className="bg-[var(--color-bg-tertiary)]/80 border border-[var(--color-border-base)] rounded-lg px-3 py-2 flex justify-between items-center text-sm shadow-sm backdrop-blur-sm hover:border-[var(--color-primary-light)] transition-colors">
      <span className="text-[var(--color-text-medium)] font-medium">{label}</span>
      <span className={`font-bold font-mono ${colorClass}`}>{value}</span>
    </div>
);

const InGameCharacterPanel: React.FC = () => {
    const { character } = useGame();
    const [activeTab, setActiveTab] = useState<'info' | 'skills'>('info');
    if (!character) return null;

    const { baseStats, derivedStats, skills, level, realm } = character;

    const TabButton: React.FC<{ label: string, view: 'info' | 'skills', currentView: string }> = ({ label, view, currentView }) => (
        <button
            onClick={() => setActiveTab(view)}
            className={`flex-1 pb-2 text-sm font-bold tracking-wide transition-all ${currentView === view ? 'text-[var(--color-primary-light)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-text-dark)] hover:text-[var(--color-text-medium)] border-b-2 border-transparent'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center mb-4">
                <TabButton label="CHỈ SỐ" view="info" currentView={activeTab} />
                <TabButton label="KỸ NĂNG" view="skills" currentView={activeTab} />
            </div>
            <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {activeTab === 'info' && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-[var(--color-primary-light)]">{character.name}</h3>
                            <p className="text-xs text-[var(--color-text-medium)] uppercase tracking-wider">{character.playerClass} • Cấp {level}</p>
                            <div className="mt-1 inline-block px-3 py-0.5 bg-yellow-900/30 border border-yellow-600/50 rounded-full">
                                <span className="text-xs font-bold text-yellow-400">{realm.name}</span>
                            </div>
                        </div>
                        <StatBox label="Sinh Lực" value={`${Math.round(character.currentHp)}/${derivedStats.HP}`} colorClass="text-red-400" />
                        <StatBox label="Linh Lực" value={`${Math.round(character.currentMp)}/${derivedStats.MP}`} colorClass="text-blue-400" />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <StatBox label="STR" value={baseStats.STR} />
                            <StatBox label="INT" value={baseStats.INT} />
                            <StatBox label="AGI" value={baseStats.AGI} />
                            <StatBox label="CON" value={baseStats.CON} />
                        </div>
                        <div className="pt-2 border-t border-[var(--color-border-base)] mt-2">
                             <StatBox label="Tấn Công" value={derivedStats.ATK} />
                             <StatBox label="Phòng Thủ" value={derivedStats.DEF} />
                        </div>
                    </div>
                )}
                {activeTab === 'skills' && (
                    <div className="space-y-2 animate-fade-in">
                        {skills.length > 0 ? skills.slice(0, 10).map(skill => (
                            <div key={skill.id} className="bg-[var(--color-bg-tertiary)]/50 p-2 rounded-lg border border-transparent hover:border-[var(--color-primary)] transition-colors group cursor-help">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-[var(--color-primary-light)] group-hover:text-white transition-colors">{skill.name}</p>
                                    <span className="text-[10px] bg-black/40 px-1.5 rounded text-gray-400">{skill.mpCost} MP</span>
                                </div>
                                <p className="text-xs text-[var(--color-text-dark)] italic truncate mt-1 group-hover:text-gray-300 transition-colors">{skill.description}</p>
                            </div>
                        )) : <div className="text-center p-4 text-[var(--color-text-dark)] italic">Chưa học kỹ năng nào.</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

const NpcProfilePanel: React.FC = () => {
    const { character } = useGame();
    if (!character) return null;

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-sm font-bold text-[var(--color-text-medium)] uppercase tracking-wider mb-3 flex-shrink-0 border-b border-[var(--color-border-base)] pb-2">Nhân Mạch Gần Đây</h3>
            <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {character.metNpcs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-dark)] italic">
                        <p>Chưa gặp gỡ ai...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {character.metNpcs.slice(0, 5).map(npc => (
                             <div key={npc.name} className="bg-[var(--color-bg-tertiary)]/60 p-3 rounded-lg flex items-center gap-3 border border-transparent hover:border-[var(--color-primary)] transition-all">
                                <img src={npc.imageUrl || 'https://via.placeholder.com/40'} alt={npc.name} className="w-10 h-10 rounded-full object-cover border border-[var(--color-primary-dark)]"/>
                                <div>
                                    <p className="font-semibold text-sm text-[var(--color-text-light)]">{npc.name}</p>
                                    <p className="text-[10px] text-[var(--color-text-dark)] uppercase">{npc.role}</p>
                                </div>
                                <div className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${npc.affinity > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {npc.affinity}
                                </div>
                            </div>
                        ))}
                        {character.metNpcs.length > 5 && (
                            <p className="text-center text-xs text-[var(--color-text-dark)] pt-2">Và {character.metNpcs.length - 5} người khác...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


const WorldHeader: React.FC<{
    onForge: () => void;
    onMenu: () => void;
    onSaveLoad: () => void;
    onExit: () => void;
    onLibrary: () => void;
}> = ({ onForge, onMenu, onSaveLoad, onExit, onLibrary }) => {
    return (
        <header className="flex-shrink-0 flex justify-between items-center relative py-2 px-1 mb-2">
            <div className="flex items-center gap-2">
                <button onClick={onForge} className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-quaternary)] border border-[var(--color-border-base)] rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2 shadow-sm">
                    <span className="text-yellow-400 text-lg">⚡</span> <span className="hidden sm:inline">Sáng Tạo</span>
                </button>
                <button onClick={onLibrary} className="bg-[var(--color-bg-secondary)] hover:bg-cyan-900/20 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-cyan-300 transition-all hover:scale-105 flex items-center gap-2 shadow-sm">
                    <span className="text-lg">🌐</span> <span className="hidden sm:inline">Tàng Thư</span>
                </button>
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={onMenu} className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-primary-light)] text-white border border-transparent rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all hover:scale-105 shadow-lg shadow-purple-900/50 flex items-center gap-2">
                    <span>📖</span> Sổ Tay
                </button>
                <button onClick={onSaveLoad} className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-quaternary)] border border-[var(--color-border-base)] rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors">
                    Lưu
                </button>
                <button onClick={onExit} className="bg-[var(--color-bg-secondary)] hover:bg-red-900/30 border border-[var(--color-border-base)] hover:border-red-500/30 text-red-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors">
                    Thoát
                </button>
            </div>
        </header>
    );
};


const PlayerInputFooter: React.FC<{
    onActionSubmit: (action: string) => void;
    isProcessing: boolean;
}> = ({ onActionSubmit, isProcessing }) => {
    const { contextualActions, isActionLocked, handleGenerateContextualActions, handleGetAIAdvice } = useGame();
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [inputText, setInputText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            onActionSubmit(inputText.trim());
            setInputText('');
        }
    };

    const handleSuggestionClick = (action: string) => {
        onActionSubmit(action);
    };

    return (
        <footer className="flex-shrink-0 mt-2 pt-2 pb-2 bg-[var(--color-bg-main)] z-20">
            {!isPanelOpen ? (
                 <div className="flex justify-center">
                    <button onClick={() => setIsPanelOpen(true)} className="bg-[var(--color-bg-secondary)] border border-[var(--color-primary)] rounded-full px-4 py-2 text-sm font-semibold hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        Hành Động
                    </button>
                </div>
            ) : (
                <div className="bg-[var(--color-bg-secondary)]/90 backdrop-blur-md border border-[var(--color-border-base)] rounded-xl p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                     {contextualActions.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-3 animate-fade-in">
                            {contextualActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(action)}
                                    disabled={isProcessing}
                                    className="bg-gray-700/50 hover:bg-[var(--color-primary-dark)]/50 text-gray-200 hover:text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition-all border border-gray-600 hover:border-[var(--color-primary-light)]"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}
                     <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <button 
                            type="button" 
                            onClick={handleGenerateContextualActions} 
                            disabled={isActionLocked || isProcessing}
                            className="bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-quaternary)] text-[var(--color-accent-light)] font-bold p-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center border border-[var(--color-border-base)] shadow-sm w-10 h-10 flex-shrink-0"
                            title="Gợi ý hành động bằng AI"
                        >
                            {isActionLocked 
                                ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                : '💡'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleGetAIAdvice} 
                            disabled={isActionLocked || isProcessing}
                            className="bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/50 text-purple-300 font-bold p-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center shadow-sm w-10 h-10 flex-shrink-0"
                            title="Cầu viện (Xin lời khuyên chiến thuật)"
                        >
                            🔮
                        </button>
                        <input 
                            type="text" 
                            value={inputText} 
                            onChange={e => setInputText(e.target.value)} 
                            disabled={isProcessing}
                            placeholder="Bạn muốn làm gì tiếp theo?"
                            className="flex-1 bg-[var(--color-bg-main)] border border-[var(--color-border-base)] rounded-lg py-2 px-4 text-white placeholder-[var(--color-text-dark)] focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-1 focus:ring-[var(--color-primary-light)] transition text-sm sm:text-base"
                        />
                        <button type="submit" disabled={isProcessing || !inputText.trim()} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 shadow-md">
                            Gửi
                        </button>
                    </form>
                    <button onClick={() => setIsPanelOpen(false)} className="w-full text-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto text-gray-500 hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            )}
        </footer>
    );
};

// --- Menu Modal Component ---
const MenuModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeView, setActiveView] = useState<MainView>('overview');
    const { character, worldState, handleOpenDialogue } = useGame();

    if (!character) return null;

    const renderMainView = () => {
        switch(activeView) {
            case 'overview': return <CharacterSheet character={character} />;
            case 'inventory': return <InventoryScreen />;
            case 'resources': return <ResourcesScreen character={character} />;
            case 'quests': return <QuestLog />;
            case 'pets': return <PetScreen />;
            case 'companions': return <CompanionScreen />;
            case 'cultivation': return <CultivationScreen />;
            case 'factions': return <FactionScreen />;
            case 'npcs': return <NpcListScreen />;
            case 'bestiary': return <BestiaryScreen />;
            case 'map': return <WorldMap 
                                    pois={worldState.pois} 
                                    playerPosition={character.position} 
                                    onPoiClick={(id) => {
                                        onClose();
                                        handleOpenDialogue(id);
                                    }} 
                                />;
            default: return null;
        }
    };
    
    const NavButton: React.FC<{view: MainView, label: string, icon: string}> = ({view, label, icon}) => (
        <button 
            onClick={() => setActiveView(view)}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${activeView === view ? 'bg-[var(--color-primary-dark)] text-white shadow-md transform scale-105' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-quaternary)] text-[var(--color-text-medium)]'}`}
        >
            <span>{icon}</span> {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] animate-fade-in p-2 sm:p-6 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-base)] shadow-[0_0_25px_var(--color-primary-dark)] rounded-2xl w-full max-w-7xl h-[95vh] sm:h-[90vh] text-white relative flex flex-col overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
                <button onClick={onClose} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-white text-3xl z-20 transition-transform hover:rotate-90">&times;</button>
                
                <nav className="w-full flex-shrink-0 bg-[var(--color-bg-main)]/80 p-3 border-b border-[var(--color-border-base)]">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <NavButton view="overview" label="Tổng Quan" icon="👤" />
                        <NavButton view="inventory" label="Hành Trang" icon="🎒" />
                        <NavButton view="map" label="Bản Đồ" icon="🗺️" />
                        <NavButton view="cultivation" label="Công Pháp" icon="🧘" />
                        <NavButton view="companions" label="Đồng Hành" icon="👥" />
                        <NavButton view="quests" label="Nhiệm Vụ" icon="📜" />
                        <NavButton view="pets" label="Thú Cưng" icon="🐾" />
                        <NavButton view="factions" label="Phe Phái" icon="🚩" />
                        <NavButton view="npcs" label="Nhân Mạch" icon="🗣️" />
                        <NavButton view="bestiary" label="Sách Yêu" icon="👹" />
                        <NavButton view="resources" label="Tài Nguyên" icon="💎" />
                    </div>
                </nav>
                <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-black/20 custom-scrollbar">
                    {renderMainView()}
                </div>
            </div>
        </div>
    );
};


const WorldScreen: React.FC = () => {
    const { 
        character, 
        oneTimeMessages,
        setOneTimeMessages,
        handleOpenForge, 
        handleOpenMenu,
        handleBackToMenu,
        handlePlayerAction,
        isActionLocked,
    } = useGame();

    const [eventLog, setEventLog] = useState<ExplorationEventLog[]>([]);
    
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    useEffect(() => {
        const initialLogs: ExplorationEventLog[] = [];
        if (oneTimeMessages && oneTimeMessages.length > 0) {
            initialLogs.push(...oneTimeMessages);
            setOneTimeMessages([]);
        }
        
        if (eventLog.length === 0 && initialLogs.length === 0) {
             initialLogs.push({ id: crypto.randomUUID(), text: "Màn sương mờ ảo dần tan, hé lộ một thế giới vừa quen vừa lạ. Hành trình của bạn, từ đây, chính thức bắt đầu...", type: LogType.NARRATIVE });
        }

        if (initialLogs.length > 0) {
            setEventLog(prev => [...initialLogs, ...prev].slice(0, 100));
        }
    }, [oneTimeMessages, setOneTimeMessages, eventLog.length]);


    if (!character) {
        return null;
    }

    const handleBackToMenuWithConfirmation = useCallback(() => {
        if (window.confirm("Bạn có chắc muốn trở về menu chính? Mọi tiến trình chưa lưu sẽ bị mất.")) {
            handleBackToMenu();
        }
    }, [handleBackToMenu]);

    return (
        <>
            <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-light)] p-2 sm:p-4 flex flex-col font-sans max-h-screen overflow-hidden">
                <WorldHeader
                    onForge={handleOpenForge}
                    onMenu={() => setIsMenuModalOpen(true)}
                    onSaveLoad={() => handleOpenMenu(GameScreen.SAVE_MANAGEMENT)}
                    onExit={handleBackToMenuWithConfirmation}
                    onLibrary={() => setIsLibraryOpen(true)}
                />
                
                <main className="flex-grow grid grid-cols-1 lg:grid-cols-10 gap-4 mt-2 overflow-hidden h-full">
                    {/* Left Panel: Character Stats */}
                    <div className="hidden lg:block lg:col-span-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-base)] shadow-lg rounded-xl p-3 h-full overflow-hidden flex flex-col relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none rounded-xl"></div>
                        <InGameCharacterPanel />
                    </div>

                    {/* Middle Panel: Story Log - Wider focus */}
                    <div className="col-span-1 lg:col-span-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border-base)] shadow-[0_0_15px_rgba(0,0,0,0.3)] rounded-xl p-4 flex flex-col h-full overflow-hidden relative">
                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--color-primary-light)] rounded-tl-lg opacity-50"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--color-primary-light)] rounded-tr-lg opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--color-primary-light)] rounded-bl-lg opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--color-primary-light)] rounded-br-lg opacity-50"></div>
                        
                        <StoryLog logs={eventLog} isProcessing={isActionLocked} />
                    </div>

                    {/* Right Panel: NPCs / Context */}
                    <div className="hidden lg:block lg:col-span-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-base)] shadow-lg rounded-xl p-3 h-full overflow-hidden flex flex-col">
                        <NpcProfilePanel />
                    </div>
                </main>
                
                <PlayerInputFooter onActionSubmit={handlePlayerAction} isProcessing={isActionLocked} />
            </div>
            
            {isMenuModalOpen && <MenuModal onClose={() => setIsMenuModalOpen(false)} />}
            {isLibraryOpen && <LibraryModal onClose={() => setIsLibraryOpen(false)} />}
        </>
    );
};

export default WorldScreen;