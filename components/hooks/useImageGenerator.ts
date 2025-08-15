/**
 * Image Generator Hook for RPG Game
 */
import { useState, useEffect, useMemo } from 'react';
import { callGeminiImageAPI } from '../utils/geminiImageAPI';
import { generateImagePrompt } from '../../App';

interface ImageCache {
    [key: string]: {
        imageUrl: string | null;
        error: string | null;
        timestamp: number;
    };
}

export interface UseImageGeneratorReturn {
    imageUrl: string | null;
    error: string | null;
    isGenerating: boolean;
    generateImage: () => void;
    clearImage: () => void;
}

export const useImageGenerator = (
    storyText: string,
    characterName?: string,
    isNsfwEnabled: boolean = false,
    gameHistoryIndex: number = 0,
    autoGenerate: boolean = false
): UseImageGeneratorReturn => {
    const [imageCache, setImageCache] = useState<ImageCache>(() => {
        try {
            const saved = localStorage.getItem('rpg-image-cache');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Tạo cache key duy nhất
    const cacheKey = useMemo(() => {
        if (!storyText.trim()) return '';
        try {
            const hash = btoa(encodeURIComponent(storyText.slice(0, 200))).slice(0, 16);
            return `${gameHistoryIndex}-${hash}`;
        } catch {
            return `${gameHistoryIndex}-${Math.random().toString(36).substr(2, 9)}`;
        }
    }, [gameHistoryIndex, storyText]);
    
    const cachedData = cacheKey ? imageCache[cacheKey] : null;
    
    // Lưu cache
    useEffect(() => {
        try {
            localStorage.setItem('rpg-image-cache', JSON.stringify(imageCache));
        } catch (error) {
            console.warn('Failed to save image cache:', error);
        }
    }, [imageCache]);
    
    // Tự động tạo ảnh
    useEffect(() => {
        if (autoGenerate && !cachedData && !isGenerating && storyText.trim() && cacheKey) {
            generateImage();
        }
    }, [autoGenerate, cacheKey, storyText]);
    
    const generateImage = async () => {
        if (isGenerating || !storyText.trim() || !cacheKey) return;
        
        setIsGenerating(true);
        
        try {
            const prompt = generateImagePrompt(storyText, characterName, isNsfwEnabled);
            const imageUrl = await callGeminiImageAPI(prompt);
            
            setImageCache((prev: ImageCache) => ({
                ...prev,
                [cacheKey]: {
                    imageUrl,
                    error: null,
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error('Image generation error:', error);
            setImageCache((prev: ImageCache) => ({
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
    
    const clearImage = () => {
        if (!cacheKey) return;
        setImageCache((prev: ImageCache) => {
            const newCache = { ...prev };
            delete newCache[cacheKey];
            return newCache;
        });
    };
    
    return {
        imageUrl: cachedData?.imageUrl || null,
        error: cachedData?.error || null,
        isGenerating,
        generateImage,
        clearImage
    };
};
