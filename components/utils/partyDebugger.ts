import type { Entity, Status } from '../types.ts';

// Party Debug Configuration
const PARTY_DEBUG_CONFIG = {
    enabled: true, // Set to false to disable all party debugging
    logToConsole: true,
    logToStorage: true,
    maxStoredLogs: 50,
    showTimestamps: true,
    showStackTrace: false
};

// Debug Log Types
type PartyDebugLogType = 
    | 'COMPANION_JOIN' 
    | 'COMPANION_LEAVE' 
    | 'RELATIONSHIP_CHANGE' 
    | 'STATUS_CHANGE' 
    | 'SKILL_CHANGE' 
    | 'REALM_CHANGE'
    | 'PARTY_COMPOSITION'
    | 'AI_CONTEXT_BUILD'
    | 'ERROR';

interface PartyDebugLog {
    timestamp: number;
    type: PartyDebugLogType;
    message: string;
    data?: any;
    turnCount?: number;
    stackTrace?: string;
}

class PartyDebugger {
    private logs: PartyDebugLog[] = [];
    private previousPartyState: Entity[] = [];
    private previousStatuses: Status[] = [];

    constructor() {
        this.loadLogsFromStorage();
        this.setupGlobalErrorHandler();
        this.log('PARTY_COMPOSITION', '🚀 Party Debugger initialized');
    }

    // Main logging method
    public log(type: PartyDebugLogType, message: string, data?: any, turnCount?: number): void {
        if (!PARTY_DEBUG_CONFIG.enabled) return;

        const logEntry: PartyDebugLog = {
            timestamp: Date.now(),
            type,
            message,
            data: data ? JSON.parse(JSON.stringify(data)) : undefined, // Deep clone
            turnCount,
            stackTrace: PARTY_DEBUG_CONFIG.showStackTrace ? new Error().stack : undefined
        };

        this.logs.push(logEntry);
        this.trimLogs();

        if (PARTY_DEBUG_CONFIG.logToConsole) {
            this.logToConsole(logEntry);
        }

        if (PARTY_DEBUG_CONFIG.logToStorage) {
            this.saveLogsToStorage();
        }
    }

    // Monitor party changes and auto-log
    public monitorPartyChanges(currentParty: Entity[], currentStatuses: Status[], turnCount: number): void {
        if (!PARTY_DEBUG_CONFIG.enabled) return;

        // Check for new companions
        const newCompanions = currentParty.filter(member => 
            member.type === 'companion' && 
            !this.previousPartyState.some(prev => prev.name === member.name)
        );

        newCompanions.forEach(companion => {
            this.log('COMPANION_JOIN', `🎉 New companion joined: ${companion.name}`, {
                companion: {
                    name: companion.name,
                    type: companion.type,
                    relationship: companion.relationship,
                    skills: companion.skills,
                    realm: companion.realm,
                    personality: companion.personality
                },
                partySize: currentParty.length
            }, turnCount);
        });

        // Check for removed companions  
        const removedCompanions = this.previousPartyState.filter(prev => 
            prev.type === 'companion' && 
            !currentParty.some(current => current.name === prev.name)
        );

        removedCompanions.forEach(companion => {
            this.log('COMPANION_LEAVE', `💔 Companion left: ${companion.name}`, {
                companion: {
                    name: companion.name,
                    relationship: companion.relationship,
                    reason: 'Unknown' // Could be enhanced to track reason
                },
                partySize: currentParty.length
            }, turnCount);
        });

        // Check for relationship changes
        currentParty.forEach(currentMember => {
            const previousMember = this.previousPartyState.find(prev => prev.name === currentMember.name);
            if (previousMember && previousMember.relationship !== currentMember.relationship) {
                this.log('RELATIONSHIP_CHANGE', `💕 Relationship changed: ${currentMember.name}`, {
                    name: currentMember.name,
                    previousRelationship: previousMember.relationship || 'Unknown',
                    newRelationship: currentMember.relationship || 'Unknown',
                    change: this.getRelationshipChangeDirection(previousMember.relationship, currentMember.relationship)
                }, turnCount);
            }

            // Check for realm changes
            if (previousMember && previousMember.realm !== currentMember.realm) {
                this.log('REALM_CHANGE', `⚡ Power level changed: ${currentMember.name}`, {
                    name: currentMember.name,
                    previousRealm: previousMember.realm || 'Unknown',
                    newRealm: currentMember.realm || 'Unknown',
                    change: 'upgrade' // Could be enhanced to detect upgrade/downgrade
                }, turnCount);
            }

            // Check for skill changes
            if (previousMember && JSON.stringify(previousMember.skills) !== JSON.stringify(currentMember.skills)) {
                this.log('SKILL_CHANGE', `🎯 Skills changed: ${currentMember.name}`, {
                    name: currentMember.name,
                    previousSkills: previousMember.skills || [],
                    newSkills: currentMember.skills || [],
                    addedSkills: this.getAddedSkills(previousMember.skills, currentMember.skills),
                    removedSkills: this.getRemovedSkills(previousMember.skills, currentMember.skills)
                }, turnCount);
            }
        });

        // Check for status changes affecting party members
        this.monitorStatusChanges(currentParty, currentStatuses, turnCount);

        // Update stored state
        this.previousPartyState = JSON.parse(JSON.stringify(currentParty));
        this.previousStatuses = JSON.parse(JSON.stringify(currentStatuses));

        // Log party composition if significant changes
        if (newCompanions.length > 0 || removedCompanions.length > 0) {
            this.logPartyComposition(currentParty, turnCount);
        }
    }

