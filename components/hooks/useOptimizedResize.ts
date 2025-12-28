
import { useEffect, useCallback, useState } from 'react';
import { throttle } from '../untils/debounce.ts';

/**
 * Optimized window resize hook
 * @param throttleMs - Thời gian throttle (ms)
 * @returns Window dimensions
 */
export function useOptimizedResize(throttleMs: number = 250) {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    const handleResize = useCallback(
        throttle(() => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }, throttleMs),
        [throttleMs]
    );

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    return windowSize;
}
