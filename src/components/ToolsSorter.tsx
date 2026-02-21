import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Star, Clock, Zap, ArrowDownAZ } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'trending' | 'newest' | 'top_rated' | 'fastest' | 'alphabetical';

interface SortDefinition {
    id: SortOption;
    label: string;
    labelAr: string;
    icon: React.ElementType;
}

const SORT_OPTIONS: SortDefinition[] = [
    { id: 'trending', label: 'Trending', labelAr: 'شائعة', icon: Flame },
    { id: 'newest', label: 'Newest', labelAr: 'الأحدث', icon: Clock },
    { id: 'top_rated', label: 'Top Rated', labelAr: 'الأعلى تقييماً', icon: Star },
    { id: 'fastest', label: 'Popular', labelAr: 'الأكثر شعبية', icon: Zap },
    { id: 'alphabetical', label: 'A-Z', labelAr: 'أ-ي', icon: ArrowDownAZ },
];

interface ToolsSorterProps {
    className?: string;
    onSortChange: (sortId: SortOption) => void;
    isArabic?: boolean;
}

export const ToolsSorter: React.FC<ToolsSorterProps> = ({ className, onSortChange, isArabic = true }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSort = (searchParams.get('sort') as SortOption) || 'trending';

    const [activeSort, setActiveSort] = useState<SortOption>(initialSort);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setActiveSort(initialSort);
    }, [initialSort]);

    const handleSortSelect = (id: SortOption) => {
        if (id === activeSort) return;

        // Immediate visual update
        setActiveSort(id);

        // Background URL and Data fetching sync
        startTransition(() => {
            setSearchParams(prev => {
                prev.set('sort', id);
                return prev;
            });
            onSortChange(id);
        });
    };

    return (
        <div
            className={cn(
                "relative flex items-center p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-x-auto min-h-[56px] hide-scrollbar w-full sm:w-auto",
                className
            )}
            role="radiogroup"
            aria-label="Sort AI Tools"
        >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('/noise.png')]" />

            <div className="flex items-center min-w-max">
                {SORT_OPTIONS.map((option) => {
                    const isActive = activeSort === option.id;
                    const Icon = option.icon;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleSortSelect(option.id)}
                            role="radio"
                            aria-checked={isActive}
                            aria-label={`Sort by ${isArabic ? option.labelAr : option.label}`}
                            className={cn(
                                "relative flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-300 ease-out z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/50 flex-shrink-0 cursor-pointer",
                                isActive
                                    ? "text-white"
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-sort-indicator"
                                    className="absolute inset-0 bg-white/10 rounded-xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 450,
                                        damping: 35,
                                        mass: 0.8
                                    }}
                                />
                            )}

                            <span className="relative z-20 flex items-center gap-2 pointer-events-none">
                                <Icon
                                    className={cn(
                                        "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300",
                                        isActive ? "scale-110 text-neon-purple drop-shadow-[0_0_8px_rgba(188,19,254,0.5)]" : "scale-100"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="tracking-wide">{isArabic ? option.labelAr : option.label}</span>
                            </span>

                            {isActive && isPending && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-purple animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
