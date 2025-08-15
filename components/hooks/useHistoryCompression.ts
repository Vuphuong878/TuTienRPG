import { useState } from 'react';
import type { SaveData, CompressedHistorySegment } from '../types';

export interface HistoryCompressionState {
    compressedHistory: CompressedHistorySegment[];
    historyStats: {
        totalEntriesProcessed: number;
        totalTokensSaved: number;
        compressionCount: number;
    };
    cleanupStats: SaveData['cleanupStats'];
}

export interface HistoryCompressionActions {
    setCompressedHistory: (history: CompressedHistorySegment[] | ((prev: CompressedHistorySegment[]) => CompressedHistorySegment[])) => void;
    setHistoryStats: (stats: any | ((prev: any) => any)) => void;
    setCleanupStats: (stats: SaveData['cleanupStats'] | ((prev: SaveData['cleanupStats']) => SaveData['cleanupStats'])) => void;
}

export const useHistoryCompression = (
    initialGameState: SaveData
): [HistoryCompressionState, HistoryCompressionActions] => {
    const [compressedHistory, setCompressedHistory] = useState<CompressedHistorySegment[]>(
        initialGameState.compressedHistory || []
    );
    
    const [historyStats, setHistoryStats] = useState(
        initialGameState.historyStats || { 
            totalEntriesProcessed: 0, 
            totalTokensSaved: 0, 
            compressionCount: 0 
        }
    );
    
    const [cleanupStats, setCleanupStats] = useState<SaveData['cleanupStats']>(
        initialGameState.cleanupStats || { 
            totalCleanupsPerformed: 0, 
            totalTokensSavedFromCleanup: 0, 
            lastCleanupTurn: 0, 
            cleanupHistory: [] 
        }
    );

    const historyCompressionState: HistoryCompressionState = {
        compressedHistory,
        historyStats,
        cleanupStats
    };

    const historyCompressionActions: HistoryCompressionActions = {
        setCompressedHistory,
        setHistoryStats,
        setCleanupStats
    };

    return [historyCompressionState, historyCompressionActions];
};