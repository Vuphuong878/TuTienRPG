import React, { useState, useRef, useEffect } from 'react';
import { RegexRule, RegexPlacement, RegexSubstituteMode } from './types';
import { regexEngine, RegexEngine } from './utils/RegexEngine';
import { DEFAULT_REGEX_TEMPLATES, generateTemplateRules } from './utils/DefaultRegexTemplates';
import { PlusIcon, SaveIcon, FileIcon, TrashIcon, PlayIcon, StopIcon, EyeIcon, EyeSlashIcon } from './Icons';

interface RegexEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: RegexRule) => void;
    rule?: RegexRule;
    existingRuleNames: string[];
}

const RegexEditorModal: React.FC<RegexEditorModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    rule, 
    existingRuleNames 
}) => {
    const [editRule, setEditRule] = useState<RegexRule>(() => ({
        id: rule?.id || Date.now().toString(),
        name: rule?.name || '',
        findRegex: rule?.findRegex || '',
        replaceString: rule?.replaceString || '',
        trimStrings: rule?.trimStrings || [],
        placement: rule?.placement || [RegexPlacement.AI_OUTPUT],
        disabled: rule?.disabled || false,
        isScoped: rule?.isScoped || false,
        markdownOnly: rule?.markdownOnly || false,
        promptOnly: rule?.promptOnly || false,
        runOnEdit: rule?.runOnEdit || true,
        substituteRegex: rule?.substituteRegex || RegexSubstituteMode.NONE,
        minDepth: rule?.minDepth,
        maxDepth: rule?.maxDepth,
        category: rule?.category || 'General',
        description: rule?.description || '',
        createdAt: rule?.createdAt || Date.now(),
        lastUsed: rule?.lastUsed
    }));

    const [testInput, setTestInput] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [showTesting, setShowTesting] = useState(false);
    const [validationError, setValidationError] = useState('');

    // Reset state when modal opens with new rule
    useEffect(() => {
        if (isOpen) {
            setEditRule({
                id: rule?.id || Date.now().toString(),
                name: rule?.name || '',
                findRegex: rule?.findRegex || '',
                replaceString: rule?.replaceString || '',
                trimStrings: rule?.trimStrings || [],
                placement: rule?.placement || [RegexPlacement.AI_OUTPUT],
                disabled: rule?.disabled || false,
                isScoped: rule?.isScoped || false,
                markdownOnly: rule?.markdownOnly || false,
                promptOnly: rule?.promptOnly || false,
                runOnEdit: rule?.runOnEdit || true,
                substituteRegex: rule?.substituteRegex || RegexSubstituteMode.NONE,
                minDepth: rule?.minDepth,
                maxDepth: rule?.maxDepth,
                category: rule?.category || 'General',
                description: rule?.description || '',
                createdAt: rule?.createdAt || Date.now(),
                lastUsed: rule?.lastUsed
            });
            setTestInput('');
            setTestOutput('');
            setValidationError('');
        }
    }, [isOpen, rule]);

    // Validate regex pattern
    useEffect(() => {
        if (editRule.findRegex) {
            const validation = RegexEngine.validateRegexPattern(editRule.findRegex);
            setValidationError(validation.isValid ? '' : validation.error || 'Invalid pattern');
        } else {
            setValidationError('');
        }
    }, [editRule.findRegex]);

    // Test regex pattern
    useEffect(() => {
        if (showTesting && testInput && editRule.findRegex && !validationError) {
            try {
                const result = regexEngine.runRegexRule(editRule, testInput);
                setTestOutput(result);
            } catch (error) {
                setTestOutput('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        }
    }, [showTesting, testInput, editRule, validationError]);

    const handleSave = () => {
        // Validation
        if (!editRule.name.trim()) {
            alert('Rule name is required.');
            return;
        }

        if (existingRuleNames.includes(editRule.name) && editRule.name !== rule?.name) {
            alert('A rule with this name already exists.');
            return;
        }

        if (!editRule.findRegex.trim()) {
            alert('Find regex pattern is required.');
            return;
        }

        if (validationError) {
            alert('Please fix the regex pattern error: ' + validationError);
            return;
        }

        if (editRule.placement.length === 0) {
            alert('At least one placement must be selected.');
            return;
        }

        onSave(editRule);
        onClose();
    };

    const handlePlacementChange = (placement: RegexPlacement, checked: boolean) => {
        setEditRule(prev => ({
            ...prev,
            placement: checked 
                ? [...prev.placement, placement]
                : prev.placement.filter(p => p !== placement)
        }));
    };

    const handleTrimStringsChange = (value: string) => {
        const trimStrings = value.split('\n').filter(s => s.trim().length > 0);
        setEditRule(prev => ({ ...prev, trimStrings }));
    };

    if (!isOpen) return null;

    const placementDescriptions = RegexEngine.getPlacementDescriptions();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {rule ? 'Edit Regex Rule' : 'Create Regex Rule'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Rule Configuration */}
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rule Name *
                                </label>
                                <input
                                    type="text"
                                    value={editRule.name}
                                    onChange={(e) => setEditRule(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    placeholder="Enter rule name..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editRule.description}
                                    onChange={(e) => setEditRule(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    rows={2}
                                    placeholder="Describe what this rule does..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={editRule.category}
                                    onChange={(e) => setEditRule(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    placeholder="e.g., Formatting, Combat, Dialogue..."
                                />
                            </div>

                            {/* Regex Pattern */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Find Regex Pattern *
                                </label>
                                <textarea
                                    value={editRule.findRegex}
                                    onChange={(e) => setEditRule(prev => ({ ...prev, findRegex: e.target.value }))}
                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-black ${
                                        validationError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    rows={3}
                                    placeholder="Enter regex pattern... e.g., /\\*([^*]+)\\*/g"
                                />
                                {validationError && (
                                    <p className="text-red-500 text-xs mt-1">{validationError}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Replace With
                                </label>
                                <textarea
                                    value={editRule.replaceString}
                                    onChange={(e) => setEditRule(prev => ({ ...prev, replaceString: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-black"
                                    rows={3}
                                    placeholder="Replacement text... Use $1, $2 for groups, {{match}} for full match"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trim Strings (one per line)
                                </label>
                                <textarea
                                    value={editRule.trimStrings.join('\n')}
                                    onChange={(e) => handleTrimStringsChange(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    rows={2}
                                    placeholder="Strings to remove from matches..."
                                />
                            </div>
                        </div>

                        {/* Right Column - Settings and Testing */}
                        <div className="space-y-4">
                            {/* Placement */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apply To (Placement) *
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.PLAYER_INPUT)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.PLAYER_INPUT, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">Player Commands</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.AI_OUTPUT)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.AI_OUTPUT, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">AI Responses</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.MEMORY_PROCESSING)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.MEMORY_PROCESSING, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">Memory Storage</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.ENTITY_DETECTION)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.ENTITY_DETECTION, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">Entity Extraction</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.QUEST_PROCESSING)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.QUEST_PROCESSING, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">Quest Updates</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.DIALOGUE_FORMATTING)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.DIALOGUE_FORMATTING, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">Dialogue Formatting</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.STAT_EXTRACTION)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.STAT_EXTRACTION, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">Statistics Extraction</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editRule.placement.includes(RegexPlacement.COMBAT_FORMATTING)}
                                            onChange={(e) => handlePlacementChange(RegexPlacement.COMBAT_FORMATTING, e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span className="flex-1 text-black font-semibold">Combat Formatting</span>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Options</label>
                                
                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={editRule.disabled}
                                        onChange={(e) => setEditRule(prev => ({ ...prev, disabled: e.target.checked }))}
                                    />
                                    <span className="text-black font-semibold">Disabled</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={editRule.markdownOnly}
                                        onChange={(e) => setEditRule(prev => ({ ...prev, markdownOnly: e.target.checked }))}
                                    />
                                    <span className="text-black font-semibold">Markdown display only</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={editRule.promptOnly}
                                        onChange={(e) => setEditRule(prev => ({ ...prev, promptOnly: e.target.checked }))}
                                    />
                                    <span className="text-black font-semibold">Prompt generation only</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={editRule.runOnEdit}
                                        onChange={(e) => setEditRule(prev => ({ ...prev, runOnEdit: e.target.checked }))}
                                    />
                                    <span className="text-black font-semibold">Run when editing content</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={editRule.isScoped}
                                        onChange={(e) => setEditRule(prev => ({ ...prev, isScoped: e.target.checked }))}
                                    />
                                    <span className="text-black font-semibold">Character/World specific</span>
                                </div>
                            </div>

                            {/* Macro Substitution */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Macro Substitution
                                </label>
                                <select
                                    value={editRule.substituteRegex}
                                    onChange={(e) => setEditRule(prev => ({ 
                                        ...prev, 
                                        substituteRegex: parseInt(e.target.value) as RegexSubstituteMode 
                                    }))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    <option value={RegexSubstituteMode.NONE} className="text-black">None - Use pattern as-is</option>
                                    <option value={RegexSubstituteMode.RAW} className="text-black">Raw - Substitute macros</option>
                                    <option value={RegexSubstituteMode.ESCAPED} className="text-black">Escaped - Substitute and escape</option>
                                </select>
                            </div>

                            {/* Depth Control */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Depth
                                    </label>
                                    <input
                                        type="number"
                                        value={editRule.minDepth || ''}
                                        onChange={(e) => setEditRule(prev => ({ 
                                            ...prev, 
                                            minDepth: e.target.value ? parseInt(e.target.value) : undefined 
                                        }))}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Depth
                                    </label>
                                    <input
                                        type="number"
                                        value={editRule.maxDepth || ''}
                                        onChange={(e) => setEditRule(prev => ({ 
                                            ...prev, 
                                            maxDepth: e.target.value ? parseInt(e.target.value) : undefined 
                                        }))}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        placeholder="∞"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Testing */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Test Pattern
                                    </label>
                                    <button
                                        onClick={() => setShowTesting(!showTesting)}
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                    >
                                        {showTesting ? <EyeSlashIcon /> : <EyeIcon />}
                                        <span className="text-sm">{showTesting ? 'Hide' : 'Show'}</span>
                                    </button>
                                </div>
                                
                                {showTesting && (
                                    <div className="space-y-2">
                                        <textarea
                                            value={testInput}
                                            onChange={(e) => setTestInput(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                                            rows={3}
                                            placeholder="Enter test text here..."
                                        />
                                        <div className="bg-gray-50 p-2 rounded border text-sm">
                                            <div className="font-medium text-gray-600 mb-1">Output:</div>
                                            <div className="whitespace-pre-wrap break-words">
                                                {testOutput || (testInput ? 'No changes' : 'Enter test input above')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!!validationError || !editRule.name.trim() || !editRule.findRegex.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <SaveIcon />
                            <span>Save Rule</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RegexManager: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (rules: RegexRule[]) => void;
    currentRules: RegexRule[];
}> = ({ isOpen, onClose, onSave, currentRules = [] }) => {
    const [rules, setRules] = useState<RegexRule[]>(currentRules || []);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RegexRule | undefined>();
    const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
    const [filterCategory, setFilterCategory] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update rules when modal opens
    useEffect(() => {
        if (isOpen) {
            setRules(currentRules || []);
            setSelectedRules(new Set());
        }
    }, [isOpen, currentRules]);

    const handleSave = () => {
        onSave(rules);
        onClose();
    };

    const handleCreateRule = () => {
        setEditingRule(undefined);
        setIsEditorOpen(true);
    };

    const handleEditRule = (rule: RegexRule) => {
        setEditingRule(rule);
        setIsEditorOpen(true);
    };

    const handleSaveRule = (rule: RegexRule) => {
        if (editingRule) {
            // Update existing rule
            setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
        } else {
            // Add new rule
            setRules(prev => [...prev, rule]);
        }
    };

    const handleDeleteRule = (id: string) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            setRules(prev => prev.filter(r => r.id !== id));
            setSelectedRules(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const handleToggleRule = (id: string) => {
        setRules(prev => prev.map(r => 
            r.id === id ? { ...r, disabled: !r.disabled } : r
        ));
    };

    const handleSelectRule = (id: string, selected: boolean) => {
        setSelectedRules(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const filteredRules = getFilteredRules();
        const allSelected = filteredRules.every(rule => selectedRules.has(rule.id));
        
        if (allSelected) {
            // Deselect all filtered rules
            setSelectedRules(prev => {
                const newSet = new Set(prev);
                filteredRules.forEach(rule => newSet.delete(rule.id));
                return newSet;
            });
        } else {
            // Select all filtered rules
            setSelectedRules(prev => {
                const newSet = new Set(prev);
                filteredRules.forEach(rule => newSet.add(rule.id));
                return newSet;
            });
        }
    };

    const handleBulkEnable = () => {
        setRules(prev => prev.map(r => 
            selectedRules.has(r.id) ? { ...r, disabled: false } : r
        ));
    };

    const handleBulkDisable = () => {
        setRules(prev => prev.map(r => 
            selectedRules.has(r.id) ? { ...r, disabled: true } : r
        ));
    };

    const handleBulkDelete = () => {
        if (selectedRules.size === 0) return;
        
        if (confirm(`Are you sure you want to delete ${selectedRules.size} selected rule(s)?`)) {
            setRules(prev => prev.filter(r => !selectedRules.has(r.id)));
            setSelectedRules(new Set());
        }
    };

    const handleExportRules = () => {
        const exportRules = selectedRules.size > 0 
            ? rules.filter(r => selectedRules.has(r.id))
            : rules;
            
        if (exportRules.length === 0) {
            alert('No rules to export.');
            return;
        }

        const jsonString = JSON.stringify(exportRules, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `RPG-Regex-Rules-${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportRules = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedRules = JSON.parse(text) as RegexRule[];
            
            if (!Array.isArray(importedRules)) {
                throw new Error('Invalid file format');
            }

            // Assign new IDs to prevent conflicts
            const newRules = importedRules.map(rule => ({
                ...rule,
                id: Date.now().toString() + Math.random().toString(36),
                createdAt: Date.now()
            }));

            setRules(prev => [...prev, ...newRules]);
            alert(`Successfully imported ${newRules.length} rule(s).`);
        } catch (error) {
            alert('Error importing rules: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleLoadTemplates = () => {
        if (confirm('This will add default RPG regex templates to your rules. Continue?')) {
            const templateRules = generateTemplateRules(DEFAULT_REGEX_TEMPLATES);
            setRules(prev => [...prev, ...templateRules]);
            alert(`Successfully loaded ${templateRules.length} template rule(s)!`);
        }
    };

    const getFilteredRules = () => {
        return rules.filter(rule => 
            !filterCategory || rule.category === filterCategory
        );
    };

    const getCategories = () => {
        const categories = new Set(rules.map(r => r.category).filter(Boolean));
        return Array.from(categories).sort();
    };

    if (!isOpen) return null;

    const filteredRules = getFilteredRules();
    const categories = getCategories();

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Regex Rules Manager</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleCreateRule}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                <PlusIcon />
                                <span>New Rule</span>
                            </button>

                            {/* Category Filter */}
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            >
                                <option value="" className="text-black">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category} className="text-black">{category}</option>
                                ))}
                            </select>

                            {/* Bulk Actions */}
                            <div className="flex items-center space-x-2 border-l pl-3">
                                <button
                                    onClick={handleSelectAll}
                                    className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    {filteredRules.length > 0 && filteredRules.every(rule => selectedRules.has(rule.id)) 
                                        ? 'Deselect All' 
                                        : 'Select All'}
                                </button>

                                {selectedRules.size > 0 && (
                                    <>
                                        <button
                                            onClick={handleBulkEnable}
                                            className="flex items-center space-x-1 px-3 py-2 text-green-600 border border-green-300 rounded hover:bg-green-50"
                                        >
                                            <PlayIcon />
                                            <span>Enable</span>
                                        </button>

                                        <button
                                            onClick={handleBulkDisable}
                                            className="flex items-center space-x-1 px-3 py-2 text-orange-600 border border-orange-300 rounded hover:bg-orange-50"
                                        >
                                            <StopIcon />
                                            <span>Disable</span>
                                        </button>

                                        <button
                                            onClick={handleBulkDelete}
                                            className="flex items-center space-x-1 px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50"
                                        >
                                            <TrashIcon />
                                            <span>Delete</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Import/Export */}
                            <div className="flex items-center space-x-2 border-l pl-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportRules}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center space-x-1 px-3 py-2 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                                >
                                    <FileIcon />
                                    <span>Import</span>
                                </button>

                                <button
                                    onClick={handleLoadTemplates}
                                    className="flex items-center space-x-1 px-3 py-2 text-green-600 border border-green-300 rounded hover:bg-green-50"
                                >
                                    <PlusIcon />
                                    <span>Load Templates</span>
                                </button>

                                <button
                                    onClick={handleExportRules}
                                    className="flex items-center space-x-1 px-3 py-2 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                                >
                                    <SaveIcon />
                                    <span>Export {selectedRules.size > 0 ? `(${selectedRules.size})` : 'All'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rules List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {filteredRules.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <p className="text-lg mb-2">No regex rules found</p>
                                <p className="text-sm">Create your first rule to get started with text processing automation.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredRules.map(rule => (
                                    <div
                                        key={rule.id}
                                        className={`border rounded-lg p-4 ${rule.disabled ? 'bg-gray-50' : 'bg-white'} ${
                                            selectedRules.has(rule.id) ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRules.has(rule.id)}
                                                    onChange={(e) => handleSelectRule(rule.id, e.target.checked)}
                                                    className="mt-1"
                                                />
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className={`font-medium ${rule.disabled ? 'text-gray-500' : 'text-gray-900'}`}>
                                                            {rule.name}
                                                        </h3>
                                                        {rule.category && (
                                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                                {rule.category}
                                                            </span>
                                                        )}
                                                        {rule.disabled && (
                                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                                                Disabled
                                                            </span>
                                                        )}
                                                        {rule.isScoped && (
                                                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                                                Scoped
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {rule.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                                                    )}
                                                    
                                                    <div className="text-xs text-gray-500 space-y-1">
                                                        <div>
                                                            <span className="font-medium">Pattern:</span>{' '}
                                                            <code className="bg-gray-100 px-1 rounded">
                                                                {rule.findRegex.length > 50 
                                                                    ? rule.findRegex.substring(0, 50) + '...'
                                                                    : rule.findRegex}
                                                            </code>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Applies to:</span>{' '}
                                                            {rule.placement.map(p => RegexEngine.getPlacementDescriptions()[p].split(' - ')[0]).join(', ')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleToggleRule(rule.id)}
                                                    className={`p-2 rounded ${
                                                        rule.disabled 
                                                            ? 'text-green-600 hover:bg-green-50' 
                                                            : 'text-orange-600 hover:bg-orange-50'
                                                    }`}
                                                    title={rule.disabled ? 'Enable rule' : 'Disable rule'}
                                                >
                                                    {rule.disabled ? <PlayIcon /> : <StopIcon />}
                                                </button>

                                                <button
                                                    onClick={() => handleEditRule(rule)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit rule"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete rule"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {filteredRules.length} rule(s) • {selectedRules.size} selected
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <SaveIcon />
                                    <span>Save All Rules</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rule Editor Modal */}
            <RegexEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveRule}
                rule={editingRule}
                existingRuleNames={rules.map(r => r.name)}
            />
        </>
    );
};