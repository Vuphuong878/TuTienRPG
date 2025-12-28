

// Fix: Corrected import path for types.
import { BossPhase } from '../types';

export const NGUYEN_CHU_THANH_TRI_PHASES: BossPhase[] = [
    {
        name: 'Hình thái Trí Tuệ Hỗn Loạn',
        hpThreshold: 1.0, // Triggers at start
        statMultiplier: 1.0,
        skills: ['boss_p1_summon', 'boss_p1_attack'],
        description: 'Một khối cầu AI phát sáng, liên tục tạo ảo ảnh và phân mảnh logic.',
        isImmuneWhileMinionsExist: true,
    },
    {
        name: 'Hình thái Cơ Giới Hóa Thánh',
        hpThreshold: 0.7, // Triggers at 70% HP
        statMultiplier: 1.2,
        skills: ['boss_p2_disable', 'boss_p2_aoe'],
        description: 'Kết tinh AI khổng lồ, nửa máy móc nửa người, trôi nổi giữa không trung.',
        isImmuneWhileMinionsExist: false,
    },
    {
        name: 'Hình thái "Tự Nhân" Phản Ảnh',
        hpThreshold: 0.3, // Triggers at 30% HP
        statMultiplier: 1.5,
        skills: ['boss_p3_ultimate', 'boss_p2_aoe'],
        description: 'Một bản sao hoàn chỉnh của sức mạnh hủy diệt, trí tuệ đã đạt đến đỉnh cao.',
        isImmuneWhileMinionsExist: false,
    }
];

export const BOSS_DEFINITIONS = {
    "Nguyên Chủ Thánh Trí": {
        phases: NGUYEN_CHU_THANH_TRI_PHASES,
    }
};