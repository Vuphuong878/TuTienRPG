/**
 * Simple wrapper to add image generation to existing story elements
 */

// Global toggle state
let globalAutoImageEnabled = false;

// Load from localStorage
try {
    const saved = localStorage.getItem('rpg-auto-image-enabled');
    globalAutoImageEnabled = saved ? JSON.parse(saved) : false;
} catch (e) {
    globalAutoImageEnabled = false;
}

// Save to localStorage
const saveAutoImageState = (enabled: boolean) => {
    try {
        localStorage.setItem('rpg-auto-image-enabled', JSON.stringify(enabled));
        globalAutoImageEnabled = enabled;
    } catch (e) {
        console.warn('Failed to save auto image state');
    }
};

// Simple API function
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

// Create image prompt
const createImagePrompt = (storyText: string, characterName: string = '', isNsfw: boolean = false): string => {
    const baseStyle = "high-quality anime-style illustration, detailed character design, vibrant colors, professional digital art, studio lighting, cinematic composition, manga-inspired artwork, beautiful shading and highlights";
    const world = "fantasy medieval world with Asian martial arts influences, mystical atmosphere, ancient temples and pagodas, misty mountains, traditional architecture mixed with magical elements, ethereal lighting, spiritual energy auras";
    const character = "detailed character with expressive eyes, flowing hair, traditional martial arts clothing or fantasy robes, distinctive facial features, dynamic pose showing personality and mood";
    const effects = "glowing spiritual energy, swirling chi auras, mystical light effects, floating magical symbols, elemental powers visualization, energy trails, divine radiance, supernatural phenomena";
    const quality = "ugly, poorly drawn hands, text, watermark, signature, extra limbs, deformed anatomy, blurry, low quality, artifacts, distorted proportions, bad composition, oversaturated colors, noise, duplicate characters, inconsistent lighting";
    const content = isNsfw ? "mature content allowed, artistic nudity permitted, sensual themes, adult situations, detailed anatomy" : "safe for work content, family-friendly, appropriate clothing, no sexual content, no nudity, tasteful presentation";
    
    return `${baseStyle}, ${world}, ${character}, ${effects}. Current scene: ${storyText} ${characterName ? `Main character: ${characterName}` : ''} Content guidelines: ${content} Negative prompt: ${quality}`;
};

