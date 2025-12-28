
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Pet, PetStatus, UpgradeConsumable, UpgradeMaterial, LogType } from '../types';
import PetSheet from './PetSheet';
import { useGame } from '../contexts/GameContext';
import { PET_EVOLUTION_COST, PET_EVOLUTION_LEVEL } from '../constants';

const PetScreen: React.FC = () => {
    const { character, handleSetActivePet, handleReleasePet, handleRenamePet, handleFeedPet, handleEvolvePet, setOneTimeMessages } = useGame();
    // Initialize state properly based on context or default
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Effect to set initial selected pet if none selected but one exists
    useEffect(() => {
        if (!selectedPetId && character && character.pets.length > 0) {
            setSelectedPetId(character.activePetId || character.pets[0].id);
        }
    }, [character, selectedPetId]);

    // Safety check if character is null
    if (!character) return null;

    const selectedPet = character.pets.find(p => p.id === selectedPetId) || null;

    const handleSelectPet = (pet: Pet) => {
        setSelectedPetId(pet.id);
    };
    
    const handleRename = () => {
        if (!selectedPet) return;
        const newName = prompt(`Nhập tên mới cho ${selectedPet.name}:`, selectedPet.name);
        if (newName && newName.trim()) {
            handleRenamePet(selectedPet.id, newName.trim());
        }
    };
    
    const handleFeed = async () => {
        if (!selectedPet) return;
        setIsLoading(true);
        try {
            await handleFeedPet(selectedPet.id);
        } catch (e: any) {
            setOneTimeMessages([{id: crypto.randomUUID(), text: e.message, type: LogType.ERROR}]);
        }
        setIsLoading(false);
    }
    
    const handleEvolve = async () => {
        if (!selectedPet) return;
        setIsLoading(true);
         try {
            await handleEvolvePet(selectedPet.id);
        } catch (e: any) {
            setOneTimeMessages([{id: crypto.randomUUID(), text: e.message, type: LogType.ERROR}]);
        }
        setIsLoading(false);
    }

    const canEvolve = useMemo(() => {
        if (!selectedPet || selectedPet.isEvolved || selectedPet.level < PET_EVOLUTION_LEVEL) return false;
        return Object.entries(PET_EVOLUTION_COST).every(([mat, cost]) => (character.materials[mat as UpgradeMaterial] || 0) >= cost);
    }, [selectedPet, character.materials]);

    const canFeed = useMemo(() => (character.consumables[UpgradeConsumable.LINH_THU_THUC] || 0) > 0, [character.consumables]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <h4 className="text-xl font-semibold mb-3 text-cyan-300">Danh Sách Thú Cưng</h4>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 bg-gray-900/30 p-2 rounded-lg">
                    {character.pets.length > 0 ? (
                        character.pets.map(pet => (
                            <div
                                key={pet.id}
                                onClick={() => handleSelectPet(pet)}
                                className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${selectedPetId === pet.id ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-700/50 border-transparent hover:border-gray-600'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={pet.imageUrl || 'https://via.placeholder.com/40'} alt={pet.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-500" />
                                        <div>
                                            <p className="font-semibold text-white">{pet.isEvolved && '🌟 '}{pet.name}</p>
                                            <p className="text-xs text-gray-400">Cấp {pet.level} {pet.monsterClass}</p>
                                        </div>
                                    </div>
                                    {character.activePetId === pet.id && (
                                        <span className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-1 rounded-full">Đang theo</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 p-8 bg-gray-700/50 rounded-lg h-full flex items-center justify-center">
                            Chưa có thú cưng nào.
                        </div>
                    )}
                </div>
            </div>
            <div className="md:col-span-2">
                 <h4 className="text-xl font-semibold mb-3 text-cyan-300">Chi Tiết Thú Cưng</h4>
                 {selectedPet ? (
                    <div>
                        <PetSheet pet={selectedPet} onRename={handleRename} />
                        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-3">
                            {/* Evolution */}
                            {selectedPet.level >= PET_EVOLUTION_LEVEL && !selectedPet.isEvolved && (
                                <div className="p-3 bg-purple-900/20 border border-purple-500/50 rounded-md">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                        <button onClick={handleEvolve} disabled={!canEvolve || isLoading} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                                            {isLoading ? 'Đang tiến hóa...' : '🌟 Tiến Hóa'}
                                        </button>
                                        <div className="text-xs text-gray-400">
                                            <p className="font-semibold">Chi phí:</p>
                                            {Object.entries(PET_EVOLUTION_COST).map(([mat, cost]) => (
                                                <p key={mat} className={(character.materials[mat as UpgradeMaterial] || 0) < cost ? 'text-red-400' : ''}>- {mat}: {cost}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Feeding */}
                             <div className="p-3 bg-green-900/20 border border-green-500/50 rounded-md">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                    <button onClick={handleFeed} disabled={!canFeed || isLoading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                                        {isLoading ? '...' : '🍖 Cho Ăn'}
                                    </button>
                                    <div className="text-xs text-gray-400">
                                        <p>Linh Thú Thực còn lại: {character.consumables[UpgradeConsumable.LINH_THU_THUC] || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => handleSetActivePet(character.activePetId === selectedPet.id ? null : selectedPet.id)}
                                className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${character.activePetId === selectedPet.id ? 'bg-yellow-600 hover:bg-yellow-700 text-black' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {character.activePetId === selectedPet.id ? 'Ngừng Theo' : 'Cho Theo'}
                            </button>
                            <button onClick={() => handleReleasePet(selectedPet.id)} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Thả Về Tự Nhiên
                            </button>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center text-gray-500 p-8 bg-gray-900/30 rounded-lg h-full flex items-center justify-center">
                        Chọn một thú cưng từ danh sách để xem chi tiết.
                    </div>
                 )}
            </div>
        </div>
    );
};

export default PetScreen;
