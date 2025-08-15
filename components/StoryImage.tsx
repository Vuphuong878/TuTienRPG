/**
 * Simple Image Generator Component for RPG Stories
 */

import React, { useState, useEffect, useMemo } from 'react';

// Inline API function
const callImageAPI = async (prompt: string): Promise<string | null> => {
    const userKeys = localStorage.getItem('userApiKeys');
    let apiKey = '';
    
    if (userKeys) {
        const keys = JSON.parse(userKeys);
        const activeIndex = parseInt(localStorage.getItem('activeUserApiKeyIndex') || '0', 10);
        if (keys.length > 0 && keys[activeIndex]) {
            apiKey = keys[activeIndex];
        }
    }
    
    if (!apiKey) {
        const isUsingDefault = localStorage.getItem('isUsingDefaultKey') !== 'false';
        if (isUsingDefault) {
            apiKey = (window as any).__GEMINI_API_KEY__ || '';
        }
    }
    
    if (!apiKey) {
        throw new Error("API Key chưa được thiết lập");
    }

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const imagePart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (imagePart) {
        return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("Không tìm thấy dữ liệu hình ảnh");
};

// Simple prompt generator
const createImagePrompt = (storyText: string, characterName: string = '', isNsfw: boolean = false): string => {
    const baseStyle = "high-quality anime-style illustration, detailed character design, vibrant colors, professional digital art, studio lighting, cinematic composition, manga-inspired artwork, beautiful shading and highlights";
    const world = "fantasy medieval world with Asian martial arts influences, mystical atmosphere, ancient temples and pagodas, misty mountains, traditional architecture mixed with magical elements, ethereal lighting, spiritual energy auras";
    const character = "detailed character with expressive eyes, flowing hair, traditional martial arts clothing or fantasy robes, distinctive facial features, dynamic pose showing personality and mood";
    const effects = "glowing spiritual energy, swirling chi auras, mystical light effects, floating magical symbols, elemental powers visualization, energy trails, divine radiance, supernatural phenomena";
    const quality = "ugly, poorly drawn hands, text, watermark, signature, extra limbs, deformed anatomy, blurry, low quality, artifacts, distorted proportions, bad composition, oversaturated colors, noise, duplicate characters, inconsistent lighting";
    const content = isNsfw ? "mature content allowed, artistic nudity permitted, sensual themes, adult situations, detailed anatomy" : "safe for work content, family-friendly, appropriate clothing, no sexual content, no nudity, tasteful presentation";
    
    return `${baseStyle}, ${world}, ${character}, ${effects}. Current scene: ${storyText} ${characterName ? `Main character: ${characterName}` : ''} Content guidelines: ${content} Negative prompt: ${quality}`;
};

interface StoryImageProps {
    storyText: string;
    characterName?: string;
    isNsfwEnabled?: boolean;
    autoGenerate?: boolean;
    index?: number;
}

export const StoryImage: React.FC<StoryImageProps> = ({
    storyText,
    characterName = '',
    isNsfwEnabled = false,
    autoGenerate = false,
    index = 0
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showToggle, setShowToggle] = useState(true);
    
    // Create cache key
    const cacheKey = useMemo(() => {
        if (!storyText.trim()) return '';
        try {
            const hash = btoa(encodeURIComponent(storyText.slice(0, 200))).slice(0, 16);
            return `img-${index}-${hash}`;
        } catch {
            return `img-${index}-${Math.random().toString(36).substr(2, 9)}`;
        }
    }, [index, storyText]);
    
    // Load from cache
    useEffect(() => {
        if (!cacheKey) return;
        try {
            const cache = localStorage.getItem('rpg-image-cache');
            if (cache) {
                const parsed = JSON.parse(cache);
                const cached = parsed[cacheKey];
                if (cached) {
                    setImageUrl(cached.imageUrl);
                    setError(cached.error);
                }
            }
        } catch (err) {
            console.warn('Failed to load image cache:', err);
        }
    }, [cacheKey]);
    
    // Auto generate
    useEffect(() => {
        if (autoGenerate && !imageUrl && !error && !isGenerating && storyText.trim() && cacheKey) {
            generateImage();
        }
    }, [autoGenerate, cacheKey, storyText, imageUrl, error, isGenerating]);
    
    const saveToCache = (url: string | null, err: string | null) => {
        if (!cacheKey) return;
        try {
            const cache = localStorage.getItem('rpg-image-cache');
            const parsed = cache ? JSON.parse(cache) : {};
            parsed[cacheKey] = {
                imageUrl: url,
                error: err,
                timestamp: Date.now()
            };
            localStorage.setItem('rpg-image-cache', JSON.stringify(parsed));
        } catch (error) {
            console.warn('Failed to save to cache:', error);
        }
    };
    
    const generateImage = async () => {
        if (isGenerating || !storyText.trim()) return;
        
        setIsGenerating(true);
        setError(null);
        
        try {
            const prompt = createImagePrompt(storyText, characterName, isNsfwEnabled);
            const url = await callImageAPI(prompt);
            setImageUrl(url);
            saveToCache(url, null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
            setError(errorMessage);
            saveToCache(null, errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const clearImage = () => {
        setImageUrl(null);
        setError(null);
        if (cacheKey) {
            try {
                const cache = localStorage.getItem('rpg-image-cache');
                if (cache) {
                    const parsed = JSON.parse(cache);
                    delete parsed[cacheKey];
                    localStorage.setItem('rpg-image-cache', JSON.stringify(parsed));
                }
            } catch (err) {
                console.warn('Failed to clear cache:', err);
            }
        }
    };
    
    if (!storyText.trim() || storyText.startsWith('>')) {
        return null; // Don't show for user choices
    }
    
    return (
        <div className="story-image-container mt-3">
            {/* Toggle button */}
            {showToggle && (
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={() => setShowToggle(false)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                            autoGenerate 
                                ? 'bg-green-600 hover:bg-green-500 text-white' 
                                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        }`}
                        title="Ẩn nút tạo ảnh"
                    >
                        🎨
                    </button>
                    <span className="text-xs text-white/60">
                        {autoGenerate ? 'Tự động tạo ảnh' : 'Có thể tạo ảnh'}
                    </span>
                </div>
            )}
            
            {/* Image display */}
            {isGenerating && (
                <div className="flex items-center justify-center p-4 bg-purple-500/10 backdrop-blur-sm border border-purple-400/20 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    <span className="ml-2 text-purple-200 text-sm">Đang tạo ảnh...</span>
                </div>
            )}
            
            {imageUrl && !isGenerating && (
                <div className="relative">
                    <img
                        src={imageUrl}
                        alt="AI Generated Scene"
                        className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
                        title="Xóa ảnh"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <p className="text-xs text-white/50 text-center mt-1">Ảnh AI</p>
                </div>
            )}
            
            {error && !isGenerating && (
                <div className="p-3 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-red-300 font-medium text-sm">Lỗi tạo ảnh</h4>
                            <p className="text-red-200/80 text-xs mt-1">{error}</p>
                        </div>
                        <button
                            onClick={generateImage}
                            className="px-2 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            )}
            
            {/* Manual generation */}
            {!autoGenerate && !imageUrl && !error && !isGenerating && (
                <div className="p-3 bg-gray-500/10 backdrop-blur-sm border border-gray-400/20 rounded-lg border-dashed">
                    <button
                        onClick={generateImage}
                        className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                        </svg>
                        Tạo ảnh cho cảnh này
                    </button>
                </div>
            )}
        </div>
    );
};