// Enhanced story item with image
const enhanceStoryWithImage = (storyElement: HTMLElement, storyText: string, index: number) => {
    // Skip if it's a user choice (starts with >)
    if (storyText.trim().startsWith('>')) {
        return;
    }
    
    // Check if already enhanced
    if (storyElement.querySelector('.story-image-container')) {
        return;
    }
    
    // Create cache key
    const cacheKey = `img-${index}-${btoa(encodeURIComponent(storyText.slice(0, 200))).slice(0, 16)}`;
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'story-image-container mt-3';
    
    // Load cached image
    let cachedImage = null;
    let cachedError = null;
    try {
        const cache = localStorage.getItem('rpg-image-cache');
        if (cache) {
            const parsed = JSON.parse(cache);
            const cached = parsed[cacheKey];
            if (cached) {
                cachedImage = cached.imageUrl;
                cachedError = cached.error;
            }
        }
    } catch (e) {
        console.warn('Failed to load image cache');
    }
    
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
    
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'text-xs text-white/60';
    toggleLabel.textContent = globalAutoImageEnabled ? 'Tự động tạo ảnh' : 'Có thể tạo ảnh';
    
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
    toggleContainer.appendChild(toggleLabel);
    imageContainer.appendChild(toggleContainer);
    
    // Image display area
    const imageDisplay = document.createElement('div');
    imageDisplay.className = 'image-display-area';
    
    // Save to cache function
    const saveToCache = (url: string | null, error: string | null) => {
        try {
            const cache = localStorage.getItem('rpg-image-cache');
            const parsed = cache ? JSON.parse(cache) : {};
            parsed[cacheKey] = {
                imageUrl: url,
                error: error,
                timestamp: Date.now()
            };
            localStorage.setItem('rpg-image-cache', JSON.stringify(parsed));
        } catch (e) {
            console.warn('Failed to save to cache');
        }
    };
    
    // Generate image function
    const generateImage = async () => {
        // Show loading
        imageDisplay.innerHTML = `
            <div class="flex items-center justify-center p-4 bg-purple-500/10 backdrop-blur-sm border border-purple-400/20 rounded-lg">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                <span class="ml-2 text-purple-200 text-sm">Đang tạo ảnh...</span>
            </div>
        `;
        
        try {
            const prompt = createImagePrompt(storyText, '', false); // TODO: Get character name and NSFW setting
            const imageUrl = await callImageAPI(prompt);
            
            // Show image
            imageDisplay.innerHTML = `
                <div class="relative">
                    <img src="${imageUrl}" alt="AI Generated Scene" 
                         class="w-full max-w-sm mx-auto rounded-lg shadow-lg" 
                         style="max-height: 300px; object-fit: contain;">
                    <button class="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full transition-colors clear-image-btn" 
                            title="Xóa ảnh">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <p class="text-xs text-white/50 text-center mt-1">Ảnh AI</p>
                </div>
            `;
            
            // Add clear button event
            const clearBtn = imageDisplay.querySelector('.clear-image-btn') as HTMLButtonElement;
            if (clearBtn) {
                clearBtn.onclick = () => {
                    imageDisplay.innerHTML = '';
                    try {
                        const cache = localStorage.getItem('rpg-image-cache');
                        if (cache) {
                            const parsed = JSON.parse(cache);
                            delete parsed[cacheKey];
                            localStorage.setItem('rpg-image-cache', JSON.stringify(parsed));
                        }
                    } catch (e) {
                        console.warn('Failed to clear cache');
                    }
                };
            }
            
            saveToCache(imageUrl, null);
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
            
            // Add retry button event
            const retryBtn = imageDisplay.querySelector('.retry-btn') as HTMLButtonElement;
            if (retryBtn) {
                retryBtn.onclick = generateImage;
            }
            
            saveToCache(null, errorMessage);
        }
    };
    
    // Show cached content or manual button
    if (cachedImage) {
        imageDisplay.innerHTML = `
            <div class="relative">
                <img src="${cachedImage}" alt="AI Generated Scene" 
                     class="w-full max-w-sm mx-auto rounded-lg shadow-lg" 
                     style="max-height: 300px; object-fit: contain;">
                <button class="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full transition-colors clear-image-btn" 
                        title="Xóa ảnh">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
                <p class="text-xs text-white/50 text-center mt-1">Ảnh AI</p>
            </div>
        `;
        
        const clearBtn = imageDisplay.querySelector('.clear-image-btn') as HTMLButtonElement;
        if (clearBtn) {
            clearBtn.onclick = () => {
                imageDisplay.innerHTML = '';
                try {
                    const cache = localStorage.getItem('rpg-image-cache');
                    if (cache) {
                        const parsed = JSON.parse(cache);
                        delete parsed[cacheKey];
                        localStorage.setItem('rpg-image-cache', JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.warn('Failed to clear cache');
                }
            };
        }
    } else if (cachedError) {
        imageDisplay.innerHTML = `
            <div class="p-3 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="text-red-300 font-medium text-sm">Lỗi tạo ảnh</h4>
                        <p class="text-red-200/80 text-xs mt-1">${cachedError}</p>
                    </div>
                    <button class="px-2 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs transition-colors retry-btn">
                        Thử lại
                    </button>
                </div>
            </div>
        `;
        
        const retryBtn = imageDisplay.querySelector('.retry-btn') as HTMLButtonElement;
        if (retryBtn) {
            retryBtn.onclick = generateImage;
        }
    } else if (globalAutoImageEnabled) {
        // Auto generate
        generateImage();
    } else {
        // Manual button
        imageDisplay.innerHTML = `
            <div class="p-3 bg-gray-500/10 backdrop-blur-sm border border-gray-400/20 rounded-lg border-dashed">
                <button class="w-full px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm transition-colors flex items-center justify-center gap-2 generate-btn">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                    </svg>
                    Tạo ảnh cho cảnh này
                </button>
            </div>
        `;
        
        const generateBtn = imageDisplay.querySelector('.generate-btn') as HTMLButtonElement;
        if (generateBtn) {
            generateBtn.onclick = generateImage;
        }
    }
    
    imageContainer.appendChild(imageDisplay);
    storyElement.appendChild(imageContainer);
};

// Export function to enhance story items
export const enhanceStoryItems = () => {
    // Find all story items
    const storyItems = document.querySelectorAll('.story-item');
    
    storyItems.forEach((item, index) => {
        const element = item as HTMLElement;
        const storyText = element.textContent || '';
        
        if (storyText.trim() && !storyText.startsWith('>')) {
            enhanceStoryWithImage(element, storyText, index);
        }
    });
};

// Auto-enhance on DOM changes
let enhanceTimeout: ReturnType<typeof setTimeout> | null = null;

const observer = new MutationObserver(() => {
    if (enhanceTimeout) {
        clearTimeout(enhanceTimeout);
    }
    enhanceTimeout = setTimeout(enhanceStoryItems, 1000);
});

// Start observing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
        enhanceStoryItems();
    });
} else {
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceStoryItems();
}
