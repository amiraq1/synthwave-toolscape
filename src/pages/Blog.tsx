import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "@/components/BlogCard";
import { useTranslation } from "react-i18next";
import type { BlogPost } from "@/types";
import { EditorialHero, EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

const Blog = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) setPosts(data as unknown as BlogPost[]);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <EditorialPage>
      <EditorialHero
        eyebrow={t("nav.blog")}
        title={t("blog.title")}
        description={t("blog.subtitle")}
        icon={<BookOpen className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">EDITORIAL</span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              مقالات مختصرة وعملية عن أدوات AI، الاستخدامات، والفروقات التي تهم فعلًا.
            </h2>
            <p className="text-sm leading-7 text-white/70">
              لا نريد مدونة مكتظة. الفكرة هنا أن تكون المقالات امتدادًا للدليل: أوضح، أهدأ، وأكثر فائدة عند اتخاذ القرار.
            </p>
          </div>
        }
      />

      <EditorialPanel>
        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-slate-950" />
            <p className="text-sm text-slate-600">{t("blog.loading")}</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-black/8 bg-white/75 text-center">
            <h2 className="font-editorial text-3xl font-semibold text-slate-950">{t("blog.no_posts")}</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">{t("blog.no_posts_desc")}</p>
          </div>
        )}
      </EditorialPanel>
    </EditorialPage>
  );
};

export default Blog;
