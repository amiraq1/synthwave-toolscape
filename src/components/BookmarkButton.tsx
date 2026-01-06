import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface BookmarkButtonProps {
  toolId: number;
  className?: string;
}

const BookmarkButton = ({ toolId, className }: BookmarkButtonProps) => {
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
          .from("bookmarks")
          .select("tool_id")
          .eq("user_id", session.user.id)
          .eq("tool_id", toolId)
          .maybeSingle();

        if (error) {
          console.error("Bookmark check error:", error);
          // don't show toast on mount check to avoid noisy UX
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
  }, [toolId, session]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("سجل دخولك لحفظ الأدوات 🔐");
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", session.user.id)
          .eq("tool_id", toolId);

        if (error) throw error;

        setIsSaved(false);
        toast.success("تمت الإزالة من المفضلة");
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: session.user.id, tool_id: toolId });

        if (error) throw error;

        setIsSaved(true);
        toast.success("تم الحفظ في مكتبتك 📚");
      }
    } catch (err: any) {
      console.error("Bookmark toggle error:", err);
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
        className={`w-5 h-5 transition-all ${isSaved ? "fill-neon-purple text-neon-purple scale-110" : "text-gray-400"
          }`}
      />
    </Button>
  );
};

export default BookmarkButton;
