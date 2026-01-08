import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router-dom";
import { Search, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchAutocompleteProps {
    onSearch?: (query: string) => void;
}

const SearchAutocomplete = ({ onSearch }: SearchAutocompleteProps) => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // استخدام الـ hook الذي أنشأناه (تأخير 300ms)
    const debouncedQuery = useDebounce(query, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // البحث في قاعدة البيانات عند تغير debouncedQuery
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            const { data } = await supabase
                .from("tools")
                .select("id, title, title_en, category, pricing_type")
                .or(`title.ilike.%${debouncedQuery}%,title_en.ilike.%${debouncedQuery}%`)
                .eq("is_published", true)
                .limit(5);

            if (data) setSuggestions(data);
            setIsLoading(false);
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    // إخفاء القائمة عند النقر خارجها
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFullSearch = () => {
        if (onSearch) {
            onSearch(query);
        }
        setShowSuggestions(false);
    };

    const Arrow = isAr ? ArrowLeft : ArrowRight;

    return (
        <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-50">

            {/* 1. حقل الإدخال */}
            <div className="relative group">
                <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-neon-purple animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-neon-purple transition-colors" />
                    )}
                </div>
                <input
                    type="text"
                    dir={isAr ? "rtl" : "ltr"}
                    className={`w-full ${isAr ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-4 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:bg-black/60 transition-all shadow-lg`}
                    placeholder={t('search.placeholder')}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                />
            </div>

            {/* 2. قائمة الاقتراحات المنسدلة */}
            {showSuggestions && (query.length >= 2) && (
                <div
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e]/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
                    dir={isAr ? "rtl" : "ltr"}
                >
                    {suggestions.length > 0 ? (
                        <>
                            {suggestions.map((tool) => {
                                const displayTitle = isAr ? tool.title : (tool.title_en || tool.title);
                                return (
                                    <Link
                                        key={tool.id}
                                        to={`/tool/${tool.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                                        onClick={() => setShowSuggestions(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-neon-purple/10 flex items-center justify-center text-neon-purple font-bold text-sm">
                                                {displayTitle.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-neon-purple transition-colors">
                                                    {displayTitle}
                                                </h4>
                                                <span className="text-xs text-gray-400">{tool.category}</span>
                                            </div>
                                        </div>
                                        <Arrow className="w-4 h-4 text-gray-500 group-hover:text-white -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                    </Link>
                                );
                            })}
                            <div className="p-2 bg-black/20 text-center">
                                <button
                                    className="text-xs text-neon-purple hover:underline"
                                    onClick={handleFullSearch}
                                >
                                    {isAr
                                        ? `عرض كل النتائج لـ "${query}"`
                                        : `View all results for "${query}"`
                                    }
                                </button>
                            </div>
                        </>
                    ) : (
                        !isLoading && (
                            <div className="p-6 text-center text-gray-500">
                                {isAr
                                    ? "لا توجد أدوات بهذا الاسم حالياً 😔"
                                    : "No tools found with this name 😔"
                                }
                                <br />
                                <span className="text-xs">
                                    {isAr
                                        ? 'جرب البحث عن "تصنيف" بدلاً من اسم'
                                        : 'Try searching for a category instead'
                                    }
                                </span>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