    // Monitor status changes for party members
    private monitorStatusChanges(party: Entity[], currentStatuses: Status[], turnCount: number): void {
        party.forEach(member => {
            const currentMemberStatuses = currentStatuses.filter(s => 
                s.owner === member.name || (member.type === 'pc' && s.owner === 'pc')
            );
            const previousMemberStatuses = this.previousStatuses.filter(s => 
                s.owner === member.name || (member.type === 'pc' && s.owner === 'pc')
            );

            // Check for new statuses
            const newStatuses = currentMemberStatuses.filter(current => 
                !previousMemberStatuses.some(prev => prev.name === current.name)
            );

            newStatuses.forEach(status => {
                this.log('STATUS_CHANGE', `✨ Status applied to ${member.name}: ${status.name}`, {
                    memberName: member.name,
                    memberType: member.type,
                    status: {
                        name: status.name,
                        type: status.type,
                        description: status.description,
                        duration: status.duration,
                        source: status.source
                    },
                    action: 'APPLIED'
                }, turnCount);
            });

            // Check for removed statuses
            const removedStatuses = previousMemberStatuses.filter(prev => 
                !currentMemberStatuses.some(current => current.name === prev.name)
            );

            removedStatuses.forEach(status => {
                this.log('STATUS_CHANGE', `🗑️ Status removed from ${member.name}: ${status.name}`, {
                    memberName: member.name,
                    memberType: member.type,
                    status: {
                        name: status.name,
                        type: status.type,
                        reason: 'Unknown' // Could be enhanced to track removal reason
                    },
                    action: 'REMOVED'
                }, turnCount);
            });
        });
    }

    // Log AI context building process
    public logAIContextBuild(partyContextData: any, tokenUsage: number, turnCount: number): void {
        this.log('AI_CONTEXT_BUILD', `🤖 AI Party Context Built`, {
            companionCount: partyContextData.companions?.length || 0,
            tokensUsed: tokenUsage,
            contextLength: partyContextData.contextLength,
            includesPersonalities: partyContextData.includesPersonalities,
            includesSkills: partyContextData.includesSkills,
            includesRelationships: partyContextData.includesRelationships
        }, turnCount);
    }

    // Log party composition summary
    public logPartyComposition(party: Entity[], turnCount: number): void {
        const companions = party.filter(p => p.type === 'companion');
        const pc = party.find(p => p.type === 'pc');

        this.log('PARTY_COMPOSITION', `👥 Current Party Composition`, {
            totalMembers: party.length,
            pc: pc ? {
                name: pc.name,
                realm: pc.realm,
                location: pc.location
            } : null,
            companions: companions.map(c => ({
                name: c.name,
                relationship: c.relationship,
                realm: c.realm,
                skillCount: c.skills?.length || 0,
                topSkills: c.skills?.slice(0, 3) || []
            })),
            partyStrength: this.calculatePartyStrength(party)
        }, turnCount);
    }

    // Console logging with styling
    private logToConsole(log: PartyDebugLog): void {
        const timestamp = PARTY_DEBUG_CONFIG.showTimestamps 
            ? `[${new Date(log.timestamp).toLocaleTimeString()}]` 
            : '';
        
        const typeColors: Record<PartyDebugLogType, string> = {
            'COMPANION_JOIN': 'color: #10B981; font-weight: bold',
            'COMPANION_LEAVE': 'color: #EF4444; font-weight: bold',
            'RELATIONSHIP_CHANGE': 'color: #EC4899; font-weight: bold',
            'STATUS_CHANGE': 'color: #8B5CF6; font-weight: bold',
            'SKILL_CHANGE': 'color: #F59E0B; font-weight: bold',
            'REALM_CHANGE': 'color: #06B6D4; font-weight: bold',
            'PARTY_COMPOSITION': 'color: #6366F1; font-weight: bold',
            'AI_CONTEXT_BUILD': 'color: #84CC16; font-weight: bold',
            'ERROR': 'color: #DC2626; font-weight: bold'
        };

        console.groupCollapsed(
            `%c🎭 PARTY DEBUG ${timestamp} [${log.type}] ${log.message}`,
            typeColors[log.type]
        );
        
        if (log.data) {
            console.log('📊 Data:', log.data);
        }
        
        if (log.turnCount) {
            console.log('🎲 Turn:', log.turnCount);
        }
        
        if (log.stackTrace && PARTY_DEBUG_CONFIG.showStackTrace) {
            console.log('📍 Stack:', log.stackTrace);
        }
        
        console.groupEnd();
    }

