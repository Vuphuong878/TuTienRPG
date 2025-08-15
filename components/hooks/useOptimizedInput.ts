import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Optimized input hook với debouncing
 * @param initialValue - Giá trị ban đầu
 * @param onDebouncedChange - Callback được gọi sau khi debounce
 * @param delay - Thời gian delay (ms)
 * @returns [value, setValue, debouncedValue]
 */
export function useOptimizedInput(
    initialValue: string = '',
    onDebouncedChange?: (value: string) => void,
    delay: number = 300
) {
    const [value, setValue] = useState(initialValue);
    const debouncedValue = useDebounce(value, delay);

    // Gọi callback khi debounced value thay đổi
    useEffect(() => {
        if (onDebouncedChange && debouncedValue !== initialValue) {
            onDebouncedChange(debouncedValue);
        }
    }, [debouncedValue, onDebouncedChange, initialValue]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value);
    }, []);

    const reset = useCallback(() => {
        setValue(initialValue);
    }, [initialValue]);

    return {
        value,
        setValue,
        debouncedValue,
        handleChange,
        reset
    };
}