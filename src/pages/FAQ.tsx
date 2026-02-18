import { useEffect } from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  question: string;
  answer: string;
}

const faqAr: FAQItem[] = [
  {
    question: 'ما هو نبض AI؟',
    answer: 'نبض هو دليل عربي شامل لأفضل أدوات الذكاء الاصطناعي مع تصنيفات واضحة وتقييمات حقيقية.',
  },
  {
    question: 'هل الأدوات مجانية؟',
    answer: 'بعض الأدوات مجانية بالكامل، وبعضها مدفوع أو بنظام مجاني/مدفوع.',
  },
  {
    question: 'كيف أختار الأداة المناسبة؟',
    answer: 'حدد احتياجك أولاً، ثم استخدم التصنيفات واقرأ الوصف والتقييمات.',
  },
  {
    question: 'هل يمكنني إضافة أداة جديدة؟',
    answer: 'نعم، من زر "أضف أداة" في الصفحة الرئيسية.',
  },
];

const faqEn: FAQItem[] = [
  {
    question: 'What is Nabd AI?',
    answer: 'Nabd is an Arabic-first AI tools directory with clear categories and real ratings.',
  },
  {
    question: 'Are the tools free?',
    answer: 'Some tools are fully free, while others are paid or freemium.',
  },
  {
    question: 'How do I choose the right tool?',
    answer: 'Start with your use case, then filter by category and check descriptions and ratings.',
  },
  {
    question: 'Can I submit a new tool?',
    answer: 'Yes, use the "Add Tool" button on the homepage.',
  },
];

const FAQ = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const faqData = isAr ? faqAr : faqEn;

  useSEO({
    title: isAr ? 'الأسئلة الشائعة - نبض AI' : 'FAQ - Nabd AI',
    description: isAr
      ? 'إجابات على الأسئلة الشائعة حول نبض AI واستخدام الدليل.'
      : 'Answers to common questions about Nabd AI and using the directory.',
    keywords: isAr ? 'أسئلة شائعة، نبض، دليل الذكاء الاصطناعي' : 'FAQ, Nabd, AI tools directory',
  });

  useEffect(() => {
    const existingScript = document.querySelector('script[data-faq-schema]');
    if (existingScript) existingScript.remove();

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqData.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', 'true');
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [faqData]);

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

      <main className="container mx-auto max-w-3xl px-4 py-12 space-y-12">
        <section className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {isAr ? 'إجابات سريعة على الأسئلة الأكثر شيوعاً.' : 'Quick answers to common questions.'}
          </p>
        </section>

        <section className="glass rounded-3xl p-6 md:p-10">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-6 data-[state=open]:bg-card/50"
              >
                <AccordionTrigger className="text-right hover:no-underline py-5">
                  <span className="text-lg font-medium text-foreground">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="text-center space-y-6">
          <p className="text-muted-foreground">{isAr ? 'لم تجد إجابة لسؤالك؟' : 'Did not find your answer?'}</p>
          <Link to="/contact">
            <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
              {isAr ? 'تواصل معنا' : 'Contact us'}
            </Button>
          </Link>
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

export default FAQ;
