

import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { DungeonFloorType } from '../types';

const DungeonScreen: React.FC = () => {
    const { character, worldState, handleProceedInDungeon, handleExitDungeon } = useGame();
    const [isLoading, setIsLoading] = useState(false);

    const dungeon = worldState.dungeons.find(d => d.id === character?.currentDungeonId);

    if (!character || !dungeon) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <p>Đang tải Bí Cảnh...</p>
                <button onClick={() => handleExitDungeon(true)} className="mt-4 bg-gray-600 p-2 rounded">Thoát</button>
            </div>
        );
    }

    const currentFloor = dungeon.floors[dungeon.currentFloorIndex];
    const isLastFloor = dungeon.currentFloorIndex >= dungeon.floors.length -1;

    const onProceed = async () => {
        setIsLoading(true);
        await handleProceedInDungeon();
        setIsLoading(false);
    };

    const getFloorIcon = (type: DungeonFloorType) => {
        switch (type) {
            case DungeonFloorType.COMBAT: return '⚔️';
            case DungeonFloorType.ELITE_COMBAT: return '💀';
            case DungeonFloorType.BOSS: return '👑';
            case DungeonFloorType.TREASURE: return '💎';
            case DungeonFloorType.EMPTY: return '…';
            default: return '?';
        }
    };

    const FloorNode: React.FC<{ type: DungeonFloorType, index: number, isCurrent: boolean, isCompleted: boolean }> = ({ type, index, isCurrent, isCompleted }) => {
        const icon = getFloorIcon(type);
        let nodeClasses = 'w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 ';
        if (isCurrent) {
            nodeClasses += 'bg-purple-600 border-4 border-purple-300 shadow-lg shadow-purple-500/50 animate-pulse';
        } else if (isCompleted) {
            nodeClasses += 'bg-gray-700 border-2 border-gray-500 text-gray-400';
        } else {
            nodeClasses += 'bg-gray-800 border-2 border-gray-600 text-gray-500';
        }

        return (
            <div className="flex flex-col items-center">
                <div className={nodeClasses} title={`${type} - Tầng ${index + 1}`}>
                    {icon}
                </div>
                <p className={`mt-2 text-xs font-bold ${isCurrent ? 'text-purple-300' : 'text-gray-400'}`}>Tầng {index + 1}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 bg-cover bg-center"
             style={{ backgroundImage: `url('https://i.pinimg.com/originals/a3/52/65/a35265a7593a1136293521d74a0063c8.gif')` }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-4xl text-center">
                <h1 className="text-4xl font-bold text-red-400 drop-shadow-[0_0_15px_#ef4444]">{dungeon.name}</h1>
                <p className="text-lg text-gray-300 italic mt-2">"{dungeon.description}"</p>

                {/* Floor Progress Bar */}
                <div className="flex justify-center items-center my-8 p-4 bg-black/30 rounded-lg">
                    {dungeon.floors.map((floor, index) => (
                        <React.Fragment key={index}>
                           <FloorNode type={floor.type} index={index} isCurrent={index === dungeon.currentFloorIndex} isCompleted={floor.isCompleted} />
                           {index < dungeon.floors.length - 1 && (
                               <div className={`flex-1 h-1 mx-2 ${floor.isCompleted ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
                           )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Current Floor Details */}
                <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-600 min-h-[150px]">
                    <h2 className="text-2xl font-semibold text-yellow-300">Tầng {dungeon.currentFloorIndex + 1}: {currentFloor.type}</h2>
                    <p className="mt-2 text-gray-400 italic">"{currentFloor.description}"</p>
                </div>
                
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={() => handleExitDungeon()} disabled={isLoading}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition">
                        Rời Bí Cảnh
                    </button>
                    {!isLastFloor ? (
                        <button onClick={onProceed} disabled={isLoading || currentFloor.isCompleted}
                            className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-lg transition disabled:bg-gray-500 animate-pulse-glow">
                            {isLoading ? "Đang tiến vào..." : "Tiến vào Tầng tiếp"}
                        </button>
                    ) : (
                         <button onClick={onProceed} disabled={isLoading || currentFloor.isCompleted}
                            className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-3 px-8 rounded-lg transition disabled:bg-gray-500 animate-pulse-glow">
                            {isLoading ? "Đang tiến vào..." : "Đối mặt Trùm cuối"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
export default DungeonScreen;