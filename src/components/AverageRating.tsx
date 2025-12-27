import { Star } from 'lucide-react';
import { useToolRatings } from '@/hooks/useReviews';

interface AverageRatingProps {
  rating?: number;
  count?: number;
  // Keep toolId for backward compatibility if needed, or remove it.
  // We'll make it optional for now to avoid breaking other files immediately if they haven't been updated,
  // but the logic will rely on `rating`.
  toolId?: number;
  size?: 'sm' | 'md';
}

const AverageRating = ({ rating, count, size = 'sm' }: AverageRatingProps) => {
  // If no rating is provided (or it's 0), we don't show anything or show 0
  if (rating === undefined || rating === null) return null;

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-1" dir="ltr">
      <Star className={`${iconSize} fill-yellow-400 text-yellow-400`} />
      <span className={`${textSize} font-medium text-foreground`}>
        {Number(rating).toFixed(1)}
      </span>
      <span className={`${textSize} text-muted-foreground`}>
        ({count || 0})
      </span>
    </div>
  );
};

export default AverageRating;
