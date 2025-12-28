import React, { useState, useRef } from 'react';
import { CrossIcon } from './Icons';
import { EntityExportManager, ImportResult } from './utils/EntityExportManager';
import type { SaveData } from './types';

interface EntityImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: SaveData;
    onImportSuccess: (results: ImportResult[]) => void;
}

export const EntityImportModal: React.FC<EntityImportModalProps> = ({
    isOpen,
    onClose,
    gameState,
    onImportSuccess
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResults, setImportResults] = useState<ImportResult[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        
        const jsonFiles = Array.from(files).filter(file => 
            file.name.endsWith('.json') && file.type === 'application/json'
        );
        
        setSelectedFiles(jsonFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleImport = async () => {
        if (selectedFiles.length === 0) return;

        setIsImporting(true);
        setImportResults([]);

        try {
            const results: ImportResult[] = [];
            
            for (const file of selectedFiles) {
                const result = await EntityExportManager.importEntities(file, gameState);
                results.push(result);
            }

            setImportResults(results);
            onImportSuccess(results);
            
        } catch (error) {
            console.error('Import error:', error);
            const errorResult: ImportResult = {
                success: false,
                entitiesImported: 0,
                entitiesSkipped: 0,
                conflicts: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            setImportResults([errorResult]);
        } finally {
            setIsImporting(false);
        }
    };

    const handleReset = () => {
        setSelectedFiles([]);
        setImportResults([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getTotalStats = () => {
        return importResults.reduce(
            (total, result) => ({
                imported: total.imported + result.entitiesImported,
                skipped: total.skipped + result.entitiesSkipped,
                conflicts: total.conflicts + result.conflicts.length
            }),
            { imported: 0, skipped: 0, conflicts: 0 }
        );
    };

    const exportStatus = EntityExportManager.getExportStatus();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white/95 dark:bg-[#2a2f4c]/95 backdrop-blur-sm border-2 border-green-400 rounded-lg shadow-2xl w-full max-w-3xl text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b-2 border-green-400 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-3">
                        <span className="text-3xl">📥</span>
                        Nhập Entity từ File
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none"
                    >
                        <CrossIcon className="w-6 h-6"/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Import Status */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h5 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-2">
                            <span>📊</span>
                            Trạng thái Import
                        </h5>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <div>Import được bật: {exportStatus.config.importEnabled ? '✅ Có' : '❌ Không'}</div>
                            <div>Tự động merge: {exportStatus.config.autoMergeOnImport ? '✅ Có' : '❌ Không'}</div>
                            <div>Tạo backup: {exportStatus.config.backupBeforeImport ? '✅ Có' : '❌ Không'}</div>
                            <div>Tổng số lần import: {exportStatus.metadata.totalImports}</div>
                        </div>
                    </div>

                    {/* File Selection */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-gray-100 border-b border-slate-300 dark:border-slate-600 pb-2">
                            📁 Chọn File JSON
                        </h4>

                        {/* Drag & Drop Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                                isDragging
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="space-y-4">
                                <div className="text-4xl">📁</div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-700 dark:text-gray-300">
                                        Kéo thả file JSON vào đây
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        hoặc click để chọn file
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors duration-200"
                                >
                                    Chọn File
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".json,application/json"
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Selected Files */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="font-semibold text-slate-700 dark:text-gray-300">
                                    File đã chọn ({selectedFiles.length}):
                                </h5>
                                <div className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded border">
                                            <div className="flex items-center gap-3">
                                                <span className="text-green-600">📄</span>
                                                <div>
                                                    <div className="font-medium text-slate-800 dark:text-gray-100">
                                                        {file.name}
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                                                className="text-red-500 hover:text-red-700 text-xl"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Import Results */}
                    {importResults.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-gray-100 border-b border-slate-300 dark:border-slate-600 pb-2">
                                📋 Kết Quả Import
                            </h4>

                            {/* Summary */}
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                    📊 Tổng Kết
                                </h5>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {getTotalStats().imported}
                                        </div>
                                        <div className="text-green-700 dark:text-green-300">Đã import</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {getTotalStats().skipped}
                                        </div>
                                        <div className="text-yellow-700 dark:text-yellow-300">Đã bỏ qua</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {getTotalStats().conflicts}
                                        </div>
                                        <div className="text-orange-700 dark:text-orange-300">Conflict</div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Results */}
                            <div className="space-y-3">
                                {importResults.map((result, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-4 rounded-lg border ${
                                            result.success 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h6 className={`font-semibold ${
                                                result.success 
                                                    ? 'text-green-800 dark:text-green-200' 
                                                    : 'text-red-800 dark:text-red-200'
                                            }`}>
                                                {result.success ? '✅' : '❌'} File {index + 1}: {selectedFiles[index]?.name}
                                            </h6>
                                        </div>
                                        
                                        {result.success ? (
                                            <div className="text-sm space-y-1">
                                                <div>✅ Imported: {result.entitiesImported} entities</div>
                                                <div>⏭️ Skipped: {result.entitiesSkipped} entities</div>
                                                {result.conflicts.length > 0 && (
                                                    <div>
                                                        <div>⚠️ Conflicts: {result.conflicts.length}</div>
                                                        <div className="ml-4 mt-1 space-y-1">
                                                            {result.conflicts.slice(0, 3).map((conflict, i) => (
                                                                <div key={i} className="text-xs">
                                                                    • {conflict.entityName}: {conflict.reason} ({conflict.action})
                                                                </div>
                                                            ))}
                                                            {result.conflicts.length > 3 && (
                                                                <div className="text-xs">
                                                                    ... và {result.conflicts.length - 3} conflict khác
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-red-700 dark:text-red-300">
                                                ❌ Lỗi: {result.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h5 className="font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            💡 Hướng Dẫn
                        </h5>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <li>• Chọn file JSON đã được xuất từ hệ thống</li>
                            <li>• Hệ thống sẽ tự động tạo backup trước khi import</li>
                            <li>• Entity trùng tên sẽ được merge tự động</li>
                            <li>• Kiểm tra kết quả import để xem chi tiết</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors duration-200 flex items-center gap-2"
                        disabled={isImporting}
                    >
                        🔄 Reset
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors duration-200"
                            disabled={isImporting}
                        >
                            Đóng
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={selectedFiles.length === 0 || isImporting}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                            {isImporting ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Đang import...
                                </>
                            ) : (
                                <>
                                    📥 Import Entity
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};