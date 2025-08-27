import React from 'react';

interface ImageDisplayProps {
    imageUrl: string | null;
    error: string | null;
    isGenerating: boolean;
    onRetry?: () => void;
    onClear?: () => void;
    className?: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
    imageUrl,
    error,
    isGenerating,
    onRetry,
    onClear,
    className = ''
}) => {
    if (isGenerating) {
        return (
            <div className={`image-display ${className}`}>
                <div className="flex items-center justify-center p-6 bg-purple-500/10 backdrop-blur-sm border border-purple-400/20 rounded-xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                    <span className="ml-3 text-purple-200 text-sm">Đang tạo ảnh...</span>
                </div>
            </div>
        );
    }

    if (imageUrl) {
        return (
            <div className={`image-display ${className}`}>
                <div className="relative">
                    <img
                        src={imageUrl}
                        alt="AI Generated Scene"
                        className="w-full max-w-sm mx-auto rounded-xl shadow-lg"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                            title="Xóa ảnh"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                    <p className="text-xs text-white/60 text-center mt-2">
                        Ảnh được tạo bởi AI
                    </p>
                </div>
            </div>
        );
    }

    if (error && onRetry) {
        return (
            <div className={`image-display ${className}`}>
                <div className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-red-300 font-medium text-sm">Lỗi tạo ảnh</h4>
                            <p className="text-red-200/80 text-xs mt-1">{error}</p>
                        </div>
                        <button
                            onClick={onRetry}
                            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
