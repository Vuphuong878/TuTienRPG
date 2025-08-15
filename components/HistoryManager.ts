import type { GameHistoryEntry } from './types';

export interface HistoryConfig {
    maxActiveEntries: number;      // Số entries tối đa trong active history
    compressionThreshold: number;  // Khi nào bắt đầu compression
    summaryLength: number;         // Độ dài summary cho compressed entries
}

export interface CompressedHistorySegment {
    turnRange: string;            // "1-10", "11-20"
    summary: string;              // Tóm tắt những gì đã xảy ra
    keyActions: string[];         // Các hành động quan trọng
    importantEvents: string[];    // Các sự kiện quan trọng
    tokenCount: number;           // Ước tính token count
    compressedAt: number;         // Turn number khi được compress
}

export class HistoryManager {
    // Cấu hình mặc định - có thể điều chỉnh
    private static readonly DEFAULT_CONFIG: HistoryConfig = {
        maxActiveEntries: 20,        // Giữ 20 entries = 10 lượt gần nhất
        compressionThreshold: 30,    // Compress khi có > 30 entries
        summaryLength: 200          // Tóm tắt tối đa 200 ký tự
    };

    /**
     * Quản lý history với sliding window
     */
    public static manageHistory(
        currentHistory: GameHistoryEntry[],
        turnCount: number,
        config: HistoryConfig = this.DEFAULT_CONFIG
    ): {
        activeHistory: GameHistoryEntry[];
        compressedSegment?: CompressedHistorySegment;
        shouldCompress: boolean;
        stats: {
            originalSize: number;
            newSize: number;
            savedEntries: number;
        };
    } {
        const originalSize = currentHistory.length;
        
        // Nếu chưa vượt threshold, không cần compress
        if (originalSize <= config.compressionThreshold) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`📊 [${timestamp}] History Check:`, {
                turnNumber: turnCount,
                currentEntries: originalSize,
                threshold: config.compressionThreshold,
                compressionNeeded: false,
                message: `${originalSize}/${config.compressionThreshold} entries - no compression needed`
            });
            
