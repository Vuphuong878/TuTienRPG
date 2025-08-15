
import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import type { Entity, KnownEntities } from './types.ts';
import { getIconForEntity } from './utils.ts';
import { BrainIcon, CrossIcon, SearchIcon } from './Icons.tsx';
import { useDebounce } from './hooks/useDebounce.ts';
import { useVirtualizedList } from './hooks/useVirtualizedList.ts';

interface BookmarkedEntities {
    [entityName: string]: boolean;
}

interface CollapsedCategories {
    [category: string]: boolean;
}

interface EntityAccess {
    [entityName: string]: { count: number; lastAccessed: number };
}

interface KnowledgeBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    pc: Entity | undefined;
    knownEntities: KnownEntities;
    onEntityClick: (entityName: string) => void;
    turnCount: number;
}

const KnowledgeBaseModalComponent = ({ isOpen, onClose, pc, knownEntities, onEntityClick, turnCount }: KnowledgeBaseModalProps) => {
    if (!isOpen) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [bookmarkedEntities, setBookmarkedEntities] = useState<BookmarkedEntities>({});
    const [collapsedCategories, setCollapsedCategories] = useState<CollapsedCategories>({});
    const [entityAccess, setEntityAccess] = useState<EntityAccess>({});

    // Debounce search term for better performance
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Track entity access for recent/frequently used
    const trackEntityAccess = useCallback((entityName: string) => {
        setEntityAccess(prev => {
            const current = prev[entityName] || { count: 0, lastAccessed: 0 };
            return {
                ...prev,
                [entityName]: {
                    count: current.count + 1,
                    lastAccessed: Date.now()
                }
            };
        });
    }, []);

    // Toggle bookmark
    const toggleBookmark = useCallback((entityName: string) => {
        setBookmarkedEntities(prev => ({
            ...prev,
            [entityName]: !prev[entityName]
        }));
    }, []);

    // Toggle category collapse
    const toggleCategory = useCallback((category: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    }, []);

    const categorizedEntities = useMemo(() => {
        const categories: { [key: string]: Entity[] } = {};
        Object.values(knownEntities).forEach(entity => {
            if (entity.type === 'item') {
                if (entity.owner === 'pc') {
                    if (!categories['inventory']) categories['inventory'] = [];
                    categories['inventory'].push(entity);
                }
                if (!categories['item_encyclopedia']) categories['item_encyclopedia'] = [];
                categories['item_encyclopedia'].push(entity);
            } else {
                if (entity.type === 'npc' && entity.name === pc?.name) return;
                if (!categories[entity.type]) categories[entity.type] = [];
                categories[entity.type]?.push(entity);
            }
        });
        
        // Add bookmarked and recent categories
        const bookmarked = Object.values(knownEntities).filter(entity => 
            bookmarkedEntities[entity.name] && entity.name !== pc?.name
        );
        if (bookmarked.length > 0) {
            categories['bookmarked'] = bookmarked;
        }

        const recent = Object.values(knownEntities)
            .filter(entity => entityAccess[entity.name] && entity.name !== pc?.name)
            .sort((a, b) => (entityAccess[b.name]?.lastAccessed || 0) - (entityAccess[a.name]?.lastAccessed || 0))
            .slice(0, 10);
        if (recent.length > 0) {
            categories['recent'] = recent;
        }
        
        return categories;
    }, [knownEntities, pc?.name, bookmarkedEntities, entityAccess]);
    
    const categoryTitles: { [key: string]: string } = {
        bookmarked: "⭐ Đã Đánh Dấu",
        recent: "🕒 Gần Đây",
        skill: "Kỹ năng & Công pháp",
        inventory: "Hành Trang Nhân Vật",
        npc: "Nhân vật đã gặp",
        location: "Địa điểm đã biết",
        item_encyclopedia: "Bách Khoa Vật Phẩm",
        faction: "Thế lực & Tổ chức",
        companion: "Đồng hành",
        concept: "Khái Niệm & Quy Tắc"
    };

    const categoryOrder: string[] = ['bookmarked', 'recent', 'skill', 'inventory', 'npc', 'companion', 'location', 'faction', 'item_encyclopedia', 'concept'];

    const filterOptions = useMemo(() => {
        const options = [{ key: 'all', title: 'Tất cả' }];
        categoryOrder.forEach(key => {
            if (categorizedEntities[key] && categorizedEntities[key].length > 0) {
                options.push({ key, title: categoryTitles[key] });
            }
        });
        return options;
    }, [categorizedEntities]);

    const filteredAndCategorizedEntities = useMemo(() => {
        if (activeFilter === 'all' && !debouncedSearchTerm) {
            return categorizedEntities;
        }
        
        const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
        const result: { [key: string]: Entity[] } = {};

        Object.keys(categorizedEntities).forEach(category => {
            if (activeFilter !== 'all' && category !== activeFilter) return;

            const entities = categorizedEntities[category];
            const filtered = entities.filter(entity => 
                entity.name.toLowerCase().includes(lowerSearchTerm) ||
                entity.description.toLowerCase().includes(lowerSearchTerm)
            );

            if (filtered.length > 0) {
                result[category] = filtered.sort((a,b) => {
                    // Prioritize bookmarked items
                    if (bookmarkedEntities[a.name] && !bookmarkedEntities[b.name]) return -1;
                    if (!bookmarkedEntities[a.name] && bookmarkedEntities[b.name]) return 1;
                    // Then by access frequency
                    const aAccess = entityAccess[a.name]?.count || 0;
                    const bAccess = entityAccess[b.name]?.count || 0;
                    if (aAccess !== bAccess) return bAccess - aAccess;
                    // Finally alphabetically
                    return a.name.localeCompare(b.name);
                });
            }
        });

        return result;
    }, [debouncedSearchTerm, activeFilter, categorizedEntities, bookmarkedEntities, entityAccess]);

    const hasResults = useMemo(() => Object.keys(filteredAndCategorizedEntities).length > 0, [filteredAndCategorizedEntities]);


    const handleItemClick = (name: string) => {
        trackEntityAccess(name);
        // Don't close the modal - keep it open for exploration
        onEntityClick(name);
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                    case 'f':
                        e.preventDefault();
                        // Focus search input
                        const searchInput = document.querySelector('#knowledge-search') as HTMLInputElement;
                        searchInput?.focus();
                        break;
                }
            }
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Virtual list for categories with many items
    const ITEM_HEIGHT = 32;
    const MAX_CATEGORY_HEIGHT = 240;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                className="bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[85vh] text-slate-900 dark:text-white flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-600 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        <BrainIcon className="w-6 h-6" />
                        Tri Thức Thế Giới
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none"><CrossIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex-shrink-0 space-y-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            id="knowledge-search"
                            type="text"
                            placeholder="Tìm kiếm thực thể... (Ctrl+K)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-500 rounded-md py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {searchTerm !== debouncedSearchTerm && (
                            <div className="absolute right-3 top-2">
                                <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {filterOptions.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setActiveFilter(opt.key)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 border ${
                                    activeFilter === opt.key 
                                        ? 'bg-purple-600 border-purple-600 text-white' 
                                        : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {opt.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 flex-grow overflow-y-auto">
                    {pc && (
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 p-4 rounded-lg mb-6">
                            <h4 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                                <span className="w-5 h-5">{getIconForEntity(pc)}</span>
                                {pc.name} - Lượt: {turnCount}
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic mt-1">"{pc.description}"</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2"><b>Tính cách:</b> {pc.personality}</p>
                            {pc.realm && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1"><b>Cảnh giới:</b> {pc.realm}</p>}
                        </div>
                    )}
                    
                    {hasResults ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryOrder.map(category => {
                                const entities = filteredAndCategorizedEntities[category];
                                if (!entities || entities.length === 0) return null;

                                const isCollapsed = collapsedCategories[category];
                                const shouldVirtualize = entities.length > 15;

                                return (
                                    <div key={category}>
                                        <button 
                                            onClick={() => toggleCategory(category)}
                                            className="w-full text-left font-semibold text-purple-700 dark:text-purple-300 mb-2 border-b border-purple-400/20 pb-1 flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-200 transition-colors"
                                        >
                                            <span className={`transform transition-transform duration-200 ${
                                                isCollapsed ? '-rotate-90' : 'rotate-0'
                                            }`}>▼</span>
                                            {categoryTitles[category]} 
                                            <span className="text-xs text-gray-500">({entities.length})</span>
                                        </button>
                                        
                                        {!isCollapsed && (
                                            shouldVirtualize ? (
                                                <VirtualizedEntityList 
                                                    entities={entities}
                                                    category={category}
                                                    knownEntities={knownEntities}
                                                    bookmarkedEntities={bookmarkedEntities}
                                                    entityAccess={entityAccess}
                                                    onEntityClick={handleItemClick}
                                                    onToggleBookmark={toggleBookmark}
                                                    containerHeight={MAX_CATEGORY_HEIGHT}
                                                    itemHeight={ITEM_HEIGHT}
                                                />
                                            ) : (
                                                <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                                                    {entities.map(entity => (
                                                        <EntityListItem 
                                                            key={entity.name}
                                                            entity={entity}
                                                            category={category}
                                                            knownEntities={knownEntities}
                                                            isBookmarked={bookmarkedEntities[entity.name]}
                                                            accessCount={entityAccess[entity.name]?.count}
                                                            onEntityClick={handleItemClick}
                                                            onToggleBookmark={toggleBookmark}
                                                        />
                                                    ))}
                                                </ul>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            <p>Không tìm thấy kết quả nào.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Export memoized version
export const KnowledgeBaseModal = memo(KnowledgeBaseModalComponent);
KnowledgeBaseModal.displayName = 'KnowledgeBaseModal';

// Component for individual entity list items
interface EntityListItemProps {
    entity: Entity;
    category: string;
    knownEntities: KnownEntities;
    isBookmarked: boolean;
    accessCount?: number;
    onEntityClick: (name: string) => void;
    onToggleBookmark: (name: string) => void;
}

const EntityListItemComponent = ({ entity, category, knownEntities, isBookmarked, accessCount, onEntityClick, onToggleBookmark }: EntityListItemProps) => {
    return (
        <li className="group">
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onEntityClick(entity.name)} 
                    className="text-left flex-1 text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-100 hover:underline text-sm flex items-center gap-2"
                >
                    <span className="w-4 h-4 flex-shrink-0">{getIconForEntity(entity)}</span>
                    <span>
                        {entity.name}
                        {category === 'inventory' && entity.equipped && <span className="text-xs text-green-400 dark:text-green-500 ml-2 font-normal italic">(Đang trang bị)</span>}
                        {(entity.type === 'skill' || entity.type === 'npc') && entity.realm ? ` (${entity.realm})` : ''}
                        {accessCount && accessCount > 1 && (
                            <span className="text-xs text-gray-400 ml-2">({accessCount})</span>
                        )}
                    </span>
                </button>
                <button
                    onClick={() => onToggleBookmark(entity.name)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity text-sm ${
                        isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                >
                    ⭐
                </button>
            </div>
            {entity.type === 'npc' && Array.isArray(entity.skills) && entity.skills.length > 0 && (
                <div className="pl-6 text-xs text-slate-600 dark:text-slate-400 space-y-0.5 mt-1">
                    {entity.skills.map((skillName: string) => {
                        const skillEntity = knownEntities[skillName];
                        const icon = getIconForEntity(skillEntity || { name: skillName, type: 'skill', description: '' });
                        return (
                            <div key={skillName} className="flex items-center gap-1.5">
                                <span className="w-3 h-3">{icon}</span>
                                <span>{skillName} {skillEntity?.realm ? `(${skillEntity.realm})` : ''}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </li>
    );
};

// Export memoized version
const EntityListItem = memo(EntityListItemComponent);
EntityListItem.displayName = 'EntityListItem';

// Virtualized list component for large entity lists
interface VirtualizedEntityListProps {
    entities: Entity[];
    category: string;
    knownEntities: KnownEntities;
    bookmarkedEntities: BookmarkedEntities;
    entityAccess: EntityAccess;
    onEntityClick: (name: string) => void;
    onToggleBookmark: (name: string) => void;
    containerHeight: number;
    itemHeight: number;
}

const VirtualizedEntityListComponent = ({ entities, category, knownEntities, bookmarkedEntities, entityAccess, onEntityClick, onToggleBookmark, containerHeight, itemHeight }: VirtualizedEntityListProps) => {
    const {
        containerRef,
        visibleItems,
        totalHeight,
        offsetY,
        handleScroll,
        shouldVirtualize
    } = useVirtualizedList(entities, {
        itemHeight,
        containerHeight,
        overscan: 5,
        threshold: 15
    });

    return (
        <div 
            ref={containerRef}
            className="max-h-60 overflow-y-auto pr-2"
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {(shouldVirtualize ? visibleItems : entities.map((entity, index) => ({ item: entity, index }))).map(({ item: entity, index }) => (
                        <div key={entity.name} style={{ height: itemHeight }}>
                            <EntityListItem
                                entity={entity}
                                category={category}
                                knownEntities={knownEntities}
                                isBookmarked={bookmarkedEntities[entity.name]}
                                accessCount={entityAccess[entity.name]?.count}
                                onEntityClick={onEntityClick}
                                onToggleBookmark={onToggleBookmark}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Export memoized version
const VirtualizedEntityList = memo(VirtualizedEntityListComponent);
VirtualizedEntityList.displayName = 'VirtualizedEntityList';
