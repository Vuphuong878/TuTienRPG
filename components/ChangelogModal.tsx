
import React from 'react';
import type { ChangelogEntry } from './types.ts';
import { ChartIcon, CrossIcon } from './Icons.tsx';

const ChangeTag: React.FC<{ type: 'feature' | 'fix' | 'improvement' }> = ({ type }) => {
    const styles = {
        feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        fix: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        improvement: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    const text = {
        feature: 'Tính năng mới',
        fix: 'Sửa lỗi',
        improvement: 'Cải tiến',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[type]}`}>
            {text[type]}
        </span>
    );
};


export const ChangelogModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    changelogData: ChangelogEntry[];
}> = ({ isOpen, onClose, changelogData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-2xl h-full max-h-[85vh] flex flex-col text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ChartIcon className="w-6 h-6 text-green-500" />
                        Lịch Sử Cập Nhật Game
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">
                        <CrossIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-4 md:p-6 flex-grow overflow-y-auto space-y-6">
                    {changelogData.length > 0 ? (
                        changelogData.map(entry => (
                            <div key={entry.version} className="border-l-4 border-green-500/50 pl-4 py-2">
                                <div className="flex justify-between items-baseline mb-2">
                                    <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        Phiên bản {entry.version}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.date}</p>
                                </div>
                                <ul className="space-y-2 list-disc list-inside">
                                    {entry.changes.map((change, index) => (
                                        <li key={index} className="text-slate-700 dark:text-slate-300">
                                            <ChangeTag type={change.type} />
                                            <span className="ml-2">{change.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">Không có thông tin cập nhật nào.</p>
                    )}
                </div>
                 <div className="p-3 bg-slate-50/80 dark:bg-[#1f2238]/80 rounded-b-lg flex justify-end items-center flex-shrink-0">
                     <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm font-semibold transition-colors duration-200">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};
