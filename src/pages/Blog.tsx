import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2, Plus, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AddPostModal from '@/components/AddPostModal';
import { useAuth } from '@/hooks/useAuth';

interface Post {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
    is_published: boolean;
}

const Blog = () => {
    const [addPostOpen, setAddPostOpen] = useState(false);
    const { user } = useAuth();

    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('posts')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Post[];
        },
    });

    const getExcerpt = (content: string, maxLength: number = 150) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).trim() + '...';
    };

    return (
        <div className="min-h-screen bg-background flex flex-col" dir="rtl">
            <Navbar onAddClick={() => setAddPostOpen(true)} />

            <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">المدونة</h1>
                        <p className="text-muted-foreground">أحدث المقالات والأخبار عن الذكاء الاصطناعي</p>
                    </div>

                    {user && (
                        <Button
                            onClick={() => setAddPostOpen(true)}
                            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            مقال جديد
                        </Button>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20 min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
                            <span className="text-muted-foreground animate-pulse">جاري تحميل المقالات...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center">
                        <div className="bg-destructive/10 p-4 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-destructive" />
                        </div>
                        <p className="text-xl font-bold text-destructive mb-2">حدث خطأ</p>
                        <p className="text-muted-foreground">فشل في تحميل المقالات</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && posts?.length === 0 && (
                    <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4 text-3xl opacity-50">
                            📝
                        </div>
                        <p className="text-xl font-semibold text-foreground">لا توجد مقالات حالياً</p>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                            كن أول من يشارك مقالاً!
                        </p>
                        {user && (
                            <Button
                                onClick={() => setAddPostOpen(true)}
                                className="mt-6 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                أضف أول مقال
                            </Button>
                        )}
                    </div>
                )}

                {/* Posts Grid */}
                {!isLoading && !error && posts && posts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="group glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-neon-purple/30 transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/10"
                            >
                                {/* Image */}
                                {post.image_url && (
                                    <div className="aspect-video overflow-hidden bg-muted/20">
                                        <img
                                            src={post.image_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-5">
                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                        <Calendar className="w-3 h-3" />
                                        <time dateTime={post.created_at}>
                                            {format(new Date(post.created_at), 'PPP', { locale: ar })}
                                        </time>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-neon-purple transition-colors">
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {getExcerpt(post.content)}
                                    </p>

                                    {/* Read More */}
                                    <button className="mt-4 text-sm font-medium text-neon-purple hover:text-neon-blue transition-colors">
                                        قراءة المزيد ←
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            <AddPostModal open={addPostOpen} onOpenChange={setAddPostOpen} />
        </div>
    );
};

export default Blog;
