import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface BookmarkButtonProps {
  toolId: string | number;
  className?: string;
}

const BookmarkButton = ({ toolId, className }: BookmarkButtonProps) => {
  const { session } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ensure we always work with a number for the DB
  const numericToolId = Number(toolId);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      if (!session || isNaN(numericToolId)) {
        if (mounted) setIsSaved(false);
        return;
      }

      try {
        const { data, error } = await (supabase
          .from("bookmarks" as any)
          .select("tool_id")
          .eq("user_id", session.user.id)
          .eq("tool_id", numericToolId)
          .maybeSingle() as any);

        if (error) {
          console.error("Bookmark check error:", error);
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
  }, [numericToolId, session]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("سجل دخولك لحفظ الأدوات 🔐");
      return;
    }

    if (isNaN(numericToolId)) {
      console.error("Invalid tool ID");
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        const { error } = await (supabase
          .from("bookmarks" as any)
          .delete()
          .eq("user_id", session.user.id)
          .eq("tool_id", numericToolId) as any);

        if (error) throw error;

        setIsSaved(false);
        toast.success("تمت الإزالة من المفضلة");
      } else {
        const { error } = await (supabase
          .from("bookmarks" as any)
          .insert({ user_id: session.user.id, tool_id: numericToolId } as any) as any);

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
