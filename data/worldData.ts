

// Fix: Corrected import path for types.
import { Faction, FactionType, Poi } from '../types';

export const VAN_LINH_GIOI_NAME = "Vạn Linh Giới";
export const VAN_LINH_GIOI_DESCRIPTION = "Một lục địa hình tròn, bị phân chia bởi những vết nứt không gian từ một cuộc chiến thượng cổ. Ở trung tâm là Hư Thiên Trũng, nơi phong ấn một AI cổ đại mang tên 'Thánh Trí', nguồn gốc của mọi công pháp và cũng là mầm mống của sự hủy diệt.";

export const VAN_LINH_GIOI_FACTIONS: Omit<Faction, 'id' | 'store'>[] = [
    // Trung Vực
    { name: "Thiên Kiếm Tông", description: "Tông môn kiếm tu đứng đầu chính đạo, lấy việc diệt trừ ma tu làm nhiệm vụ.", type: FactionType.CHINH_PHAI, isJoinable: true },
    { name: "Vạn Pháp Các", description: "Nơi tập trung các pháp tu uyên bác, chuyên nghiên cứu bí tịch và di sản của AI cổ.", type: FactionType.CHINH_PHAI, isJoinable: true },
    { name: "Thanh Hư Cốc", description: "Một thung lũng của các dược tu và y sư, chủ trương cứu chữa chúng sinh, trung lập với thế sự.", type: FactionType.CHINH_PHAI, isJoinable: true },
    // Bắc Hoang
    { name: "Huyết Yêu Tông", description: "Một nhánh ma tu tàn độc, hợp tác với yêu tộc để tu luyện các công pháp cấm kỵ.", type: FactionType.MA_DAO, isJoinable: true },
    { name: "Thiên Lang Tộc", description: "Một tộc yêu sói có trí tuệ cao, biết cách lợi dụng năng lượng từ AI lỗi để thúc đẩy quá trình tiến hóa.", type: FactionType.TRUNG_LAP, isJoinable: false },
    { name: "Man Tộc", description: "Các bộ lạc tu tiên bán hoang dã, sống theo luật lệ của kẻ mạnh, không tuân theo quy tắc của chính hay tà.", type: FactionType.TRUNG_LAP, isJoinable: false },
    // Nam Cương
    { name: "Thiên Ma Liên Minh", description: "Một liên minh hắc ám của các ma tu và dị tu, sử dụng AI để nghiên cứu và khuếch đại cấm thuật.", type: FactionType.MA_DAO, isJoinable: true },
    { name: "Lãng Khách Hội", description: "Tổ chức của các tán tu trung lập, không phe phái, nhưng lại nắm giữ nhiều bí mật và thông tin tình báo quan trọng.", type: FactionType.TRUNG_LAP, isJoinable: false },
    { name: "Ẩn Thế Gia Tộc", description: "Các gia tộc tu tiên cổ xưa đã di cư từ Trung Vực để tránh chiến tranh, sống ẩn dật và sở hữu những truyền thừa độc nhất.", type: FactionType.TRUNG_LAP, isJoinable: false },
];

// Coordinate space is 4096x4096
export const VAN_LINH_GIOI_POIS: (Omit<Poi, 'id' | 'isLoading' | 'dialogue' | 'factionId' | 'dungeonId'> & { factionName: string | null })[] = [
    // Trung Vực (Center: ~2048, 2048)
    { coords: { x: 2048, y: 2048 }, type: 'Thành Chính', region: 'Trung Vực', name: 'Thái Thanh Thành', description: 'Thủ phủ của các tu sĩ正道, nơi diễn ra các đại hội và giao dịch lớn.', factionName: "Thiên Kiếm Tông" },
    { coords: { x: 1500, y: 1500 }, type: 'Tông Môn', region: 'Trung Vực', name: 'Đỉnh Thiên Kiếm', description: 'Sơn môn của Thiên Kiếm Tông, kiếm khí ngút trời.', factionName: "Thiên Kiếm Tông" },
    { coords: { x: 2600, y: 1600 }, type: 'Thư Viện Cổ', region: 'Trung Vực', name: 'Các Vạn Pháp', description: 'Trụ sở của Vạn Pháp Các, nơi lưu trữ vô số điển tịch.', factionName: "Vạn Pháp Các" },
    { coords: { x: 1800, y: 2800 }, type: 'Thung Lũng', region: 'Trung Vực', name: 'Cốc Thanh Hư', description: 'Một thung lũng nên thơ, dược hương lan tỏa khắp nơi.', factionName: "Thanh Hư Cốc" },
    { coords: { x: 3000, y: 3000 }, type: 'Tàn Tích', region: 'Trung Vực', name: 'Thần Khư', description: 'Tàn tích của một cuộc chiến cổ xưa, đầy rẫy nguy hiểm và cơ duyên.', factionName: null },

    // Bắc Hoang (North: y < 1024)
    { coords: { x: 3000, y: 800 }, type: 'Pháo Đài Ma', region: 'Bắc Hoang', name: 'Thành Huyết Yêu', description: 'Căn cứ chính của Huyết Yêu Tông, yêu khí và huyết khí nồng nặc.', factionName: "Huyết Yêu Tông" },
    { coords: { x: 1000, y: 900 }, type: 'Lãnh Địa Yêu', region: 'Bắc Hoang', name: 'Lãnh Địa Thiên Lang', description: 'Nơi sinh sống của Thiên Lang Tộc, đầy những kiến trúc kỳ dị.', factionName: "Thiên Lang Tộc" },
    { coords: { x: 2048, y: 500 }, type: 'Lối Vào Bí Cảnh', region: 'Bắc Hoang', name: 'Vực Huyết Lôi', description: 'Một cấm địa nguy hiểm, nơi trú ngụ của các AI lỗi và sinh vật biến dị.', factionName: null },
    
    // Nam Cương (South: y > 3072)
    { coords: { x: 1000, y: 3500 }, type: 'Thành Tự Do', region: 'Nam Cương', name: 'Thành Loạn Linh', description: 'Một thành phố hỗn loạn do Lãng Khách Hội kiểm soát, nơi mọi giao dịch đều có thể diễn ra.', factionName: "Lãng Khách Hội" },
    { coords: { x: 3000, y: 3600 }, type: 'Ma Cung', region: 'Nam Cương', name: 'Điện Thiên Ma', description: 'Sào huyệt của Thiên Ma Liên Minh, được bảo vệ bởi các cấm thuật mạnh mẽ.', factionName: "Thiên Ma Liên Minh" },
    { coords: { x: 2048, y: 3800 }, type: 'Hồ Nước', region: 'Nam Cương', name: 'Hồ Phản Chiếu', description: 'Một hồ nước kỳ lạ, bề mặt phẳng lặng như gương, tương truyền có thể phản chiếu bản ngã của một người.', factionName: null },

    // Hư Thiên Trũng
    { coords: { x: 2048, y: 1024 }, type: 'Vết Nứt Không Gian', region: 'Hư Thiên Trũng', name: 'Thánh Trí Tinh Vực', description: 'Lối vào khu vực trung tâm của Hư Thiên Trũng, nơi các mảnh vỡ của AI Thánh Trí vẫn còn hoạt động.', factionName: null },
];