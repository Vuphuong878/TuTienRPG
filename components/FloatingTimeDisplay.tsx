import React, { useState, useRef, useEffect, useCallback } from 'react';

interface GameTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

interface FloatingTimeDisplayProps {
  gameTime: GameTime;
  className?: string;
}

export const FloatingTimeDisplay: React.FC<FloatingTimeDisplayProps> = ({ gameTime, className = '' }) => {
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage or use default
    const saved = localStorage.getItem('floatingTimePosition');
    return saved ? JSON.parse(saved) : { x: 20, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timeDisplayRef = useRef<HTMLDivElement>(null);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('floatingTimePosition', JSON.stringify(position));
  }, [position]);

  // Format time display
  const formatTime = useCallback(() => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    
    // Safe fallbacks for undefined values
    const safeHour = Number.isFinite(gameTime?.hour) ? gameTime.hour : 0;
    const safeMinute = Number.isFinite(gameTime?.minute) ? gameTime.minute : 0;
    const safeDay = Number.isFinite(gameTime?.day) ? gameTime.day : 1;
    const safeMonth = Number.isFinite(gameTime?.month) ? gameTime.month : 1;
    const safeYear = Number.isFinite(gameTime?.year) ? gameTime.year : 1;
    
    const timeOfDay = 
      safeHour >= 6 && safeHour < 12 ? 'Sáng' :
      safeHour >= 12 && safeHour < 18 ? 'Chiều' :
      safeHour >= 18 && safeHour < 22 ? 'Tối' : 'Đêm';
    
    return {
      date: `${monthNames[safeMonth - 1] || monthNames[0]} ${safeDay}, Năm ${safeYear}`,
      time: `${safeHour}:${safeMinute.toString().padStart(2, '0')} ${timeOfDay}`
    };
  }, [gameTime]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = timeDisplayRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    // Boundary constraints
    const maxX = window.innerWidth - 200; // Assuming component width ~200px
    const maxY = window.innerHeight - 100; // Assuming component height ~100px
    
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  }, [isDragging, dragOffset]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = timeDisplayRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Boundary constraints
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 100;
    
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);


  const { date, time } = formatTime();

  return (
    <div
      ref={timeDisplayRef}
      className={`fixed z-50 select-none cursor-move ${
        // Mobile: reduced animations for battery life
        isDragging 
          ? 'scale-105 shadow-2xl transition-all duration-100 md:duration-200' 
          : 'shadow-lg transition-all duration-150 md:duration-200 md:hover:scale-102'
      } ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none', // Prevent scrolling when dragging
        WebkitUserSelect: 'none',
        userSelect: 'none',
        // Mobile optimization: use transform3d for hardware acceleration
        transform: isDragging ? 'scale(1.05) translateZ(0)' : 'translateZ(0)',
        willChange: isDragging ? 'transform' : 'auto',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-black/20 dark:bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-3 min-w-[180px]">
        {/* Drag indicator */}
        <div className="flex justify-center mb-1">
          <div className="w-8 h-1 bg-white/30 rounded-full"></div>
        </div>
        
        {/* Time content */}
        <div className="text-white text-center">
          <div className="text-xs font-medium opacity-90 leading-tight">
            {date}
          </div>
          <div className="text-sm font-bold mt-1 text-yellow-300">
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};