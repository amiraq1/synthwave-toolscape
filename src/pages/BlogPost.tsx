import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Clock, User, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import PostBookmarkButton from "@/components/PostBookmarkButton";
import CommentsSection from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image_url: string | null;
  created_at: string;
  reading_time?: number;
  views_count?: number;
  is_published?: boolean;
}

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      // جلب المقال
      const { data, error } = await (supabase as any)
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setPost(data);

        // زيادة عداد المشاهدات
        try {
          await (supabase as any).rpc("increment_post_views", { p_post_id: id });
        } catch (e) {
          // تجاهل الخطأ - قد لا تكون الدالة موجودة بعد
          console.log("Views increment skipped");
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  // مشاركة الرابط
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url: url,
        });
      } catch (e) {
        // المستخدم ألغى المشاركة
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "✅ تم نسخ الرابط",
        className: "bg-green-500/10 text-green-500",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-neon-purple" />
            <span className="text-muted-foreground animate-pulse">جاري تحميل المقال...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center text-center py-20 px-4">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 text-4xl">
            📄
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">المقال غير موجود</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            عذراً، لم نتمكن من العثور على المقال المطلوب. ربما تم حذفه أو الرابط غير صحيح.
          </p>
          <Link to="/blog">
            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة للمدونة
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Navbar />

      <main className="flex-1">
        {/* 1. صورة الغلاف والعنوان (Hero Section) */}
        <div className="relative h-[300px] sm:h-[400px] md:h-[450px] w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-blue-900/20" />
          )}

          <div className="absolute bottom-0 right-0 w-full p-4 sm:p-6 md:p-8 z-20">
            <div className="container mx-auto max-w-4xl">
              {/* زر العودة */}
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 sm:mb-6 transition-colors bg-black/30 w-fit px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">عودة للمدونة</span>
                <span className="sm:hidden">رجوع</span>
              </Link>

              {/* العنوان */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                {post.title}
              </h1>

              {/* المعلومات الوصفية */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300">
                {/* التاريخ */}
                <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 sm:px-3 rounded-full backdrop-blur-md">
                  <Calendar className="w-3.5 h-3.5 text-neon-purple" />
                  <span>{format(new Date(post.created_at), "d MMMM yyyy", { locale: ar })}</span>
                </div>

                {/* الكاتب */}
                <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 sm:px-3 rounded-full backdrop-blur-md">
                  <User className="w-3.5 h-3.5 text-neon-purple" />
                  <span>فريق نبض AI</span>
                </div>

                {/* وقت القراءة */}
                {post.reading_time && (
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 sm:px-3 rounded-full backdrop-blur-md">
                    <Clock className="w-3.5 h-3.5 text-neon-purple" />
                    <span>{post.reading_time} دقائق قراءة</span>
                  </div>
                )}

                {/* عدد المشاهدات */}
                {typeof post.views_count === 'number' && (
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 sm:px-3 rounded-full backdrop-blur-md">
                    <Eye className="w-3.5 h-3.5 text-neon-purple" />
                    <span>{post.views_count.toLocaleString('ar-EG')} مشاهدة</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. محتوى المقال */}
        <article className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
          <div className="prose prose-lg prose-invert mx-auto">
            {/* تحويل النص العادي إلى فقرات منسقة */}
            {post.content?.split('\n').map((paragraph: string, index: number) => (
              paragraph.trim() && (
                <p key={index} className="text-gray-300 leading-relaxed mb-5 text-base sm:text-lg">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* 3. خاتمة ومشاركة */}
          <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-gray-400 text-sm sm:text-base">
                هل أعجبك المقال؟ شاركه مع أصدقائك!
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <PostBookmarkButton postId={post.id} />
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none gap-2 border-neon-purple/50 hover:bg-neon-purple/10"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">مشاركة الرابط</span>
                  <span className="sm:hidden">مشاركة</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 4. قسم التعليقات */}
          <CommentsSection postId={post.id} />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
