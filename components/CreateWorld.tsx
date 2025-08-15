import React, { useState, useRef, useContext } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AIContext } from '../App.tsx';
import type { FormData, CustomRule } from './types.ts';
import { SuggestionModal } from './SuggestionModal.tsx';
import { FormLabel, CustomSelect, SuggestButton } from './FormControls.tsx';
import { 
    ArrowLeftIcon, BookOpenIcon, UserIcon, PencilIcon, DiamondIcon, SpinnerIcon, SparklesIcon,
    SaveIcon, FileIcon, DocumentAddIcon, PlusIcon, ExclamationIcon
} from './Icons.tsx';
import { useGameSettings } from './hooks/useGameSettings';
import { getThemeColors } from './utils/themeUtils';

export const CreateWorld: React.FC<{ 
    onBack: () => void; 
    onStartGame: (data: FormData) => Promise<void>;
    isInitializing: boolean;
    initProgress: number;
    initCurrentStep: string;
    initSubStep: string;
}> = ({ onBack, onStartGame, isInitializing, initProgress, initCurrentStep, initSubStep }) => {
    const { ai, isAiReady, apiKeyError, selectedModel } = useContext(AIContext);
    const [gameSettingsState] = useGameSettings();
    const { gameSettings } = gameSettingsState;
    const [formData, setFormData] = useState<FormData>({
        storyName: '',
        genre: '',
        worldDetail: '',
        worldTime: { day: 1, month: 1, year: 1000 },
        startLocation: '',
        customStartLocation: '',
        expName: 'Kinh Nghiệm',
        realmTiers: [
            { id: '1', name: 'Luyện Khí', requiredExp: 0 },
            { id: '2', name: 'Trúc Cơ', requiredExp: 100 }
        ],
        writingStyle: 'second_person',
        difficulty: 'normal',
        allowNsfw: false,
        characterName: '',
        characterAge: '',
        characterAppearance: '',
        customPersonality: '',
        personalityFromList: '',
        gender: 'ai_decides',
        bio: '',
        startSkills: [{ name: '', description: '', mastery: '' }],
        addGoal: '',
        customRules: [],
    });
    
    const [activeTab, setActiveTab] = useState<'context' | 'knowledge'>('context');

    const [loadingStates, setLoadingStates] = useState({
        genre: false,
        worldDetail: false,
        character: false,
    });
    const [isAnySuggestionLoading, setIsAnySuggestionLoading] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    const suggestionLock = useRef(false);

    const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);
    const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
    const settingsFileInputRef = useRef<HTMLInputElement>(null);
    const rulesFileInputRef = useRef<HTMLInputElement>(null);
    const worldSetupFileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'customPersonality') {
             setFormData(prev => ({
                ...prev,
                customPersonality: value,
                personalityFromList: '' // Clear list selection when typing custom
            }));
        } else if (name === 'personalityFromList') {
            setFormData(prev => ({
                ...prev,
                personalityFromList: value,
                customPersonality: '' // Clear custom input when selecting from list
            }));
        } else if (name === 'startLocation') {
            setFormData(prev => ({
                ...prev,
                startLocation: value,
                customStartLocation: value !== 'Tuỳ chọn' ? '' : prev.customStartLocation // Clear custom location when not "Tuỳ chọn"
            }));
        } else {
             setFormData(prev => ({
                ...prev,
                [name]: isCheckbox ? checked : value
            }));
        }
    };
    
    // --- Rule Management Functions ---
    const handleAddRule = () => {
        setFormData(prev => ({ ...prev, customRules: [...prev.customRules, { id: Date.now().toString(), content: '', isActive: true }] }));
    };

    const handleDeleteRule = (id: string) => {
        setFormData(prev => ({ ...prev, customRules: prev.customRules.filter(r => r.id !== id) }));
    };

    const handleRuleChange = (id: string, newContent: string) => {
        setFormData(prev => ({ ...prev, customRules: prev.customRules.map(r => r.id === id ? { ...r, content: newContent } : r) }));
    };

    const handleToggleActive = (id: string, newIsActive: boolean) => {
        setFormData(prev => ({ ...prev, customRules: prev.customRules.map(r => r.id === id ? { ...r, isActive: newIsActive } : r) }));
    };

    // --- Realm System Management Functions ---
    const handleExpNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, expName: e.target.value }));
    };

    const handleRealmTierChange = (id: string, field: 'name' | 'requiredExp', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            realmTiers: prev.realmTiers.map(tier =>
                tier.id === id ? { ...tier, [field]: value } : tier
            )
        }));
    };

    const handleAddRealmTier = () => {
        const newId = (formData.realmTiers.length + 1).toString();
        const newTier = {
            id: newId,
            name: `Cảnh Giới ${newId}`,
            requiredExp: formData.realmTiers.length > 0 ? formData.realmTiers[formData.realmTiers.length - 1].requiredExp + 100 : 0
        };
        setFormData(prev => ({ ...prev, realmTiers: [...prev.realmTiers, newTier] }));
    };

    const handleRemoveRealmTier = (id: string) => {
        if (formData.realmTiers.length > 1) { // Keep at least one tier
            setFormData(prev => ({ ...prev, realmTiers: prev.realmTiers.filter(tier => tier.id !== id) }));
        }
    };

    // --- Suggestion Functions ---
    const handleGenreSuggestion = async () => {
        if (!isAiReady || !ai) {
            setSuggestionError(apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra thiết lập API Key.");
            return;
        }
        if (suggestionLock.current) return;
        suggestionLock.current = true;
        setIsAnySuggestionLoading(true);
        setLoadingStates(prev => ({ ...prev, genre: true }));
        setSuggestionError(null);
        const prompt = 'Gợi ý 5 chủ đề/bối cảnh độc đáo cho game phiêu lưu văn bản, phong cách tiểu thuyết mạng. BẮT BUỘC 100% tiếng Việt, KHÔNG dùng tiếng Anh. Mỗi cái trên một dòng.';
        
        try {
            const response = await ai.models.generateContent({
                model: selectedModel,
                contents: prompt,
            });
            const text = response.text.trim();
            const suggestions = text.split('\n').map(s => s.replace(/^[*-]\s*/, '').trim()).filter(Boolean);
            setGenreSuggestions(suggestions);
            setIsGenreModalOpen(true);
        } catch (error) {
            console.error('Error generating genre suggestions:', error);
            setSuggestionError("Gặp lỗi khi tạo gợi ý. Vui lòng kiểm tra API Key và thử lại.");
            setGenreSuggestions([]);
        } finally {
            suggestionLock.current = false;
            setIsAnySuggestionLoading(false);
            setLoadingStates(prev => ({ ...prev, genre: false }));
        }
    };

    const handleWorldDetailSuggestion = async () => {
        if (!isAiReady || !ai) {
            setSuggestionError(apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra thiết lập API Key.");
            return;
        }
        if (suggestionLock.current) return;
        suggestionLock.current = true;
        setIsAnySuggestionLoading(true);
        setLoadingStates(prev => ({ ...prev, worldDetail: true }));
        setSuggestionError(null);

        const prompt = `Dựa trên thể loại "${formData.genre}" và ý tưởng "${formData.worldDetail}", hãy viết một bối cảnh thế giới chi tiết và hấp dẫn (khoảng 3-5 dòng) theo văn phong tiểu thuyết mạng Trung Quốc. Bối cảnh cần khơi gợi sự tò mò và giới thiệu một xung đột hoặc yếu tố đặc biệt của thế giới. 

QUAN TRỌNG: BẮT BUỘC 100% tiếng Việt, TUYỆT ĐỐI KHÔNG dùng tiếng Anh.

Ví dụ: "Giang Hồ hiểm ác đầy rẫy anh hùng hảo hán và ma đầu tàn bạo, nơi công pháp và bí tịch quyết định tất cả, hệ thống cho phép bạn đoạt lấy nội lực, kinh nghiệm chiến đấu từ các cao thủ chính tà, khiến bạn phải ẩn mình giữa vô vàn ân oán giang hồ và lựa chọn giữa chính đạo giả tạo hay ma đạo tàn khốc."`;
        
        try {
            const response = await ai.models.generateContent({
                model: selectedModel,
                contents: prompt,
            });
            const text = response.text.trim();
            setFormData(prev => ({ ...prev, worldDetail: text }));
        } catch (error: any) {
            console.error(`Error generating suggestion for world detail:`, error);
            if (error.toString().includes('429')) {
                setSuggestionError("Bạn đã gửi yêu cầu quá nhanh. Vui lòng chờ một lát rồi thử lại.");
            } else {
                setSuggestionError("Gặp lỗi khi tạo gợi ý. Vui lòng kiểm tra API Key và thử lại.");
            }
        } finally {
            suggestionLock.current = false;
            setIsAnySuggestionLoading(false);
            setLoadingStates(prev => ({ ...prev, worldDetail: false }));
        }
    };

    const handleCharacterSuggestion = async () => {
        if (!isAiReady || !ai) {
            setSuggestionError(apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra thiết lập API Key.");
            return;
        }
        if (suggestionLock.current) return;
        suggestionLock.current = true;
        setIsAnySuggestionLoading(true);
        setLoadingStates(prev => ({ ...prev, character: true }));
        setSuggestionError(null);

        const finalPersonality = formData.customPersonality || formData.personalityFromList;
        const prompt = `Dựa trên thông tin nhân vật sau, hãy tạo một tiểu sử và kỹ năng khởi đầu phù hợp cho game nhập vai văn bản:
- Tên nhân vật (do người dùng đặt): '${formData.characterName || 'Chưa có'}'
- Tuổi: '${formData.characterAge || 'Chưa có'}'
- Dung mạo: '${formData.characterAppearance || 'Chưa có'}'
- Tên truyện: '${formData.storyName || 'Chưa có'}'
- Thể loại: '${formData.genre || 'Chưa có'}'
- Bối cảnh: '${formData.worldDetail || 'Chưa có'}'
- Giới tính: '${formData.gender}'
- Tính cách: '${finalPersonality || 'Chưa có'}'
Vui lòng tạo ra một tiểu sử ngắn (2-3 câu) và một kỹ năng khởi đầu phù hợp. KHÔNG được thay đổi tên nhân vật. Văn phong cần giống tiểu thuyết mạng. 

QUAN TRỌNG: BẮT BUỘC sử dụng 100% tiếng Việt. TUYỆT ĐỐI KHÔNG dùng tiếng Anh. Trả về kết quả dưới dạng JSON với hai khóa: "bio" và "skill".`;
        
        const characterSuggestionSchema = {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING, description: 'Tiểu sử nhân vật gợi ý (2-3 câu, BẮT BUỘC 100% tiếng Việt, KHÔNG dùng tiếng Anh).' },
            skill: { type: Type.STRING, description: 'Kỹ năng khởi đầu gợi ý (BẮT BUỘC 100% tiếng Việt, KHÔNG dùng tiếng Anh).' }
          },
          required: ['bio', 'skill']
        };

        try {
            const response = await ai.models.generateContent({
                model: selectedModel,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: characterSuggestionSchema,
                }
            });
            const responseText = response.text.trim();
            const suggestions = JSON.parse(responseText);
            
            setFormData(prev => ({ 
                ...prev, 
                bio: suggestions.bio || '',
                startSkills: suggestions.skill ? [{ name: suggestions.skill, description: '', mastery: '' }] : [{ name: '', description: '', mastery: '' }]
            }));
        } catch (error: any) {
            console.error('Error generating character suggestions:', error);
            if (error.toString().includes('429')) {
                 setSuggestionError("Bạn đã gửi yêu cầu quá nhanh. Vui lòng chờ một lát rồi thử lại.");
            } else {
                setSuggestionError("Gặp lỗi khi tạo gợi ý nhân vật. Vui lòng kiểm tra API Key và thử lại.");
            }
        } finally {
            suggestionLock.current = false;
            setIsAnySuggestionLoading(false);
            setLoadingStates(prev => ({ ...prev, character: false }));
        }
    };
    
    // --- File I/O Functions ---
    const handleSaveSettings = () => {
        const jsonString = JSON.stringify(formData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `AI-RolePlay-WorldSetup-${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleLoadSettingsClick = () => {
        settingsFileInputRef.current?.click();
    };

    const handleLoadSettingsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedData = JSON.parse(text);
                    if (loadedData.storyName !== undefined && loadedData.characterName !== undefined && loadedData.bio !== undefined) {
                        const newFormData: FormData = {
                            ...formData, 
                            ...loadedData,
                            customRules: loadedData.customRules || [], // Ensure customRules is an array
                            startLocation: loadedData.startLocation || '', // Backward compatibility
                            customStartLocation: loadedData.customStartLocation || '', // Backward compatibility
                            expName: loadedData.expName || 'Kinh Nghiệm', // Backward compatibility
                            realmTiers: loadedData.realmTiers || [
                                { id: '1', name: 'Luyện Khí', requiredExp: 0 },
                                { id: '2', name: 'Trúc Cơ', requiredExp: 100 }
                            ], // Backward compatibility
                            startSkills: loadedData.startSkills ? loadedData.startSkills.map((skill: any) => ({
                                name: skill.name || '',
                                description: skill.description || '',
                                mastery: skill.mastery || '' // Backward compatibility - add mastery field if missing
                            })) : [{ name: '', description: '', mastery: '' }], // Backward compatibility
                        };
                        setFormData(newFormData);
                        alert('Đã tải thiết lập thành công!');
                    } else {
                        throw new Error('Tệp không chứa dữ liệu thiết lập hợp lệ.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải tệp thiết lập:', error);
                alert('Không thể đọc tệp thiết lập. Tệp có thể bị hỏng hoặc không đúng định dạng.');
            }
        };
        reader.readAsText(file);
    
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleSaveRulesToFile = () => {
        if (formData.customRules.length === 0) {
            alert("Không có luật nào để lưu.");
            return;
        }
        const jsonString = JSON.stringify(formData.customRules, null, 2);
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
        rulesFileInputRef.current?.click();
    };
    
    const handleLoadRulesFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedRules: CustomRule[] = JSON.parse(text);
                    
                    if (Array.isArray(loadedRules) && loadedRules.every(r => typeof r === 'object' && r !== null && 'id' in r && 'content' in r && 'isActive' in r)) {
                        const existingIds = new Set(formData.customRules.map(r => r.id));
                        const rulesToAdd: CustomRule[] = [];
                        
                        loadedRules.forEach(loadedRule => {
                            if (existingIds.has(loadedRule.id)) {
                                rulesToAdd.push({ ...loadedRule, id: `${Date.now()}-${Math.random()}` });
                            } else {
                                rulesToAdd.push(loadedRule);
                            }
                        });

                        setFormData(prev => ({...prev, customRules: [...prev.customRules, ...rulesToAdd]}));
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

    const handleLoadWorldSetupClick = () => {
        worldSetupFileInputRef.current?.click();
    };
    
    const handleLoadWorldSetupFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const worldSetupData = JSON.parse(text);
                    
                    // Validate WorldSetup structure
                    if (worldSetupData.worldData && worldSetupData.customRules && Array.isArray(worldSetupData.customRules)) {
                        const { worldData, customRules } = worldSetupData;
                        
                        // Merge the worldData with current formData, preserving the structure
                        const updatedFormData: FormData = {
                            ...formData,
                            // Import worldData fields
                            storyName: worldData.storyName || formData.storyName,
                            genre: worldData.genre || formData.genre,
                            worldName: worldData.worldName || formData.worldName,
                            worldDescription: worldData.worldDescription || formData.worldDescription,
                            worldDetail: worldData.worldDetail || formData.worldDetail,
                            worldTime: worldData.worldTime || formData.worldTime,
                            startLocation: worldData.startLocation || formData.startLocation,
                            customStartLocation: worldData.customStartLocation || formData.customStartLocation,
                            expName: worldData.expName || formData.expName,
                            realmTiers: worldData.realmTiers || formData.realmTiers,
                            writingStyle: worldData.writingStyle || formData.writingStyle,
                            difficulty: worldData.difficulty || formData.difficulty,
                            allowNsfw: worldData.allowNsfw !== undefined ? worldData.allowNsfw : formData.allowNsfw,
                            // Keep existing character data or use imported if available
                            characterName: worldData.characterName || formData.characterName,
                            characterAge: worldData.characterAge || formData.characterAge,
                            characterAppearance: worldData.characterAppearance || formData.characterAppearance,
                            customPersonality: worldData.customPersonality || formData.customPersonality,
                            personalityFromList: worldData.personalityFromList || formData.personalityFromList,
                            gender: worldData.gender || formData.gender,
                            bio: worldData.bio || formData.bio,
                            startSkills: worldData.startSkills || formData.startSkills,
                            addGoal: worldData.addGoal !== undefined ? worldData.addGoal : formData.addGoal,
                            // Import custom rules
                            customRules: customRules
                        };

                        setFormData(updatedFormData);
                        alert(`Đã tải thành công WorldSetup: "${worldData.storyName || 'Unnamed'}" với ${customRules.length} luật tùy chỉnh.`);
                    } else {
                        throw new Error('Định dạng WorldSetup không hợp lệ. Cần có worldData và customRules.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải WorldSetup:', error);
                alert('Không thể đọc tệp WorldSetup. Tệp có thể bị hỏng hoặc không đúng định dạng.');
            }
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };

    // Wrapper function to handle start game with progress
    const handleStartGameWithProgress = async () => {
        try {
            await onStartGame(formData);
        } catch (error) {
            console.error('Error starting game:', error);
        }
    };

    const personalityOptions = ["Tùy Tâm Sở Dục","Điềm Đạm", "Nhiệt Huyết", "Vô Sỉ", "Nhẹ Nhàng", "Cơ Trí", "Lãnh Khốc", "Kiêu Ngạo", "Ngu Ngốc", "Giảo Hoạt"];
    
    const renderTabContent = () => {
        if (activeTab === 'knowledge') {
            return (
                <div className="space-y-4">
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        Thêm luật lệ, vật phẩm, nhân vật, hoặc bất kỳ thông tin nào bạn muốn AI tuân theo ngay từ đầu.
                        <br/>
                        Ví dụ: "Tạo ra một thanh kiếm tên là 'Hỏa Long Kiếm' có khả năng phun lửa."
                    </p>
                     {formData.customRules.map((rule, index) => (
                        <div key={rule.id} className="bg-slate-200/50 dark:bg-[#373c5a]/50 p-3 rounded-lg border border-slate-300 dark:border-slate-600 space-y-2">
                             <textarea
                                value={rule.content}
                                onChange={(e) => handleRuleChange(rule.id, e.target.value)}
                                placeholder={`Nội dung luật #${index + 1}...`}
                                className="w-full h-24 bg-slate-100 dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
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
                    {formData.customRules.length === 0 && <p className="text-center text-slate-600 dark:text-slate-400 italic py-4">Chưa có luật lệ tùy chỉnh nào.</p>}
                     <button onClick={handleAddRule} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Thêm Luật Mới
                    </button>
                    <div className="flex items-center space-x-2 pt-4 border-t border-slate-300 dark:border-slate-700">
                         <button onClick={handleSaveRulesToFile} className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <SaveIcon className="w-4 h-4"/> Lưu Bộ Luật
                        </button>
                        <button onClick={handleLoadRulesClick} className="px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <FileIcon className="w-4 h-4"/> Tải Bộ Luật
                        </button>
                    </div>
                </div>
            );
        }

        // Default to context tab
        return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Story Context Card */}
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-400/20 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-500/20 rounded-xl">
                            <BookOpenIcon className="w-6 h-6 text-pink-300" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Bối Cảnh Truyện</h2>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="storyName" className="block text-sm font-medium text-white/90">
                            Tên Truyện
                        </label>
                        <input 
                            id="storyName" 
                            name="storyName" 
                            type="text" 
                            value={formData.storyName} 
                            onChange={handleInputChange} 
                            placeholder="VD: Truyền Thuyết Thần Kiếm, Đại Đạo Tranh Phong..." 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="genre" className="block text-sm font-medium text-white/90">
                            Thể Loại
                        </label>
                        <div className="flex gap-2">
                            <input 
                                id="genre" 
                                name="genre" 
                                type="text" 
                                value={formData.genre} 
                                onChange={handleInputChange} 
                                placeholder="VD: Tiên hiệp, Huyền huyễn, Kiếm hiệp..." 
                                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                            />
                            <button
                                onClick={handleGenreSuggestion}
                                disabled={isAnySuggestionLoading}
                                className="px-4 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-400/30 rounded-xl text-pink-200 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                            >
                                {loadingStates.genre ? (
                                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                                ) : (
                                    <SparklesIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="worldDetail" className="block text-sm font-medium text-white/90">
                            Thế Giới/Bối Cảnh Chi Tiết
                        </label>
                        <div className="flex gap-2">
                            <textarea 
                                id="worldDetail" 
                                name="worldDetail" 
                                value={formData.worldDetail} 
                                onChange={handleInputChange} 
                                placeholder="VD: Đại Lục Phong Vân, nơi tu tiên giả tranh đấu..." 
                                rows={4} 
                                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-none"
                            />
                            <button
                                onClick={handleWorldDetailSuggestion}
                                disabled={isAnySuggestionLoading}
                                className="px-4 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-400/30 rounded-xl text-pink-200 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm self-start"
                            >
                                {loadingStates.worldDetail ? (
                                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                                ) : (
                                    <SparklesIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/90">
                            Thời Gian Bắt Đầu
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-white/70 mb-1">Ngày</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="30" 
                                    value={formData.worldTime.day} 
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        worldTime: { ...prev.worldTime, day: parseInt(e.target.value) || 1 } 
                                    }))} 
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/70 mb-1">Tháng</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="12" 
                                    value={formData.worldTime.month} 
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        worldTime: { ...prev.worldTime, month: parseInt(e.target.value) || 1 } 
                                    }))} 
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/70 mb-1">Năm</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={formData.worldTime.year} 
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        worldTime: { ...prev.worldTime, year: parseInt(e.target.value) || 1000 } 
                                    }))} 
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 text-center"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/90">
                            Địa điểm bắt đầu
                        </label>
                        <select 
                            name="startLocation" 
                            value={formData.startLocation} 
                            onChange={handleInputChange}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                        >
                            <option value="" className="bg-slate-800 text-white">Chọn địa điểm bắt đầu...</option>
                            <option value="Hoang dã ngẫu nhiên" className="bg-slate-800 text-white">Hoang dã</option>
                            <option value="Thôn, Làng ngẫu nhiên" className="bg-slate-800 text-white">Thôn, Làng</option>
                            <option value="Thành Thị ngẫu nhiên" className="bg-slate-800 text-white">Thành Thị</option>
                            <option value="Một địa điểm bất kì" className="bg-slate-800 text-white">Ngẫu Nhiên</option>
                            <option value="Tuỳ chọn" className="bg-slate-800 text-white">Tuỳ chọn</option>
                        </select>
                        {formData.startLocation === 'Tuỳ chọn' && (
                            <input 
                                id="customStartLocation"
                                name="customStartLocation"
                                type="text" 
                                value={formData.customStartLocation} 
                                onChange={handleInputChange}
                                placeholder="Nhập địa điểm tùy chọn..."
                                className="w-full mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/90">
                            Thiết Lập Hệ Thống Cảnh Giới
                        </label>
                        
                        {/* Experience Name */}
                        <div className="space-y-2">
                            <label className="block text-xs text-white/70">Tên Đơn Vị Kinh Nghiệm</label>
                            <input 
                                type="text" 
                                value={formData.expName} 
                                onChange={handleExpNameChange}
                                placeholder="VD: Linh Lực, Chakra, Ma Lực..." 
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                            />
                        </div>

                        {/* Realm Tiers */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs text-white/70">Các Cảnh Giới</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddRealmTier}
                                        className="w-6 h-6 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 hover:border-green-400/50 rounded text-green-200 hover:text-white transition-all duration-300 flex items-center justify-center text-sm font-bold"
                                        title="Thêm cảnh giới"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            {formData.realmTiers.map((tier, index) => (
                                <div key={tier.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/60">Cảnh Giới {index + 1}</span>
                                        {formData.realmTiers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRealmTier(tier.id)}
                                                className="w-5 h-5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded text-red-200 hover:text-white transition-all duration-300 flex items-center justify-center text-xs font-bold"
                                                title="Xóa cảnh giới"
                                            >
                                                -
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Tên Cảnh Giới</label>
                                            <input 
                                                type="text" 
                                                value={tier.name} 
                                                onChange={(e) => handleRealmTierChange(tier.id, 'name', e.target.value)}
                                                placeholder="VD: Luyện Khí, Trúc Cơ..." 
                                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded py-1.5 px-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/20 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">{formData.expName} Cần Thiết</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={tier.requiredExp} 
                                                onChange={(e) => handleRealmTierChange(tier.id, 'requiredExp', parseInt(e.target.value) || 0)}
                                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded py-1.5 px-2 text-white text-sm focus:outline-none focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/20 transition-all duration-300"
                                                disabled={index === 0} // First tier is always 0
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Character Card */}
                <div className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 backdrop-blur-sm border border-sky-400/20 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-500/20 rounded-xl">
                            <UserIcon className="w-6 h-6 text-sky-300" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Nhân Vật Chính</h2>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="characterName" className="block text-sm font-medium text-white/90">
                            Danh Xưng/Tên
                        </label>
                        <input 
                            id="characterName" 
                            name="characterName" 
                            type="text" 
                            value={formData.characterName} 
                            onChange={handleInputChange} 
                            placeholder="VD: Diệp Phàm, Hàn Lập..." 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="characterAge" className="block text-sm font-medium text-white/90">
                                Tuổi
                            </label>
                            <input 
                                id="characterAge" 
                                name="characterAge" 
                                type="text" 
                                value={formData.characterAge} 
                                onChange={handleInputChange} 
                                placeholder="VD: 20 tuổi, Thanh niên..." 
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="characterAppearance" className="block text-sm font-medium text-white/90">
                                Dung mạo
                            </label>
                            <input 
                                id="characterAppearance" 
                                name="characterAppearance" 
                                type="text" 
                                value={formData.characterAppearance} 
                                onChange={handleInputChange} 
                                placeholder="VD: Cao ráo, mắt sắc sảo..." 
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/90">
                            Tính Cách
                        </label>
                        <div className="space-y-2">
                            {!formData.customPersonality && (
                                <select 
                                    name="personalityFromList" 
                                    value={formData.personalityFromList} 
                                    onChange={handleInputChange}
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                                >
                                    <option value="" className="bg-slate-800 text-white">Chọn tính cách có sẵn...</option>
                                    {personalityOptions.map(p => <option key={p} value={p} className="bg-slate-800 text-white">{p}</option>)}
                                </select>
                            )}
                            <input 
                                id="customPersonality" 
                                name="customPersonality" 
                                type="text" 
                                value={formData.customPersonality} 
                                onChange={handleInputChange} 
                                placeholder="Hoặc nhập tính cách của bạn (VD: Lạnh lùng)" 
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/90">
                            Giới Tính
                        </label>
                        <select 
                            name="gender" 
                            value={formData.gender} 
                            onChange={handleInputChange}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                        >
                            <option value="ai_decides" className="bg-slate-800 text-white">Để AI quyết định</option>
                            <option value="Nam" className="bg-slate-800 text-white">Nam</option>
                            <option value="Nữ" className="bg-slate-800 text-white">Nữ</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-white/90">
                            Sơ Lược Tiểu Sử
                        </label>
                        <textarea 
                            id="bio" 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleInputChange} 
                            placeholder="VD: Một phế vật mang huyết mạch thượng cổ..." 
                            rows={3} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300 resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="addGoal" className="block text-sm font-medium text-white/90">
                            Mục Tiêu <span className="text-white/50">(Tùy chọn)</span>
                        </label>
                        <textarea 
                            id="addGoal" 
                            name="addGoal" 
                            value={formData.addGoal} 
                            onChange={handleInputChange} 
                            placeholder="VD: Trở thành cao thủ võ lâm, tìm lại ký ức bị mất..." 
                            rows={2} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300 resize-none"
                        />
                        <p className="text-xs text-white/50">Mục tiêu và động lực của nhân vật trong hành trình.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/90">
                            Kỹ Năng Khởi Đầu <span className="text-white/50">(Tùy chọn)</span>
                        </label>
                        {formData.startSkills.map((skill, index) => (
                            <div key={index} className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white/90">Kỹ năng {index + 1}</span>
                                    <div className="flex gap-2">
                                        {formData.startSkills.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSkills = formData.startSkills.filter((_, i) => i !== index);
                                                    setFormData(prev => ({ ...prev, startSkills: newSkills }));
                                                }}
                                                className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-md flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <span className="text-sm font-bold">−</span>
                                            </button>
                                        )}
                                        {index === formData.startSkills.length - 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSkills = [...formData.startSkills, { name: '', description: '', mastery: '' }];
                                                    setFormData(prev => ({ ...prev, startSkills: newSkills }));
                                                }}
                                                className="w-6 h-6 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-md flex items-center justify-center text-green-400 hover:text-green-300 transition-colors"
                                            >
                                                <span className="text-sm font-bold">+</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-white/70 mb-1">
                                                Tên kỹ năng
                                            </label>
                                            <input 
                                                type="text" 
                                                value={skill.name} 
                                                onChange={(e) => {
                                                    const newSkills = [...formData.startSkills];
                                                    newSkills[index].name = e.target.value;
                                                    setFormData(prev => ({ ...prev, startSkills: newSkills }));
                                                }}
                                                placeholder="VD: Thuật ẩn thân" 
                                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-3 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-white/70 mb-1">
                                                Mô tả
                                            </label>
                                            <input 
                                                type="text" 
                                                value={skill.description} 
                                                onChange={(e) => {
                                                    const newSkills = [...formData.startSkills];
                                                    newSkills[index].description = e.target.value;
                                                    setFormData(prev => ({ ...prev, startSkills: newSkills }));
                                                }}
                                                placeholder="VD: Có thể ẩn mình trong bóng tối" 
                                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-3 text-white placeholder-white/50 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-white/70 mb-1">
                                            Mức độ thành thạo
                                        </label>
                                        <select
                                            value={skill.mastery} 
                                            onChange={(e) => {
                                                const newSkills = [...formData.startSkills];
                                                newSkills[index].mastery = e.target.value;
                                                setFormData(prev => ({ ...prev, startSkills: newSkills }));
                                            }}
                                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                                        >
                                            <option value="" className="bg-slate-800 text-white">Chọn mức độ...</option>
                                            <option value="Sơ Cấp" className="bg-slate-800 text-white">Sơ Cấp</option>
                                            <option value="Trung Cấp" className="bg-slate-800 text-white">Trung Cấp</option>
                                            <option value="Cao Cấp" className="bg-slate-800 text-white">Cao Cấp</option>
                                            <option value="Đại Thành" className="bg-slate-800 text-white">Đại Thành</option>
                                            <option value="Viên Mãn" className="bg-slate-800 text-white">Viên Mãn</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-white/50">Gợi ý cho AI về loại kỹ năng người muốn bắt đầu.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCharacterSuggestion}
                        disabled={isAnySuggestionLoading || !isAiReady}
                        className="group w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 border border-sky-400/30 hover:border-sky-400/50 rounded-xl text-sky-200 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                        {loadingStates.character ? (
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                        ) : (
                            <SparklesIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="font-medium">Gợi Ý Tiểu sử & Kỹ năng</span>
                    </button>
                </div>

                {/* Additional Settings */}
                <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Writing Style Card */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-500/20 rounded-xl">
                                <PencilIcon className="w-5 h-5 text-yellow-300" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Phong cách viết</h3>
                        </div>
                        <select 
                            name="writingStyle" 
                            value={formData.writingStyle} 
                            onChange={handleInputChange}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                        >
                            <option value="second_person" className="bg-slate-800 text-white">Ngôi thứ hai - "Ngươi" là nhân vật chính</option>
                            <option value="first_person" className="bg-slate-800 text-white">Ngôi thứ nhất - Nhân vật chính xưng "Ta/Tôi"</option>
                        </select>
                    </div>

                    {/* Difficulty & Content Card */}
                    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-400/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-xl">
                                <DiamondIcon className="w-5 h-5 text-red-300" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Độ Khó & Nội Dung</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-2">Chọn Độ Khó:</label>
                                <select 
                                    name="difficulty" 
                                    value={formData.difficulty} 
                                    onChange={handleInputChange}
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-400/50 focus:ring-2 focus:ring-red-400/20 transition-all duration-300"
                                >
                                    <option value="easy" className="bg-slate-800 text-white">Dễ - Tạo ra cho đủ số thôi</option>
                                    <option value="normal" className="bg-slate-800 text-white">Thường - Cân bằng, phù hợp đa số</option>
                                    <option value="hard" className="bg-slate-800 text-white">Khó - Thử thách cao, Muốn ăn hành</option>
                                </select>
                            </div>
                            <div className="flex items-start gap-3">
                                <input 
                                    id="allowNsfw" 
                                    name="allowNsfw" 
                                    type="checkbox" 
                                    checked={formData.allowNsfw} 
                                    onChange={handleInputChange} 
                                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-red-500 focus:ring-red-400/50"
                                />
                                <div>
                                    <label htmlFor="allowNsfw" className="text-sm text-white/90 font-medium">
                                        Cho phép nội dung 18+ (Cực kỳ chi tiết)
                                    </label>
                                    <p className="text-xs text-white/60 mt-1">
                                        Khi được chọn, AI sẽ kể câu chuyện có tình tiết 18+ (có yếu tố bạo lực) và hành động tùy ý nsfw.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const themeColors = getThemeColors(gameSettings.themeColor);
    
    return (
        <div className={`min-h-screen bg-gradient-to-br ${themeColors.primary} relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-50">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>
            
            {/* Floating Orbs */}
            <div className={`absolute top-20 left-20 w-32 h-32 bg-${themeColors.text.split('-')[0]}-500/20 rounded-full blur-xl animate-pulse`}></div>
            <div className={`absolute bottom-20 right-20 w-48 h-48 bg-${themeColors.text.split('-')[0]}-400/10 rounded-full blur-2xl animate-pulse delay-1000`}></div>
            <div className={`absolute top-1/2 left-1/4 w-24 h-24 bg-${themeColors.text.split('-')[0]}-600/15 rounded-full blur-xl animate-pulse delay-500`}></div>
            
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border-b border-white/10 p-6">
                        <input
                            type="file"
                            ref={settingsFileInputRef}
                            onChange={handleLoadSettingsFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <input
                            type="file"
                            ref={rulesFileInputRef}
                            onChange={handleLoadRulesFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <input
                            type="file"
                            ref={worldSetupFileInputRef}
                            onChange={handleLoadWorldSetupFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        
                        <div className="flex justify-between items-center mb-6">
                            <button 
                                onClick={onBack} 
                                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 backdrop-blur-sm text-white"
                            >
                                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Về Trang Chủ</span>
                            </button>
                            
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={handleSaveSettings} 
                                    className="group flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-100 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <SaveIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">Lưu Thiết Lập</span>
                                </button>
                                <button 
                                    onClick={handleLoadSettingsClick} 
                                    className="group flex items-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 rounded-xl border border-sky-400/30 hover:border-sky-400/50 text-sky-100 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <FileIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">Tải Thiết Lập</span>
                                </button>
                                <button 
                                    onClick={handleLoadWorldSetupClick} 
                                    className="group flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-100 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <DocumentAddIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">Nhập WorldSetup</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-3">
                                Kiến Tạo Thế Giới
                            </h1>
                            <p className="text-white/70 text-lg">Xây dựng thế giới RPG độc đáo của riêng bạn</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 m-6 mb-0">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveTab('context')}
                                className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                                    activeTab === 'context' 
                                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-400/50 shadow-lg' 
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <BookOpenIcon className="w-5 h-5 inline mr-2" />
                                Bối Cảnh Thế Giới
                            </button>
                            <button 
                                onClick={() => setActiveTab('knowledge')}
                                className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                                    activeTab === 'knowledge' 
                                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-400/50 shadow-lg' 
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <SparklesIcon className="w-5 h-5 inline mr-2" />
                                Tri Thức
                            </button>
                        </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6">
                        {renderTabContent()}
                    </div>

                    {/* Footer Section */}
                    <div className="mt-8 border-t border-white/10 pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            {suggestionError && (
                                <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-xl p-4 max-w-lg w-full">
                                    <p className="text-red-300 text-sm text-center font-medium">{suggestionError}</p>
                                </div>
                            )}
                            
                            <button 
                                onClick={handleStartGameWithProgress}
                                disabled={!isAiReady || isInitializing}
                                className="group w-full max-w-lg bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/40 hover:to-teal-500/40 border border-emerald-400/40 hover:border-emerald-400/60 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-2xl shadow-2xl text-lg transition-all duration-300 disabled:from-slate-500/20 disabled:to-slate-600/20 disabled:border-slate-500/30 disabled:cursor-not-allowed disabled:text-white/50 transform hover:scale-[1.02] hover:shadow-emerald-500/25"
                            >
                                {isInitializing ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang khởi tạo thế giới...</span>
                                    </div>
                                ) : isAiReady ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                        <span>Khởi Tạo Thế Giới</span>
                                        <SparklesIcon className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <ExclamationIcon className="w-6 h-6" />
                                        <span>AI chưa sẵn sàng</span>
                                    </div>
                                )}
                            </button>
                            
                            <p className="text-white/50 text-sm text-center max-w-lg">
                                Nhấn nút trên để bắt đầu cuộc phiêu lưu RPG của bạn với AI
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <SuggestionModal
                isOpen={isGenreModalOpen}
                onClose={() => setIsGenreModalOpen(false)}
                suggestions={genreSuggestions}
                onSelect={(suggestion) => {
                    setFormData(prev => ({ ...prev, genre: suggestion }));
                    setIsGenreModalOpen(false);
                }}
                title="Gợi ý thể loại"
            />
        </div>
    );
}