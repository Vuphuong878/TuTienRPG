import { useState, useMemo } from 'react';
import type { Entity, Status, Quest } from '../types';

export interface ModalState {
    // Modal open/close states
    isHomeModalOpen: boolean;
    isRestartModalOpen: boolean;
    isMemoryModalOpen: boolean;
    isKnowledgeModalOpen: boolean;
    isCustomRulesModalOpen: boolean;
    isMapModalOpen: boolean;
    isPcInfoModalOpen: boolean;
    isPartyModalOpen: boolean;
    isQuestLogModalOpen: boolean;
    isSidebarOpen: boolean;
    isChoicesModalOpen: boolean;
    isGameSettingsModalOpen: boolean;
    isEntityImportModalOpen: boolean;
    isInventoryModalOpen: boolean;
    isAdminModalOpen: boolean;
    isEditItemModalOpen: boolean;
    isEditSkillModalOpen: boolean;
    isEditNPCModalOpen: boolean;
    isEditPCModalOpen: boolean;
    isEditLocationModalOpen: boolean;
    isRegexManagerModalOpen: boolean;
    
    // Active modal entities
    activeEntity: Entity | null;
    activeStatus: Status | null;
    activeQuest: Quest | null;
    activeEditItem: Entity | null;
    activeEditSkill: Entity | null;
    activeEditNPC: Entity | null;
    activeEditPC: Entity | null;
    activeEditLocation: Entity | null;
    
    // Notification states
    showSaveSuccess: boolean;
    showRulesSavedSuccess: boolean;
    notification: string | null;
}

export interface ModalStateActions {
    // Modal open/close setters
    setIsHomeModalOpen: (open: boolean) => void;
    setIsRestartModalOpen: (open: boolean) => void;
    setIsMemoryModalOpen: (open: boolean) => void;
    setIsKnowledgeModalOpen: (open: boolean) => void;
    setIsCustomRulesModalOpen: (open: boolean) => void;
    setIsMapModalOpen: (open: boolean) => void;
    setIsPcInfoModalOpen: (open: boolean) => void;
    setIsPartyModalOpen: (open: boolean) => void;
    setIsQuestLogModalOpen: (open: boolean) => void;
    setIsSidebarOpen: (open: boolean) => void;
    setIsChoicesModalOpen: (open: boolean) => void;
    setIsGameSettingsModalOpen: (open: boolean) => void;
    setIsEntityImportModalOpen: (open: boolean) => void;
    setIsInventoryModalOpen: (open: boolean) => void;
    setIsAdminModalOpen: (open: boolean) => void;
    setIsEditItemModalOpen: (open: boolean) => void;
    setIsEditSkillModalOpen: (open: boolean) => void;
    setIsEditNPCModalOpen: (open: boolean) => void;
    setIsEditPCModalOpen: (open: boolean) => void;
    setIsEditLocationModalOpen: (open: boolean) => void;
    setIsRegexManagerModalOpen: (open: boolean) => void;
    
    // Active modal entity setters
    setActiveEntity: (entity: Entity | null) => void;
    setActiveStatus: (status: Status | null) => void;
    setActiveQuest: (quest: Quest | null) => void;
    setActiveEditItem: (item: Entity | null) => void;
    setActiveEditSkill: (skill: Entity | null) => void;
    setActiveEditNPC: (npc: Entity | null) => void;
    setActiveEditPC: (pc: Entity | null) => void;
    setActiveEditLocation: (location: Entity | null) => void;
    
    // Notification setters
    setShowSaveSuccess: (show: boolean) => void;
    setShowRulesSavedSuccess: (show: boolean) => void;
    setNotification: (notification: string | null) => void;
    
    // Modal close handlers object
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
        regexManager: () => void;
    };
}

