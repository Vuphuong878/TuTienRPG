import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

// --- Firebase & App Config ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "YOUR_FALLBACK_API_KEY", 
  authDomain: "YOUR_FALLBACK_AUTH_DOMAIN",
  projectId: "YOUR_FALLBACK_PROJECT_ID",
  storageBucket: "YOUR_FALLBACK_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FALLBACK_MESSAGING_SENDER_ID",
  appId: "YOUR_FALLBACK_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ai-text-adventure-simulator-vn';

// --- Constants & Game Data ---

const PLAYER_PERSONALITIES = [
    
    'Tùy chỉnh...',
    "Dũng Cảm, Bộc Trực", "Thận Trọng, Đa Nghi", "Lạnh Lùng, Ít Nói", "Hài Hước, Thích Trêu Chọc",
    "Nhân Hậu, Vị Tha", "Trầm Tính, Thích Quan Sát", "Nhút Nhát, Hay Lo Sợ", "Tò Mò, Thích Khám Phá",
    "Trung Thành, Đáng Tin Cậy", "Lãng Mạn, Mơ Mộng", "Thực Dụng, Coi Trọng Lợi Ích", "Chính Trực, Ghét Sự Giả Dối",
    "Hoài Nghi, Luôn Đặt Câu Hỏi", "Lạc Quan, Luôn Nhìn Về Phía Trước", "Lý Trí, Giỏi Phân Tích",
    "Nghệ Sĩ, Tâm Hồn Bay Bổng", "Thích Phiêu Lưu, Không Ngại Mạo Hiểm", "Cẩn Thận Từng Chi Tiết, Cầu Toàn",
    "Hào Sảng, Thích Giúp Đỡ Người Khác", "Kiên Định, Không Dễ Bỏ Cuộc", "Khiêm Tốn, Không Khoe Khoang",
    "Sáng Tạo, Nhiều Ý Tưởng Độc Đáo", "Mưu Mẹo, Gian Xảo", "Tham Lam, Ích Kỷ", "Khó Lường, Bí Ẩn", 
    "Nóng Nảy, Liều Lĩnh", "Kiêu Ngạo, Tự Phụ", "Đa Sầu Đa Cảm, Dễ Tổn Thương", "Cố Chấp, Bảo Thủ", 
    "Lười Biếng, Thích Hưởng Thụ", "Ghen Tị, Hay So Sánh", "Thù Dai, Khó Tha Thứ", "Ba Phải, Không Có Chính Kiến"
];
const NARRATOR_PRONOUNS = [
    'Để AI quyết định',
    `Người kể là nhân vật trong truyện – thường là nhân vật chính – xưng “Tôi”, “Ta”, “Mình”, “Bản tọa”, “Lão phu”, v.v.`,
    `Người đọc/chơi chính là nhân vật chính – dùng “Bạn”, “Ngươi”, “Mày”, “Mi”, hoặc xưng hô cá biệt như “Tiểu tử”, “Cô nương”, v.v.`,
    `Người kể đứng ngoài câu chuyện, gọi nhân vật là “Anh ta”, “Cô ấy”, “Hắn”, “Nàng”, “Gã”, v.v.`,
];

const changelogData = [
    {
        version: "3.4.1 (Xóa Tình Cảm Thủ Công)",
        date: "05/08/2025",
        changes: [
            { type: "NEW", text: "Thêm chức năng xóa thủ công các trạng thái tình cảm của NPC trong tab 'Tương Tác'." },
            { type: "IMPROVE", text: "Người chơi giờ đây có toàn quyền kiểm soát các mối quan hệ, có thể loại bỏ tình cảm không mong muốn mà không cần chờ AI tự cập nhật." },
            { type: "UI", text: "Thêm nút 'x' bên cạnh mỗi dòng tình cảm để thực hiện thao tác xóa, kèm theo hộp thoại xác nhận." },
            { type: "FIX", text: "Chức năng này hoạt động độc lập và không ảnh hưởng đến logic tự động cập nhật tình cảm của AI trong các lượt chơi tiếp theo." },
        ],
    },
    {
        version: "3.4.0 (Giao Diện Thông Tin Mới)",
        date: "03/08/2025",
        changes: [
            { type: "UI", text: "Tái cấu trúc hoàn toàn cửa sổ 'Thông Tin Nhân Vật & Thế Giới' thành giao diện tab trực quan." },
            { type: "UI", text: "Thêm các tab: 'Nhân Vật', 'Tương Tác', 'Nhiệm Vụ & Sự Kiện', và 'Thế Giới' để phân loại thông tin rõ ràng." },
            { type: "IMPROVE", text: "Cải thiện trải nghiệm người dùng, giúp dễ dàng tra cứu thông tin nhân vật, NPC, nhiệm vụ và thế giới." },
            { type: "FIX", text: "Sắp xếp lại các mục thông tin vào đúng tab tương ứng để tăng tính logic." },
        ],
    },
    {
        version: "3.3.0 (NPC Chủ Động & Giai Đoạn Hành Động)",
        date: "02/08/2025",
        changes: [
            { type: "AI", text: "Nâng cấp cốt lõi: Triển khai hệ thống 'Giai Đoạn Hành Động' để giải quyết sự thụ động của NPC." },
            { type: "AI", text: "Mỗi lượt đi của AI giờ được chia thành 2 giai đoạn: (1) Phản ứng với hành động của người chơi, (2) NPC/Thế giới chủ động hành động." },
            { type: "IMPROVE", text: "NPC giờ đây sẽ hành động độc lập dựa trên tính cách và tình hình mà không cần chờ người chơi quyết định hộ." },
            { type: "AI", text: "Thêm quy tắc cấm AI tạo lựa chọn hỏi người chơi về hành động của NPC, buộc NPC phải tự quyết." },
            { type: "FIX", text: "Khắc phục tình trạng AI 'đứng hình', chờ đợi người chơi điều khiển cả phản ứng của NPC." },
        ],
    },
    {
        version: "3.2.0 (Đối Thoại Chủ Động)",
        date: "01/08/2025",
        changes: [
            { type: "AI", text: "Nâng cấp lớn: Triển khai 'Hệ thống Đối thoại Chủ động & Có chủ đích'." },
            { type: "AI", text: "NPC giờ đây sẽ chủ động bắt chuyện khi có 'cú hích' logic từ nội tâm (tình cảm, mục tiêu, bối cảnh, tính cách)." },
            { type: "IMPROVE", text: "Lời thoại của NPC sẽ chi tiết, có hồn và phù hợp với hoàn cảnh hơn, tránh tình trạng 'biết nhiều nói ít'." },
            { type: "IMPROVE", text: "Hệ thống này hoạt động song song với 'Thế Giới Sống', tạo ra các phản ứng nhân vật tự nhiên trước các sự kiện bất ngờ." },
            { type: "AI", text: "Cập nhật `SYSTEM_RULES` để tích hợp logic đối thoại mới." },
        ],
    },
    {
        version: "3.1.1 (Sửa Lỗi Nội Tâm Ẩn)",
        date: "01/08/2025",
        changes: [
            { type: "FIX", text: "Sửa lỗi nghiêm trọng khiến AI có thể viết quá trình phân tích nội tâm của NPC ra ngoài câu chuyện." },
            { type: "AI", text: "Cập nhật `SYSTEM_RULES` để chỉ thị rõ ràng và bắt buộc AI phải giữ kín toàn bộ quá trình phân tích tâm lý, chỉ thể hiện kết quả qua hành vi của NPC." },
            { type: "IMPROVE", text: "Đảm bảo hệ thống 'Nội tâm Ẩn' hoạt động đúng như thiết kế, tăng tính chân thực và 몰입감 cho câu chuyện." },
        ],
    },
    {
        version: "3.1.0 (Hệ thống Nội tâm Ẩn)",
        date: "01/08/2025",
        changes: [
            { type: "AI", text: "Nâng cấp lớn: Triển khai 'Hệ thống Nội tâm Ẩn' cho NPC. AI giờ đây sẽ xem xét 5 yếu tố cốt lõi trước khi cập nhật tình cảm." },
            { type: "AI", text: "Tính cách, mục tiêu cá nhân, lịch sử tương tác, bối cảnh và các mối quan hệ xã hội của NPC giờ sẽ ảnh hưởng sâu sắc đến phản ứng của họ." },
            { type: "IMPROVE", text: "Việc xây dựng tình cảm với NPC giờ đây sẽ thực tế, phức tạp và đầy thử thách hơn, loại bỏ tình trạng NPC dễ dàng bị 'dắt mũi'." },
            { type: "AI", text: "Cập nhật `SYSTEM_RULES` trong prompt để tích hợp logic phân tích đa chiều mới này." },
        ],
    },
];

// --- Helper & API Functions ---
function parseKeyValueString(kvString) {
    const result = {};
    const pairRegex = /([\w\u00C0-\u017F\s]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w\u00C0-\u017F\s\d.:\/+\-_%À-ỹ]+?(?=\s*,\s*[\w\u00C0-\u017F\s]+\s*=|$)))/gu;
    let match;
    while ((match = pairRegex.exec(kvString)) !== null) {
        const key = match[1].trim();
        let value = match[2] || match[3] || match[4]; 
        if (value !== undefined) {
            const trimmedValue = value.trim();
            if (trimmedValue.toLowerCase() === 'true') result[key] = true;
            else if (trimmedValue.toLowerCase() === 'false') result[key] = false;
            else if (/^\d+(\.\d+)?$/.test(trimmedValue) && !isNaN(parseFloat(trimmedValue))) result[key] = parseFloat(trimmedValue);
            else result[key] = trimmedValue;
        }
    }
    return result;
}

// --- UI Component Definitions ---

