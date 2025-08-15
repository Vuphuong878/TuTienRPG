# Advanced Story Image Generation System Guide

## 🎨 Tổng Quan

Hệ thống tạo ảnh AI đã được nâng cấp hoàn toàn với các tính năng mới:

### ✨ Tính Năng Mới

#### 1. **Prompt Theo Ngữ Cảnh** 
- Sử dụng thông tin nhân vật chính và đồng hành
- Tích hợp mô tả diễn biến câu chuyện
- Tự động điều chỉnh theo cài đặt NSFW

#### 2. **Nén và Lưu Trữ Base64**
- Ảnh được nén tự động để tiết kiệm dung lượng
- Lưu trữ trực tiếp trong file JSON game
- Không phụ thuộc vào cache trình duyệt

#### 3. **Zoom Ảnh (40% lớn hơn)**
- Click vào ảnh để phóng to 40%
- Modal xem ảnh với nền mờ
- Đóng bằng ESC hoặc click ngoài

#### 4. **Loại Bỏ Nút Xóa**
- Không còn nút X để xóa ảnh
- Ảnh được ghi đè khi tạo mới
- Tích hợp với hệ thống lưu game

## 🚀 Cách Sử Dụng

### Tự Động Tạo Ảnh
1. Click nút 🎨 để bật/tắt chế độ tự động
2. Khi bật, ảnh sẽ tự động tạo cho các đoạn story mới
3. Hiển thị "Tự động tạo ảnh" khi bật

### Tạo Ảnh Thủ Công
1. Click nút 📸 "Tạo ảnh thủ công"
2. Ảnh mới sẽ thay thế ảnh cũ (nếu có)
3. Quá trình nén tự động để tối ưu kích thước

### Xem Ảnh Phóng To
1. Click vào bất kỳ ảnh nào
2. Ảnh hiển thị phóng to 40% trong modal
3. Click ESC hoặc ngoài modal để đóng

## 🔧 Tích Hợp Với Game

### Lưu Game
- Ảnh được mã hóa Base64 và lưu trong file JSON
- Kích thước file tối ưu nhờ nén ảnh
- Bao gồm metadata timestamp

### Tải Game
- Ảnh tự động hiển thị khi tải save game
- Hỗ trợ save game cũ (không có ảnh)
- Import/export liền mạch

## 📝 Prompt Engineering

### Ngữ Cảnh Nhân Vật
```
Nhân vật chính: [Tên] - [Mô tả]
Đồng hành: [Tên] ([Mô tả]), quan hệ: [Relationship]
```

### Diễn Biến Câu Chuyện
```
Current scene: [Nội dung story từ AI]
```

### Chất Lượng Hình Ảnh
- Anime-style illustration chất lượng cao
- Thế giới fantasy với ảnh hưởng võ thuật Á Đông
- Chi tiết nhân vật và hiệu ứng ma thuật
- Ánh sáng và bố cục điện ảnh

## 🛠️ Cấu Hình

### Cài Đặt API
- Sử dụng Gemini 2.0 Flash Preview Image Generation
- Cần API key hợp lệ từ Google AI Studio
- Hỗ trợ đa API key với rotation

### Nén Ảnh
- Chất lượng: 80% (có thể điều chỉnh)
- Kích thước tối đa: 512x512px
- Format: JPEG để tối ưu dung lượng

## 🔍 Troubleshooting

### Ảnh Không Hiển Thị
1. Kiểm tra API key
2. Xác nhận kết nối internet
3. Thử tạo ảnh thủ công

### File Save Quá Lớn
1. Ảnh được nén tự động
2. Giảm số lượng ảnh cũ (tạo mới)
3. Kiểm tra cài đặt nén

### Lỗi Import/Export
1. Đảm bảo file JSON hợp lệ
2. Kiểm tra quyền truy cập file
3. Thử lại với file backup

## 📊 Hiệu Suất

### Kích Thước File
- Ảnh gốc: ~500KB-2MB
- Sau nén: ~50KB-200KB
- Tổng file JSON: Tăng ~10-30%

### Tốc Độ
- Tạo ảnh: 3-8 giây (tuỳ API)
- Nén ảnh: <1 giây
- Load ảnh từ save: Tức thì

## 🔮 Tương Lai

### Tính Năng Sắp Tới
- [ ] Batch image generation
- [ ] Style presets
- [ ] Image variations
- [ ] Advanced compression options

### Cải Tiến
- [ ] Faster image loading
- [ ] Better error handling
- [ ] More context awareness
- [ ] Custom prompt templates

---

*Hệ thống tạo ảnh mới mang lại trải nghiệm hoàn chỉnh với chất lượng cao và tối ưu hóa hiệu suất.*
