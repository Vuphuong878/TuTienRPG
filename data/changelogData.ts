export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'new' | 'update' | 'fix' | 'balance';
    description: string;
  }[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "3.0.5",
    date: new Date().toISOString().split('T')[0],
    changes: [
      { type: 'new', description: 'Hoàn thiện Hệ thống Đệ Tử (Retainers): Giao diện quản lý, chiêu mộ, huấn luyện và cho đệ tử theo hỗ trợ chiến đấu.' },
      { type: 'update', description: 'Nâng cấp phần thưởng từ Sự kiện Ngẫu nhiên: AI giờ đây sẽ tự động tạo ra các vật phẩm độc đáo và phù hợp thay vì vật phẩm giữ chỗ.' },
      { type: 'fix', description: 'Tối ưu hóa giao diện Đồng Hành để phân biệt rõ ràng giữa Đệ Tử và Nô Bộc.' },
    ],
  },
  {
    version: "3.0.4",
    date: new Date().toISOString().split('T')[0],
    changes: [
      { type: 'new', description: 'Thêm tính năng Lời Kể AI Chủ Động (Proactive Narration) để làm cho người dẫn truyện trở nên sống động và tự nhiên hơn.' },
      { type: 'new', description: 'Thêm tùy chọn "Tần suất Lời kể AI" trong phần Cài đặt để người chơi có thể tùy chỉnh trải nghiệm.' },
      { type: 'fix', description: 'Sửa lỗi nghiêm trọng "Monster template not found" bằng cách buộc AI phải chọn quái vật từ danh sách hợp lệ khi tạo Sự kiện Ngẫu nhiên.' },
      { type: 'update', description: 'Nâng cấp model AI cho lời kể lên `gemini-3-pro-preview` để đảm bảo chất lượng văn học.' },
    ],
  },
  {
    version: "3.0.3",
    date: new Date().toISOString().split('T')[0],
    changes: [
      { type: 'new', description: 'Hoàn thiện Hệ thống Sự kiện Ngẫu nhiên (Random Events) do AI tạo ra, mang lại sự bất ngờ cho mỗi cuộc phiêu lưu.' },
      { type: 'fix', description: 'Tái cấu trúc luồng xử lý hành động, khắc phục triệt để lỗi "màn hình đen" khi sự kiện được kích hoạt.' },
      { type: 'update', description: 'Tập trung hóa logic xử lý hành động vào một nơi duy nhất để tăng tính ổn định và dễ dàng bảo trì.' },
    ],
  },
  {
    version: "3.0.2",
    date: new Date().toISOString().split('T')[0],
    changes: [
      { type: 'new', description: 'Thêm tính năng "Chơi Nhanh" (Quick Play) từ Menu chính để vào game ngay lập tức với thiết lập mặc định.' },
      { type: 'new', description: 'Thêm tùy chọn "Dev Quick Start" để tạo nhanh nhân vật cấp cao phục vụ cho việc kiểm thử.' },
      { type: 'fix', description: 'Sửa lỗi logic sao chép dữ liệu khi sử dụng tính năng "Nô Dịch" (Enslave).' },
      { type: 'fix', description: 'Dọn dẹp mã nguồn, loại bỏ các tệp component không sử dụng và sửa các đường dẫn import không hợp lệ.' },
    ],
  },
  {
    version: "3.0.1",
    date: "2024-09-14",
    changes: [
      { type: 'new', description: 'Hoàn thiện Hệ thống Bí Cảnh (Dungeons): AI giờ đây có thể tự động tạo ra các bí cảnh độc đáo khi người chơi khám phá.' },
      { type: 'update', description: 'Tái cấu trúc luồng xử lý sau chiến đấu để tích hợp với hệ thống Bí Cảnh, đảm bảo tiến trình liền mạch.' },
      { type: 'fix', description: 'Cài đặt các hàm xử lý gameplay còn thiếu để tăng tính ổn định và hoàn thiện vòng lặp game.' },
      { type: 'fix', description: 'Khắc phục lỗi build nghiêm trọng do thiếu tệp hằng số (constants.ts).' },
    ],
  },
  {
    version: "3.0.0",
    date: "2024-09-13",
    changes: [
      { type: 'new', description: 'Kích hoạt Hệ thống Nhiệm vụ Động: NPC có thể tự đề xuất nhiệm vụ cho người chơi trong quá trình hội thoại.' },
      { type: 'fix', description: 'Sửa lỗi logic nghiêm trọng trong việc tính toán bonus từ bộ trang bị, đảm bảo chỉ số được cộng chính xác.' },
      { type: 'fix', description: 'Khắc phục lỗi cú pháp "Missing initializer" khiến ứng dụng không thể khởi chạy.' },
      { type: 'balance', description: 'Nâng cấp các model AI chính để cải thiện hiệu năng và tránh lỗi hạn ngạch.' },
    ],
  },
  {
    version: "2.9.7",
    date: "2024-09-12",
    changes: [
      { type: 'fix', description: 'Khắc phục lỗi cú pháp "Missing initializer in const declaration" bằng cách đảm bảo biến môi trường API_KEY được nạp đúng cách.' },
      { type: 'update', description: 'Nâng cấp các model AI chính lên `gemini-flash-latest` (tương đương 2.5 pro) để cải thiện hiệu năng và tránh lỗi hạn ngạch.' },
      { type: 'update', description: 'Khôi phục cơ chế cho phép người dùng nhập API Key trong phần Cài đặt làm phương án dự phòng.' },
    ],
  },
  {
    version: "2.6.0",
    date: "2024-09-10",
    changes: [
      { type: 'new', description: 'Hoàn thiện hệ thống Chiến đấu: Quái vật giờ đây xuất hiện ngẫu nhiên dựa trên địa hình.' },
      { type: 'new', description: 'Kích hoạt cơ chế Thăng cấp & Đột phá: Nhân vật nhận EXP và tăng sức mạnh thực tế sau chiến đấu.' },
      { type: 'update', description: 'Hội thoại NPC thông minh: Kết nối API để NPC phản hồi dựa trên tính cách và độ thân thiết.' },
      { type: 'fix', description: 'Sửa lỗi các nút chức năng bị vô hiệu hóa (Combat, Dialogue).' },
    ],
  },
  {
    version: "2.5.3",
    date: "2024-09-09",
    changes: [
      { type: 'balance', description: 'Đại tu sức mạnh Thú Cưng: Tăng mạnh các hệ số HP, Tấn công và Phòng thủ để thú cưng đóng vai trò quan trọng hơn (Tanker/DPS) ở giai đoạn sau.' },
      { type: 'new', description: 'Cơ chế Tiến Hóa Thú Cưng: Thú cưng đã tiến hóa nhận thêm 20% chỉ số tổng và khả năng Hút máu (Lifesteal) bẩm sinh.' },
    ],
  },
  {
    version: "2.5.2",
    date: "2024-09-08",
    changes: [
      { type: 'balance', description: 'Cân bằng lại toàn bộ hệ thống chỉ số: Tăng mạnh HP và Thủ của nhân vật để phù hợp với phong cách Tiên Hiệp.' },
      { type: 'balance', description: 'Điều chỉnh công thức tính sát thương vật lý và phép thuật, tăng ảnh hưởng của các chỉ số chính (STR/INT).' },
      { type: 'balance', description: 'Cập nhật chỉ số cho Thú Cưng để chúng hữu dụng hơn trong chiến đấu.' },
    ],
  },
  {
    version: "2.5.1",
    date: "2024-09-08",
    changes: [
      { type: 'balance', description: 'Cân bằng lại chỉ số Người Chơi: Tăng mạnh HP, ATK và DEF từ các chỉ số gốc để phù hợp với bối cảnh Tiên Hiệp.' },
      { type: 'balance', description: 'Cân bằng lại Quái Vật: Tăng chỉ số theo cấp độ và áp dụng chính xác hệ số sức mạnh theo Cấp bậc (Thường/Tinh Anh/Thủ Lĩnh).' },
      { type: 'balance', description: 'Hệ thống chiến đấu: Tăng sát thương chí mạng lên 175% và thêm cơ chế sát thương tối thiểu dựa trên cấp độ.' },
    ],
  },
  {
    version: "2.5.0",
    date: "2024-09-08",
    changes: [
      { type: 'new', description: 'Hệ thống Nhiệm Vụ Tông Môn Động (Dynamic Quest): Sử dụng Gemini để tạo nhiệm vụ dựa trên cốt truyện và cấp bậc.' },
      { type: 'update', description: 'Nâng cấp AI Dẫn Truyện (GM): Kích hoạt Thinking Model, giúp phản hồi hành động người chơi thông minh và mạch lạc hơn.' },
      { type: 'balance', description: 'Cân bằng lại chỉ số HP và Tấn Công giai đoạn giữa game.' },
    ],
  },
  {
    version: "2.4.0",
    date: "2024-09-08",
    changes: [
      { type: 'new', description: 'Thêm tính năng lồng tiếng AI (TTS) cho các đoạn hội thoại NPC.' },
      { type: 'update', description: 'Nâng cấp trải nghiệm hội thoại với âm thanh sống động.' },
      { type: 'fix', description: 'Cải thiện hiển thị giao diện đối thoại trên thiết bị di động.' },
    ],
  },
  {
    version: "2.3.0",
    date: "2024-09-05",
    changes: [
      { type: 'update', description: 'Nâng cấp AI Core lên model mạnh hơn cho khả năng sáng tạo thế giới và nhân vật vượt trội.' },
      { type: 'new', description: 'Tích hợp mô hình tư duy (Thinking Model) giúp thế giới được tạo ra logic và có chiều sâu hơn.' },
      { type: 'balance', description: 'Tối ưu hóa tốc độ phản hồi cho các hành động trong game.' },
    ],
  },
];