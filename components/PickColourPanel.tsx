import React, { useRef, useEffect } from 'react';

const PRESET_COLORS = [
    '#FFFFFF', '#d1d5db', '#9ca3af', '#4b5563', '#1f2937', '#111827',
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
];

interface PickColourPanelProps {
    color: string;
    onChange: (color: string) => void;
    onClose: () => void;
}

const PickColourPanel: React.FC<PickColourPanelProps> = ({ color, onChange, onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

    // Close on click outside is handled by the parent component (FontAndColorSettings)
    // to avoid nested event listeners.

    const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };
    
    const handleButtonClick = () => {
        colorInputRef.current?.click();
    };

    return (
        <div 
            ref={panelRef} 
            className="bg-slate-700 p-3 rounded-lg shadow-2xl border border-slate-600 w-52"
        >
            <div className="grid grid-cols-6 gap-2 mb-3">
                {PRESET_COLORS.map(c => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => onChange(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-purple-500 ${color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-purple-500' : ''}`}
                        aria-label={`Select color ${c}`}
                    />
                ))}
            </div>
            
            <div className="flex items-center justify-between p-1 bg-slate-800 rounded-md">
                <span 
                    className="w-8 h-8 rounded-md"
                    style={{backgroundColor: color}}
                ></span>
                <span className="font-mono text-sm text-slate-300">{color.toUpperCase()}</span>
                <button 
                    type="button"
                    onClick={handleButtonClick}
                    className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-md"
                    aria-label="Open custom color picker"
                >
                    <svg className="w-5 h-5 text-slate-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622 3.385m-5.043-.025a15.998 15.998 0 01-3.388 1.621m7.5-3.972a15.998 15.998 0 00-3.388-1.622m-5.043-.025a15.998 15.998 0 01-1.622 3.385m5.043-.025a15.998 15.998 0 00-1.622 3.385m-3.388-1.62a15.998 15.998 0 001.622-3.385" />
                    </svg>
                </button>
                <input
                    ref={colorInputRef}
                    type="color"
                    value={color}
                    onChange={handleColorInputChange}
                    className="opacity-0 w-0 h-0 absolute -z-10"
                />
            </div>
        </div>
    );
};

export default PickColourPanel;
