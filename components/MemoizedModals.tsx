// components/MemoizedModals.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { ConfirmationModal } from './ConfirmationModal.tsx';
import { EntityInfoModal } from './EntityInfoModal.tsx';
import { StatusDetailModal } from './StatusDetailModal.tsx';
import { QuestDetailModal } from './QuestDetailModal.tsx';
import { MemoryModal } from './MemoryModal.tsx';
import { KnowledgeBaseModal } from './KnowledgeBaseModal.tsx';
import { EnhancedCustomRulesModal } from './EnhancedCustomRulesModal.tsx';
import { MapModal } from './MapModal.tsx';
import { MobileChoicesModal } from './game/MobileChoicesModal.tsx';
import { PartyMemberTab } from './PartyMemberTab.tsx';
import { QuestLog } from './QuestLog.tsx';
import { InventoryModal } from './InventoryModal.tsx';
import { AdminModal } from './AdminModal.tsx';
import { EditItemModal } from './EditItemModal.tsx';
import { EditSkillModal } from './EditSkillModal.tsx';
import { EditNPCModal } from './EditNPCModal.tsx';
import { EditPCModal } from './EditPCModal.tsx';
import { EditLocationModal } from './EditLocationModal.tsx';
import { RegexManager } from './RegexManager.tsx';

import type { Entity, Status, Quest, KnownEntities, Memory, CustomRule, RegexRule } from './types.ts';
import { MBTI_PERSONALITIES } from './data/mbti.ts';
import { CrossIcon, UserIcon } from './Icons.tsx';
import * as GameIcons from './GameIcons.tsx';
import { getIconForEntity, getIconForStatus, getStatusBorderColor, getStatusTextColor, getStatusFontWeight } from './utils.ts';

// Utility function to format numbers properly, removing trailing commas
const formatNumber = (value: number): string => {
    if (value === 0) return '0';
    return value.toLocaleString().replace(/,$/, '');
};


// Props Interface
interface MemoizedModalsProps {
    // Modal visibility state
    isHomeModalOpen: boolean;
    isRestartModalOpen: boolean;
    isMemoryModalOpen: boolean;
    isKnowledgeModalOpen: boolean;
    isCustomRulesModalOpen: boolean;
    isMapModalOpen: boolean;
    isPcInfoModalOpen: boolean;
    isPartyModalOpen: boolean;
    isQuestLogModalOpen: boolean;
    isChoicesModalOpen: boolean;
    isInventoryModalOpen: boolean;
    isAdminModalOpen: boolean;
    isEditItemModalOpen: boolean;
    isEditSkillModalOpen: boolean;
    isEditNPCModalOpen: boolean;
    isEditPCModalOpen: boolean;
    isEditLocationModalOpen: boolean;
    isRegexManagerModalOpen?: boolean;

    // Active data for detail modals
    activeEntity: Entity | null;
    activeStatus: Status | null;
    activeQuest: Quest | null;
    activeEditItem: Entity | null;
    activeEditSkill: Entity | null;
    activeEditNPC: Entity | null;
    activeEditPC: Entity | null;
    activeEditLocation: Entity | null;

