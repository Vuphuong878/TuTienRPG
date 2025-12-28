import React from 'react';
import { CHANGELOG_DATA, ChangelogEntry } from '../data/changelogData';

interface ChangelogModalProps {
    onClose: () => void;
}

const ChangeTypeBadge: React.FC<{ type: ChangelogEntry['changes'][0]['type'] }> = ({ type }) => {
    const typeMap = {
        new: { label: 'Mới', color: 'w-20 text-center bg-green-900 text-green-300' },
        update: { label: 'Cập nhật', color: 'w-20 text-center bg-blue-900 text-blue-300' },
        fix: { label: 'Sửa lỗi', color: 'w-20 text-center bg-yellow-800 text-yellow-200' },
        balance: { label: 'Cân bằng', color: 'w-20 text-center bg-purple-900 text-purple-300' },
    };
    const { label, color } = typeMap[type];
    return <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-md ${color}`}>{label}</span>;
};


const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-base)] rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-white relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10">&times;</button>
                <h2 className="text-3xl font-bold text-center text-[var(--color-accent-light)] mb-6 flex-shrink-0">Lịch Sử Cập Nhật</h2>
                
                <div className="flex-grow overflow-y-auto pr-4 space-y-8">
                    {CHANGELOG_DATA.map(entry => (
                        <div key={entry.version}>
                            <div className="flex items-baseline gap-3 mb-3 pb-2 border-b border-[var(--color-border-base)]">
                                <h3 className="text-2xl font-semibold text-[var(--color-accent)]">{entry.version}</h3>
                                <span className="text-sm text-[var(--color-text-dark)]">{entry.date}</span>
                            </div>
                            <ul className="space-y-3">
                                {entry.changes.map((change, index) => (
                                    <li key={index} className="flex items-start gap-4 text-[var(--color-text-medium)] leading-relaxed">
                                        <ChangeTypeBadge type={change.type} />
                                        <span>{change.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChangelogModal;