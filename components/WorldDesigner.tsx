import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { generateWorldDesignerContent, summarizeDesignedWorld } from '../services/geminiService';
import { Type } from '@google/genai';
import { FactionType } from '../types';

const WorldDesigner = () => {
    const { handleBackToMenu, handleDesignWorldComplete } = useGame();

    const genres = [
        "Tiên Hiệp", "Huyền Huyễn", "Đô Thị", "Khoa Huyễn", 
        "Lịch Sử", "Võng Du", "Mạt Thế", "Linh Dị"
    ];

    const [mode, setMode] = useState<'create' | 'analyze'>('analyze');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [storyTitle, setStoryTitle] = useState('thôn phệ tinh không');
    const [authorName, setAuthorName] = useState('Ngã Dục Tây Hồng Cật');
    
    const [analysisResults, setAnalysisResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    const comprehensiveWorldSchema = {
        type: Type.OBJECT,
        properties: {
            worldName: { type: Type.STRING, description: "Tên của thế giới." },
            worldLore: { type: Type.STRING, description: "Mô tả tổng quan, lịch sử, và không khí chung của thế giới (3-5 đoạn văn)." },
            mainConflict: { type: Type.STRING, description: "Mô tả xung đột chính hoặc mối đe dọa lớn nhất trong thế giới." },
            majorFactions: {
                type: Type.ARRAY,
                description: "3-5 phe phái chính, bao gồm tên, mô tả và loại.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING, enum: Object.values(FactionType) }
                    },
                    required: ["name", "description", "type"]
                }
            },
            uniqueRaces: {
                type: Type.ARRAY,
                description: "2-3 chủng tộc độc đáo và quan trọng nhất trong thế giới, bao gồm tên và mô tả ngắn.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                }
            },
            magicSystem: { type: Type.STRING, description: "Mô tả ngắn gọn về hệ thống tu luyện/phép thuật." }
        },
        required: ["worldName", "worldLore", "mainConflict", "majorFactions", "uniqueRaces", "magicSystem"]
    };

    const startProcess = async () => {
        if (mode === 'create' && !selectedGenre) return;
        if (mode === 'analyze' && (!storyTitle || !authorName)) return;

        setIsLoading(true);
        setError('');
        setAnalysisResults(null);

        const basePrompt = mode === 'create'
            ? `Dựa trên các đặc điểm chung, phổ biến và sáng tạo nhất của thể loại truyện '${selectedGenre}', hãy thiết kế một thế giới hoàn chỉnh.`
            : `Trong bối cảnh thế giới của truyện "${storyTitle}" của tác giả "${authorName}", hãy phân tích và tổng hợp các thông tin cốt lõi.`;
        
        const noIntroRule = mode === 'create' 
            ? `KHÔNG giới thiệu về thể loại. Đi thẳng vào việc tạo ra nội dung.`
            : `KHÔNG giới thiệu về tác phẩm, KHÔNG nhắc đến bất kỳ nhân vật chính nào.`;

        const prompt = `${basePrompt} ${noIntroRule} Trả về một đối tượng JSON duy nhất chứa đầy đủ các thông tin sau: worldName, worldLore, mainConflict, majorFactions, uniqueRaces, và magicSystem.`;

        try {
            const result = await generateWorldDesignerContent(prompt, true, comprehensiveWorldSchema);
            setAnalysisResults(result);
        } catch (e: any) {
            console.error(`Error processing world design:`, e);
            let errorMessage = e.message || 'Lỗi không xác định';
            
            // Clean up raw JSON errors from API
            if (errorMessage.includes('{') && errorMessage.includes('error')) {
                try {
                    const match = errorMessage.match(/\{.*\}/s);
                    if (match) {
                        const errorObj = JSON.parse(match[0]);
                        if (errorObj.error && errorObj.error.message) {
                            errorMessage = errorObj.error.message;
                        }
                    }
                } catch (jsonError) {
                    // Ignore parsing error
                }
            }

            if (errorMessage.includes('API key not valid')) {
                errorMessage = "API Key không hợp lệ hoặc bị thiếu. Vui lòng kiểm tra cấu hình hoặc nhập Key trong phần Cài Đặt.";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseWorld = async () => {
        if (!analysisResults) return;
        setIsSummarizing(true);
        try {
            const subject = mode === 'create' ? selectedGenre : storyTitle;
            const summary = await summarizeDesignedWorld(analysisResults, mode, subject);
            const storyInfo = mode === 'analyze' ? { title: storyTitle, author: authorName } : undefined;
            handleDesignWorldComplete(analysisResults, summary, storyInfo);
        } catch (e: any) {
             alert(`Không thể tóm tắt thế giới: ${e.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    const renderResults = () => {
        if (!analysisResults) return null;

        const getFactionTypeColor = (type: FactionType) => {
            switch (type) {
                case FactionType.CHINH_PHAI: return 'text-cyan-300 bg-cyan-900/50 border-cyan-500/50';
                case FactionType.MA_DAO: return 'text-red-300 bg-red-900/50 border-red-500/50';
                case FactionType.TRUNG_LAP: return 'text-yellow-300 bg-yellow-900/50 border-yellow-500/50';
                default: return 'text-gray-300 bg-gray-700 border-gray-600';
            }
        };

        return (
            <div className="bg-gray-700 p-6 rounded-xl shadow-inner border border-gray-600 mt-8 space-y-8 animate-fade-in">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2 text-center">
                    {analysisResults.worldName || "Kết Quả Phân Tích"}
                </h2>
                
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-600 shadow-md">
                    <h3 className="text-2xl font-semibold text-purple-300 mb-4">Tổng Quan</h3>
                    <p className="text-gray-200 text-lg whitespace-pre-wrap">{analysisResults.worldLore}</p>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg border border-gray-600 shadow-md">
                    <h3 className="text-2xl font-semibold text-purple-300 mb-4">Xung Đột Chính</h3>
                    <p className="text-gray-200 text-lg whitespace-pre-wrap">{analysisResults.mainConflict}</p>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg border border-gray-600 shadow-md">
                    <h3 className="text-2xl font-semibold text-purple-300 mb-4">Hệ Thống Tu Luyện</h3>
                    <p className="text-gray-200 text-lg whitespace-pre-wrap">{analysisResults.magicSystem}</p>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg border border-gray-600 shadow-md">
                    <h3 className="text-2xl font-semibold text-purple-300 mb-4">Các Chủng Tộc Nổi Bật</h3>
                    <div className="space-y-4">
                        {analysisResults.uniqueRaces?.map((race: any, i: number) => (
                            <div key={i} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                <h4 className="text-xl font-bold text-blue-300 mb-1">{race.name}</h4>
                                <p className="text-gray-300">{race.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg border border-gray-600 shadow-md">
                    <h3 className="text-2xl font-semibold text-purple-300 mb-4">Các Phe Phái Lớn</h3>
                    <div className="space-y-4">
                        {analysisResults.majorFactions?.map((faction: any, i: number) => (
                             <div key={i} className={`p-4 rounded-lg border ${getFactionTypeColor(faction.type)}`}>
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xl font-bold">{faction.name}</h4>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full`}>{faction.type}</span>
                                </div>
                                <p className="text-gray-300 mt-2">{faction.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                 <button onClick={handleUseWorld} disabled={isLoading || isSummarizing} className="w-full mt-8 py-3 px-6 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {isSummarizing ? 'Đang tóm tắt...' : 'Dùng Thế Giới Này'}
                </button>
            </div>
        );
    };

    const isButtonDisabled = mode === 'create' 
        ? !selectedGenre || isLoading
        : (!storyTitle || !authorName || isLoading);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-gray-100 p-4 sm:p-8 flex flex-col items-center">
             <button onClick={handleBackToMenu} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10">&times;</button>
            <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-10 border border-gray-700 max-h-[90vh] overflow-y-auto">
                <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">Sáng Tạo & Phân Tích Thế Giới</h1>
                
                <div className="mb-8 flex border-b border-gray-600">
                    <button onClick={() => setMode('create')} className={`flex-1 py-3 text-lg font-semibold transition-colors ${mode === 'create' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>Sáng Tạo Theo Thể Loại</button>
                    <button onClick={() => setMode('analyze')} className={`flex-1 py-3 text-lg font-semibold transition-colors ${mode === 'analyze' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>Phân Tích Theo Tác Phẩm</button>
                </div>

                <div className="space-y-6 mb-8">
                    {mode === 'create' ? (
                        <div>
                            <label htmlFor="genre-select" className="block text-lg font-medium text-gray-300 mb-2">Chọn Thể Loại:</label>
                            <select id="genre-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500 text-white">
                                <option value="" disabled>-- Vui lòng chọn một thể loại --</option>
                                {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                            </select>
                        </div>
                    ) : (
                        <>
                            <div><label htmlFor="storyTitle" className="block text-lg font-medium text-gray-300 mb-2">Tên Truyện:</label><input type="text" id="storyTitle" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500 text-white" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} placeholder="Ví dụ: Phàm Nhân Tu Tiên" /></div>
                            <div><label htmlFor="authorName" className="block text-lg font-medium text-gray-300 mb-2">Tên Tác Giả:</label><input type="text" id="authorName" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500 text-white" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Ví dụ: Vong Ngữ" /></div>
                        </>
                    )}
                    <button onClick={startProcess} disabled={isButtonDisabled} className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ${isButtonDisabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105'}`}>
                        {isLoading ? (mode === 'create' ? 'Đang sáng tạo...' : 'Đang phân tích...') : (mode === 'create' ? 'Bắt Đầu Sáng Tạo' : 'Bắt Đầu Phân Tích')}
                    </button>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center text-lg text-purple-300 p-8">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>AI đang kiến tạo vũ trụ... Xin chờ trong giây lát.</span>
                    </div>
                )}
                {error && (
                    <div className="bg-red-900/50 text-red-200 p-4 rounded-lg my-6 border border-red-500/50 flex items-start gap-3 animate-fade-in">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold">Đã xảy ra lỗi:</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}
                
                {analysisResults && renderResults()}
            </div>
        </div>
    );
};

export default WorldDesigner;