/**
 * Gemini Image Generation API utility
 */

// Hàm gọi API tạo ảnh từ Gemini
export async function callGeminiImageAPI(detailedPrompt: string): Promise<string | null> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key của Google chưa được thiết lập.");
    }

    const parts = [{ text: detailedPrompt }];

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const imagePart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (imagePart) {
        return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi của Gemini.");
}

// Hàm lấy API key từ localStorage
function getApiKey(): string | null {
    // Lấy từ localStorage trước
    const userKeys = localStorage.getItem('userApiKeys');
    if (userKeys) {
        const keys = JSON.parse(userKeys);
        const activeIndex = parseInt(localStorage.getItem('activeUserApiKeyIndex') || '0', 10);
        if (keys.length > 0 && keys[activeIndex]) {
            return keys[activeIndex];
        }
    }
    
    // Fallback về default key nếu có
    const isUsingDefault = localStorage.getItem('isUsingDefaultKey') !== 'false';
    if (isUsingDefault) {
        // Sẽ được set từ environment variables trong build process
        return (window as any).__GEMINI_API_KEY__ || '';
    }
    
    return null;
}
