import { Loader2, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ToolCard from '@/components/ToolCard';
import { useBookmarkedTools } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { Tool } from '@/hooks/useTools';
import { useTranslation } from 'react-i18next';

const Bookmarks = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const { user } = useAuth();
    const { data: tools, isLoading, error } = useBookmarkedTools();

    // Redirect to auth if not logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col" dir={isAr ? "rtl" : "ltr"}>
                <main className="flex-1 container mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-rose-500" />
                        </div>
                        <h1 className="text-3xl font-bold">{isAr ? "المحفوظات" : "Bookmarks"}</h1>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            {isAr ? "سجّل الدخول لحفظ أدواتك المفضلة والوصول إليها في أي وقت." : "Sign in to save your favorite tools and access them anytime."}
                        </p>
                        <Button
                            onClick={() => navigate('/auth')}
                            className="mt-6 bg-gradient-to-r from-neon-purple to-neon-blue"
                        >
                            {isAr ? "تسجيل الدخول" : "Login"}
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col" dir={isAr ? "rtl" : "ltr"}>
            <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">{isAr ? "المحفوظات" : "Bookmarks"}</h1>
                        <p className="text-muted-foreground">{isAr ? "الأدوات التي حفظتها" : "Tools you saved"}</p>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20 min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
                            <span className="text-muted-foreground animate-pulse">{isAr ? "جاري تحميل المحفوظات..." : "Loading bookmarks..."}</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center">
                        <div className="bg-destructive/10 p-4 rounded-full mb-4">
                            <Heart className="h-8 w-8 text-destructive" />
                        </div>
                        <p className="text-xl font-bold text-destructive mb-2">{isAr ? "خطأ" : "Error"}</p>
                        <p className="text-muted-foreground">{isAr ? "فشل تحميل المحفوظات" : "Failed to load bookmarks"}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && (!tools || tools.length === 0) && (
                    <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center">
                        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <p className="text-xl font-semibold text-foreground">{isAr ? "لا توجد أدوات محفوظة بعد" : "No saved tools yet"}</p>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                            {isAr ? "اضغط على أيقونة القلب في أي أداة لحفظها هنا." : "Tap the heart icon on any tool to save it here."}
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="mt-6 gap-2"
                        >
                            <Search className="w-4 h-4" />
                            {isAr ? "استكشاف الأدوات" : "Explore Tools"}
                        </Button>
                    </div>
                )}

                {/* Tools Grid */}
                {!isLoading && !error && tools && tools.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {tools.map((tool, index) => (
                            <ToolCard key={tool.id} tool={tool as Tool} index={index} />
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
};

export default Bookmarks;