    // Storage management
    private saveLogsToStorage(): void {
        try {
            localStorage.setItem('partyDebugLogs', JSON.stringify(this.logs));
        } catch (error) {
            console.warn('Failed to save party debug logs to storage:', error);
        }
    }

    private loadLogsFromStorage(): void {
        try {
            const stored = localStorage.getItem('partyDebugLogs');
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load party debug logs from storage:', error);
            this.logs = [];
        }
    }

    private trimLogs(): void {
        if (this.logs.length > PARTY_DEBUG_CONFIG.maxStoredLogs) {
            this.logs = this.logs.slice(-PARTY_DEBUG_CONFIG.maxStoredLogs);
        }
    }

    // Utility methods
    private getRelationshipChangeDirection(prev?: string, current?: string): string {
        const positiveWords = ['bạn', 'yêu', 'thân', 'tin cậy'];
        const negativeWords = ['thù', 'địch', 'ghét', 'nghi ngờ'];
        
        const prevScore = this.getRelationshipScore(prev, positiveWords, negativeWords);
        const currentScore = this.getRelationshipScore(current, positiveWords, negativeWords);
        
        if (currentScore > prevScore) return 'IMPROVED';
        if (currentScore < prevScore) return 'DETERIORATED';
        return 'CHANGED';
    }

    private getRelationshipScore(relationship?: string, positive: string[], negative: string[]): number {
        if (!relationship) return 0;
        const lower = relationship.toLowerCase();
        
        if (positive.some(word => lower.includes(word))) return 1;
        if (negative.some(word => lower.includes(word))) return -1;
        return 0;
    }

    private getAddedSkills(previous?: string[], current?: string[]): string[] {
        if (!current) return [];
        if (!previous) return current;
        return current.filter(skill => !previous.includes(skill));
    }

    private getRemovedSkills(previous?: string[], current?: string[]): string[] {
        if (!previous) return [];
        if (!current) return previous;
        return previous.filter(skill => !current.includes(skill));
    }

    private calculatePartyStrength(party: Entity[]): string {
        const companions = party.filter(p => p.type === 'companion');
        if (companions.length === 0) return 'SOLO';
        if (companions.length <= 2) return 'SMALL_PARTY';
        if (companions.length <= 4) return 'BALANCED_PARTY';
        return 'LARGE_PARTY';
    }

    private setupGlobalErrorHandler(): void {
        const originalError = console.error;
        console.error = (...args) => {
            if (args.some(arg => typeof arg === 'string' && arg.includes('party'))) {
                this.log('ERROR', '❌ Party-related error detected', {
                    error: args.join(' '),
                    timestamp: Date.now()
                });
            }
            originalError.apply(console, args);
        };
    }

    // Public API for external access
    public getLogs(type?: PartyDebugLogType): PartyDebugLog[] {
        return type ? this.logs.filter(log => log.type === type) : this.logs;
    }

    public clearLogs(): void {
        this.logs = [];
        this.saveLogsToStorage();
        console.log('🧹 Party debug logs cleared');
    }

    public exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    public getDebugSummary(): any {
        const types = this.logs.reduce((acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalLogs: this.logs.length,
            logsByType: types,
            latestLogs: this.logs.slice(-5),
            currentPartySize: this.previousPartyState.length,
            companions: this.previousPartyState.filter(p => p.type === 'companion').length
        };
    }
}

// Export singleton instance
export const partyDebugger = new PartyDebugger();

// Export configuration for external modification
export { PARTY_DEBUG_CONFIG };

// Convenience functions
export const logCompanionJoin = (companion: Entity, turnCount: number) => 
    partyDebugger.log('COMPANION_JOIN', `New companion: ${companion.name}`, companion, turnCount);

export const logCompanionLeave = (companionName: string, reason: string, turnCount: number) => 
    partyDebugger.log('COMPANION_LEAVE', `Companion left: ${companionName}`, { name: companionName, reason }, turnCount);

export const logRelationshipChange = (memberName: string, oldRel: string, newRel: string, turnCount: number) => 
    partyDebugger.log('RELATIONSHIP_CHANGE', `Relationship changed: ${memberName}`, { 
        name: memberName, 
        from: oldRel, 
        to: newRel 
    }, turnCount);