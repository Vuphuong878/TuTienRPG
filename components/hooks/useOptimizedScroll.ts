import { useCallback, useRef } from 'react';
import { throttle } from '../untils/debounce.ts';

/**
 * Optimized scroll hook với throttling
 * @param onScroll - Callback khi scroll
 * @param throttleMs - Thời gian throttle (ms)
 * @returns Scroll handlers
 */
export function useOptimizedScroll(
    onScroll?: (scrollData: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void,
    throttleMs: number = 100
) {
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const throttledScrollHandler = useCallback(
        throttle((e: React.UIEvent<HTMLDivElement>) => {
            const target = e.currentTarget;
            const scrollData = {
                scrollTop: target.scrollTop,
                scrollHeight: target.scrollHeight,
                clientHeight: target.clientHeight
            };
            
            if (onScroll) {
                onScroll(scrollData);
            }
        }, throttleMs),
        [onScroll, throttleMs]
    );

    const scrollToBottom = useCallback(() => {
        if (scrollElementRef.current) {
            scrollElementRef.current.scrollTop = scrollElementRef.current.scrollHeight;
        }
    }, []);

    const scrollToTop = useCallback(() => {
        if (scrollElementRef.current) {
            scrollElementRef.current.scrollTop = 0;
        }
    }, []);

    return {
        scrollElementRef,
        onScroll: throttledScrollHandler,
        scrollToBottom,
        scrollToTop
    };
}