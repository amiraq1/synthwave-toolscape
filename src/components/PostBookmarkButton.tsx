import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface PostBookmarkButtonProps {
  postId: string;
  className?: string;
}

const PostBookmarkButton = ({ postId, className }: PostBookmarkButtonProps) => {
  const { session } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      if (!session) {
        if (mounted) setIsSaved(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("post_bookmarks")
          .select("post_id")
          .eq("user_id", session.user.id)
          .eq("post_id", postId)
          .maybeSingle();

        if (error) {
          console.error("Post bookmark check error:", error);
        }

        if (mounted) setIsSaved(!!data);
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    return () => {
      mounted = false;
    };
  }, [postId, session]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("سجل دخولك لحفظ المقالات 🔐");
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from("post_bookmarks")
          .delete()
          .eq("user_id", session.user.id)
          .eq("post_id", postId);

        if (error) throw error;

        setIsSaved(false);
        toast.success("تمت الإزالة من المفضلة");
      } else {
        const { error } = await supabase
          .from("post_bookmarks")
          .insert({ user_id: session.user.id, post_id: postId });

        if (error) throw error;

        setIsSaved(true);
        toast.success("تم الحفظ في مكتبتك 📚");
      }
    } catch (err: any) {
      console.error("Post bookmark toggle error:", err);
      const msg = err?.message || "حدث خطأ. حاول مرة أخرى.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full hover:bg-white/10 ${className}`}
      onClick={toggleSave}
      disabled={loading}
      aria-pressed={isSaved}
      title={isSaved ? "إزالة من المفضلة" : "حفظ في المفضلة"}
    >
      <Bookmark
        className={`w-5 h-5 transition-all ${
          isSaved ? "fill-neon-purple text-neon-purple scale-110" : "text-gray-400"
        }`}
      />
    </Button>
  );
};

export default PostBookmarkButton;
