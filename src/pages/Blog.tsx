import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "@/components/BlogCard";
import { Loader2, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BlogPost } from "@/types";

const Blog = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) setPosts(data);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) return (
    <div className="flex justify-center mt-20">
      <Loader2 className="animate-spin text-neon-purple" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      {/* هيدر بسيط للمدونة */}
      <div className="bg-black/40 border-b border-white/5 py-12 mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 text-white">
            <BookOpen className="text-neon-purple" />
            {t('nav.blog')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {isAr
              ? "أحدث المقالات والأخبار حول أدوات الذكاء الاصطناعي، شروحات، ونصائح حصرية."
              : "Latest articles and news about AI tools, tutorials, and exclusive tips."
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-2">
              {isAr ? "لا توجد مقالات بعد" : "No articles yet"}
            </h2>
            <p className="text-gray-400">
              {isAr
                ? "نحن نكتب مقالات رائعة حالياً، عد قريباً! ✍️"
                : "We're working on amazing articles, check back soon! ✍️"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
