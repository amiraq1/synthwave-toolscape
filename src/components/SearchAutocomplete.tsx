import { useState, useEffect, useRef, useId } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router-dom";
import { Search, Loader2, ArrowRight, ArrowLeft, Sparkles, Command, BookOpen, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const DEFAULT_EN_SUGGESTIONS = [
    "design",
    "coding",
    "content writing",
    "ai assistant",
    "marketing",
    "education",
    "audio",
    "video"
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
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const [internalQuery, setInternalQuery] = useState("");
    const query = value !== undefined ? value : internalQuery;

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const debouncedQuery = useDebounce(query, 500);
    const keywordSource = quickSuggestions && quickSuggestions.length > 0
        ? quickSuggestions
        : (isAr ? DEFAULT_AR_SUGGESTIONS : DEFAULT_EN_SUGGESTIONS);
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
        (document.activeElement as HTMLElement)?.blur();
    };

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
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={shouldShowDropdown}
                    aria-controls={listboxId}
                    aria-label={placeholder || t('search.placeholder')}
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
                                ? (isAr ? "جاري التفكير..." : "Thinking...")
                                : (isAr ? "اقتراحات البحث" : "Search Suggestions")}
                        </span>
                        {isLoading && query.length >= 2 && <Loader2 className="w-3 h-3 animate-spin text-neon-purple" />}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {keywordSuggestions.length > 0 && (
                            <div className="py-3 px-4 border-b border-white/5">
                                <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                                    {isAr ? "كلمات مقترحة" : "Suggested Keywords"}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {keywordSuggestions.map((keyword) => (
                                        <button
                                            key={keyword}
                                            type="button"
                                            className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-foreground/90 hover:border-neon-purple/40 hover:bg-neon-purple/10 hover:text-neon-purple transition-colors"
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
                                    {isAr ? "الأدوات" : "Tools"}
                                </div>
                                {suggestions.map((tool) => {
                                    const displayTitle = isAr ? tool.title : (tool.title_en || tool.title);
                                    const desc = isAr ? tool.description : (tool.description_en || tool.description);

                                    return (
                                        <Link
                                            key={tool.id}
                                            id={`${listboxId}-tool-${tool.id}`}
                                            role="option"
                                            to={`/tool/${tool.id}`}
                                            className="block p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group relative overflow-hidden"
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
                                    {isAr ? "من المدونة" : "From Blog"}
                                </div>
                                {blogPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        id={`${listboxId}-post-${post.id}`}
                                        role="option"
                                        to={`/blog/${post.slug}`}
                                        className="block p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
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
                                ))}
                            </div>
                        )}

                        {!isLoading && query.length >= 2 && suggestions.length === 0 && blogPosts.length === 0 && (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-6 h-6 text-muted-foreground/40" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    {isAr ? "لم نجد نتائج مطابقة تماماً" : "No direct matches found"}
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-2 max-w-[200px] mx-auto">
                                    {isAr ? "جرب البحث بكلمات عامة مثل 'تصميم' أو 'برمجة'" : "Try searching for general terms like 'design' or 'coding'"}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleFullSearch()}
                                    className="mt-6 px-6 py-2 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple text-xs rounded-full transition-all border border-neon-purple/20"
                                >
                                    {isAr ? "بحث شامل في الدليل" : "Search entire directory"}
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
                                {isAr ? "عرض كل النتائج" : "View All Results"}
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
