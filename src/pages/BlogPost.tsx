import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import PostBookmarkButton from "@/components/PostBookmarkButton";

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">المقال غير موجود</h1>
        <Link to="/"><Button>العودة للرئيسية</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 1. صورة الغلاف والعنوان (Hero Section) */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        {post.image_url ? (
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-blue-900/20" />
        )}
        
        <div className="absolute bottom-0 right-0 w-full p-4 md:p-8 z-20 container mx-auto">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors bg-black/30 w-fit px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            عودة للمدونة
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight max-w-4xl shadow-black drop-shadow-lg">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
              <Calendar className="w-4 h-4 text-neon-purple" />
              <span>{format(new Date(post.created_at), "d MMMM yyyy", { locale: ar })}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
              <User className="w-4 h-4 text-neon-purple" />
              <span>فريق نبض AI</span>
            </div>
            {post.reading_time && (
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                <Clock className="w-4 h-4 text-neon-purple" />
                <span>{post.reading_time} دقائق قراءة</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. محتوى المقال */}
      <article className="container mx-auto px-4 mt-12 max-w-3xl">
        <div className="prose prose-lg prose-invert mx-auto">
          {/* تحويل النص العادي إلى فقرات منسقة */}
          {post.content?.split('\n').map((paragraph: string, index: number) => (
            paragraph.trim() && (
              <p key={index} className="text-gray-300 leading-relaxed mb-6 text-lg">
                {paragraph}
              </p>
            )
          ))}
        </div>

        {/* 3. خاتمة ومشاركة */}
        <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
          <div className="text-gray-400">هل أعجبك المقال؟</div>
          <div className="flex items-center gap-3">
            <PostBookmarkButton postId={post.id} />
            <Button 
              variant="outline" 
              className="gap-2 border-neon-purple/50 hover:bg-neon-purple/10"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("تم نسخ الرابط!");
              }}
            >
              <Share2 className="w-4 h-4" />
              مشاركة الرابط
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
