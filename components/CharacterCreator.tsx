
import React, { useState, useCallback, useMemo, useEffect } from 'react';
// Fix: Corrected import paths for types and constants.
import { PlayerClass, BaseStats, Stat, Difficulty } from '../types';
import { useGame } from '../contexts/GameContext';
import { CUSTOM_CLASS_CREATION_POINTS } from '../constants';

const CharacterCreator = () => {
    const { handleCreateGame, handleBackToMenu, designedWorldPrompt, designedWorldStoryInfo } = useGame();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [selectedDefaultClass, setSelectedDefaultClass] = useState<PlayerClass>(PlayerClass.THE_TU);
    const [customClassName, setCustomClassName] = useState('');
    const [characterContext, setCharacterContext] = useState('');
    const [customStats, setCustomStats] = useState<BaseStats>({
        [Stat.STR]: 0, [Stat.AGI]: 0, [Stat.INT]: 0, [Stat.SPI]: 0, [Stat.CON]: 0, [Stat.DEX]: 0,
    });
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);

    const remainingPoints = useMemo(() => {
        // Fix: Explicitly cast values to number array to prevent potential type errors during arithmetic operation.
        const totalAssigned = (Object.values(customStats) as number[]).reduce((sum, value) => sum + value, 0);
        return CUSTOM_CLASS_CREATION_POINTS - totalAssigned;
    }, [customStats]);

    const handleStatChange = (stat: keyof BaseStats, delta: number) => {
        setCustomStats(prev => {
            const currentVal = prev[stat];
            const newVal = currentVal + delta;
            // Prevent going below 0 or exceeding total points (only if adding)
            if (newVal < 0 || (delta > 0 && remainingPoints <= 0)) return prev;
            return { ...prev, [stat]: newVal };
        });
    };
    
    const validateInputs = (): boolean => {
        if (!name.trim()) {
            alert('Vui lòng nhập tên nhân vật!');
            return false;
        }
        if (isCustomMode) {
            if (!customClassName.trim()) {
                alert('Vui lòng nhập tên cho Class tùy chỉnh!');
                return false;
            }
            if (remainingPoints !== 0) {
                alert(`Vui lòng phân bổ hết ${CUSTOM_CLASS_CREATION_POINTS} điểm tiềm năng!`);
                return false;
            }
        }
        if (!designedWorldPrompt) {
            alert('Lỗi: Bối cảnh thế giới chưa được thiết lập. Vui lòng quay lại và thiết kế thế giới trước.');
            return false;
        }
        return true;
    }

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateInputs()) return;

        let finalPlayerClass: string;
        let finalClassDefinition: BaseStats | undefined;

        if (isCustomMode) {
            finalPlayerClass = customClassName;
            finalClassDefinition = customStats;
        } else {
            finalPlayerClass = selectedDefaultClass;
            finalClassDefinition = undefined;
        }

        setIsLoading(true);
        try {
            await handleCreateGame(name, finalPlayerClass, finalClassDefinition, characterContext, designedWorldPrompt!.prompt, designedWorldPrompt!.keywords, difficulty, designedWorldStoryInfo || undefined);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                alert(`Không thể tạo game: ${err.message}`);
            } else {
                alert(`Không thể tạo game: ${String(err)}`);
            }
            setIsLoading(false);
        }
    }, [name, isCustomMode, selectedDefaultClass, customClassName, customStats, remainingPoints, characterContext, difficulty, handleCreateGame, designedWorldPrompt, designedWorldStoryInfo]);
    
    const getStatLabel = (stat: string) => {
        switch(stat) {
            case 'STR': return 'Sức Mạnh';
            case 'AGI': return 'Nhanh Nhẹn';
            case 'INT': return 'Trí Tuệ';
            case 'SPI': return 'Tinh Thần';
            case 'CON': return 'Thể Chất';
            case 'DEX': return 'Khéo Léo';
            default: return stat;
        }
    };

    const renderCharacterCreation = () => {
        const statKeys: (keyof BaseStats)[] = [Stat.STR, Stat.AGI, Stat.INT, Stat.SPI, Stat.CON, Stat.DEX];
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Tên Nhân Vật</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg border-2 border-gray-600 focus:border-purple-500 outline-none transition" required />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bối cảnh nhân vật (tùy chọn)</label>
                    <textarea value={characterContext} onChange={e => setCharacterContext(e.target.value)} placeholder="Ví dụ: Một đứa trẻ mồ côi từ một ngôi làng bị ma thú phá hủy, mang trong mình huyết mạch đặc biệt..." rows={3} className="w-full bg-gray-700 p-3 rounded-lg border-2 border-gray-600 focus:border-purple-500 outline-none transition resize-none"></textarea>
                    <p className="text-xs text-gray-400 mt-1">AI sẽ dựa vào đây để tạo ra một cốt truyện độc đáo cho bạn.</p>
                </div>
                
                <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <input id="custom-mode-toggle" type="checkbox" checked={isCustomMode} onChange={() => setIsCustomMode(!isCustomMode)} className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                    <label htmlFor="custom-mode-toggle" className="ml-3 block text-sm font-bold text-gray-200 cursor-pointer select-none">Tự Thiết Kế Class (Advanced)</label>
                </div>

                {isCustomMode ? (
                    <div className="space-y-4 p-5 border border-purple-500/30 bg-purple-900/10 rounded-xl animate-fade-in">
                        <div>
                            <label htmlFor="customClassName" className="block text-sm font-medium text-gray-300 mb-2">Tên Class Tùy Chỉnh</label>
                            <input type="text" id="customClassName" value={customClassName} onChange={(e) => setCustomClassName(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg border-2 border-gray-600 focus:border-purple-500 outline-none transition" placeholder="VD: Kiếm Tiên, Độc Sư..." required />
                        </div>
                        
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-3 bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-sm">
                                <span className="font-bold text-gray-300">Điểm Tiềm Năng:</span>
                                <span className={`text-2xl font-bold font-mono ${remainingPoints > 0 ? 'text-green-400' : (remainingPoints < 0 ? 'text-red-500' : 'text-gray-500')}`}>
                                    {remainingPoints}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {statKeys.map(statKey => {
                                    const value = customStats[statKey];
                                    // Visual max for bar context (assuming ~10 is average start)
                                    const barPercent = Math.min(100, (value / 15) * 100); 
                                    
                                    return (
                                        <div key={statKey} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex flex-col gap-2 shadow-sm hover:border-gray-500 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-gray-200">{getStatLabel(statKey)}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono uppercase">{statKey}</span>
                                                </div>
                                                <span className="text-xl font-bold font-mono text-white">{value}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleStatChange(statKey, -1)} 
                                                    disabled={value <= 0}
                                                    className="w-8 h-8 rounded bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-400 font-bold flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >-</button>
                                                
                                                <div className="flex-grow h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-600">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${value > 8 ? 'bg-green-500' : (value > 4 ? 'bg-yellow-500' : 'bg-gray-500')}`} 
                                                        style={{width: `${barPercent}%`}}
                                                    ></div>
                                                </div>
                                                
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleStatChange(statKey, 1)} 
                                                    disabled={remainingPoints <= 0}
                                                    className="w-8 h-8 rounded bg-gray-700 hover:bg-green-900/50 text-gray-300 hover:text-green-400 font-bold flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >+</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Chọn Class</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.values(PlayerClass).map(pClass => (
                                <button key={pClass} type="button" onClick={() => setSelectedDefaultClass(pClass as PlayerClass)} className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedDefaultClass === pClass ? 'border-purple-500 bg-purple-900/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}>
                                    <span className="text-2xl">{pClass === PlayerClass.KIEM_TU ? '⚔️' : (pClass === PlayerClass.THE_TU ? '🛡️' : '🔥')}</span>
                                    <span className="font-bold">{pClass}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Độ Khó</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.values(Difficulty).map(d => (
                            <button key={d} type="button" onClick={() => setDifficulty(d as Difficulty)} className={`p-3 rounded-lg border-2 transition-all ${difficulty === d ? 'border-yellow-500 bg-yellow-900/50' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}>
                                <span className="font-bold">{d}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-2xl border border-purple-500/30 relative max-h-[90vh] overflow-y-auto">
                <h1 className="text-3xl font-bold text-center text-purple-400 mb-2">Tạo Anh Hùng</h1>
                <p className="text-center text-gray-400 mb-6">Bước cuối: Định hình nhân vật của bạn trong thế giới "{designedWorldPrompt?.keywords || '...'}"</p>
                
                {designedWorldPrompt && (
                    <div className="mb-6 p-4 bg-black/20 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-purple-300">Tóm Tắt Thế Giới</h3>
                        <p className="text-sm text-gray-300 italic">"{designedWorldPrompt.prompt}"</p>
                    </div>
                )}


                <form onSubmit={handleSubmit}>
                    <div className="min-h-[450px]">
                        {renderCharacterCreation()}
                    </div>
                    
                    <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-700">
                        <button type="button" onClick={handleBackToMenu} className="text-gray-400 hover:text-white transition font-medium px-4 py-2">← Về Menu</button>
                        <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-8 rounded-lg transition disabled:bg-gray-500 disabled:from-gray-600 disabled:to-gray-600 flex items-center shadow-lg hover:shadow-green-900/50 hover:scale-105 transform">
                            {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isLoading ? 'Đang khởi tạo...' : 'BẮT ĐẦU HÀNH TRÌNH'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CharacterCreator;
