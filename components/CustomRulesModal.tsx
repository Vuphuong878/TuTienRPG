import React, { useState, useRef } from 'react';
import type { CustomRule } from './types.ts';
import { DocumentAddIcon, PlusIcon, SaveIcon, FileIcon } from './Icons.tsx';

export const CustomRulesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (rules: CustomRule[]) => void;
    currentRules: CustomRule[];
}> = ({ isOpen, onClose, onSave, currentRules }) => {
    if (!isOpen) return null;
    const [rules, setRules] = useState<CustomRule[]>(currentRules);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const characterCardFileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onSave(rules);
        onClose();
    };

    const handleAddRule = () => {
        setRules(prev => [...prev, { id: Date.now().toString(), content: '', isActive: true }]);
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    const handleRuleChange = (id: string, newContent: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, content: newContent } : r));
    };

    const handleToggleActive = (id: string, newIsActive: boolean) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: newIsActive } : r));
    };

    const handleSaveRulesToFile = () => {
        if (rules.length === 0) {
            alert("Không có luật nào để lưu.");
            return;
        }
        const jsonString = JSON.stringify(rules, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `AI-RolePlay-CustomRules-${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleLoadRulesClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedRules: CustomRule[] = JSON.parse(text);
                    
                    if (Array.isArray(loadedRules) && loadedRules.every(r => typeof r === 'object' && r !== null && 'id' in r && 'content' in r && 'isActive' in r)) {
                        const existingIds = new Set(rules.map(r => r.id));
                        const rulesToAdd: CustomRule[] = [];
                        
                        loadedRules.forEach(loadedRule => {
                            if (existingIds.has(loadedRule.id)) {
                                // ID conflict, generate a new one to allow adding.
                                rulesToAdd.push({ ...loadedRule, id: `${Date.now()}-${Math.random()}` });
                            } else {
                                rulesToAdd.push(loadedRule);
                            }
                        });

                        setRules(prev => [...prev, ...rulesToAdd]);
                        alert(`Đã tải và thêm thành công ${rulesToAdd.length} luật mới.`);
                    } else {
                        throw new Error('Định dạng tệp không hợp lệ.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải tệp luật:', error);
                alert('Không thể đọc tệp luật. Tệp có thể bị hỏng hoặc không đúng định dạng.');
            }
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleLoadCharacterCardClick = () => {
        characterCardFileInputRef.current?.click();
    };
    
    const handleCharacterCardFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const characterCardData = JSON.parse(text);
                    
                    // Check if it's a SillyTavern character card format
                    if (characterCardData.data && characterCardData.data.character_book && 
                        characterCardData.data.character_book.entries && 
                        Array.isArray(characterCardData.data.character_book.entries)) {
                        
                        const entries = characterCardData.data.character_book.entries;
                        const extractedRules: CustomRule[] = [];
                        const existingIds = new Set(rules.map(r => r.id));
                        
                        entries.forEach((entry: any, index: number) => {
                            if (entry.content && typeof entry.content === 'string' && entry.content.trim()) {
                                const ruleId = `character-card-${Date.now()}-${index}`;
                                // Ensure unique ID
                                let finalId = ruleId;
                                while (existingIds.has(finalId)) {
                                    finalId = `${ruleId}-${Math.random()}`;
                                }
                                
                                extractedRules.push({
                                    id: finalId,
                                    content: entry.content.trim(),
                                    isActive: true
                                });
                                existingIds.add(finalId);
                            }
                        });

                        if (extractedRules.length > 0) {
                            setRules(prev => [...prev, ...extractedRules]);
                            alert(`Đã trích xuất và thêm thành công ${extractedRules.length} luật từ Character Card "${characterCardData.data.name || 'Unknown'}".`);
                        } else {
                            alert('Không tìm thấy nội dung hợp lệ trong character_book entries của tệp này.');
                        }
                    } else {
                        throw new Error('Tệp không phải định dạng SillyTavern Character Card hợp lệ.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải Character Card:', error);
                alert('Không thể đọc tệp Character Card. Tệp có thể bị hỏng hoặc không đúng định dạng SillyTavern Character Card.');
            }
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-3xl h-full max-h-[85vh] flex flex-col text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
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
                    onChange={handleCharacterCardFileChange}
                    accept=".json"
                    className="hidden"
                />
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><DocumentAddIcon className="w-6 h-6" /> Nạp Tri Thức & Quản Lý Luật Lệ</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Thêm luật lệ, vật phẩm, nhân vật, hoặc bất kỳ thông tin nào bạn muốn AI tuân theo. AI sẽ ưu tiên các luật lệ đang hoạt động,Luật lệ sẽ được áp dụng vào lượt sau.
                        <br/>
                        Ví dụ: "Tạo ra một thanh kiếm tên là 'Hỏa Long Kiếm' có khả năng phun lửa, miêu tả chi tiết hoặc nhờ AI tự viết ra." hoặc "KHÓA HÀNH ĐỘNG TÙY Ý".
                    </p>
                    
                    {rules.map((rule, index) => (
                        <div key={rule.id} className="bg-slate-200/50 dark:bg-[#373c5a]/50 p-3 rounded-lg border border-slate-300 dark:border-slate-600 space-y-2">
                             <textarea
                                value={rule.content}
                                onChange={(e) => handleRuleChange(rule.id, e.target.value)}
                                placeholder={`Nội dung luật #${index + 1}...`}
                                className="w-full h-24 bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                            />
                            <div className="flex justify-between items-center">
                                <label htmlFor={`rule-toggle-${rule.id}`} className="flex items-center cursor-pointer">
                                    <input
                                        id={`rule-toggle-${rule.id}`}
                                        type="checkbox"
                                        checked={rule.isActive}
                                        onChange={(e) => handleToggleActive(rule.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-gray-300">Hoạt động</span>
                                </label>
                                <button onClick={() => handleDeleteRule(rule.id)} className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition-colors">
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                    {rules.length === 0 && <p className="text-center text-slate-600 dark:text-slate-400 italic py-4">Chưa có luật lệ tùy chỉnh nào.</p>}
                     <button onClick={handleAddRule} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Thêm Luật Mới
                    </button>
                </div>
                <div className="p-3 bg-slate-50/80 dark:bg-[#1f2238]/80 rounded-b-lg flex justify-between items-center flex-shrink-0">
                     <div className="flex items-center space-x-2">
                         <button onClick={handleSaveRulesToFile} className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <SaveIcon className="w-4 h-4"/> Lưu Luật Ra File
                        </button>
                        <button onClick={handleLoadRulesClick} className="px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <FileIcon className="w-4 h-4"/> Tải Luật Từ File
                        </button>
                        <button onClick={handleLoadCharacterCardClick} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <DocumentAddIcon className="w-4 h-4"/> Tải Character Card
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm font-semibold transition-colors duration-200">
                            Hủy
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white text-sm font-semibold transition-colors duration-200">
                            Lưu Thay Đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
