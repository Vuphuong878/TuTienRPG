import React, { useState, useMemo } from 'react';
import type { KnownEntities, Entity, EntityType } from './types';
import { Button } from './FormControls';
import { BrainCircuit, Search, X, Package, PackageCheck } from 'lucide-react';
import { getIconForEntity } from './GameIcons';

interface KnowledgeBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    knownEntities: KnownEntities;
    onToggleEntityPin: (entityName: string) => void;
    onExportSelected: (selectedEntityNames: Set<string>) => void;
}

type FilterType = EntityType | 'all';

const ENTITY_TYPE_ORDER: EntityType[] = ['pc', 'companion', 'npc', 'location', 'faction', 'item', 'skill', 'concept'];
const ENTITY_TYPE_LABELS: { [key in EntityType]: string } = {
    pc: 'Nhân vật Chính',
    companion: 'Đồng hành',
    npc: 'Nhân vật Phụ',
    location: 'Địa danh',
    faction: 'Thế lực',
    item: 'Vật phẩm',
    skill: 'Kỹ năng',
    concept: 'Khái niệm',
    status_effect: 'Hiệu ứng Trạng thái',
};


export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
    isOpen,
    onClose,
    knownEntities,
    onToggleEntityPin,
    onExportSelected,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set());

    const filteredAndGroupedEntities = useMemo(() => {
        const entities = Object.values(knownEntities);
        
        const filtered = entities.filter(entity => {
            const matchesFilter = activeFilter === 'all' || entity.type === activeFilter;
            const matchesSearch = searchTerm === '' || 
                entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entity.description?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        const grouped: { [key in EntityType]?: Entity[] } = {};
        for (const entity of filtered) {
            if (!grouped[entity.type]) {
                grouped[entity.type] = [];
            }
            grouped[entity.type]?.push(entity);
        }
        
        // Sort entities within each group alphabetically by name
        for (const entityType in grouped) {
            grouped[entityType as EntityType]?.sort((a, b) => a.name.localeCompare(b.name));
        }

        return grouped;
    }, [knownEntities, searchTerm, activeFilter]);

    const handleToggleExport = (entityName: string) => {
        setSelectedForExport(prev => {
            const newSet = new Set(prev);
            if (newSet.has(entityName)) {
                newSet.delete(entityName);
            } else {
                newSet.add(entityName);
            }
            return newSet;
        });
    };

    const handleExportClick = () => {
        onExportSelected(selectedForExport);
        setSelectedForExport(new Set());
        onClose(); // Close modal after export
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                        <BrainCircuit className="text-blue-500" size={28} />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            Trình Quản Lý Tri Thức
                        </h2>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="icon">
                        <X size={24} />
                    </Button>
                </header>

                {/* Search and Filter */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thực thể theo tên hoặc mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <Button 
                            onClick={() => setActiveFilter('all')}
                            variant={activeFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                        >
                            Tất cả
                        </Button>
                        {ENTITY_TYPE_ORDER.map(type => (
                            <Button
                                key={type}
                                onClick={() => setActiveFilter(type)}
                                variant={activeFilter === type ? 'default' : 'outline'}
                                size="sm"
                            >
                                {ENTITY_TYPE_LABELS[type] || type}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <main className="flex-grow overflow-y-auto p-4 space-y-4">
                    {Object.keys(filteredAndGroupedEntities).length > 0 ? (
                        ENTITY_TYPE_ORDER.map(type => {
                           const entitiesOfType = filteredAndGroupedEntities[type as EntityType];
                           if (!entitiesOfType || entitiesOfType.length === 0) return null;

                           return (
                               <div key={type}>
                                   <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-300 dark:border-slate-600 pb-1">
                                       {ENTITY_TYPE_LABELS[type]} ({entitiesOfType.length})
                                   </h3>
                                   <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                       {entitiesOfType.map(entity => (
                                           <li key={entity.name} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
                                               <div className="flex items-center space-x-3 overflow-hidden">
                                                    <span title={entity.type}>{getIconForEntity(entity, 20)}</span>
                                                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={entity.name}>
                                                        {entity.name}
                                                    </span>
                                               </div>
                                               <div className="flex items-center space-x-2 flex-shrink-0">
                                                    {/* Pinned Toggle Switch */}
                                                    <label className="flex items-center cursor-pointer" title="Ghim vào ngữ cảnh AI">
                                                        <div className="relative">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only"
                                                                checked={entity.pinned ?? false}
                                                                onChange={() => onToggleEntityPin(entity.name)}
                                                            />
                                                            <div className={`block w-10 h-6 rounded-full transition-colors ${entity.pinned ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${entity.pinned ? 'translate-x-4' : ''}`}></div>
                                                        </div>
                                                    </label>
                                                    {/* Export Checkbox */}
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 rounded text-blue-600 bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-500 focus:ring-blue-500"
                                                        checked={selectedForExport.has(entity.name)}
                                                        onChange={() => handleToggleExport(entity.name)}
                                                        title="Chọn để xuất"
                                                    />
                                               </div>
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           )
                        })
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy thực thể nào khớp.</p>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <Button 
                        onClick={handleExportClick}
                        disabled={selectedForExport.size === 0}
                    >
                        {selectedForExport.size > 0 ? (
                             <>
                                <PackageCheck size={20} className="mr-2"/>
                                Xuất {selectedForExport.size} mục đã chọn
                            </>
                        ) : (
                            <>
                                <Package size={20} className="mr-2"/>
                                Xuất các mục đã chọn
                            </>
                        )}
                    </Button>
                </footer>
            </div>
        </div>
    );
};