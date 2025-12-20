import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import CategoryFilters from '@/components/CategoryFilters';
import ToolsGrid from '@/components/ToolsGrid';
import { useTools, type Category } from '@/hooks/useTools';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');

  const { data: tools = [], isLoading, error } = useTools(searchQuery, activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl">
        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <ToolsGrid tools={tools} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default Index;