export const useModalState = (): [ModalState, ModalStateActions] => {
    // Modal open/close states
    const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
    const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
    const [isCustomRulesModalOpen, setIsCustomRulesModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isPcInfoModalOpen, setIsPcInfoModalOpen] = useState(false);
    const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
    const [isQuestLogModalOpen, setIsQuestLogModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChoicesModalOpen, setIsChoicesModalOpen] = useState(false);
    const [isGameSettingsModalOpen, setIsGameSettingsModalOpen] = useState(false);
    const [isEntityImportModalOpen, setIsEntityImportModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [isEditSkillModalOpen, setIsEditSkillModalOpen] = useState(false);
    const [isEditNPCModalOpen, setIsEditNPCModalOpen] = useState(false);
    const [isEditPCModalOpen, setIsEditPCModalOpen] = useState(false);
    const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
    const [isRegexManagerModalOpen, setIsRegexManagerModalOpen] = useState(false);
    
    // Active modal entities
    const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
    const [activeStatus, setActiveStatus] = useState<Status | null>(null);
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
    const [activeEditItem, setActiveEditItem] = useState<Entity | null>(null);
    const [activeEditSkill, setActiveEditSkill] = useState<Entity | null>(null);
    const [activeEditNPC, setActiveEditNPC] = useState<Entity | null>(null);
    const [activeEditPC, setActiveEditPC] = useState<Entity | null>(null);
    const [activeEditLocation, setActiveEditLocation] = useState<Entity | null>(null);
    
    // Notification states
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [showRulesSavedSuccess, setShowRulesSavedSuccess] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Memoized modal close handlers
    const modalCloseHandlers = useMemo(() => ({
        home: () => setIsHomeModalOpen(false),
        restart: () => setIsRestartModalOpen(false),
        memory: () => setIsMemoryModalOpen(false),
        knowledge: () => setIsKnowledgeModalOpen(false),
        customRules: () => setIsCustomRulesModalOpen(false),
        map: () => setIsMapModalOpen(false),
        pcInfo: () => setIsPcInfoModalOpen(false),
        party: () => setIsPartyModalOpen(false),
        questLog: () => setIsQuestLogModalOpen(false),
        choices: () => setIsChoicesModalOpen(false),
        inventory: () => setIsInventoryModalOpen(false),
        admin: () => setIsAdminModalOpen(false),
        editItem: () => {
            setIsEditItemModalOpen(false);
            setActiveEditItem(null);
        },
        editSkill: () => {
            setIsEditSkillModalOpen(false);
            setActiveEditSkill(null);
        },
        editNPC: () => {
            setIsEditNPCModalOpen(false);
            setActiveEditNPC(null);
        },
        editPC: () => {
            setIsEditPCModalOpen(false);
            setActiveEditPC(null);
        },
        editLocation: () => {
            setIsEditLocationModalOpen(false);
            setActiveEditLocation(null);
        },
        regexManager: () => setIsRegexManagerModalOpen(false),
    }), []);

    const modalState: ModalState = {
        isHomeModalOpen,
        isRestartModalOpen,
        isMemoryModalOpen,
        isKnowledgeModalOpen,
        isCustomRulesModalOpen,
        isMapModalOpen,
        isPcInfoModalOpen,
        isPartyModalOpen,
        isQuestLogModalOpen,
        isSidebarOpen,
        isChoicesModalOpen,
        isGameSettingsModalOpen,
        isEntityImportModalOpen,
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
        showSaveSuccess,
        showRulesSavedSuccess,
        notification
    };

    const modalStateActions: ModalStateActions = {
        setIsHomeModalOpen,
        setIsRestartModalOpen,
        setIsMemoryModalOpen,
        setIsKnowledgeModalOpen,
        setIsCustomRulesModalOpen,
        setIsMapModalOpen,
        setIsPcInfoModalOpen,
        setIsPartyModalOpen,
        setIsQuestLogModalOpen,
        setIsSidebarOpen,
        setIsChoicesModalOpen,
        setIsGameSettingsModalOpen,
        setIsEntityImportModalOpen,
        setIsInventoryModalOpen,
        setIsAdminModalOpen,
        setIsEditItemModalOpen,
        setIsEditSkillModalOpen,
        setIsEditNPCModalOpen,
        setIsEditPCModalOpen,
        setIsEditLocationModalOpen,
        setIsRegexManagerModalOpen,
        setActiveEntity,
        setActiveStatus,
        setActiveQuest,
        setActiveEditItem,
        setActiveEditSkill,
        setActiveEditNPC,
        setActiveEditPC,
        setActiveEditLocation,
        setShowSaveSuccess,
        setShowRulesSavedSuccess,
        setNotification,
        modalCloseHandlers
    };

    return [modalState, modalStateActions];
};