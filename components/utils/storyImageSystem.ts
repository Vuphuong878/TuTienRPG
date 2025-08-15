/**
 * Advanced Story Image System with Base64 Integration
 * Features:
 * - Character and story context-aware prompts
 * - Image compression and Base64 encoding
 * - Zoom on click functionality
 * - Integration with save system
 * - No cache dependency
 */

import type { SaveData } from '../types';

interface ImageData {
    base64: string;
    mimeType: string;
    compressed?: boolean;
    timestamp?: number;
}

interface StoryImageData {
    [storyIndex: string]: ImageData;
}

// Global state
let globalAutoImageEnabled = false;
let enhancementTimeout: NodeJS.Timeout | null = null;

// Load setting from localStorage
try {
    const saved = localStorage.getItem('rpg-auto-image-enabled');
    globalAutoImageEnabled = saved ? JSON.parse(saved) : false;
} catch (e) {
    globalAutoImageEnabled = false;
}

// Save auto image state
const saveAutoImageState = (enabled: boolean) => {
    try {
        localStorage.setItem('rpg-auto-image-enabled', JSON.stringify(enabled));
        globalAutoImageEnabled = enabled;
    } catch (e) {
        console.warn('Failed to save auto image state');
    }
};

/**
 * Compress image to reduce file size before Base64 encoding
 */
const compressImage = (imageData: string, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate compressed dimensions
            const maxWidth = 512;
            const maxHeight = 512;
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = width * (maxHeight / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedData = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedData);
        };
        img.src = imageData;
    });
};

/**
 * Call Gemini Image API
 */
const callImageAPI = async (prompt: string): Promise<string> => {
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

/**
 * Create enhanced image prompt based on story and character context
 */
const createContextualImagePrompt = (
    storyText: string, 
    gameState: SaveData | null = null,
    isNsfw: boolean = false
): string => {
    // Base art style
    const baseStyle = "high-quality anime-style illustration, detailed character design, vibrant colors, professional digital art, studio lighting, cinematic composition, manga-inspired artwork, beautiful shading and highlights";
    
    // World setting
    const world = "fantasy medieval world with Asian martial arts influences, mystical atmosphere, ancient temples and pagodas, misty mountains, traditional architecture mixed with magical elements, ethereal lighting, spiritual energy auras";
    
    // Character information from game state
    let characterContext = "";
    if (gameState?.party && gameState.party.length > 0) {
        const pc = gameState.party.find(p => p.type === 'pc');
        const companions = gameState.party.filter(p => p.type === 'companion');
        
        if (pc) {
            characterContext += `Main character: ${pc.name}`;
            if (pc.description) characterContext += ` - ${pc.description}`;
            if (pc.appearance) characterContext += `, appearance: ${pc.appearance}`;
            if (pc.realm) characterContext += `, power level: ${pc.realm}`;
            characterContext += ". ";
        }
        
        if (companions.length > 0) {
            characterContext += `Companions: ${companions.map(c => {
                let companionDesc = c.name;
                if (c.description) companionDesc += ` (${c.description})`;
                if (c.relationship) companionDesc += `, relationship: ${c.relationship}`;
                return companionDesc;
            }).join(', ')}. `;
        }
    }
    
    // Enhanced character design
    const character = "detailed character with expressive eyes, flowing hair, traditional martial arts clothing or fantasy robes, distinctive facial features, dynamic pose showing personality and mood, authentic Asian-inspired character designs";
    
    // Magical effects
    const effects = "glowing spiritual energy, swirling chi auras, mystical light effects, floating magical symbols, elemental powers visualization, energy trails, divine radiance, supernatural phenomena";
    
    // Content guidelines
    const content = isNsfw ? 
        "mature content allowed, artistic nudity permitted, sensual themes, adult situations, detailed anatomy" : 
        "safe for work content, family-friendly, appropriate clothing, no sexual content, no nudity, tasteful presentation";
    
    // Quality control
    const quality = "ugly, poorly drawn hands, text, watermark, signature, extra limbs, deformed anatomy, blurry, low quality, artifacts, distorted proportions, bad composition, oversaturated colors, noise, duplicate characters, inconsistent lighting";
    
    return `${baseStyle}, ${world}, ${character}, ${effects}. ${characterContext}Current scene: ${storyText}. Content guidelines: ${content}. Negative prompt: ${quality}`;
};

/**
 * Create zoom modal for image viewing
 */
const createZoomModal = (imageSrc: string) => {
    // Remove existing modal if any
    const existingModal = document.querySelector('.image-zoom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'image-zoom-modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    modal.style.backdropFilter = 'blur(4px)';
    
    // Create modal content
    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-full p-4">
            <img src="${imageSrc}" 
                 alt="Zoomed Image" 
                 class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                 style="transform: scale(1.4);">
            <button class="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                    title="Đóng">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    `;
    
    // Add click to close functionality
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    // Add close button functionality
    const closeBtn = modal.querySelector('button');
    if (closeBtn) {
        closeBtn.onclick = () => modal.remove();
    }
    
    // Add to page
    document.body.appendChild(modal);
    
    // Add ESC key listener
    const escListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escListener);
        }
    };
    document.addEventListener('keydown', escListener);
};

