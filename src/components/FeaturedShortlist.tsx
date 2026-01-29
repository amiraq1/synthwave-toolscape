
import { useTools, Tool } from '@/hooks/useTools';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FeaturedShortlist = () => {
    const { data } = useTools({ searchQuery: '', category: 'الكل' });
    const navigate = useNavigate();
    const { t } = useTranslation();

    // استخراج أفضل الأدوات (المميزة)
    const featuredTools = data?.pages?.[0]?.filter((t: Tool) => t.is_featured).slice(0, 4) || [];

    if (featuredTools.length === 0) return null;

    return (
        <section className="py-12 px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8 relative">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue mb-2 flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        اختيارات المحرر
                    </h2>
                    <p className="text-muted-foreground">أفضل الأدوات المختارة لك بعناية لهذا الأسبوع</p>
                </div>
                <Button
                    variant="ghost"
                    className="hidden sm:flex items-center gap-2 hover:text-neon-purple"
                    onClick={() => navigate('/tools')}
                >
                    عرض الكل <ArrowLeft className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTools.map((tool: Tool) => (
                    <Card
                        key={tool.id}
                        className="group relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm hover:border-neon-purple/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        onClick={() => navigate(`/tool/${tool.id}`)}
                    >
                        {/* Image Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                        {/* Background Image */}
                        <div className="h-48 w-full overflow-hidden">
                            <img
                                src={tool.image_url || '/placeholder.svg'}
                                alt={tool.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        <CardContent className="absolute bottom-0 left-0 right-0 z-20 p-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/20">
                                    {tool.category}
                                </span>
                                {tool.pricing_type === 'Free' && (
                                    <span className="text-xs font-medium text-green-400">مجاني</span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{tool.title}</h3>
                            <p className="text-xs text-gray-300 line-clamp-2 mb-2 opacity-90">{tool.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
                <Button
                    variant="outline"
                    className="w-full border-neon-purple/30 text-neon-purple"
                    onClick={() => navigate('/tools')}
                >
                    استكشف المزيد من الأدوات
                </Button>
            </div>
        </section>
    );
};

export default FeaturedShortlist;
