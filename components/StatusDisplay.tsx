import React from 'react';
import type { Status } from './types.ts';
import { getIconForStatus, getStatusBorderColor, getStatusTextColor, getStatusFontWeight } from './utils.ts';

export const StatusDisplay: React.FC<{ 
    statuses: Status[];
    onStatusClick: (status: Status) => void;
}> = ({ statuses, onStatusClick }) => {
    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-2 flex-shrink-0 text-slate-800 dark:text-white">Trạng thái hiện tại:</h3>
            <div className="flex-grow overflow-y-auto pr-2">
                 {statuses.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {statuses.map(status => (
                            <button
                                key={status.name}
                                onClick={() => onStatusClick(status)}
                                className={`px-2 py-1 border rounded-md transition-colors duration-200 flex items-center gap-1.5 ${getStatusBorderColor(status)} hover:bg-slate-300/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 ${getStatusBorderColor(status).replace('border-', 'ring-').replace('/50', '')}`}
                            >
                                <span className="w-4 h-4">{getIconForStatus(status)}</span>
                                <span className={`${getStatusTextColor(status)} ${getStatusFontWeight(status)} text-sm`}>
                                    {status.name}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : <p className="text-sm text-slate-600 dark:text-slate-400">Đang trong tình trạng bình thường.</p>}
            </div>
        </div>
    );
};
