

// Fix: Corrected import path for types.
import { ImageLibraryItem } from '../types';

// Raw data from user, processed to match the ImageLibraryItem interface
// Dữ liệu trước đó chứa các URL không hợp lệ và đã bị xóa.
const rawLibraryData: any[] = [
  // Tất cả các mục nhập trước đó đã bị xóa do liên kết ảnh bị hỏng.
  // Người dùng có thể thêm ảnh mới thông qua công cụ Thư Viện Ảnh trong game.
];


// Process the raw data to ensure descriptions and remove duplicates
const processedLibrary = new Map<string, ImageLibraryItem>();
rawLibraryData.forEach(item => {
    if (!processedLibrary.has(item.id)) {
        processedLibrary.set(item.id, {
            ...item,
            // Ensure description exists for monster creation logic
            description: item.description || (item.tags && item.tags.join(', ')) || "Không có mô tả", 
            // The JSON from user has `isMonsterImage`, we rename it to `isMonster`
            isMonster: item.isMonsterImage ?? false
        });
    }
});

export const DEFAULT_IMAGE_LIBRARY: ImageLibraryItem[] = Array.from(processedLibrary.values());