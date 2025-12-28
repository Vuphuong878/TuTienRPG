
import React from 'react';
import { Poi } from '../types';
import WorldMap from './WorldMap';

interface WorldMapModalProps {
    pois: Poi[];
    playerPosition: { x: number; y: number };
    onPoiClick: (poiId: number) => void;
    onClose: () => void;
}

const WorldMapModal: React.FC<WorldMapModalProps> = ({ pois, playerPosition, onPoiClick, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 border-2 border-purple-500/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] text-white relative flex flex-col p-6"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <header className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-purple-400">Bản Đồ Vạn Linh Giới</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl z-10">&times;</button>
                </header>
                <div className="flex-grow w-full h-full">
                     <WorldMap 
                        pois={pois}
                        playerPosition={playerPosition}
                        onPoiClick={onPoiClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default WorldMapModal;
