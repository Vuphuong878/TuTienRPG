
import React from 'react';
import { Poi } from '../types';

interface WorldMapProps {
    pois: Poi[];
    playerPosition: { x: number; y: number };
    onPoiClick: (poiId: number) => void;
    onZoomClick?: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ pois, playerPosition, onPoiClick, onZoomClick }) => {
    const MAP_DIMENSION = 4096; // The coordinate system size

    const PoiMarker: React.FC<{ poi: Poi }> = ({ poi }) => {
        const left = (poi.coords.x / MAP_DIMENSION) * 100;
        const top = (poi.coords.y / MAP_DIMENSION) * 100;

        return (
            <button
                onClick={() => onPoiClick(poi.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                style={{ left: `${left}%`, top: `${top}%` }}
                title={poi.name}
            >
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                <div className="absolute bottom-full mb-2 w-max bg-black/70 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {poi.name || poi.type}
                </div>
            </button>
        );
    };

    const PlayerMarker: React.FC = () => {
         const left = (playerPosition.x / MAP_DIMENSION) * 100;
         const top = (playerPosition.y / MAP_DIMENSION) * 100;
         return (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${left}%`, top: `${top}%` }}
                title="Vị trí của bạn"
              >
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(192,132,252,0.8)] animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
         )
    }

    return (
        <div className="w-full aspect-square bg-gray-900 rounded-lg relative overflow-hidden border-2 border-gray-700">
            {/* Zoom Button */}
            {onZoomClick && (
                 <button 
                    onClick={onZoomClick}
                    className="absolute top-2 right-2 z-30 bg-gray-800/50 hover:bg-gray-700/80 text-white rounded-full p-2 transition-colors"
                    title="Phóng to bản đồ"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M15 5a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h10zM5 3a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3V6a3 3 0 00-3-3H5zm2 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M9 8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
                    </svg>
                 </button>
            )}
            
            {/* Region Backgrounds */}
            <div className="absolute inset-0 flex flex-col">
                {/* Bắc Hoang */}
                <div className="h-1/4 bg-red-900/30 flex items-center justify-center">
                    <span className="font-bold text-red-300 opacity-50 text-xl">BẮC HOANG</span>
                </div>
                 {/* Trung Vực */}
                <div className="h-2/4 bg-cyan-900/20 flex items-center justify-center">
                     <span className="font-bold text-cyan-300 opacity-50 text-xl">TRUNG VỰC</span>
                </div>
                 {/* Nam Cương */}
                <div className="h-1/4 bg-purple-900/30 flex items-center justify-center">
                     <span className="font-bold text-purple-300 opacity-50 text-xl">NAM CƯƠNG</span>
                </div>
            </div>

            {/* Hư Thiên Trũng - Central Abyss */}
            <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black rounded-full border-2 border-purple-500 flex items-center justify-center text-purple-400 animate-pulse z-0"
                title="Hư Thiên Trũng"
            >
                🌀
            </div>
            
            {/* Render POIs and Player */}
            {pois.map(poi => <PoiMarker key={poi.id} poi={poi} />)}
            <PlayerMarker />
        </div>
    );
};

export default WorldMap;
