import { useState, useEffect, useCallback } from 'react';
import type { Tool } from '@/hooks/useTools';

const STORAGE_KEY = 'recently_viewed_tools';
const MAX_ITEMS = 10;

interface RecentlyViewedItem {
    toolId: string;
    viewedAt: number;
}

/**
 * هوك لإدارة الأدوات المشاهدة مؤخراً
 * يستخدم localStorage للتخزين المحلي
 */
export const useRecentlyViewed = () => {
    const [recentIds, setRecentIds] = useState<string[]>([]);

    // تحميل البيانات من localStorage عند البداية
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const items: RecentlyViewedItem[] = JSON.parse(stored);
                // ترتيب حسب الأحدث وأخذ الـ IDs فقط
                const sortedIds = items
                    .sort((a, b) => b.viewedAt - a.viewedAt)
                    .slice(0, MAX_ITEMS)
                    .map(item => item.toolId);
                setRecentIds(sortedIds);
            }
        } catch (error) {
            console.error('Error loading recently viewed:', error);
        }
    }, []);

    // إضافة أداة للقائمة
    const addToRecent = useCallback((toolId: string) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            let items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

            // إزالة إذا موجود مسبقاً
            items = items.filter(item => item.toolId !== toolId);

            // إضافة في البداية
            items.unshift({ toolId, viewedAt: Date.now() });

            // الاحتفاظ بآخر 10 فقط
            items = items.slice(0, MAX_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            setRecentIds(items.map(item => item.toolId));
        } catch (error) {
            console.error('Error adding to recently viewed:', error);
        }
    }, []);

    // مسح السجل
    const clearRecent = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setRecentIds([]);
        } catch (error) {
            console.error('Error clearing recently viewed:', error);
        }
    }, []);

    return {
        recentIds,
        addToRecent,
        clearRecent,
        hasRecent: recentIds.length > 0
    };
};

export default useRecentlyViewed;