    // Handlers
    onBackToMenu: () => void;
    handleRestartGame: () => void;
    setActiveEntity: (entity: Entity | null) => void;
    handleUseItem: (itemName: string) => void;
    handleLearnItem: (itemName:string) => void;
    handleEquipItem: (itemName: string) => void;
    handleUnequipItem: (itemName: string) => void;
    handleDiscardItem: (item: Entity) => void;
    setActiveStatus: (status: Status | null) => void;
    handleStatusClick: (status: Status) => void;
    handleDeleteStatus: (statusName: string, entityName: string) => void;
    setActiveQuest: (quest: Quest | null) => void;
    handleToggleMemoryPin: (index: number) => void;
    handleEntityClick: (entityName: string) => void;
    handleSaveRules: (rules: CustomRule[]) => void;
    handleSaveRegexRules?: (rules: RegexRule[]) => void;
    handleAction: (action: string) => void;
    setActiveEditItem: (item: Entity | null) => void;
    handleSaveEditedItem: (originalItem: Entity, editedItem: Entity) => void;
    setIsEditItemModalOpen: (open: boolean) => void;
    setActiveEditSkill: (skill: Entity | null) => void;
    handleSaveEditedSkill: (originalSkill: Entity, editedSkill: Entity) => void;
    setIsEditSkillModalOpen: (open: boolean) => void;
    setActiveEditNPC: (npc: Entity | null) => void;
    handleSaveEditedNPC: (originalNPC: Entity, editedNPC: Entity) => void;
    setIsEditNPCModalOpen: (open: boolean) => void;
    setActiveEditPC: (pc: Entity | null) => void;
    handleSaveEditedPC: (originalPC: Entity, editedPC: Entity) => void;
    setIsEditPCModalOpen: (open: boolean) => void;
    setActiveEditLocation: (location: Entity | null) => void;
    handleSaveEditedLocation: (originalLocation: Entity, editedLocation: Entity) => void;
    setIsEditLocationModalOpen: (open: boolean) => void;
    
    // onClose handlers for modals
    modalCloseHandlers: {
        home: () => void;
        restart: () => void;
        memory: () => void;
        knowledge: () => void;
        customRules: () => void;
        map: () => void;
        pcInfo: () => void;
        party: () => void;
        questLog: () => void;
        choices: () => void;
        inventory: () => void;
        admin: () => void;
        editItem: () => void;
        editSkill: () => void;
        editNPC: () => void;
        editPC: () => void;
        editLocation: () => void;
        regexManager?: () => void;
    };

    // Game state data
    memories: Memory[];
    knownEntities: KnownEntities;
    statuses: Status[];
    quests: Quest[];
    customRules: CustomRule[];
    regexRules?: RegexRule[];
    choices: string[];
    turnCount: number;
    locationDiscoveryOrder: string[];
    worldData: any; // World configuration data including realm system
    
    // Computed data
    entityComputations: {
        pcEntity: Entity | undefined;
        pcStatuses: Status[];
        displayParty: Entity[];
        playerInventory: Entity[];
    };
}


// ===== MEMOIZED INFO PANEL MODAL =====
export const MemoizedInfoPanelModal = memo<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}>(({ isOpen, onClose, title, children, icon }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[65] p-4" onClick={onClose}>
            <div 
                className="bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-2xl w-full max-w-lg text-slate-900 dark:text-white flex flex-col" 
                onClick={e => e.stopPropagation()}
                style={{maxHeight: '70vh'}}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        {icon}
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">
                        <CrossIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
});
MemoizedInfoPanelModal.displayName = 'MemoizedInfoPanelModal';


