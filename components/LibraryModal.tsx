
import React, { useState } from 'react';
import { searchCultivationKnowledge } from '../services/geminiService';

interface LibraryModalProps {
    onClose: () => void;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<{ text: string, sources?: {uri: string, title: string}[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse(null);
        try {
            const result = await searchCultivationKnowledge(query);
            setResponse(result);
        } catch (error) {
            console.error("Search error:", error);
            setResponse({ text: "Lỗi kết nối với Tàng Thư Các." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl z-10">&times;</button>
                
                <header className="p-6 border-b border-gray-800 text-center">
                    <h2 className="text-3xl font-bold text-cyan-400 mb-2">📖 Tàng Thư Các</h2>
                    <p className="text-gray-400 text-sm">Tra cứu điển tích, truyền thuyết và kiến thức tu tiên.</p>
                </header>

                <div className="p-6 flex-grow overflow-y-auto">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Hỏi về: Nguyên Anh, Tứ Đại Thần Thú, ..."
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !query.trim()}
                            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
                        >
                            {isLoading ? '...' : 'Tra Cứu'}
                        </button>
                    </form>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-8 text-cyan-300">
                            <svg className="animate-spin h-8 w-8 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Đang tra cứu cổ thư...</span>
                        </div>
                    )}

                    {response && (
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 animate-fade-in">
                            <div className="prose prose-invert prose-sm max-w-none text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {response.text}
                            </div>
                            
                            {response.sources && response.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Nguồn Tham Khảo:</h4>
                                    <ul className="space-y-1">
                                        {response.sources.map((source, idx) => (
                                            <li key={idx}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1">
                                                    🔗 {source.title || source.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryModal;
