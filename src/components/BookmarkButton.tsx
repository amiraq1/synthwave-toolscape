import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmark } from "@/hooks/useBookmark";

interface BookmarkButtonProps {
  toolId: string | number;
  className?: string;
}

const BookmarkButton = ({ toolId, className }: BookmarkButtonProps) => {
  const numericToolId = Number(toolId);
  const { isSaved, toggleBookmark, isMutating } = useBookmark(numericToolId);

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
      disabled={isMutating && false} // We don't want to disable, we want it to feel instant
      aria-pressed={isSaved}
      aria-label={isSaved ? "إزالة من المفضلة" : "حفظ في المفضلة"}
      title={isSaved ? "إزالة من المفضلة" : "حفظ في المفضلة"}
    >
      <Bookmark
        className={`w-5 h-5 transition-all duration-300 ${isSaved ? "fill-neon-purple text-neon-purple scale-110" : "text-gray-400"
          } ${isMutating ? "animate-pulse" : ""}`}
      />
    </Button>
  );
};

export default BookmarkButton;

