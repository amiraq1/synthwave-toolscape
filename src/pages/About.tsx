
import { Activity, Users, Target, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';

const About = () => {
    useSEO({
        title: 'حول نبض - دليل أدوات الذكاء الاصطناعي',
        description: 'تعرّف على نبض، منصة منتقاة لاكتشاف أفضل أدوات الذكاء الاصطناعي للعمل والإبداع.',
        keywords: 'نبض، حول، دليل أدوات الذكاء الاصطناعي، أدوات AI',
    });

    const features = [
        {
            icon: Target,
            title: 'رسالتنا',
            description: 'نجعل اكتشاف أدوات الذكاء الاصطناعي أسرع وأوضح وأكثر موثوقية للجميع.',
        },
        {
            icon: Users,
            title: 'لمن منصة نبض؟',
            description: 'للمبدعين، ورواد الأعمال، والمطورين، والكتّاب، والمصممين، والفرق التي تريد إنتاجية أعلى.',
        },
        {
            icon: Zap,
            title: 'لماذا نبض؟',
            description: 'تصنيفات دقيقة، ومقارنات عملية، وتغطية محدثة باستمرار لأدوات الذكاء الاصطناعي.',
        },
    ];

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/50">
                <div className="container mx-auto max-w-5xl px-4 py-4">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowRight className="h-5 w-5" />
                            العودة للرئيسية
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-5xl px-4 py-12 space-y-16">
                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                            <Activity className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                        عن نبض
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        نبض دليلك الذكي لاكتشاف أدوات الذكاء الاصطناعي التي تغيّر طريقة عملك وإبداعك.
                    </p>
                </section>

                {/* Features Grid */}
                <section className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="glass rounded-2xl p-8 text-center space-y-4 hover:border-neon-purple/50 transition-colors"
                        >
                            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center">
                                <feature.icon className="h-7 w-7 text-neon-purple" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{feature.title}</h2>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </section>

                {/* Story Section */}
                <section className="glass rounded-3xl p-8 md:p-12 space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">قصتنا</h2>
                    <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            بدأت نبض بفكرة بسيطة: مكان واحد للوصول إلى أفضل أدوات الذكاء الاصطناعي بدون ضوضاء.
                        </p>
                        <p>
                            مع التطور السريع لمنتجات الذكاء الاصطناعي، أصبح من الصعب متابعة ما هو مفيد فعلاً. نبض تقوم ببحث واختيار الأدوات المناسبة نيابةً عنك.
                        </p>
                        <p>
                            نؤمن أن الذكاء الاصطناعي يجب أن يكون عملياً ومتاحاً للجميع. هدفنا أن نساعدك على اتخاذ قرارات أفضل وأسرع.
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">جاهز لاستكشاف مستقبل أدوات الذكاء الاصطناعي؟</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/">
                            <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                                تصفح الأدوات
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button size="lg" variant="outline">
                                تواصل معنا
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border/50 py-8 mt-12">
                <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
                    <p>© 2026 نبض AI. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
};

export default About;