            return {
                activeHistory: currentHistory,
                shouldCompress: false,
                stats: {
                    originalSize,
                    newSize: originalSize,
                    savedEntries: 0
                }
            };
        }

        // Tính toán sliding window
        const keepRecent = config.maxActiveEntries;
        const activeHistory = currentHistory.slice(-keepRecent);
        const toCompress = currentHistory.slice(0, -keepRecent);

        // Tạo compressed segment
        const compressedSegment = this.compressHistorySegment(
            toCompress,
            turnCount,
            config
        );

        const timestamp = new Date().toLocaleTimeString();
        console.log(`📦 [${timestamp}] History Compression:`, {
            turnNumber: turnCount,
            originalEntries: originalSize,
            entriesToCompress: toCompress.length,
            keptActive: activeHistory.length,
            threshold: config.compressionThreshold,
            maxActive: config.maxActiveEntries,
            compressionTriggered: true
        });

        return {
            activeHistory,
            compressedSegment,
            shouldCompress: true,
            stats: {
                originalSize,
                newSize: activeHistory.length,
                savedEntries: toCompress.length
            }
        };
    }

    /**
     * Compress một đoạn history thành summary ngắn gọn
     */
    private static compressHistorySegment(
        entries: GameHistoryEntry[],
        currentTurn: number,
        config: HistoryConfig
    ): CompressedHistorySegment {
        const keyActions: string[] = [];
        const importantEvents: string[] = [];
        
        // Ước tính turn range
        const segmentTurns = Math.floor(entries.length / 2); // 2 entries per turn
        const startTurn = Math.max(1, currentTurn - segmentTurns - Math.floor(config.maxActiveEntries / 2));
        const endTurn = currentTurn - Math.floor(config.maxActiveEntries / 2);

        // Extract information từ entries
        entries.forEach((entry, index) => {
            if (entry.role === 'user') {
                // Extract player actions
                const actionMatch = entry.parts[0].text.match(/--- HÀNH ĐỘNG CỦA NGƯỜI CHƠI ---\n"([^"]+)"/);
                if (actionMatch && actionMatch[1] !== 'SYSTEM_RULE_UPDATE') {
                    const action = actionMatch[1];
                    // Chỉ giữ actions quan trọng (combat, social, movement)
                    if (this.isImportantAction(action)) {
                        keyActions.push(this.summarizeAction(action));
                    }
                }
            } else if (entry.role === 'model') {
                // Extract important events từ AI response
                try {
                    const parsed = JSON.parse(entry.parts[0].text);
                    if (parsed.story) {
                        const events = this.extractImportantEvents(parsed.story);
                        importantEvents.push(...events);
                    }
                } catch (e) {
                    // Skip invalid JSON responses
                }
            }
        });

        // Tạo summary
        const summary = this.createSummary(keyActions, importantEvents, startTurn, endTurn, config.summaryLength);
        
        // Estimate token count
        const tokenCount = this.estimateTokens(summary + keyActions.join(' ') + importantEvents.join(' '));
        
        console.log(`📄 Compressed Segment Created:`, {
            turnRange: `${startTurn}-${endTurn}`,
            entriesCompressed: entries.length,
            keyActionsFound: keyActions.length,
            importantEventsFound: importantEvents.length,
            summaryLength: summary.length,
            estimatedTokens: tokenCount
        });

        return {
            turnRange: `${startTurn}-${endTurn}`,
            summary,
            keyActions: keyActions.slice(0, 10), // Max 10 key actions
            importantEvents: importantEvents.slice(0, 10), // Max 10 events
            tokenCount,
            compressedAt: currentTurn
        };
    }

    /**
     * Kiểm tra action có quan trọng không
     */
    private static isImportantAction(action: string): boolean {
        const importantKeywords = [
            // Combat
            'tấn công', 'đánh', 'chiến đấu', 'giết', 'chém', 'đâm',
            // Social
            'nói với', 'hỏi', 'thuyết phục', 'giao dịch', 'mua', 'bán',
            // Movement
            'đi đến', 'di chuyển', 'rời khỏi', 'về',
            // Items/Skills
            'sử dụng', 'học', 'trang bị', 'lấy',
			// NSFW
			'cưỡng bức', 'sờ mó', 'bóp véo',
            // Important verbs
            'quyết định', 'chọn', 'tìm kiếm', 'khám phá'
        ];

        return importantKeywords.some(keyword => 
            action.toLowerCase().includes(keyword)
        );
    }

    /**
     * Rút gọn action thành dạng ngắn gọn
     */
    private static summarizeAction(action: string): string {
        // Truncate nếu quá dài
        if (action.length > 50) {
            return action.substring(0, 47) + '...';
        }
        return action;
    }

    /**
     * Extract các sự kiện quan trọng từ story
     */
    private static extractImportantEvents(story: string): string[] {
        const events: string[] = [];
        
        // Tìm các pattern quan trọng
        const importantPatterns = [
            // Items/Rewards
            /nhận được ([^.!?]+)/gi,
            /tìm thấy ([^.!?]+)/gi,
            /thu thập ([^.!?]+)/gi,
            
            // Combat results
            /(đánh bại|chiến thắng|thua|chết) ([^.!?]+)/gi,
            
            // Learning/Skills
            /học được ([^.!?]+)/gi,
            /nâng cấp ([^.!?]+)/gi,
            
            // Discovery
            /phát hiện ([^.!?]+)/gi,
            /gặp ([^.!?]+)/gi,
            
            // Status changes
            /(bị|được) ([^.!?]+)/gi
        ];

        importantPatterns.forEach(pattern => {
            const matches = story.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (match.length < 100) { // Chỉ giữ events ngắn
                        events.push(match.trim());
                    }
                });
            }
        });

        return events.slice(0, 5); // Max 5 events per story
    }

    /**
     * Tạo summary từ actions và events
     */
    private static createSummary(
        actions: string[],
        events: string[],
        startTurn: number,
        endTurn: number,
        maxLength: number
    ): string {
        let summary = `Lượt ${startTurn}-${endTurn}: `;
        
        if (actions.length > 0) {
            summary += `${actions.length} hành động quan trọng`;
        }
        
        if (events.length > 0) {
            if (actions.length > 0) summary += ', ';
            summary += `${events.length} sự kiện đáng chú ý`;
        }
        
        if (actions.length === 0 && events.length === 0) {
            summary += 'các hoạt động thường ngày';
        }
        
        summary += '.';
        
        // Truncate nếu quá dài
        if (summary.length > maxLength) {
            summary = summary.substring(0, maxLength - 3) + '...';
        }
        
        return summary;
    }

    /**
     * Ước tính token count
     */
    private static estimateTokens(text: string): number {
        return Math.ceil(text.length * 0.8); // Conservative estimate cho tiếng Việt
    }

    /**
     * Utility: Get statistics về history management
     */
    public static getHistoryStats(
        activeHistory: GameHistoryEntry[],
        compressedSegments: CompressedHistorySegment[]
    ): {
        activeEntries: number;
        compressedSegments: number;
        totalOriginalEntries: number;
        compressionRatio: number;
        estimatedTokenSaved: number;
    } {
        const activeEntries = activeHistory.length;
        const compressedCount = compressedSegments.length;
        
        // Ước tính số entries gốc
        const totalOriginalEntries = activeEntries + compressedSegments.reduce(
            (sum, segment) => sum + (parseInt(segment.turnRange.split('-')[1]) - parseInt(segment.turnRange.split('-')[0]) + 1) * 2,
            0
        );
        
        // Ước tính token đã tiết kiệm
        const estimatedTokenSaved = compressedSegments.reduce(
            (sum, segment) => {
                const originalTokens = (parseInt(segment.turnRange.split('-')[1]) - parseInt(segment.turnRange.split('-')[0]) + 1) * 2 * 500; // Assume 500 tokens per entry
                return sum + (originalTokens - segment.tokenCount);
            },
            0
        );
        
        const compressionRatio = totalOriginalEntries > 0 ? 
            (activeEntries + compressedSegments.reduce((sum, s) => sum + s.tokenCount / 500, 0)) / totalOriginalEntries : 
            1;
        
        return {
            activeEntries,
            compressedSegments: compressedCount,
            totalOriginalEntries,
            compressionRatio,
            estimatedTokenSaved
        };
    }
}
