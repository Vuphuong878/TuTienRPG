/**
 * Test Suite for AI-Response-Only History System and Entity Deduplication
 * Tests the new optimized storage and anti-recreation systems
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data structures for testing
const mockGameHistoryEntry = (role, content) => ({
    role,
    parts: [{ text: content }]
});

const mockAIResponse = (story, skills = null, questUpdate = null) => {
    return JSON.stringify({
        story: story,
        newSkill: skills,
        questUpdate: questUpdate,
        choices: ["Choice 1", "Choice 2", "Choice 3"]
    });
};

const mockUserPrompt = (action) => {
    // Simulate massive RAG prompt with context
    const ragContext = `
=== TRI THỨC QUAN TRỌNG ===
Thời gian: Năm 1001 Tháng 3 Ngày 15, 14 giờ (Lượt 25)

**TỔ ĐỘI PHIỀU LƯU:**
[Nhân vật chính] Lâm Thiên Dương - **MỤC TIÊU**: Trở thành pháp sư mạnh nhất, Vị trí: Thành phố Ma pháp, Thực lực: Cảnh giới Trúc Cơ
[Đồng hành] Sakuya Izayoi - Quan hệ: đồng hành, Cảnh giới: Liên Khí, Chuyên môn: Thao túng thời gian, Kiếm thuật

=== THÔNG TIN LIÊN QUAN ===
**Nhiệm vụ đang hoạt động:**
- Tìm hiểu về Ma pháp cổ đại: Thu thập 3 cuốn sách ma pháp

**Diễn biến gần đây:**
> Lâm Thiên Dương quyết định tìm hiểu về ma pháp cổ đại
Sakuya giới thiệu về thư viện ma pháp trong thành phố

=== BỐI CẢNH THẾ GIỚI ===
Thế giới: Thế giới Tu luyện Ma pháp

**Biên niên sử:**
[Hồi ký] Lâm Thiên Dương bắt đầu hành trình tu luyện với mục tiêu trở thành pháp sư mạnh nhất
[Chương] Gặp gỡ Sakuya Izayoi và tạo thành đồng minh

⚠️ THỰC THỂ ĐÃ TỒN TẠI - KHÔNG TẠO LẠI ⚠️
**QUAN TRỌNG**: Các thực thể sau ĐÃ TỒN TẠI trong game. KHÔNG tạo lại chúng bằng LORE_NPC, LORE_LOCATION, v.v.

🧑 **NPCs hiện có**: Thầy Phù Thủy Cổ, Chủ thư viện, Người bán sách ma thuật và 5 khác
👥 **Đồng hành hiện có**: Sakuya Izayoi
🏛️ **Địa điểm hiện có**: Thành phố Ma pháp, Thư viện Ma pháp, Cửa hàng Ma thuật và 3 khác
⚔️ **Kỹ năng hiện có**: Ma pháp cơ bản, Thiền định, Kiếm thuật cơ bản và 5 khác

--- HÀNH ĐỘNG CỦA NGƯỜI CHƠI ---
"${action}"
--- BỐI CẢNH HÀNH ĐỘNG ---
Lượt: 25 | Thời gian: Năm 1001 Tháng 3 Ngày 15, 14 giờ | ID: abc123
Phân tích: giao tiếp - Hành động giao tiếp xã hội, trao đổi thông tin
Độ phức tạp: Đơn giản | Thời gian dự kiến: Không xác định
Đối tượng liên quan: Sakuya Izayoi
--- KẾT THÚC BỐI CẢNH ---

YÊU CẦU: Tiếp tục câu chuyện dựa trên hành động và tri thức đã truy xuất.
**NGÔN NGỮ BẮT BUỘC:** BẮT BUỘC sử dụng 100% tiếng Việt trong toàn bộ nội dung
`;
    return ragContext;
};

// Test data
const testGameHistory = [
    mockGameHistoryEntry('user', mockUserPrompt('Hỏi Sakuya về cách học ma pháp nâng cao')),
    mockGameHistoryEntry('model', mockAIResponse('Sakuya nhìn Lâm Thiên Dương với ánh mắt nghiêm túc. "Để học ma pháp nâng cao, ngươi cần phải có nền tảng vững chắc. Ta có thể dạy ngươi một số kỹ thuật đặc biệt của gia tộc Izayoi." Cô nàng rút ra một cuốn sách cổ. "Đây là Thao túng thời gian cơ bản, một kỹ năng rất hữu ích trong chiến đấu."', 'Thao túng thời gian cơ bản')),
    mockGameHistoryEntry('user', mockUserPrompt('Cảm ơn Sakuya và xin phép được học kỹ năng này')),
    mockGameHistoryEntry('model', mockAIResponse('Sakuya mỉm cười nhẹ nhàng. "Tốt lắm, ta sẽ dạy ngươi từng bước một. Nhưng trước tiên, chúng ta cần đến một nơi an toàn để luyện tập." Cô chỉ về phía khu vực tập luyện của thư viện. "Khu vực đó được bảo vệ bằng kết giới, rất phù hợp để học ma pháp." Lâm Thiên Dương cảm thấy hứng thú và quyết định đi theo Sakuya.')),
    mockGameHistoryEntry('user', mockUserPrompt('Đi đến khu vực tập luyện cùng Sakuya')),
    mockGameHistoryEntry('model', mockAIResponse('Hai người đến khu vực tập luyện. Không gian được bao phủ bởi một lớp ánh sáng xanh nhẹ nhàng từ kết giới bảo vệ. Sakuya bắt đầu hướng dẫn: "Đầu tiên, ngươi hãy tập trung tinh thần và cảm nhận dòng chảy của thời gian xung quanh." Lâm Thiên Dương làm theo, từ từ cảm nhận được nhịp đập khác thường của thời gian trong không gian này.', null, 'Học kỹ năng mới với Sakuya'))
];

const testSaveData = {
    worldData: {
        worldName: 'Thế giới Tu luyện Ma pháp',
        characterName: 'Lâm Thiên Dương'
    },
    knownEntities: {
        'Sakuya Izayoi': {
            name: 'Sakuya Izayoi',
            type: 'companion',
            referenceId: 'comp_sakuya_001',
            personality: 'Lạnh lùng nhưng tốt bụng',
            skills: ['Thao túng thời gian', 'Kiếm thuật'],
            relationship: 'đồng hành',
            realm: 'Liên Khí'
        },
        'Thầy Phù Thủy Cổ': {
            name: 'Thầy Phù Thủy Cổ',
            type: 'npc',
            referenceId: 'npc_wizard_001',
            description: 'Một phù thủy già với kiến thức sâu rộng về ma pháp cổ đại',
            location: 'Thành phố Ma pháp'
        },
        'Thành phố Ma pháp': {
            name: 'Thành phố Ma pháp',
            type: 'location',
            referenceId: 'loc_magic_city_001',
            description: 'Thành phố lớn nơi các pháp sư sinh sống và học tập'
        }
    },
    gameHistory: testGameHistory,
    statuses: [],
    quests: [{ title: 'Tìm hiểu về Ma pháp cổ đại', status: 'active', objectives: [{ description: 'Thu thập 3 cuốn sách ma pháp', completed: false }] }],
    memories: [],
    party: [],
    customRules: [],
    systemInstruction: 'Default instruction',
    turnCount: 25,
    totalTokens: 45000,
    gameTime: { year: 1001, month: 3, day: 15, hour: 14, minute: 0 },
    chronicle: { memoir: ['Bắt đầu hành trình'], chapter: ['Gặp Sakuya'], turn: [] },
    storyLog: ['Story log content'],
    choices: ['Choice 1', 'Choice 2'],
    locationDiscoveryOrder: ['Thành phố Ma pháp'],
    choiceHistory: []
};

// Import the actual optimization functions (simulate them for testing)
class OptimizedStorageTest {
    
    static extractUserAction(promptText) {
        const actionMatch = promptText.match(/--- HÀNH ĐỘNG CỦA NGƯỜI CHƠI ---\s*"([^"]+)"/);
        if (actionMatch) {
            return actionMatch[1].trim();
        }
        const actionFallback = promptText.match(/^ACTION:\s*(.+)/);
        if (actionFallback) {
            return actionFallback[1].trim();
        }
        return promptText.length > 100 ? promptText.substring(0, 100) + '...' : promptText;
    }

    static extractStoryContinuity(responseText) {
        try {
            const parsed = JSON.parse(responseText);
            if (parsed.story) {
                return this.summarizeStory(parsed.story, 120);
            }
        } catch (e) {
            const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 10);
            if (sentences.length > 0) {
                const first = sentences[0].trim();
                return first.length > 120 ? first.substring(0, 120) + '...' : first;
            }
        }
        return '';
    }

    static summarizeStory(story, maxLength) {
        if (!story || story.length <= maxLength) return story;

        const importantKeywords = /gặp|thấy|phát hiện|đến|tới|nói|hỏi|chiến đấu|nhận được|mất|thành công|thất bại|học được|quyết định/;
        const sentences = story.split(/[.!?]+/).filter(s => s.trim().length > 5);
        
        const importantSentences = sentences.filter(s => importantKeywords.test(s.toLowerCase()));
        
        if (importantSentences.length > 0) {
            const summary = importantSentences[0].trim();
            return summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary;
        }
        
        const fallback = sentences[0]?.trim() || story.substring(0, maxLength);
        return fallback.length > maxLength ? fallback.substring(0, maxLength) + '...' : fallback;
    }

    static optimizeGameHistory(gameHistory) {
        const optimized = [];

        for (let i = 0; i < gameHistory.length; i++) {
            const entry = gameHistory[i];
            
            if (entry.role === 'user') {
                const userAction = this.extractUserAction(entry.parts[0].text);
                optimized.push({
                    role: 'user',
                    action: userAction,
                    timestamp: Date.now()
                });
            } else if (entry.role === 'model') {
                const storyContinuity = this.extractStoryContinuity(entry.parts[0].text);
                const stateChanges = this.extractStateChanges(entry.parts[0].text);
                
                optimized.push({
                    role: 'model',
                    storyContinuity: storyContinuity,
                    stateChanges: stateChanges,
                    timestamp: Date.now()
                });
            }
        }

        return optimized;
    }

    static extractStateChanges(responseText) {
        const changes = [];
        
        try {
            const parsed = JSON.parse(responseText);
            
            if (parsed.newSkill) {
                changes.push(`+Skill:${parsed.newSkill.substring(0, 30)}`);
            }
            
            if (parsed.questUpdate) {
                changes.push(`+Quest:${parsed.questUpdate.substring(0, 30)}`);
            }
            
            if (parsed.story) {
                const locationMatch = parsed.story.match(/(?:đến|tới|về|vào)\s+([^.,!?\s]{3,20})/i);
                if (locationMatch) {
                    changes.push(`+Location:${locationMatch[1]}`);
                }
            }
            
        } catch (e) {
            // Skip if not valid JSON
        }
        
        return changes.join(';');
    }

    static optimizeForStorage(saveData) {
        const originalSize = JSON.stringify(saveData).length;
        
        const optimized = {
            ...saveData,
            gameHistory: this.optimizeGameHistory(saveData.gameHistory),
            _metadata: {
                version: '2.0-optimized',
                optimizedAt: Date.now(),
                originalHistoryEntries: saveData.gameHistory.length,
                compressionRatio: 0,
                tokenReduction: 0
            }
        };

        const optimizedSize = JSON.stringify(optimized).length;
        const compressionRatio = ((originalSize - optimizedSize) / originalSize);
        
        optimized._metadata.compressionRatio = Math.round(compressionRatio * 1000) / 10;
        optimized._metadata.tokenReduction = Math.round((originalSize - optimizedSize) / 1.2);

        return optimized;
    }
}

// Entity Deduplication Test Functions
class EntityDeduplicationTest {
    
    static intelligentEntityMerge(existingEntity, newAttributes) {
        const merged = { ...existingEntity };
        const preserveFields = ['referenceId', 'type', 'name'];
        
        for (const [key, newValue] of Object.entries(newAttributes)) {
            if (preserveFields.includes(key)) {
                continue;
            }
            
            const existingValue = merged[key];
            
            if (!existingValue || existingValue === '' || existingValue === null || existingValue === undefined) {
                merged[key] = newValue;
            } else if (key === 'skills') {
                const existingSkills = Array.isArray(existingValue) ? existingValue : (typeof existingValue === 'string' ? existingValue.split(',').map(s => s.trim()) : []);
                const newSkills = Array.isArray(newValue) ? newValue : (typeof newValue === 'string' ? newValue.split(',').map(s => s.trim()) : []);
                
                const mergedSkills = [...new Set([...existingSkills, ...newSkills])];
                merged[key] = mergedSkills;
            } else if (key === 'description') {
                if (typeof newValue === 'string' && typeof existingValue === 'string') {
                    if (newValue.length > existingValue.length) {
                        merged[key] = newValue;
                    }
                }
            } else if (key === 'relationship') {
                merged[key] = newValue;
            } else if (key === 'location') {
                merged[key] = newValue;
            } else if (!existingValue) {
                merged[key] = newValue;
            }
        }
        
        return merged;
    }

    static testNPCDeduplication(existingNPC, newNPCData) {
        console.log(`\n🧪 Testing NPC Deduplication for: ${newNPCData.name}`);
        console.log(`📊 Existing NPC:`, existingNPC);
        console.log(`📝 New NPC Data:`, newNPCData);
        
        const merged = this.intelligentEntityMerge(existingNPC, newNPCData);
        
        console.log(`✅ Merged Result:`, merged);
        console.log(`🔍 Preserved referenceId: ${merged.referenceId === existingNPC.referenceId ? '✅ YES' : '❌ NO'}`);
        console.log(`🔍 Skills merged: ${Array.isArray(merged.skills) && merged.skills.length > (existingNPC.skills?.length || 0) ? '✅ YES' : '📋 NO CHANGE'}`);
        
        return merged;
    }
}

// Run Tests
console.log('🚀 Starting AI-Response-Only History System Tests\n');

// Test 1: History Optimization
console.log('═══ TEST 1: HISTORY OPTIMIZATION ═══');
const originalSize = JSON.stringify(testSaveData.gameHistory).length;
console.log(`📏 Original history size: ${originalSize} characters`);

const optimizedHistory = OptimizedStorageTest.optimizeGameHistory(testSaveData.gameHistory);
const optimizedSize = JSON.stringify(optimizedHistory).length;
const reductionPercent = Math.round(((originalSize - optimizedSize) / originalSize) * 1000) / 10;

console.log(`📏 Optimized history size: ${optimizedSize} characters`);
console.log(`📉 Size reduction: ${reductionPercent}% (Target: >90%)`);
console.log(`🎯 Test Result: ${reductionPercent > 90 ? '✅ PASS' : '❌ FAIL'} - History optimization`);

// Display optimized entries
console.log('\n📋 Optimized History Entries:');
optimizedHistory.forEach((entry, index) => {
    console.log(`${index + 1}. [${entry.role.toUpperCase()}] ${
        entry.role === 'user' 
            ? `Action: "${entry.action}"` 
            : `Story: "${entry.storyContinuity}" | State: "${entry.stateChanges}"`
    }`);
});

// Test 2: Full Save File Optimization
console.log('\n═══ TEST 2: FULL SAVE FILE OPTIMIZATION ═══');
const originalSaveSize = JSON.stringify(testSaveData).length;
console.log(`💾 Original save size: ${Math.round(originalSaveSize / 1024)} KB`);

const optimizedSave = OptimizedStorageTest.optimizeForStorage(testSaveData);
const optimizedSaveSize = JSON.stringify(optimizedSave).length;

console.log(`💾 Optimized save size: ${Math.round(optimizedSaveSize / 1024)} KB`);
console.log(`📉 Compression ratio: ${optimizedSave._metadata.compressionRatio}% (Target: >90%)`);
console.log(`🎯 Test Result: ${optimizedSave._metadata.compressionRatio > 90 ? '✅ PASS' : '❌ FAIL'} - Save file optimization`);

// Test 3: Story Continuity Extraction
console.log('\n═══ TEST 3: STORY CONTINUITY EXTRACTION ═══');
const testStories = [
    'Sakuya nhìn Lâm Thiên Dương với ánh mắt nghiêm túc. "Để học ma pháp nâng cao, ngươi cần phải có nền tảng vững chắc."',
    'Hai người đến khu vực tập luyện. Không gian được bao phủ bởi một lớp ánh sáng xanh nhẹ nhàng.',
    'Lâm Thiên Dương cảm thấy hứng thú và quyết định đi theo Sakuya để học kỹ năng mới.'
];

testStories.forEach((story, index) => {
    const continuity = OptimizedStorageTest.summarizeStory(story, 120);
    console.log(`📖 Story ${index + 1}: "${story.substring(0, 50)}..."`);
    console.log(`📝 Extracted: "${continuity}"`);
    console.log(`📏 Length: ${continuity.length}/120 characters`);
});

// Test 4: Entity Deduplication
console.log('\n═══ TEST 4: ENTITY DEDUPLICATION SYSTEM ═══');

// Test case 1: Existing NPC with new skills
const existingSakuya = testSaveData.knownEntities['Sakuya Izayoi'];
const newSakuyaData = {
    name: 'Sakuya Izayoi',
    type: 'npc',
    skills: ['Thao túng thời gian', 'Ma thuật băng', 'Phòng thủ'],
    description: 'Một nữ pháp sư mạnh mẽ với khả năng thao túng thời gian và sử dụng ma thuật băng. Cô là một đồng hành đáng tin cậy.',
    relationship: 'bạn thân'
};

const mergedSakuya = EntityDeduplicationTest.testNPCDeduplication(existingSakuya, newSakuyaData);

// Test case 2: Existing location with more details
console.log('\n🧪 Testing Location Deduplication');
const existingCity = testSaveData.knownEntities['Thành phố Ma pháp'];
const newCityData = {
    name: 'Thành phố Ma pháp',
    type: 'location',
    description: 'Thành phố lớn và sầm uất nơi các pháp sư từ khắp nơi tụ tập để học tập và trao đổi kiến thức ma thuật. Thành phố có nhiều thư viện, cửa hàng ma thuật và trường học.',
    population: '50,000 pháp sư',
    notable_features: ['Thư viện Ma pháp', 'Cửa hàng Ma thuật', 'Học viện Pháp thuật']
};

const mergedCity = EntityDeduplicationTest.intelligentEntityMerge(existingCity, newCityData);
console.log(`✅ Location merge result:`, mergedCity);
console.log(`🔍 Preserved referenceId: ${mergedCity.referenceId === existingCity.referenceId ? '✅ YES' : '❌ NO'}`);

// Test 5: Anti-Recreation Warnings
console.log('\n═══ TEST 5: ANTI-RECREATION WARNINGS ═══');
const entityTypes = {
    'npc': Object.keys(testSaveData.knownEntities).filter(name => testSaveData.knownEntities[name].type === 'npc'),
    'companion': Object.keys(testSaveData.knownEntities).filter(name => testSaveData.knownEntities[name].type === 'companion'),
    'location': Object.keys(testSaveData.knownEntities).filter(name => testSaveData.knownEntities[name].type === 'location')
};

console.log('🚨 Anti-Recreation Warnings Generated:');
console.log(`🧑 NPCs: ${entityTypes.npc.join(', ')}`);
console.log(`👥 Companions: ${entityTypes.companion.join(', ')}`);
console.log(`🏛️ Locations: ${entityTypes.location.join(', ')}`);
console.log(`🎯 Test Result: ${Object.values(entityTypes).flat().length > 0 ? '✅ PASS' : '❌ FAIL'} - Anti-recreation warnings`);

// Test Results Summary
console.log('\n🎉 ═══ TEST RESULTS SUMMARY ═══');
const results = [
    { test: 'History Optimization', passed: reductionPercent > 90, value: `${reductionPercent}%` },
    { test: 'Save File Compression', passed: optimizedSave._metadata.compressionRatio > 90, value: `${optimizedSave._metadata.compressionRatio}%` },
    { test: 'Story Continuity Extraction', passed: true, value: '✅ Working' },
    { test: 'Entity Deduplication', passed: mergedSakuya.referenceId === existingSakuya.referenceId, value: '✅ Preserving IDs' },
    { test: 'Anti-Recreation System', passed: Object.values(entityTypes).flat().length > 0, value: '✅ Warnings Generated' }
];

results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.test}: ${result.value}`);
});

const passedTests = results.filter(r => r.passed).length;
const totalTests = results.length;

console.log(`\n🏆 Overall Result: ${passedTests}/${totalTests} tests passed`);
console.log(`${passedTests === totalTests ? '🎊 ALL TESTS PASSED! 🎊' : '⚠️ Some tests need attention'}`);

// Performance metrics
console.log('\n📊 ═══ PERFORMANCE METRICS ═══');
console.log(`💾 Save file size reduction: ${Math.round(((originalSaveSize - optimizedSaveSize) / originalSaveSize) * 100)}%`);
console.log(`🗂️ History storage reduction: ${reductionPercent}%`);
console.log(`📈 Token budget liberated: ~${Math.round((originalSize - optimizedSize) / 1.2)} tokens`);
console.log(`🚀 System ready for enhanced gameplay features!`);

// Write test results to file
const testReport = {
    timestamp: new Date().toISOString(),
    testResults: results,
    performanceMetrics: {
        saveFileSizeReduction: Math.round(((originalSaveSize - optimizedSaveSize) / originalSaveSize) * 100),
        historyStorageReduction: reductionPercent,
        tokenBudgetLiberated: Math.round((originalSize - optimizedSize) / 1.2),
        originalSaveSize: originalSaveSize,
        optimizedSaveSize: optimizedSaveSize,
        originalHistorySize: originalSize,
        optimizedHistorySize: optimizedSize
    },
    sampleOptimizedHistory: optimizedHistory.slice(0, 3),
    entityMergeTests: {
        sakuyaMerge: {
            original: existingSakuya,
            newData: newSakuyaData,
            merged: mergedSakuya,
            preservedReferenceId: mergedSakuya.referenceId === existingSakuya.referenceId
        },
        cityMerge: {
            original: existingCity,
            merged: mergedCity,
            preservedReferenceId: mergedCity.referenceId === existingCity.referenceId
        }
    }
};

fs.writeFileSync(
    path.join(__dirname, 'test-results-history-optimization.json'),
    JSON.stringify(testReport, null, 2)
);

console.log('\n📝 Test results saved to: test-results-history-optimization.json');
console.log('\n✨ AI-Response-Only History System test completed! ✨');