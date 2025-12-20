import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryFilters from '@/components/CategoryFilters';
import ToolsGrid from '@/components/ToolsGrid';
import AddToolModal from '@/components/AddToolModal';
import { useTools, type Category } from '@/hooks/useTools';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: tools = [], isLoading, error } = useTools(searchQuery, activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAddClick={() => setIsAddModalOpen(true)} />
      <div className="container mx-auto max-w-7xl">
        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <ToolsGrid tools={tools} isLoading={isLoading} error={error} />
      </div>
      <AddToolModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
};

export default Index;
