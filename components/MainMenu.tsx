
import React, { useRef } from 'react';
import MenuButton from './MenuButton.tsx';
import { PlayIcon, FileIcon, ChartIcon, SettingsIcon } from './Icons.tsx';

export const MainMenu: React.FC<{ 
    onStartNewAdventure: () => void; 
    onQuickPlay?: () => Promise<void>;
    hasLastWorldSetup?: boolean;
    onOpenApiSettings: () => void; 
    onLoadGameFromFile: (file: File) => void;
    isUsingDefaultKey: boolean;
    onOpenChangelog: () => void;
    selectedAiModel: string;
}> = ({ onStartNewAdventure, onQuickPlay, hasLastWorldSetup, onOpenApiSettings, onLoadGameFromFile, isUsingDefaultKey, onOpenChangelog, selectedAiModel }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLoadGameFromFile(file);
        }
        // Reset file input to allow selecting the same file again
        if (event.target) {
            event.target.value = '';
        }
    };
    
    return (
      <div className="bg-white/80 dark:bg-[#1f2238]/80 backdrop-blur-md border border-slate-300 dark:border-slate-700 p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json"
            className="hidden"
        />
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-slate-900 dark:text-white">
            <span className="dark:text-purple-400">HÃY VIẾT LÊN </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">CÂU TRUYỆN CỦA BẠN</span>
          </h1>
        </header>
        
        <main className="flex flex-col items-center space-y-4">
          <MenuButton 
            text="Tạo Thế Giới Mới" 
            icon={<PlayIcon />}
            onClick={onStartNewAdventure}
            colorClass="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"
            hoverClass="hover:from-purple-700 hover:via-pink-600 hover:to-red-600"
            focusClass="focus:ring-pink-500"
          />
          {hasLastWorldSetup && onQuickPlay && (
            <MenuButton 
              text="Chơi Ngay" 
              icon={<PlayIcon />}
              onClick={onQuickPlay}
              colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
              hoverClass="hover:from-emerald-600 hover:to-teal-700"
              focusClass="focus:ring-emerald-500"
            />
          )}
          <MenuButton 
            text="Tải Game Từ Tệp (.json)" 
            icon={<FileIcon />}
            onClick={() => fileInputRef.current?.click()}
            colorClass="bg-blue-500"
            hoverClass="hover:bg-blue-600"
            focusClass="focus:ring-blue-400"
          />
          <MenuButton 
            text="Xem Cập Nhật Game" 
            icon={<ChartIcon />}
            onClick={onOpenChangelog}
            colorClass="bg-green-500"
            hoverClass="hover:bg-green-600"
            focusClass="focus:ring-green-400"
          />
           <MenuButton 
            text="Thiết Lập API Key" 
            icon={<SettingsIcon />}
            onClick={onOpenApiSettings}
            colorClass="bg-slate-700"
            hoverClass="hover:bg-slate-600"
            focusClass="focus:ring-slate-500"
          />
        </main>
        
        <footer className="mt-6 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Model AI hiện tại: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedAiModel}</span>
          </p>
        </footer>
      </div>
    );
};