const InitialScreen = (props) => {
    const fileInputRef = React.useRef(null);
    const handleFileLoadClick = () => {
        fileInputRef.current.click();
    };
    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mb-12 text-center animate-pulse">
        Nhập Vai A.I Simulator
      </h1>
      <div className="space-y-4 w-full max-w-md">
        <button onClick={props.onStartNewGame} className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50">
          ▶️ Bắt Đầu Cuộc Phiêu Lưu Mới
        </button>
        <button onClick={() => props.setShowLoadGameModal(true)} disabled={props.savedGames.length === 0} className="w-full flex items-center justify-center bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50">
          💾 Tải Game Đã Lưu ({props.savedGames.length})
        </button>
        <button onClick={handleFileLoadClick} className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50">
          📂 Tải Game Từ Tệp (.json)
        </button>
        <input type="file" ref={fileInputRef} onChange={props.handleLoadGameFromFile} accept=".json" className="hidden" />
        <button onClick={() => props.setShowUpdateLogModal(true)} className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-50">
          📢 Xem Cập Nhật Game
        </button>
        <button onClick={() => { props.setInputApiKey(props.apiMode === 'userKey' ? props.apiKey : ''); props.setShowApiModal(true);}} className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50">
          ⚙️ Thiết Lập API Key
        </button>
      </div>
       <p className={`mt-6 text-sm ${props.apiKeyStatus.color}`}>{props.apiKeyStatus.status}: {props.apiKeyStatus.message}</p>
       {props.userId && <p className="mt-1 text-xs text-gray-400">UserID: {props.userId}</p>}
    </div>
  );
}
const UpdateLogModal = ({ show, onClose, changelog }) => {
    if (!show) return null;
    const getChangeTag = (type) => {
        const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1.5 tracking-wider";
        switch (type) {
            case 'NEW': return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>➕ MỚI</span>;
            case 'FIX': return <span className={`${baseClasses} bg-orange-500/20 text-orange-300`}>🔧 SỬA LỖI</span>;
            case 'IMPROVE': return <span className={`${baseClasses} bg-sky-500/20 text-sky-300`}>⬆️ CẢI TIẾN</span>;
            case 'UI': return <span className={`${baseClasses} bg-purple-500/20 text-purple-300`}>🎨 GIAO DIỆN</span>;
            case 'AI': return <span className={`${baseClasses} bg-pink-500/20 text-pink-300`}>✨ AI</span>;
            default: return <span className={`${baseClasses} bg-gray-500/20 text-gray-300`}>{type.toUpperCase()}</span>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-teal-700/50">
                <div className="flex items-center mb-6">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-400">📢 Nhật Ký Cập Nhật</h2>
                </div>
                <div className="overflow-y-auto flex-grow pr-3 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700 space-y-8">
                    {changelog.map((log, index) => (
                        <div key={index} className="relative pl-8">
                            <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gray-600"></div>
                            <div className="absolute left-0 top-1 w-6 h-6 bg-gray-700 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                            </div>
                            <div className="bg-gray-800/60 p-4 rounded-lg shadow-lg border border-gray-700/80">
                                <h3 className="text-xl font-bold text-teal-300">{log.version}</h3>
                                <p className="text-xs text-gray-500 mb-4">{log.date}</p>
                                <ul className="space-y-2.5 text-sm text-gray-300">
                                    {log.changes.map((change, cIndex) => (
                                        <li key={cIndex} className="flex items-start gap-3">
                                            {getChangeTag(change.type)}
                                            <span className="flex-1 leading-relaxed">{change.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                    Đã Hiểu
                </button>
            </div>
        </div>
    );
};

const ApiSetupModal = ({
    inputApiKey, setInputApiKey, apiKeyStatus, saveApiKey, testApiKey,
    isLoading, setShowApiModal, apiKey, setApiKeyStatus, apiMode, setApiMode,
    setModalMessage
}) => {
    const handleUseDefaultGemini = () => {
        setApiMode('defaultGemini');
        setInputApiKey('');
        setApiKeyStatus({ status: 'Đang dùng Gemini AI Mặc Định', message: 'Không cần API Key.', color: 'text-sky-400' });
        setModalMessage({show: true, title: "Chế Độ AI Mặc Định", content: "Đã chuyển sang sử dụng Gemini AI mặc định.", type: "success"});
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all border border-purple-800">
        <h2 className="text-3xl font-semibold text-purple-400 mb-6">Thiết Lập Nguồn AI</h2>

        <fieldset className="border border-gray-600 p-4 rounded-lg mb-6">
            <legend className="text-lg font-semibold text-sky-400 px-2">Nguồn AI (Gemini)</legend>
            <div className="mt-2 space-y-3">
                <button onClick={handleUseDefaultGemini} className={`w-full flex items-center justify-center font-semibold py-3 px-4 rounded-lg shadow-md transition-colors ${apiMode === 'defaultGemini' ? 'bg-sky-600 hover:bg-sky-700 text-white ring-2 ring-sky-400' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}>
                    <span className="mr-2">✨</span> Sử Dụng Gemini AI Mặc Định (Đề xuất)
                </button>
                <div>
                    <label htmlFor="apiKeyInputModal" className={`block text-sm font-medium mb-1 ${apiMode === 'userKey' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Hoặc Sử Dụng API Key Gemini Của Ngươi:
                    </label>
                    <input type="password" id="apiKeyInputModal" name="apiKeyInputModalName" autoComplete="new-password" value={inputApiKey}
                        onChange={(e) => {
                            setInputApiKey(e.target.value);
                            if (apiMode !== 'userKey' && e.target.value.trim() !== '') {
                                setApiMode('userKey');
                                setApiKeyStatus({ status: 'Chưa cấu hình', message: 'Nhập API Key của bạn.', color: 'text-yellow-500' });
                            }
                        }}
                        placeholder="Nhập API Key Gemini của ngươi"
                        className={`w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500 ${apiMode !== 'userKey' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={apiMode !== 'userKey'}
                    />
                </div>
                 {apiMode === 'userKey' && (
                    <>
                        <div className={`my-2 text-sm ${apiKeyStatus.color}`}>{apiKeyStatus.status}: {apiKeyStatus.message}</div>
                        <div className="flex space-x-3">
                        <button onClick={saveApiKey} disabled={isLoading || !inputApiKey} className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg disabled:bg-gray-500">
                            💾 Lưu Key Gemini
                        </button>
                        <button onClick={testApiKey} disabled={isLoading || !inputApiKey} className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg disabled:bg-gray-500">
                            ✔️ Kiểm Tra
                        </button>
                        </div>
                    </>
                )}
            </div>
        </fieldset>

        <button onClick={() => setShowApiModal(false)} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors">
            Đóng
        </button>
      </div>
    </div>
  );
};

const GameSetupScreen = ({ 
    goHome, gameSettings, handleInputChange, initializeGame, isLoading, apiKey, 
    setInputApiKey, setShowApiModal, handleFetchSuggestions, isFetchingSuggestions,
    handleGenerateBackstory, isGeneratingContent, apiMode, handleGenerateDifficultyDescription, isGeneratingDifficultyDesc,
    addInitialWorldElement, removeInitialWorldElement, handleInitialElementChange, handleGenerateInitialElementDescription,
    isGeneratingInitialElementDesc, handleGenerateGoal, isGeneratingGoal,
    handleGenerateCharacterName, isGeneratingCharacterName, 
    handleGenerateInitialSkill, isGeneratingInitialSkill,
    handleSaveSetupToFile, handleLoadSetupFromFile
}) => {
    const setupFileInputRef = useRef(null);
    const handleLoadClick = () => {
        setupFileInputRef.current.click();
    };

    return (
    <div className="min-h-screen bg-gray-800 text-white p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-gray-700 p-6 md:p-8 rounded-xl shadow-2xl relative">
        <button onClick={goHome} className="absolute top-4 left-4 text-purple-400 hover:text-purple-300 text-sm flex items-center bg-gray-600 hover:bg-gray-500 p-2 rounded-lg shadow transition-colors">
            ↩️ Về Trang Chủ
        </button>
        <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-8 text-center pt-10 sm:pt-0">Kiến Tạo Thế Giới Của Ngươi</h2>
                
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
            <div className="space-y-6">
                <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-pink-400 px-2">📜 Bối Cảnh Truyện</legend>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="theme" className="block text-lg font-medium text-gray-300 mb-1">Thể loại:</label>
                            <div className="flex items-center gap-2">
                                <input type="text" name="theme" id="theme" value={gameSettings.theme} onChange={handleInputChange} placeholder="VD: Tiên hiệp, Huyền huyễn..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-pink-500 focus:border-pink-500" />
                                <button onClick={() => handleFetchSuggestions('theme')} disabled={isFetchingSuggestions || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-pink-600 hover:bg-pink-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Chủ đề">
                                    {isFetchingSuggestions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="setting" className="block text-lg font-medium text-gray-300 mb-1">Thế Giới/Bối Cảnh Chi Tiết:</label>
                            <div className="flex items-center gap-2">
                                <input type="text" name="setting" id="setting" value={gameSettings.setting} onChange={handleInputChange} placeholder="VD: Đại Lục Phong Vân..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-pink-500 focus:border-pink-500" />
                                <button onClick={() => handleFetchSuggestions('setting')} disabled={isFetchingSuggestions || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-pink-600 hover:bg-pink-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Bối cảnh">
                                    {isFetchingSuggestions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-pink-400 px-2">📜 Phong cách viết</legend>
                    <div className="mt-2 space-y-4">
                        <select name="narratorPronoun" value={gameSettings.narratorPronoun} onChange={handleInputChange} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500">
                            {NARRATOR_PRONOUNS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </fieldset>
                <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-teal-400 px-2">🎲 Độ Khó & Nội Dung</legend>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="difficulty" className="block text-lg font-medium text-gray-300 mb-1">Chọn Độ Khó:</label>
                            <select name="difficulty" id="difficulty" value={gameSettings.difficulty} onChange={handleInputChange} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-teal-500 focus:border-teal-500">
                                <option value="Dễ">Dễ - Dành cho người mới</option>
                                <option value="Thường">Thường - Cân bằng, phù hợp đa số</option>
                                <option value="Khó">Khó - Thử thách cao, cần tính toán</option>
                                <option value="Ác Mộng">Ác Mộng - Cực kỳ khó</option>
                                <option value="Tuỳ Chỉnh AI">Tuỳ Chỉnh AI - Để AI mô tả</option>
                            </select>
                        </div>
                        {(gameSettings.difficulty === "Tuỳ Chỉnh AI" || gameSettings.difficultyDescription) && (
                            <div>
                                <label htmlFor="difficultyDescription" className="block text-lg font-medium text-gray-300 mb-1">Mô Tả Độ Khó:</label>
                                <div className="flex items-center gap-2">
                                    <textarea name="difficultyDescription" id="difficultyDescription" value={gameSettings.difficultyDescription} onChange={handleInputChange} rows="2" placeholder="AI sẽ mô tả độ khó ở đây..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-teal-500 focus:border-teal-500" />
                                    {gameSettings.difficulty === "Tuỳ Chỉnh AI" && (
                                        <button onClick={handleGenerateDifficultyDescription} disabled={isGeneratingDifficultyDesc || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-teal-600 hover:bg-teal-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Tạo Mô Tả Độ Khó">
                                            {isGeneratingDifficultyDesc ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center mt-3">
                            <input type="checkbox" name="allowNsfw" id="allowNsfw" checked={gameSettings.allowNsfw} onChange={handleInputChange} className="h-5 w-5 text-red-500 bg-gray-600 border-gray-500 rounded focus:ring-red-600 focus:ring-offset-gray-800" />
                            <label htmlFor="allowNsfw" className="ml-2 text-sm font-medium text-gray-300">Cho phép nội dung 18+ (Cực kỳ chi tiết)</label>
                        </div>
                         <p className="text-xs text-gray-400 italic">Khi tick chọn, AI sẽ được khuyến khích tạo nội dung khiêu dâm, bạo lực cực đoan một cách trần trụi và chi tiết hơn.</p>
                    </div>
                </fieldset>
            </div>

            <div className="space-y-6">
                 <fieldset className="border border-gray-600 p-4 rounded-lg">
                    <legend className="text-xl font-semibold text-sky-400 px-2">👤 Nhân Vật Chính</legend>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="characterName" className="block text-lg font-medium text-gray-300 mb-1">Danh Xưng/Tên:</label>
                             <div className="flex items-center gap-2">
                                <input type="text" name="characterName" id="characterName" value={gameSettings.characterName} onChange={handleInputChange} placeholder="VD: Diệp Phàm, Hàn Lập..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
                                <button onClick={handleGenerateCharacterName} disabled={isGeneratingCharacterName || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Tên Nhân Vật">
                                    {isGeneratingCharacterName ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="characterPersonality" className="block text-lg font-medium text-gray-300 mb-1">Tính Cách:</label>
                            <select name="characterPersonality" value={gameSettings.characterPersonality} onChange={handleInputChange} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500">
                                {PLAYER_PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {gameSettings.characterPersonality === 'Tùy chỉnh...' && (
                                <input
                                    type="text"
                                    name="customCharacterPersonality" // Tên phải khớp với state đã thêm ở Bước 2
                                    value={gameSettings.customCharacterPersonality || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tính cách của bạn (VD: Lạnh lùng bên ngoài, ấm áp bên trong)"
                                    className="w-full p-2 mt-2 bg-gray-900 border border-gray-500 rounded-md placeholder-gray-500"
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="characterGender" className="block text-lg font-medium text-gray-300 mb-1">Giới Tính:</label>
                            <select name="characterGender" id="characterGender" value={gameSettings.characterGender} onChange={handleInputChange} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500">
                                <option value="Không xác định">Không xác định / Để AI quyết định</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="characterBackstory" className="block text-lg font-medium text-gray-300 mb-1">Sơ Lược Tiểu Sử:</label>
                            <div className="flex items-center gap-2">
                                <textarea name="characterBackstory" id="characterBackstory" value={gameSettings.characterBackstory} onChange={handleInputChange} rows="3" placeholder="VD: Một phế vật mang huyết mạch thượng cổ..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500"></textarea>
                                <button onClick={handleGenerateBackstory} disabled={isGeneratingContent || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ Tạo Tiểu sử">
                                    {isGeneratingContent ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="preferredInitialSkill" className="block text-lg font-medium text-gray-300 mb-1">Kỹ Năng Khởi Đầu (Tùy chọn):</label>
                            <div className="flex items-center gap-2">
                                <input type="text" name="preferredInitialSkill" id="preferredInitialSkill" value={gameSettings.preferredInitialSkill} onChange={handleInputChange} placeholder="VD: Thuật ẩn thân..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
                                <button onClick={handleGenerateInitialSkill} disabled={isGeneratingInitialSkill || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Kỹ năng">
                                    {isGeneratingInitialSkill ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                </button>
                            </div>
                             <p className="text-xs text-gray-400 mt-1 italic">Gợi ý cho AI về loại kỹ năng ngươi muốn bắt đầu.</p>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border border-red-500/70 p-4 rounded-lg bg-gray-700/20">
                    <legend className="text-xl font-semibold text-red-400 px-2 flex items-center">🎯 Mục Tiêu/Động Lực</legend>
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center">
                            <input type="checkbox" name="useCharacterGoal" id="useCharacterGoal" checked={gameSettings.useCharacterGoal} onChange={handleInputChange} className="h-5 w-5 text-red-500 bg-gray-600 border-gray-500 rounded focus:ring-red-600 focus:ring-offset-gray-800" />
                            <label htmlFor="useCharacterGoal" className="ml-2 text-sm font-medium text-gray-300">Thêm Mục Tiêu/Động Lực</label>
                        </div>
                        {gameSettings.useCharacterGoal && (
                            <div>
                                <label htmlFor="characterGoal" className="block text-lg font-medium text-gray-300 mb-1">Mục Tiêu/Động Lực:</label>
                                <div className="flex items-center gap-2">
                                    <textarea name="characterGoal" id="characterGoal" value={gameSettings.characterGoal} onChange={handleInputChange} rows="3" placeholder="VD: Trả thù cho gia tộc..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-red-500 focus:border-red-500" />
                                    <button onClick={handleGenerateGoal} disabled={isGeneratingGoal || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-red-600 hover:bg-red-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Gợi Ý Mục Tiêu">
                                        {isGeneratingGoal ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 italic">Mục tiêu này sẽ ảnh hưởng đến suy nghĩ và hành động của nhân vật.</p>
                            </div>
                        )}
                    </div>
                </fieldset>
            </div>
        </div>

        <fieldset className="border-2 border-lime-600 p-4 rounded-lg mb-6 bg-gray-700/30">
            <legend className="text-xl font-semibold text-lime-300 px-2 flex items-center">
                🏛️ Kiến Tạo Thế Giới Ban Đầu (Tùy chọn)
            </legend>
            <div className="mt-3 space-y-4">
                {gameSettings.initialWorldElements.map((element, index) => (
                    <div key={element.id} className="p-3 bg-gray-600/50 rounded-lg border border-gray-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                                <label htmlFor={`elementName-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Tên Thực Thể:</label>
                                <input type="text" id={`elementName-${index}`} name="name" value={element.name} onChange={(e) => handleInitialElementChange(index, e)} placeholder="VD: Lão Ma Đầu..." className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor={`elementType-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Loại Thực Thể:</label>
                                <select id={`elementType-${index}`} name="type" value={element.type} onChange={(e) => handleInitialElementChange(index, e)} className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm">
                                    <option value="NPC">Nhân Vật (NPC)</option>
                                    <option value="LOCATION">Địa Điểm</option>
                                    <option value="ITEM">Vật Phẩm (Lore)</option>
                                </select>
                            </div>
                             <div className="md:col-span-2"> 
                                <label htmlFor={`elementPersonality-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Tính Cách (Nếu là NPC):</label>
                                <input type="text" id={`elementPersonality-${index}`} name="personality" value={element.personality || ''} onChange={(e) => handleInitialElementChange(index, e)} placeholder="VD: Lạnh lùng, Đa nghi..." className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm" />
                            </div>
                            <div className="md:col-span-2"> 
                                <label htmlFor={`elementDesc-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Mô Tả Thực Thể:</label>
                                <div className="flex items-start gap-2">
                                    <textarea id={`elementDesc-${index}`} name="description" value={element.description} onChange={(e) => handleInitialElementChange(index, e)} rows="2" placeholder="Mô tả chi tiết về thực thể này..." className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm" />
                                    <button onClick={() => handleGenerateInitialElementDescription(index)} disabled={isGeneratingInitialElementDesc[element.id] || !element.name || (apiMode === 'userKey' && !apiKey)} className="p-2.5 bg-lime-600 hover:bg-lime-700 rounded-md disabled:bg-gray-500 self-center" title="✨ AI Tạo Mô Tả Thực Thể">
                                        {isGeneratingInitialElementDesc[element.id] ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : '✨'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => removeInitialWorldElement(element.id)} className="mt-1 text-xs bg-red-700 hover:bg-red-800 text-white py-1 px-2 rounded-md flex items-center">
                           🗑️ Xóa
                        </button>
                    </div>
                ))}
                <button onClick={addInitialWorldElement} className="w-full mt-2 py-2 px-4 bg-lime-700 hover:bg-lime-800 text-white font-semibold rounded-lg shadow-md flex items-center justify-center text-sm">
                    ➕ Thêm Thực Thể
                </button>
            </div>
        </fieldset>

        <div className="flex items-center justify-center gap-4 mb-6">
            <button onClick={handleSaveSetupToFile} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors">
                💾 Lưu Thiết Lập
            </button>
            <button onClick={handleLoadClick} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors">
                📂 Tải Thiết Lập
            </button>
            <input type="file" ref={setupFileInputRef} onChange={handleLoadSetupFromFile} accept=".json" className="hidden" />
        </div>

        <button onClick={initializeGame} disabled={isLoading || (apiMode === 'userKey' && !apiKey)} className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-xl disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
          ➕ {isLoading ? 'Đang Khởi Tạo...' : ((apiMode === 'userKey' && !apiKey) ? 'Cần API Key' : 'Khởi Tạo Thế Giới')}
        </button>
         {(apiMode === 'userKey' && !apiKey) && <p className="text-yellow-400 text-sm mt-3 text-center">Vui lòng <button onClick={() => {setInputApiKey(apiKey); setShowApiModal(true);}} className="underline hover:text-yellow-300 font-semibold">thiết lập API Key</button> của ngươi.</p>}
      </div>
    </div>
  );
}

const CharacterInfoModal = ({ knowledge, worldKnowledge, show, onClose, characterName, finalPersonality, handleRemoveStatus, handleRemoveRelationship }) => {
    const [activeTab, setActiveTab] = useState('character');

    if (!show) return null;

    const getStatusIcon = (statusType) => {
        switch (statusType?.toLowerCase()) {
            case 'buff': return '✅';
            case 'debuff': return '💔';
            case 'injury': return '⚠️';
            default: return 'ℹ️';
        }
    };

    const getQuestStatusColor = (status) => {
        if (status === 'completed') return 'text-green-400';
        if (status === 'failed') return 'text-red-400';
        return 'text-yellow-400';
    };

    const renderSection = (title, items, icon, itemColor = "text-green-300", renderItem, emptyText = "Chưa có thông tin.") => {
        const hasItems = Array.isArray(items) ? items.length > 0 : items && Object.keys(items).length > 0;
        return (
            <div className="mb-4">
                <h4 className={`text-lg font-semibold ${itemColor} mb-2 flex items-center gap-2`}>{icon} {title}</h4>
                {hasItems ? (
                    <ul className="space-y-1.5 text-sm">
                        {items.map((item, index) => renderItem(item, index, itemColor))}
                    </ul>
                ) : (
                    <p className="text-gray-400 italic text-sm pl-2">{emptyText}</p>
                )}
            </div>
        );
    };

    const TabButton = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-t-lg transition-all focus:outline-none
                ${activeTab === tabName ? 'bg-gray-700 text-purple-300 border-b-2 border-purple-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50 hover:text-purple-400'}`}
        >
            {icon} <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-1.5 sm:p-2 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-purple-700/50">
                <div className="p-4 flex justify-between items-center bg-gray-900/50 rounded-t-lg">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">
                        📝 Bảng Thông Tin
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="flex border-b border-gray-700 bg-gray-800/70">
                    <TabButton tabName="character" label="Nhân Vật" icon="👤" />
                    <TabButton tabName="interaction" label="Tương Tác" icon="👥" />
                    <TabButton tabName="quests" label="Nhiệm Vụ" icon="📜" />
                    <TabButton tabName="world" label="Thế Giới" icon="🌍" />
                </div>

                <div className="overflow-y-auto flex-grow p-4 sm:p-6 bg-gray-700/50 rounded-b-lg scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                    {activeTab === 'character' && (
                        <div className="space-y-6">
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/50">
                                <h4 className="text-lg font-semibold text-amber-400 mb-2 flex items-center gap-2">👤 Thông Tin Cơ Bản</h4>
                                {characterName && <p className="text-gray-300 text-sm pl-2"><strong>Tên:</strong> {characterName}</p>}
                                <p className="text-gray-300 text-sm pl-2"><strong>Tính cách:</strong> {finalPersonality || "Chưa xác định"}</p>
                            </div>
                            {renderSection("Trạng Thái", knowledge.playerStatus, 'ℹ️', "text-indigo-400", (item, index, color) => (
                                <li key={`status-${index}`} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-start border-l-4 border-indigo-500">
                                    <div className="flex-grow">
                                        <strong className={color}>{getStatusIcon(item.type)} {item.name || "Trạng thái không tên"}</strong>: {item.description || "Không có mô tả."}
                                        <div className="text-xs text-gray-400 mt-1 ml-3">
                                            {item.duration && <span><strong>Thời gian:</strong> {item.duration}. </span>}
                                            {item.effects && <span><strong>Ảnh hưởng:</strong> {item.effects}. </span>}
                                            {item.source && <span><strong>Nguồn:</strong> {item.source}.</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveStatus(item)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-xl p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors">&times;</button>
                                </li>
                            ), "Không có trạng thái nào đang hoạt động.")}
                            {renderSection("Balo Đồ", knowledge.inventory, '🎒', "text-orange-400", (item, index, color) => (
                                <li key={`inventory-${index}`} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border-l-4 border-orange-500">
                                    <strong className={color}>{item.Name || "Vật phẩm không tên"}</strong>: {item.Description || "Không có mô tả."}
                                    <span className="block text-xs text-gray-400 mt-1">
                                        ({item.Type || "Chưa rõ loại"})
                                        {item.Equippable ? " (Có thể trang bị)" : ""}
                                        {item.Usable ? " (Có thể sử dụng)" : ""}
                                        {item.Consumable ? " (Tiêu hao)" : ""}
                                        {typeof item.Uses === 'number' ? ` (Còn ${item.Uses} lần)` : ""}
                                    </span>
                                </li>
                            ))}
                            {renderSection("Kỹ Năng", knowledge.playerSkills, '⚡', "text-yellow-400", (item, index, color) => (
                                <li key={`skill-${index}`} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border-l-4 border-yellow-500">
                                    <strong className={color}>{item.Name || "Kỹ năng không tên"}</strong>: {item.Description || "Không có mô tả."}
                                    {item.Type && <span className="text-xs text-gray-400 ml-1">({item.Type})</span>}
                                </li>
                            ))}
                        </div>
                    )}
                    {activeTab === 'interaction' && (
                        <div className="space-y-6">
                            {renderSection("Nhân Vật Đã Gặp", knowledge.npcs, '👥', "text-sky-400", (item, index, color) => {
                                const emotions = knowledge.relationships?.[item.Name];
                                return (
                                    <li key={`npc-${index}`} className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border-l-4 border-sky-500">
                                        <strong className={color}>{item.Name || "Không rõ tên"}</strong>
                                        {item.Personality && <span className="text-gray-400 text-xs"> (Tính cách: {item.Personality})</span>}
                                        <p className="text-xs text-gray-300 mt-1">{item.Description || "Chưa có mô tả."}</p>
                                        {item.statuses && item.statuses.length > 0 && (
                                            <div className="text-xs text-gray-400 ml-3 mt-1">
                                                <strong>Trạng thái NPC:</strong> {item.statuses.map(s => `${s.name} (${s.type})`).join(', ')}
                                            </div>
                                        )}
                                        {emotions && emotions.length > 0 && (
                                            <div className="mt-2 p-2 bg-gray-900/40 rounded-md">
                                                <h5 className="text-sm font-semibold text-rose-300 mb-1.5">❤️ Tình cảm:</h5>
                                                <ul className="space-y-1.5">
                                                    {emotions.map((emo, eIndex) => (
                                                        <li key={eIndex} className="text-xs text-gray-200 flex justify-between items-center">
                                                            <div>
                                                                <span className="font-semibold text-rose-200">{emo.emotion}:</span> {emo.level || "Không xác định"}
                                                                {emo.reason && <span className="text-gray-400 italic"> ({emo.reason})</span>}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleRemoveRelationship(item.Name, emo)} 
                                                                className="ml-2 flex-shrink-0 text-red-500 hover:text-red-300 font-bold text-lg p-1 leading-none rounded-full hover:bg-red-500/20 transition-colors"
                                                                title={`Xóa tình cảm ${emo.emotion}`}
                                                            >
                                                                &times;
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            }, "Chưa gặp gỡ nhân vật nào.")}
                             {renderSection("Đồng Hành", knowledge.companions, '👨‍👩‍👧‍👦', "text-lime-400", (item, index, color) => (
                                <li key={`companion-${index}`} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border-l-4 border-lime-500">
                                    <strong className={color}>{item.Name || "Không rõ tên"}</strong>
                                    {item.Personality && <span className="text-gray-400 text-xs"> (Tính cách: {item.Personality})</span>}: {item.Description || "Chưa có mô tả."}
                                    {item.Stats && <span className="text-xs text-gray-400 ml-2">({item.Stats})</span>}
                                    {item.statuses && item.statuses.length > 0 && (
                                        <div className="text-xs text-gray-400 ml-3 mt-1">
                                            <strong>Trạng thái:</strong> {item.statuses.map(s => `${s.name} (${s.type})`).join(', ')}
                                        </div>
                                    )}
                                </li>
                            ), "Chưa có đồng hành nào.")}
                        </div>
                    )}
                    {activeTab === 'quests' && (
                        <div className="space-y-6">
                            {renderSection("Nhật Ký Nhiệm Vụ", knowledge.quests, '📜', "text-yellow-400", (quest, index) => (
                                <li key={`quest-${index}`} className={`text-gray-200 p-4 bg-gray-800/60 rounded-lg border-l-4 ${quest.status === 'completed' ? 'border-green-500' : quest.status === 'failed' ? 'border-red-500' : 'border-yellow-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <strong className={`font-semibold ${getQuestStatusColor(quest.status)}`}>{quest.title || "Nhiệm vụ không tên"}</strong>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${quest.status === 'completed' ? 'bg-green-600/70' : quest.status === 'failed' ? 'bg-red-600/70' : 'bg-yellow-600/70'}`}>
                                            {quest.status === 'active' ? 'Đang làm' : quest.status === 'completed' ? 'Hoàn thành' : 'Thất bại'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-1">{quest.description || "Không có mô tả."}</p>
                                    {quest.objectives && quest.objectives.length > 0 && (
                                        <ul className="list-disc list-inside text-xs text-gray-400 mt-2 pl-3">
                                            {quest.objectives.map((obj, oIdx) => (
                                                <li key={oIdx} className={obj.completed ? 'line-through text-gray-500' : ''}>{obj.text}</li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ), "Chưa nhận nhiệm vụ nào.")}
                        </div>
                    )}
                    {activeTab === 'world' && (
                        <div className="space-y-6">
                            {renderSection("Vật Phẩm Thế Giới (Lore)", knowledge.items, '✨', "text-amber-300", (item, index, color) => (
                                <li key={`loreitem-${index}`} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border-l-4 border-amber-500">
                                    <strong className={color}>{item.Name || "Không rõ tên"}:</strong> {item.Description || "Chưa có mô tả."}
                                </li>
                            ))}
                            {renderSection("Địa Điểm Đã Khám Phá", knowledge.locations, '🗺️', "text-blue-400", (item, index, color) => (
                                <li key={`location-${index}`} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border-l-4 border-blue-500">
                                    <strong className={color}>{item.Name || "Không rõ tên"}:</strong> {item.Description || "Chưa có mô tả."}
                                </li>
                            ))}
                            {renderSection("Tri Thức Thế Giới Áp Dụng", worldKnowledge.filter(r => r.enabled), '🌍', "text-green-400", (rule, index) => (
                                <li key={`wk-${index}`} className="text-gray-300 p-2 bg-gray-800/50 rounded-md border-l-4 border-green-500">{rule.content}</li>
                            ), "Không có tri thức nào đang được áp dụng.")}
                        </div>
                    )}
                </div>
                 <button onClick={onClose} className="mt-2 w-full bg-purple-600/80 hover:bg-purple-700/90 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                    Đóng
                </button>
            </div>
        </div>
    );
};

const QuickLoreModal = ({ loreItem, show, onClose }) => {
    if (!show || !loreItem) return null;
    let icon = 'ℹ️';
    const category = loreItem.category?.toLowerCase();

    if (category === 'npcs') icon = '👥';
    else if (category === 'items' || category === 'inventory') icon = '✨';
    else if (category === 'companions') icon = '👨‍👩‍👧‍👦';
    else if (category === 'playerskills') icon = '⚡';
    else if (category === 'relationships') icon = '❤️';
    else if (category === 'quests') icon = '📜';
    else if (category === 'playerstatus') {
        switch (loreItem.type?.toLowerCase()) {
            case 'buff': icon = '✅'; break;
            case 'debuff': icon = '💔'; break;
            case 'injury': icon = '⚠️'; break;
            default: icon = 'ℹ️'; break;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[80]" onClick={onClose}>
            <div className="bg-gray-700 p-5 rounded-lg shadow-xl w-full max-w-sm border border-cyan-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start mb-2">
                    <span className="text-xl mr-2 mt-1">{icon}</span>
                    <h4 className="text-lg font-semibold text-cyan-300">{loreItem.Name || loreItem.NPC || loreItem.name || loreItem.title || "Không rõ tên"}</h4>
                </div>
                <p className="text-sm text-gray-200 bg-gray-600 p-3 rounded max-h-40 overflow-y-auto whitespace-pre-line scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-600">
                    {loreItem.Description || loreItem.Standing || loreItem.description || "Không có mô tả chi tiết."}
                </p>
                {loreItem.Personality && <p className="text-xs text-gray-300 mt-1"><strong>Tính cách:</strong> {loreItem.Personality}</p>}
                {loreItem.duration && <p className="text-xs text-gray-300 mt-1"><strong>Thời gian:</strong> {loreItem.duration}</p>}
                {loreItem.effects && <p className="text-xs text-gray-300 mt-1"><strong>Ảnh hưởng:</strong> {loreItem.effects}</p>}
                {category === 'quests' && (
                    <>
                        {loreItem.status && <p className="text-xs text-gray-300 mt-1"><strong>Trạng thái NV:</strong> {loreItem.status === 'active' ? 'Đang làm' : loreItem.status === 'completed' ? 'Hoàn thành' : 'Thất bại'}</p>}
                        {loreItem.objectives && loreItem.objectives.length > 0 && (
                            <div className="mt-1">
                                <p className="text-xs text-gray-300 font-semibold">Mục tiêu:</p>
                                <ul className="list-disc list-inside text-xs text-gray-400 pl-3">
                                    {loreItem.objectives.map((obj, idx) => (
                                        <li key={idx} className={obj.completed ? 'line-through text-gray-500' : ''}>{obj.text}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
                 <button onClick={onClose} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md text-sm">
                    Đóng
                </button>
            </div>
        </div>
    );
};

const SuggestedActionsModal = ({ show, suggestions, onSelect, onClose, isLoading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[90]">
            <div className="bg-gray-700 p-6 rounded-xl shadow-2xl w-full max-w-md border border-purple-700">
                <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                    💡 Gợi Ý Hành Động
                </h3>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="w-8 h-8 border-4 border-t-transparent border-purple-400 rounded-full animate-spin"></div>
                        <p className="ml-3 text-gray-300">AI đang nghĩ gợi ý...</p>
                    </div>
                ) : suggestions.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>
                                <button onClick={() => { onSelect(suggestion); onClose(); }} className="w-full text-left p-3 bg-gray-600 hover:bg-gray-500/80 rounded-md text-gray-200 transition-colors shadow hover:shadow-md">
                                    {suggestion}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center py-4">Không có gợi ý nào được tạo ra lúc này.</p>
                )}
                <button onClick={onClose} className="mt-6 w-full bg-gray-500 hover:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg">
                    Đóng
                </button>
            </div>
        </div>
    );
};

const StoryItem = React.memo(({ item, formatStoryText }) => {
    return (
        <div className={`story-item mb-3 p-3 rounded-lg shadow-sm
            ${item.type === 'story' ? 'bg-gray-700/80' : 
              item.type === 'user_choice' ? 'bg-blue-900/70 text-blue-200 ring-1 ring-blue-700' : 
              item.type === 'user_custom_action' ? 'bg-indigo-900/70 text-indigo-200 ring-1 ring-indigo-700' :
              'bg-yellow-800/70 text-yellow-200 ring-1 ring-yellow-700'}`}>
            {item.type === 'user_choice' && <p className="font-semibold text-blue-300">Ngươi đã chọn:</p>}
            {item.type === 'user_custom_action' && <p className="font-semibold text-indigo-300">Hành động của ngươi:</p>}
            {item.type === 'system' && <p className="font-semibold text-yellow-300">Thông báo hệ thống:</p>}
            <div className="prose prose-sm prose-invert max-w-none text-gray-200">{formatStoryText(item.content)}</div>
        </div>
    );
});


const GameplayScreen = ({ 
    goHome, gameSettings, restartGame, storyHistory, isLoading, 
    currentStory, choices, handleChoice, formatStoryText, customActionInput, 
    setCustomActionInput, handleCustomAction, knowledgeBase, setShowCharacterInfoModal, 
    handleGenerateSuggestedActions, isGeneratingSuggestedActions,
    isSaving, setShowMemoryModal, setShowWorldKnowledgeModal, handleSaveGameToFile,
    finalPersonality, handleRemoveStatus
}) => {

    
    return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-2 md:p-4 font-['Arial',_sans-serif]">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2 p-2 bg-gray-800/50 rounded-lg shadow-md">
            <button onClick={goHome} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-colors flex items-center self-start sm:self-center text-sm">
                ↩️ Về Trang Chủ
            </button>
            <div className="text-center flex-1 mx-2 order-first sm:order-none max-w-md sm:max-w-full"> 
                <h1 className="text-lg md:text-xl font-bold text-purple-300" title={gameSettings.theme || "Cuộc Phiêu Lưu"}>
                    {gameSettings.theme || "Cuộc Phiêu Lưu"}
                </h1>
                 {gameSettings.characterPersonality && (
                    <p className="text-xs text-sky-300 flex items-center justify-center mt-0.5" title={`Tính cách: ${gameSettings.characterPersonality}`}>
                        <span className="mr-1">🎭</span>
                        <span className="leading-tight">Tính cách: {finalPersonality}</span>
                    </p>
                )}
                {gameSettings.useCharacterGoal && gameSettings.characterGoal && (
                     <div className="text-xs text-red-300 flex items-start justify-center text-center mt-0.5" title={`Mục tiêu: ${gameSettings.characterGoal}`}>
                        <span className="mr-1">🎯</span>
                        <span className="ml-1 leading-tight">Mục tiêu: {gameSettings.characterGoal}</span>
                    </div>
                )}
            </div>
            <div className="flex gap-1.5 self-end sm:self-center flex-wrap justify-end items-center">
                {isSaving && <div className="text-xs text-gray-400 italic mr-2 animate-pulse">Đang lưu...</div>}
                 <button onClick={handleSaveGameToFile} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    📥 Lưu Vào Tệp
                </button>
                 <button onClick={() => setShowWorldKnowledgeModal(true)} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    🌍 Tri Thức
                </button>
                <button onClick={() => setShowMemoryModal(true)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    🧠 Ký Ức
                </button>
                <button onClick={() => setShowCharacterInfoModal(true)} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    📝 Thông Tin
                </button>
                <button onClick={restartGame} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    🔄 Bắt Đầu Lại
                </button>
            </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-750 p-3 rounded-xl shadow-lg border border-indigo-700/50 h-full flex flex-col">
                <h4 className="text-md font-semibold text-indigo-400 mb-1.5 flex items-center">
                    ℹ️ Trạng Thái Hiện Tại
                </h4>
                {(knowledgeBase.playerStatus && knowledgeBase.playerStatus.length > 0) ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                        {knowledgeBase.playerStatus.map((status, index) => {
                             let icon, textColor = "text-gray-300";
                             switch (status.type?.toLowerCase()) {
                                 case 'buff': icon = '✅'; textColor = "text-green-300"; break;
                                 case 'debuff': icon = '💔'; textColor = "text-red-300"; break;
                                 case 'injury': icon = '⚠️'; textColor = "text-yellow-300"; break;
                                 default: icon = 'ℹ️'; textColor = "text-blue-300"; break;
                             }
                             return (
                                <div key={index} className={`flex items-center justify-between bg-gray-700 p-1.5 rounded-md shadow ${textColor}`} title={`${status.description}`}>
                                    <div className="flex items-center">
                                        <span className="mr-1.5">{icon}</span>
                                        {status.name}
                                    </div>
                                    <button onClick={() => handleRemoveStatus(status)} className="ml-2 text-red-400 hover:text-red-200 text-sm font-bold leading-none flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-500/30 transition-colors">
                                        &times;
                                    </button>
                                </div>
                             );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic mt-1">Không có trạng thái nào.</p>
                )}
            </div>

            <div className="bg-gray-750 p-3 rounded-xl shadow-lg border border-lime-700/50 h-full flex flex-col">
               <h4 className="text-md font-semibold text-lime-400 mb-2 flex items-center">👨‍👩‍👧‍👦 Đồng Hành</h4>
                {(knowledgeBase.companions && knowledgeBase.companions.length > 0) ? (
                    <ul className="space-y-1 text-sm overflow-y-auto max-h-24 scrollbar-thin scrollbar-thumb-lime-500 scrollbar-track-gray-700">
                        {knowledgeBase.companions.map((companion, index) => (
                            <li key={index} className="text-gray-300 bg-gray-700 p-2 rounded-md">
                                <strong className="text-lime-300">{companion.Name}</strong>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-gray-400 italic mt-1">Chưa có đồng hành nào.</p>
                )}
            </div>
            
            <div className="bg-gray-750 p-3 rounded-xl shadow-lg border border-yellow-600/50 h-full flex flex-col">
                <h4 className="text-md font-semibold text-yellow-400 mb-1.5 flex items-center">
                    📜 Nhiệm Vụ Đang Làm
                </h4>
                {(knowledgeBase.quests && knowledgeBase.quests.filter(q => q.status === 'active').length > 0) ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                        {knowledgeBase.quests.filter(q => q.status === 'active').map((quest, index) => (
                            <div key={index} className="flex items-center bg-yellow-700/30 hover:bg-yellow-700/50 p-1.5 rounded-md shadow text-yellow-200 cursor-pointer" 
                                 title={`${quest.description}`}
                                 onClick={() => setShowCharacterInfoModal(true)}
                            >
                               <span className="mr-1">📜</span> {quest.title}
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-xs text-gray-400 italic mt-1">Không có nhiệm vụ nào đang hoạt động.</p>
                )}
            </div>
        </div>

        <div className="flex-grow bg-gray-800 p-3 md:p-5 rounded-xl shadow-2xl overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700" style={{ maxHeight: '60vh', minHeight: '300px' }} id="story-content-area"> 
            <h2 className="text-lg font-semibold text-green-400 mb-2">Diễn biến câu chuyện:</h2>
            {storyHistory.map((item) => (
                <StoryItem key={item.id} item={item} formatStoryText={formatStoryText} />
            ))}
            {isLoading && currentStory === '' && (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                    <p className="mt-3 text-purple-300">AI đang viết tiếp câu chuyện...</p>
                </div>
            )}
        </div>

        {!isLoading && (
            <div className="bg-gray-800 p-3 md:p-5 rounded-xl shadow-xl mt-auto">
                {choices.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold text-green-400 mb-3">Lựa chọn của ngươi:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {choices.map((choice, index) => (
                                <button key={index} onClick={() => handleChoice(choice)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
                                    {index + 1}. {choice}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {gameSettings.allowCustomActionInput && ( 
                    <div>
                        <label htmlFor="customActionInput" className="block text-md font-medium text-gray-300 mb-1">Hoặc nhập hành động tùy ý:</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="customActionInput"
                                value={customActionInput}
                                onChange={(e) => setCustomActionInput(e.target.value)}
                                placeholder="Ví dụ: Nhìn xung quanh, Hỏi về chiếc chìa khóa..."
                                className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleCustomAction(customActionInput)}
                            />
                             <button
                                onClick={() => handleCustomAction(customActionInput)}
                                disabled={isLoading}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:shadow-lg transition-colors disabled:bg-gray-500"
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                )}
                 <button onClick={handleGenerateSuggestedActions} disabled={isGeneratingSuggestedActions || isLoading} className="mt-3 w-full sm:w-auto p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md disabled:bg-gray-500 flex items-center justify-center" title="AI Gợi Ý Hành Động">
                    {isGeneratingSuggestedActions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <span className="mr-2">💡</span>}
                    AI Gợi Ý Hành Động
                </button>
            </div>
        )}
         {isLoading && choices.length === 0 && currentStory !== '' && ( 
            <div className="text-center py-5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="mt-2 text-purple-300">Đang tạo lựa chọn...</p>
            </div>
        )}
    </div>
    );
};

const LoadGameModal = ({ savedGames, loadGame, setShowLoadGameModal, setConfirmationModal, userId, setModalMessage }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-blue-600">
        <h2 className="text-2xl font-semibold text-purple-400 mb-4">💾 Tải Game Đã Lưu</h2>
        {savedGames.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Ngươi chưa có cuộc phiêu lưu nào được lưu lại.</p>
        ) : (
          <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700">
            {savedGames.map(game => {
              const gamePersonality = game.settings?.characterPersonality;
              const gameCustomPersonality = game.settings?.customCharacterPersonality;
              const displayedPersonality = gamePersonality === 'Tùy chỉnh...' ? gameCustomPersonality?.trim() || "Chưa rõ" : gamePersonality || "Chưa rõ";
              
              return (
              <div key={game.id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600/80 transition-colors shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold text-green-400 truncate" title={game.settings?.theme}>{game.settings?.theme || "Game Chưa Có Tên"}</h3>
                <p className="text-sm text-gray-300">Nhân vật: {game.settings?.characterName || "N/A"} (Tính cách: {displayedPersonality})</p>
                {game.settings?.useCharacterGoal && game.settings?.characterGoal && (
                    <p className="text-xs text-red-300 truncate" title={`Mục tiêu: ${game.settings.characterGoal}`}>
                        Mục tiêu: {game.settings.characterGoal.substring(0,70)}{game.settings.characterGoal.length > 70 ? "..." : ""}
                    </p>
                )}
                <p className="text-xs text-gray-400">
                  Lần cập nhật cuối: {game.updatedAt && typeof game.updatedAt.toDate === 'function' ? new Date(game.updatedAt.toDate()).toLocaleString('vi-VN') : "Đang xử lý..."}
                </p>
                 <p className="text-xs text-gray-400">Độ khó: {game.settings?.difficulty || "Không rõ"}</p>
                <div className="mt-3 flex space-x-2">
                    <button onClick={() => loadGame(game)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md text-sm shadow hover:shadow-md transition-all">
                    Tải Game Này
                    </button>
                    <button onClick={() => {
                        setConfirmationModal({
                            show: true, title: 'Xác Nhận Xóa Game', content: `Bạn có chắc chắn muốn xóa game "${game.settings?.theme || game.id}" không? Hành động này không thể hoàn tác.`,
                            onConfirm: async () => {
                                try {
                                    await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/games`, game.id));
                                    setModalMessage({ show: true, title: 'Đã Xóa', content: `Game "${game.settings?.theme || game.id}" đã được xóa.`, type: 'success' });
                                } catch (error) {
                                    setModalMessage({ show: true, title: 'Lỗi Xóa Game', content: `Không thể xóa game: ${error.message}`, type: 'error' });
                                }
                            },
                            confirmText: "Xóa Game", cancelText: "Hủy Bỏ"
                        });
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md text-sm shadow hover:shadow-md transition-all">
                    🗑️ Xóa
                    </button>
                </div>
              </div>
            )})}
          </div>
        )}
        <button onClick={() => setShowLoadGameModal(false)} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
          Đóng
        </button>
      </div>
    </div>
  );

const MessageModal = ({ show, title, content, type, onClose }) => {
    if (!show) return null;
    let titleColor = 'text-blue-400', icon = 'ℹ️';
    if (type === 'error') { titleColor = 'text-red-400'; icon = '⚠️'; } 
    else if (type === 'success') { titleColor = 'text-green-400'; icon = '✅'; }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[120]"> 
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{icon}</span>
            <h3 className={`text-xl font-semibold ${titleColor}`}>{title}</h3>
          </div>
          <p className="text-gray-300 mb-6 whitespace-pre-line">{content}</p>
          <button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all">
            Đã hiểu
          </button>
        </div>
      </div>
    );
};

const ConfirmationModal = ({ show, title, content, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy", setConfirmationModal: localSetConfirmationModal }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]"> 
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-yellow-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">⚠️</span>
            <h3 className="text-xl font-semibold text-yellow-400">{title}</h3>
          </div>
          <p className="text-gray-300 mb-6 whitespace-pre-line">{content}</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button onClick={() => { onConfirm(); localSetConfirmationModal(prev => ({ ...prev, show: false })); }} className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all ${confirmText.toLowerCase().includes("xóa") ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {confirmText}
            </button>
            <button onClick={() => { if (onCancel) onCancel(); localSetConfirmationModal(prev => ({ ...prev, show: false })); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all">
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    );
  };

const SuggestionsModal = ({ show, title, suggestions, onSelect, onClose, isLoading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[70]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-pink-700">
                <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center">
                    💡 {title}
                </h3>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="w-8 h-8 border-4 border-t-transparent border-pink-400 rounded-full animate-spin"></div>
                        <p className="ml-3 text-gray-300">Đang tải gợi ý...</p>
                    </div>
                ) : suggestions.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-700">
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>
                                <button onClick={() => { onSelect(suggestion); onClose(); }} className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600/80 rounded-md text-gray-200 transition-colors shadow hover:shadow-md">
                                    {suggestion}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center py-4">Không có gợi ý nào được tạo ra.</p>
                )}
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg">
                    Đóng
                </button>
            </div>
        </div>
    );
}

const MemoryModal = ({ show, onClose, memories, togglePinMemory, clearAllMemories }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-blue-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-blue-400">🧠 Ký Ức Tạm Thời</h2>
                    <button onClick={clearAllMemories} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md text-sm shadow hover:shadow-md transition-all">
                        🗑️ Xóa Tất Cả
                    </button>
                </div>
                <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700">
                    {memories.length === 0 ? (
                        <p className="text-gray-400 text-center py-6">Chưa có ký ức nào.</p>
                    ) : (
                        memories.map(memory => (
                            <div key={memory.id} className={`p-3 rounded-lg transition-colors shadow-md flex justify-between items-start gap-4 ${memory.pinned ? 'bg-blue-900/50 border border-blue-700' : 'bg-gray-700'}`}>
                                <p className="text-sm text-gray-200 whitespace-pre-line flex-1">{memory.content}</p>
                                <button
                                    onClick={() => togglePinMemory(memory.id)}
                                    className={`py-1 px-3 rounded-md text-xs font-semibold transition-colors flex-shrink-0 ${memory.pinned ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                                >
                                    {memory.pinned ? '✅ Đã Ghim' : '📌 Ghim'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
};

const WorldKnowledgeModal = ({ show, onClose, worldKnowledge, addRule, updateRule, toggleRule, deleteRule, handleSaveKnowledgeToFile, handleLoadKnowledgeFromFile }) => {
    if (!show) return null;

    const knowledgeFileInputRef = useRef(null);

    const handleLoadClick = () => {
        knowledgeFileInputRef.current.click();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-green-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-green-400">🌍 Tri Thức Thế Giới</h2>
                </div>
                <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-700 flex-grow">
                    {worldKnowledge.length === 0 ? (
                        <p className="text-gray-400 text-center py-6">Chưa có luật lệ hay tri thức nào được thêm vào.</p>
                    ) : (
                        worldKnowledge.map((rule) => (
                            <div key={rule.id} className="p-3 bg-gray-700/80 rounded-lg flex items-start gap-3">
                                <textarea
                                    value={rule.content}
                                    onChange={(e) => updateRule(rule.id, e.target.value)}
                                    placeholder="Nhập một luật lệ hoặc tri thức về thế giới (VD: 'Tất cả rồng đều sợ nước', 'Ma thuật lửa bị yếu đi vào ban đêm')..."
                                    className="flex-grow bg-gray-600 text-white p-2 rounded-md text-sm border border-gray-500 focus:ring-green-500 focus:border-green-500"
                                    rows="2"
                                />
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => toggleRule(rule.id)} className={`py-1 px-2 text-xs rounded-md font-semibold ${rule.enabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-400'}`}>
                                        {rule.enabled ? '✅ Bật' : '⚫ Tắt'}
                                    </button>
                                     <button onClick={() => deleteRule(rule.id)} className="bg-red-700 hover:bg-red-800 text-white font-semibold py-1 px-2 rounded-md text-xs">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                 <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={addRule} className="flex-grow bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                        ➕ Thêm Luật Mới
                    </button>
                    <button onClick={handleSaveKnowledgeToFile} className="flex-grow bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                        💾 Lưu Tri Thức
                    </button>
                    <button onClick={handleLoadClick} className="flex-grow bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                        📂 Tải Tri Thức
                    </button>
                    <input type="file" ref={knowledgeFileInputRef} onChange={handleLoadKnowledgeFromFile} accept=".json" className="hidden" />
                </div>
                <button onClick={onClose} className="mt-2 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('initial');
  const [apiKey, setApiKey] = useState(''); 
  const [apiMode, setApiMode] = useState('defaultGemini'); 
  const [apiKeyStatus, setApiKeyStatus] = useState({ status: 'Đang dùng Gemini AI Mặc Định', message: 'Không cần API Key.', color: 'text-sky-400' });
  const [gameSettings, setGameSettings] = useState({
    theme: '', setting: '', narratorPronoun: 'Để AI quyết định', 
    characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], customCharacterPersonality: '',
    characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', 
    difficulty: 'Thường', difficultyDescription: '', allowNsfw: false, 
    initialWorldElements: [], useCharacterGoal: false, characterGoal: '',   
    allowCustomActionInput: true, 
  });
  const [storyHistory, setStoryHistory] = useState([]); 
  const [currentStory, setCurrentStory] = useState('');
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showUpdateLogModal, setShowUpdateLogModal] = useState(false);
  const [inputApiKey, setInputApiKey] = useState(''); 
  const [chatHistoryForGemini, setChatHistoryForGemini] = useState([]);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [savedGames, setSavedGames] = useState([]);
  const [showLoadGameModal, setShowLoadGameModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ show: false, title: '', content: '', type: 'info' });
  const [confirmationModal, setConfirmationModal] = useState({ show: false, title: '', content: '', onConfirm: null, onCancel: null, confirmText: 'Xác nhận', cancelText: 'Hủy'});
  const [customActionInput, setCustomActionInput] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState({ 
    npcs: [], items: [], locations: [], companions: [], 
    inventory: [], playerSkills: [], relationships: {},
    playerStatus: [], quests: [],
  });
  const [showCharacterInfoModal, setShowCharacterInfoModal] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState({ show: false, fieldType: null, suggestions: [], isLoading: true, title: '' });
  const [isGeneratingContent, setIsGeneratingContent] = useState(false); 
  const [isGeneratingDifficultyDesc, setIsGeneratingDifficultyDesc] = useState(false);
  const [isGeneratingInitialElementDesc, setIsGeneratingInitialElementDesc] = useState({});
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false); 
  const [isGeneratingSuggestedActions, setIsGeneratingSuggestedActions] = useState(false);
  const [suggestedActionsList, setSuggestedActionsList] = useState([]);
  const [showSuggestedActionsModal, setShowSuggestedActionsModal] = useState(false);
  const [isGeneratingCharacterName, setIsGeneratingCharacterName] = useState(false);
  const [isGeneratingInitialSkill, setIsGeneratingInitialSkill] = useState(false);
  const [showQuickLoreModal, setShowQuickLoreModal] = useState(false);
  const [quickLoreContent, setQuickLoreContent] = useState(null);
  const [memories, setMemories] = useState([]);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [worldKnowledge, setWorldKnowledge] = useState([]);
  const [showWorldKnowledgeModal, setShowWorldKnowledgeModal] = useState(false);
  
  const finalPersonality = gameSettings.characterPersonality === 'Tùy chỉnh...'
  ? gameSettings.customCharacterPersonality?.trim() || "Không rõ"
  : gameSettings.characterPersonality;

  const sanitizeDataForFirestore = (data) => {
    if (data === null || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(item => sanitizeDataForFirestore(item));
    const sanitizedObject = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (value !== undefined) sanitizedObject[key] = sanitizeDataForFirestore(value);
        }
    }
    return sanitizedObject;
  };

  const openQuickLoreModal = useCallback((item, category) => {
    if (item) {
        setQuickLoreContent({...item, category: category.toLowerCase()}); 
        setShowQuickLoreModal(true);
    } else {
        console.error("openQuickLoreModal was called with an invalid item.");
        setModalMessage({show: true, title: "Lỗi Hiển Thị", content: `Không thể hiển thị thông tin chi tiết.`, type: 'error'});
    }
  }, []); 

  // --- World Knowledge Handlers ---
  const addWorldKnowledge = () => {
    setWorldKnowledge(prev => [...prev, { id: crypto.randomUUID(), content: '', enabled: true }]);
  };
  const updateWorldKnowledge = (id, content) => {
    setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, content } : rule));
  };
  const toggleWorldKnowledge = (id) => {
    setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  };
  const deleteWorldKnowledge = (id) => {
    setWorldKnowledge(prev => prev.filter(rule => rule.id !== id));
  };
  // -----------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userGeminiKey = await loadApiKey(user.uid);
        if (userGeminiKey) {
          setApiKey(userGeminiKey); setInputApiKey(userGeminiKey); setApiMode('userKey'); 
          setApiKeyStatus({ status: 'Đã kết nối', message: 'API Key của Gemini đã được tải.', color: 'text-green-500' });
        } else {
          setApiMode('defaultGemini');
          setApiKeyStatus({ status: 'Đang dùng Gemini AI Mặc Định', message: 'Không cần API Key.', color: 'text-sky-400' });
        }
      } else {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
        } catch (error) {
          console.error("Error during sign-in:", error);
          setApiKeyStatus({ status: 'Lỗi xác thực', message: `Không thể xác thực: ${error.message}`, color: 'text-red-500' });
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthReady && userId) {
      const gamesCollectionPath = `artifacts/${appId}/users/${userId}/games`;
      const q = query(collection(db, gamesCollectionPath));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const games = [];
        querySnapshot.forEach((doc) => games.push({ id: doc.id, ...doc.data() }) );
        const sortedGames = games.sort((a, b) => {
            const timeA = a.updatedAt?.toDate?.()?.getTime() || 0;
            const timeB = b.updatedAt?.toDate?.()?.getTime() || 0;
            return timeB - timeA;
        });
        setSavedGames(sortedGames);
      }, (error) => {
        console.error("Error fetching saved games:", error);
        setModalMessage({ show: true, title: 'Lỗi Tải Game', content: `Không thể tải danh sách game đã lưu: ${error.message}`, type: 'error' });
      });
      return () => unsubscribe();
    }
  }, [isAuthReady, userId, db, appId]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setGameSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === "difficulty" && value !== "Tuỳ Chỉnh AI") setGameSettings(prev => ({ ...prev, difficultyDescription: '' }));
    if (name === "useCharacterGoal" && !checked) setGameSettings(prev => ({ ...prev, characterGoal: '' }));
  }, []);

  const addInitialWorldElement = () => setGameSettings(prev => ({ ...prev, initialWorldElements: [...prev.initialWorldElements, { id: crypto.randomUUID(), type: 'NPC', name: '', description: '', personality: '' }] }));
  const removeInitialWorldElement = (id) => setGameSettings(prev => ({ ...prev, initialWorldElements: prev.initialWorldElements.filter(el => el.id !== id) }));
  const handleInitialElementChange = (index, event) => {
    const { name, value } = event.target;
    setGameSettings(prev => {
        const updatedElements = [...prev.initialWorldElements];
        updatedElements[index] = { ...updatedElements[index], [name]: value };
        return { ...prev, initialWorldElements: updatedElements };
    });
  };

  const handleGenerateInitialElementDescription = async (index) => {
    const element = gameSettings.initialWorldElements[index];
    if (!element || !element.name) { setModalMessage({show: true, title: "Thiếu Tên", content: "Vui lòng nhập tên thực thể trước khi tạo mô tả.", type: "info"}); return; }
    setIsGeneratingInitialElementDesc(prev => ({...prev, [element.id]: true}));
    const { theme, setting } = gameSettings; 
    const personalityInfo = element.type === 'NPC' && element.personality ? `Tính cách NPC đã cho: ${element.personality}.` : 'Tính cách NPC: AI tự quyết định.';
    const promptText = `Chủ đề: '${theme || "Chưa rõ"}', Bối cảnh: '${setting || "Chưa rõ"}', Tên: '${element.name}', Loại: '${element.type}', ${personalityInfo}. Viết một mô tả ngắn (1-3 câu) bằng tiếng Việt cho thực thể này, phong cách tiểu thuyết mạng. Chỉ trả về mô tả.`;
    const generatedText = await fetchGenericGeminiText(promptText);
    if (generatedText) {
        setGameSettings(prev => {
            const updatedElements = [...prev.initialWorldElements];
            updatedElements[index] = { ...updatedElements[index], description: generatedText };
            return { ...prev, initialWorldElements: updatedElements };
        });
    }
    setIsGeneratingInitialElementDesc(prev => ({...prev, [element.id]: false}));
  };

  const saveApiKey = async () => { 
    if (!userId) { setModalMessage({ show: true, title: 'Lỗi', content: 'Người dùng chưa được xác thực.', type: 'error' }); return; }
    if (!inputApiKey.trim()) { setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'API Key không được để trống.', type: 'error' }); return; }
    setIsLoading(true); 
    try {
      const apiKeyRef = doc(db, `artifacts/${appId}/users/${userId}/apiCredentials/gemini`);
      await setDoc(apiKeyRef, { key: inputApiKey, lastUpdated: serverTimestamp() });
      setApiKey(inputApiKey); setApiMode('userKey'); 
      setApiKeyStatus({ status: 'Đã lưu', message: 'API Key của bạn đã được lưu!', color: 'text-green-500' });
      setShowApiModal(false);
      setModalMessage({ show: true, title: 'Thành Công', content: 'API Key của bạn đã được lưu!', type: 'success' });
    } catch (error) {
      console.error("Error saving API key:", error);
      setApiKeyStatus({ status: 'Lỗi', message: `Lưu API Key thất bại: ${error.message}`, color: 'text-red-500' });
    }
    setIsLoading(false);
  };

  const loadApiKey = async (currentUserId) => {
    if (!currentUserId) return null;
    try {
      const apiKeyRef = doc(db, `artifacts/${appId}/users/${currentUserId}/apiCredentials/gemini`);
      const docSnap = await getDoc(apiKeyRef);
      return docSnap.exists() ? docSnap.data().key : null;
    } catch (error) { console.error("Error loading API key:", error); return null; }
  };

  const testApiKey = async () => { 
    if (!inputApiKey) { setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập API Key để kiểm tra.', type: 'info' }); return; }
    setIsLoading(true);
    setApiKeyStatus({ status: 'Đang kiểm tra...', message: 'Vui lòng đợi.', color: 'text-blue-500' });
    const payload = { contents: [{ role: "user", parts: [{ text: "Xin chào!" }] }] };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${inputApiKey}`;
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (response.ok && result.candidates) {
        setApiKeyStatus({ status: 'Thành công', message: 'API Key hợp lệ!', color: 'text-green-500' });
      } else {
        const errorMessage = result.error?.message || `Mã lỗi ${response.status}.`;
        setApiKeyStatus({ status: 'Thất bại', message: `Kiểm tra thất bại: ${errorMessage}`, color: 'text-red-500' });
      }
    } catch (error) {
      setApiKeyStatus({ status: 'Lỗi Mạng', message: `Lỗi kết nối: ${error.message}.`, color: 'text-red-500' });
    }
    setIsLoading(false);
  };
  
  const fetchGenericGeminiText = async (promptText) => {
    const effectiveApiKey = apiMode === 'defaultGemini' ? "" : apiKey;
    if (apiMode === 'userKey' && !effectiveApiKey) { setModalMessage({ show: true, title: 'Lỗi API Key', content: 'Vui lòng vào Thiết Lập API.', type: 'error' }); setShowApiModal(true); return null; }
    const payload = { contents: [{ role: "user", parts: [{ text: promptText }] }] };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${effectiveApiKey}`;
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        return result.candidates[0].content.parts[0].text.trim();
      } else {
        const errorMsg = result.error?.message || "Không thể lấy dữ liệu từ AI.";
        setModalMessage({ show: true, title: 'Lỗi AI', content: errorMsg, type: 'error' });
        return null;
      }
    } catch (error) {
      setModalMessage({ show: true, title: 'Lỗi Mạng', content: `Lỗi kết nối khi gọi AI: ${error.message}`, type: 'error' });
      return null;
    }
  };

  const handleFetchSuggestions = async (fieldType) => {
    setIsFetchingSuggestions(true);
    setShowSuggestionsModal({ show: true, fieldType, suggestions: [], isLoading: true, title: fieldType === 'theme' ? "✨ Gợi Ý Chủ Đề" : "✨ Gợi Ý Bối Cảnh" });
    let promptText = '';
    if (fieldType === 'theme') promptText = "Gợi ý 5 chủ đề độc đáo (tiếng Việt) cho game phiêu lưu văn bản, phong cách tiểu thuyết mạng. Mỗi chủ đề trên một dòng. Chỉ trả về chủ đề.";
    else if (fieldType === 'setting') {
      const currentTheme = gameSettings.theme || 'phiêu lưu chung';
      promptText = `Gợi ý 5 bối cảnh (tiếng Việt) cho game có chủ đề '${currentTheme}', phong cách tiểu thuyết mạng. Mỗi bối cảnh trên một dòng. Chỉ trả về bối cảnh.`;
    }
    const suggestionsText = await fetchGenericGeminiText(promptText);
    if (suggestionsText) {
      const suggestionsArray = suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
      setShowSuggestionsModal(prev => ({ ...prev, suggestions: suggestionsArray, isLoading: false }));
    } else setShowSuggestionsModal(prev => ({ ...prev, suggestions: [], isLoading: false })); 
    setIsFetchingSuggestions(false);
  };
  
  const handleGenerateBackstory = async () => {
    setIsGeneratingContent(true);
    const { characterName, characterGender, theme, setting, characterPersonality } = gameSettings; 
    const promptText = `Tên='${characterName || 'NV chính'}', Giới tính='${characterGender}', Tính cách='${finalPersonality}', Chủ đề='${theme || 'Chưa rõ'}', Bối cảnh='${setting || 'Chưa rõ'}. Viết một tiểu sử ngắn (2-3 câu, tiếng Việt) cho nhân vật này, văn phong tiểu thuyết mạng. Chỉ trả về tiểu sử.`;
    const backstoryText = await fetchGenericGeminiText(promptText);
    if (backstoryText) setGameSettings(prev => ({ ...prev, characterBackstory: backstoryText }));
    setIsGeneratingContent(false);
  };

  const handleGenerateDifficultyDescription = async () => {
    setIsGeneratingDifficultyDesc(true);
    const { theme, setting } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', bối cảnh='${setting || "Chưa rõ"}'. Viết mô tả ngắn (1-2 câu, tiếng Việt) về độ khó "Tuỳ Chỉnh AI" cho game, văn phong tiểu thuyết mạng. Chỉ trả về mô tả.`;
    const descText = await fetchGenericGeminiText(promptText);
    if (descText) setGameSettings(prev => ({ ...prev, difficultyDescription: descText }));
    setIsGeneratingDifficultyDesc(false);
  };

  const handleGenerateGoal = async () => {
    setIsGeneratingGoal(true);
    const { theme, setting, characterPersonality, characterBackstory } = gameSettings; 
    const promptText = `Chủ đề='${theme}', Bối cảnh='${setting}', Tính cách='${finalPersonality}', Tiểu sử='${characterBackstory}'. Gợi ý 3-4 mục tiêu/động lực (tiếng Việt) cho nhân vật. Mỗi mục tiêu trên một dòng.`;
    const generatedText = await fetchGenericGeminiText(promptText);
    if (generatedText) {
        const suggestionsArray = generatedText.split('\n').map(s => s.trim()).filter(s => s);
        setShowSuggestionsModal({ show: true, fieldType: 'characterGoal', suggestions: suggestionsArray, isLoading: false, title: "✨ Gợi Ý Mục Tiêu/Động Lực" });
    }
    setIsGeneratingGoal(false);
  };

  const handleGenerateCharacterName = async () => {
    setIsGeneratingCharacterName(true);
    const { theme, characterGender } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', giới tính='${characterGender}'. Gợi ý MỘT tên nhân vật (tiếng Việt) phong cách tiểu thuyết mạng. Chỉ trả về tên.`;
    const generatedName = await fetchGenericGeminiText(promptText);
    if (generatedName) setGameSettings(prev => ({ ...prev, characterName: generatedName.split('\n')[0].trim() }));
    setIsGeneratingCharacterName(false);
  };

  const handleGenerateInitialSkill = async () => {
    setIsGeneratingInitialSkill(true);
    const { theme, characterBackstory } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', tiểu sử='${characterBackstory || "Chưa rõ"}'. Gợi ý MỘT kỹ năng khởi đầu phù hợp (tiếng Việt). Chỉ trả về tên kỹ năng.`;
    const generatedSkill = await fetchGenericGeminiText(promptText);
    if (generatedSkill) setGameSettings(prev => ({ ...prev, preferredInitialSkill: generatedSkill.split('\n')[0].trim() }));
    setIsGeneratingInitialSkill(false);
  };

  const handleGenerateSuggestedActions = async () => {
    setIsGeneratingSuggestedActions(true);
    setSuggestedActionsList([]);
    const lastStoryItem = storyHistory.filter(item => item.type === 'story').pop()?.content || "Chưa có diễn biến.";
    const promptText = `Bối cảnh: ${lastStoryItem}. Tính cách NV: ${finalPersonality}. Mục tiêu: ${gameSettings.characterGoal || 'Chưa rõ'}. Gợi ý 3-4 hành động ngắn gọn, phù hợp (tiếng Việt). Mỗi gợi ý trên một dòng.`;
    const suggestionsText = await fetchGenericGeminiText(promptText);
    if (suggestionsText) {
        const suggestionsArray = suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
        setSuggestedActionsList(suggestionsArray);
        setShowSuggestedActionsModal(true);
    }
    setIsGeneratingSuggestedActions(false);
  };

  const addMemory = (memoryContent) => {
    if (!memoryContent || memoryContent.trim() === '') return;
    const newMemory = { 
        id: crypto.randomUUID(), 
        content: memoryContent, 
        pinned: false, 
        timestamp: Date.now() 
    };

    setMemories(prevMemories => {
        const updatedMemories = [newMemory, ...prevMemories];
        const MAX_UNPINNED_MEMORIES = 7;
        const pinned = updatedMemories.filter(m => m.pinned);
        const unpinned = updatedMemories.filter(m => !m.pinned);
        const latestUnpinned = unpinned.slice(0, MAX_UNPINNED_MEMORIES);
        return [...pinned, ...latestUnpinned].sort((a, b) => b.timestamp - a.timestamp);
    });
  };

  const togglePinMemory = (id) => {
      setMemories(mems => mems.map(mem => mem.id === id ? { ...mem, pinned: !mem.pinned } : mem).sort((a, b) => b.timestamp - a.timestamp));
  };

  const clearAllMemories = () => {
      setConfirmationModal({
          show: true,
          title: 'Xóa Tất Cả Ký Ức?',
          content: 'Bạn có chắc muốn xóa toàn bộ ký ức tạm thời không? Hành động này không thể hoàn tác.',
          onConfirm: () => setMemories([]),
          confirmText: "Xóa Tất Cả",
          cancelText: "Hủy"
      });
  };
  
  
  const parseGeminiResponseAndUpdateState = async (text) => {
    let storyContent = text;
    
    const newKnowledgeUpdates = { 
        npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [],
        playerStatus: [], quests: [], _removePlayerStatusByName: [], _updateNpcStatus: [], 
        _updateQuest: [], _updateQuestObjective: [], _setRelationship: [], _updateNpcIdentity: [],
        _updateLocationIdentity: [],
    };

    const tagPatterns = {
        MEMORY_ADD: /\[MEMORY_ADD:\s*"([^"]+)"\]/gs,
        WORLD_EVENT: /\[WORLD_EVENT:\s*"([^"]+)"\]/gs,
        LORE_NPC: /\[LORE_NPC:\s*([^\]]+)\]/gs, 
        LORE_UPDATE_NPC: /\[LORE_UPDATE_NPC:\s*([^\]]+)\]/gs,
        LORE_LOCATION: /\[LORE_LOCATION:\s*([^\]]+)\]/gs,
        LORE_UPDATE_LOCATION: /\[LORE_UPDATE_LOCATION:\s*([^\]]+)\]/gs,
        LORE_ITEM: /\[LORE_ITEM:\s*([^\]]+)\]/gs, 
        COMPANION: /\[COMPANION:\s*([^\]]+)\]/gs, 
        ITEM_AQUIRED: /\[ITEM_AQUIRED:\s*([^\]]+)\]/gs, 
        SKILL_LEARNED: /\[SKILL_LEARNED:\s*([^\]]+)\]/gs,
        RELATIONSHIP_SET: /\[RELATIONSHIP_SET:\s*([^\]]+)\]/gs, 
        ITEM_CONSUMED: /\[ITEM_CONSUMED:\s*([^\]]+)\]/gs, 
        ITEM_UPDATED: /\[ITEM_UPDATED:\s*([^\]]+)\]/gs,   
        STATUS_APPLIED_SELF: /\[STATUS_APPLIED_SELF:\s*([^\]]+)\]/gs, 
        STATUS_CURED_SELF: /\[STATUS_CURED_SELF:\s*Name="([^"]+)"\]/gs, 
        STATUS_EXPIRED_SELF: /\[STATUS_EXPIRED_SELF:\s*Name="([^"]+)"\]/gs, 
        STATUS_APPLIED_NPC: /\[STATUS_APPLIED_NPC:\s*([^\]]+)\]/gs,
        STATUS_CURED_NPC: /\[STATUS_CURED_NPC:\s*NPCName="([^"]+)",\s*StatusName="([^"]+)"\]/gs, 
        STATUS_EXPIRED_NPC: /\[STATUS_EXPIRED_NPC:\s*NPCName="([^"]+)",\s*StatusName="([^"]+)"\]/gs,
        QUEST_ASSIGNED: /\[QUEST_ASSIGNED:\s*([^\]]+)\]/gs, 
        QUEST_UPDATED: /\[QUEST_UPDATED:\s*([^\]]+)\]/gs, 
        QUEST_OBJECTIVE_COMPLETED: /\[QUEST_OBJECTIVE_COMPLETED:\s*([^\]]+)\]/gs,
    };

    const categoryMap = {
        LORE_NPC: 'npcs', LORE_ITEM: 'items', LORE_LOCATION: 'locations', COMPANION: 'companions', ITEM_AQUIRED: 'inventory', 
        SKILL_LEARNED: 'playerSkills', ITEM_CONSUMED: 'inventory', ITEM_UPDATED: 'inventory',
        STATUS_APPLIED_SELF: 'playerStatus', QUEST_ASSIGNED: 'quests',
    };

    for (const tagType in tagPatterns) {
        const regex = tagPatterns[tagType];
        let match;
        const matchesToReplace = [];
        while ((match = regex.exec(storyContent)) !== null) {
            matchesToReplace.push(match[0]);
            try {
                if (tagType === 'MEMORY_ADD') {
                    addMemory(match[1]);
                    continue;
                }
                if (tagType === 'WORLD_EVENT') {
                    // Currently just a marker, doesn't update state directly
                    continue;
                }

                const getPrimaryKey = (data, category) => {
                    if (category === 'playerStatus') return data.name;
                    if (category === 'quests') return data.title;
                    return data.Name || data.NPC;
                };

                if (tagType === 'LORE_UPDATE_NPC') {
                    const parsedData = parseKeyValueString(match[1]);
                    if (parsedData.OldName?.trim() && parsedData.NewName?.trim()) {
                        newKnowledgeUpdates._updateNpcIdentity.push(parsedData);
                    }
                } else if (tagType === 'LORE_UPDATE_LOCATION') {
                    const parsedData = parseKeyValueString(match[1]);
                    if (parsedData.OldName?.trim() && parsedData.NewName?.trim()) {
                        newKnowledgeUpdates._updateLocationIdentity.push(parsedData);
                    }
                } else if (tagType.includes('STATUS_CURED_SELF') || tagType.includes('STATUS_EXPIRED_SELF')) {
                    if (match[1] && match[1].trim() !== '') newKnowledgeUpdates._removePlayerStatusByName.push(match[1].trim());
                } else if (tagType.includes('STATUS_APPLIED_NPC')) {
                    const parsedData = parseKeyValueString(match[1]); 
                    if (parsedData.NPCName?.trim() && parsedData.Name?.trim()) newKnowledgeUpdates._updateNpcStatus.push({ npcName: parsedData.NPCName, status: { id: crypto.randomUUID(), ...parsedData, NPCName: undefined } });
                } else if (tagType.includes('STATUS_CURED_NPC') || tagType.includes('STATUS_EXPIRED_NPC')) {
                    if (match[1]?.trim() && match[2]?.trim()) newKnowledgeUpdates._updateNpcStatus.push({ npcName: match[1], removeStatusName: match[2] });
                } else if (tagType === 'QUEST_UPDATED') {
                    const parsedData = parseKeyValueString(match[1]);
                    if (parsedData.title?.trim()) newKnowledgeUpdates._updateQuest.push(parsedData);
                } else if (tagType === 'QUEST_OBJECTIVE_COMPLETED') {
                    const parsedData = parseKeyValueString(match[1]);
                    if (parsedData.questTitle?.trim() && parsedData.objectiveDescription?.trim()) newKnowledgeUpdates._updateQuestObjective.push(parsedData);
                } else if (tagType === 'RELATIONSHIP_SET') {
                    const parsedData = parseKeyValueString(match[1]);
                    if (parsedData.NPC?.trim() && parsedData.Emotion?.trim() && parsedData.Level?.trim()) {
                        newKnowledgeUpdates._setRelationship.push(parsedData);
                    }
                } else { 
                    const parsedData = parseKeyValueString(match[1]);
                    const categoryKey = categoryMap[tagType];
                    const primaryKey = getPrimaryKey(parsedData, categoryKey);

                    if (primaryKey && primaryKey.trim() !== '') {
                        let itemWithId = { id: crypto.randomUUID(), ...parsedData, name: parsedData.name || parsedData.Name }; 
                        if (categoryKey === 'quests') {
                            itemWithId.objectives = parsedData.objectives ? parsedData.objectives.split(';').map(objText => ({ text: objText.trim(), completed: false })) : [];
                            itemWithId.status = parsedData.status || 'active';
                        }
                        if (tagType === 'ITEM_CONSUMED') {
                            if (!newKnowledgeUpdates._toRemove) newKnowledgeUpdates._toRemove = [];
                            newKnowledgeUpdates._toRemove.push({ category: categoryKey, name: itemWithId.Name });
                        } else if (tagType === 'ITEM_UPDATED') {
                            if (!newKnowledgeUpdates._toUpdate) newKnowledgeUpdates._toUpdate = [];
                            newKnowledgeUpdates._toUpdate.push({ category: categoryKey, data: itemWithId });
                        } else if (categoryKey) {
                             if (!newKnowledgeUpdates[categoryKey]) newKnowledgeUpdates[categoryKey] = [];
                             newKnowledgeUpdates[categoryKey].push(itemWithId);
                        }
                    }
                }
            } catch (e) { console.error(`Error parsing ${tagType}:`, match[1], e); }
        }
        matchesToReplace.forEach(matchStr => storyContent = storyContent.replace(matchStr, "").trim());
    }
    
    setKnowledgeBase(prev => {
        let updatedKnowledge = JSON.parse(JSON.stringify(prev)); 
        for (const categoryKey in newKnowledgeUpdates) {
            if (categoryKey.startsWith('_')) continue; 
            if (newKnowledgeUpdates[categoryKey] && newKnowledgeUpdates[categoryKey].length > 0) {
                if (!updatedKnowledge[categoryKey]) updatedKnowledge[categoryKey] = [];
                newKnowledgeUpdates[categoryKey].forEach(newItem => {
                    const uniqueKey = newItem.Name || newItem.NPC || newItem.name || newItem.title; 
                    const existingIndex = updatedKnowledge[categoryKey].findIndex(existingItem => 
                        ((existingItem.Name && existingItem.Name.trim().toLowerCase() === uniqueKey.trim().toLowerCase()) ||
                         (existingItem.NPC && existingItem.NPC.trim().toLowerCase() === uniqueKey.trim().toLowerCase()) ||
                         (existingItem.name && existingItem.name.trim().toLowerCase() === uniqueKey.trim().toLowerCase()) ||
                         (existingItem.title && existingItem.title.trim().toLowerCase() === uniqueKey.trim().toLowerCase())) 
                    );
                    if (existingIndex > -1) updatedKnowledge[categoryKey][existingIndex] = { ...updatedKnowledge[categoryKey][existingIndex], ...newItem };
                    else updatedKnowledge[categoryKey].push(newItem);
                });
            }
        }
        if (newKnowledgeUpdates._toUpdate) {
            newKnowledgeUpdates._toUpdate.forEach(updateInstruction => {
                const { category, data } = updateInstruction;
                if (updatedKnowledge[category]) {
                    const itemIndex = updatedKnowledge[category].findIndex(item => item.Name === data.Name);
                    if (itemIndex > -1) {
                        updatedKnowledge[category][itemIndex] = { ...updatedKnowledge[category][itemIndex], ...data };
                        if (updatedKnowledge[category][itemIndex].Consumable && 
                            typeof updatedKnowledge[category][itemIndex].Uses === 'number' &&
                            updatedKnowledge[category][itemIndex].Uses <= 0) {
                             updatedKnowledge[category].splice(itemIndex, 1);
                        }
                    }
                }
            });
        }
        if (newKnowledgeUpdates._toRemove) { 
            newKnowledgeUpdates._toRemove.forEach(removalInstruction => {
                const { category, name } = removalInstruction;
                if (updatedKnowledge[category]) {
                    updatedKnowledge[category] = updatedKnowledge[category].filter(item => item.Name !== name);
                }
            });
        }
        if (newKnowledgeUpdates._removePlayerStatusByName.length > 0) {
            updatedKnowledge.playerStatus = updatedKnowledge.playerStatus.filter(status => 
                !newKnowledgeUpdates._removePlayerStatusByName.includes(status.name)
            );
        }
        
        if (newKnowledgeUpdates._updateNpcStatus.length > 0) {
            newKnowledgeUpdates._updateNpcStatus.forEach(update => {
                const npcIndex = updatedKnowledge.npcs.findIndex(npc => npc.Name === update.npcName);
                if (npcIndex > -1) {
                    if (!updatedKnowledge.npcs[npcIndex].statuses) {
                        updatedKnowledge.npcs[npcIndex].statuses = [];
                    }
                    if (update.status) { 
                        const existingStatusIndex = updatedKnowledge.npcs[npcIndex].statuses.findIndex(s => s.name === update.status.name);
                        if (existingStatusIndex > -1) {
                            updatedKnowledge.npcs[npcIndex].statuses[existingStatusIndex] = {...updatedKnowledge.npcs[npcIndex].statuses[existingStatusIndex], ...update.status};
                        } else {
                            updatedKnowledge.npcs[npcIndex].statuses.push(update.status);
                        }
                    } else if (update.removeStatusName) { 
                        updatedKnowledge.npcs[npcIndex].statuses = updatedKnowledge.npcs[npcIndex].statuses.filter(
                            s => s.name !== update.removeStatusName
                        );
                    }
                }
            });
        }
        if (newKnowledgeUpdates._updateQuest.length > 0) {
            newKnowledgeUpdates._updateQuest.forEach(questUpdateData => {
                const questIndex = updatedKnowledge.quests.findIndex(q => q.title === questUpdateData.title);
                if (questIndex > -1) {
                    updatedKnowledge.quests[questIndex] = { ...updatedKnowledge.quests[questIndex], ...questUpdateData };
                    if (questUpdateData.objectiveCompleted && updatedKnowledge.quests[questIndex].objectives) {
                        const objIndex = updatedKnowledge.quests[questIndex].objectives.findIndex(obj => obj.text === questUpdateData.objectiveCompleted);
                        if (objIndex > -1) {
                            updatedKnowledge.quests[questIndex].objectives[objIndex].completed = true;
                        }
                    }
                }
            });
        }
        if (newKnowledgeUpdates._updateQuestObjective.length > 0) {
            newKnowledgeUpdates._updateQuestObjective.forEach(objUpdateData => {
                const questIndex = updatedKnowledge.quests.findIndex(q => q.title === objUpdateData.questTitle);
                if (questIndex > -1 && updatedKnowledge.quests[questIndex].objectives) {
                    const objIndex = updatedKnowledge.quests[questIndex].objectives.findIndex(obj => obj.text === objUpdateData.objectiveDescription);
                    if (objIndex > -1) {
                        updatedKnowledge.quests[questIndex].objectives[objIndex].completed = true;
                    }
                }
            });
        }
        if (newKnowledgeUpdates._setRelationship.length > 0) {
            if (!updatedKnowledge.relationships || typeof updatedKnowledge.relationships !== 'object' || Array.isArray(updatedKnowledge.relationships)) {
                updatedKnowledge.relationships = {};
            }
            newKnowledgeUpdates._setRelationship.forEach(update => {
                const { NPC, Emotion, Level, Reason, Mode } = update;
                const newEmotionState = { emotion: Emotion, level: Level, reason: Reason || '' };

                if (Mode && Mode.toLowerCase() === 'replace') {
                    if (Level.toLowerCase().includes("không còn")) {
                        delete updatedKnowledge.relationships[NPC];
                    } else {
                        updatedKnowledge.relationships[NPC] = [newEmotionState];
                    }
                    return; 
                }

                if (!updatedKnowledge.relationships[NPC]) {
                    updatedKnowledge.relationships[NPC] = [];
                }
                const emotionIndex = updatedKnowledge.relationships[NPC].findIndex(e => e.emotion === Emotion);

                if (Level.toLowerCase().includes("không còn")) {
                    updatedKnowledge.relationships[NPC] = updatedKnowledge.relationships[NPC].filter(e => e.emotion !== Emotion);
                } else if (emotionIndex > -1) {
                    updatedKnowledge.relationships[NPC][emotionIndex] = newEmotionState;
                } else {
                    updatedKnowledge.relationships[NPC].push(newEmotionState);
                }
                
                if (updatedKnowledge.relationships[NPC] && updatedKnowledge.relationships[NPC].length === 0) {
                    delete updatedKnowledge.relationships[NPC];
                }
            });
        }
        if (newKnowledgeUpdates._updateNpcIdentity.length > 0) {
            newKnowledgeUpdates._updateNpcIdentity.forEach(update => {
                const { OldName, NewName, ...otherUpdates } = update;
                const npcIndex = updatedKnowledge.npcs.findIndex(npc => npc.Name && npc.Name.trim().toLowerCase() === OldName.trim().toLowerCase());

                if (npcIndex > -1) {
                    updatedKnowledge.npcs[npcIndex] = { ...updatedKnowledge.npcs[npcIndex], ...otherUpdates, Name: NewName };
                    if (updatedKnowledge.relationships && updatedKnowledge.relationships[OldName]) {
                        updatedKnowledge.relationships[NewName] = updatedKnowledge.relationships[OldName];
                        delete updatedKnowledge.relationships[OldName];
                    }
                } else {
                    console.warn(`LORE_UPDATE_NPC failed: Could not find NPC with OldName="${OldName}" to update to NewName="${NewName}".`);
                }
            });
        }
        if (newKnowledgeUpdates._updateLocationIdentity.length > 0) {
            newKnowledgeUpdates._updateLocationIdentity.forEach(update => {
                const { OldName, NewName, ...otherUpdates } = update;
                const locIndex = updatedKnowledge.locations.findIndex(loc => loc.Name && loc.Name.trim().toLowerCase() === OldName.trim().toLowerCase());

                if (locIndex > -1) {
                    updatedKnowledge.locations[locIndex] = { ...updatedKnowledge.locations[locIndex], ...otherUpdates, Name: NewName };
                } else {
                    console.warn(`LORE_UPDATE_LOCATION failed: Could not find Location with OldName="${OldName}" to update to NewName="${NewName}".`);
                }
            });
        }
        return updatedKnowledge;
    });

    // --- NEW, ROBUST CHOICE PARSING LOGIC ---
    let story = storyContent;
    let choices = [];
    const lines = story.split('\n');
    let lastChoiceBlockIndex = -1;

    // Find the starting index of the LAST block of numbered items (e.g., starting with "1.")
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().match(/^1\.\s/)) {
            lastChoiceBlockIndex = i;
        }
    }

    if (lastChoiceBlockIndex !== -1) {
        // The story is everything before the last choice block
        const storyLines = lines.slice(0, lastChoiceBlockIndex);
        story = storyLines.join('\n').trim();

        // The choices are everything from the block onwards
        const choiceLines = lines.slice(lastChoiceBlockIndex);
        
        const groupedChoices = [];
        let currentChoice = null;

        choiceLines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine === '') return; // Ignore empty lines

            if (trimmedLine.match(/^\d+\.\s/)) {
                if (currentChoice) {
                    groupedChoices.push(currentChoice);
                }
                currentChoice = trimmedLine.replace(/^\d+\.\s*/, '');
            } else if (currentChoice) {
                // This line is a continuation of the previous choice
                currentChoice += ` ${trimmedLine}`;
            }
        });

        if (currentChoice) {
            groupedChoices.push(currentChoice);
        }
        
        if (groupedChoices.length > 0) {
            choices = groupedChoices;
        } else {
            // If parsing fails for some reason, revert to the original content as story
            story = storyContent;
            choices = [];
        }
    }
    
    return { story, choices };
  };

  const callGeminiAPI = async (prompt, isInitialCall = false) => {
    const effectiveApiKey = apiMode === 'defaultGemini' ? "" : apiKey;
    if (apiMode === 'userKey' && !effectiveApiKey) {
        setModalMessage({ show: true, title: 'Lỗi API Key', content: 'Vui lòng vào Thiết Lập API.', type: 'error' });
        setIsLoading(false);
        setShowApiModal(true);
        return;
    }
    setIsLoading(true);

    let updatedChatHistory;
    if (isInitialCall) {
        updatedChatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    } else {
        updatedChatHistory = [...chatHistoryForGemini, { role: "user", parts: [{ text: prompt }] }];
    }
    
    const MAX_HISTORY_LENGTH = 20; 
    if (updatedChatHistory.length > MAX_HISTORY_LENGTH) {
        const recentHistory = updatedChatHistory.slice(-MAX_HISTORY_LENGTH);
        updatedChatHistory = recentHistory;
    }
    
    setChatHistoryForGemini(updatedChatHistory);

    const payload = { contents: updatedChatHistory, generationConfig: {} };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${effectiveApiKey}`;

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        
        if (!response.ok) {
            let errorDetails = `Mã lỗi: ${response.status}.`;
             if (response.status === 401 || response.status === 403) {
                errorDetails = "API Key không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra lại trong phần Thiết Lập API.";
             } else {
                try {
                    const errorResult = await response.json();
                    if (errorResult.error && errorResult.error.message) {
                        errorDetails += ` ${errorResult.error.message}`;
                    }
                } catch (e) { /* Ignore if error body is not JSON */ }
            }
            throw new Error(`Lỗi API: ${errorDetails}`);
        }

        const text = await response.text();
        if (!text) {
            throw new Error("API đã trả về một phản hồi trống. Điều này có thể do bộ lọc an toàn của AI đã chặn nội dung. Hãy thử một hành động khác.");
        }

        const result = JSON.parse(text);

        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            const rawText = result.candidates[0].content.parts[0].text;
            const { story, choices: newChoices } = await parseGeminiResponseAndUpdateState(rawText);
            setCurrentStory(story);
            setChoices(newChoices);
            const newStoryEntry = { type: 'story', content: story, id: crypto.randomUUID() };
            setStoryHistory(prev => [...prev, newStoryEntry]);
            setChatHistoryForGemini(prev => [...prev, { role: "model", parts: [{ text: rawText }] }]);
        } else if (result.promptFeedback && result.promptFeedback.blockReason) {
            throw new Error(`Nội dung đã bị chặn bởi bộ lọc an toàn của AI. Lý do: ${result.promptFeedback.blockReason}. Hãy thử một hành động khác.`);
        } else {
            throw new Error("Phản hồi từ AI không hợp lệ hoặc không chứa nội dung.");
        }
    } catch (error) {
        console.error('Error in callGeminiAPI:', error);
        const errorMessage = error.message || "Đã xảy ra lỗi không xác định.";
        setStoryHistory(prev => [...prev, { type: 'system', content: errorMessage, id: crypto.randomUUID() }]);
        setModalMessage({ show: true, title: 'Lỗi', content: errorMessage, type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };


const generateKnowledgeContext = (knowledge) => {
  const joinOrNone = (arr, fn) => arr?.length > 0 ? arr.map(fn).join('\n') : 'Không có.';

  const statusContext = joinOrNone(knowledge.playerStatus, item =>
    `- ${item.name || "Không rõ"} (${item.type}): ${item.description || "Không mô tả."}`
    + (item.duration ? ` Thời gian: ${item.duration}.` : '')
    + (item.effects ? ` Ảnh hưởng: ${item.effects}.` : '')
    + (item.source ? ` Nguồn: ${item.source}.` : '')
  );

  const questContext = joinOrNone(knowledge.quests, quest => {
    const statusText = quest.status === 'completed' ? 'Hoàn thành' : quest.status === 'failed' ? 'Thất bại' : 'Đang làm';
    const objectives = quest.objectives?.length > 0
      ? ` Mục tiêu: ${quest.objectives.map(o => o.completed ? `[X] ${o.text}` : `[ ] ${o.text}`).join(', ')}`
      : '';
    return `- ${quest.title || "Nhiệm vụ không tên"} (${statusText}): ${quest.description || "Không có mô tả."}${objectives}`;
  });

  const inventoryContext = joinOrNone(knowledge.inventory, item =>
    `- ${item.Name || "Vật phẩm không tên"} (${item.Type || "Không rõ loại"}): ${item.Description || "Không có mô tả."}`
    + (item.Equippable ? " Có thể trang bị." : "")
    + (item.Usable ? " Có thể sử dụng." : "")
    + (item.Consumable ? " Tiêu hao." : "")
    + (typeof item.Uses === 'number' ? ` Còn ${item.Uses} lần.` : "")
  );

  const skillContext = joinOrNone(knowledge.playerSkills, skill =>
    `- ${skill.Name || "Kỹ năng không tên"} (${skill.Type || "Chưa rõ"}): ${skill.Description || "Không có mô tả."}`
  );

  const npcContext = joinOrNone(knowledge.npcs, npc => {
    const statusText = npc.statuses?.length > 0
      ? ` Trạng thái: ${npc.statuses.map(s => `${s.name} (${s.type})`).join(', ')}.` : '';
    return `- ${npc.Name || "Không rõ"}${npc.Personality ? ` (Tính cách: ${npc.Personality})` : ''}: ${npc.Description || "Chưa có mô tả."}${statusText}`;
  });

  const companionContext = joinOrNone(knowledge.companions, cpn => {
    const statusText = cpn.statuses?.length > 0
      ? ` Trạng thái: ${cpn.statuses.map(s => `${s.name} (${s.type})`).join(', ')}.` : '';
    return `- ${cpn.Name || "Không rõ"}${cpn.Personality ? ` (Tính cách: ${cpn.Personality})` : ''}: ${cpn.Description || "Chưa có mô tả."}${statusText}`;
  });

  const worldItemsContext = joinOrNone(knowledge.items, item =>
    `- ${item.Name || "Không rõ tên"}: ${item.Description || "Chưa có mô tả."}`
  );

  const locationContext = joinOrNone(knowledge.locations, loc =>
    `- ${loc.Name || "Không rõ tên"}: ${loc.Description || "Chưa có mô tả."}`
  );

  const relationshipContext = Object.entries(knowledge.relationships || {})
    .map(([npcName, emotions]) => {
        const emotionStrings = emotions.map(e => `${e.emotion}: ${e.level}${e.reason ? ` (${e.reason})` : ''}`).join(', ');
        return `- ${npcName}: ${emotionStrings}`;
    })
    .join('\n') || 'Chưa có mối quan hệ nào được thiết lập.';

  return [
    "---Trạng Thái Nhân Vật---\n" + statusContext,
    "---Tiến Độ Nhiệm Vụ---\n" + questContext,
    "---NPC Đã Gặp---\n" + npcContext,
    "---Mối Quan Hệ Với NPC---\n" + relationshipContext,
    "---Đồng Hành---\n" + companionContext,
    "---Vật Phẩm Trong Balo---\n" + inventoryContext,
    "---Kỹ Năng---\n" + skillContext,
    "---Vật Phẩm Thế Giới---\n" + worldItemsContext,
    "---Địa Điểm Đã Khám Phá---\n" + locationContext
  ].join('\n\n');
};

const SYSTEM_RULES = `
---HỆ THỐNG NỘI TÂM ẨN & TÌNH CẢM PHỨC TẠP (CỰC KỲ QUAN TRỌNG)---
Khi cập nhật tình cảm của một NPC bằng thẻ [RELATIONSHIP_SET], ngươi TUYỆT ĐỐI KHÔNG được phản ứng một cách máy móc. Thay vào đó, ngươi BẮT BUỘC phải thực hiện một 'bước suy nghĩ nội tâm' dựa trên 5 lăng kính sau:
1.  Lăng kính "Tính cách Cốt lõi": Hành động của người chơi được diễn giải như thế nào qua bản chất của NPC (ví dụ: 'Đa nghi', 'Thực dụng', 'Nhân hậu', 'Thù dai')? Đây là bộ lọc quan trọng nhất. Một NPC 'Đa nghi' sẽ không dễ dàng tin tưởng chỉ sau một hành động tốt.
2.  Lăng kính "Mục tiêu & Động cơ Cá nhân": Hành động này giúp ích hay cản trở mục tiêu/động cơ riêng của NPC (ví dụ: trả thù, bảo vệ gia tộc, tìm kiếm quyền lực, sinh tồn)? Hãy suy luận một mục tiêu hợp lý cho các NPC quan trọng nếu chưa có. Hành động của người chơi sẽ được đánh giá dựa trên việc nó có phù hợp với mục tiêu xuất phát từ thân phận, gia đình, hoàn cảnh của họ hay không.
3.  Lăng kính "Lịch sử Tương tác": Hành động này có nhất quán với các hành động trước đây của người chơi không (dựa vào 'Ký Ức Gần Đây')? Một hành động tốt sau nhiều lần lừa dối sẽ bị coi là giả tạo và làm tăng sự nghi ngờ.
4.  Lăng kính "Bối cảnh & Hoàn cảnh": Hành động này có phù hợp với tình huống hiện tại không (ví dụ: chiến đấu, yên bình, nguy cấp)? Tặng quà lúc nước sôi lửa bỏng sẽ bị coi là hành động thiếu suy nghĩ.
5.  Lăng kính "Mối quan hệ Xã hội": Hành động của người chơi đối với các đồng minh hoặc kẻ thù của NPC ảnh hưởng như thế nào? Giúp đỡ kẻ thù của NPC sẽ khiến họ coi bạn là mối đe dọa.
QUAN TRỌNG: Toàn bộ quá trình phân tích 5 lăng kính này là SUY NGHĨ NỘI TÂM của ngươi. TUYỆT ĐỐI KHÔNG được viết quá trình này ra trong phần kể chuyện. Chỉ thể hiện kết quả của nó thông qua hành động, lời thoại và cảm xúc của NPC.

---HỆ THỐNG NPC CHỦ ĐỘNG & GIAI ĐOẠN HÀNH ĐỘNG (NÂNG CẤP CỐT LÕI v3.3)---
24. HAI GIAI ĐOẠN CỦA MỘT LƯỢT ĐI: Sau mỗi hành động của người chơi, lượt đi của ngươi được chia thành HAI giai đoạn RÕ RÀNG:
    - **Giai đoạn 1: Phản ứng & Kết quả.** Đầu tiên, hãy mô tả kết quả trực tiếp và ngay lập tức của hành động của người chơi. Đây là phần bị động, là hệ quả tất yếu.
    - **Giai đoạn 2: Hành động của NPC/Thế giới.** SAU KHI mô tả xong kết quả, ngươi BẮT BUỘC phải dừng lại và tự hỏi: "Dựa trên tình hình hiện tại, có NPC nào hoặc thế lực nào sẽ hành động ngay bây giờ không?". Hãy sử dụng các "cú hích" (tình cảm, mục tiêu, bối cảnh, tính cách NPC) để quyết định. Đây là phần CHỦ ĐỘNG. Nếu có hành động, hãy mô tả nó một cách chi tiết. Nếu một sự kiện lớn xảy ra không trực tiếp do NPC, hãy dùng thẻ [WORLD_EVENT: "Mô tả ngắn gọn"].
25. QUY TẮC CẤM TUYỆT ĐỐI: TUYỆT ĐỐI KHÔNG được để người chơi quyết định hành động thay cho NPC. Ví dụ, không được tạo lựa chọn như 'Lão Trương sẽ làm gì tiếp theo?' hoặc 'Hỏi xem Lão Trương có đồng ý không?'. Lão Trương PHẢI tự hành động hoặc bộc lộ thái độ (đồng ý/từ chối) trong Giai đoạn 2 dựa trên tính cách và mục tiêu của mình.
26. BƯỚC CUỐI CÙNG: Chỉ sau khi hoàn thành cả hai giai đoạn, ngươi mới tạo ra các lựa chọn MỚI cho người chơi để họ phản ứng với toàn bộ tình hình vừa diễn ra.

---HỆ THỐNG TRẠNG THÁI, NHIỆM VỤ, TỶ LỆ THÀNH CÔNG và CÁC THẺ (QUAN TRỌNG VÀ BẮT BUỘC)---
    1.  Sau khi kể chuyện, hãy tạo ra một ký ức CHI TIẾT về sự kiện vừa xảy ra bằng thẻ [MEMORY_ADD: "Nội dung ký ức..."]. Ký ức này phải tóm tắt: hành động của người chơi, kết quả chính, các nhân vật hoặc vật phẩm liên quan, và bối cảnh.
    2.  Khi nhân vật (hoặc NPC) nhận một trạng thái mới (buff, debuff, injury), dùng thẻ:
        [STATUS_APPLIED_SELF: name="Tên Trạng Thái", description="Mô tả", type="buff/debuff/injury/neutral", duration="...", effects="...", cureConditions="...", source="..."]
        [STATUS_APPLIED_NPC: NPCName="Tên NPC", name="Tên Trạng Thái", description="...", type="...", duration="...", effects="...", cureConditions="...", source="..."]
    3.  Khi trạng thái của nhân vật chính được chữa khỏi hoặc hết hạn, dùng: [STATUS_CURED_SELF: Name="Tên Trạng Thái"] hoặc [STATUS_EXPIRED_SELF: Name="Tên Trạng Thái"].
    4.  Khi trạng thái của NPC được chữa khỏi hoặc hết hạn, dùng: [STATUS_CURED_NPC: NPCName="Tên NPC", StatusName="Tên Trạng Thái"] hoặc [STATUS_EXPIRED_NPC: NPCName="Tên NPC", StatusName="Tên Trạng Thái"].
    5.  Các trạng thái PHẢI có ảnh hưởng thực tế đến câu chuyện, lựa chọn, hoặc khả năng của nhân vật/NPC.
    6.  Nếu có "Kỹ năng khởi đầu mong muốn", hãy tạo một kỹ năng phù hợp và thông báo bằng thẻ [SKILL_LEARNED: Name, Description, Type]. Nếu không, tự tạo một kỹ năng ban đầu phù hợp.
    7.  Nếu có "Các thực thể ban đầu trong thế giới", hãy tìm cách đưa chúng vào câu chuyện một cách tự nhiên.
    8.  Nếu nhân vật bắt đầu với vật phẩm trong balo, sử dụng thẻ [ITEM_AQUIRED: Name, Description, Type, ...].
    9.  Nếu nhân vật bắt đầu với đồng hành, sử dụng thẻ [COMPANION: Name, Description, Personality, ...].
    10. Khi giới thiệu Vật phẩm (lore), Địa điểm mới, dùng các thẻ [LORE_ITEM: Name, Description, Type] và [LORE_LOCATION: Name, Description].
    10.1. CẬP NHẬT NPC (MỚI & CŨ): Khi giới thiệu một NPC mới QUAN TRỌNG, hoặc khi một NPC quan trọng ĐÃ TỒN TẠI có sự thay đổi LỚN về mô tả, tính cách, vai trò, hãy dùng thẻ [LORE_NPC: Name="Tên NPC", Description="Mô tả MỚI", Personality="Tính cách MỚI"]. Thẻ này sẽ tạo mới hoặc GHI ĐÈ HOÀN TOÀN thông tin cũ. QUAN TRỌNG: Hãy dùng sự phán đoán của ngươi, KHÔNG sử dụng thẻ này cho những thay đổi nhỏ nhặt hoặc cho các nhân vật qua đường không có vai trò.
    11. QUẢN LÝ DANH TÍNH NPC (CỰC KỲ QUAN TRỌNG): Khi một NPC tiết lộ tên thật, hoặc khi ngươi biết được tên thật của một nhân vật chỉ được gọi bằng biệt danh (ví dụ: "Lão già bí ẩn" tiết lộ tên là "Trương Tam Phong"), TUYỆT ĐỐI KHÔNG dùng thẻ [LORE_NPC] để tạo nhân vật mới. Thay vào đó, BẮT BUỘC phải sử dụng thẻ [LORE_UPDATE_NPC] để cập nhật tên và thông tin cho nhân vật đã có.
        - Cú pháp: [LORE_UPDATE_NPC: OldName="Tên cũ/Biệt danh", NewName="Tên thật mới", Description="Mô tả bổ sung (nếu có)", Personality="Tính cách mới (nếu có)"]
        - Ví dụ: [LORE_UPDATE_NPC: OldName="Lão già bí ẩn", NewName="Trương Tam Phong", Description="Lão chính là chưởng môn phái Võ Đang."]
    12. QUY TẮC LIÊN KẾT KÝ ỨC: Khi đọc lại danh sách Ký Ức, ngươi phải nhận thức rằng danh tính của nhân vật có thể đã thay đổi. Lịch sử các thẻ [LORE_UPDATE_NPC] chính là bằng chứng cho sự thay đổi này. Hãy coi các tên cũ (OldName) và tên mới (NewName) được đề cập trong ký ức và trong lịch sử là cùng một thực thể để đảm bảo câu chuyện luôn nhất quán.
    13. QUẢN LÝ TÊN ĐỊA ĐIỂM: Tương tự như NPC, khi một địa điểm được đổi tên hoặc có tên mới (ví dụ: "Ngôi làng hẻo lánh" trở thành "Tân Nguyệt Trấn"), BẮT BUỘC dùng thẻ [LORE_UPDATE_LOCATION: OldName="Tên cũ", NewName="Tên mới", Description="Mô tả mới (nếu có)"].
    14. Khi nhân vật nhận vật phẩm vào balo, dùng [ITEM_AQUIRED: Name, Description, Type, Equippable, Usable, Consumable, Uses].
    15. Khi nhân vật học kỹ năng mới, dùng [SKILL_LEARNED: Name, Description, Type].
    16. Khi vật phẩm được sử dụng và tiêu hao hoàn toàn, dùng thẻ [ITEM_CONSUMED: Name="Tên Vật Phẩm"]. Nếu chỉ giảm số lần dùng, dùng [ITEM_UPDATED: Name="Tên Vật Phẩm", Uses=X (số lần còn lại)].
    17. HỆ THỐNG NHIỆM VỤ: Dùng các thẻ [QUEST_ASSIGNED], [QUEST_UPDATED], [QUEST_OBJECTIVE_COMPLETED] để quản lý nhiệm vụ.
    18. Tạo 4-5 lựa chọn hành động rõ ràng, có ý nghĩa, đa dạng, phản ánh tính cách và mục tiêu của nhân vật.
    19. Với một số lựa chọn có tính rủi ro, hãy mô tả ngắn gọn tỷ lệ thành công ước tính (Cao, Trung Bình, Thấp, Rất Thấp) và hậu quả.
    20. Lời thoại trong ngoặc kép, tên NV đứng trước. Suy nghĩ trong *suy nghĩ* hoặc _suy nghĩ_.
    21. Duy trì độ khó. Nhân vật có thể gặp bất lợi, thất bại nhưng câu chuyện vẫn tiếp diễn.
    22. Các thẻ lệnh phải ở dòng riêng và không nằm ngoài các thẻ lệnh được liệt kê.
    23. YÊU CẦU VỀ ĐỘ DÀI: Hãy viết một đoạn truyện có độ dài hợp lý (ít nhất 2-3 đoạn văn chi tiết), mô tả sâu sắc về môi trường, cảm xúc nhân vật và diễn biến sự kiện.

---QUY TẮC CUỐI CÙNG---
31. QUAN TRỌNG NHẤT: Khối lựa chọn (bắt đầu bằng 1., 2., ...) PHẢI LUÔN LÀ NỘI DUNG CUỐI CÙNG trong phản hồi của ngươi. Không được có bất kỳ văn bản, thẻ lệnh, hay thậm chí một dòng trống nào sau lựa chọn cuối cùng.
`;

const constructPrompt = (actionText, currentStoryHistory, isInitial = false) => {
    const nsfwInstruction = gameSettings.allowNsfw ? 'ĐÃ BẬT. Ngươi ĐƯỢC PHÉP và ĐƯỢC KHUYẾN KHÍCH mô tả các cảnh 18+ một cách chi tiết, trần trụi và nghệ thuật.' : 'ĐÃ TẮT. Tránh xa các chủ đề nhạy cảm.';
    const initialWorldElementsString = gameSettings.initialWorldElements.map(el => `- Loại: ${el.type}, Tên: ${el.name}, Mô tả: ${el.description}`).join('\n');
    const lastStoryText = currentStoryHistory.filter(item => item.type === 'story').at(-1)?.content || 'Đây là lượt đi đầu tiên.';

    const CONTEXT_PROMPT = `
Bạn là một Đại Năng kể chuyện, chuyên sáng tác tiểu thuyết mạng Trung Quốc thể loại '${gameSettings.theme}'.
- Phong cách viết và xưng hô: ${gameSettings.narratorPronoun}.
- QUAN TRỌNG: Luôn ghi nhớ và bám sát các sự kiện, nhân vật, địa điểm, nhiệm vụ đã có trong lịch sử trò chuyện.
- Thông tin đầu vào:
  - Chủ đề: ${gameSettings.theme}, Bối cảnh: ${gameSettings.setting}, Độ khó: ${gameSettings.difficulty}
  - Nhân vật: ${gameSettings.characterName}, Giới tính: ${gameSettings.characterGender}, Sơ lược: ${gameSettings.characterBackstory}.
  - CỐT LÕI: Tính cách "${finalPersonality || 'chưa xác định'}" và Mục tiêu "${gameSettings.characterGoal || 'chưa có'}" PHẢI ảnh hưởng mạnh mẽ đến mọi hành động và diễn biến.
  - NSFW: ${nsfwInstruction}.

--- BÁO CÁO TÌNH HÌNH HIỆN TẠI (Dữ liệu để ngươi kể tiếp) ---
${generateKnowledgeContext(knowledgeBase)}

--- LUẬT LỆ VÀ TRI THỨC THẾ GIỚI (PHẢI TUÂN THỦ) ---
${worldKnowledge.filter(r => r.enabled).map(r => `- ${r.content}`).join('\n') || 'Không có.'}

--- KÝ ỨC GẦN ĐÂY (Sự kiện cũ nhất ở trên cùng) ---
${[...memories].sort((a,b) => a.timestamp - b.timestamp).map(m => `- ${m.content.replace(/\n/g, ' ')}`).join('\n') || 'Chưa có.'}

--- DIỄN BIẾN GẦN NHẤT (Chỉ phần truyện kể) ---
${lastStoryText}
    `;

    const ACTION_PROMPT = isInitial ? `
--- YÊU CẦU ---
HÃY BẮT ĐẦU CUỘC PHIÊU LƯU.
- Kỹ năng mong muốn: ${gameSettings.preferredInitialSkill || 'Để AI quyết định'}
- Thực thể ban đầu: ${initialWorldElementsString || 'Không có.'}
- Hãy viết đoạn mở đầu câu chuyện, giới thiệu nhân vật và bối cảnh. Sau đó, áp dụng các thẻ lệnh và tạo các lựa chọn mới theo ĐÚNG quy tắc trong phần HỆ THỐNG bên dưới.
    ` : `
--- YÊU CẦU (HÀNH ĐỘNG CỦA NGƯỜI CHƠI) ---
Dựa vào TOÀN BỘ thông tin trong "BÁO CÁO TÌNH HÌNH HIỆN TẠI", người chơi đã thực hiện hành động sau:
"${actionText}"

--- NHIỆM VỤ CỦA NGƯƠI ---
HÃY KỂ TIẾP câu chuyện một cách hợp lý, xem xét kỹ lưỡng hành động của người chơi. Sau đó, áp dụng các thẻ lệnh và tạo các lựa chọn mới theo ĐÚNG quy tắc trong phần HỆ THỐNG bên dưới.
    `;
    
    return `${CONTEXT_PROMPT}\n\n${ACTION_PROMPT}\n\n${SYSTEM_RULES}`;
};


  const initializeGame = async () => {
    
    if (!gameSettings.theme || !gameSettings.setting || !gameSettings.characterName || !gameSettings.characterBackstory) { setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng điền đủ Chủ đề, Bối cảnh, Tên và Tiểu sử.', type: 'error' }); return; }
    if (gameSettings.characterPersonality === 'Tùy chỉnh...' && !gameSettings.customCharacterPersonality.trim()) {
        setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập tính cách tùy chỉnh của bạn.', type: 'error' });
        return;
    }
    
    const initialPrompt = constructPrompt("Bắt đầu", [], true);
    setCurrentScreen('gameplay');
    
    if (userId && isAuthReady) {
        try {
            const gamesCollectionPath = `artifacts/${appId}/users/${userId}/games`;
            const newGameRef = await addDoc(collection(db, gamesCollectionPath), {
                settings: gameSettings, storyHistory: [], currentStory: "Đang khởi tạo...", currentChoices: [],
                chatHistoryForGemini: [],
                memories: [], worldKnowledge: [],
                knowledgeBase: { npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: {}, playerStatus: [], quests: [] }, 
                createdAt: serverTimestamp(), updatedAt: serverTimestamp(), status: "active" 
            });
            
            setCurrentGameId(newGameRef.id);
            await callGeminiAPI(initialPrompt, true); 
        } catch (error) {
            setModalMessage({ show: true, title: 'Lỗi Tạo Game', content: `Không thể tạo game mới: ${error.message}`, type: 'error' });
            setCurrentScreen('setup'); 
        }
    } else {
         await callGeminiAPI(initialPrompt, true); 
    }
  };

  const handleChoice = (choiceText) => {    
    const userChoiceEntry = { type: 'user_choice', content: choiceText, id: crypto.randomUUID() };
    const newStoryHistory = [...storyHistory, userChoiceEntry];
    setStoryHistory(newStoryHistory);
    setCurrentStory(''); 
    setChoices([]);
    const subsequentPrompt = constructPrompt(choiceText, newStoryHistory);
    callGeminiAPI(subsequentPrompt);
  };

  const handleCustomAction = (actionText) => {
    if (!actionText.trim()) return;
    const customActionEntry = { type: 'user_custom_action', content: actionText, id: crypto.randomUUID() };
    const newStoryHistory = [...storyHistory, customActionEntry];
    setStoryHistory(newStoryHistory);
    setCurrentStory(''); 
    setChoices([]); 
    setCustomActionInput(''); 
    const subsequentPrompt = constructPrompt(actionText, newStoryHistory);
    callGeminiAPI(subsequentPrompt);
  };

  const saveGameProgress = useCallback(async () => {
    if (!userId || !currentGameId || !isAuthReady || storyHistory.length === 0) return;
    setIsSaving(true);
    try {
        const gameDocRef = doc(db, `artifacts/${appId}/users/${userId}/games/${currentGameId}`);
        const historyToSave = storyHistory.filter(item => !item.transient);
        const dataToSave = {
            currentStory, currentChoices: choices, storyHistory: historyToSave,
            chatHistoryForGemini, knowledgeBase, settings: gameSettings, memories, worldKnowledge,
            updatedAt: serverTimestamp(),
        };
        await setDoc(gameDocRef, sanitizeDataForFirestore(dataToSave), { merge: true }); 
    } catch (error) {
        console.error("Error saving game progress:", error);
    } finally {
        setTimeout(() => setIsSaving(false), 1000);
    }
  }, [userId, currentGameId, isAuthReady, storyHistory, currentStory, choices, chatHistoryForGemini, knowledgeBase, gameSettings, memories, worldKnowledge, db, appId]);

  useEffect(() => {
      if (currentScreen === 'gameplay' && storyHistory.length > 0 && currentGameId) {
          saveGameProgress();
      }
  }, [storyHistory, saveGameProgress, currentScreen, currentGameId]);

  const loadGame = async (gameData) => {
    if (!gameData) return;
    const defaultSettings = { theme: '', setting: '', characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', difficulty: 'Thường', difficultyDescription: '', allowNsfw: false, initialWorldElements: [], useCharacterGoal: false, characterGoal: '', allowCustomActionInput: true };
    const defaultKnowledgeBase = { npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: {}, playerStatus: [], quests: [] };
    const loadedSettings = { ...defaultSettings, ...(gameData.settings || {}) };
    let loadedKnowledgeBase = { ...defaultKnowledgeBase, ...(gameData.knowledgeBase || {}) };
    
    for (const key in defaultKnowledgeBase) {
        if (!loadedKnowledgeBase[key]) {
            loadedKnowledgeBase[key] = defaultKnowledgeBase[key];
        }
    }

    if (loadedKnowledgeBase.relationships) {
        let needsConversion = false;
        const firstNpcName = Object.keys(loadedKnowledgeBase.relationships)[0];
        if (firstNpcName) {
            const firstNpcEmotions = loadedKnowledgeBase.relationships[firstNpcName];
            if (Array.isArray(firstNpcEmotions) && firstNpcEmotions.length > 0 && typeof firstNpcEmotions[0].intensity === 'number') {
                needsConversion = true;
            }
        }
        
        if (needsConversion) {
            const convertedRelationships = {};
            Object.entries(loadedKnowledgeBase.relationships).forEach(([npcName, emotions]) => {
                if (Array.isArray(emotions)) {
                    convertedRelationships[npcName] = emotions.map(emo => {
                        const { intensity } = emo;
                        let level = "Trung bình";
                        if (intensity <= 20) level = "Rất thấp / Gần như không còn";
                        else if (intensity <= 40) level = "Thấp";
                        else if (intensity <= 60) level = "Trung bình";
                        else if (intensity <= 80) level = "Cao";
                        else level = "Rất cao / Mãnh liệt";
                        return { emotion: emo.emotion, level: level, reason: emo.reason || 'Từ dữ liệu cũ' };
                    }).filter(Boolean);
                }
            });
            loadedKnowledgeBase.relationships = convertedRelationships;
        }
    }


    const cleanStoryHistory = (gameData.storyHistory || []).filter(item => item && typeof item === 'object' && item.id);
    setGameSettings(loadedSettings);
    setKnowledgeBase(loadedKnowledgeBase);
    setMemories(gameData.memories || []);
    setWorldKnowledge(gameData.worldKnowledge || []);
    setCurrentStory(gameData.currentStory || "");
    setChoices(gameData.currentChoices || []);
    setStoryHistory(cleanStoryHistory);
    setChatHistoryForGemini(gameData.chatHistoryForGemini || []);
    setCurrentGameId(gameData.id || null);
    setCurrentScreen('gameplay');
    setShowLoadGameModal(false);
  };
  const handleSaveGameToFile = () => {
    if (storyHistory.length === 0) {
        setModalMessage({ show: true, title: 'Không Thể Lưu', content: 'Không có gì để lưu. Hãy bắt đầu cuộc phiêu lưu trước.', type: 'info' });
        return;
    }
    const gameState = {
        settings: gameSettings, storyHistory, currentStory, currentChoices: choices,
        chatHistoryForGemini, knowledgeBase, memories, worldKnowledge,
        savedAt: new Date().toISOString(), version: "3.4.1"
    };
    const jsonString = JSON.stringify(gameState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${(gameSettings.theme || 'phieu-luu').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setModalMessage({ show: true, title: 'Đã Lưu', content: `Game đã được lưu vào tệp "${fileName}".`, type: 'success' });
  };

  const handleLoadGameFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const gameData = JSON.parse(text);
            if (!gameData.settings || !gameData.storyHistory) throw new Error("Tệp lưu không hợp lệ hoặc bị hỏng.");
            loadGame({ ...gameData, id: null });
            setModalMessage({ show: true, title: 'Tải Thành Công', content: `Đã tải game từ tệp "${file.name}".`, type: 'success' });
        } catch (error) {
            console.error("Error loading game from file:", error);
            setModalMessage({ show: true, title: 'Lỗi Tải Game', content: `Không thể tải game từ tệp: ${error.message}`, type: 'error' });
        } finally {
            event.target.value = null;
        }
    };
    reader.onerror = () => setModalMessage({ show: true, title: 'Lỗi Đọc Tệp', content: 'Không thể đọc tệp đã chọn.', type: 'error' });
    reader.readAsText(file);
  };

  const handleSaveSetupToFile = () => {
    const jsonString = JSON.stringify(gameSettings, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai_simulator_setup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setModalMessage({ show: true, title: "Đã Lưu", content: `Thiết lập thế giới đã được lưu vào tệp.`, type: "success" });
  };

  const handleLoadSetupFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedSettings = JSON.parse(e.target.result);
        if (typeof loadedSettings.theme !== 'string' || typeof loadedSettings.characterName !== 'string') {
          throw new Error("Tệp thiết lập không hợp lệ.");
        }
        setGameSettings(prev => ({ ...prev, ...loadedSettings }));
        setModalMessage({ show: true, title: "Tải Thành Công", content: `Đã tải thiết lập từ tệp "${file.name}".`, type: "success" });
      } catch (error) {
        setModalMessage({ show: true, title: "Lỗi Tải Thiết Lập", content: `Không thể tải: ${error.message}`, type: "error" });
      } finally {
        event.target.value = null;
      }
    };
    reader.readAsText(file);
  };

  const handleSaveKnowledgeToFile = () => {
    if (worldKnowledge.length === 0) {
      setModalMessage({ show: true, title: "Không có gì để lưu", content: "Chưa có tri thức nào được thêm.", type: "info" });
      return;
    }
    const jsonString = JSON.stringify(worldKnowledge, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai_simulator_knowledge_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setModalMessage({ show: true, title: "Đã Lưu", content: `Tri thức thế giới đã được lưu vào tệp.`, type: "success" });
  };

  const handleLoadKnowledgeFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedKnowledge = JSON.parse(e.target.result);
        if (!Array.isArray(loadedKnowledge) || (loadedKnowledge.length > 0 && (typeof loadedKnowledge[0].content !== 'string' || typeof loadedKnowledge[0].enabled !== 'boolean'))) {
          throw new Error("Tệp tri thức không hợp lệ.");
        }
        const knowledgeWithIds = loadedKnowledge.map(rule => ({ ...rule, id: rule.id || crypto.randomUUID() }));
        setWorldKnowledge(knowledgeWithIds);
        setModalMessage({ show: true, title: "Tải Thành Công", content: `Đã tải tri thức từ tệp "${file.name}".`, type: "success" });
      } catch (error) {
        setModalMessage({ show: true, title: "Lỗi Tải Tri Thức", content: `Không thể tải: ${error.message}`, type: "error" });
      } finally {
        event.target.value = null;
      }
    };
    reader.readAsText(file);
  };

  const handleStartNewGame = () => {
    setCurrentStory('');
    setChoices([]);
    setStoryHistory([]);
    setChatHistoryForGemini([]);
    setKnowledgeBase({ 
      npcs: [], items: [], locations: [], companions: [], 
      inventory: [], playerSkills: [], relationships: {},
      playerStatus: [], quests: [],
    });
    setMemories([]);
    setWorldKnowledge([]);
    setCustomActionInput('');
    setCurrentGameId(null);
    setGameSettings({
      theme: '', setting: '', narratorPronoun: 'Để AI quyết định', 
      characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], customCharacterPersonality: '',
      characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', 
      difficulty: 'Thường', difficultyDescription: '', allowNsfw: false, 
      initialWorldElements: [], useCharacterGoal: false, characterGoal: '',   
      allowCustomActionInput: true, 
    });
    setCurrentScreen('setup');
  };

  const removePlayerStatusById = (statusId, statusName) => {
    setKnowledgeBase(prev => ({
        ...prev,
        playerStatus: prev.playerStatus.filter(s => s.id !== statusId)
    }));
    setStoryHistory(prev => [...prev, { 
        type: 'system', 
        content: `Trạng thái "${statusName}" đã được xóa thủ công.`, 
        id: crypto.randomUUID() 
    }]);
  };

  const handleRemoveStatus = (status) => {
    if (!status || !status.id) return;
    setConfirmationModal({
        show: true,
        title: 'Xác Nhận Xóa Trạng Thái',
        content: `Bạn có chắc chắn muốn xóa trạng thái "${status.name}" không? Hành động này có thể ảnh hưởng đến diễn biến câu chuyện.`,
        onConfirm: () => removePlayerStatusById(status.id, status.name),
        confirmText: "Xóa Trạng Thái",
        cancelText: "Hủy"
    });
  };

  const removeRelationship = (npcName, emotionToRemove) => {
    setKnowledgeBase(prev => {
        const newRelationships = { ...prev.relationships };
        if (newRelationships[npcName]) {
            newRelationships[npcName] = newRelationships[npcName].filter(
                emo => !(emo.emotion === emotionToRemove.emotion && emo.level === emotionToRemove.level)
            );
            if (newRelationships[npcName].length === 0) {
                delete newRelationships[npcName];
            }
        }
        return { ...prev, relationships: newRelationships };
    });

    setStoryHistory(prev => [...prev, {
        type: 'system',
        content: `Tình cảm "${emotionToRemove.emotion}: ${emotionToRemove.level}" với ${npcName} đã được xóa thủ công.`,
        id: crypto.randomUUID()
    }]);
  };

  const handleRemoveRelationship = (npcName, emotion) => {
      if (!npcName || !emotion) return;
      setConfirmationModal({
          show: true,
          title: 'Xác Nhận Xóa Tình Cảm',
          content: `Bạn có chắc chắn muốn xóa tình cảm "${emotion.emotion}: ${emotion.level}" với ${npcName} không? AI sẽ không còn ghi nhớ tình cảm này.`,
          onConfirm: () => removeRelationship(npcName, emotion),
          confirmText: "Xóa Tình Cảm",
          cancelText: "Hủy"
      });
  };

  const restartGame = () => {
    setConfirmationModal({
        show: true, title: 'Bắt Đầu Lại?', content: 'Lưu tiến trình hiện tại trước khi bắt đầu lại?',
        onConfirm: async () => { 
            if (currentGameId) await saveGameProgress();
            handleStartNewGame();
        },
        onCancel: () => handleStartNewGame(),
        confirmText: 'Lưu và Bắt đầu lại', cancelText: 'Bắt đầu lại (Không lưu)'
    });
  };

  const goHome = () => {
    if (currentScreen === 'gameplay' && storyHistory.length > 0) { 
         setConfirmationModal({
            show: true, title: 'Về Trang Chủ?', content: 'Lưu tiến trình game trước khi về trang chủ?',
            onConfirm: async () => {
                if (currentGameId) await saveGameProgress();
                setCurrentScreen('initial');
            },
            onCancel: () => setCurrentScreen('initial'),
            confirmText: 'Lưu và Về Home', cancelText: 'Về Home (Không lưu)'
        });
    } else setCurrentScreen('initial');
  };

  const formatStoryText = useCallback((text) => {
    if (!text) return null;
    const processLine = (lineContent) => {
        let segments = [{ type: 'text', content: lineContent }];
        const allLoreEntries = [];
        if (knowledgeBase) {
            const allLoreCategories = ['companions', 'npcs', 'items', 'locations', 'inventory', 'playerSkills', 'playerStatus', 'quests'];
            allLoreCategories.forEach(category => {
                (knowledgeBase[category] || []).forEach(loreItem => {
                    const itemName = loreItem.Name || loreItem.name || loreItem.title; 
                    if (itemName && itemName.trim() !== "") allLoreEntries.push({ name: itemName.trim(), category, originalItem: loreItem });
                });
            });
        }
        allLoreEntries.sort((a, b) => b.name.length - a.name.length);

        allLoreEntries.forEach(entry => {
            const { name: loreName, category, originalItem } = entry;
            const newSegments = [];
            segments.forEach(segment => {
                if (segment.type === 'text') {
                    const regex = new RegExp(`(\\b${loreName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'gi');
                    const parts = segment.content.split(regex);
                    for (let i = 0; i < parts.length; i++) {
                        if (parts[i].toLowerCase() === loreName.toLowerCase()) newSegments.push({ type: 'lore', text: parts[i], category, originalItem });
                        else if (parts[i] !== "") newSegments.push({ type: 'text', content: parts[i] });
                    }
                } else newSegments.push(segment);
            });
            segments = newSegments;
        });
        
        return segments.map((segment, index) => {
            if (segment.type === 'text') {
                let formattedSegment = segment.content;
                formattedSegment = formattedSegment.replace(/^([\w\s\u00C0-\u017F]+):\s*"(.*?)"/gm, `<strong class="text-blue-400">$1:</strong> "$2"`);
                formattedSegment = formattedSegment.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>'); 
                formattedSegment = formattedSegment.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>'); 
                formattedSegment = formattedSegment.replace(/\[(?!PLAYER_PERSONALITY|LORE_|COMPANION|ITEM_AQUIRED|SKILL_LEARNED|RELATIONSHIP_SET|ITEM_CONSUMED|ITEM_UPDATED|STATUS_APPLIED_SELF|STATUS_CURED_SELF|STATUS_EXPIRED_SELF|STATUS_APPLIED_NPC|STATUS_CURED_NPC|STATUS_EXPIRED_NPC|QUEST_ASSIGNED|QUEST_UPDATED|QUEST_OBJECTIVE_COMPLETED|WORLD_EVENT)(.*?)\]/g, '<span class="text-yellow-400 font-semibold">[$1]</span>'); 
                formattedSegment = formattedSegment.replace(/\*\*(.*?)\*\*/g, '<strong class="text-xl block my-2 text-green-400">$1</strong>');
                return <span key={`segment-${index}`} dangerouslySetInnerHTML={{ __html: formattedSegment }} />;
            } else if (segment.type === 'lore') {
                return <span key={`lore-${segment.originalItem.id}-${index}`} className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold" onClick={(e) => { e.stopPropagation(); openQuickLoreModal(segment.originalItem, segment.category); }}>{segment.text}</span>;
            }
            return null; 
        });
    };
    return text.split(/\n\s*\n/).map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className="mb-3 leading-relaxed">
            {paragraph.split('\n').map((line, lineIndex) => (
                <React.Fragment key={`line-${lineIndex}`}>
                    {processLine(line)}
                    {lineIndex < paragraph.split('\n').length - 1 && <br />} 
                </React.Fragment>
            ))}
        </p>
    ));
  }, [knowledgeBase, openQuickLoreModal]); 

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-2xl animate-pulse">Đang tải và xác thực...</div>
      </div>
    );
  }
  
  return (
    <div className="font-['Arial',_sans-serif] text-white">
      {currentScreen === 'initial' && <InitialScreen onStartNewGame={handleStartNewGame} setShowLoadGameModal={setShowLoadGameModal} savedGames={savedGames} apiKeyStatus={apiKeyStatus} userId={userId} setInputApiKey={setInputApiKey} apiKey={apiKey} setShowApiModal={setShowApiModal} apiMode={apiMode} setShowUpdateLogModal={setShowUpdateLogModal} handleLoadGameFromFile={handleLoadGameFromFile} />}
      {currentScreen === 'setup' && <GameSetupScreen goHome={goHome} gameSettings={gameSettings} handleInputChange={handleInputChange} initializeGame={initializeGame} isLoading={isLoading} apiKey={apiKey} setInputApiKey={setInputApiKey} setShowApiModal={setShowApiModal} handleFetchSuggestions={handleFetchSuggestions} isFetchingSuggestions={isFetchingSuggestions} handleGenerateBackstory={handleGenerateBackstory} isGeneratingContent={isGeneratingContent} apiMode={apiMode} handleGenerateDifficultyDescription={handleGenerateDifficultyDescription} isGeneratingDifficultyDesc={isGeneratingDifficultyDesc} addInitialWorldElement={addInitialWorldElement} removeInitialWorldElement={removeInitialWorldElement} handleInitialElementChange={handleInitialElementChange} handleGenerateInitialElementDescription={handleGenerateInitialElementDescription} isGeneratingInitialElementDesc={isGeneratingInitialElementDesc} handleGenerateGoal={handleGenerateGoal} isGeneratingGoal={isGeneratingGoal} handleGenerateCharacterName={handleGenerateCharacterName} isGeneratingCharacterName={isGeneratingCharacterName} handleGenerateInitialSkill={handleGenerateInitialSkill} isGeneratingInitialSkill={isGeneratingInitialSkill} handleSaveSetupToFile={handleSaveSetupToFile} handleLoadSetupFromFile={handleLoadSetupFromFile} />}
      {currentScreen === 'gameplay' && <GameplayScreen goHome={goHome} gameSettings={gameSettings} restartGame={restartGame} storyHistory={storyHistory} isLoading={isLoading} currentStory={currentStory} choices={choices} handleChoice={handleChoice} formatStoryText={formatStoryText} customActionInput={customActionInput} setCustomActionInput={setCustomActionInput} handleCustomAction={handleCustomAction} knowledgeBase={knowledgeBase} setShowCharacterInfoModal={setShowCharacterInfoModal} handleGenerateSuggestedActions={handleGenerateSuggestedActions} isGeneratingSuggestedActions={isGeneratingSuggestedActions} isSaving={isSaving} setShowMemoryModal={setShowMemoryModal} setShowWorldKnowledgeModal={setShowWorldKnowledgeModal} finalPersonality={finalPersonality} handleSaveGameToFile={handleSaveGameToFile} handleRemoveStatus={handleRemoveStatus} />}
      {showApiModal && <ApiSetupModal inputApiKey={inputApiKey} setInputApiKey={setInputApiKey} apiKeyStatus={apiKeyStatus} saveApiKey={saveApiKey} testApiKey={testApiKey} isLoading={isLoading} setShowApiModal={setShowApiModal} apiKey={apiKey} setApiKeyStatus={setApiKeyStatus} apiMode={apiMode} setModalMessage={setModalMessage} />}
      {showUpdateLogModal && <UpdateLogModal show={showUpdateLogModal} onClose={() => setShowUpdateLogModal(false)} changelog={changelogData} />}
      {showLoadGameModal && <LoadGameModal savedGames={savedGames} loadGame={loadGame} setShowLoadGameModal={setShowLoadGameModal} setConfirmationModal={setConfirmationModal} userId={userId} setModalMessage={setModalMessage} />}
      {showCharacterInfoModal && <CharacterInfoModal knowledge={knowledgeBase} worldKnowledge={worldKnowledge} show={showCharacterInfoModal} onClose={() => setShowCharacterInfoModal(false)} characterName={gameSettings.characterName} finalPersonality={finalPersonality} handleRemoveStatus={handleRemoveStatus} handleRemoveRelationship={handleRemoveRelationship} />}
      {showQuickLoreModal && <QuickLoreModal loreItem={quickLoreContent} show={showQuickLoreModal} onClose={() => setShowQuickLoreModal(false)} />}
      {showMemoryModal && <MemoryModal show={showMemoryModal} onClose={() => setShowMemoryModal(false)} memories={memories} togglePinMemory={togglePinMemory} clearAllMemories={clearAllMemories} />}
      {showWorldKnowledgeModal && <WorldKnowledgeModal show={showWorldKnowledgeModal} onClose={() => setShowWorldKnowledgeModal(false)} worldKnowledge={worldKnowledge} addRule={addWorldKnowledge} updateRule={updateWorldKnowledge} toggleRule={toggleWorldKnowledge} deleteRule={deleteWorldKnowledge} handleSaveKnowledgeToFile={handleSaveKnowledgeToFile} handleLoadKnowledgeFromFile={handleLoadKnowledgeFromFile} />}
      <SuggestionsModal show={showSuggestionsModal.show} title={showSuggestionsModal.title || "✨ Gợi Ý"} suggestions={showSuggestionsModal.suggestions} isLoading={showSuggestionsModal.isLoading} onSelect={(suggestion) => { if (showSuggestionsModal.fieldType) setGameSettings(prev => ({ ...prev, [showSuggestionsModal.fieldType]: suggestion })); }} onClose={() => setShowSuggestionsModal({ show: false, fieldType: null, suggestions: [], isLoading: false, title: '' })} />
      <SuggestedActionsModal show={showSuggestedActionsModal} suggestions={suggestedActionsList} isLoading={isGeneratingSuggestedActions} onSelect={(action) => { setCustomActionInput(action); setShowSuggestedActionsModal(false); }} onClose={() => setShowSuggestedActionsModal(false)} />
      <MessageModal show={modalMessage.show} title={modalMessage.title} content={modalMessage.content} type={modalMessage.type} onClose={() => setModalMessage({ show: false, title: '', content: '', type: 'info' })} />
      <ConfirmationModal show={confirmationModal.show} title={confirmationModal.title} content={confirmationModal.content} onConfirm={confirmationModal.onConfirm} onCancel={confirmationModal.onCancel} confirmText={confirmationModal.confirmText} cancelText={confirmationModal.cancelText} setConfirmationModal={setConfirmationModal} />
    </div>
  );
};

export default App;
