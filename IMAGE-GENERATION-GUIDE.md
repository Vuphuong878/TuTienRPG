# Hướng Dẫn Sử Dụng Chức Năng Tạo Ảnh Tự Động

## Tổng Quan

Chức năng tạo ảnh tự động cho phép tạo hình ảnh minh họa cho mỗi phần diễn biến câu chuyện trong trò chơi RPG AI. Hệ thống sử dụng API Gemini 2.0 Flash Preview Image Generation để tạo ảnh anime chất lượng cao.

## Cách Hoạt Động

### 1. Nút Bật/Tắt Tạo Ảnh
- **Vị trí**: Bên cạnh mỗi phần diễn biến câu chuyện
- **Biểu tượng**: 🎨
- **Chức năng**: 
  - Màu xanh: Tự động tạo ảnh được BẬT
  - Màu xám: Tự động tạo ảnh được TẮT
- **Cách sử dụng**: Click vào nút để bật/tắt chế độ tự động cho toàn bộ ứng dụng

### 2. Chế Độ Tự Động
Khi được BẬT:
- Tự động tạo ảnh cho mỗi phần diễn biến mới
- Hiển thị animation loading trong khi tạo ảnh
- Lưu ảnh vào cache để sử dụng lại

### 3. Chế Độ Thủ Công
Khi được TẮT:
- Hiển thị nút "Tạo ảnh cho cảnh này"
- Người dùng có thể chọn phần diễn biến nào muốn tạo ảnh
- Vẫn có thể tạo lại ảnh khi gặp lỗi

### 4. Quản Lý Ảnh
- **Xóa ảnh**: Nút X góc trên bên phải của mỗi ảnh
- **Tạo lại**: Nút "Thử lại" khi có lỗi
- **Cache**: Ảnh được lưu tự động trong localStorage

## Cấu Hình Prompt

### Các Thành Phần Prompt:

1. **Chất Lượng (Quality Control)**
   - Loại bỏ: "ugly, poorly drawn hands, text, watermark..."
   - Đảm bảo chất lượng ảnh cao

2. **Phong Cách Nghệ Thuật**
   - Anime-style illustration
   - Digital art chất lượng cao
   - Studio lighting, cinematic composition

3. **Thế Giới (World View)**
   - Fantasy medieval với ảnh hưởng võ thuật châu Á
   - Không khí huyền bí
   - Kiến trúc truyền thống kết hợp yếu tố ma thuật

4. **Nhân Vật (Character Design)**
   - Mắt biểu cảm, tóc bay bồng
   - Trang phục võ thuật truyền thống
   - Tư thế động, thể hiện tính cách

5. **Hiệu Ứng Ma Thuật**
   - Năng lượng tâm linh phát sáng
   - Aura xoáy, hiệu ứng ánh sáng huyền bí
   - Ký hiệu ma thuật bay lơ lửng

6. **Nội Dung Hiện Tại**
   - Mô tả cảnh cụ thể từ câu chuyện
   - Tên nhân vật chính (nếu có)
   - Hướng dẫn nội dung (SFW/NSFW)

## API và Caching

### API Configuration
- **Endpoint**: Gemini 2.0 Flash Preview Image Generation
- **Model**: `gemini-2.0-flash-preview-image-generation`
- **Response**: Base64 encoded image
- **Format**: PNG/JPEG

### Cache System
- **Storage**: localStorage với key `rpg-image-cache`
- **Structure**: 
  ```json
  {
    "img-{index}-{hash}": {
      "imageUrl": "data:image/png;base64,...",
      "error": null,
      "timestamp": 1672531200000
    }
  }
  ```
- **Cache Key**: Tổ hợp của index và hash từ nội dung story

### Auto-Enhancement
- **Trigger**: MutationObserver theo dõi thay đổi DOM
- **Delay**: 500ms sau khi storyLog thay đổi
- **Target**: Elements có class `.story-item`
- **Filter**: Loại bỏ lựa chọn người dùng (bắt đầu bằng `>`)

## Xử Lý Lỗi

### Các Loại Lỗi Phổ Biến:
1. **API Key chưa thiết lập**
2. **Quota API đã hết**
3. **Nội dung không phù hợp**
4. **Kết nối mạng kém**

### Phản Hồi Lỗi:
- Hiển thị thông báo lỗi cụ thể
- Nút "Thử lại" để tạo lại ảnh
- Lưu lỗi vào cache để tránh thử lại liên tục

## Tối Ưu Hóa

### Performance:
- Debounce DOM updates (500ms)
- Cache ảnh để tránh tạo lại
- Lazy loading cho ảnh lớn

### UX:
- Loading states rõ ràng
- Feedback tức thì khi bật/tắt
- Error states thông tin

### Storage:
- Tự động dọn dẹp cache cũ
- Compression cho base64 images
- Fallback khi localStorage đầy

## Cách Sử Dụng Cho Developer

### Import và Setup:
```typescript
import { enhanceStoryItems } from './utils/storyImageEnhancer';

// Trong component
useEffect(() => {
    const timeout = setTimeout(() => {
        enhanceStoryItems();
    }, 500);
    
    return () => clearTimeout(timeout);
}, [storyLog]);
```

### Tùy Chỉnh Prompt:
```typescript
// Trong App.tsx
export const IMAGE_GENERATION_PROMPTS = {
    qualityControl: "...",
    artStyle: "...",
    worldView: "...",
    // ...
};
```

### Manual Enhancement:
```typescript
// Gọi thủ công
enhanceStoryItems();

// Hoặc cho element cụ thể
enhanceStoryWithImage(element, storyText, index);
```

## Troubleshooting

### Ảnh không tạo được:
1. Kiểm tra API Key trong settings
2. Xem console để debug lỗi API
3. Kiểm tra nội dung có phù hợp không

### Performance chậm:
1. Tắt auto-generate cho các phần không cần thiết
2. Xóa cache cũ thủ công
3. Giảm kích thước ảnh trong config

### Cache quá lớn:
1. localStorage có giới hạn ~5MB
2. Tự động dọn dẹp cache cũ hơn 7 ngày
3. Compress base64 nếu cần

## Future Enhancements

1. **Batch Processing**: Tạo nhiều ảnh cùng lúc
2. **Style Selection**: Cho phép chọn style khác nhau
3. **Character Consistency**: Nhận diện và giữ nhất quán nhân vật
4. **Image Editing**: Cho phép chỉnh sửa ảnh sau khi tạo
5. **Export**: Xuất ảnh ra file riêng biệt
