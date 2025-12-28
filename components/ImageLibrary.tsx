
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ImageLibraryItem } from '../types';
import { generateAIDescriptionForImage, generateAITagsForImage, generateImage } from '../services/geminiService';
import { useGame } from '../contexts/GameContext';

const AILoadingIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`animate-spin ${className || 'h-5 w-5'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const ImageLibrary: React.FC = () => {
    const { imageLibrary: library, handleUpdateImageLibrary: onUpdateLibrary, handleBackToMenu: onClose } = useGame();
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isMonster, setIsMonster] = useState(false);
    const [filter, setFilter] = useState('');
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isAIDescLoading, setIsAIDescLoading] = useState(false);
    const [isAITagsLoading, setIsAITagsLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);


    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setUrl('');
        setDescription('');
        setTags('');
        setIsMonster(false);
        setError('');
    };

    const handleAddImage = (e: React.FormEvent) => {
        e.preventDefault();
        setNotification('');
        setError('');
        if (!url.trim()) {
            setError('URL Ảnh không được để trống.');
            return;
        }
        setIsAdding(true);
        const newImage: ImageLibraryItem = {
            id: crypto.randomUUID(),
            url,
            description,
            tags: tags.split(';').map(t => t.trim()).filter(Boolean),
            isMonster,
        };
        onUpdateLibrary([newImage, ...library]);
        setNotification(`Đã thêm ảnh thành công.`);
        resetForm();
        setIsAdding(false);
    };
    
    const handleGenerateDesc = async () => {
        if (!url.trim()) {
            setError('Vui lòng nhập URL ảnh trước khi dùng AI.');
            return;
        }
        setIsAIDescLoading(true);
        setError('');
        setNotification('');
        const result = await generateAIDescriptionForImage(url);
        if (result.description) {
            setDescription(result.description);
        } else {
            setError(result.error || 'Đã có lỗi xảy ra.');
        }
        setIsAIDescLoading(false);
    };

    const handleGenerateTags = async () => {
        if (!url.trim()) {
            setError('Vui lòng nhập URL ảnh trước khi dùng AI.');
            return;
        }
        setIsAITagsLoading(true);
        setError('');
        setNotification('');
        const result = await generateAITagsForImage(url, description);
        if (result.tags) {
            setTags(result.tags.join('; '));
        } else {
            setError(result.error || 'Đã có lỗi xảy ra.');
        }
        setIsAITagsLoading(false);
    };

    const handleGenerateImage = async () => {
        if (!aiPrompt.trim()) {
            setError('Vui lòng nhập mô tả để tạo ảnh.');
            return;
        }
        setIsGeneratingImage(true);
        setError('');
        setNotification('');
        const result = await generateImage(aiPrompt);
        if (result.imageUrl) {
            const newImage: ImageLibraryItem = {
                id: crypto.randomUUID(),
                url: result.imageUrl,
                description: aiPrompt, // Use prompt as initial description
                tags: ['ai-generated'],
                isMonster: false,
            };
            onUpdateLibrary([newImage, ...library]);
            setNotification('Tạo ảnh thành công! Ảnh đã được thêm vào đầu thư viện.');
            // Populate form for easy saving
            setUrl(result.imageUrl);
            setDescription(aiPrompt);
            setTags('ai-generated');
            setAiPrompt('');
        } else {
            setError(result.error || 'Lỗi không xác định khi tạo ảnh.');
        }
        setIsGeneratingImage(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa ảnh này khỏi thư viện?')) {
            onUpdateLibrary(library.filter(item => item.id !== id));
            setNotification('Đã xóa ảnh khỏi thư viện.');
            setError('');
        }
    };

    const handleExport = () => {
        setNotification('');
        setError('');
        if (library.length === 0) {
            setError("Thư viện đang trống. Không có gì để xuất ra file.");
            return;
        }
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(library, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "image_library.json";
        link.click();
        setNotification(`Đã xuất thư viện thành công vào file image_library.json.`);
    };
    
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotification('');
        setError('');
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedLibrary = JSON.parse(event.target?.result as string);
                if (Array.isArray(importedLibrary)) {
                    // Basic validation
                    const validItems = importedLibrary.filter(item => item.id && item.url && typeof item.description === 'string' && Array.isArray(item.tags));
                    onUpdateLibrary([...validItems, ...library]);
                    setNotification(`${validItems.length} ảnh đã được nhập thành công.`);
                } else {
                    setError('File JSON không hợp lệ.');
                }
            } catch (err) {
                setError('Không thể đọc file JSON.');
            }
        };
        reader.readAsText(file);
        
        if(e.target) e.target.value = '';
    };

    const filteredLibrary = useMemo(() => {
        if (!filter.trim()) return library;
        const lowercasedFilter = filter.toLowerCase();
        return library.filter(item => 
            item.description.toLowerCase().includes(lowercasedFilter) || 
            item.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter))
        );
    }, [library, filter]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-6xl text-white relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10">&times;</button>
                <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6 flex-shrink-0">Thư Viện Ảnh</h2>
                
                {notification && <div className="bg-green-800 text-green-200 p-3 rounded-lg mb-4 text-center animate-fade-in">{notification}</div>}
                {error && <div className="bg-red-800 text-red-200 p-3 rounded-lg mb-4 text-center animate-fade-in">{error}</div>}

                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                    <div className="md:col-span-1 bg-gray-800/50 p-4 rounded-lg flex flex-col space-y-4 overflow-y-auto">
                        <h3 className="text-xl font-semibold text-gray-300">Thêm / Tạo Ảnh</h3>

                        <div className="bg-gray-700/50 p-3 rounded-md">
                            <label htmlFor="ai-prompt" className="block text-sm font-medium mb-1">Tạo ảnh bằng AI</label>
                            <textarea id="ai-prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3} className="w-full bg-gray-800 p-2 rounded-md" placeholder="VD: một con rồng lửa trên đỉnh núi tuyết..."></textarea>
                            <button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 rounded-md py-2 flex items-center justify-center disabled:bg-gray-500">
                                {isGeneratingImage ? <AILoadingIcon /> : 'Tạo Ảnh'}
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddImage} className="space-y-4">
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium mb-1">URL Ảnh</label>
                                <input type="text" id="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-1">Mô tả</label>
                                <div className="relative">
                                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-gray-700 p-2 rounded-md"></textarea>
                                    <button type="button" onClick={handleGenerateDesc} disabled={isAIDescLoading} className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 rounded-md p-1 disabled:bg-gray-500">
                                        {isAIDescLoading ? <AILoadingIcon className="h-4 w-4" /> : 'AI ✨'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium mb-1">Thẻ (phân cách bởi ;)</label>
                                 <div className="relative">
                                    <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                                     <button type="button" onClick={handleGenerateTags} disabled={isAITagsLoading} className="absolute top-1/2 -translate-y-1/2 right-2 bg-blue-600 hover:bg-blue-700 rounded-md p-1 disabled:bg-gray-500">
                                        {isAITagsLoading ? <AILoadingIcon className="h-4 w-4" /> : 'AI ✨'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="isMonster" checked={isMonster} onChange={(e) => setIsMonster(e.target.checked)} className="h-4 w-4" />
                                <label htmlFor="isMonster" className="ml-2 text-sm">Là ảnh Quái vật?</label>
                            </div>
                            <button type="submit" disabled={isAdding} className="w-full bg-green-600 hover:bg-green-700 rounded-md py-2 disabled:bg-gray-500">
                                {isAdding ? 'Đang thêm...' : 'Thêm vào Thư viện'}
                            </button>
                        </form>
                    </div>

                    <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg flex flex-col">
                        <div className="flex-shrink-0 mb-4">
                            <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Tìm kiếm theo mô tả hoặc thẻ..." className="w-full bg-gray-700 p-2 rounded-md" />
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                             {filteredLibrary.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredLibrary.map(item => (
                                    <div key={item.id} className="group relative aspect-square">
                                        <img src={item.url} alt={item.description} className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-xs">
                                            <p className="text-gray-200 line-clamp-3">{item.description}</p>
                                            <button onClick={() => handleDelete(item.id)} className="self-end bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 pt-16">
                                    <p>Không có ảnh nào trong thư viện.</p>
                                </div>
                             )}
                        </div>
                         <div className="flex-shrink-0 mt-4 flex gap-2">
                            <button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-md py-2">Xuất file JSON</button>
                            <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-600 hover:bg-gray-700 rounded-md py-2">Nhập file JSON</button>
                            <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageLibrary;
