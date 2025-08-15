import React from 'react';
import { SpinnerIcon } from './Icons.tsx';

export const FormLabel: React.FC<{htmlFor?: string, children: React.ReactNode}> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">{children}</label>
);

export const CustomSelect: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, name: string, children: React.ReactNode}> = ({ value, onChange, name, children }) => (
    <select name={name} value={value} onChange={onChange} className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
        {children}
    </select>
);

interface SuggestButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled: boolean;
    colorClass: string;
}

export const SuggestButton: React.FC<SuggestButtonProps> = ({ onClick, isLoading, disabled, colorClass }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`flex-shrink-0 px-3 py-2 text-sm font-semibold text-white rounded-r-md transition-colors duration-200 disabled:bg-slate-500 disabled:cursor-wait ${colorClass}`}
        style={{minWidth: '80px'}}
    >
        {isLoading ? <SpinnerIcon className="w-5 h-5 mx-auto" /> : 'Gợi Ý'}
    </button>
);
