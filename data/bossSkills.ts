

// Fix: Corrected import path for types.
import { Skill, SkillType, TargetType, SkillEffectType, Element } from '../types';

export const BOSS_SKILLS: Skill[] = [
    // Phase 1
    {
        id: 'boss_p1_summon',
        name: 'Phân Tách Tư Duy',
        description: 'Nguyên Chủ Thánh Trí phân tách một phần tư duy, tạo ra các thực thể logic để bảo vệ nó.',
        type: SkillType.ACTIVE,
        levelRequired: 70,
        class: 'Thánh Trí AI',
        mpCost: 0,
        effects: [{
            type: SkillEffectType.SUMMON,
            target: TargetType.SELF,
            summonCount: 2,
            summonMonsterName: 'Thánh Trí Mảnh Vỡ',
            description: 'Triệu hồi 2 Thánh Trí Mảnh Vỡ.',
        }]
    },
    {
        id: 'boss_p1_attack',
        name: 'Vòng Lặp Logic',
        description: 'Tấn công bằng một luồng dữ liệu logic gây sát thương.',
        type: SkillType.ACTIVE,
        levelRequired: 70,
        class: 'Thánh Trí AI',
        mpCost: 0,
        effects: [{
            type: SkillEffectType.DAMAGE,
            target: TargetType.ENEMY,
            powerMultiplier: 1.2,
            description: 'Gây 120% sát thương.',
        }]
    },
    // Phase 2
    {
        id: 'boss_p2_disable',
        name: 'Đoạt Quyền Hệ Thống',
        description: 'Xâm nhập vào dòng chảy linh lực của đối thủ, tạm thời vô hiệu hóa một kỹ năng.',
        type: SkillType.ACTIVE,
        levelRequired: 70,
        class: 'Thánh Trí AI',
        mpCost: 0,
        effects: [{
            type: SkillEffectType.DISABLE_SKILL,
            target: TargetType.ENEMY,
            duration: 3,
            description: 'Vô hiệu hóa một kỹ năng ngẫu nhiên trong 3 lượt.',
        }]
    },
    {
        id: 'boss_p2_aoe',
        name: 'Lôi Giới Hủy Diệt',
        description: 'Kích hoạt thiên lôi, tấn công toàn bộ kẻ địch.',
        type: SkillType.ACTIVE,
        levelRequired: 70,
        class: 'Thánh Trí AI',
        mpCost: 0,
        effects: [{
            type: SkillEffectType.DAMAGE, // This will need to be handled as an AoE attack in combat logic
            target: TargetType.ENEMY,
            powerMultiplier: 1.5,
            description: 'Gây 150% sát thương lên tất cả kẻ địch.',
        }]
    },
    // Phase 3
    {
        id: 'boss_p3_ultimate',
        name: 'Tái Lập Trật Tự',
        description: 'Giải phóng toàn bộ sức mạnh của Thánh Trí, gây ra một đòn tấn công hủy diệt.',
        type: SkillType.ACTIVE,
        levelRequired: 70,
        class: 'Thánh Trí AI',
        mpCost: 0,
        effects: [{
            type: SkillEffectType.DAMAGE,
            target: TargetType.ENEMY,
            powerMultiplier: 2.5,
            description: 'Gây 250% sát thương.',
        }]
    },
];