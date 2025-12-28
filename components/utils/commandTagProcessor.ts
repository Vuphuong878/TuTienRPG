import type { Entity, Status, Quest, Memory, Chronicle, RegexRule } from '../types';
import { partyDebugger } from './partyDebugger';
import { MemoryEnhancer } from './MemoryEnhancer';
import { ReferenceIdGenerator } from './ReferenceIdGenerator';
import { regexEngine, RegexPlacement } from './RegexEngine';

export interface CommandTagProcessorParams {
    // State setters
    setGameTime: (time: any | ((prev: any) => any)) => void;
    setChronicle: (chronicle: Chronicle | ((prev: Chronicle) => Chronicle)) => void;
    setMemories: (memories: Memory[] | ((prev: Memory[]) => Memory[])) => void;
    setStatuses: (statuses: Status[] | ((prev: Status[]) => Status[])) => void;
    setKnownEntities: (entities: { [key: string]: Entity } | ((prev: { [key: string]: Entity }) => { [key: string]: Entity })) => void;
    setQuests: (quests: Quest[] | ((prev: Quest[]) => Quest[])) => void;
    setParty: (party: Entity[] | ((prev: Entity[]) => Entity[])) => void;
    setLocationDiscoveryOrder: (order: string[] | ((prev: string[]) => string[])) => void;
    
    // Current state values for reference
    knownEntities: { [key: string]: Entity };
    statuses: Status[];
    party: Entity[];
    regexRules: RegexRule[];
    turnCount?: number;
    worldData?: any; // For accessing realm tiers and experience system
}

// Enhanced Entity Deduplication System - Intelligent entity merging
const intelligentEntityMerge = (existingEntity: Entity, newAttributes: any): Entity => {
    const merged = { ...existingEntity };
    
    // Always preserve critical identity fields
    const preserveFields = ['referenceId', 'type', 'name'];
    
    // Intelligent field merging rules
    for (const [key, newValue] of Object.entries(newAttributes)) {
        if (preserveFields.includes(key)) {
            // Skip critical identity fields
            continue;
        }
        
        const existingValue = merged[key as keyof Entity];
        
        if (!existingValue || existingValue === '' || existingValue === null || existingValue === undefined) {
            // Fill in missing information
            merged[key as keyof Entity] = newValue;
        } else if (key === 'skills') {
            // Special handling for skills - merge arrays
            const existingSkills = Array.isArray(existingValue) ? existingValue : (typeof existingValue === 'string' ? existingValue.split(',').map(s => s.trim()) : []);
            const newSkills = Array.isArray(newValue) ? newValue : (typeof newValue === 'string' ? newValue.split(',').map(s => s.trim()) : []);
            
            // Merge unique skills
            const mergedSkills = [...new Set([...existingSkills, ...newSkills])];
            merged[key as keyof Entity] = mergedSkills;
        } else if (key === 'description') {
            // For descriptions, prefer longer/more detailed version
            if (typeof newValue === 'string' && typeof existingValue === 'string') {
                if (newValue.length > existingValue.length) {
                    merged[key as keyof Entity] = newValue;
                }
                // Otherwise keep existing description
            }
        } else if (key === 'personality' || key === 'motivation') {
            // For personality and motivation, prefer more detailed version
            if (typeof newValue === 'string' && typeof existingValue === 'string') {
                if (newValue.length > existingValue.length) {
                    merged[key as keyof Entity] = newValue;
                }
            }
        } else if (key === 'relationship') {
            // For relationships, allow updates to reflect character development
            merged[key as keyof Entity] = newValue;
        } else if (key === 'location') {
            // Location can change - allow updates
            merged[key as keyof Entity] = newValue;
        } else if (key === 'realm' || key === 'level' || key === 'experience') {
            // Character progression - allow updates to higher values
            if (typeof newValue === 'string' && typeof existingValue === 'string') {
                // For realm, trust the AI's assessment of current power
                merged[key as keyof Entity] = newValue;
            }
        } else if (!existingValue) {
            // Fill in any other missing fields
            merged[key as keyof Entity] = newValue;
        }
        // For other fields, preserve existing values to maintain consistency
    }
    
    return merged;
};

// Helper function to calculate new time
const calculateNewTime = (
    currentTime: { year: number; month: number; day: number; hour: number; minute: number; },
    elapsed: { years: number; months: number; days: number; hours: number; minutes: number; }
): { year: number; month: number; day: number; hour: number; minute: number; } => {
    let { year, month, day, hour, minute } = currentTime;

    // Add minutes first
    minute += elapsed.minutes;
    hour += Math.floor(minute / 60);
    minute = minute % 60;

    // Add hours
    hour += elapsed.hours;
    day += Math.floor(hour / 24);
    hour = hour % 24;

    day += elapsed.days;
    // Assuming 30 days a month for simplicity
    if (day > 30) {
        month += Math.floor((day - 1) / 30);
        day = ((day - 1) % 30) + 1;
    }
    
    month += elapsed.months;
    // Assuming 12 months a year
    if (month > 12) {
        year += Math.floor((month - 1) / 12);
        month = ((month - 1) % 12) + 1;
    }
    
    year += elapsed.years;

    return { year, month, day, hour, minute };
};

const applyStatusWithLimit = (prevStatuses: Status[], newStatusAttributes: any, owner: string): Status[] => {
    const newStatusType = newStatusAttributes.type;
    if (!newStatusType) {
        // Failsafe for statuses without a type, just add it.
        return [...prevStatuses, { ...newStatusAttributes, owner } as Status];
    }

    // 1. Remove any existing status with the same name for the same owner to allow "refreshing" a status.
    const filteredStatuses = prevStatuses.filter(s => !(s.name === newStatusAttributes.name && s.owner === owner));
    
    // 2. Separate statuses for the target owner.
    const otherOwnersStatuses = filteredStatuses.filter(s => s.owner !== owner);
    const ownerStatuses = filteredStatuses.filter(s => s.owner === owner);

    // 3. Separate the owner's statuses by the new status's type.
    const ownerStatusesOfType = ownerStatuses.filter(s => s.type === newStatusType);
    const ownerStatusesOfOtherTypes = ownerStatuses.filter(s => s.type !== newStatusType);
    
    // 4. Apply the limit. Max 2 statuses per type.
    const maxStatusesPerType = 2;
    let finalOwnerStatusesOfType = ownerStatusesOfType;

    if (ownerStatusesOfType.length >= maxStatusesPerType) {
        // If limit is reached or exceeded, keep only the newest (limit - 1) statuses.
        // The oldest ones are at the beginning of the array.
        finalOwnerStatusesOfType = ownerStatusesOfType.slice(ownerStatusesOfType.length - (maxStatusesPerType - 1));
    }
    
    // 5. Create the new status object to add.
    const newStatusToAdd: Status = { ...newStatusAttributes, owner: owner };
    
    // 6. Reconstruct and return the new status list.
    const finalResult = [
        ...otherOwnersStatuses, 
        ...ownerStatusesOfOtherTypes,
        ...finalOwnerStatusesOfType, 
        newStatusToAdd
    ];
    
    console.log('🔧 Final result:', {
        totalCount: finalResult.length,
        newStatusAdded: finalResult.find(s => s.name === newStatusAttributes.name && s.owner === owner),
        allStatuses: finalResult.map(s => `${s.name}(${s.owner})`)
    });
    
    return finalResult;
};

// Helper function to check and update realm progression
const checkRealmProgression = (entity: Entity, worldData: any): Entity => {
    if (!entity || entity.type !== 'pc' || !worldData?.realmTiers || !entity.currentExp) {
        return entity;
    }

    const { realmTiers } = worldData;
    const currentExp = entity.currentExp;
    let newRealm = entity.realm;

    // Find the highest realm tier the player qualifies for
    for (let i = realmTiers.length - 1; i >= 0; i--) {
        const tier = realmTiers[i];
        if (currentExp >= tier.requiredExp) {
            newRealm = tier.name;
            break;
        }
    }

    // If realm changed, log and return updated entity
    if (newRealm !== entity.realm) {
        console.log(`🌟 Realm progression: ${entity.realm} → ${newRealm} (Exp: ${currentExp})`);
        // You could also add a status effect here to indicate the breakthrough
        return { ...entity, realm: newRealm };
    }

    return entity;
};

