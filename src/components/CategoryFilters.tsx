import { categories, type Category } from '@/hooks/useTools';
import { cn } from '@/lib/utils';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

export type PricingFilter = 'all' | 'مجاني' | 'مدفوع';
export type SortOption = 'newest' | 'rating' | 'popular';

interface CategoryFiltersProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  pricing?: PricingFilter;
  onPricingChange?: (pricing: PricingFilter) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const categoryLabelsEn: Record<Category, string> = {
  'الكل': 'All',
  'توليد نصوص': 'Text Generation',
  'توليد صور وفيديو': 'Image & Video Generation',
  'مساعدات إنتاجية': 'Productivity Assistants',
  'صناعة محتوى': 'Content Creation',
  'تطوير وبرمجة': 'Development & Coding',
  'تعليم وبحث': 'Education & Research',
  'أخرى': 'Other',
};

const CategoryFilters = ({
  activeCategory,
  onCategoryChange,
  pricing = 'all',
  onPricingChange,
  sortBy = 'newest',
  onSortChange,
}: CategoryFiltersProps) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const pricingOptions: { value: PricingFilter; label: string }[] = [
    { value: 'all', label: isAr ? 'الكل' : 'All' },
    { value: 'مجاني', label: isAr ? 'مجاني' : 'Free' },
    { value: 'مدفوع', label: isAr ? 'مدفوع' : 'Paid' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: isAr ? 'الأحدث' : 'Newest' },
    { value: 'rating', label: isAr ? 'الأعلى تقييماً' : 'Highest Rated' },
    { value: 'popular', label: isAr ? 'الأكثر شعبية' : 'Most Popular' },
  ];

  const currentPricingLabel = pricingOptions.find((p) => p.value === pricing)?.label || (isAr ? 'الكل' : 'All');
  const currentSortLabel = sortOptions.find((s) => s.value === sortBy)?.label || (isAr ? 'الأحدث' : 'Newest');

  const getCategoryLabel = (category: Category) => (isAr ? category : categoryLabelsEn[category] || category);

  return (
    <div className="space-y-4 py-6 sm:py-8 px-4" dir={i18n.dir()}>
      <nav aria-label={isAr ? 'Filter by categories' : 'Filter by categories'} className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((category) => {
          let icon = null;
          if (category === 'الكل') icon = <span className="text-lg">🌍</span>;
          if (category.includes('نصوص')) icon = <span className="text-lg">📝</span>;
          if (category.includes('صور')) icon = <span className="text-lg">🎨</span>;
          if (category.includes('برمجة')) icon = <span className="text-lg">💻</span>;
          if (category.includes('إنتاجية')) icon = <span className="text-lg">🚀</span>;
          if (category.includes('محتوى')) icon = <span className="text-lg">📹</span>;
          if (category.includes('تعليم')) icon = <span className="text-lg">🎓</span>;
          if (category.includes('أخرى')) icon = <span className="text-lg">💡</span>;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              aria-pressed={activeCategory === category}
              className={cn(
                'min-h-[44px] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 touch-manipulation flex items-center gap-2',
                activeCategory === category
                  ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground shadow-lg glow-purple scale-105'
                  : 'glass text-muted-foreground hover:text-foreground hover:border-neon-purple/50 active:scale-95'
              )}
            >
              {icon}
              {getCategoryLabel(category)}
            </button>
          );
        })}
      </nav>

      {(onPricingChange || onSortChange) && (
        <div className="flex flex-wrap justify-center items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{isAr ? 'تصفية:' : 'Filters:'}</span>
          </div>

          {onPricingChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'gap-2 h-9 border-white/10 bg-card/30 hover:bg-card/50',
                    pricing !== 'all' && 'border-neon-purple/50 text-neon-purple'
                  )}
                >
                  {currentPricingLabel}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[120px]">
                {pricingOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onPricingChange(option.value)}
                    className={cn('cursor-pointer', pricing === option.value && 'bg-neon-purple/10 text-neon-purple')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onSortChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'gap-2 h-9 border-white/10 bg-card/30 hover:bg-card/50',
                    sortBy !== 'newest' && 'border-neon-purple/50 text-neon-purple'
                  )}
                >
                  {isAr ? 'ترتيب:' : 'Sort:'} {currentSortLabel}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[140px]">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={cn('cursor-pointer', sortBy === option.value && 'bg-neon-purple/10 text-neon-purple')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;
