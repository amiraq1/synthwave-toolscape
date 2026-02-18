import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmark } from "@/hooks/useBookmark";
import { useTranslation } from "react-i18next";

interface BookmarkButtonProps {
  toolId: string | number;
  className?: string;
}

const BookmarkButton = ({ toolId, className }: BookmarkButtonProps) => {
  const numericToolId = Number(toolId);
  const { isSaved, toggleBookmark, isMutating } = useBookmark(numericToolId);
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const label = isSaved
    ? (isAr ? "إزالة من المفضلة" : "Remove from bookmarks")
    : (isAr ? "حفظ في المفضلة" : "Save to bookmarks");

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full hover:bg-white/10 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={isMutating && false}
      aria-pressed={isSaved}
      aria-label={label}
      title={label}
    >
      <Bookmark
        className={`w-5 h-5 transition-all duration-300 ${isSaved ? "fill-neon-purple text-neon-purple scale-110" : "text-gray-400"
          } ${isMutating ? "animate-pulse" : ""}`}
      />
    </Button>
  );
};

export default BookmarkButton;
