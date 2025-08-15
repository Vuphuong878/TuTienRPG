import type { Entity, Memory } from '../types';
import { ReferenceBasedRAG, type EntityReference } from './ReferenceBasedRAG';

/**
 * External API for reference-based entity and memory lookups
 * This allows AI to query for detailed information using reference IDs
 */
export class ReferenceAPI {
    
    /**
     * Get entity details by reference ID
     */
    public static getEntity(referenceId: string): {
        success: boolean;
        entity?: Entity;
        error?: string;
    } {
        try {
            const entity = ReferenceBasedRAG.getEntityByReference(referenceId);
            
            if (!entity) {
                return {
                    success: false,
                    error: `Entity with reference ID ${referenceId} not found`
                };
            }

            return {
                success: true,
                entity
            };
        } catch (error) {
            return {
                success: false,
                error: `Error retrieving entity: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get multiple entities by reference IDs
     */
    public static getEntities(referenceIds: string[]): {
        success: boolean;
        entities: { [referenceId: string]: Entity };
        notFound: string[];
        error?: string;
    } {
        try {
            const entities: { [referenceId: string]: Entity } = {};
            const notFound: string[] = [];

            for (const refId of referenceIds) {
                const entity = ReferenceBasedRAG.getEntityByReference(refId);
                if (entity) {
                    entities[refId] = entity;
                } else {
                    notFound.push(refId);
                }
            }

            return {
                success: true,
                entities,
                notFound
            };
        } catch (error) {
            return {
                success: false,
                entities: {},
                notFound: referenceIds,
                error: `Error retrieving entities: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Search for entities by keyword
     */
    public static searchEntities(keyword: string, limit: number = 5): {
        success: boolean;
        results: EntityReference[];
        error?: string;
    } {
        try {
            const results = ReferenceBasedRAG.findEntitiesByKeyword(keyword, limit);
            return {
                success: true,
                results
            };
        } catch (error) {
            return {
                success: false,
                results: [],
                error: `Error searching entities: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get entity relationships and connections
     */
    public static getEntityRelationships(referenceId: string): {
        success: boolean;
        relationships: Array<{
            type: 'party_member' | 'location' | 'owner' | 'related';
            referenceId: string;
            name: string;
            description: string;
        }>;
        error?: string;
    } {
        try {
            const entity = ReferenceBasedRAG.getEntityByReference(referenceId);
            
            if (!entity) {
                return {
                    success: false,
                    relationships: [],
                    error: `Entity with reference ID ${referenceId} not found`
                };
            }

            const relationships: Array<{
                type: 'party_member' | 'location' | 'owner' | 'related';
                referenceId: string;
                name: string;
                description: string;
            }> = [];

            // Find party relationships
            if (entity.type === 'companion') {
                relationships.push({
                    type: 'party_member',
                    referenceId: referenceId,
                    name: entity.name,
                    description: `${entity.name} is a party member with relationship: ${entity.relationship || 'Unknown'}`
                });
            }

            // Find location relationships
            if (entity.location) {
                // Find entities in the same location
                const registry = ReferenceBasedRAG.getRegistrySnapshot();
                // This would need to be implemented to search by location
                // For now, just add the location info
                relationships.push({
                    type: 'location',
                    referenceId: `LOC_${entity.location.replace(/\s+/g, '_')}`,
                    name: entity.location,
                    description: `${entity.name} is currently located at ${entity.location}`
                });
            }

            // Find ownership relationships
            if (entity.owner) {
                relationships.push({
                    type: 'owner',
                    referenceId: `OWNER_${entity.owner}`,
                    name: entity.owner,
                    description: `${entity.name} is owned by ${entity.owner}`
                });
            }

            return {
                success: true,
                relationships
            };
        } catch (error) {
            return {
                success: false,
                relationships: [],
                error: `Error retrieving relationships: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get memory by reference ID
     */
    public static getMemory(referenceId: string): {
        success: boolean;
        memory?: Memory;
        error?: string;
    } {
        try {
            const memory = ReferenceBasedRAG.getMemoryByReference(referenceId);
            
            if (!memory) {
                return {
                    success: false,
                    error: `Memory with reference ID ${referenceId} not found`
                };
            }

            return {
                success: true,
                memory
            };
        } catch (error) {
            return {
                success: false,
                error: `Error retrieving memory: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get registry statistics
     */
    public static getRegistryStats(): {
        success: boolean;
        stats: {
            entitiesCount: number;
            memoriesCount: number;
            relationshipsCount: number;
            lastUpdate: number;
            isReady: boolean;
        };
    } {
        const stats = ReferenceBasedRAG.getRegistrySnapshot();
        return {
            success: true,
            stats: {
                ...stats,
                isReady: stats.entitiesCount > 0
            }
        };
    }

    /**
     * Validate reference ID format
     */
    public static validateReferenceId(referenceId: string): {
        valid: boolean;
        type?: string;
        category?: string;
        error?: string;
    } {
        const pattern = /^REF_([A-Z]{2})_([A-Z]{3})_[A-F0-9]{8}$/;
        const match = referenceId.match(pattern);

        if (!match) {
            return {
                valid: false,
                error: `Invalid reference ID format. Expected: REF_XX_XXX_XXXXXXXX`
            };
        }

        const typeCode = match[1];
        const categoryCode = match[2];

        // Map type codes back to types
        const typeMap: { [key: string]: string } = {
            'PC': 'pc',
            'NP': 'npc',
            'CO': 'companion',
            'IT': 'item',
            'LO': 'location',
            'SK': 'skill',
            'FA': 'faction',
            'CN': 'concept'
        };

        const categoryMap: { [key: string]: string } = {
            'CHA': 'characters',
            'LOC': 'locations',
            'ITE': 'items',
            'FAC': 'factions',
            'CON': 'concepts',
            'SKI': 'skills',
            'STA': 'statusEffects'
        };

        return {
            valid: true,
            type: typeMap[typeCode] || 'unknown',
            category: categoryMap[categoryCode] || 'unknown'
        };
    }

    /**
     * Format entity details for AI consumption
     */
    public static formatEntityDetails(entity: Entity): string {
        const details: string[] = [];

        details.push(`Name: ${entity.name}`);
        details.push(`Type: ${entity.type}`);
        details.push(`Reference ID: ${entity.referenceId || 'N/A'}`);

        if (entity.description) details.push(`Description: ${entity.description}`);
        if (entity.location) details.push(`Location: ${entity.location}`);
        if (entity.relationship) details.push(`Relationship: ${entity.relationship}`);
        if (entity.realm) details.push(`Realm/Power Level: ${entity.realm}`);
        if (entity.currentExp !== undefined) details.push(`Experience: ${entity.currentExp}`);
        
        if (entity.skills?.length) {
            const skillsArray = Array.isArray(entity.skills) ? entity.skills : entity.skills.split(',').map(s => s.trim());
            details.push(`Skills: ${skillsArray.join(', ')}`);
        }

        if (entity.personality) details.push(`Personality: ${entity.personality}`);
        if (entity.motivation) details.push(`Motivation: ${entity.motivation}`);

        if (entity.type === 'item') {
            if (entity.durability !== undefined) details.push(`Durability: ${entity.durability}/100`);
            if (entity.uses !== undefined) details.push(`Uses Remaining: ${entity.uses}`);
            if (entity.owner) details.push(`Owner: ${entity.owner}`);
            if (entity.equipped) details.push(`Status: Equipped`);
        }

        return details.join('\n');
    }
}

// Export for external use
export const referenceAPI = ReferenceAPI;