import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recently_viewed_tools";

export const useRecentlyViewed = () => {
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const [hasRecent, setHasRecent] = useState(false);

    useEffect(() => {
        // Load from local storage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentIds(parsed);
                    setHasRecent(parsed.length > 0);
                }
            } catch (e) {
                console.error("Failed to parse recently viewed tools", e);
            }
        }
    }, []);

    const addToRecent = useCallback((id: string) => {
        setRecentIds((prev) => {
            // Remove if exists to move to top
            const filtered = prev.filter((item) => item !== id);
            // Add to front, limit to 20 items
            const updated = [id, ...filtered].slice(0, 20);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setHasRecent(true);
            return updated;
        });
    }, []);

    const clearRecent = useCallback(() => {
        setRecentIds([]);
        setHasRecent(false);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return { recentIds, addToRecent, clearRecent, hasRecent };
};