// Utility function to synchronize skill names in PC/NPC arrays with skill entities
const synchronizeSkillNames = (
    knownEntities: { [key: string]: Entity },
    party: Entity[]
): { updatedKnownEntities: { [key: string]: Entity }, updatedParty: Entity[], changesFound: boolean } => {
    const updatedKnownEntities = { ...knownEntities };
    let updatedParty = [...party];
    let changesFound = false;

    // Function to update skill array and track changes
    const updateSkillArray = (entityName: string, skillArray: string[], entityType: 'PC' | 'NPC'): string[] => {
        if (!skillArray) return skillArray;
        
        let updated = false;
        const newArray = skillArray.map(skillName => {
            // Check if skill name exists as entity
            if (knownEntities[skillName]) {
                return skillName; // No change needed
            }
            
            // Look for skill entity with similar base name (handle state changes like "Fireball(sealed)" → "Fireball")
            const baseSkillName = skillName.replace(/\([^)]*\)/g, '').trim();
            const matchingSkill = Object.keys(knownEntities).find(name => {
                const entity = knownEntities[name];
                if (entity.type !== 'skill') return false;
                
                const entityBaseName = name.replace(/\([^)]*\)/g, '').trim();
                return entityBaseName === baseSkillName && name !== skillName;
            });
            
            if (matchingSkill) {
                console.log(`🔄 Skill sync: ${entityType} ${entityName} skill "${skillName}" → "${matchingSkill}"`);
                updated = true;
                changesFound = true;
                return matchingSkill;
            }
            
            return skillName; // Keep original if no match found
        });
        
        return updated ? newArray : skillArray;
    };

    // Update party members
    updatedParty = updatedParty.map(member => {
        const updatedMember = { ...member };
        
        if (member.type === 'pc' && member.learnedSkills) {
            const newSkills = updateSkillArray(member.name, member.learnedSkills, 'PC');
            if (newSkills !== member.learnedSkills) {
                updatedMember.learnedSkills = newSkills;
            }
        }
        
        if (member.type === 'npc' && member.skills) {
            const newSkills = updateSkillArray(member.name, member.skills, 'NPC');
            if (newSkills !== member.skills) {
                updatedMember.skills = newSkills;
            }
        }
        
        return updatedMember;
    });

    // Update NPCs in knownEntities
    Object.keys(updatedKnownEntities).forEach(entityName => {
        const entity = updatedKnownEntities[entityName];
        if (entity.type === 'npc' && entity.skills) {
            const newSkills = updateSkillArray(entity.name, entity.skills, 'NPC');
            if (newSkills !== entity.skills) {
                updatedKnownEntities[entityName] = {
                    ...entity,
                    skills: newSkills
                };
            }
        }
    });

    return { updatedKnownEntities, updatedParty, changesFound };
};

