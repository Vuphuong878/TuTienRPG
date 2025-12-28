
import React from 'react';
import { InfoIcon } from '../Icons.tsx';

export const GameNotifications: React.FC<{
    notification: string | null;
    showSaveSuccess: boolean;
    showRulesSavedSuccess: boolean;
}> = ({ notification, showSaveSuccess, showRulesSavedSuccess }) => {
    return (
        <>
            {notification && (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-[100] animate-pulse flex items-center gap-2">
                    <InfoIcon className="w-5 h-5" />
                    {notification}
                </div>
            )}
            {showSaveSuccess && (
                <div className="absolute top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
                    Lưu trữ thành công!
                </div>
            )}
            {showRulesSavedSuccess && (
                <div className="absolute top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
                    Lưu luật lệ thành công! Sẽ có hiệu lực ở lượt sau.
                </div>
            )}
        </>
    );
};
