
import { useCallback, useRef, useMemo } from 'react';
import { debounce } from '../untils/debounce.ts';

/**
 * Performance optimization utilities
 */
export function usePerformanceOptimized() {
    const renderCountRef = useRef(0);
    const lastRenderTimeRef = useRef(0);

    // Track render count
    renderCountRef.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTimeRef.current;
    lastRenderTimeRef.current = currentTime;

    // Memoized performance logger
    const logPerformance = useMemo(() => {
        return debounce((componentName: string) => {
            console.log(`🔍 Performance [${componentName}]:`, {
                renderCount: renderCountRef.current,
                lastRenderTime: renderTime,
                timestamp: new Date().toISOString()
            });
        }, 1000);
    }, [renderTime]);

    // Memory usage checker
    const checkMemoryUsage = useCallback(() => {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }, []);

    // Performance timing
    const measurePerformance = useCallback(<T extends (...args: any[]) => any>(
        fn: T,
        label: string
    ): T => {
        return ((...args: Parameters<T>) => {
            const start = performance.now();
            const result = fn(...args);
            const end = performance.now();
            
            console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
            return result;
        }) as T;
    }, []);

    return {
        renderCount: renderCountRef.current,
        renderTime,
        logPerformance,
        checkMemoryUsage,
        measurePerformance
    };
}
