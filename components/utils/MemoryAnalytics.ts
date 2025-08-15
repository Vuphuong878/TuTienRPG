import type { Memory, SaveData } from '../types';
import { ImportanceScorer } from './ImportanceScorer';

export interface MemoryTrend {
    category: string;
    count: number;
    averageImportance: number;
    recentGrowth: number;
    oldestMemory: number;
    newestMemory: number;
}

export interface MemoryInsight {
    type: 'trend' | 'recommendation' | 'achievement' | 'warning';
    title: string;
    description: string;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
    data?: any;
}

export interface MemoryAnalyticsResult {
    overview: {
        totalMemories: number;
        averageImportance: number;
        memoryGrowthRate: number;
        topCategories: string[];
        memoryHealth: 'excellent' | 'good' | 'fair' | 'poor';
    };
    trends: MemoryTrend[];
    insights: MemoryInsight[];
    recommendations: {
        cleanup: boolean;
        enhancement: boolean;
        archival: boolean;
        backup: boolean;
    };
    performance: {
        memoriesPerTurn: number;
        averageMemoryAge: number;
        duplicateRisk: number;
        tokenUsageEstimate: number;
    };
}

export class MemoryAnalytics {
    
    /**
     * Perform comprehensive memory analysis
     */
    public static analyzeMemories(gameState: SaveData): MemoryAnalyticsResult {
        const memories = gameState.memories;
        const currentTurn = gameState.turnCount;
        
        console.log(`📊 Memory Analytics: Analyzing ${memories.length} memories at turn ${currentTurn}`);
        
        // Basic overview calculations
        const overview = this.calculateOverview(memories, currentTurn);
        
        // Trend analysis by category
        const trends = this.analyzeTrends(memories, currentTurn);
        
        // Generate insights and recommendations
        const insights = this.generateInsights(memories, trends, overview, gameState);
        
        // Performance metrics
        const performance = this.calculatePerformance(memories, currentTurn);
        
        // Recommendations based on analysis
        const recommendations = this.generateRecommendations(overview, performance, insights);
        
        return {
            overview,
            trends,
            insights,
            recommendations,
            performance
        };
    }
    