export const createCommandTagProcessor = (params: CommandTagProcessorParams) => {
    const {
        setGameTime, setChronicle, setMemories, setStatuses, setKnownEntities,
        setQuests, setParty, setLocationDiscoveryOrder,
        knownEntities, statuses, party, regexRules, turnCount, worldData
    } = params;

    const parseStoryAndTags = (storyText: string, applySideEffects = true): string => {
        if (!storyText) return '';

        const tagRegex = /\[([A-Z_]+):\s*([^\]]+)\]/g;
        let cleanStory = storyText;
        let chronicleTurnContent = ''; // Collect Chronicle turn content to append

        const parseAttributes = (attrString: string): { [key: string]: any } => {
            const attributes: { [key: string]: any } = {};
            const attrRegex = /(\w+)=("([^"]*)"|([^\s"\]]+))/g; // Handle quoted and unquoted values
            let match;
            while ((match = attrRegex.exec(attrString)) !== null) {
                const key = match[1];
                let value: string | boolean | number | { description: string, completed: boolean }[] = match[3] !== undefined ? match[3] : match[4];

                if ((key === 'isMainQuest' || key === 'equippable' || key === 'usable' || key === 'consumable' || key === 'learnable') && typeof value === 'string') {
                    value = value.toLowerCase() === 'true';
                } else if (key === 'objectives' && typeof value === 'string') {
                    value = value.split(';').map(desc => ({ description: desc.trim(), completed: false }));
                } else if ((key === 'quantities' || key === 'uses' || key === 'durability' || key === 'damage' || key === 'repairedAmount' || key === 'years' || key === 'months' || key === 'days' || key === 'hours' || key === 'minutes' || key === 'currentExp') && typeof value === 'string' && !isNaN(Number(value))) {
                    attributes[key] = Number(value);
                    continue;
                }
                attributes[key] = value;
            }
            return attributes;
        };

        let match;
        const unprocessedTags: string[] = [];
        while ((match = tagRegex.exec(storyText)) !== null) {
            cleanStory = cleanStory.replace(match[0], ''); // Remove tag from displayed story
            
            if (applySideEffects) {
                const tagType = match[1];
                const rawContent = match[2];
                
                const attributes = parseAttributes(rawContent);
                
                if (Object.keys(attributes).length === 0) {
                     unprocessedTags.push(match[0]);
                     continue;
                }
        
                switch (tagType) {
                    case 'TIME_ELAPSED':
                        const elapsed = {
                            years: Number(attributes.years) || 0,
                            months: Number(attributes.months) || 0,
                            days: Number(attributes.days) || 0,
                            hours: Number(attributes.hours) || 0,
                            minutes: Number(attributes.minutes) || 0
                        };
                        // Always update time, even if all values are 0 (for instant actions)
                        setGameTime(prevTime => calculateNewTime(prevTime, elapsed));
                        break;
                    case 'CHRONICLE_TURN':
                        if (attributes.text) {
                            setChronicle(prev => ({ ...prev, turn: [...prev.turn, attributes.text] }));
                            // Collect Chronicle turn content to append to story
                            chronicleTurnContent += (chronicleTurnContent ? '\n\n' : '') + attributes.text;
                            // Automatically create enhanced memory from Chronicle turn content
                            setMemories(prev => {
                                // Process memory text through regex rules
                                let processedText = regexEngine.processText(
                                    attributes.text,
                                    RegexPlacement.MEMORY_PROCESSING,
                                    regexRules || [],
                                    {
                                        depth: turnCount || 0,
                                        isEdit: false
                                    }
                                );
                                
                                const basicMemory: Memory = { 
                                    text: processedText, 
                                    pinned: false,
                                    source: 'chronicle',
                                    createdAt: turnCount,
                                    lastAccessed: turnCount
                                };
                                
                                // Enhance the memory with metadata and importance scoring
                                const gameState = {
                                    knownEntities,
                                    turnCount: turnCount || 0,
                                    statuses,
                                    party,
                                    quests: [], // Will be filled from actual state
                                    gameHistory: [], // Will be filled from actual state
                                    memories: prev,
                                    customRules: [],
                                    systemInstruction: '',
                                    totalTokens: 0,
                                    gameTime: {},
                                    chronicle: {},
                                    compressedHistory: [],
                                    worldData: {}
                                };
                                
                                const enhancementResult = MemoryEnhancer.enhanceMemory(basicMemory, gameState);
                                return [...prev, enhancementResult.enhanced];
                            });
                        }
                        break;
                    case 'CHRONICLE_CHAPTER':
                        if (attributes.text) {
                            setChronicle(prev => ({ ...prev, chapter: [...prev.chapter, attributes.text] }));
                        }
                        break;
                    case 'CHRONICLE_MEMOIR':
                         if (attributes.text) {
                            setChronicle(prev => ({ ...prev, memoir: [...prev.memoir, attributes.text] }));
                        }
                        break;
                    case 'STATUS_APPLIED_SELF':
                        setStatuses(prev => {
                            const newStatuses = applyStatusWithLimit(prev, attributes, 'pc');
                            // Log status change for PC
                            if (turnCount && !prev.some(s => s.name === attributes.name && s.owner === 'pc')) {
                                partyDebugger.log('STATUS_CHANGE', `✨ Status applied to PC: ${attributes.name}`, {
                                    memberName: 'pc',
                                    memberType: 'pc',
                                    status: {
                                        name: attributes.name,
                                        type: attributes.type,
                                        description: attributes.description,
                                        duration: attributes.duration,
                                        source: attributes.source
                                    },
                                    action: 'APPLIED'
                                }, turnCount);
                            }
                            return newStatuses;
                        });
                        break;
                    case 'STATUS_APPLIED_NPC':
                        setStatuses(prev => {
                            const newStatuses = applyStatusWithLimit(prev, attributes, attributes.npcName);
                            // Log status change for NPC
                            if (turnCount && !prev.some(s => s.name === attributes.name && s.owner === attributes.npcName)) {
                                partyDebugger.log('STATUS_CHANGE', `✨ Status applied to ${attributes.npcName}: ${attributes.name}`, {
                                    memberName: attributes.npcName,
                                    memberType: 'npc',
                                    status: {
                                        name: attributes.name,
                                        type: attributes.type,
                                        description: attributes.description,
                                        duration: attributes.duration,
                                        source: attributes.source
                                    },
                                    action: 'APPLIED'
                                }, turnCount);
                            }
                            return newStatuses;
                        });
                        break;
                    case 'STATUS_CURED_SELF':
                        setStatuses(prev => prev.filter(s => !(s.name === attributes.name && s.owner === 'pc')));
                        break;
                    case 'STATUS_CURED_NPC':
                        setStatuses(prev => prev.filter(s => !(s.name === attributes.name && s.owner === attributes.npcName)));
                        break;
                    case 'LORE_SKILL':
                        setKnownEntities(prev => {
                            const { name, description, ...rest } = attributes;
                            if (name && description) {
                                const newSkill: Entity = {
                                    type: 'skill',
                                    name: name,
                                    description: description,
                                    referenceId: ReferenceIdGenerator.generateReferenceId(name, 'skill'),
                                    ...rest
                                };
                                console.log(`🔗 Generated reference ID for skill ${name}: ${newSkill.referenceId}`);
                                return { ...prev, [name]: newSkill };
                            }
                            return prev;
                        });
                        break;
                    case 'SKILL_LEARNED':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const { name, description, learner, target, ...rest } = attributes;
                            if (name && description) {
                                const newSkill: Entity = {
                                    type: 'skill',
                                    name: name,
                                    description: description,
                                    referenceId: ReferenceIdGenerator.generateReferenceId(name, 'skill'),
                                    ...rest
                                };
                                console.log(`🔗 Generated reference ID for learned skill ${name}: ${newSkill.referenceId}`);
                                newEntities[name] = newSkill;
                                
                                // Check if this is an upgraded version of an existing skill
                                const baseSkillName = name.replace(/\([^)]*\)/g, '').trim();
                                const existingBaseSkill = Object.keys(newEntities).find(skillName => {
                                    const entity = newEntities[skillName];
                                    if (entity.type !== 'skill' || skillName === name) return false;
                                    const existingBaseName = skillName.replace(/\([^)]*\)/g, '').trim();
                                    
                                    return existingBaseName === baseSkillName;
                                });
                                
                                if (existingBaseSkill && existingBaseSkill !== name) {
                                    console.log(`🔄 Detected skill upgrade: ${existingBaseSkill} → ${name}`);
                                    
                                    // Update all skill arrays to replace old skill name with new one
                                    setParty(prevParty => {
                                        return prevParty.map(member => {
                                            const updatedMember = { ...member };
                                            
                                            // Update PC learnedSkills array
                                            if (member.type === 'pc' && member.learnedSkills) {
                                                const skillIndex = member.learnedSkills.indexOf(existingBaseSkill);
                                                if (skillIndex !== -1) {
                                                    updatedMember.learnedSkills = [...member.learnedSkills];
                                                    updatedMember.learnedSkills[skillIndex] = name;
                                                    console.log(`🔄 Upgraded PC skill: ${existingBaseSkill} → ${name}`);
                                                }
                                            }
                                            
                                            // Update companion/NPC skills array
                                            if ((member.type === 'npc' || member.type === 'companion') && member.skills) {
                                                const skillIndex = member.skills.indexOf(existingBaseSkill);
                                                if (skillIndex !== -1) {
                                                    updatedMember.skills = [...member.skills];
                                                    updatedMember.skills[skillIndex] = name;
                                                    console.log(`🔄 Upgraded ${member.type.toUpperCase()} ${member.name} skill: ${existingBaseSkill} → ${name}`);
                                                }
                                            }
                                            
                                            return updatedMember;
                                        });
                                    });
                                    
                                    // Also update NPCs in knownEntities
                                    Object.keys(newEntities).forEach(entityKey => {
                                        const entity = newEntities[entityKey];
                                        if ((entity.type === 'npc' || entity.type === 'companion') && entity.skills) {
                                            const skillIndex = entity.skills.indexOf(existingBaseSkill);
                                            if (skillIndex !== -1) {
                                                newEntities[entityKey] = {
                                                    ...entity,
                                                    skills: entity.skills.map(skill => 
                                                        skill === existingBaseSkill ? name : skill
                                                    )
                                                };
                                                
                                                console.log(`🔄 Upgraded ${entity.type.toUpperCase()} ${entity.name} skill in knownEntities: ${existingBaseSkill} → ${name}`);
                                            }
                                        }
                                    });
                                    
                                    // Remove the old skill entity
                                    delete newEntities[existingBaseSkill];
                                    console.log(`🗑️ Removed old skill entity: ${existingBaseSkill}`);
                                }
                        
                                // Determine who learned the skill - prefer 'learner' over 'target', default to PC
                                const skillLearner = learner || target;
                                
                                if (skillLearner) {
                                    let learnerFound = false;
                                    
                                    // First, check if the learner is in knownEntities (NPCs and companions)
                                    const entityInKnown = newEntities[skillLearner];
                                    if (entityInKnown && (entityInKnown.type === 'npc' || entityInKnown.type === 'companion')) {
                                        // Add to NPC/Companion's skills array in knownEntities
                                        const updatedEntity = { ...entityInKnown };
                                        if (!updatedEntity.skills) {
                                            updatedEntity.skills = [];
                                        }
                                        if (!updatedEntity.skills.includes(name)) {
                                            updatedEntity.skills.push(name);
                                            console.log(`🎓 ${entityInKnown.type.toUpperCase()} ${skillLearner} learned skill: ${name}`);
                                        }
                                        newEntities[skillLearner] = updatedEntity;
                                        learnerFound = true;
                                    }
                                    
                                    // Also check if the learner is in party array (for companions)
                                    setParty(prevParty => {
                                        const partyMember = prevParty.find(member => member.name === skillLearner);
                                        if (partyMember && (partyMember.type === 'companion' || partyMember.type === 'npc')) {
                                            learnerFound = true;
                                            return prevParty.map(member => {
                                                if (member.name === skillLearner) {
                                                    const updatedMember = { ...member };
                                                    if (!updatedMember.skills) {
                                                        updatedMember.skills = [];
                                                    }
                                                    if (!updatedMember.skills.includes(name)) {
                                                        updatedMember.skills.push(name);
                                                        console.log(`🎓 Party ${member.type.toUpperCase()} ${skillLearner} learned skill: ${name}`);
                                                    }
                                                    return updatedMember;
                                                }
                                                return member;
                                            });
                                        }
                                        return prevParty;
                                    });
                                    
                                    // If not found in either location, check if it's the PC
                                    if (!learnerFound) {
                                        const pc = Object.values(newEntities).find(e => e.type === 'pc');
                                        if (pc && (pc.name === skillLearner || skillLearner.toLowerCase() === 'pc')) {
                                            const updatedPc = { ...newEntities[pc.name] };
                                            if (!updatedPc.learnedSkills) {
                                                updatedPc.learnedSkills = [];
                                            }
                                            if (!updatedPc.learnedSkills.includes(name)) {
                                                updatedPc.learnedSkills.push(name);
                                                console.log(`🎓 PC ${pc.name} learned skill: ${name}`);
                                            }
                                            newEntities[pc.name] = updatedPc;
                                            learnerFound = true;
                                        }
                                    }
                                    
                                    // If still not found anywhere, log warning and default to PC
                                    if (!learnerFound) {
                                        console.warn(`⚠️ SKILL_LEARNED: Could not find learner "${skillLearner}" in knownEntities or party. Defaulting to PC.`);
                                        const pc = Object.values(newEntities).find(e => e.type === 'pc');
                                        if (pc) {
                                            const updatedPc = { ...newEntities[pc.name] };
                                            if (!updatedPc.learnedSkills) {
                                                updatedPc.learnedSkills = [];
                                            }
                                            if (!updatedPc.learnedSkills.includes(name)) {
                                                updatedPc.learnedSkills.push(name);
                                                console.log(`🎓 PC ${pc.name} learned skill: ${name} (fallback)`);
                                            }
                                            newEntities[pc.name] = updatedPc;
                                        }
                                    }
                                } else {
                                    // No target specified - try intelligent detection first
                                    console.warn(`⚠️ SKILL_LEARNED without learner parameter: ${name}. Attempting intelligent detection...`);
                                    
                                    // Smart detection: Look for recent context clues in skill name/description
                                    const skillContext = `${name} ${description}`.toLowerCase();
                                    let detectedLearner: string | null = null;
                                    
                                    // Check all NPCs to see if any names appear in the skill context
                                    const npcs = Object.values(newEntities).filter(e => e.type === 'npc' || e.type === 'companion');
                                    for (const npc of npcs) {
                                        const npcNameLower = npc.name.toLowerCase();
                                        // Check if NPC name appears in skill context
                                        if (skillContext.includes(npcNameLower)) {
                                            detectedLearner = npc.name;
                                            console.log(`🔍 Intelligent detection: Skill "${name}" likely belongs to NPC "${npc.name}" based on name in context`);
                                            break;
                                        }
                                    }
                                    
                                    // If no direct name match, check for NPCs with related skills (Haki example)
                                    if (!detectedLearner && name.toLowerCase().includes('haki')) {
                                        for (const npc of npcs) {
                                            if (npc.skills && Array.isArray(npc.skills)) {
                                                const hasRelatedHakiSkill = npc.skills.some(skill => 
                                                    skill.toLowerCase().includes('haki')
                                                );
                                                if (hasRelatedHakiSkill) {
                                                    detectedLearner = npc.name;
                                                    console.log(`🔍 Intelligent detection: Skill "${name}" likely belongs to NPC "${npc.name}" based on related Haki skills`);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    
                                    if (detectedLearner) {
                                        // Apply to detected NPC
                                        const npcEntity = newEntities[detectedLearner];
                                        if (npcEntity && (npcEntity.type === 'npc' || npcEntity.type === 'companion')) {
                                            const updatedNpc = { ...npcEntity };
                                            if (!updatedNpc.skills) {
                                                updatedNpc.skills = [];
                                            }
                                            if (!updatedNpc.skills.includes(name)) {
                                                updatedNpc.skills.push(name);
                                                console.log(`🎓 NPC ${detectedLearner} learned skill: ${name} (intelligent detection)`);
                                            }
                                            newEntities[detectedLearner] = updatedNpc;
                                        }
                                    } else {
                                        // Default to PC if no intelligent detection worked
                                        const pc = Object.values(newEntities).find(e => e.type === 'pc');
                                        if (pc) {
                                            const pcName = pc.name;
                                            const updatedPc = { ...newEntities[pcName] };
                                            if (!updatedPc.learnedSkills) {
                                                updatedPc.learnedSkills = [];
                                            }
                                            if (!updatedPc.learnedSkills.includes(name)) {
                                                updatedPc.learnedSkills.push(name);
                                                console.log(`🎓 PC ${pc.name} learned skill: ${name} (default target - no NPC detected)`);
                                            }
                                            newEntities[pcName] = updatedPc;
                                        }
                                    }
                                }
                            }
                            return newEntities;
                        });
                        break;
                    case 'SKILL_UPDATE':
                        setKnownEntities(prev => {
                            const { oldSkill, newSkill, target, description, ...rest } = attributes;
                            
                            // Validation
                            if (!oldSkill || !newSkill) {
                                console.error('❌ SKILL_UPDATE: oldSkill and newSkill are required');
                                return prev;
                            }
                            
                            if (oldSkill === newSkill) {
                                console.warn('⚠️ SKILL_UPDATE: oldSkill and newSkill are the same, skipping');
                                return prev;
                            }
                            
                            const newEntities = { ...prev };
                            
                            // Create or update the new skill entity
                            if (description) {
                                const newSkillEntity: Entity = {
                                    type: 'skill',
                                    name: newSkill,
                                    description: description,
                                    referenceId: ReferenceIdGenerator.generateReferenceId(newSkill, 'skill'),
                                    ...rest
                                };
                                console.log(`🔗 Generated reference ID for updated skill ${newSkill}: ${newSkillEntity.referenceId}`);
                                newEntities[newSkill] = newSkillEntity;
                            }
                            
                            // Determine update type for logging
                            const updateType = 
                                oldSkill.includes('Cơ Bản') && newSkill.includes('Sơ Cấp') ? '📈 Mastery' :
                                oldSkill.includes('Sơ Cấp') && newSkill.includes('Trung Cấp') ? '📈 Mastery' :
                                oldSkill.includes('Trung Cấp') && newSkill.includes('Cao Cấp') ? '📈 Mastery' :
                                oldSkill.includes('Cao Cấp') && newSkill.includes('Đại Thành') ? '📈 Mastery' :
                                oldSkill.includes('Đại Thành') && newSkill.includes('Viên Mãn') ? '📈 Mastery' :
                                '🔄 Evolved';
                            
                            let updatesApplied = 0;
                            
                            // If target is specified, update only that character
                            if (target) {
                                // Check if target is PC
                                const pc = Object.values(newEntities).find(e => e.type === 'pc' && (e.name === target || target.toLowerCase() === 'pc'));
                                if (pc && pc.learnedSkills) {
                                    const skillIndex = pc.learnedSkills.indexOf(oldSkill);
                                    if (skillIndex !== -1) {
                                        const updatedPc = { ...pc };
                                        updatedPc.learnedSkills = [...pc.learnedSkills];
                                        updatedPc.learnedSkills[skillIndex] = newSkill;
                                        newEntities[pc.name] = updatedPc;
                                        console.log(`${updateType} PC ${pc.name} skill: ${oldSkill} → ${newSkill}`);
                                        updatesApplied++;
                                    }
                                }
                                
                                // Check if target is NPC/Companion in knownEntities
                                if (newEntities[target] && (newEntities[target].type === 'npc' || newEntities[target].type === 'companion')) {
                                    const entity = newEntities[target];
                                    if (entity.skills) {
                                        const skillIndex = entity.skills.indexOf(oldSkill);
                                        if (skillIndex !== -1) {
                                            newEntities[target] = {
                                                ...entity,
                                                skills: entity.skills.map(skill => 
                                                    skill === oldSkill ? newSkill : skill
                                                )
                                            };
                                            console.log(`${updateType} ${entity.type.toUpperCase()} ${target} skill: ${oldSkill} → ${newSkill}`);
                                            updatesApplied++;
                                        }
                                    }
                                }
                                
                                // Also check party array for target
                                setParty(prevParty => {
                                    return prevParty.map(member => {
                                        if (member.name === target) {
                                            const updatedMember = { ...member };
                                            let memberUpdated = false;
                                            
                                            // Update PC learnedSkills
                                            if (member.type === 'pc' && member.learnedSkills) {
                                                const skillIndex = member.learnedSkills.indexOf(oldSkill);
                                                if (skillIndex !== -1) {
                                                    updatedMember.learnedSkills = [...member.learnedSkills];
                                                    updatedMember.learnedSkills[skillIndex] = newSkill;
                                                    memberUpdated = true;
                                                }
                                            }
                                            
                                            // Update NPC/Companion skills
                                            if ((member.type === 'npc' || member.type === 'companion') && member.skills) {
                                                const skillIndex = member.skills.indexOf(oldSkill);
                                                if (skillIndex !== -1) {
                                                    updatedMember.skills = [...member.skills];
                                                    updatedMember.skills[skillIndex] = newSkill;
                                                    memberUpdated = true;
                                                }
                                            }
                                            
                                            if (memberUpdated && !updatesApplied) {
                                                console.log(`${updateType} Party ${member.type.toUpperCase()} ${target} skill: ${oldSkill} → ${newSkill}`);
                                                updatesApplied++;
                                            }
                                            
                                            return updatedMember;
                                        }
                                        return member;
                                    });
                                });
                            } else {
                                // No target specified - update all characters who have this skill
                                console.log(`🔍 SKILL_UPDATE: No target specified, updating all characters with skill "${oldSkill}"`);
                                
                                // Update PC
                                const pc = Object.values(newEntities).find(e => e.type === 'pc');
                                if (pc && pc.learnedSkills) {
                                    const skillIndex = pc.learnedSkills.indexOf(oldSkill);
                                    if (skillIndex !== -1) {
                                        const updatedPc = { ...pc };
                                        updatedPc.learnedSkills = [...pc.learnedSkills];
                                        updatedPc.learnedSkills[skillIndex] = newSkill;
                                        newEntities[pc.name] = updatedPc;
                                        console.log(`${updateType} PC ${pc.name} skill: ${oldSkill} → ${newSkill}`);
                                        updatesApplied++;
                                    }
                                }
                                
                                // Update all NPCs/Companions in knownEntities
                                Object.keys(newEntities).forEach(entityKey => {
                                    const entity = newEntities[entityKey];
                                    if ((entity.type === 'npc' || entity.type === 'companion') && entity.skills) {
                                        const skillIndex = entity.skills.indexOf(oldSkill);
                                        if (skillIndex !== -1) {
                                            newEntities[entityKey] = {
                                                ...entity,
                                                skills: entity.skills.map(skill => 
                                                    skill === oldSkill ? newSkill : skill
                                                )
                                            };
                                            console.log(`${updateType} ${entity.type.toUpperCase()} ${entity.name} skill: ${oldSkill} → ${newSkill}`);
                                            updatesApplied++;
                                        }
                                    }
                                });
                                
                                // Update party array
                                setParty(prevParty => {
                                    return prevParty.map(member => {
                                        const updatedMember = { ...member };
                                        let memberUpdated = false;
                                        
                                        // Update PC learnedSkills
                                        if (member.type === 'pc' && member.learnedSkills) {
                                            const skillIndex = member.learnedSkills.indexOf(oldSkill);
                                            if (skillIndex !== -1) {
                                                updatedMember.learnedSkills = [...member.learnedSkills];
                                                updatedMember.learnedSkills[skillIndex] = newSkill;
                                                memberUpdated = true;
                                            }
                                        }
                                        
                                        // Update NPC/Companion skills
                                        if ((member.type === 'npc' || member.type === 'companion') && member.skills) {
                                            const skillIndex = member.skills.indexOf(oldSkill);
                                            if (skillIndex !== -1) {
                                                updatedMember.skills = [...member.skills];
                                                updatedMember.skills[skillIndex] = newSkill;
                                                memberUpdated = true;
                                            }
                                        }
                                        
                                        if (memberUpdated) {
                                            console.log(`${updateType} Party ${member.type.toUpperCase()} ${member.name} skill: ${oldSkill} → ${newSkill}`);
                                            updatesApplied++;
                                        }
                                        
                                        return updatedMember;
                                    });
                                });
                            }
                            
                            // Remove old skill entity if it exists and updates were applied
                            if (newEntities[oldSkill] && updatesApplied > 0) {
                                delete newEntities[oldSkill];
                                console.log(`🗑️ Removed old skill entity: ${oldSkill}`);
                            }
                            
                            // Summary log
                            if (updatesApplied > 0) {
                                console.log(`✅ SKILL_UPDATE completed: ${updatesApplied} character(s) updated with ${oldSkill} → ${newSkill}`);
                            } else {
                                console.warn(`⚠️ SKILL_UPDATE: No characters found with skill "${oldSkill}" to update`);
                            }
                            
                            return newEntities;
                        });
                        break;
                    case 'LORE_PC':
                        setKnownEntities(prev => {
                            const newAttributes = { ...attributes };
                            if (typeof newAttributes.learnedSkills === 'string') {
                                newAttributes.learnedSkills = newAttributes.learnedSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
                            }
                            
                            // Find existing PC entity to preserve existing data
                            const existingPC = Object.values(prev).find(e => e.type === 'pc') as Entity | undefined;
                            
                            if (existingPC) {
                                // Filter out undefined values from newAttributes to avoid overwriting existing data
                                const filteredAttributes: any = {};
                                Object.keys(newAttributes).forEach(key => {
                                    if (newAttributes[key] !== undefined && newAttributes[key] !== null && newAttributes[key] !== '') {
                                        // Special handling: Prefer user-defined motivation, but allow AI to enhance if significantly different
                                        if (key === 'motivation' && existingPC.motivation) {
                                            const userMotivation = existingPC.motivation.toLowerCase().trim();
                                            const aiMotivation = newAttributes[key].toLowerCase().trim();
                                            
                                            // If AI motivation is substantially different (not just punctuation), keep user's but log the AI version
                                            const userWords = userMotivation.replace(/[^\w\s]/g, '').split(/\s+/).sort();
                                            const aiWords = aiMotivation.replace(/[^\w\s]/g, '').split(/\s+/).sort();
                                            const similarity = userWords.filter(word => aiWords.includes(word)).length / Math.max(userWords.length, aiWords.length);
                                            
                                            if (similarity > 0.7) {
                                                // Very similar, keep user's version
                                                console.log(`🔄 MOTIVATION: Keeping user version (${Math.round(similarity * 100)}% similar to AI version)`);
                                                return; // Skip AI version
                                            } else {
                                                // Significantly different, might be AI enhancement
                                                console.log(`🔄 MOTIVATION: AI version differs significantly (${Math.round(similarity * 100)}% similar), using AI version: "${newAttributes[key]}"`);
                                                filteredAttributes[key] = newAttributes[key];
                                                return;
                                            }
                                        }
                                        // Special handling: Merge AI-generated skills with existing starting skills
                                        if (key === 'learnedSkills' && existingPC.learnedSkills && existingPC.learnedSkills.length > 0) {
                                            const existingSkills = existingPC.learnedSkills;
                                            const newSkills = Array.isArray(newAttributes[key]) ? newAttributes[key] : [];
                                            
                                            // Filter out placeholder values that indicate "no skills"
                                            const placeholderValues = ['chưa có', 'chua co', 'none', 'n/a', 'không có', 'khong co', '', 'null', 'undefined'];
                                            const validNewSkills = newSkills.filter((skill: string) => {
                                                const skillLower = skill.toString().toLowerCase().trim();
                                                return skillLower && !placeholderValues.includes(skillLower);
                                            });
                                            
                                            // Smart merging: detect similar skills and upgrades
                                            const mergedSkills = [...existingSkills];
                                            const addedSkills: string[] = [];
                                            const upgradedSkills: string[] = [];
                                            
                                            validNewSkills.forEach((newSkill: string) => {
                                                const newSkillLower = newSkill.toLowerCase();
                                                let isUpgradeOrSimilar = false;
                                                
                                                // Check if this is an upgrade or similar skill
                                                for (const existingSkill of existingSkills) {
                                                    const existingSkillLower = existingSkill.toLowerCase();
                                                    
                                                    // Extract base skill name (remove modifiers like "tối cao", "cơ bản", etc.)
                                                    // Normalize spaces first, then remove modifiers
                                                    const normalizeSpaces = (str: string) => str.replace(/\s+/g, ' ').trim();
                                                    
                                                    const newSkillBase = normalizeSpaces(newSkillLower)
                                                        .replace(/\s*\([^)]*\)\s*/g, '') // Remove all parentheses content first
                                                        .replace(/\s*(viên mãn|đại thành|tối cao|cao cấp|nâng cao|trung cấp|sơ cấp|cơ bản|cấp độ \d+)\s*/g, '') // Remove level modifiers
                                                        .replace(/\s*(:\s*[^,]*)/g, '') // Remove anything after colon
                                                        .trim();
                                                    const existingSkillBase = normalizeSpaces(existingSkillLower)
                                                        .replace(/\s*\([^)]*\)\s*/g, '') // Remove all parentheses content first
                                                        .replace(/\s*(viên mãn|đại thành|tối cao|cao cấp|nâng cao|trung cấp|sơ cấp|cơ bản|cấp độ \d+)\s*/g, '') // Remove level modifiers
                                                        .replace(/\s*(:\s*[^,]*)/g, '') // Remove anything after colon
                                                        .trim();
                                                    
                                                    // Check if base skills are the same
                                                    if (newSkillBase === existingSkillBase) {
                                                        isUpgradeOrSimilar = true;
                                                        
                                                        // Determine skill levels and upgrade logic
                                                        const getSkillLevel = (skill: string) => {
                                                            const skillLower = skill.toLowerCase();
                                                            
                                                            // Check for mastery levels in parentheses (new format)
                                                            if (skillLower.includes('(viên mãn)') || skillLower.includes('viên mãn')) return 5;
                                                            if (skillLower.includes('(đại thành)') || skillLower.includes('đại thành')) return 4;
                                                            if (skillLower.includes('(cao cấp)') || skillLower.includes('cao cấp') || skillLower.includes('nâng cao')) return 3;
                                                            if (skillLower.includes('(trung cấp)') || skillLower.includes('trung cấp')) return 2;
                                                            if (skillLower.includes('(sơ cấp)') || skillLower.includes('sơ cấp') || skillLower.includes('cơ bản')) return 1;
                                                            
                                                            // Legacy checks for compatibility
                                                            if (skillLower.includes('tối cao')) return 4;
                                                            
                                                            return 0; // No level specified - treat as basic
                                                        };
                                                        
                                                        const newSkillLevel = getSkillLevel(newSkillLower);
                                                        const existingSkillLevel = getSkillLevel(existingSkillLower);
                                                        
                                                        console.log(`🔍 Skill comparison: "${existingSkill}" (level ${existingSkillLevel}) vs "${newSkill}" (level ${newSkillLevel})`);
                                                        console.log(`🔍 Base skills: "${existingSkillBase}" vs "${newSkillBase}"`);
                                                        
                                                        if (newSkillLevel > existingSkillLevel) {
                                                            // Replace lower level with higher level
                                                            const index = mergedSkills.indexOf(existingSkill);
                                                            if (index !== -1) {
                                                                mergedSkills[index] = newSkill;
                                                                upgradedSkills.push(`${existingSkill} → ${newSkill}`);
                                                                console.log(`✅ Upgraded: ${existingSkill} → ${newSkill}`);
                                                            }
                                                        } else if (newSkillLevel < existingSkillLevel) {
                                                            // Keep existing higher level, ignore lower level new skill
                                                            console.log(`❌ Rejected lower level: ${newSkill} (existing: ${existingSkill})`);
                                                        } else if (newSkillLevel === existingSkillLevel) {
                                                            // Same level - check for exact duplicates (case-insensitive)
                                                            const skillExistsIgnoreCase = mergedSkills.some(skill => 
                                                                skill.toLowerCase().trim() === newSkill.toLowerCase().trim()
                                                            );
                                                            
                                                            if (!skillExistsIgnoreCase) {
                                                                // Different specializations or slight name variations
                                                                mergedSkills.push(newSkill);
                                                                addedSkills.push(newSkill);
                                                                console.log(`➕ Added same level specialization: ${newSkill}`);
                                                            } else {
                                                                console.log(`⏭️ Duplicate skill (case-insensitive): ${newSkill}`);
                                                            }
                                                        } else {
                                                            console.log(`⏭️ Skill already exists: ${newSkill}`);
                                                        }
                                                        break;
                                                    }
                                                }
                                                
                                                // If it's not similar to any existing skill, add it
                                                if (!isUpgradeOrSimilar) {
                                                    // Case-insensitive duplicate check
                                                    const skillExistsIgnoreCase = mergedSkills.some(existingSkill => 
                                                        existingSkill.toLowerCase().trim() === newSkill.toLowerCase().trim()
                                                    );
                                                    
                                                    if (!skillExistsIgnoreCase) {
                                                        mergedSkills.push(newSkill);
                                                        addedSkills.push(newSkill);
                                                        console.log(`➕ Added new skill: ${newSkill}`);
                                                    } else {
                                                        console.log(`⏭️ Skill already exists (case-insensitive): ${newSkill}`);
                                                    }
                                                }
                                            });
                                            
                                            filteredAttributes[key] = mergedSkills;
                                            
                                            // Enhanced logging
                                            let logMessage = `🔄 SKILL MERGE: Starting skills [${existingSkills.join(', ')}]`;
                                            if (addedSkills.length > 0) {
                                                logMessage += ` + Added [${addedSkills.join(', ')}]`;
                                            }
                                            if (upgradedSkills.length > 0) {
                                                logMessage += ` + Upgraded [${upgradedSkills.join(', ')}]`;
                                            }
                                            logMessage += ` = [${mergedSkills.join(', ')}]`;
                                            console.log(logMessage);
                                            
                                            return; // Use merged skills
                                        }
                                        filteredAttributes[key] = newAttributes[key];
                                    }
                                });
                                
                                // Merge new attributes with existing PC, preserving important fields
                                const updatedPC: Entity = {
                                    ...existingPC, // Keep existing data
                                    ...filteredAttributes, // Apply only defined new attributes
                                    type: 'pc', // Ensure type stays PC
                                    name: newAttributes.name || existingPC.name, // Use new name if provided
                                    referenceId: existingPC.referenceId || ReferenceIdGenerator.generateReferenceId(newAttributes.name || existingPC.name, 'pc')
                                };
                                console.log(`🔗 Updated existing PC ${updatedPC.name}, preserved motivation: ${updatedPC.motivation}`);
                                console.log(`🔗 Applied attributes:`, Object.keys(filteredAttributes));
                                console.log(`🔗 Existing motivation was:`, existingPC.motivation);
                                console.log(`🔗 Final motivation is:`, updatedPC.motivation);
                                
                                // Remove old PC entry if name changed
                                const newEntities = { ...prev };
                                if (existingPC.name !== updatedPC.name) {
                                    delete newEntities[existingPC.name];
                                }
                                newEntities[updatedPC.name] = updatedPC;
                                return newEntities;
                            } else {
                                // Create new PC if none exists
                                const newPC: Entity = { 
                                    type: 'pc', 
                                    referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'pc'),
                                    ...newAttributes 
                                };
                                console.log(`🔗 Created new PC ${newPC.name}: ${newPC.referenceId}`);
                                return { ...prev, [attributes.name]: newPC };
                            }
                        });
                        break;
                    case 'LORE_NPC':
                        setKnownEntities(prev => {
                            const newAttributes = { ...attributes };
                            if (typeof newAttributes.skills === 'string') {
                                newAttributes.skills = newAttributes.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
                            }
                            
                            // Enhanced Entity Deduplication System - Intelligent merging
                            const existingNPC = prev[attributes.name];
                            if (existingNPC) {
                                console.log(`⚠️ ENTITY DEDUPLICATION: NPC "${attributes.name}" already exists. Performing intelligent merge...`);
                                
                                // Preserve existing reference ID, relationships, and character development
                                const mergedNPC = intelligentEntityMerge(existingNPC, newAttributes);
                                console.log(`✅ Merged NPC "${attributes.name}" while preserving:`, {
                                    referenceId: existingNPC.referenceId,
                                    preservedFields: Object.keys(existingNPC).filter(key => 
                                        existingNPC[key] && (!newAttributes[key] || key === 'referenceId')
                                    )
                                });
                                
                                return { ...prev, [attributes.name]: mergedNPC };
                            } else {
                                // New entity - create normally
                                const newNPC: Entity = { 
                                    type: 'npc', 
                                    referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'npc'),
                                    ...newAttributes 
                                };
                                console.log(`🔗 Generated reference ID for new NPC ${attributes.name}: ${newNPC.referenceId}`);
                                return { ...prev, [attributes.name]: newNPC };
                            }
                        });
                        break;
                    case 'LORE_ITEM':
                        setKnownEntities(prev => {
                            const newItem: Entity = { 
                                type: 'item', 
                                referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'item'),
                                ...attributes 
                            };
                            console.log(`🔗 Generated reference ID for item ${attributes.name}: ${newItem.referenceId}`);
                            return { ...prev, [attributes.name]: newItem };
                        });
                        break;
                    case 'LORE_LOCATION':
                        setKnownEntities(prev => {
                            // Enhanced Entity Deduplication for locations too
                            const existingLocation = prev[attributes.name];
                            if (existingLocation) {
                                console.log(`⚠️ ENTITY DEDUPLICATION: Location "${attributes.name}" already exists. Performing intelligent merge...`);
                                
                                const mergedLocation = intelligentEntityMerge(existingLocation, { type: 'location', ...attributes });
                                console.log(`✅ Merged location "${attributes.name}" while preserving reference ID: ${existingLocation.referenceId}`);
                                
                                // Still update discovery order if needed
                                setLocationDiscoveryOrder(prevOrder => {
                                    if (!prevOrder.includes(attributes.name)) {
                                        return [...prevOrder, attributes.name];
                                    }
                                    return prevOrder;
                                });
                                
                                return { ...prev, [attributes.name]: mergedLocation };
                            } else {
                                // New location - create normally
                                const newLocation: Entity = { 
                                    type: 'location', 
                                    referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'location'),
                                    ...attributes 
                                };
                                console.log(`🔗 Generated reference ID for new location ${attributes.name}: ${newLocation.referenceId}`);
                                
                                setLocationDiscoveryOrder(prevOrder => {
                                    if (!prevOrder.includes(attributes.name)) {
                                        return [...prevOrder, attributes.name];
                                    }
                                    return prevOrder;
                                });
                                
                                return { ...prev, [attributes.name]: newLocation };
                            }
                        });
                        break;
                    case 'LORE_FACTION':
                        setKnownEntities(prev => {
                            const newFaction: Entity = { 
                                type: 'faction', 
                                referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'faction'),
                                ...attributes 
                            };
                            console.log(`🔗 Generated reference ID for faction ${attributes.name}: ${newFaction.referenceId}`);
                            return { ...prev, [attributes.name]: newFaction };
                        });
                        break;
                    case 'LORE_CONCEPT':
                        setKnownEntities(prev => {
                            const newConcept: Entity = { 
                                type: 'concept', 
                                referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'concept'),
                                ...attributes 
                            };
                            console.log(`🔗 Generated reference ID for concept ${attributes.name}: ${newConcept.referenceId}`);
                            return { ...prev, [attributes.name]: newConcept };
                        });
                        break;
                    case 'ENTITY_UPDATE':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const targetName = attributes.name;
                            if (newEntities[targetName]) {
                                const { name, newDescription, ...updateData } = attributes;
                                const finalUpdateData = { ...updateData };
                                if (newDescription) {
                                    finalUpdateData.description = newDescription;
                                }
                                
                                let updatedEntity;
                                if (attributes.newName && attributes.newName !== targetName) {
                                    const oldEntity = newEntities[targetName];
                                    delete newEntities[targetName];
                                    updatedEntity = {
                                        ...oldEntity,
                                        ...finalUpdateData,
                                        name: attributes.newName
                                    };
                                    
                                    // Check realm progression if experience was updated
                                    if (finalUpdateData.currentExp !== undefined) {
                                        updatedEntity = checkRealmProgression(updatedEntity, worldData);
                                    }
                                    
                                    newEntities[attributes.newName] = updatedEntity;
                                    
                                    // If this is a skill entity with name change, update PC/NPC skill arrays
                                    if (oldEntity.type === 'skill') {
                                        setParty(prevParty => {
                                            return prevParty.map(member => {
                                                const updatedMember = { ...member };
                                                
                                                // Update PC learnedSkills array
                                                if (member.type === 'pc' && member.learnedSkills) {
                                                    const skillIndex = member.learnedSkills.indexOf(targetName);
                                                    if (skillIndex !== -1) {
                                                        updatedMember.learnedSkills = [...member.learnedSkills];
                                                        updatedMember.learnedSkills[skillIndex] = attributes.newName;
                                                        console.log(`🔄 Updated PC skill name: ${targetName} → ${attributes.newName}`);
                                                    }
                                                }
                                                
                                                // Update NPC skills array
                                                if (member.type === 'npc' && member.skills) {
                                                    const skillIndex = member.skills.indexOf(targetName);
                                                    if (skillIndex !== -1) {
                                                        updatedMember.skills = [...member.skills];
                                                        updatedMember.skills[skillIndex] = attributes.newName;
                                                        console.log(`🔄 Updated NPC ${member.name} skill name: ${targetName} → ${attributes.newName}`);
                                                    }
                                                }
                                                
                                                return updatedMember;
                                            });
                                        });
                                        
                                        // Also update skill arrays in knownEntities for other NPCs
                                        Object.keys(newEntities).forEach(entityKey => {
                                            const entity = newEntities[entityKey];
                                            if (entity.type === 'npc' && entity.skills) {
                                                const skillIndex = entity.skills.indexOf(targetName);
                                                if (skillIndex !== -1) {
                                                    newEntities[entityKey] = {
                                                        ...entity,
                                                        skills: entity.skills.map(skill => 
                                                            skill === targetName ? attributes.newName : skill
                                                        )
                                                    };
                                                    console.log(`🔄 Updated NPC ${entity.name} skill name in knownEntities: ${targetName} → ${attributes.newName}`);
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    updatedEntity = { ...newEntities[targetName], ...finalUpdateData };
                                    
                                    // Check realm progression if experience was updated
                                    if (finalUpdateData.currentExp !== undefined) {
                                        updatedEntity = checkRealmProgression(updatedEntity, worldData);
                                    }
                                    
                                    newEntities[targetName] = updatedEntity;
                                }
                            }
                            return newEntities;
                        });
                        break;
                    case 'ITEM_AQUIRED':
                        setKnownEntities(prev => {
                            const existingItem = prev[attributes.name];
                            
                            if (existingItem && existingItem.type === 'item' && existingItem.owner === 'pc') {
                                // Item already exists - stack quantities
                                const newQuantity = (attributes.quantities || 1);
                                const existingQuantity = existingItem.quantities || existingItem.uses || 1;
                                const totalQuantity = existingQuantity + newQuantity;
                                
                                const updatedItem: Entity = {
                                    ...existingItem,
                                    ...attributes, // Apply new attributes (like description updates)
                                    name: attributes.name, // Ensure name is preserved
                                    quantities: existingItem.quantities ? totalQuantity : undefined,
                                    uses: existingItem.uses ? totalQuantity : undefined
                                };
                                
                                // If neither quantities nor uses existed, add quantities
                                if (!existingItem.quantities && !existingItem.uses) {
                                    updatedItem.quantities = totalQuantity;
                                }
                                
                                console.log(`📦 Stacked item: ${attributes.name} (${existingQuantity} + ${newQuantity} = ${totalQuantity})`);
                                return { ...prev, [attributes.name]: updatedItem };
                            } else {
                                // New item or different owner - create new entry
                                const newItem: Entity = { 
                                    type: 'item', 
                                    owner: 'pc',
                                    referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'item'),
                                    ...attributes 
                                };
                                console.log(`🔗 Generated reference ID for acquired item ${attributes.name}: ${newItem.referenceId}`);
                                return { ...prev, [attributes.name]: newItem };
                            }
                        });
                        break;
                     case 'ITEM_CONSUMED':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const itemToConsume = newEntities[attributes.name];
    
                            if (itemToConsume && itemToConsume.type === 'item' && itemToConsume.owner === 'pc') {
                                // Check quantities first (new system), then uses (legacy)
                                const currentQuantity = itemToConsume.quantities || itemToConsume.uses;
                                const quantityToConsume = attributes.quantity || attributes.quantities || 1; // Support quantity parameter
                                
                                // If item has no quantity/uses defined, treat it as single-use item (remove after consumption)
                                if (typeof currentQuantity !== 'number' || currentQuantity === undefined || currentQuantity === null) {
                                    delete newEntities[attributes.name];
                                    console.log(`🗑️ Single-use item consumed: ${attributes.name} - removed from inventory (no quantity/uses defined)`);
                                } else if (currentQuantity > quantityToConsume) {
                                    // Decrease quantity/uses by specified amount
                                    const newQuantity = currentQuantity - quantityToConsume;
                                    if (newQuantity > 0) {
                                        if (itemToConsume.quantities) {
                                            newEntities[attributes.name] = {
                                                ...itemToConsume,
                                                quantities: newQuantity,
                                            };
                                        } else if (itemToConsume.uses) {
                                            newEntities[attributes.name] = {
                                                ...itemToConsume,
                                                uses: newQuantity,
                                            };
                                        }
                                        console.log(`📦 Item consumed: ${attributes.name} - consumed ${quantityToConsume}, now has ${newQuantity} remaining`);
                                    } else {
                                        // Remove item if new quantity would be 0 or negative
                                        delete newEntities[attributes.name];
                                        console.log(`🗑️ Item completely consumed: ${attributes.name} - consumed ${quantityToConsume}, removed from inventory (reached 0)`);
                                    }
                                } else {
                                    // Remove item completely when current quantity equals or is less than consumption amount
                                    delete newEntities[attributes.name];
                                    console.log(`🗑️ Item completely consumed: ${attributes.name} - consumed ${quantityToConsume}, removed from inventory (quantity ${currentQuantity} <= consume ${quantityToConsume})`);
                                }
                            }
                            return newEntities;
                        });
                        break;
                    case 'ITEM_EQUIPPED':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const item = newEntities[attributes.name];
                            if (item && item.owner === 'pc' && item.equippable) {
                                item.equipped = true;
                            }
                            return newEntities;
                        });
                        break;
                    case 'ITEM_UNEQUIPPED':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const item = newEntities[attributes.name];
                            if (item && item.owner === 'pc') {
                                item.equipped = false;
                            }
                            return newEntities;
                        });
                        break;
                    case 'ITEM_TRANSFORMED':
                        setKnownEntities(prev => {
                            const { oldName, newName, description, ...rest } = attributes;
                            if (!oldName || !newName) return prev;
    
                            const newEntities = { ...prev };
                            const oldItem = newEntities[oldName];
                            
                            if (oldItem) delete newEntities[oldName];
                            
                            const newItem: Entity = {
                                ...rest,
                                name: newName,
                                type: 'item',
                                owner: oldItem?.owner || 'pc',
                                description: description || `Vật phẩm được biến đổi từ ${oldName}.`,
                            };
    
                            newEntities[newName] = newItem;
                            
                            return newEntities;
                        });
                        break;
                    case 'ITEM_UPDATED':
                         setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            if (newEntities[attributes.name] && newEntities[attributes.name].owner === 'pc') {
                                 newEntities[attributes.name] = { ...newEntities[attributes.name], ...attributes };
                            }
                            return newEntities;
                        });
                        break;
                     case 'ITEM_DAMAGED':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const item = newEntities[attributes.name];
                            if (item && typeof item.durability === 'number') {
                                item.durability = Math.max(0, item.durability - (attributes.damage || 0));
                            }
                            return newEntities;
                        });
                        break;
                    case 'ITEM_REPAIRED':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const item = newEntities[attributes.name];
                            if (item && typeof item.durability === 'number') {
                                item.durability = Math.min(100, item.durability + (attributes.repairedAmount || 0));
                            }
                            return newEntities;
                        });
                        break;
                    case 'ITEM_DISCARDED':
                    case 'ITEM_LOST':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const item = newEntities[attributes.name];
                            if (item && item.owner === 'pc') {
                                // Completely remove the item from the player's knowledge
                                delete newEntities[attributes.name];
                                console.log(`🗑️ Item discarded: ${attributes.name} has been removed from inventory`);
                            }
                            return newEntities;
                        });
                        break;
                    case 'REALM_UPDATE':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            const targetEntity = Object.values(newEntities).find(e => e.name === attributes.target);
                            if (targetEntity) {
                                newEntities[targetEntity.name].realm = attributes.realm;
                            }
                            return newEntities;
                        });
                        break;
                    case 'COMPANION':
                         const newCompanion = { 
                             type: 'companion', 
                             referenceId: ReferenceIdGenerator.generateReferenceId(attributes.name, 'companion'),
                             ...attributes 
                         } as Entity;
                         if (newCompanion.name && newCompanion.description) {
                            console.log(`🔗 Generated reference ID for companion ${newCompanion.name}: ${newCompanion.referenceId}`);
                            
                            // Enhanced companion processing with skill parsing
                            if (newCompanion.skills && typeof newCompanion.skills === 'string') {
                                (newCompanion as any).skills = (newCompanion.skills as string).split(',').map(s => s.trim());
                            }
                            
                            // Ensure default relationship if not provided
                            if (!newCompanion.relationship) {
                                newCompanion.relationship = 'Đồng hành';
                            }
                            
                            setParty(prev => {
                                const newParty = [...prev.filter(p => p.name !== newCompanion.name), newCompanion];
                                // Log companion join event
                                if (turnCount && !prev.some(p => p.name === newCompanion.name)) {
                                    partyDebugger.log('COMPANION_JOIN', `🎉 New companion joined: ${newCompanion.name}`, {
                                        companion: {
                                            name: newCompanion.name,
                                            type: newCompanion.type,
                                            relationship: newCompanion.relationship,
                                            skills: newCompanion.skills,
                                            realm: newCompanion.realm,
                                            personality: newCompanion.personality
                                        },
                                        partySize: newParty.length
                                    }, turnCount);
                                }
                                return newParty;
                            });
                            setKnownEntities(prev => ({ ...prev, [newCompanion.name]: newCompanion }));
                         }
                         break;
                    case 'RELATIONSHIP_CHANGED':
                        setKnownEntities(prev => {
                            const newEntities = { ...prev };
                            if (newEntities[attributes.npcName]) {
                                const oldRelationship = newEntities[attributes.npcName].relationship;
                                newEntities[attributes.npcName].relationship = attributes.relationship;
                                
                                // Log relationship change
                                if (turnCount && oldRelationship !== attributes.relationship) {
                                    partyDebugger.log('RELATIONSHIP_CHANGE', `💕 Relationship changed: ${attributes.npcName}`, {
                                        name: attributes.npcName,
                                        previousRelationship: oldRelationship || 'Unknown',
                                        newRelationship: attributes.relationship || 'Unknown',
                                        change: oldRelationship && attributes.relationship ? 
                                                (attributes.relationship.includes('yêu') || attributes.relationship.includes('thân') ? 'IMPROVED' : 'CHANGED') 
                                                : 'CHANGED'
                                    }, turnCount);
                                }
                            }
                            return newEntities;
                        });
                        break;
                    case 'QUEST_ASSIGNED':
                        const newQuest: Quest = {
                             title: attributes.title,
                             description: attributes.description,
                             objectives: attributes.objectives || [],
                             giver: attributes.giver,
                             reward: attributes.reward,
                             isMainQuest: attributes.isMainQuest || false,
                             status: 'active'
                        };
                        setQuests(prev => [...prev.filter(q => q.title !== newQuest.title), newQuest]);
                        break;
                    case 'QUEST_UPDATED':
                        setQuests(prev => {
                            const updatedQuests = prev.map(q => {
                                if (q.title === attributes.title) {
                                    const updatedQuest = { ...q, status: attributes.status };
                                    
                                    // If quest is completed and has a reward, process the reward
                                    if (attributes.status === 'completed' && q.reward) {
                                        // Parse experience from reward string (looking for patterns like "100 exp", "50 kinh nghiệm", etc.)
                                        const expMatch = q.reward.match(/(\d+)\s*(?:exp|kinh nghiệm|experience)/i);
                                        if (expMatch) {
                                            const expAmount = parseInt(expMatch[1]);
                                            console.log(`🎉 Quest completed: ${q.title} - Awarding ${expAmount} experience`);
                                            
                                            // Apply experience to PC
                                            setKnownEntities(prevEntities => {
                                                const newEntities = { ...prevEntities };
                                                const pc = Object.values(newEntities).find(e => e.type === 'pc');
                                                if (pc) {
                                                    const currentExp = pc.currentExp || 0;
                                                    const newExp = currentExp + expAmount;
                                                    const updatedPc = { ...pc, currentExp: newExp };
                                                    
                                                    // Check for realm progression
                                                    const finalPc = checkRealmProgression(updatedPc, worldData);
                                                    newEntities[pc.name] = finalPc;
                                                    
                                                    console.log(`✨ Experience awarded: ${pc.name} gained ${expAmount} exp (${currentExp} → ${newExp})`);
                                                }
                                                return newEntities;
                                            });
                                        }
                                    }
                                    
                                    return updatedQuest;
                                }
                                return q;
                            });
                            return updatedQuests;
                        });
                        break;
                    case 'QUEST_OBJECTIVE_COMPLETED':
                        setQuests(prev => prev.map(q => {
                            if (q.title === attributes.questTitle) {
                                const newObjectives = q.objectives.map(obj => 
                                    obj.description === attributes.objectiveDescription ? { ...obj, completed: true } : obj
                                );
                                const allCompleted = newObjectives.every(obj => obj.completed);
                                const updatedQuest = {
                                    ...q,
                                    objectives: newObjectives,
                                    status: allCompleted ? 'completed' : q.status
                                };
                                
                                // If quest is completed and has a reward, process the reward
                                if (allCompleted && q.reward) {
                                    // Parse experience from reward string (looking for patterns like "100 exp", "50 kinh nghiệm", etc.)
                                    const expMatch = q.reward.match(/(\d+)\s*(?:exp|kinh nghiệm|experience)/i);
                                    if (expMatch) {
                                        const expAmount = parseInt(expMatch[1]);
                                        console.log(`🎉 Quest completed: ${q.title} - Awarding ${expAmount} experience`);
                                        
                                        // Apply experience to PC
                                        setKnownEntities(prevEntities => {
                                            const newEntities = { ...prevEntities };
                                            const pc = Object.values(newEntities).find(e => e.type === 'pc');
                                            if (pc) {
                                                const currentExp = pc.currentExp || 0;
                                                const newExp = currentExp + expAmount;
                                                const updatedPc = { ...pc, currentExp: newExp };
                                                
                                                // Check for realm progression
                                                const finalPc = checkRealmProgression(updatedPc, worldData);
                                                newEntities[pc.name] = finalPc;
                                                
                                                console.log(`✨ Experience awarded: ${pc.name} gained ${expAmount} exp (${currentExp} → ${newExp})`);
                                            }
                                            return newEntities;
                                        });
                                    }
                                }
                                
                                return updatedQuest;
                            }
                            return q;
                        }));
                        break;
                     default:
                        if (tagType !== 'DEFINE_REALM_SYSTEM') {
                           unprocessedTags.push(match[0]);
                        }
                }
            }
        }
        let finalStory = cleanStory.trim();
        
        // Append Chronicle turn content if any
        if (chronicleTurnContent && applySideEffects) {
            finalStory += (finalStory ? '\n\n' : '') + chronicleTurnContent;
        }
        
        if (unprocessedTags.length > 0 && applySideEffects) {
             console.warn("Unprocessed Tags:", unprocessedTags);
        }
        return finalStory;
    };

    return {
        parseStoryAndTags,
        synchronizeSkillNames: () => synchronizeSkillNames(knownEntities, party)
    };
};

// Export the utility function separately for external use
export { synchronizeSkillNames };