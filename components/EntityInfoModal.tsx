import React from 'react';
import type { Entity, Status, EntityType } from './types.ts';
import { getIconForEntity, getIconForStatus, getStatusBorderColor, getStatusTextColor, getStatusFontWeight } from './utils.ts';
import { CrossIcon } from './Icons.tsx';
import { MBTI_PERSONALITIES } from './data/mbti.ts';

// Utility function to format numbers properly, removing trailing commas
const formatNumber = (value: number): string => {
    if (value === 0) return '0';
    return value.toLocaleString().replace(/,$/, '');
};

export const EntityInfoModal: React.FC<{ 
    entity: Entity | null; 
    onClose: () => void; 
    onUseItem: (itemName: string) => void;
    onLearnItem: (itemName: string) => void;
    onEquipItem: (itemName: string) => void;
    onUnequipItem: (itemName: string) => void;
    statuses: Status[];
    onStatusClick: (status: Status) => void;
    onLocationAction?: (action: string) => void;
    worldData?: any;
    onEditSkill?: (skill: Entity) => void;
    onEditNPC?: (npc: Entity) => void;
    onEditPC?: (pc: Entity) => void;
    onEditLocation?: (location: Entity) => void;
    onDeleteStatus?: (statusName: string, entityName: string) => void;
}> = ({ entity, onClose, onUseItem, onLearnItem, onEquipItem, onUnequipItem, statuses, onStatusClick, onLocationAction, worldData, onEditSkill, onEditNPC, onEditPC, onEditLocation, onDeleteStatus }) => {
    if (!entity) return null;

    const typeColors: { [key in EntityType | string]: string } = {
        pc: 'text-yellow-600 dark:text-yellow-400',
        npc: 'text-blue-600 dark:text-blue-400',
        companion: 'text-blue-600 dark:text-blue-400',
        location: 'text-green-600 dark:text-green-400',
        faction: 'text-red-700 dark:text-red-500',
        item: 'text-amber-700 dark:text-amber-300',
        skill: 'text-amber-700 dark:text-amber-300',
        concept: 'text-purple-600 dark:text-purple-400'
    };
    const borderColor: { [key in EntityType | string]: string } = {
        pc: 'border-yellow-400',
        npc: 'border-blue-400',
        companion: 'border-blue-400',
        location: 'border-green-400',
        faction: 'border-red-500',
        item: 'border-amber-400',
        skill: 'border-amber-400',
        concept: 'border-purple-400'
    };

    const isPcsItem = entity.type === 'item' && entity.owner === 'pc';
    const isLearnableItem = isPcsItem && entity.learnable;
    const isUsableItem = isPcsItem && entity.usable;
    const isEquippableItem = isPcsItem && entity.equippable;
    
    const characterStatuses = statuses.filter(s => {
        const isOwnerMatch = s.owner === entity.name;
        const isPcMatch = entity.type === 'pc' && s.owner === 'pc';
        return isOwnerMatch || isPcMatch;
    });
    
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

    // Helper function to get relationship status color
    const getRelationshipColor = (relationship: string): string => {
        const simplified = simplifyRelationship(relationship);
        const rel = simplified.toLowerCase();
        
        // Romantic relationships (special pink/red color)
        if (rel.includes('người yêu') || rel.includes('tình nhân') || rel.includes('vợ') || rel.includes('chồng')) {
            return 'text-pink-600 dark:text-pink-400';
        }
        // Negative relationships (red)
        if (rel.includes('thù') || rel.includes('địch') || rel.includes('ghét') || rel.includes('sợ')) {
            return 'text-red-600 dark:text-red-400';
        } 
        // Positive relationships (green)
        else if (rel.includes('tận tụy') || rel.includes('thân thiện') || rel.includes('tin') || rel.includes('tôn kính') || rel.includes('biết ơn') || rel.includes('gia đình') || rel.includes('đồng đội') || rel.includes('bạn thân')) {
            return 'text-green-600 dark:text-green-400';
        } 
        // Neutral relationships (yellow)
        else if (rel.includes('trung lập') || rel.includes('tò mò') || rel.includes('thận trọng') || rel.includes('cạnh tranh')) {
            return 'text-yellow-600 dark:text-yellow-400';
        }
        return 'text-slate-700 dark:text-gray-300';
    };

    // Helper function to get fame color
    const getFameColor = (fame: string): string => {
        const fameLevel = fame.toLowerCase();
        if (fameLevel.includes('nổi tiếng') || fameLevel.includes('danh gia') || fameLevel.includes('huyền thoại')) {
            return 'text-purple-600 dark:text-purple-400 font-semibold';
        } else if (fameLevel.includes('khét tiếng') || fameLevel.includes('ác danh')) {
            return 'text-red-600 dark:text-red-400 font-semibold';
        } else if (fameLevel.includes('tốt') || fameLevel.includes('cao')) {
            return 'text-green-600 dark:text-green-400 font-semibold';
        }
        return 'text-slate-700 dark:text-gray-300';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div 
                className={`bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 ${borderColor[entity.type] || 'border-slate-600'} rounded-lg shadow-2xl w-full ${entity.type === 'location' ? 'max-w-2xl' : 'max-w-lg'} text-slate-900 dark:text-white`} 
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-4 border-b-2 ${borderColor[entity.type] || 'border-slate-600'} flex justify-between items-center`}>
                    <h3 className={`text-xl font-bold ${typeColors[entity.type] || 'text-slate-900 dark:text-white'} flex items-center gap-2`}>
                        <span className="w-6 h-6">{getIconForEntity(entity)}</span>
                        {entity.name}
                        {entity.type === 'pc' && <span className="text-xs text-yellow-400 dark:text-yellow-500 font-normal italic">(Nhân vật chính)</span>}
                        {entity.equipped && <span className="text-xs text-green-400 dark:text-green-500 font-normal italic">(Đang trang bị)</span>}
                    </h3>
                    <div className="flex items-center gap-2">
                        {entity.type === 'skill' && onEditSkill && (
                            <button 
                                onClick={() => onEditSkill(entity)} 
                                className="text-amber-500 hover:text-amber-400 transition-colors p-1"
                                title="Chỉnh sửa kỹ năng"
                            >
                                ✏️
                            </button>
                        )}
                        {(entity.type === 'npc' || entity.type === 'companion') && onEditNPC && (
                            <button 
                                onClick={() => onEditNPC(entity)} 
                                className="text-blue-500 hover:text-blue-400 transition-colors p-1"
                                title="Chỉnh sửa NPC"
                            >
                                ✏️
                            </button>
                        )}
                        {entity.type === 'pc' && onEditPC && (
                            <button 
                                onClick={() => onEditPC(entity)} 
                                className="text-yellow-500 hover:text-yellow-400 transition-colors p-1"
                                title="Chỉnh sửa nhân vật chính"
                            >
                                ✏️
                            </button>
                        )}
                        {entity.type === 'location' && onEditLocation && (
                            <button 
                                onClick={() => onEditLocation(entity)} 
                                className="text-green-500 hover:text-green-400 transition-colors p-1"
                                title="Chỉnh sửa địa điểm"
                            >
                                ✏️
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">
                            <CrossIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
                
                <div className="p-5 space-y-3 text-slate-700 dark:text-gray-300 max-h-[70vh] overflow-y-auto">

                    {/* Basic Information */}
                    <div className="space-y-2">
                        <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Loại:</strong> <span className="capitalize">{entity.type === 'pc' ? 'Nhân vật chính' : entity.type === 'location' ? 'Địa điểm' : entity.type}</span></p>
                        
                        {/* Character-like info */}
                        {(entity.type === 'pc' || entity.type === 'npc' || entity.type === 'companion') && (
                            <>
                                {entity.gender && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Giới tính:</strong> {entity.gender}</p>}
                                {entity.age && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Tuổi:</strong> {entity.age}</p>}
                                {entity.appearance && (
                                    <div>
                                        <strong className="font-semibold text-slate-800 dark:text-gray-100">Dung mạo:</strong>
                                        <p className="pl-2 mt-1 text-sm">{entity.appearance}</p>
                                    </div>
                                )}
                                {entity.location && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Vị trí:</strong> {entity.location}</p>}
                                
                                {/* REALM AND EXPERIENCE - For PC and NPC */}
                                {entity.realm && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Cảnh giới:</strong> <span className="text-purple-600 dark:text-purple-400 font-medium">{entity.realm}</span></p>}
                                {entity.currentExp !== undefined && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">{worldData?.expName || 'Kinh nghiệm'}:</strong> <span className="text-blue-600 dark:text-blue-400 font-medium">{formatNumber(entity.currentExp)}</span></p>}
                                
                                {/* DANH VỌNG - Enhanced display for both PC and NPC */}
                                <div>
                                    <strong className="font-semibold text-slate-800 dark:text-gray-100">Danh vọng:</strong>
                                    {entity.fame ? (
                                        <span className={`ml-2 ${getFameColor(entity.fame)}`}>{entity.fame}</span>
                                    ) : (
                                        <span className="ml-2 text-gray-500 dark:text-gray-400 italic">
                                            {entity.type === 'pc' ? 'Chưa có danh tiếng' : 'Chưa xác định'}
                                        </span>
                                    )}
                                </div>
                                
                                {entity.personality && (
                                    <div>
                                        <strong className="font-semibold text-slate-800 dark:text-gray-100">Tính cách (Bề ngoài):</strong>
                                        <p className="pl-2 mt-1 text-sm">{entity.personality}</p>
                                    </div>
                                )}
                                {entity.motivation && (
                                    <div>
                                        <strong className="font-semibold text-slate-800 dark:text-gray-100">Động cơ:</strong>
                                        <p className="pl-2 mt-1 text-sm">{entity.motivation}</p>
                                    </div>
                                )}
                                {entity.type !== 'pc' && entity.personalityMbti && MBTI_PERSONALITIES[entity.personalityMbti] && (
                                    <div>
                                        <strong className="font-semibold text-slate-800 dark:text-gray-100">Tính cách (Cốt lõi):</strong>
                                        <p className="pl-2 mt-1 text-sm">
                                            {` ${MBTI_PERSONALITIES[entity.personalityMbti].title} (${entity.personalityMbti}) - `}
                                            <span className="italic">{`"${MBTI_PERSONALITIES[entity.personalityMbti].description}"`}</span>
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Location specific info */}
                        {entity.type === 'location' && (
                            <>
                                {/* Location Safety Status */}
                                <div className="flex items-center gap-2">
                                    <strong className="font-semibold text-slate-800 dark:text-gray-100">Tình trạng an toàn:</strong>
                                    {entity.description?.toLowerCase().includes('an toàn') ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full border border-green-300 dark:border-green-700">
                                            🛡️ An toàn
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-medium rounded-full border border-yellow-300 dark:border-yellow-700">
                                            ⚠️ Chưa rõ
                                        </span>
                                    )}
                                </div>

                                {/* Location Discovery Status */}
                                <div className="flex items-center gap-2">
                                    <strong className="font-semibold text-slate-800 dark:text-gray-100">Trạng thái khám phá:</strong>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-300 dark:border-blue-700">
                                        🗺️ Đã khám phá
                                    </span>
                                </div>

                                {/* Current Location Indicator */}
                                {entity.location && (
                                    <div className="flex items-center gap-2">
                                        <strong className="font-semibold text-slate-800 dark:text-gray-100">Thuộc khu vực:</strong>
                                        <span className="text-slate-600 dark:text-gray-400">{entity.location}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mastery for skills only (characters already have realm display above) */}
                        {entity.mastery && entity.type === 'skill' && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Mức độ thành thạo:</strong> <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{entity.mastery}</span></p>}
                    </div>

                    {/* PC specific info - Skills */}
                    {entity.type === 'pc' && entity.learnedSkills && Array.isArray(entity.learnedSkills) && entity.learnedSkills.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60">
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Kỹ năng đã học:</strong>
                            <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                                {entity.learnedSkills.map((skillName: string) => (
                                    <li key={skillName} className="text-sm text-slate-600 dark:text-gray-400">
                                        {skillName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* NPC and Companion specific info */}
                    {(entity.type === 'npc' || entity.type === 'companion') && (
                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-3">
                            {/* QUAN HỆ - Enhanced display */}
                            <div>
                                <strong className="font-semibold text-slate-800 dark:text-gray-100">Quan hệ:</strong>
                                {entity.relationship ? (
                                    <span className={`ml-2 ${getRelationshipColor(entity.relationship)}`}>
                                        {simplifyRelationship(entity.relationship)}
                                    </span>
                                ) : (
                                    <span className="ml-2 text-gray-500 dark:text-gray-400 italic">Chưa xác định</span>
                                )}
                            </div>

                            {/* Skills */}
                            {Array.isArray(entity.skills) && entity.skills.length > 0 && (
                                <div>
                                    <strong className="font-semibold text-slate-800 dark:text-gray-100">Kỹ năng:</strong>
                                    <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                                        {entity.skills.map((skillName: string) => (
                                            <li key={skillName} className="text-sm text-slate-600 dark:text-gray-400">
                                                {skillName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TRẠNG THÁI - Enhanced display for PC, NPC, and Companion */}
                    {(entity.type === 'pc' || entity.type === 'npc' || entity.type === 'companion') && (
                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60">
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Trạng thái hiện tại:</strong>
                            
                            {characterStatuses.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {characterStatuses.map(status => (
                                        <div key={status.name} className="relative group">
                                            <button
                                                onClick={() => onStatusClick(status)}
                                                className={`px-3 py-1.5 border rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 ${getStatusBorderColor(status)} hover:bg-slate-200 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 ${getStatusBorderColor(status).replace('border-', 'ring-').replace('/50', '')} shadow-sm`}
                                            >
                                                <span className="w-4 h-4">{getIconForStatus(status)}</span>
                                                <span className={`${getStatusTextColor(status)} ${getStatusFontWeight(status)} text-sm`}>
                                                    {status.name}
                                                </span>
                                                {status.duration && status.duration !== 'permanent' && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                        ({status.duration})
                                                    </span>
                                                )}
                                            </button>
                                            {/* Delete Status Button - Only show for PC and NPC */}
                                            {(entity.type === 'pc' || entity.type === 'npc' || entity.type === 'companion') && onDeleteStatus && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Bạn có chắc chắn muốn xóa trạng thái "${status.name}"?`)) {
                                                            onDeleteStatus(status.name, entity.name);
                                                        }
                                                    }}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-10"
                                                    title={`Xóa trạng thái: ${status.name}`}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
                                        {entity.type === 'pc' ? 'Đang trong tình trạng bình thường' : 'Không có trạng thái đặc biệt'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Item specific details */}
                    {entity.type === 'item' && (
                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
                            {typeof entity.durability === 'number' && 
                                <p>
                                    <strong className="font-semibold text-slate-800 dark:text-gray-100">Độ bền:</strong> 
                                    <span className={entity.durability <= 0 ? 'text-red-600 dark:text-red-400 font-bold' : entity.durability <= 20 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}>
                                        {` ${entity.durability} / 100 `}
                                        {entity.durability <= 0 && <span className="ml-2">(Hỏng)</span>}
                                        {entity.durability > 0 && entity.durability <= 20 && <span className="ml-2">(Sắp hỏng)</span>}
                                    </span>
                                </p>
                            }
                            {typeof entity.uses === 'number' && (
                                <p>
                                    <strong className="font-semibold text-slate-800 dark:text-gray-100">Số lần dùng:</strong> 
                                    <span className={entity.uses <= 0 ? 'text-red-600 dark:text-red-400' : entity.uses <= 2 ? 'text-yellow-600 dark:text-yellow-400' : ''}>
                                        {entity.uses}
                                        {entity.uses <= 0 && <span className="ml-2">(Đã hết)</span>}
                                        {entity.uses > 0 && entity.uses <= 2 && <span className="ml-2">(Sắp hết)</span>}
                                    </span>
                                </p>
                            )}
                            {entity.owner && (
                                <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Chủ sở hữu:</strong> {entity.owner}</p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60">
                        <strong className="font-semibold text-slate-800 dark:text-gray-100">Mô tả:</strong>
                        <p className="mt-2 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                            {entity.description || 'Chưa có mô tả.'}
                        </p>
                    </div>
                    
                    {/* Location Quick Actions */}
                    {entity.type === 'location' && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                            <strong className="font-semibold text-slate-800 dark:text-gray-100 mb-3 block">Hành động nhanh:</strong>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => {
                                        onClose();
                                        // Close modal first, then trigger map view (user will see map with location highlighted)
                                    }}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                                >
                                    🗺️ Xem trên bản đồ
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onLocationAction) {
                                            onLocationAction(`Đi tới ${entity.name}`);
                                        }
                                        onClose();
                                    }}
                                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                                >
                                    📍 Đi tới đây
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onLocationAction) {
                                            onLocationAction(`Khám phá ${entity.name}`);
                                        }
                                        onClose();
                                    }}
                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                                >
                                    🔍 Khám phá
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onLocationAction) {
                                            onLocationAction(`Ghi chú về ${entity.name}`);
                                        }
                                        onClose();
                                    }}
                                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                                >
                                    📝 Ghi chú
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Action buttons for items */}
                    {entity.type === 'item' && isPcsItem && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60 flex flex-col space-y-2">
                            {isEquippableItem && (
                                !entity.equipped ? (
                                    <button 
                                        onClick={() => onEquipItem(entity.name)} 
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        ⚔️ Trang bị
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => onUnequipItem(entity.name)} 
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        📤 Gỡ trang bị
                                    </button>
                                )
                            )}
                            {isUsableItem && ((entity.quantities === undefined || entity.quantities > 0) || (entity.uses === undefined || entity.uses > 0)) && (
                                <button 
                                    onClick={() => onUseItem(entity.name)} 
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    🍃 Sử dụng {(entity.quantities && `(${entity.quantities} lần)`) || (entity.uses && `(${entity.uses} lần)`)}
                                </button>
                            )}
                            {isLearnableItem && (
                                <button 
                                    onClick={() => onLearnItem(entity.name)} 
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    📚 Học công pháp
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
