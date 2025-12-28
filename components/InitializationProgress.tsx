import React from 'react';

interface InitializationProgressProps {
    isVisible: boolean;
    currentStep: string;
    progress: number; // 0-100
    subStep?: string;
}

export const InitializationProgress: React.FC<InitializationProgressProps> = ({ 
    isVisible, 
    currentStep, 
    progress, 
    subStep 
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 border-blue-400 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
                {/* Loading Animation */}
                <div className="mb-6">
                    <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Thế giới đang khởi tạo
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-300 mb-6">
                    Xin hãy kiên nhẫn...
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(10, progress)}%` }}
                        />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 text-right">
                        {Math.round(progress)}%
                    </div>
                </div>

                {/* Current Step */}
                <div className="text-sm text-slate-700 dark:text-gray-200">
                    <div className="font-medium mb-1">{currentStep}</div>
                    {subStep && (
                        <div className="text-xs text-slate-500 dark:text-gray-400 italic">
                            {subStep}
                        </div>
                    )}
                </div>

                {/* Dots Animation */}
                <div className="flex justify-center mt-4 space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};