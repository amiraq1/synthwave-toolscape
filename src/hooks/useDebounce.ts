import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // إعداد مؤقت لتحديث القيمة بعد انتهاء التأخير
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // تنظيف المؤقت إذا تغيرت القيمة (المستخدم كتب حرفاً جديداً)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
