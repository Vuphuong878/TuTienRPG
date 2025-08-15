import React, { useState, useEffect, useMemo } from 'react';
import { callGeminiImageAPI } from './utils/geminiImageAPI';
import { generateImagePrompt } from '../App';

interface AutoImageGeneratorProps {
    storyText: string;
    characterName?: string;
    isNsfwEnabled?: boolean;
    isAutoGenerationEnabled: boolean;
    onToggleAutoGeneration: () => void;
    gameHistoryIndex: number; // Để làm key cache
    className?: string;
}

interface ImageCache {
    [key: string]: {
        imageUrl: string | null;
        error: string | null;
        timestamp: number;
    };
}

export const AutoImageGenerator: React.FC<AutoImageGeneratorProps> = ({
    storyText,
    characterName,
    isNsfwEnabled = false,
    isAutoGenerationEnabled,
    onToggleAutoGeneration,
    gameHistoryIndex,
    className = ''
}) => {
    const [imageCache, setImageCache] = useState<ImageCache>(() => {
        const saved = localStorage.getItem('rpg-image-cache');
        return saved ? JSON.parse(saved) : {};
    });
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Tạo cache key duy nhất cho mỗi story segment
    const cacheKey = useMemo(() => {
        const hash = btoa(encodeURIComponent(storyText)).slice(0, 16);
        return `${gameHistoryIndex}-${hash}`;
    }, [gameHistoryIndex, storyText]);
    
    const cachedData = imageCache[cacheKey];
    
    // Lưu cache vào localStorage
    useEffect(() => {
        localStorage.setItem('rpg-image-cache', JSON.stringify(imageCache));
    }, [imageCache]);
    
    // Tự động tạo ảnh khi auto generation được bật
    useEffect(() => {
        if (isAutoGenerationEnabled && !cachedData && !isGenerating && storyText.trim()) {
            generateImage();
        }
    }, [isAutoGenerationEnabled, cacheKey, storyText]);
    
    const generateImage = async () => {
        if (isGenerating || !storyText.trim()) return;
        
        setIsGenerating(true);
        
        try {
            const prompt = generateImagePrompt(storyText, characterName, isNsfwEnabled);
            const imageUrl = await callGeminiImageAPI(prompt);
            
            setImageCache(prev => ({
                ...prev,
                [cacheKey]: {
                    imageUrl,
                    error: null,
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error('Lỗi tạo ảnh:', error);
            setImageCache(prev => ({
                ...prev,
                [cacheKey]: {
                    imageUrl: null,
                    error: error instanceof Error ? error.message : 'Lỗi không xác định',
                    timestamp: Date.now()
                }
            }));
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleRetryGeneration = () => {
        // Xóa cache cũ và tạo lại
        setImageCache(prev => {
            const newCache = { ...prev };
            delete newCache[cacheKey];
            return newCache;
        });
        generateImage();
    };
    
    return (
        <div className={`auto-image-generator ${className}`}>
            {/* Toggle Button - Nằm cùng hàng với story text */}
            <div className="flex items-center gap-2 mb-2">
                <button
                    onClick={onToggleAutoGeneration}
                    className={`
                        px-3 py-1.5 rounded text-sm font-medium transition-all duration-200
                        ${isAutoGenerationEnabled 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        }
                    `}
                    title={isAutoGenerationEnabled ? 'Tắt tự động tạo ảnh' : 'Bật tự động tạo ảnh'}
                >
                    {isAutoGenerationEnabled ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12l-4-4h8l-4 4z"/>
                            <rect x="3" y="14" width="14" height="2" rx="1"/>
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                        </svg>
                    )}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isAutoGenerationEnabled ? 'Tự động tạo ảnh' : 'Tắt tạo ảnh'}
                </span>
            </div>
            
            {/* Image Display Area */}
            <div className="image-display-area">
                {isGenerating && (
                    <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Đang tạo ảnh...</span>
                    </div>
                )}
                
                {cachedData?.imageUrl && !isGenerating && (
                    <div className="generated-image-container">
                        <img
                            src={cachedData.imageUrl}
                            alt="AI Generated Scene"
                            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                            style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                            Ảnh được tạo bởi AI
                        </p>
                    </div>
                )}
                
                {cachedData?.error && !isGenerating && (
                    <div className="error-container p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-red-800 dark:text-red-200 font-medium">Lỗi tạo ảnh</h4>
                                <p className="text-red-600 dark:text-red-300 text-sm mt-1">{cachedData.error}</p>
                            </div>
                            {!isAutoGenerationEnabled && (
                                <button
                                    onClick={handleRetryGeneration}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium transition-colors"
                                    disabled={isGenerating}
                                >
                                    Tạo lại
                                </button>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Manual Generation Button - Chỉ hiện khi auto generation tắt và chưa có ảnh */}
                {!isAutoGenerationEnabled && !cachedData && !isGenerating && storyText.trim() && (
                    <div className="manual-generation p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <button
                            onClick={generateImage}
                            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                            </svg>
                            Tạo ảnh cho cảnh này
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
