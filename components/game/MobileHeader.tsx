
import React from 'react';
import { MenuIcon } from '../Icons.tsx';
import type { FormData } from '../types.ts';

export const MobileHeader: React.FC<{
    onOpenSidebar: () => void;
    worldData: Partial<FormData>;
}> = ({ onOpenSidebar, worldData }) => {
    return (
        <div className="flex md:hidden justify-between items-center bg-white/70 dark:bg-[#252945]/80 backdrop-blur-sm p-3 rounded-b-lg shadow-lg flex-shrink-0 border-b border-slate-300/20 dark:border-slate-600/20">
            <button onClick={onOpenSidebar} className="p-2 -ml-2">
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider truncate mx-2">
                {worldData.storyName || "MANH MUONG TAM QUỐC"}
            </h1>
             <div className="w-6 h-6 p-2 -mr-2" />
        </div>
    );
};
