


import React from 'react';
// Fix: Corrected import paths for types and constants.
import { useGame } from '../contexts/GameContext';
import { MonsterTemplate, Element, TerrainType } from '../types';
import { TERRAIN_BACKGROUNDS } from '../data/terrainBackgrounds';
import { ELEMENT_ICONS, ELEMENT_COLORS } from '../constants';

const BestiaryEntry: React.FC<{ monster: MonsterTemplate }> = ({ monster }) => {
    const { discovered, name, description, habitats, baseClass, imageUrl, element } = monster;
    const backgroundUrl = habitats.length > 0 ? TERRAIN_BACKGROUNDS[habitats[0]] : TERRAIN_BACKGROUNDS[TerrainType.PLAIN];

    if (!discovered) {
        return (
            <div className="bg-gray-800/30 p-4 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center h-48">
                <p className="text-gray-500 text-3xl font-bold">???</p>
            </div>
        );
    }

    return (
        <div 
            className="rounded-lg shadow-lg border-2 border-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary-dark)] overflow-hidden relative text-white h-80 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col justify-end">
                 {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={name} 
                        className="absolute top-4 right-4 w-24 h-24 object-contain rounded-full border-4 border-gray-600 bg-black/50 p-1"
                    />
                ) : (
                    <div className="absolute top-4 right-4 w-24 h-24 flex items-center justify-center text-5xl bg-black/50 rounded-full border-4 border-gray-600">
                        ?
                    </div>
                )}

                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-purple-300 drop-shadow-lg">{name}</h3>
                    {element && element !== Element.VO && (
                        <span className={`text-xl font-bold ${ELEMENT_COLORS[element]}`} title={`Hệ: ${element}`}>
                            {ELEMENT_ICONS[element]}
                        </span>
                    )}
                </div>
                <p className="text-sm font-semibold text-gray-400 mb-2">{baseClass}</p>
                <p className="text-sm text-gray-200 italic mb-3 h-16 overflow-y-auto">"{description}"</p>
                <div>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {habitats.map(habitat => (
                            <span key={habitat} className="bg-gray-700/80 text-gray-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                {habitat}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BestiaryScreen: React.FC = () => {
    const { worldState } = useGame();

    if (!worldState || !worldState.bestiary) {
        return (
            <div className="text-center text-gray-500 p-10">
                Không thể tải Sách Yêu Quái.
            </div>
        );
    }

    const { bestiary } = worldState;
    const discoveredCount = bestiary.filter(m => m.discovered).length;

    return (
        <div className="max-h-[70vh] overflow-y-auto pr-3">
            <div className="flex justify-between items-baseline mb-4">
                <h2 className="text-2xl font-bold text-cyan-300">Sách Yêu Quái</h2>
                <p className="text-gray-400 font-semibold">Đã khám phá: {discoveredCount} / {bestiary.length}</p>
            </div>

            {bestiary.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {bestiary.map((monster, index) => (
                        <BestiaryEntry key={index} monster={monster} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 p-10 bg-gray-700/50 rounded-lg">
                    <p className="text-2xl mb-2">📖</p>
                    <p>Sách Yêu Quái của thế giới này vẫn còn trống.</p>
                    <p className="text-sm mt-1">AI đang trong quá trình sáng tạo, hãy thử tạo lại thế giới.</p>
                </div>
            )}
        </div>
    );
};

export default BestiaryScreen;