/**
 * Save image data to game state
 */
const saveImageToGameState = (storyIndex: number, imageData: ImageData, saveFunction: (data: any) => void) => {
    // Get current story images from localStorage or create new object
    let storyImages: StoryImageData = {};
    try {
        const saved = localStorage.getItem('rpg-story-images');
        if (saved) {
            storyImages = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load story images');
    }
    
    // Save image data
    storyImages[storyIndex.toString()] = imageData;
    
    // Save to localStorage temporarily (will be included in game save)
    try {
        localStorage.setItem('rpg-story-images', JSON.stringify(storyImages));
    } catch (e) {
        console.warn('Failed to save story images to localStorage');
    }
    
    // Trigger game state save with images
    if (saveFunction) {
        saveFunction({ storyImages });
    }
};

/**
 * Load image data from game state
 */
const loadImageFromGameState = (storyIndex: number): ImageData | null => {
    try {
        const saved = localStorage.getItem('rpg-story-images');
        if (saved) {
            const storyImages: StoryImageData = JSON.parse(saved);
            return storyImages[storyIndex.toString()] || null;
        }
    } catch (e) {
        console.warn('Failed to load image from game state');
    }
    return null;
};

/**
 * Enhanced story item with contextual image generation
 */
const enhanceStoryWithContextualImage = (
    storyElement: HTMLElement, 
    storyText: string, 
    index: number,
    gameState: SaveData | null = null,
    onSave?: (data: any) => void
) => {
    // Skip if it's a user choice (starts with >)
    if (storyText.trim().startsWith('>')) {
        return;
    }
    
    // Check if already enhanced
    if (storyElement.querySelector('.story-image-container')) {
        return;
    }
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'story-image-container mt-3';
    
    // Load existing image if available
    const existingImage = loadImageFromGameState(index);
    
    // Create toggle button
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'flex items-center gap-2 mb-2';
    
    const toggleButton = document.createElement('button');
    toggleButton.className = `text-xs px-2 py-1 rounded transition-colors ${
        globalAutoImageEnabled 
            ? 'bg-green-600 hover:bg-green-500 text-white' 
            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
    }`;
    toggleButton.innerHTML = '🎨';
    toggleButton.title = globalAutoImageEnabled ? 'Tắt tự động tạo ảnh' : 'Bật tự động tạo ảnh';
    
    const generateButton = document.createElement('button');
    generateButton.className = 'text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors';
    generateButton.innerHTML = '📸';
    generateButton.title = 'Tạo ảnh thủ công';
    
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'text-xs text-white/60';
    toggleLabel.textContent = globalAutoImageEnabled ? 'Tự động tạo ảnh' : 'Có thể tạo ảnh';
    
    // Toggle functionality
    toggleButton.onclick = () => {
        saveAutoImageState(!globalAutoImageEnabled);
        // Update all toggle buttons
        document.querySelectorAll('.story-image-container button[title*="tự động"]').forEach(btn => {
            const button = btn as HTMLButtonElement;
            button.className = `text-xs px-2 py-1 rounded transition-colors ${
                globalAutoImageEnabled 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
            }`;
            button.title = globalAutoImageEnabled ? 'Tắt tự động tạo ảnh' : 'Bật tự động tạo ảnh';
        });
        // Update all labels
        document.querySelectorAll('.story-image-container .text-xs.text-white\\/60').forEach(label => {
            label.textContent = globalAutoImageEnabled ? 'Tự động tạo ảnh' : 'Có thể tạo ảnh';
        });
    };
    
    toggleContainer.appendChild(toggleButton);
    toggleContainer.appendChild(generateButton);
    toggleContainer.appendChild(toggleLabel);
    imageContainer.appendChild(toggleContainer);
    
    // Image display area
    const imageDisplay = document.createElement('div');
    imageDisplay.className = 'image-display-area';
    
    // Generate image function
    const generateImage = async () => {
        // Show loading
        imageDisplay.innerHTML = `
            <div class="flex items-center justify-center p-4 bg-purple-500/10 backdrop-blur-sm border border-purple-400/20 rounded-lg">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                <span class="ml-2 text-purple-200 text-sm">Đang tạo ảnh từ ngữ cảnh...</span>
            </div>
        `;
        
        try {
            // Get NSFW setting from game state
            const isNsfw = gameState?.worldData?.allowNsfw || false;
            
            // Create contextual prompt
            const prompt = createContextualImagePrompt(storyText, gameState, isNsfw);
            console.log('🎨 Contextual Image Prompt:', prompt);
            
            // Generate image
            const imageUrl = await callImageAPI(prompt);
            
            // Compress image for smaller file size
            const compressedImage = await compressImage(imageUrl, 0.8);
            
            // Extract mime type and base64 data
            const [header, base64Data] = compressedImage.split(',');
            const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
            
            // Create image data object
            const imageData: ImageData = {
                base64: base64Data,
                mimeType: mimeType,
                compressed: true,
                timestamp: Date.now()
            };
            
            // Save to game state
            saveImageToGameState(index, imageData, onSave || (() => {}));
            
            // Display image with zoom functionality
            imageDisplay.innerHTML = `
                <div class="relative">
                    <img src="${compressedImage}" 
                         alt="AI Generated Scene" 
                         class="w-full max-w-sm mx-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow" 
                         style="max-height: 300px; object-fit: contain;"
                         title="Click để phóng to 40%">
                    <p class="text-xs text-white/50 text-center mt-1">Ảnh AI - Click để phóng to</p>
                </div>
            `;
            
            // Add zoom click functionality
            const img = imageDisplay.querySelector('img') as HTMLImageElement;
            if (img) {
                img.onclick = () => {
                    createZoomModal(compressedImage);
                };
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            
            // Show error
            imageDisplay.innerHTML = `
                <div class="p-3 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-red-300 font-medium text-sm">Lỗi tạo ảnh</h4>
                            <p class="text-red-200/80 text-xs mt-1">${errorMessage}</p>
                        </div>
                        <button class="px-2 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs transition-colors retry-btn">
                            Thử lại
                        </button>
                    </div>
                </div>
            `;
            
            // Add retry functionality
            const retryBtn = imageDisplay.querySelector('.retry-btn') as HTMLButtonElement;
            if (retryBtn) {
                retryBtn.onclick = generateImage;
            }
        }
    };
    
    // Manual generation button
    generateButton.onclick = generateImage;
    
    // Load existing image if available
    if (existingImage) {
        const fullImageSrc = `data:${existingImage.mimeType};base64,${existingImage.base64}`;
        imageDisplay.innerHTML = `
            <div class="relative">
                <img src="${fullImageSrc}" 
                     alt="AI Generated Scene" 
                     class="w-full max-w-sm mx-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow" 
                     style="max-height: 300px; object-fit: contain;"
                     title="Click để phóng to 40%">
                <p class="text-xs text-white/50 text-center mt-1">Ảnh AI - Click để phóng to</p>
            </div>
        `;
        
        // Add zoom functionality to existing image
        const img = imageDisplay.querySelector('img') as HTMLImageElement;
        if (img) {
            img.onclick = () => {
                createZoomModal(fullImageSrc);
            };
        }
    }
    
    imageContainer.appendChild(imageDisplay);
    
    // Auto-generate if enabled and no existing image
    if (globalAutoImageEnabled && !existingImage) {
        setTimeout(generateImage, 1000); // Small delay to ensure DOM is ready
    }
    
    // Append to the story element instead of inserting as sibling to avoid React conflicts
    storyElement.appendChild(imageContainer);
};

/**
 * Clean up enhancement state - useful for debugging or resetting
 */
export const resetImageEnhancement = () => {
    document.querySelectorAll('[data-image-enhanced="true"]').forEach(element => {
        element.removeAttribute('data-image-enhanced');
    });
    
    document.querySelectorAll('.story-image-container').forEach(container => {
        container.remove();
    });
};

/**
 * Debounced version of enhancement to prevent multiple rapid calls
 */
export const enhanceStoryItemsWithContextDebounced = (gameState: SaveData | null = null, onSave?: (data: any) => void) => {
    // Clear existing timeout
    if (enhancementTimeout) {
        clearTimeout(enhancementTimeout);
    }
    
    // Set new timeout
    enhancementTimeout = setTimeout(() => {
        enhanceStoryItemsWithContext(gameState, onSave);
    }, 300);
};

/**
 * Main function to enhance all story items
 */
export const enhanceStoryItemsWithContext = (gameState: SaveData | null = null, onSave?: (data: any) => void) => {
    // Find story panel elements specifically - target only the story items in StoryPanel
    const storyElements = document.querySelectorAll('.story-item');
    
    storyElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        const textContent = htmlElement.textContent || '';
        
        // Skip empty or very short content
        if (textContent.trim().length < 20) return;
        
        // Skip if already enhanced - check for any image-related elements
        if (htmlElement.querySelector('.story-image-container') || 
            htmlElement.querySelector('[data-image-enhanced="true"]') ||
            htmlElement.dataset.imageEnhanced === 'true') return;
        
        // Mark as being processed to prevent duplicate enhancement
        htmlElement.setAttribute('data-image-enhanced', 'true');
        
        // Enhance with contextual image generation
        enhanceStoryWithContextualImage(htmlElement, textContent, index, gameState, onSave);
    });
};

/**
 * Export story images with game data
 */
export const exportStoryImagesWithGameData = (gameData: SaveData): any => {
    try {
        const storyImages = localStorage.getItem('rpg-story-images');
        if (storyImages) {
            return {
                ...gameData,
                storyImages: JSON.parse(storyImages)
            };
        }
    } catch (e) {
        console.warn('Failed to export story images');
    }
    return gameData;
};

/**
 * Import story images from game data
 */
export const importStoryImagesFromGameData = (gameData: any) => {
    try {
        if (gameData.storyImages) {
            localStorage.setItem('rpg-story-images', JSON.stringify(gameData.storyImages));
            console.log('✅ Story images imported successfully');
        }
    } catch (e) {
        console.warn('Failed to import story images');
    }
};

/**
 * Clear all story images
 */
export const clearAllStoryImages = () => {
    try {
        localStorage.removeItem('rpg-story-images');
        console.log('🗑️ All story images cleared');
    } catch (e) {
        console.warn('Failed to clear story images');
    }
};

// Export key functions
export {
    saveAutoImageState,
    createContextualImagePrompt,
    createZoomModal,
    compressImage
};
