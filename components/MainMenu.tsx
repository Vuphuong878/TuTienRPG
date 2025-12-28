import React, { useState, useEffect } from 'react';
import { GameScreen } from '../types';
import { useGame } from '../contexts/GameContext';
import { MENU_BACKGROUND_IMAGES } from '../data/menuBackgrounds';
import ChangelogModal from './ChangelogModal';

const MainMenu: React.FC = () => {
    const { handleOpenImageLibrary, isFullscreen, handleToggleFullscreen, handleOpenMenu, saveSlots, handleStartNewGame, handleQuickPlay, handleDevQuickStart, isQuickPlayLoading } = useGame();
    const activeSaveCount = saveSlots.filter(s => s.characterName).length;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [version, setVersion] = useState('');
    const [isChangelogVisible, setIsChangelogVisible] = useState(false);

    useEffect(() => {
        // Fetch and parse version from metadata.json
        fetch('/metadata.json')
            .then(res => res.json())
            .then(data => {
                const name = data.name || '';
                const versionMatch = name.match(/(\d+\.\d+\.\d+)/);
                if (versionMatch) {
                    setVersion(versionMatch[1]);
                } else {
                    setVersion('N/A');
                }
            })
            .catch(err => {
                console.error("Could not load version from metadata", err);
                setVersion('N/A');
            });
        
        const preloadImages = () => {
            MENU_BACKGROUND_IMAGES.forEach(src => {
                new Image().src = src;
            });
        };
        preloadImages();

        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % MENU_BACKGROUND_IMAGES.length);
        }, 15000); // 15 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-60"
                style={{ backgroundImage: `url(${MENU_BACKGROUND_IMAGES[currentImageIndex]})`}}
                key={currentImageIndex} // force re-render for css transition
            />
             {/* Mystical Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-0 pointer-events-none" />

            <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-light)] via-white to-[var(--color-accent-light)] drop-shadow-[0_0_25px_var(--color-primary)] animate-pulse-glow">
                    RPG Tiên Hiệp Designer
                </h1>
                <p className="text-gray-300 text-lg sm:text-xl mb-8 italic tracking-wide">
                    Kiến tạo thế giới - Tu luyện thành thần
                </p>

                <div className="space-y-4 w-72">
                    <button
                        onClick={handleStartNewGame}
                        className="w-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:shadow-[var(--color-accent-glow-strong)] hover:scale-105 border border-[var(--color-accent-light)]"
                    >
                        Bắt đầu mới
                    </button>
                    
                     <button
                        onClick={() => handleOpenMenu(GameScreen.SAVE_MANAGEMENT)}
                         className="w-full bg-gray-800/80 hover:bg-gray-700/80 text-white font-semibold py-3 px-6 rounded-xl border border-gray-600 hover:border-gray-400 transition-all backdrop-blur-sm"
                    >
                        Tiếp tục ({activeSaveCount})
                    </button>
                    <button
                        onClick={handleQuickPlay}
                        disabled={isQuickPlayLoading}
                        className="w-full bg-cyan-800/80 hover:bg-cyan-700/80 text-white font-semibold py-3 px-6 rounded-xl border border-cyan-600 hover:border-cyan-400 transition-all backdrop-blur-sm disabled:opacity-50"
                    >
                        {isQuickPlayLoading ? 'Đang tải...' : 'Chơi Nhanh'}
                    </button>
                    {/* Dev button, can be hidden in production */}
                    <button
                        onClick={handleDevQuickStart}
                        disabled={isQuickPlayLoading}
                        className="w-full bg-red-900/50 hover:bg-red-800/50 text-red-300 text-sm font-semibold py-2 px-6 rounded-xl border border-red-700 hover:border-red-500 transition-all backdrop-blur-sm disabled:opacity-50"
                    >
                       Dev Quick Start (Lv.50)
                    </button>
                </div>
            </div>

            <footer className="relative z-10 text-center text-[var(--color-text-medium)] text-sm pb-6 w-full max-w-4xl">
                <div className="flex flex-wrap justify-center items-center gap-6 mb-4">
                    <button onClick={() => handleOpenMenu(GameScreen.SETTINGS)} className="hover:text-[var(--color-text-light)] transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Thiết Lập
                    </button>
                    <button onClick={handleToggleFullscreen} className="hover:text-[var(--color-text-light)] transition-colors">
                        {isFullscreen ? 'Thoát Toàn Màn Hình' : 'Toàn Màn Hình'}
                    </button>
                    <button onClick={handleOpenImageLibrary} className="hover:text-[var(--color-text-light)] transition-colors">Thư Viện Ảnh</button>
                </div>
                
                <button 
                    onClick={() => setIsChangelogVisible(true)} 
                    className="relative inline-flex items-center gap-2 hover:text-white transition-colors bg-white/10 px-4 py-1 rounded-full hover:bg-white/20"
                >
                    <span>Phiên bản {version}</span>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </button>
            </footer>
            {isChangelogVisible && <ChangelogModal onClose={() => setIsChangelogVisible(false)} />}
        </div>
    );
};

export default MainMenu;