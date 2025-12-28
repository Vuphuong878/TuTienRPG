/**
 * Utility for generating consistent reference IDs for entities
 */
export class ReferenceIdGenerator {
    
    /**
     * Generate a reference ID for an entity
     */
    public static generateReferenceId(name: string, type: string, category?: string): string {
        // Create deterministic but unique ID based on entity data
        const timestamp = Date.now();
        const baseString = `${type}_${category || this.getCategoryFromType(type)}_${name}_${timestamp}`;
        
        // Simple hash function to create shorter ID
        let hash = 0;
        for (let i = 0; i < baseString.length; i++) {
            const char = baseString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to positive hex and add prefix
        const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
        const typePrefix = this.getTypePrefix(type);
        const categoryPrefix = this.getCategoryPrefix(category || this.getCategoryFromType(type));
        
        return `REF_${typePrefix}_${categoryPrefix}_${hashHex}`;
    }
    
    /**
     * Get type prefix (2 characters)
     */
    private static getTypePrefix(type: string): string {
        const typePrefixes: { [key: string]: string } = {
            'pc': 'PC',
            'npc': 'NP',
            'companion': 'CO',
            'location': 'LO',
            'item': 'IT',
            'skill': 'SK',
            'faction': 'FA',
            'concept': 'CN',
            'status_effect': 'ST'
        };
        
        return typePrefixes[type] || type.substring(0, 2).toUpperCase();
    }
    
    /**
     * Get category prefix (3 characters)
     */
    private static getCategoryPrefix(category: string): string {
        const categoryPrefixes: { [key: string]: string } = {
            'characters': 'CHA',
            'locations': 'LOC',
            'items': 'ITE',
            'factions': 'FAC',
            'concepts': 'CON',
            'skills': 'SKI',
            'statusEffects': 'STA'
        };
        
        return categoryPrefixes[category] || category.substring(0, 3).toUpperCase();
    }
    
    /**
     * Map entity type to category
     */
    private static getCategoryFromType(type: string): string {
        const typeToCategory: { [key: string]: string } = {
            'pc': 'characters',
            'npc': 'characters', 
            'companion': 'characters',
            'location': 'locations',
            'item': 'items',
            'skill': 'skills',
            'faction': 'factions',
            'concept': 'concepts',
            'status_effect': 'statusEffects'
        };
        
        return typeToCategory[type] || 'concepts';
    }
    
    /**
     * Validate reference ID format
     */
    public static validateReferenceId(referenceId: string): boolean {
        const pattern = /^REF_[A-Z]{2}_[A-Z]{3}_[A-F0-9]{8}$/;
        return pattern.test(referenceId);
    }
    
    /**
     * Extract information from reference ID
     */
    public static parseReferenceId(referenceId: string): {
        valid: boolean;
        typePrefix?: string;
        categoryPrefix?: string;
        hash?: string;
    } {
        const pattern = /^REF_([A-Z]{2})_([A-Z]{3})_([A-F0-9]{8})$/;
        const match = referenceId.match(pattern);
        
        if (!match) {
            return { valid: false };
        }
        
        return {
            valid: true,
            typePrefix: match[1],
            categoryPrefix: match[2],
            hash: match[3]
        };
    }
}

// Export for easy access
export const referenceIdGenerator = ReferenceIdGenerator;