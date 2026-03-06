import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye, Loader2, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import PostBookmarkButton from "@/components/PostBookmarkButton";
import CommentsSection from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { getSupabaseFunctionsBaseUrl } from "@synthwave/utils";
import { EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

interface Post {
  id: string;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  excerpt?: string;
  excerpt_en?: string;
  image_url: string | null;
  created_at: string;
  reading_time?: number;
  views_count?: number;
  is_published?: boolean;
}

const BlogPost = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isRtl = i18n.dir() === "rtl";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const displayTitle = post ? (i18n.language === "en" && post.title_en ? post.title_en : post.title) : "";
  const displayContent = post ? (i18n.language === "en" && post.content_en ? post.content_en : post.content) : "";
  const displayExcerpt = post ? (i18n.language === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt) : "";

  useEffect(() => {
    dayjs.locale(i18n.language.startsWith("ar") ? "ar" : "en");
  }, [i18n.language]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setPost(data);

        try {
          await supabase.rpc("increment_post_views", { p_post_id: id });
        } catch {
          console.log("Views increment skipped");
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          url,
        });
      } catch {
        return;
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: t("blog.copy_success"),
        className: "bg-green-500/10 text-green-500",
      });
    }
  };

  if (loading) {
    return (
      <EditorialPage>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-slate-950" />
        </div>
      </EditorialPage>
    );
  }

  if (!post) {
    return (
      <EditorialPage>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900/5 text-4xl">
            📄
          </div>
          <h1 className="font-editorial text-3xl font-semibold text-slate-950">{t("blog.not_found")}</h1>
          <p className="mb-6 mt-3 max-w-md text-sm leading-7 text-slate-600">{t("blog.not_found_desc")}</p>
          <Link to="/blog">
            <Button className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
              <BackArrow className="me-2 h-4 w-4" />
              {t("blog.back")}
            </Button>
          </Link>
        </div>
      </EditorialPage>
    );
  }

  const ogImageUrl = `${getSupabaseFunctionsBaseUrl()}/og-image?title=${encodeURIComponent(displayTitle)}&category=${encodeURIComponent("مدونة نبض AI")}`;

  return (
    <EditorialPage>
      <Helmet>
        <title>{displayTitle} | {t("blog.title")}</title>
        <meta name="description" content={displayExcerpt || ""} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${displayTitle} | ${t("blog.title")}`} />
        <meta property="og:description" content={displayExcerpt || ""} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="article:published_time" content={post.created_at} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={displayTitle} />
        <meta name="twitter:description" content={displayExcerpt || ""} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <EditorialPanel className="overflow-hidden p-0">
          <div className="relative h-[320px] w-full sm:h-[420px]">
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={displayTitle}
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#e7ded0] to-[#f6f1e8]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent" />
            <div className="absolute bottom-0 right-0 w-full p-6 sm:p-8">
              <Link
                to="/blog"
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/35"
              >
                <BackArrow className="h-4 w-4" />
                {t("blog.back")}
              </Link>
              <h1 className="font-editorial text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                {displayTitle}
              </h1>
            </div>
          </div>
        </EditorialPanel>

        <div className="editorial-ink-panel p-6 sm:p-7">
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">{t("blog.title")}</span>
            <div className="flex flex-wrap gap-2 text-xs text-white/75">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                <Calendar className="h-3.5 w-3.5" />
                {dayjs(post.created_at).locale(i18n.language.startsWith("ar") ? "ar" : "en").format("D MMMM YYYY")}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                <User className="h-3.5 w-3.5" />
                {t("blog.team")}
              </div>
              {post.reading_time && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                  <Clock className="h-3.5 w-3.5" />
                  {t("blog.read_time", { count: post.reading_time })}
                </div>
              )}
              {typeof post.views_count === "number" && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                  <Eye className="h-3.5 w-3.5" />
                  {t("blog.views", { count: post.views_count })}
                </div>
              )}
            </div>

            {displayExcerpt && <p className="text-sm leading-7 text-white/70">{displayExcerpt}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <PostBookmarkButton postId={post.id} />
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={handleShare}
              >
                <Share2 className="ms-2 h-4 w-4" />
                {t("blog.share_link")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <EditorialPanel>
        <article className="blog-content prose mx-auto max-w-none prose-slate lg:prose-lg">
          {displayContent?.split("\n").map((paragraph, index) =>
            paragraph.trim() ? <p key={index}>{paragraph}</p> : null
          )}
        </article>
      </EditorialPanel>

      <EditorialPanel>
        <CommentsSection postId={post.id} />
      </EditorialPanel>
    </EditorialPage>
  );
};

export default BlogPost;
