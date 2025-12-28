// Test script for EntityExportManager functionality
// Run this in browser console to test the export system

console.log('🧪 Testing EntityExportManager functionality...');

// Mock game state for testing
const mockGameState = {
    turnCount: 7,
    worldData: {
        characterName: 'TestCharacter'
    },
    knownEntities: {
        'naruto_uzumaki': {
            name: 'Naruto Uzumaki',
            type: 'companion',
            description: 'Ninja trẻ tuổi với ước mơ trở thành Hokage',
            personality: 'Năng động, lạc quan, không bao giờ từ bỏ',
            skills: ['Kage Bunshin no Jutsu', 'Rasengan'],
            relationship: 'Bạn thân',
            realm: 'Genin',
            location: 'Konoha Village'
        },
        'sasuke_uchiha': {
            name: 'Sasuke Uchiha',
            type: 'companion', 
            description: 'Thiên tài của gia tộc Uchiha, tìm kiếm sức mạnh',
            personality: 'Lạnh lùng, kiêu hãnh, quyết tâm',
            skills: ['Sharingan', 'Chidori', 'Katon Goukakyuu'],
            relationship: 'Bạn/Đối thủ',
            realm: 'Genin',
            location: 'Konoha Village'
        },
        'ichiraku_ramen': {
            name: 'Ichiraku Ramen',
            type: 'location',
            description: 'Quán ramen nổi tiếng ở Konoha',
            location: 'Konoha Village'
        },
        'kunai': {
            name: 'Kunai',
            type: 'item',
            description: 'Dao ném ninja cơ bản',
            owner: 'pc',
            equippable: true,
            equipped: true
        },
        'konoha_village': {
            name: 'Konoha Village',
            type: 'location',
            description: 'Làng Lá Ẩn, một trong những làng ninja mạnh nhất'
        },
        'archived_entity': {
            name: 'Archived Entity',
            type: 'npc',
            description: 'This should not be exported',
            archived: true,
            archivedAt: 5
        }
    }
};

// Test configuration
console.log('🔧 Testing EntityExportManager configuration...');
if (typeof EntityExportManager !== 'undefined') {
    EntityExportManager.configure({
        enabled: true,
        exportInterval: 7,
        enableDebugLogging: true,
        exportPath: '/data/game-exports/',
        maxFileSize: 1024 * 1024
    });
    console.log('✅ Configuration successful');
} else {
    console.error('❌ EntityExportManager not found - make sure to run this in the game context');
}

// Test shouldExport function
console.log('📊 Testing shouldExport logic...');
if (typeof EntityExportManager !== 'undefined') {
    const shouldExport7 = EntityExportManager.shouldExport(7);
    const shouldExport8 = EntityExportManager.shouldExport(8);
    const shouldExport14 = EntityExportManager.shouldExport(14);
    
    console.log(`Turn 7 should export: ${shouldExport7} (expected: true)`);
    console.log(`Turn 8 should export: ${shouldExport8} (expected: false)`);
    console.log(`Turn 14 should export: ${shouldExport14} (expected: true)`);
} else {
    console.log('⏭️ Skipping shouldExport test - EntityExportManager not available');
}

// Test export functionality
console.log('💾 Testing export functionality...');
if (typeof EntityExportManager !== 'undefined') {
    EntityExportManager.exportEntities(mockGameState)
        .then(success => {
            if (success) {
                console.log('✅ Export test successful! Check your downloads folder for exported files.');
                console.log('📋 Export status:', EntityExportManager.getExportStatus());
            } else {
                console.log('❌ Export test failed');
            }
        })
        .catch(error => {
            console.error('🚨 Export test error:', error);
        });
} else {
    console.log('⏭️ Skipping export test - EntityExportManager not available');
}

// Test status reporting
console.log('📈 Getting export status...');
if (typeof EntityExportManager !== 'undefined') {
    setTimeout(() => {
        const status = EntityExportManager.getExportStatus();
        console.log('📊 Current export status:', status);
    }, 1000);
}

console.log('🏁 EntityExportManager test script completed!');
console.log('To test in actual game:');
console.log('1. Start a new game or load existing save');
console.log('2. Perform 7+ actions to trigger auto-export');
console.log('3. Check browser downloads for exported files');
console.log('4. Check console for debug logs');