

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as GameIcons from '../GameIcons.tsx';
import { SparklesIcon } from '../Icons.tsx';

interface MobileInputFooterProps {
    onChoicesClick: () => void;
    onInventoryClick: () => void;
    customAction: string;
    setCustomAction: (action: string) => void;
    handleAction: (action: string) => void;
    debouncedHandleAction: (action: string) => void;
    handleSuggestAction?: () => void;
    isLoading: boolean;
    isAiReady: boolean;
    isCustomActionLocked: boolean;
}

export const MobileInputFooter: React.FC<MobileInputFooterProps> = ({
    onChoicesClick, onInventoryClick, customAction, setCustomAction, handleAction, debouncedHandleAction, handleSuggestAction, isLoading, isAiReady, isCustomActionLocked
}) => {
    // Local state for input to prevent lag
    const [localCustomAction, setLocalCustomAction] = useState(customAction);
    // IME composition state for Vietnamese input
    const [isComposing, setIsComposing] = useState(false);
    
    // Sync local state with parent state only when parent changes externally
    useEffect(() => {
        // Only sync if the parent state is different from local and we're not currently composing
        if (!isComposing && customAction !== localCustomAction) {
            setLocalCustomAction(customAction);
        }
    }, [customAction]); // Only depend on customAction, not localCustomAction to avoid loops
    
    // Debounced update to parent state - only when not composing
    const debouncedUpdateRef = useRef<NodeJS.Timeout>();
    useEffect(() => {
        if (isComposing) return; // Don't update during IME composition
        
        // Clear previous timeout
        if (debouncedUpdateRef.current) {
            clearTimeout(debouncedUpdateRef.current);
        }
        
        // Set new timeout
        debouncedUpdateRef.current = setTimeout(() => {
            setCustomAction(localCustomAction);
        }, 300);
        
        return () => {
            if (debouncedUpdateRef.current) {
                clearTimeout(debouncedUpdateRef.current);
            }
        };
    }, [localCustomAction, isComposing, setCustomAction]); // Keep setCustomAction but use ref for timeout
    
    // Handle IME composition start (Vietnamese input begins)
    const handleCompositionStart = useCallback(() => {
        setIsComposing(true);
    }, []);
    
    // Handle IME composition end (Vietnamese input finishes)
    const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
        setIsComposing(false);
        setLocalCustomAction(e.currentTarget.value); // Ensure we capture the final composed value
    }, []);
    
    // Handle input change with local state
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isComposing) {
            setLocalCustomAction(value);
        }
        // Always update local state for immediate UI feedback on mobile
        if (isComposing) {
            setLocalCustomAction(value);
        }
    }, [isComposing]);
    
    // Handle enter key press - avoid during composition
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isComposing) {
            debouncedHandleAction(localCustomAction);
        }
    }, [localCustomAction, debouncedHandleAction, isComposing]);
    
    // Handle send button click
    const handleSendAction = useCallback(() => {
        handleAction(localCustomAction);
    }, [localCustomAction, handleAction]);
    return (
        <>
            {/* Choices Button */}
            <button 
                onClick={onChoicesClick}
                className="md:hidden fixed bottom-20 right-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full shadow-lg z-40"
                aria-label="Lựa chọn hành động"
            >
               <GameIcons.SwordIcon className="w-6 h-6"/>
            </button>
            
            {/* Inventory Button */}
            <button 
                onClick={onInventoryClick}
                className="md:hidden fixed bottom-36 right-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-full shadow-lg z-40"
                aria-label="Túi đồ"
            >
               <GameIcons.ChestIcon className="w-6 h-6"/>
            </button>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1f2238]/95 backdrop-blur-sm p-3 border-t border-slate-300 dark:border-slate-700 shadow-lg z-30">
                 <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={localCustomAction}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        disabled={isLoading || !isAiReady || isCustomActionLocked}
                        placeholder={isCustomActionLocked ? "Hành động tùy ý đã bị khóa." : "Nhập hành động..."}
                        className="flex-1 bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-500"
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        inputMode="text"
                    />
                    {handleSuggestAction && (
                        <button 
                            onClick={handleSuggestAction}
                            disabled={isLoading || !isAiReady}
                            className="px-3 py-2 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-500 hover:to-orange-500 border border-yellow-400/60 rounded-md text-yellow-100 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Gợi ý hành động"
                        >
                            <SparklesIcon className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={handleSendAction}
                        disabled={isLoading || !isAiReady || isCustomActionLocked}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-md transition-colors disabled:bg-slate-500"
                    >
                        Gửi
                    </button>
                </div>
            </div>
        </>
    );
};
