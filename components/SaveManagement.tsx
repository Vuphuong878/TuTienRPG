import React from 'react';
import { useGame } from '../contexts/GameContext';

const SaveManagement: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { saveSlots: slots, handleSaveGame, handleLoadGame, handleDeleteSave, character } = useGame();
    const canSave = !!character;

    const handleSaveClick = (slotId: number, hasData: boolean) => {
        if (hasData) {
            if (window.confirm('Bạn có muốn ghi đè lên file lưu này không?')) {
                handleSaveGame(slotId);
            }
        } else {
            handleSaveGame(slotId);
        }
    };

    const handleDeleteClick = (slotId: number) => {
        if(window.confirm('Bạn có chắc muốn xóa file lưu này? Hành động này không thể hoàn tác.')) {
            handleDeleteSave(slotId);
        }
    };
    
    const formatDate = (dateString: string) => {
        if (!dateString || dateString === "Không rõ") return dateString;
        try {
            return new Intl.DateTimeFormat('vi-VN', {
                dateStyle: 'short',
                timeStyle: 'medium',
            }).format(new Date(dateString));
        } catch (e) {
            return dateString;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-white relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10">&times;</button>
                <h2 className="text-3xl font-bold text-center text-green-400 mb-6">Quản lý Lưu trữ</h2>

                <div className="space-y-4">
                    {slots.map(slot => {
                        const hasData = !!slot.characterName;
                        return (
                            <div key={slot.slotId} className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all border border-transparent hover:border-green-500/50">
                                <div className="flex-grow mb-3 sm:mb-0">
                                    <h3 className="text-lg font-semibold text-gray-200">Ô Lưu {slot.slotId + 1}</h3>
                                    {hasData ? (
                                        <>
                                            <p className="text-sm text-gray-300">
                                                {slot.characterName} - Lv. {slot.level} ({slot.realm})
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(slot.saveDate)}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">[Trống]</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 self-end sm:self-center">
                                    <button
                                        onClick={() => handleSaveClick(slot.slotId, hasData)}
                                        disabled={!canSave}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => handleLoadGame(slot.slotId)}
                                        disabled={!hasData}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                                    >
                                        Tải
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(slot.slotId)}
                                        disabled={!hasData}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SaveManagement;