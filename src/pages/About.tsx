import { Activity, Users, Target, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useSEO({
    title: isAr ? 'حول نبض - دليل أدوات الذكاء الاصطناعي' : 'About Nabd - AI Tools Directory',
    description: isAr
      ? 'تعرف على نبض، الدليل العربي الشامل لأفضل أدوات الذكاء الاصطناعي.'
      : 'Learn about Nabd, the Arabic-first directory for top AI tools.',
    keywords: isAr
      ? 'نبض، حول، دليل الذكاء الاصطناعي، أدوات AI، من نحن'
      : 'Nabd, about, AI tools directory, who we are',
  });

  const features = [
    {
      icon: Target,
      title: isAr ? 'مهمتنا' : 'Our Mission',
      description: isAr
        ? 'تسهيل اكتشاف أدوات الذكاء الاصطناعي للمستخدم العربي وتوفير دليل شامل ومحدث.'
        : 'Make AI tool discovery easier with an up-to-date and practical directory.',
    },
    {
      icon: Users,
      title: isAr ? 'لمن نبض؟' : 'Who Is Nabd For?',
      description: isAr
        ? 'للمبدعين، رواد الأعمال، المطورين، الكتّاب، المصممين، وكل من يريد تعزيز إنتاجيته.'
        : 'Creators, founders, developers, writers, designers, and anyone improving productivity.',
    },
    {
      icon: Zap,
      title: isAr ? 'لماذا نبض؟' : 'Why Nabd?',
      description: isAr
        ? 'نقدم تصنيفات دقيقة، تقييمات حقيقية، ومعلومات محدثة عن أحدث أدوات AI.'
        : 'Accurate categories, real ratings, and updated information about the latest AI tools.',
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowRight className={`h-5 w-5 ${isAr ? '' : 'rotate-180'}`} />
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-16">
        <section className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <Activity className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            {isAr ? 'حول نبض' : 'About Nabd'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'نبض هو دليلك الذكي لاكتشاف أفضل أدوات الذكاء الاصطناعي التي ستغير طريقة عملك وإبداعك.'
              : 'Nabd is your smart guide to discover AI tools that can transform your workflow and creativity.'}
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass rounded-2xl p-8 text-center space-y-4 hover:border-neon-purple/50 transition-colors">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center">
                <feature.icon className="h-7 w-7 text-neon-purple" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{feature.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="glass rounded-3xl p-8 md:p-12 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">{isAr ? 'قصتنا' : 'Our Story'}</h2>
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>
              {isAr
                ? 'بدأ نبض كفكرة بسيطة: توفير مكان واحد يجمع أفضل أدوات الذكاء الاصطناعي للمستخدم العربي.'
                : 'Nabd started as a simple idea: one place that gathers the best AI tools for Arabic users.'}
            </p>
            <p>
              {isAr
                ? 'مع تسارع تطور أدوات AI، أصبح من الصعب متابعة الجديد واختيار الأداة المناسبة. نحن نقوم بذلك نيابة عنك.'
                : 'With fast AI updates, it is hard to track what matters and pick the right tool. We do that work for you.'}
            </p>
            <p>
              {isAr
                ? 'نؤمن بأن الذكاء الاصطناعي يجب أن يكون متاحاً للجميع، ونبني محتوى عربي عملي وعالي الجودة.'
                : 'We believe AI should be accessible to everyone, with practical and high-quality content.'}
            </p>
          </div>
        </section>

        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            {isAr ? 'هل أنت مستعد لاستكشاف أدوات المستقبل؟' : 'Ready to explore future tools?'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                {isAr ? 'تصفح الأدوات' : 'Browse Tools'}
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                {isAr ? 'تواصل معنا' : 'Contact Us'}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
          <p>{isAr ? '© 2024 نبض AI. جميع الحقوق محفوظة.' : '© 2024 Nabd AI. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
