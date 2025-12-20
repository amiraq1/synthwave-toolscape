import { categories, type Category } from '@/hooks/useTools';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const CategoryFilters = ({ activeCategory, onCategoryChange }: CategoryFiltersProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 py-6 sm:py-8 px-4" dir="rtl">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 touch-manipulation",
            activeCategory === category
              ? "bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground shadow-lg glow-purple"
              : "glass text-muted-foreground hover:text-foreground hover:border-neon-purple/50"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilters;
