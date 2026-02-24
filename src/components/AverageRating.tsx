import { Star } from 'lucide-react';

interface AverageRatingProps {
  rating?: number;
  count?: number;
  toolId?: number;
  size?: 'sm' | 'md' | 'lg';
}

const AverageRating = ({ rating, count, size = 'sm' }: AverageRatingProps) => {
  if (rating === undefined || rating === null) return null;

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg';

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
