
import React, { useState, useEffect, useRef } from 'react';
// Fix: Corrected import path for GameContext.
import { useGame } from '../contexts/GameContext';
// Fix: Corrected import path for types.
import { DialogueTurn } from '../types';
import { generateSpeech } from '../services/geminiService';

const AILoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
);

// Audio Helper
const playAudioData = async (base64Audio: string) => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Decode raw PCM
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = audioContext.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
        return source;
    } catch (e) {
        console.error("Audio playback error:", e);
    }
};

const DialogueLine: React.FC<{ turn: DialogueTurn, npcImageUrl?: string, gender?: 'male' | 'female' }> = ({ turn, npcImageUrl, gender }) => {
    const { appSettings } = useGame();
    const isPlayer = turn.speaker === 'player';
    const isSystemMessage = turn.text.startsWith('[');
    const [isPlaying, setIsPlaying] = useState(false);
    
    if (isSystemMessage) {
        return (
            <div className="my-2 text-center">
                <span className="bg-yellow-800/50 text-yellow-300 text-sm font-semibold px-3 py-1 rounded-full">
                    {turn.text.slice(1, -1)}
                </span>
            </div>
        )
    }

    const dialogueStyle = isPlayer 
        ? appSettings.displaySettings.playerDialogue
        : appSettings.displaySettings.npcDialogue;

    const bubbleStyle: React.CSSProperties = {
        fontFamily: `'${dialogueStyle.font}', sans-serif`,
        fontSize: dialogueStyle.size,
        color: dialogueStyle.textColor,
        backgroundColor: dialogueStyle.bgColor,
    };

    const handleSpeak = async () => {
        if (isPlaying || !turn.text) return;
        setIsPlaying(true);
        // Map gender/role to voice if possible, default to 'Kore' or 'Puck'
        const voice = isPlayer ? 'Puck' : (gender === 'female' ? 'Kore' : 'Fenrir');
        const audioData = await generateSpeech(turn.text, voice);
        if (audioData) {
            await playAudioData(audioData);
            // Simulate playing duration or just timeout
            setTimeout(() => setIsPlaying(false), Math.min(turn.text.length * 50, 5000));
        } else {
            setIsPlaying(false);
        }
    };

    return (
        <div className={`flex items-end gap-2 sm:gap-3 my-4 ${isPlayer ? 'flex-row-reverse' : ''}`}>
            {!isPlayer && (
                <img 
                    src={npcImageUrl || 'https://via.placeholder.com/150'} 
                    alt="NPC" 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-purple-400 flex-shrink-0"
                />
            )}
            <div 
                style={bubbleStyle}
                className={`relative w-10/12 sm:w-auto sm:max-w-xl p-3 sm:p-4 rounded-2xl ${isPlayer ? 'rounded-br-none' : 'rounded-bl-none'} group`}
            >
                <p>{turn.text}</p>
                <button 
                    onClick={handleSpeak}
                    disabled={isPlaying}
                    className={`absolute -bottom-6 ${isPlayer ? 'left-0' : 'right-0'} text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1`}
                    title="Đọc văn bản"
                >
                    {isPlaying ? (
                        <span className="animate-pulse">🔊 Playing...</span>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

const getAffinityDetails = (score: number) => {
    if (score <= -50) return { label: 'Thù Địch', colorClass: 'bg-red-700 text-red-200' };
    if (score < 0) return { label: 'Ghét Bỏ', colorClass: 'bg-red-900 text-red-300' };
    if (score < 50) return { label: 'Thân Thiện', colorClass: 'bg-green-900 text-green-300' };
    if (score >= 50) return { label: 'Quý Mến', colorClass: 'bg-emerald-800 text-emerald-200' };
    return { label: 'Trung Lập', colorClass: 'bg-gray-700 text-gray-300' };
};

const DialogueModal: React.FC = () => {
    const { 
        character, 
        worldState, 
        activePoiIdForDialogue, 
        transientDialogue,
        handleCloseDialogue, 
        handleSendDialogueMessage,
        handleContinueTransientDialogue
    } = useGame();

    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isTransient = transientDialogue !== null;
    const poi = !isTransient ? worldState.pois.find(p => p.id === activePoiIdForDialogue) : null;
    const dialogueState = isTransient ? transientDialogue : poi?.dialogue;
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dialogueState?.history]);

    const sendMessage = async (text: string) => {
        const trimmedMessage = text.trim();
        if (!trimmedMessage || isSending) return;

        setIsSending(true);
        setMessage('');

        if (isTransient) {
            await handleContinueTransientDialogue(trimmedMessage);
        } else {
            await handleSendDialogueMessage(trimmedMessage);
        }
        
        setIsSending(false);
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(message);
    };

    if (!character || !dialogueState) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in text-white">
                Đang tải dữ liệu hội thoại...
                <button onClick={handleCloseDialogue} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
            </div>
        );
    }
    
    const isSameSect = character && character.sectId && character.sectId === dialogueState.factionId;
    const npcDisplayName = isSameSect ? `[Đồng Môn] ${dialogueState.npcName}` : dialogueState.npcName;
    const affinityDetails = getAffinityDetails(dialogueState.affinity);

    return (
        <div className="fixed inset-0 bg-[var(--color-bg-main)] flex flex-col z-50 animate-fade-in">
            <header className="bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm p-4 flex items-center justify-between border-b border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary-dark)]/20">
                <div className="flex items-center gap-4">
                    <img src={dialogueState.npcImageUrl || 'https://via.placeholder.com/150'} alt={dialogueState.npcName} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-purple-400" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-light)]">{npcDisplayName}</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                             <div className="flex items-center gap-2">
                                <p className="text-sm sm:text-md text-[var(--color-text-dark)]">{dialogueState.npcRole} {dialogueState.factionName ? `(${dialogueState.factionName})` : ''}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${affinityDetails.colorClass}`}>
                                    {affinityDetails.label}
                                </span>
                             </div>
                             {(dialogueState.preferredElement || dialogueState.weakness) && (
                                <div className="flex items-center gap-3 text-xs sm:ml-2 border-l border-gray-600 pl-2">
                                    {dialogueState.preferredElement && (
                                        <span title="Nguyên tố ưa thích" className="flex items-center gap-1 text-gray-300">
                                            ❤️ <span className="text-pink-300">{dialogueState.preferredElement}</span>
                                        </span>
                                    )}
                                    {dialogueState.weakness && (
                                        <span title="Điểm yếu" className="flex items-center gap-1 text-gray-300">
                                            💀 <span className="text-red-300">{dialogueState.weakness}</span>
                                        </span>
                                    )}
                                </div>
                             )}
                        </div>
                    </div>
                </div>
                <button onClick={handleCloseDialogue} className="text-gray-400 hover:text-white text-4xl">&times;</button>
            </header>

            <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {dialogueState.history.map((turn: DialogueTurn, index: number) => (
                        <DialogueLine key={index} turn={turn} npcImageUrl={dialogueState.npcImageUrl} />
                    ))}
                     {isSending && !message && (
                        <div className="flex items-end gap-3 my-4">
                           <img src={dialogueState.npcImageUrl || 'https://via.placeholder.com/150'} alt="NPC" className="w-12 h-12 rounded-full border-2 border-purple-400 flex-shrink-0" />
                           <div className="max-w-xl p-4 rounded-2xl bg-gray-700 rounded-bl-none flex items-center">
                              <AILoadingSpinner />
                           </div>
                        </div>
                     )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm p-2 sm:p-4 border-t border-[var(--color-primary)]">
                {dialogueState.options && dialogueState.options.length > 0 && !isSending && (
                    <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 mb-3">
                        {dialogueState.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => sendMessage(option)}
                                className="bg-gray-600 hover:bg-gray-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
                <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-4">
                    <input
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-bg-quaternary)] rounded-full py-3 px-4 sm:px-6 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] transition"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-bold rounded-full h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center transition-all transform hover:scale-110 shadow-lg hover:shadow-[var(--color-primary)] disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        {isSending ? <AILoadingSpinner /> : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default DialogueModal;
