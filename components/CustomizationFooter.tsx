import React from 'react';

export const CustomizationFooter: React.FC<{
    fontFamily: string;
    setFontFamily: (font: string) => void;
    fontSize: string;
    setFontSize: (size: string) => void;
}> = ({ fontFamily, setFontFamily, fontSize, setFontSize }) => {
    
    const fontOptions = [
        { value: 'font-sans', label: 'Inter' },
        { value: 'font-serif', label: 'Merriweather' },
        { value: 'font-lora', label: 'Lora' },
        { value: 'font-mono', label: 'Roboto Mono' },
        { value: 'font-source-code', label: 'Source Code Pro' },
    ];

    const sizeOptions = [
        { value: 'text-xs', label: 'Cực nhỏ' },
        { value: 'text-sm', label: 'Nhỏ' },
        { value: 'text-base', label: 'Vừa' },
        { value: 'text-lg', label: 'Lớn' },
        { value: 'text-xl', label: 'Rất lớn' },
        { value: 'text-2xl', label: 'Cực lớn' },
    ];
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1f2238]/80 backdrop-blur-sm border-t border-slate-300 dark:border-slate-700 p-2 z-[100]">
            <div className="max-w-7xl mx-auto hidden md:flex items-center justify-center space-x-4 md:space-x-8">
                {/* Font Family Selector */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="font-family" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phông chữ:</label>
                    <select
                        id="font-family"
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                
                {/* Font Size Selector */}
                 <div className="flex items-center space-x-2">
                    <label htmlFor="font-size" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cỡ chữ:</label>
                    <select
                        id="font-size"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {sizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};
