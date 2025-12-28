
import React, { useRef, useEffect } from 'react';
import { ExplorationEventLog, LogType } from '../types';
import { useGame } from '../contexts/GameContext';

interface StoryLogProps {
    logs: ExplorationEventLog[];
    isProcessing: boolean;
}

const LogIcons: Record<LogType, string> = {
    [LogType.SYSTEM]: '⚙️',
    [LogType.NARRATIVE]: '📜',
    [LogType.LOOT]: '💎',
    [LogType.QUEST]: '🌟',
    [LogType.COMBAT]: '⚔️',
    [LogType.CRAFTING]: '🛠️',
    [LogType.ERROR]: '❌',
    [LogType.ADVICE]: '🔮',
};

const StoryLog: React.FC<StoryLogProps> = ({ logs, isProcessing }) => {
    const { appSettings } = useGame();
    const logContainerRef = useRef<HTMLDivElement>(null);
    
    const storyLogStyle: React.CSSProperties = {
        fontFamily: `'${appSettings.displaySettings.aiNarrative.font}', sans-serif`,
        fontSize: appSettings.displaySettings.aiNarrative.size,
        color: appSettings.displaySettings.aiNarrative.textColor,
    };

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0; // Scroll to top to see newest logs
        }
    }, [logs]);
    
    return (
        <div className="h-full flex flex-col">
            <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-3 flex flex-col-reverse text-sm">
                {/* Reversed order rendering */}
                {logs.map((log) => (
                    <div key={log.id} className={`border-t border-gray-700/50 pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0 italic animate-fade-in flex items-start gap-2 ${log.type === LogType.ADVICE ? 'text-purple-300 bg-purple-900/10 p-2 rounded' : ''}`} style={storyLogStyle}>
                        <span className="text-lg mt-0.5 not-italic">{LogIcons[log.type] || '🌀'}</span>
                        <div className="flex-1">
                            <p>{log.text}</p>
                            {log.sources && log.sources.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1 pl-2">
                                    Nguồn tham khảo từ AI: {log.sources.map((s, i) => (
                                        <React.Fragment key={s.uri}>
                                            <a href={s.uri} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">
                                                {s.title}
                                            </a>
                                            {i < log.sources!.length - 1 && ', '}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {isProcessing && (
                    <div className="flex items-center text-yellow-400 animate-pulse mt-2 pt-2 border-t border-gray-700/50">
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Số phận đang được dệt nên...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryLog;
