import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AverageRatingProps {
  rating?: number | null;
  count?: number | null;
  toolId?: number | string;
  size?: 'sm' | 'md';
}

const AverageRating = ({ rating, count, size = 'sm' }: AverageRatingProps) => {
  const { i18n } = useTranslation();
  if (rating === undefined || rating === null) return null;

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-1" dir={i18n.dir()}>
      <Star className={`${iconSize} fill-yellow-400 text-yellow-400`} />
      <span className={`${textSize} font-medium text-foreground`}>
        {Number(rating).toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </span>
      <span className={`${textSize} text-muted-foreground`}>
        ({(count || 0).toLocaleString(i18n.language)})
      </span>
    </div>
  );
};

export default AverageRating;
