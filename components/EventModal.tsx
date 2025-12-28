import React from 'react';
import { useGame } from '../contexts/GameContext';
import { EventChoice } from '../types';

const EventModal: React.FC = () => {
    const { activeEvent, handleResolveEventChoice } = useGame();

    if (!activeEvent) {
        return null;
    }

    const handleChoiceClick = (choice: EventChoice) => {
        handleResolveEventChoice(choice);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-gray-800 border-2 border-yellow-500/50 rounded-2xl shadow-2xl p-8 w-full max-w-lg text-white text-center transform animate-scale-up">
                <h2 className="text-2xl font-bold text-yellow-300 mb-4">{activeEvent.title}</h2>
                <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">{activeEvent.description}</p>
                
                <div className="space-y-3">
                    {activeEvent.choices.map((choice, index) => (
                        <button
                            key={index}
                            onClick={() => handleChoiceClick(choice)}
                            className="w-full bg-gray-700 hover:bg-purple-800/50 border border-gray-600 hover:border-purple-500 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                        >
                            {choice.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventModal;