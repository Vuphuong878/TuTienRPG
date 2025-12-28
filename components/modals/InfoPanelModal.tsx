

import React, { memo } from 'react';
import { CrossIcon } from '../Icons.tsx';

export const MemoizedInfoPanelModal = memo<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}>(({ isOpen, onClose, title, children, icon }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[65] p-4" onClick={onClose}>
            <div 
                className="bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-2xl w-full max-w-lg text-slate-900 dark:text-white flex flex-col" 
                onClick={e => e.stopPropagation()}
                style={{maxHeight: '70vh'}}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        {icon}
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">
                        <CrossIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
});
MemoizedInfoPanelModal.displayName = 'MemoizedInfoPanelModal';
