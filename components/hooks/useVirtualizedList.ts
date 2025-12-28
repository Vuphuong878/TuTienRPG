// components/hooks/useVirtualizedList.ts
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualizedListOptions {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
    threshold?: number;
}

export function useVirtualizedList<T>(
    items: T[],
    options: VirtualizedListOptions
) {
    const { itemHeight, containerHeight, overscan = 5, threshold = 50 } = options;
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Only virtualize if we have enough items to warrant it
    const shouldVirtualize = items.length > threshold;

    const visibleRange = useMemo(() => {
        if (!shouldVirtualize) {
            return { start: 0, end: items.length };
        }

        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + visibleCount + overscan,
            items.length
        );

        return {
            start: Math.max(0, startIndex - overscan),
            end: endIndex
        };
    }, [scrollTop, itemHeight, containerHeight, overscan, items.length, shouldVirtualize]);

    const visibleItems = useMemo(() => {
        if (!shouldVirtualize) {
            return items.map((item, index) => ({ item, index }));
        }

        return items
            .slice(visibleRange.start, visibleRange.end)
            .map((item, i) => ({ item, index: visibleRange.start + i }));
    }, [items, visibleRange, shouldVirtualize]);

    const totalHeight = shouldVirtualize ? items.length * itemHeight : 'auto';
    const offsetY = shouldVirtualize ? visibleRange.start * itemHeight : 0;

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        if (shouldVirtualize) {
            setScrollTop(event.currentTarget.scrollTop);
        }
    }, [shouldVirtualize]);

    // Auto-scroll to bottom when new items are added
    const scrollToBottom = useCallback(() => {
        const container = containerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, []);

    // Scroll to specific item
    const scrollToItem = useCallback((index: number) => {
        const container = containerRef.current;
        if (container && shouldVirtualize) {
            const targetScrollTop = index * itemHeight;
            container.scrollTop = targetScrollTop;
        }
    }, [itemHeight, shouldVirtualize]);

    return {
        containerRef,
        visibleItems,
        totalHeight,
        offsetY,
        handleScroll,
        scrollToBottom,
        scrollToItem,
        shouldVirtualize,
        visibleRange
    };
}

// Hook for virtualized game history display
export function useVirtualizedGameHistory(
    gameHistory: any[],
    containerHeight: number,
    itemHeight = 100
) {
    const {
        containerRef,
        visibleItems,
        totalHeight,
        offsetY,
        handleScroll,
        scrollToBottom,
        shouldVirtualize
    } = useVirtualizedList(gameHistory, {
        itemHeight,
        containerHeight,
        overscan: 3,
        threshold: 20
    });

    // Auto-scroll to bottom when new entries are added
    useEffect(() => {
        scrollToBottom();
    }, [gameHistory.length, scrollToBottom]);

    return {
        containerRef,
        visibleHistoryItems: visibleItems,
        totalHeight,
        offsetY,
        handleScroll,
        scrollToBottom,
        shouldVirtualize
    };
}