import { Star } from 'lucide-react';
import { useToolRatings } from '@/hooks/useReviews';

interface AverageRatingProps {
  toolId: number;
  size?: 'sm' | 'md';
}

const AverageRating = ({ toolId, size = 'sm' }: AverageRatingProps) => {
  const { data: ratings } = useToolRatings();
  
  const toolRating = ratings?.[toolId];
  
  if (!toolRating) return null;

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-1" dir="ltr">
      <Star className={`${iconSize} fill-yellow-400 text-yellow-400`} />
      <span className={`${textSize} font-medium text-foreground`}>
        {toolRating.average_rating.toFixed(1)}
      </span>
      <span className={`${textSize} text-muted-foreground`}>
        ({toolRating.review_count})
      </span>
    </div>
  );
};

export default AverageRating;