    /**
     * Calculate basic memory overview statistics
     */
    private static calculateOverview(memories: Memory[], currentTurn: number): MemoryAnalyticsResult['overview'] {
        if (memories.length === 0) {
            return {
                totalMemories: 0,
                averageImportance: 0,
                memoryGrowthRate: 0,
                topCategories: [],
                memoryHealth: 'poor'
            };
        }
        
        const totalImportance = memories.reduce((sum, mem) => sum + (mem.importance || 0), 0);
        const averageImportance = totalImportance / memories.length;
        
        // Calculate growth rate (memories per turn)
        const oldestTurn = Math.min(...memories.map(m => m.createdAt || currentTurn));
        const turnSpan = Math.max(1, currentTurn - oldestTurn);
        const memoryGrowthRate = memories.length / turnSpan;
        
        // Top categories by count
        const categoryCount: Record<string, number> = {};
        memories.forEach(mem => {
            if (mem.category) {
                categoryCount[mem.category] = (categoryCount[mem.category] || 0) + 1;
            }
        });
        
        const topCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category]) => category);
        
        // Determine memory health
        let memoryHealth: 'excellent' | 'good' | 'fair' | 'poor';
        if (averageImportance >= 70 && memoryGrowthRate > 0.5) {
            memoryHealth = 'excellent';
        } else if (averageImportance >= 50 && memoryGrowthRate > 0.2) {
            memoryHealth = 'good';
        } else if (averageImportance >= 30) {
            memoryHealth = 'fair';
        } else {
            memoryHealth = 'poor';
        }
        
        return {
            totalMemories: memories.length,
            averageImportance,
            memoryGrowthRate,
            topCategories,
            memoryHealth
        };
    }
    
    /**
     * Analyze memory trends by category
     */
    private static analyzeTrends(memories: Memory[], currentTurn: number): MemoryTrend[] {
        const categoryData: Record<string, Memory[]> = {};
        
        // Group memories by category
        memories.forEach(mem => {
            const category = mem.category || 'uncategorized';
            if (!categoryData[category]) {
                categoryData[category] = [];
            }
            categoryData[category].push(mem);
        });
        
        // Calculate trends for each category
        const trends: MemoryTrend[] = [];
        
        for (const [category, categoryMemories] of Object.entries(categoryData)) {
            const count = categoryMemories.length;
            const totalImportance = categoryMemories.reduce((sum, mem) => sum + (mem.importance || 0), 0);
            const averageImportance = count > 0 ? totalImportance / count : 0;
            
            const creationTurns = categoryMemories.map(m => m.createdAt || currentTurn);
            const oldestMemory = Math.min(...creationTurns);
            const newestMemory = Math.max(...creationTurns);
            
            // Calculate recent growth (last 10 turns)
            const recentMemories = categoryMemories.filter(m => 
                (m.createdAt || currentTurn) > currentTurn - 10
            );
            const recentGrowth = recentMemories.length;
            
            trends.push({
                category,
                count,
                averageImportance,
                recentGrowth,
                oldestMemory,
                newestMemory
            });
        }
        
        // Sort by count (most popular categories first)
        return trends.sort((a, b) => b.count - a.count);
    }
    
    /**
     * Generate actionable insights from memory analysis
     */
    private static generateInsights(
        memories: Memory[], 
        trends: MemoryTrend[], 
        overview: MemoryAnalyticsResult['overview'],
        gameState: SaveData
    ): MemoryInsight[] {
        const insights: MemoryInsight[] = [];
        const currentTurn = gameState.turnCount;
        
        // Memory health insights
        if (overview.memoryHealth === 'excellent') {
            insights.push({
                type: 'achievement',
                title: 'Excellent Memory Quality',
                description: `Your memories have an average importance of ${overview.averageImportance.toFixed(1)}. Great storytelling!`,
                actionable: false,
                priority: 'low'
            });
        } else if (overview.memoryHealth === 'poor') {
            insights.push({
                type: 'warning',
                title: 'Low Memory Quality',
                description: 'Many memories have low importance scores. Consider focusing on more significant events.',
                actionable: true,
                priority: 'high'
            });
        }
        
        // Growth rate insights
        if (overview.memoryGrowthRate > 2) {
            insights.push({
                type: 'warning',
                title: 'High Memory Growth Rate',
                description: `Creating ${overview.memoryGrowthRate.toFixed(1)} memories per turn. Consider enabling auto-cleanup.`,
                actionable: true,
                priority: 'medium'
            });
        } else if (overview.memoryGrowthRate < 0.1) {
            insights.push({
                type: 'recommendation',
                title: 'Low Memory Activity',
                description: 'Very few memories being created. Enable smart memory generation for richer experiences.',
                actionable: true,
                priority: 'medium'
            });
        }
        
        // Category-specific insights
        trends.forEach(trend => {
            if (trend.recentGrowth > 5) {
                insights.push({
                    type: 'trend',
                    title: `Active ${trend.category} Events`,
                    description: `${trend.recentGrowth} new ${trend.category} memories in recent turns.`,
                    actionable: false,
                    priority: 'low',
                    data: { category: trend.category, growth: trend.recentGrowth }
                });
            }
            
            if (trend.averageImportance > 80) {
                insights.push({
                    type: 'achievement',
                    title: `High-Impact ${trend.category}`,
                    description: `Your ${trend.category} memories are exceptionally important (${trend.averageImportance.toFixed(1)} avg).`,
                    actionable: false,
                    priority: 'low'
                });
            }
        });
        
        // Duplication detection
        const duplicateRisk = this.detectDuplicateRisk(memories);
        if (duplicateRisk > 0.3) {
            insights.push({
                type: 'warning',
                title: 'Potential Duplicate Memories',
                description: `${Math.round(duplicateRisk * 100)}% of memories might be duplicates. Consider cleanup.`,
                actionable: true,
                priority: 'medium'
            });
        }
        
        // Memory age insights
        const oldMemories = memories.filter(m => 
            (currentTurn - (m.createdAt || currentTurn)) > 50
        );
        if (oldMemories.length > 20) {
            insights.push({
                type: 'recommendation',
                title: 'Archive Old Memories',
                description: `${oldMemories.length} memories are over 50 turns old. Consider archival to improve performance.`,
                actionable: true,
                priority: 'low'
            });
        }
        
        return insights.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    
    /**
     * Calculate performance metrics
     */
    private static calculatePerformance(memories: Memory[], currentTurn: number): MemoryAnalyticsResult['performance'] {
        if (memories.length === 0) {
            return {
                memoriesPerTurn: 0,
                averageMemoryAge: 0,
                duplicateRisk: 0,
                tokenUsageEstimate: 0
            };
        }
        
        // Memories per turn
        const oldestTurn = Math.min(...memories.map(m => m.createdAt || currentTurn));
        const turnSpan = Math.max(1, currentTurn - oldestTurn);
        const memoriesPerTurn = memories.length / turnSpan;
        
        // Average memory age
        const totalAge = memories.reduce((sum, mem) => 
            sum + (currentTurn - (mem.createdAt || currentTurn)), 0
        );
        const averageMemoryAge = totalAge / memories.length;
        
        // Duplicate risk assessment
        const duplicateRisk = this.detectDuplicateRisk(memories);
        
        // Token usage estimate
        const tokenUsageEstimate = memories.reduce((sum, mem) => 
            sum + this.estimateMemoryTokens(mem), 0
        );
        
        return {
            memoriesPerTurn,
            averageMemoryAge,
            duplicateRisk,
            tokenUsageEstimate
        };
    }
    
    /**
     * Generate system recommendations
     */
    private static generateRecommendations(
        overview: MemoryAnalyticsResult['overview'],
        performance: MemoryAnalyticsResult['performance'],
        insights: MemoryInsight[]
    ): MemoryAnalyticsResult['recommendations'] {
        return {
            cleanup: overview.totalMemories > 100 || performance.duplicateRisk > 0.2,
            enhancement: overview.averageImportance < 40,
            archival: performance.averageMemoryAge > 30,
            backup: overview.totalMemories > 50 && overview.memoryHealth !== 'poor'
        };
    }
    
    /**
     * Detect potential duplicate memories
     */
    private static detectDuplicateRisk(memories: Memory[]): number {
        if (memories.length < 2) return 0;
        
        let similarCount = 0;
        const threshold = 0.8; // 80% similarity threshold
        
        for (let i = 0; i < memories.length - 1; i++) {
            for (let j = i + 1; j < memories.length; j++) {
                const similarity = this.calculateTextSimilarity(
                    memories[i].text, 
                    memories[j].text
                );
                if (similarity > threshold) {
                    similarCount++;
                }
            }
        }
        
        const totalComparisons = (memories.length * (memories.length - 1)) / 2;
        return totalComparisons > 0 ? similarCount / totalComparisons : 0;
    }
    
    /**
     * Calculate text similarity between two strings
     */
    private static calculateTextSimilarity(text1: string, text2: string): number {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    
    /**
     * Estimate token usage for a memory
     */
    private static estimateMemoryTokens(memory: Memory): number {
        let tokens = Math.ceil(memory.text.length * 0.8); // Base text
        
        if (memory.tags?.length) {
            tokens += memory.tags.length * 2;
        }
        
        if (memory.relatedEntities?.length) {
            tokens += memory.relatedEntities.length * 3;
        }
        
        return tokens;
    }
    
    /**
     * Generate memory quality report
     */
    public static generateQualityReport(memories: Memory[]): {
        highQuality: Memory[];
        mediumQuality: Memory[];
        lowQuality: Memory[];
        needsEnhancement: Memory[];
        summary: string;
    } {
        const highQuality = memories.filter(m => (m.importance || 0) >= 70);
        const mediumQuality = memories.filter(m => {
            const importance = m.importance || 0;
            return importance >= 40 && importance < 70;
        });
        const lowQuality = memories.filter(m => (m.importance || 0) < 40);
        const needsEnhancement = memories.filter(m => 
            !m.category || !m.tags?.length || !m.relatedEntities?.length
        );
        
        const summary = `Quality Analysis: ${highQuality.length} high-quality, ${mediumQuality.length} medium-quality, ${lowQuality.length} low-quality memories. ${needsEnhancement.length} need enhancement.`;
        
        return {
            highQuality,
            mediumQuality,
            lowQuality,
            needsEnhancement,
            summary
        };
    }
}