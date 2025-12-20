import { useState, useMemo } from 'react';
import HeroSection from '@/components/HeroSection';
import CategoryFilters from '@/components/CategoryFilters';
import ToolsGrid from '@/components/ToolsGrid';
import { tools, type Category } from '@/data/tools';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.includes(searchQuery);
      const matchesCategory = activeCategory === 'الكل' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl">
        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <ToolsGrid tools={filteredTools} />
      </div>
    </div>
  );
};

export default Index;
