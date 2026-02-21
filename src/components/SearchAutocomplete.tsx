import { useState, useEffect, useRef, useId, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router-dom";
import { Search, Loader2, ArrowLeft, Sparkles, Command, BookOpen, AlertCircle } from "lucide-react";
import { useSemanticSearchFixed as useSemanticSearch, type SearchResponse } from "@/hooks/useSemanticSearch";
import { cn } from "@/lib/utils";

interface SearchAutocompleteProps {
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (query: string) => void;
    className?: string;
    inputClassName?: string;
    placeholder?: string;
    quickSuggestions?: string[];
}

const DEFAULT_AR_SUGGESTIONS = [
    "تصميم",
    "برمجة",
    "كتابة محتوى",
    "ذكاء اصطناعي",
    "تسويق",
    "تعليم",
    "صوت",
    "فيديو"
];


const SearchAutocomplete = ({
    value,
    onChange,
    onSearch,
    className,
    inputClassName,
    placeholder,
    quickSuggestions
}: SearchAutocompleteProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const [internalQuery, setInternalQuery] = useState("");
    const query = value !== undefined ? value : internalQuery;

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debouncedQuery = useDebounce(query, 500);
    const keywordSource = quickSuggestions && quickSuggestions.length > 0
        ? quickSuggestions
        : DEFAULT_AR_SUGGESTIONS;
    const normalizedQuery = query.trim().toLowerCase();
    const keywordSuggestions = (normalizedQuery.length >= 2
        ? keywordSource.filter((keyword) => keyword.toLowerCase().includes(normalizedQuery))
        : keywordSource
    )
        .filter((keyword) => keyword.toLowerCase() !== normalizedQuery)
        .slice(0, 8);
    const shouldShowDropdown = showSuggestions && (query.length >= 2 || keywordSuggestions.length > 0);

    const {
        data,
        isLoading
    } = useSemanticSearch({
        query: debouncedQuery,
        enabled: showSuggestions && debouncedQuery.length >= 2,
        limit: 5
    });

    // Extract tools and posts from data
    const searchData: SearchResponse | undefined = data;
    const suggestions = searchData?.tools ?? [];
    const blogPosts = searchData?.posts ?? [];

    const handleChange = (val: string) => {
        if (onChange) onChange(val);
        else setInternalQuery(val);
        setShowSuggestions(true);
    };

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
        const normalizedQuery = query.trim();
        if (onSearch && normalizedQuery) onSearch(normalizedQuery);
        setShowSuggestions(false);
        setActiveIndex(-1);
        (document.activeElement as HTMLElement)?.blur();
    };

    // Build a flat list of selectable items for keyboard navigation
    const flatItems = useCallback(() => {
        const items: { type: 'keyword' | 'tool' | 'blog'; id: string; value: string }[] = [];
        keywordSuggestions.forEach((kw) => items.push({ type: 'keyword', id: `kw-${kw}`, value: kw }));
        suggestions.forEach((tool) => items.push({ type: 'tool', id: `tool-${tool.id}`, value: String(tool.id) }));
        blogPosts.forEach((post) => items.push({ type: 'blog', id: `blog-${post.id}`, value: post.slug }));
        return items;
    }, [keywordSuggestions, suggestions, blogPosts]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!shouldShowDropdown) return;
        const items = flatItems();
        const total = items.length;
        if (total === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % total);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestions(false);
            setActiveIndex(-1);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            const item = items[activeIndex];
            if (item.type === 'keyword') {
                handleChange(item.value);
                if (onSearch) onSearch(item.value);
                setShowSuggestions(false);
            } else if (item.type === 'tool') {
                window.location.href = `/tool/${item.value}`;
            } else if (item.type === 'blog') {
                window.location.href = `/blog/${item.value}`;
            }
            setActiveIndex(-1);
        }
    }, [shouldShowDropdown, flatItems, activeIndex, handleChange, onSearch]);

    // Reset active index when query changes
    useEffect(() => {
        setActiveIndex(-1);
    }, [query]);

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;
        const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ?
                        <span key={i} className="text-neon-cyan bg-neon-cyan/10 px-0.5 rounded">{part}</span> :
                        part
                )}
            </span>
        );
    };

    const Arrow = ArrowLeft;

    return (
        <div ref={wrapperRef} className={cn("relative w-full z-50", className)}>
            <form onSubmit={handleFullSearch} className="relative group">
                <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10`}>
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
                    dir="rtl"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={shouldShowDropdown}
                    aria-controls={listboxId}
                    aria-label={placeholder || "بحث..."}
                    className={cn(
                        "w-full bg-white/5 border border-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:bg-white/10 transition-all duration-300 shadow-inner",
                        'pr-12 pl-12',
                        inputClassName
                    )}
                    placeholder={placeholder || "بحث..."}
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    aria-activedescendant={
                        activeIndex >= 0 ? `${listboxId}-item-${activeIndex}` : undefined
                    }
                />

                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center`}>
                    {query.length > 0 ? (
                        <button
                            type="submit"
                            className="p-1 hover:bg-white/10 rounded-full transition-colors group/btn"
                            title="تأكيد البحث"
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

            {shouldShowDropdown && (
                <div
                    id={listboxId}
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a16]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-300 ring-1 ring-white/5"
                    dir={isAr ? "rtl" : "ltr"}
                >
                    <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-neon-purple" />
                            {isLoading && query.length >= 2
                                ? "جاري التفكير..."
                                : "اقتراحات البحث"}
                        </span>
                        {isLoading && query.length >= 2 && <Loader2 className="w-3 h-3 animate-spin text-neon-purple" />}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {keywordSuggestions.length > 0 && (
                            <div className="py-3 px-4 border-b border-white/5">
                                <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                                    كلمات مقترحة
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {keywordSuggestions.map((keyword, idx) => (
                                        <button
                                            key={keyword}
                                            id={`${listboxId}-item-${idx}`}
                                            type="button"
                                            className={cn(
                                                "px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-foreground/90 hover:border-neon-purple/40 hover:bg-neon-purple/10 hover:text-neon-purple transition-colors",
                                                activeIndex === idx && "border-neon-purple/50 bg-neon-purple/15 text-neon-purple ring-1 ring-neon-purple/30"
                                            )}
                                            onClick={() => {
                                                handleChange(keyword);
                                                if (onSearch) onSearch(keyword);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            {keyword}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {suggestions.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">
                                    الأدوات
                                </div>
                                {suggestions.map((tool, i) => {
                                    const flatIdx = keywordSuggestions.length + i;
                                    const displayTitle = tool.title;
                                    const desc = tool.description;

                                    return (
                                        <Link
                                            key={tool.id}
                                            id={`${listboxId}-item-${flatIdx}`}
                                            role="option"
                                            aria-selected={activeIndex === flatIdx}
                                            to={`/tool/${tool.id}`}
                                            className={cn(
                                                "block p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group relative overflow-hidden",
                                                activeIndex === flatIdx && "bg-white/5 ring-1 ring-inset ring-neon-purple/20"
                                            )}
                                            onClick={() => setShowSuggestions(false)}
                                        >
                                            <div className="flex items-start gap-4 relative z-10">
                                                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-neon-purple font-bold text-lg shadow-sm group-hover:border-neon-purple/50 group-hover:shadow-neon-purple/20 transition-all shrink-0">
                                                    {displayTitle.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold text-foreground group-hover:text-neon-purple transition-colors truncate">
                                                            {highlightText(displayTitle, query)}
                                                        </h4>
                                                        {tool.similarity && (
                                                            <span className="text-[10px] bg-neon-purple/10 text-neon-purple px-1.5 py-0.5 rounded-full border border-neon-purple/20 shrink-0">
                                                                {Math.round(tool.similarity * 100)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                                                        {desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {blogPosts.length > 0 && (
                            <div className="py-2 border-t border-white/5">
                                <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    من المدونة
                                </div>
                                {blogPosts.map((post, i) => {
                                    const flatIdx = keywordSuggestions.length + suggestions.length + i;
                                    return (
                                        <Link
                                            key={post.id}
                                            id={`${listboxId}-item-${flatIdx}`}
                                            role="option"
                                            aria-selected={activeIndex === flatIdx}
                                            to={`/blog/${post.slug}`}
                                            className={cn(
                                                "block p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group",
                                                activeIndex === flatIdx && "bg-white/5 ring-1 ring-inset ring-neon-purple/20"
                                            )}
                                            onClick={() => setShowSuggestions(false)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-foreground group-hover:text-neon-cyan transition-colors truncate">
                                                    {highlightText(post.title, query)}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {!isLoading && query.length >= 2 && suggestions.length === 0 && blogPosts.length === 0 && (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-6 h-6 text-muted-foreground/40" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    لم نجد نتائج مطابقة تماماً
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-2 max-w-[200px] mx-auto">
                                    جرب البحث بكلمات عامة مثل 'تصميم' أو 'برمجة'
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleFullSearch()}
                                    className="mt-6 px-6 py-2 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple text-xs rounded-full transition-all border border-neon-purple/20"
                                >
                                    بحث شامل في الدليل
                                </button>
                            </div>
                        )}
                    </div>

                    {(suggestions.length > 0 || blogPosts.length > 0) && (
                        <button
                            type="button"
                            className="w-full p-3 bg-white/5 hover:bg-white/10 text-center transition-colors border-t border-white/5 group"
                            onClick={() => handleFullSearch()}
                        >
                            <span className="text-sm text-neon-purple group-hover:text-neon-cyan transition-colors flex items-center justify-center gap-2">
                                عرض كل النتائج
                                <Arrow className="w-4 h-4" />
                            </span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
