import React from 'react';
import { useGame } from '../contexts/GameContext';

const LevelUpModal = () => {
    const { levelUpInfo, clearLevelUpInfo, character } = useGame();

    if (!levelUpInfo || !character) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 border-2 border-yellow-400 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white text-center transform animate-scale-up">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4 animate-pulse-glow">
                    Thăng Cấp!
                </h1>
                <p className="text-2xl text-gray-200 mb-2">
                    Bạn đã đạt đến <span className="font-bold text-yellow-300">Cấp {levelUpInfo.newLevel}</span>!
                </p>
                {levelUpInfo.realmChanged && (
                    <p className="text-xl text-purple-300 font-semibold animate-fade-in" style={{animationDelay: '0.5s'}}>
                        ⚡ Cảnh giới đột phá! ⚡
                        <br/>
                        Bạn đã tiến vào <span className="font-bold text-purple-200">{levelUpInfo.newRealm}</span>!
                    </p>
                )}
                <p className="mt-6 text-gray-400">Sức mạnh của bạn đã tăng lên. HP và MP đã được hồi đầy.</p>
                <button 
                    onClick={clearLevelUpInfo} 
                    className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                >
                    Tuyệt vời!
                </button>
            </div>
        </div>
    );
};

export default LevelUpModal;
