import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryFilters from '@/components/CategoryFilters';
import ToolsGrid from '@/components/ToolsGrid';
import AddToolModal from '@/components/AddToolModal';
import Footer from '@/components/Footer';
import { useTools, type Category } from '@/hooks/useTools';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: tools = [], isLoading, error } = useTools(searchQuery, activeCategory);

  const handleAddClick = () => {
    if (!user) {
      toast({
        title: 'يجب تسجيل الدخول للمشاركة',
        description: 'سجل دخولك لإضافة أداة جديدة',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onAddClick={handleAddClick} />
      <main role="main" className="container mx-auto max-w-7xl flex-1">
        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <section aria-label="تصفية الأدوات حسب الفئة">
          <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </section>
        <section aria-label="شبكة الأدوات">
          <ToolsGrid tools={tools} isLoading={isLoading} error={error} />
        </section>
      </main>
      <Footer />
      <AddToolModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
};

export default Index;
