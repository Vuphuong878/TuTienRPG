import React from 'react';

export const SuggestionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    title: string;
}> = ({ isOpen, onClose, suggestions, onSelect, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md transform scale-100 transition-all duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 text-xl leading-none"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6 max-h-80 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        <ul className="space-y-3">
                            {suggestions.map((s, index) => (
                                <li 
                                    key={index}
                                    onClick={() => onSelect(s)}
                                    className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/30 cursor-pointer transition-all duration-300 text-sm text-white/90 hover:text-white hover:shadow-lg transform hover:scale-[1.02]"
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                            <p className="text-white/60">Không có gợi ý nào.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
