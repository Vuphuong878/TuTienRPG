import React from 'react';
import type { Entity, Status } from './types.ts';
import { getIconForEntity } from './utils.ts';

export const PartyMemberTab: React.FC<{
    party: Entity[];
    statuses: Status[];
    onMemberClick: (entityName: string) => void;
}> = ({ party, statuses, onMemberClick }) => {
    
    // Helper to get member status indicators
    const getMemberStatusIndicators = (member: Entity) => {
        const memberStatuses = statuses.filter(s => s.owner === member.name || (member.type === 'pc' && s.owner === 'pc'));
        
        if (memberStatuses.length === 0) return null;
        
        const buffs = memberStatuses.filter(s => s.type === 'buff').length;
        const debuffs = memberStatuses.filter(s => s.type === 'debuff').length;
        const injuries = memberStatuses.filter(s => s.type === 'injury').length;
        
        return (
            <div className="flex gap-1 text-xs">
                {buffs > 0 && <span className="text-green-500">↑{buffs}</span>}
                {debuffs > 0 && <span className="text-red-500">↓{debuffs}</span>}
                {injuries > 0 && <span className="text-orange-500">⚡{injuries}</span>}
            </div>
        );
    };
    
    // Function to simplify complex relationship text to one clear Vietnamese attitude
    const simplifyRelationship = (relationship: string): string => {
        if (!relationship) return 'Chưa xác định';
        
        const rel = relationship.toLowerCase();
        
        // Define relationship priorities (stronger relationships take precedence)
        const relationshipPriority = [
            // Romantic relationships (highest priority)
            { keywords: ['người yêu', 'tình nhân', 'vợ', 'chồng', 'lover', 'wife', 'husband', 'romantic'], result: 'Người yêu' },
            
            // Very strong positive relationships
            { keywords: ['devoted', 'loyal', 'love', 'adoring', 'yêu thương', 'tận tụy', 'tận hiến'], result: 'Tận tụy' },
            
            // Strong negative relationships  
            { keywords: ['hostile', 'enemy', 'thù địch', 'thù ghét', 'kẻ thù'], result: 'Thù địch' },
            
            // Family relationships
            { keywords: ['gia đình', 'anh em', 'chị em', 'family', 'sibling', 'brother', 'sister'], result: 'Gia đình' },
            
            // Close relationships
            { keywords: ['đồng đội', 'teammate', 'partner', 'ally'], result: 'Đồng đội' },
            { keywords: ['bạn thân', 'best friend', 'close friend'], result: 'Bạn thân' },
            
            // Positive relationships
            { keywords: ['friendly', 'friend', 'warm', 'bạn bè', 'thân thiện'], result: 'Thân thiện' },
            { keywords: ['respect', 'admire', 'reverent', 'tôn kính', 'ngưỡng mộ'], result: 'Tôn kính' },
            { keywords: ['trust', 'confident', 'tin tưởng', 'tin cậy'], result: 'Tin tưởng' },
            { keywords: ['grateful', 'thankful', 'biết ơn', 'cảm kích'], result: 'Biết ơn' },
            
            // Negative relationships
            { keywords: ['suspicious', 'doubt', 'nghi ngờ', 'hoài nghi'], result: 'Nghi ngờ' },
            { keywords: ['competitive', 'rival', 'cạnh tranh', 'đối thủ'], result: 'Cạnh tranh' },
            { keywords: ['fear', 'afraid', 'sợ hãi', 'e ngại'], result: 'Sợ hãi' },
            
            // Neutral relationships
            { keywords: ['curious', 'interested', 'tò mò', 'quan tâm'], result: 'Tò mò' },
            { keywords: ['cautious', 'careful', 'cẩn thận', 'thận trọng'], result: 'Thận trọng' },
            { keywords: ['neutral', 'trung lập', 'bình thường'], result: 'Trung lập' }
        ];
        
        // Check each relationship type in priority order
        for (const relType of relationshipPriority) {
            for (const keyword of relType.keywords) {
                if (rel.includes(keyword)) {
                    return relType.result;
                }
            }
        }
        
        // If no specific keywords found, extract first meaningful part before "và" or other separators
        const firstPart = relationship.split(/\s*(?:và|and|,|;|\||\s-\s)\s*/)[0].trim();
        if (firstPart.length > 0 && firstPart.length < 20) {
            return firstPart;
        }
        
        return 'Chưa rõ';
    };

    // Helper to get relationship color
    const getRelationshipColor = (relationship: string) => {
        if (!relationship) return 'text-gray-500';
        const simplified = simplifyRelationship(relationship);
        const rel = simplified.toLowerCase();
        
        // Romantic relationships (special pink/red color)
        if (rel.includes('người yêu') || rel.includes('tình nhân') || rel.includes('vợ') || rel.includes('chồng')) {
            return 'text-pink-400';
        }
        // Negative relationships (red)
        if (rel.includes('thù') || rel.includes('địch') || rel.includes('ghét') || rel.includes('sợ')) {
            return 'text-red-400';
        }
        // Positive relationships (green)
        if (rel.includes('tận tụy') || rel.includes('thân thiện') || rel.includes('tin') || rel.includes('tôn kính') || rel.includes('biết ơn') || rel.includes('gia đình') || rel.includes('đồng đội') || rel.includes('bạn thân')) {
            return 'text-green-400';
        }
        // Neutral relationships (yellow)
        if (rel.includes('trung lập') || rel.includes('tò mò') || rel.includes('thận trọng') || rel.includes('cạnh tranh')) {
            return 'text-yellow-400';
        }
        return 'text-blue-400';
    };
    
    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-2 flex-shrink-0 text-slate-800 dark:text-white">Thành viên tổ đội:</h3>
            <div className="flex-grow overflow-y-auto pr-2">
                {party.length > 0 ? (
                    <div className="space-y-3">
                        {party.map(member => (
                            <div key={member.name} className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => onMemberClick(member.name)}
                                    className="w-full text-left hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors rounded p-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5">{getIconForEntity(member)}</span>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">{member.name}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    {member.type === 'pc' ? 'Nhân vật chính' : 'Đồng hành'}
                                                    {member.realm && ` • ${member.realm}`}
                                                </p>
                                            </div>
                                        </div>
                                        {getMemberStatusIndicators(member)}
                                    </div>
                                    
                                    {/* Enhanced info for companions */}
                                    {member.type === 'companion' && (
                                        <div className="mt-2 space-y-1">
                                            {member.relationship && (
                                                <p className={`text-xs ${getRelationshipColor(member.relationship)}`}>
                                                    ♦ {simplifyRelationship(member.relationship)}
                                                </p>
                                            )}
                                            {member.skills && Array.isArray(member.skills) && member.skills.length > 0 && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    ⚔ {member.skills.slice(0, 2).join(', ')}
                                                    {member.skills.length > 2 && '...'}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tổ đội trống.</p>
                )}
            </div>
        </div>
    );
};
