import React, { useState, useRef, useMemo } from 'react';
import type { CustomRule } from './types.ts';
import { RuleLogic } from './types.ts';
import { RuleHelpers } from './utils/RuleHelpers.ts';
import { DocumentAddIcon, PlusIcon, SaveIcon, FileIcon, CogIcon, EyeIcon, EyeSlashIcon } from './Icons.tsx';

interface EnhancedCustomRulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rules: CustomRule[]) => void;
    currentRules: CustomRule[];
}

type ViewMode = 'simple' | 'advanced';
type SortMode = 'priority' | 'alphabetical' | 'category' | 'recent';

export const EnhancedCustomRulesModal: React.FC<EnhancedCustomRulesModalProps> = ({ 
    isOpen, onClose, onSave, currentRules 
}) => {
    if (!isOpen) return null;

    const [rules, setRules] = useState<CustomRule[]>(
        currentRules.map(rule => {
            // Migrate legacy rules to new format
            if (!rule.keywords && !rule.title && !rule.order) {
                return RuleHelpers.migrateLegacyRule(rule);
            }
            return rule;
        })
    );
    
    const [viewMode, setViewMode] = useState<ViewMode>('simple');
    const [sortMode, setSortMode] = useState<SortMode>('priority');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRule, setExpandedRule] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const characterCardFileInputRef = useRef<HTMLInputElement>(null);
    const worldInfoInputRef = useRef<HTMLInputElement>(null);

    // Filter and sort rules
    const filteredAndSortedRules = useMemo(() => {
        let filtered = rules;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(rule => 
                rule.title?.toLowerCase().includes(query) ||
                rule.content.toLowerCase().includes(query) ||
                rule.keywords?.some(k => k.toLowerCase().includes(query)) ||
                rule.category?.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(rule => rule.category === filterCategory);
        }

        // Apply sorting
        switch (sortMode) {
            case 'priority':
                return RuleHelpers.sortByPriority(filtered);
            case 'alphabetical':
                return filtered.sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
            case 'category':
                return filtered.sort((a, b) => (a.category || 'general').localeCompare(b.category || 'general'));
            case 'recent':
                return filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            default:
                return filtered;
        }
    }, [rules, searchQuery, filterCategory, sortMode]);

    const handleSave = () => {
        // Validate all rules before saving
        const validationErrors: string[] = [];
        rules.forEach((rule, index) => {
            const validation = RuleHelpers.validateRule(rule);
            if (!validation.isValid) {
                validationErrors.push(`Luật ${index + 1}: ${validation.errors.join(', ')}`);
            }
        });

        if (validationErrors.length > 0) {
            alert('Có lỗi trong cấu hình luật:\n' + validationErrors.join('\n'));
            return;
        }

        onSave(rules);
        onClose();
    };

    const handleAddRule = () => {
        const newRule = RuleHelpers.createDefaultRule();
        setRules(prev => [...prev, newRule]);
        setExpandedRule(newRule.id);
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
        if (expandedRule === id) {
            setExpandedRule(null);
        }
    };

    const handleDuplicateRule = (rule: CustomRule) => {
        const duplicated = { 
            ...rule, 
            id: Date.now().toString(),
            title: `${rule.title || 'Luật'} (Sao chép)`,
            createdAt: Date.now(),
            activationCount: 0,
            lastActivated: undefined
        };
        setRules(prev => [...prev, duplicated]);
    };

    const handleRuleChange = (id: string, updates: Partial<CustomRule>) => {
        setRules(prev => prev.map(r => {
            if (r.id === id) {
                const updated = { ...r, ...updates };
                
                // Auto-estimate token weight if content changed
                if (updates.content !== undefined) {
                    updated.tokenWeight = RuleHelpers.estimateTokenWeight(updated.content);
                }
                
                return updated;
            }
            return r;
        }));
    };

    // Helper function to parse keywords from text (supports phrases and individual words)
    const parseKeywords = (text: string): string[] => {
        if (!text.trim()) return [];
        
        const keywords: string[] = [];
        let current = '';
        let inQuotes = false;
        let inBrackets = false;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];
            
            // Handle quotes for phrases
            if (char === '"' || char === "'" || char === '`') {
                if (!inBrackets) {
                    inQuotes = !inQuotes;
                    continue;
                }
            }
            
            // Handle brackets for phrases
            if (char === '[' && !inQuotes) {
                inBrackets = true;
                continue;
            }
            if (char === ']' && !inQuotes) {
                inBrackets = false;
                if (current.trim()) {
                    keywords.push(current.trim());
                    current = '';
                }
                continue;
            }
            
            // Handle separators (comma, semicolon)
            if ((char === ',' || char === ';') && !inQuotes && !inBrackets) {
                if (current.trim()) {
                    keywords.push(current.trim());
                    current = '';
                }
                continue;
            }
            
            // Handle whitespace
            if (/\s/.test(char) && !inQuotes && !inBrackets) {
                if (current.trim()) {
                    keywords.push(current.trim());
                    current = '';
                }
                continue;
            }
            
            // Add character to current keyword
            current += char;
        }
        
        // Add final keyword if exists
        if (current.trim()) {
            keywords.push(current.trim());
        }
        
        // Filter and limit keywords
        return keywords
            .filter(keyword => keyword.length > 0)
            .filter(keyword => keyword.length <= 100) // Allow longer phrases
            .slice(0, 20); // Limit to max 20 keywords per field
    };

    // Helper function to format keywords for display - add quotes around phrases with spaces
    const formatKeywords = (keywords: string[] | undefined): string => {
        if (!keywords || keywords.length === 0) return '';
        
        return keywords.map(keyword => {
            // If keyword contains spaces, wrap in quotes for clarity
            if (keyword.includes(' ')) {
                return `"${keyword}"`;
            }
            return keyword;
        }).join(', ');
    };

    // Track raw input values to preserve user formatting
    const [keywordInputValues, setKeywordInputValues] = useState<{[ruleId: string]: string}>({});
    const [secondaryKeywordInputValues, setSecondaryKeywordInputValues] = useState<{[ruleId: string]: string}>({});

    // Initialize input values when rules change
    React.useEffect(() => {
        const newKeywordValues: {[ruleId: string]: string} = {};
        const newSecondaryValues: {[ruleId: string]: string} = {};
        
        rules.forEach(rule => {
            if (!keywordInputValues[rule.id]) {
                newKeywordValues[rule.id] = formatKeywords(rule.keywords);
            }
            if (!secondaryKeywordInputValues[rule.id]) {
                newSecondaryValues[rule.id] = formatKeywords(rule.secondaryKeywords);
            }
        });
        
        if (Object.keys(newKeywordValues).length > 0) {
            setKeywordInputValues(prev => ({ ...prev, ...newKeywordValues }));
        }
        if (Object.keys(newSecondaryValues).length > 0) {
            setSecondaryKeywordInputValues(prev => ({ ...prev, ...newSecondaryValues }));
        }
    }, [rules.length]); // Only run when rules array length changes

    const handleToggleActive = (id: string, isActive: boolean) => {
        handleRuleChange(id, { isActive });
    };

    const handleSaveRulesToFile = () => {
        if (rules.length === 0) {
            alert("Không có luật nào để lưu.");
            return;
        }
        
        const exportData = RuleHelpers.exportRulesToJSON(rules);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `AI-RolePlay-EnhancedRules-${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleLoadRulesClick = () => {
        fileInputRef.current?.click();
    };

    const handleLoadWorldInfoClick = () => {
        worldInfoInputRef.current?.click();
    };

    // Convert SillyTavern WorldInfo entry to CustomRule
    const convertWorldInfoEntryToRule = (entry: any): CustomRule => {
        const rule = RuleHelpers.createDefaultRule();
        
        // Basic info
        rule.id = `worldinfo-${entry.uid || Date.now()}-${Math.random()}`;
        rule.title = entry.comment || `World Info Entry ${entry.uid || ''}`;
        rule.content = entry.content || '';
        rule.isActive = !entry.disable;
        
        // Keywords
        rule.keywords = Array.isArray(entry.key) ? entry.key : [];
        rule.secondaryKeywords = Array.isArray(entry.keysecondary) ? entry.keysecondary : [];
        
        // Logic mapping from SillyTavern
        if (entry.selectiveLogic !== undefined) {
            rule.logic = entry.selectiveLogic as RuleLogic;
        }
        
        // Priority and settings
        rule.order = entry.order || 100;
        rule.probability = entry.useProbability ? (entry.probability || 100) : 100;
        rule.scanDepth = entry.depth || entry.scanDepth || 5;
        
        // Matching options
        rule.caseSensitive = entry.caseSensitive === true;
        rule.matchWholeWords = entry.matchWholeWords === true;
        
        // Advanced settings
        rule.maxActivationsPerTurn = entry.sticky > 0 ? undefined : 1; // SillyTavern sticky means can activate multiple times
        
        // Metadata
        rule.createdAt = Date.now();
        rule.category = entry.group || 'worldinfo';
        
        // Estimate token weight
        rule.tokenWeight = RuleHelpers.estimateTokenWeight(rule.content);
        
        return rule;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const { rules: importedRules, errors } = RuleHelpers.importRulesFromJSON(text);
                    
                    if (errors.length > 0) {
                        alert('Cảnh báo khi nhập file:\n' + errors.join('\n'));
                    }
                    
                    if (importedRules.length > 0) {
                        // Handle ID conflicts
                        const existingIds = new Set(rules.map(r => r.id));
                        const processedRules = importedRules.map(rule => {
                            if (existingIds.has(rule.id)) {
                                return { ...rule, id: `${Date.now()}-${Math.random()}` };
                            }
                            return rule;
                        });

                        setRules(prev => [...prev, ...processedRules]);
                        alert(`Đã nhập thành công ${processedRules.length} luật.`);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải file luật:', error);
                alert('Không thể đọc file luật. File có thể bị hỏng hoặc không đúng định dạng.');
            }
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleWorldInfoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const worldInfoData = JSON.parse(text);
                    
                    // Check if it's a valid SillyTavern WorldInfo file
                    if (!worldInfoData.entries || typeof worldInfoData.entries !== 'object') {
                        alert('Không phải file WorldInfo hợp lệ của SillyTavern. File cần có định dạng: {"entries": {...}}');
                        return;
                    }

                    const convertedRules: CustomRule[] = [];
                    const errors: string[] = [];

                    // Convert each entry
                    Object.values(worldInfoData.entries).forEach((entry: any, index: number) => {
                        try {
                            if (entry && typeof entry === 'object') {
                                const convertedRule = convertWorldInfoEntryToRule(entry);
                                if (convertedRule.content.trim()) {
                                    convertedRules.push(convertedRule);
                                }
                            }
                        } catch (error) {
                            errors.push(`Entry ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    });

                    if (errors.length > 0) {
                        console.warn('Errors during WorldInfo conversion:', errors);
                        alert(`Đã convert thành công ${convertedRules.length} rules, có ${errors.length} lỗi. Xem console để biết chi tiết.`);
                    }

                    if (convertedRules.length > 0) {
                        // Handle ID conflicts with existing rules
                        const existingIds = new Set(rules.map(r => r.id));
                        const processedRules = convertedRules.map(rule => {
                            if (existingIds.has(rule.id)) {
                                return { ...rule, id: `${Date.now()}-${Math.random()}` };
                            }
                            return rule;
                        });

                        setRules(prev => [...prev, ...processedRules]);
                        alert(`Đã nhập thành công ${processedRules.length} WorldInfo entries từ SillyTavern!`);
                    } else {
                        alert('Không tìm thấy WorldInfo entries hợp lệ nào trong file.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi đọc file WorldInfo:', error);
                alert('Không thể đọc file WorldInfo. File có thể bị hỏng hoặc không đúng định dạng JSON.');
            }
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };

    const renderSimpleRuleEditor = (rule: CustomRule, index: number) => (
        <div key={rule.id} className="bg-slate-200/50 dark:bg-[#373c5a]/50 p-3 rounded-lg border border-slate-300 dark:border-slate-600 space-y-2">
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    value={rule.title || ''}
                    onChange={(e) => handleRuleChange(rule.id, { title: e.target.value })}
                    placeholder={`Tiêu đề luật #${index + 1}...`}
                    className="flex-1 bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                        Ưu tiên: {rule.order || 100}
                    </span>
                    <button
                        onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                        className="text-blue-600 hover:text-blue-500 text-xs px-2 py-1 rounded"
                    >
                        {expandedRule === rule.id ? 'Thu gọn' : 'Chi tiết'}
                    </button>
                </div>
            </div>
            
            <textarea
                value={rule.content}
                onChange={(e) => handleRuleChange(rule.id, { content: e.target.value })}
                placeholder={`Nội dung luật #${index + 1}...`}
                className="w-full h-24 bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            />
            
            <div className="flex justify-between items-center">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={(e) => handleToggleActive(rule.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-gray-300">Hoạt động</span>
                </label>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleDuplicateRule(rule)} 
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                    >
                        Sao chép
                    </button>
                    <button 
                        onClick={() => handleDeleteRule(rule.id)} 
                        className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAdvancedRuleEditor = (rule: CustomRule, index: number) => (
        <div key={rule.id} className="bg-slate-200/50 dark:bg-[#373c5a]/50 p-4 rounded-lg border border-slate-300 dark:border-slate-600 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-600 pb-2">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        value={rule.title || ''}
                        onChange={(e) => handleRuleChange(rule.id, { title: e.target.value })}
                        placeholder={`Tiêu đề luật #${index + 1}...`}
                        className="flex-1 bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm font-medium text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                        value={rule.category || 'general'}
                        onChange={(e) => handleRuleChange(rule.id, { category: e.target.value })}
                        className="bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {RuleHelpers.getAvailableCategories().map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex items-center gap-2">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rule.isActive}
                            onChange={(e) => handleToggleActive(rule.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-1 text-sm text-slate-700 dark:text-gray-300">Hoạt động</span>
                    </label>
                    
                    <button 
                        onClick={() => handleDuplicateRule(rule)} 
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                    >
                        Sao chép
                    </button>
                    <button 
                        onClick={() => handleDeleteRule(rule.id)} 
                        className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs"
                    >
                        Xóa
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                        Nội dung luật:
                    </label>
                    <textarea
                        value={rule.content}
                        onChange={(e) => handleRuleChange(rule.id, { content: e.target.value })}
                        placeholder={`Nội dung luật #${index + 1}...`}
                        className="w-full h-20 bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                </div>

                {/* Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                            Từ khóa chính (hỗ trợ cụm từ với [dấu ngoặc] hoặc "dấu nháy"):
                            {rule.keywords && rule.keywords.length > 0 && (
                                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                    ({rule.keywords.length} từ khóa)
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={keywordInputValues[rule.id] ?? formatKeywords(rule.keywords)}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                setKeywordInputValues(prev => ({ ...prev, [rule.id]: inputValue }));
                                
                                // Parse and update keywords in real-time
                                const parsedKeywords = parseKeywords(inputValue);
                                handleRuleChange(rule.id, { keywords: parsedKeywords });
                            }}
                            onBlur={(e) => {
                                // On blur, format nicely but keep the parsed keywords
                                const inputValue = e.target.value;
                                const parsedKeywords = parseKeywords(inputValue);
                                setKeywordInputValues(prev => ({ ...prev, [rule.id]: formatKeywords(parsedKeywords) }));
                            }}
                            placeholder='rồng [gọi điện thoại] "nói trong điện thoại" lửa...'
                            className="w-full bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                            Từ khóa phụ (hỗ trợ cụm từ với [dấu ngoặc] hoặc "dấu nháy"):
                            {rule.secondaryKeywords && rule.secondaryKeywords.length > 0 && (
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                    ({rule.secondaryKeywords.length} từ khóa)
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={secondaryKeywordInputValues[rule.id] ?? formatKeywords(rule.secondaryKeywords)}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                setSecondaryKeywordInputValues(prev => ({ ...prev, [rule.id]: inputValue }));
                                
                                // Parse and update keywords in real-time
                                const parsedKeywords = parseKeywords(inputValue);
                                handleRuleChange(rule.id, { secondaryKeywords: parsedKeywords });
                            }}
                            onBlur={(e) => {
                                // On blur, format nicely but keep the parsed keywords
                                const inputValue = e.target.value;
                                const parsedKeywords = parseKeywords(inputValue);
                                setSecondaryKeywordInputValues(prev => ({ ...prev, [rule.id]: formatKeywords(parsedKeywords) }));
                            }}
                            placeholder='[hơi thở lửa] "thổi lửa" băng-giá...'
                            className="w-full bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                            Độ ưu tiên:
                        </label>
                        <input
                            type="number"
                            value={rule.order || 100}
                            onChange={(e) => handleRuleChange(rule.id, { order: parseInt(e.target.value) || 100 })}
                            min="0"
                            max="1000"
                            className="w-full bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                            Xác suất (%):
                        </label>
                        <input
                            type="number"
                            value={rule.probability || 100}
                            onChange={(e) => handleRuleChange(rule.id, { probability: parseInt(e.target.value) || 100 })}
                            min="0"
                            max="100"
                            className="w-full bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.alwaysActive || false}
                                onChange={(e) => handleRuleChange(rule.id, { alwaysActive: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                Luôn hoạt động (bỏ qua từ khóa)
                            </span>
                        </label>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            Khi bật, luật này sẽ luôn được bao gồm trong prompt mà không cần từ khóa
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                            Logic từ khóa:
                        </label>
                        <select
                            value={rule.logic || RuleLogic.AND_ANY}
                            onChange={(e) => handleRuleChange(rule.id, { logic: parseInt(e.target.value) as RuleLogic })}
                            className="w-full bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value={RuleLogic.AND_ANY}>ANY</option>
                            <option value={RuleLogic.AND_ALL}>ALL</option>
                            <option value={RuleLogic.NOT_ALL}>NOT ALL</option>
                            <option value={RuleLogic.NOT_ANY}>NOT ANY</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                            Độ sâu quét:
                        </label>
                        <input
                            type="number"
                            value={rule.scanDepth || 5}
                            onChange={(e) => handleRuleChange(rule.id, { scanDepth: parseInt(e.target.value) || 5 })}
                            min="1"
                            max="20"
                            className="w-full bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Scanning Options */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Tùy chọn quét:
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.scanPlayerInput !== false}
                                onChange={(e) => handleRuleChange(rule.id, { scanPlayerInput: e.target.checked })}
                                className="h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-xs text-slate-700 dark:text-gray-300">Lệnh người chơi</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.scanAIOutput !== false}
                                onChange={(e) => handleRuleChange(rule.id, { scanAIOutput: e.target.checked })}
                                className="h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-xs text-slate-700 dark:text-gray-300">Phản hồi AI</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.scanMemories !== false}
                                onChange={(e) => handleRuleChange(rule.id, { scanMemories: e.target.checked })}
                                className="h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-xs text-slate-700 dark:text-gray-300">Ký ức</span>
                        </label>
                    </div>
                    
                    {/* Matching Options */}
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Tùy chọn khớp từ khóa:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.caseSensitive === true}
                                onChange={(e) => handleRuleChange(rule.id, { caseSensitive: e.target.checked })}
                                className="h-3 w-3 rounded border-gray-400 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-2 text-xs text-slate-700 dark:text-gray-300">Phân biệt hoa thường</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.matchWholeWords === true}
                                onChange={(e) => handleRuleChange(rule.id, { matchWholeWords: e.target.checked })}
                                className="h-3 w-3 rounded border-gray-400 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-2 text-xs text-slate-700 dark:text-gray-300">Chỉ từ nguyên vẹn</span>
                        </label>
                    </div>
                </div>

                {/* Rule Statistics */}
                {(rule.activationCount || 0) > 0 && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-300 dark:border-slate-600 pt-2">
                        Đã kích hoạt: {rule.activationCount} lần
                        {rule.lastActivated && ` • Lần cuối: Lượt ${rule.lastActivated}`}
                        {rule.tokenWeight && ` • Tokens ước tính: ${rule.tokenWeight}`}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
                
                {/* File inputs */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
                <input
                    type="file"
                    ref={characterCardFileInputRef}
                    accept=".json"
                    className="hidden"
                />
                <input
                    type="file"
                    ref={worldInfoInputRef}
                    onChange={handleWorldInfoFileChange}
                    accept=".json"
                    className="hidden"
                />

                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex-shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <DocumentAddIcon className="w-6 h-6" /> 
                            Quản Lý Luật Lệ Nâng Cao
                        </h3>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">
                            &times;
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Chế độ:</label>
                            <button
                                onClick={() => setViewMode(viewMode === 'simple' ? 'advanced' : 'simple')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    viewMode === 'advanced' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {viewMode === 'advanced' ? 'Nâng cao' : 'Đơn giản'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Sắp xếp:</label>
                            <select
                                value={sortMode}
                                onChange={(e) => setSortMode(e.target.value as SortMode)}
                                className="bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded px-2 py-1 text-sm"
                            >
                                <option value="priority">Độ ưu tiên</option>
                                <option value="alphabetical">Tên A-Z</option>
                                <option value="category">Danh mục</option>
                                <option value="recent">Mới nhất</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Danh mục:</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded px-2 py-1 text-sm"
                            >
                                <option value="all">Tất cả</option>
                                {RuleHelpers.getAvailableCategories().map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm luật..."
                                className="w-full bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded px-2 py-1 text-sm"
                            />
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Hiển thị {filteredAndSortedRules.length}/{rules.length} luật • 
                        {rules.filter(r => r.isActive).length} hoạt động • 
                        Tổng ước tính: {rules.reduce((sum, r) => sum + (r.tokenWeight || 0), 0)} tokens
                        {rules.some(r => r.category === 'worldinfo') && (
                            <span className="ml-2 text-purple-600 dark:text-purple-400">
                                • {rules.filter(r => r.category === 'worldinfo').length} từ WorldInfo
                            </span>
                        )}
                    </div>
                </div>

                {/* Rules List */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {filteredAndSortedRules.map((rule, index) => 
                        viewMode === 'simple' 
                            ? renderSimpleRuleEditor(rule, index)
                            : renderAdvancedRuleEditor(rule, index)
                    )}
                    
                    {filteredAndSortedRules.length === 0 && (
                        <p className="text-center text-slate-600 dark:text-slate-400 italic py-8">
                            {searchQuery || filterCategory !== 'all' 
                                ? 'Không tìm thấy luật nào phù hợp với bộ lọc.'
                                : 'Chưa có luật lệ tùy chỉnh nào.'
                            }
                        </p>
                    )}

                    <button 
                        onClick={handleAddRule} 
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" /> Thêm Luật Mới
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50/80 dark:bg-[#1f2238]/80 rounded-b-lg flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleSaveRulesToFile} 
                            className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                            <SaveIcon className="w-4 h-4"/> Xuất File
                        </button>
                        <button 
                            onClick={handleLoadRulesClick} 
                            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                            <FileIcon className="w-4 h-4"/> Nhập File
                        </button>
                        <button 
                            onClick={handleLoadWorldInfoClick} 
                            className="px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                            <DocumentAddIcon className="w-4 h-4"/> Nhập WorldInfo
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm font-semibold transition-colors duration-200"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white text-sm font-semibold transition-colors duration-200"
                        >
                            Lưu Thay Đổi ({rules.filter(r => r.isActive).length} hoạt động)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};