// ===== MEMOIZED PLAYER CHARACTER SHEET =====
export const MemoizedPlayerCharacterSheet = memo<{
    pc: Entity | undefined;
    statuses: Status[];
    knownEntities: KnownEntities;
    onStatusClick: (status: Status) => void;
    onEntityClick: (entityName: string) => void;
    onEditPC?: (pc: Entity) => void;
    worldData: any;
}>(({ pc, statuses, knownEntities, onStatusClick, onEntityClick, onEditPC, worldData }) => {
    
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
    
    const learnedSkills = useMemo(() => pc?.learnedSkills || [], [pc?.learnedSkills]);
    
    const handleStatusClick = useCallback((status: Status) => {
        onStatusClick(status);
    }, [onStatusClick]);

    const handleEntityClick = useCallback((entityName: string) => {
        onEntityClick(entityName);
    }, [onEntityClick]);

    if (!pc) {
        return <div className="p-4 text-center text-slate-500">Không tìm thấy thông tin nhân vật.</div>;
    }

    return (
        <div className="p-4 h-full flex flex-col space-y-4 text-slate-700 dark:text-gray-300">
            {/* Basic Info */}
            <div>
                <h4 className="font-semibold text-lg text-slate-800 dark:text-white mb-2 border-b border-slate-300 dark:border-slate-600 pb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Thông tin cơ bản
                    </div>
                    {onEditPC && pc && (
                        <button 
                            onClick={() => onEditPC(pc)} 
                            className="text-yellow-500 hover:text-yellow-400 transition-colors p-1"
                            title="Chỉnh sửa thông tin nhân vật"
                        >
                            ✏️
                        </button>
                    )}
                </h4>
                <div className="space-y-2 text-sm pl-2">
                    <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-20 inline-block">Tên:</strong> {pc.name}</p>
                    {pc.gender && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-20 inline-block">Giới tính:</strong> {pc.gender}</p>}
                    {pc.age && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-20 inline-block">Tuổi:</strong> {pc.age}</p>}
                    {pc.location && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-20 inline-block">Vị trí:</strong> {pc.location}</p>}
                    
                    {/* Enhanced Appearance */}
                    {pc.appearance && (
                        <div>
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Dung mạo:</strong>
                            <p className="pl-2 mt-1 text-sm text-slate-600 dark:text-gray-400">{pc.appearance}</p>
                        </div>
                    )}
                    
                    {/* Enhanced Realm with color */}
                    {pc.realm && (
                        <p>
                            <strong className="font-semibold text-slate-800 dark:text-gray-100 w-20 inline-block">Thực lực:</strong> 
                            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{pc.realm}</span>
                        </p>
                    )}
                    
                    {/* Experience Points */}
                    {pc.currentExp !== undefined && (
                        <p>
                            <strong className="font-semibold text-slate-800 dark:text-gray-100 w-20 inline-block">{worldData?.expName || 'Kinh nghiệm'}:</strong> 
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{formatNumber(pc.currentExp)}</span>
                        </p>
                    )}
                    
                    {/* Enhanced Fame with color coding */}
                    <div>
                        <strong className="font-semibold text-slate-800 dark:text-gray-100">Danh vọng:</strong>
                        {pc.fame ? (
                            <span className={`ml-2 ${getFameColor(pc.fame)}`}>{pc.fame}</span>
                        ) : (
                            <span className="ml-2 text-gray-500 dark:text-gray-400 italic">Chưa có danh tiếng</span>
                        )}
                    </div>
                    
                    {/* Personality */}
                    {pc.personality && (
                        <div>
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Tính cách (Bề ngoài):</strong>
                            <p className="pl-2 mt-1 text-sm text-slate-600 dark:text-gray-400">{pc.personality}</p>
                        </div>
                    )}
                    
                    {/* Core Personality (MBTI) */}
                    {pc.personalityMbti && MBTI_PERSONALITIES[pc.personalityMbti] && (
                        <div>
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Tính cách (Cốt lõi):</strong>
                            <p className="pl-2 mt-1 text-sm text-slate-600 dark:text-gray-400">
                                {` ${MBTI_PERSONALITIES[pc.personalityMbti].title} (${pc.personalityMbti}) - `}
                                <span className="italic">{`"${MBTI_PERSONALITIES[pc.personalityMbti].description}"`}</span>
                            </p>
                        </div>
                    )}
                    
                    {/* Motivation */}
                    {pc.motivation && (
                        <div>
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Động cơ:</strong>
                            <p className="pl-2 mt-1 text-sm text-slate-600 dark:text-gray-400">{pc.motivation}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Skills */}
            <MemoizedSkillsSection 
                learnedSkills={learnedSkills}
                knownEntities={knownEntities}
                onEntityClick={handleEntityClick}
            />

            {/* Enhanced Statuses Section */}
            <MemoizedEnhancedStatusesSection 
                statuses={statuses}
                onStatusClick={handleStatusClick}
            />
        </div>
    );
});
MemoizedPlayerCharacterSheet.displayName = 'MemoizedPlayerCharacterSheet';

// ===== MEMOIZED SKILLS SECTION =====
const MemoizedSkillsSection = memo<{
    learnedSkills: string[];
    knownEntities: KnownEntities;
    onEntityClick: (entityName: string) => void;
}>(({ learnedSkills, knownEntities, onEntityClick }) => {
    
    const skillButtons = useMemo(() => {
        return learnedSkills.map(skillName => {
            const skillEntity = knownEntities[skillName];
            return {
                name: skillName,
                entity: skillEntity
            };
        });
    }, [learnedSkills, knownEntities]);

    return (
        <div>
            <h4 className="font-semibold text-lg text-slate-800 dark:text-white mb-2 border-b border-slate-300 dark:border-slate-600 pb-1 flex items-center gap-2">
                <GameIcons.ScrollIcon className="w-5 h-5" />
                Kỹ năng & Công pháp
            </h4>
            {skillButtons.length > 0 ? (
                <ul className="space-y-2 pl-2">
                    {skillButtons.map(skill => (
                        <SkillListItem
                            key={skill.name}
                            skill={skill}
                            onEntityClick={onEntityClick}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 italic pl-2">
                    Chưa học được kỹ năng nào.
                </p>
            )}
        </div>
    );
});
MemoizedSkillsSection.displayName = 'MemoizedSkillsSection';

// ===== MEMOIZED SKILL LIST ITEM =====
const SkillListItem = memo<{
    skill: { name: string; entity?: Entity };
    onEntityClick: (entityName: string) => void;
}>(({ skill, onEntityClick }) => {
    const handleClick = useCallback(() => {
        onEntityClick(skill.name);
    }, [skill.name, onEntityClick]);

    return (
        <li>
            <button 
                onClick={handleClick}
                className="text-left w-full p-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-md hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <p className="font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                    <span className="w-4 h-4">
                        {getIconForEntity(skill.entity || {name: skill.name, type: 'skill', description: ''})}
                    </span>
                    {skill.name} {skill.entity?.mastery ? `(${skill.entity.mastery})` : ''}
                </p>
                {skill.entity?.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-6">
                        {skill.entity.description}
                    </p>
                )}
            </button>
        </li>
    );
});
SkillListItem.displayName = 'SkillListItem';

// ===== MEMOIZED ENHANCED STATUSES SECTION =====
const MemoizedEnhancedStatusesSection = memo<{
    statuses: Status[];
    onStatusClick: (status: Status) => void;
}>(({ statuses, onStatusClick }) => {
    
    const statusButtons = useMemo(() => {
        return statuses.map(status => ({
            ...status,
            borderColor: getStatusBorderColor(status),
            textColor: getStatusTextColor(status),
            fontWeight: getStatusFontWeight(status)
        }));
    }, [statuses]);

    return (
        <div>
            <h4 className="font-semibold text-lg text-slate-800 dark:text-white mb-2 border-b border-slate-300 dark:border-slate-600 pb-1 flex items-center gap-2">
                <GameIcons.HeartIcon className="w-5 h-5" />
                Trạng thái hiện tại
            </h4>
            {statusButtons.length > 0 ? (
                <div className="flex flex-wrap gap-2 pl-2">
                    {statusButtons.map(status => (
                        <EnhancedStatusButton
                            key={status.name}
                            status={status}
                            onStatusClick={onStatusClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ml-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
                        Đang trong tình trạng bình thường
                    </p>
                </div>
            )}
        </div>
    );
});
MemoizedEnhancedStatusesSection.displayName = 'MemoizedEnhancedStatusesSection';

// ===== MEMOIZED ENHANCED STATUS BUTTON =====
const EnhancedStatusButton = memo<{
    status: Status & { borderColor: string; textColor: string; fontWeight: string };
    onStatusClick: (status: Status) => void;
}>(({ status, onStatusClick }) => {
    const handleClick = useCallback(() => {
        onStatusClick(status);
    }, [status, onStatusClick]);

    return (
        <button
            onClick={handleClick}
            className={`px-3 py-1.5 border rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 ${status.borderColor} hover:bg-slate-200 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 ${status.borderColor.replace('border-', 'ring-').replace('/50', '')} shadow-sm`}
        >
            <span className="w-4 h-4">{getIconForStatus(status)}</span>
            <span className={`${status.textColor} ${status.fontWeight} text-sm`}>
                {status.name}
            </span>
            {status.duration && status.duration !== 'permanent' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({status.duration})
                </span>
            )}
        </button>
    );
});
EnhancedStatusButton.displayName = 'EnhancedStatusButton';

// ===== MEMOIZED ALL MODALS WRAPPER =====
const MemoizedModalsComponent = ({ 
    isHomeModalOpen,
    isRestartModalOpen,
    isMemoryModalOpen,
    isKnowledgeModalOpen,
    isCustomRulesModalOpen,
    isMapModalOpen,
    isPcInfoModalOpen,
    isPartyModalOpen,
    isQuestLogModalOpen,
    isChoicesModalOpen,
    isInventoryModalOpen,
    isAdminModalOpen,
    isEditItemModalOpen,
    isEditSkillModalOpen,
    isEditNPCModalOpen,
    isEditPCModalOpen,
    isEditLocationModalOpen,
    isRegexManagerModalOpen,
    activeEntity,
    activeStatus,
    activeQuest,
    activeEditItem,
    activeEditSkill,
    activeEditNPC,
    activeEditPC,
    activeEditLocation,
    onBackToMenu,
    handleRestartGame,
    setActiveEntity,
    handleUseItem,
    handleLearnItem,
    handleEquipItem,
    handleUnequipItem,
    handleDiscardItem,
    setActiveStatus,
    handleStatusClick,
    handleDeleteStatus,
    setActiveQuest,
    handleToggleMemoryPin,
    handleEntityClick,
    handleSaveRules,
    handleSaveRegexRules,
    handleAction,
    setActiveEditItem,
    handleSaveEditedItem,
    setIsEditItemModalOpen,
    setActiveEditSkill,
    handleSaveEditedSkill,
    setIsEditSkillModalOpen,
    setActiveEditNPC,
    handleSaveEditedNPC,
    setIsEditNPCModalOpen,
    setActiveEditPC,
    handleSaveEditedPC,
    setIsEditPCModalOpen,
    setActiveEditLocation,
    handleSaveEditedLocation,
    setIsEditLocationModalOpen,
    modalCloseHandlers,
    memories,
    knownEntities,
    statuses,
    quests,
    customRules,
    regexRules,
    choices,
    turnCount,
    locationDiscoveryOrder,
    worldData,
    entityComputations
}: MemoizedModalsProps) => {

    return (
        <>
            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={isHomeModalOpen}
                onClose={modalCloseHandlers.home}
                onConfirm={onBackToMenu}
                title="Về Trang Chủ?"
                message="Bạn có chắc muốn thoát? Mọi tiến trình chưa lưu sẽ bị mất."
            />
            
            <ConfirmationModal
                isOpen={isRestartModalOpen}
                onClose={modalCloseHandlers.restart}
                onConfirm={handleRestartGame}
                title="Bắt Đầu Lại?"
                message="Bạn có chắc muốn bắt đầu lại cuộc phiêu lưu? Toàn bộ tiến trình hiện tại sẽ được khởi tạo lại từ đầu với cùng thiết lập thế giới."
            />

            {/* Entity & Status Modals */}
            <EntityInfoModal 
                entity={activeEntity ? (knownEntities[activeEntity.name] || activeEntity) : null} 
                onClose={() => setActiveEntity(null)} 
                onUseItem={handleUseItem} 
                onLearnItem={handleLearnItem} 
                onEquipItem={handleEquipItem} 
                onUnequipItem={handleUnequipItem} 
                statuses={statuses} 
                onStatusClick={handleStatusClick}
                onLocationAction={handleAction}
                worldData={worldData}
                onEditSkill={(skill) => {
                    setActiveEditSkill(skill);
                    setIsEditSkillModalOpen(true);
                }}
                onEditNPC={(npc) => {
                    setActiveEditNPC(npc);
                    setIsEditNPCModalOpen(true);
                }}
                onEditPC={(pc) => {
                    setActiveEditPC(pc);
                    setIsEditPCModalOpen(true);
                }}
                onEditLocation={(location) => {
                    setActiveEditLocation(location);
                    setIsEditLocationModalOpen(true);
                }}
                onDeleteStatus={handleDeleteStatus}
            />
            
            <StatusDetailModal 
                status={activeStatus} 
                onClose={() => setActiveStatus(null)} 
            />
            
            <QuestDetailModal 
                quest={activeQuest} 
                onClose={() => setActiveQuest(null)} 
            />
            

            {/* Game Content Modals */}
            <MemoryModal 
                isOpen={isMemoryModalOpen} 
                onClose={modalCloseHandlers.memory} 
                memories={memories} 
                onTogglePin={handleToggleMemoryPin}
                gameState={{
                    knownEntities,
                    turnCount,
                    statuses,
                    party: entityComputations.displayParty,
                    quests
                }}
            />
            
            <KnowledgeBaseModal 
                isOpen={isKnowledgeModalOpen} 
                onClose={modalCloseHandlers.knowledge} 
                pc={entityComputations.pcEntity} 
                knownEntities={knownEntities} 
                onEntityClick={handleEntityClick}
                onUpdateEntity={(entityName: string, updatedEntity: Entity) => {
                    // For now, we'll use a window global to update entities
                    // This should be properly passed as props in the future
                    if ((window as any).updateKnownEntity) {
                        (window as any).updateKnownEntity(entityName, updatedEntity);
                    }
                }}
                turnCount={turnCount} 
            />
            
            <EnhancedCustomRulesModal 
                isOpen={isCustomRulesModalOpen} 
                onClose={modalCloseHandlers.customRules} 
                onSave={handleSaveRules} 
                currentRules={customRules} 
            />
            
            <MapModal 
                isOpen={isMapModalOpen} 
                onClose={modalCloseHandlers.map}
                locations={Object.values(knownEntities).filter((e): e is Entity => e.type === 'location')}
                currentLocationName={entityComputations.pcEntity?.location || ''}
                discoveryOrder={locationDiscoveryOrder}
                onLocationClick={handleEntityClick}
            />

            {/* Info Panel Modals */}
            <MemoizedInfoPanelModal
                isOpen={isPcInfoModalOpen}
                onClose={modalCloseHandlers.pcInfo}
                title="Thông Tin Nhân Vật"
                icon={<UserIcon className="w-6 h-6" />}
            >
                <MemoizedPlayerCharacterSheet 
                    pc={entityComputations.pcEntity} 
                    statuses={entityComputations.pcStatuses} 
                    knownEntities={knownEntities} 
                    onStatusClick={handleStatusClick} 
                    onEntityClick={handleEntityClick}
                    onEditPC={(pc) => {
                        setActiveEditPC(pc);
                        setIsEditPCModalOpen(true);
                    }}
                    worldData={worldData}
                />
            </MemoizedInfoPanelModal>

            <MemoizedInfoPanelModal
                isOpen={isPartyModalOpen}
                onClose={modalCloseHandlers.party}
                title="Tổ Đội"
                icon={<GameIcons.NpcIcon className="w-6 h-6" />}
            >
                <PartyMemberTab 
                    party={entityComputations.displayParty} 
                    statuses={statuses}
                    onMemberClick={handleEntityClick}
                />
            </MemoizedInfoPanelModal>

            <MemoizedInfoPanelModal
                isOpen={isQuestLogModalOpen}
                onClose={modalCloseHandlers.questLog}
                title="Nhật Ký Nhiệm Vụ"
                icon={<GameIcons.ScrollIcon className="w-6 h-6" />}
            >
                <QuestLog 
                    quests={quests} 
                    onQuestClick={setActiveQuest} 
                />
            </MemoizedInfoPanelModal>

            {/* Mobile Choices Modal */}
            <MobileChoicesModal 
                isOpen={isChoicesModalOpen}
                onClose={modalCloseHandlers.choices}
                choices={choices}
                onAction={handleAction}
            />

            {/* Inventory Modal */}
            <InventoryModal
                key={`inventory-${entityComputations.playerInventory.length}`}
                isOpen={isInventoryModalOpen}
                onClose={modalCloseHandlers.inventory}
                playerInventory={entityComputations.playerInventory}
                onUseItem={(item) => handleUseItem(item.name)}
                onEquipItem={(item) => handleEquipItem(item.name)}
                onUnequipItem={(item) => handleUnequipItem(item.name)}
                onDiscardItem={handleDiscardItem}
                onEditItem={(item) => {
                    setActiveEditItem(item);
                    setIsEditItemModalOpen(true);
                }}
            />

            {/* Admin Modal */}
            <AdminModal
                isOpen={isAdminModalOpen}
                onClose={modalCloseHandlers.admin}
                currentPlayerExp={entityComputations.pcEntity?.currentExp || 0}
                onAddExp={(amount) => {
                    const pcEntity = entityComputations.pcEntity;
                    if (pcEntity) {
                        const newExp = (pcEntity.currentExp || 0) + amount;
                        handleAction(`ADMIN: [ENTITY_UPDATE: name="${pcEntity.name}", currentExp=${newExp}] Thêm ${amount} kinh nghiệm cho ${pcEntity.name}`);
                    }
                }}
                onAddItem={(itemData) => handleAction(`ADMIN: [ITEM_AQUIRED: name="${itemData.name}", description="${itemData.description}", type="item", owner="pc", usable="${itemData.usable}", equippable="${itemData.equippable}"${itemData.quantities ? `, quantities="${itemData.quantities}"` : ''}${itemData.durability ? `, durability="${itemData.durability}"` : ''}] Tạo vật phẩm ${itemData.name}`)}
                onAddSkill={(skillData) => handleAction(`ADMIN: [LORE_SKILL: name="${skillData.name}", description="${skillData.description}", realm="${skillData.realm || ''}", element="${skillData.element || ''}", skillType="${(skillData as any).skillType || 'combat'}"] [SKILL_LEARNED: name="${skillData.name}"] Tạo và học kỹ năng ${skillData.name}`)}
            />

            {/* Edit Item Modal */}
            <EditItemModal
                isOpen={isEditItemModalOpen}
                onClose={modalCloseHandlers.editItem}
                item={activeEditItem}
                onSaveItem={handleSaveEditedItem}
            />

            {/* Edit Skill Modal */}
            <EditSkillModal
                isOpen={isEditSkillModalOpen}
                onClose={modalCloseHandlers.editSkill}
                skill={activeEditSkill}
                onSaveSkill={handleSaveEditedSkill}
            />

            {/* Edit NPC Modal */}
            <EditNPCModal
                isOpen={isEditNPCModalOpen}
                onClose={modalCloseHandlers.editNPC}
                npc={activeEditNPC}
                onSaveNPC={handleSaveEditedNPC}
            />

            {/* Edit PC Modal */}
            <EditPCModal
                isOpen={isEditPCModalOpen}
                onClose={modalCloseHandlers.editPC}
                pc={activeEditPC}
                onSavePC={handleSaveEditedPC}
            />

            {/* Edit Location Modal */}
            <EditLocationModal
                isOpen={isEditLocationModalOpen}
                onClose={modalCloseHandlers.editLocation}
                location={activeEditLocation}
                onSaveLocation={handleSaveEditedLocation}
            />

            {/* Regex Manager Modal */}
            {modalCloseHandlers?.regexManager && handleSaveRegexRules && (
                (() => {
                    try {
                        return (
                            <RegexManager
                                isOpen={isRegexManagerModalOpen || false}
                                onClose={modalCloseHandlers.regexManager}
                                currentRules={regexRules || []}
                                onSave={handleSaveRegexRules}
                            />
                        );
                    } catch (error) {
                        console.error('Error loading RegexManager:', error);
                        return null;
                    }
                })()
            )}
        </>
    );
};

// Export memoized version
export const MemoizedModals = memo(MemoizedModalsComponent);
MemoizedModals.displayName = 'MemoizedModals';