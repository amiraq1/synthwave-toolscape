import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router-dom";
import { Search, Loader2, ArrowRight, ArrowLeft, Sparkles, Command } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { cn } from "@/lib/utils";

interface SearchAutocompleteProps {
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (query: string) => void;
    className?: string;
    inputClassName?: string;
    placeholder?: string;
}

const SearchAutocomplete = ({
    value,
    onChange,
    onSearch,
    className,
    inputClassName,
    placeholder
}: SearchAutocompleteProps) => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Internal state if uncontrolled, or sync with props
    const [internalQuery, setInternalQuery] = useState("");
    const query = value !== undefined ? value : internalQuery;

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const debouncedQuery = useDebounce(query, 500); // 500ms delay for semantic search to save costs

    // Semantic Search Hook
    const {
        data: suggestions = [],
        isLoading
    } = useSemanticSearch({
        query: debouncedQuery,
        enabled: showSuggestions && debouncedQuery.length >= 2,
        limit: 5
    });

    const handleChange = (val: string) => {
        if (onChange) onChange(val);
        else setInternalQuery(val);
        setShowSuggestions(true);
    };

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFullSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (onSearch) onSearch(query);
        setShowSuggestions(false);
        // Force blur to hide mobile keyboard
        (document.activeElement as HTMLElement)?.blur();
    };

    const Arrow = isAr ? ArrowLeft : ArrowRight;

    return (
        <div ref={wrapperRef} className={cn("relative w-full z-50", className)}>
            <form onSubmit={handleFullSearch} className="relative group">
                <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none z-10`}>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-neon-purple animate-spin" />
                    ) : (
                        <Search className={cn(
                            "w-5 h-5 transition-colors duration-300",
                            isFocused ? "text-neon-purple" : "text-muted-foreground/60"
                        )} />
                    )}
                </div>

                <input
                    type="text"
                    dir={isAr ? "rtl" : "ltr"}
                    className={cn(
                        "w-full bg-white/5 border border-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:bg-white/10 transition-all duration-300 shadow-inner",
                        isAr ? 'pr-12 pl-12' : 'pl-12 pr-12',
                        inputClassName
                    )}
                    placeholder={placeholder || t('search.placeholder')}
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                />

                {/* Keyboard Shortcut Hint or Enter Icon */}
                <div className={`absolute inset-y-0 ${isAr ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center`}>
                    {query.length > 0 ? (
                        <button
                            type="submit"
                            className="p-1 hover:bg-white/10 rounded-full transition-colors group/btn"
                            title={t('search.submit')}
                        >
                            <Arrow className="w-5 h-5 text-muted-foreground/60 group-hover/btn:text-neon-purple transition-colors" />
                        </button>
                    ) : (
                        <div className="hidden sm:flex items-center gap-1 opacity-40 text-xs text-muted-foreground select-none pointer-events-none">
                            <Command className="w-3 h-3" />
                            <span>K</span>
                        </div>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && query.length >= 2 && (
                <div
                    className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a16]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-300 ring-1 ring-white/5"
                    dir={isAr ? "rtl" : "ltr"}
                >
                    {/* Header */}
                    <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-neon-purple" />
                            {isLoading ? (isAr ? "جاري التفكير..." : "Thinking...") : (isAr ? "اقتراحات ذكية" : "AI Suggestions")}
                        </span>
                        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-neon-purple" />}
                    </div>

                    {suggestions.length > 0 ? (
                        <>
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {suggestions.map((tool) => {
                                    const displayTitle = isAr ? tool.title : (tool.title_en || tool.title);
                                    // Calculate display description
                                    const desc = isAr ? tool.description : (tool.description_en || tool.description);

                                    return (
                                        <Link
                                            key={tool.id}
                                            to={`/tool/${tool.id}`}
                                            className="block p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group relative overflow-hidden"
                                            onClick={() => setShowSuggestions(false)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/0 via-neon-purple/5 to-neon-purple/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                            <div className="flex items-start gap-4 relative z-10">
                                                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-neon-purple font-bold text-lg shadow-sm group-hover:border-neon-purple/50 group-hover:shadow-neon-purple/20 transition-all shrink-0">
                                                    {displayTitle.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold text-foreground group-hover:text-neon-purple transition-colors truncate">
                                                            {displayTitle}
                                                        </h4>
                                                        {(tool.similarity !== undefined) && (
                                                            <span className="text-[10px] bg-neon-purple/10 text-neon-purple px-1.5 py-0.5 rounded-full border border-neon-purple/20 shrink-0">
                                                                {Math.round(tool.similarity * 100)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                                                        {desc}
                                                    </p>
                                                </div>
                                                <Arrow className="w-5 h-5 text-muted-foreground/30 group-hover:text-neon-cyan self-center -translate-x-2 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100 shrink-0" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            <button
                                className="w-full p-3 bg-white/5 hover:bg-white/10 text-center transition-colors border-t border-white/5 group"
                                onClick={() => handleFullSearch()}
                            >
                                <span className="text-sm text-neon-purple group-hover:text-neon-cyan transition-colors flex items-center justify-center gap-2">
                                    {isAr ? "عرض كل النتائج" : "View All Results"}
                                    <Arrow className="w-4 h-4" />
                                </span>
                            </button>
                        </>
                    ) : (
                        !isLoading && (
                            <div className="p-8 text-center">
                                <p className="text-muted-foreground text-sm">
                                    {isAr ? "لا توجد نتائج مطابقة تماماً" : "No direct matches found"}
                                </p>
                                <button onClick={() => handleFullSearch()} className="text-neon-purple text-xs mt-2 hover:underline">
                                    {isAr ? "بحث شامل في الدليل" : "Search entire directory"}
                                </button>
                            </div>
                        )
                    )}

                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
