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

const pricingOptions: { value: PricingFilter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'مجاني', label: 'مجاني' },
  { value: 'مدفوع', label: 'مدفوع' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'popular', label: 'الأكثر شعبية' },
];

const CategoryFilters = ({
  activeCategory,
  onCategoryChange,
  pricing = 'all',
  onPricingChange,
  sortBy = 'newest',
  onSortChange,
}: CategoryFiltersProps) => {
  const { t, i18n } = useTranslation();

  // Dynamic Pricing Function because we need t()
  const pOptions = [
    { value: 'all', label: t('filters.all') },
    { value: 'مجاني', label: 'مجاني' },
    { value: 'مدفوع', label: 'مدفوع' },
  ];

  const currentPricingLabel = pOptions.find(p => p.value === pricing)?.label || t('filters.all');
  const currentSortLabel = sortOptions.find(s => s.value === sortBy)?.label || 'الأحدث';

  return (
    <div className="space-y-4 py-6 sm:py-8 px-4" dir={i18n.dir()}>
      {/* Category Tabs */}
      <nav aria-label="تصفية حسب الفئات" className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            aria-pressed={activeCategory === category}
            className={cn(
              "min-h-[44px] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 touch-manipulation",
              activeCategory === category
                ? "bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground shadow-lg glow-purple"
                : "glass text-muted-foreground hover:text-foreground hover:border-neon-purple/50"
            )}
          >
            {category}
          </button>
        ))}
      </nav>

      {/* Advanced Filters Row */}
      {(onPricingChange || onSortChange) && (
        <div className="flex flex-wrap justify-center items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">تصفية:</span>
          </div>

          {/* Pricing Filter */}
          {onPricingChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 h-9 border-white/10 bg-card/30 hover:bg-card/50",
                    pricing !== 'all' && "border-neon-purple/50 text-neon-purple"
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
                    className={cn(
                      "cursor-pointer",
                      pricing === option.value && "bg-neon-purple/10 text-neon-purple"
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Sort Filter */}
          {onSortChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 h-9 border-white/10 bg-card/30 hover:bg-card/50",
                    sortBy !== 'newest' && "border-neon-purple/50 text-neon-purple"
                  )}
                >
                  ترتيب: {currentSortLabel}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[140px]">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={cn(
                      "cursor-pointer",
                      sortBy === option.value && "bg-neon-purple/10 text-neon-purple"
                    )}
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
