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

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: 'ما هو نبض AI؟',
        answer: 'نبض هو دليل عربي شامل لأفضل أدوات الذكاء الاصطناعي. نساعدك في اكتشاف الأدوات المناسبة لعملك وإبداعك من خلال تصنيفات واضحة وتقييمات حقيقية.',
    },
    {
        question: 'هل أدوات الذكاء الاصطناعي مجانية؟',
        answer: 'تختلف الأدوات في التسعير. بعضها مجاني بالكامل، وبعضها مدفوع، والبعض الآخر يقدم نسخة مجانية محدودة مع خيارات مدفوعة للميزات المتقدمة. نوضح نوع التسعير لكل أداة في دليلنا.',
    },
    {
        question: 'كيف أختار أداة الذكاء الاصطناعي المناسبة لي؟',
        answer: 'حدد احتياجك أولاً (نصوص، صور، فيديو، برمجة، إنتاجية)، ثم استخدم فلتر التصنيفات في موقعنا. اقرأ وصف الأداة وتقييمات المستخدمين لاتخاذ قرار مدروس.',
    },
    {
        question: 'هل يمكنني إضافة أداة جديدة للدليل؟',
        answer: 'نعم! يمكنك اقتراح أداة جديدة من خلال زر "أضف أداة" في الصفحة الرئيسية. سيتم مراجعة الأداة قبل إضافتها للدليل.',
    },
    {
        question: 'كيف يتم تقييم الأدوات؟',
        answer: 'يمكن للمستخدمين المسجلين تقييم الأدوات من 1 إلى 5 نجوم وكتابة مراجعات. نظهر متوسط التقييمات وعدد المراجعات لكل أداة.',
    },
    {
        question: 'ما هي تصنيفات الأدوات المتاحة؟',
        answer: 'نصنف الأدوات إلى: نصوص (ChatGPT، Claude Sonnet 4.5، Claude 3.5)، صور (Midjourney، DALL-E)، فيديو (Sora، Runway)، برمجة (GitHub Copilot)، وإنتاجية (Notion AI، Jasper).',
    },
    {
        question: 'هل الموقع متاح كتطبيق؟',
        answer: 'نعم! نبض هو تطبيق ويب تقدمي (PWA). يمكنك تثبيته على هاتفك أو جهازك من صفحة التثبيت للوصول السريع والاستخدام بدون إنترنت.',
    },
    {
        question: 'كيف أتواصل مع فريق نبض؟',
        answer: 'يمكنك التواصل معنا عبر صفحة "اتصل بنا" أو إرسال بريد إلكتروني إلى contact@amiraq.org. نسعد بالإجابة على استفساراتك واقتراحاتك.',
    },
];

const FAQ = () => {
    useSEO({
        title: 'الأسئلة الشائعة - نبض AI',
        description: 'إجابات على الأسئلة الشائعة حول نبض AI ودليل أدوات الذكاء الاصطناعي. تعرف على كيفية استخدام الموقع واختيار الأدوات المناسبة.',
        keywords: 'أسئلة شائعة، نبض، دليل الذكاء الاصطناعي، مساعدة، FAQ',
    });

    // Add FAQ Schema
    useEffect(() => {
        const existingScript = document.querySelector('script[data-faq-schema]');
        if (existingScript) {
            existingScript.remove();
        }

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
    }, []);

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
            <main className="container mx-auto max-w-3xl px-4 py-12 space-y-12">
                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                            <HelpCircle className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                        الأسئلة الشائعة
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        إجابات سريعة على الأسئلة الأكثر شيوعاً حول نبض وأدوات الذكاء الاصطناعي.
                    </p>
                </section>

                {/* FAQ Accordion */}
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

                {/* CTA Section */}
                <section className="text-center space-y-6">
                    <p className="text-muted-foreground">لم تجد إجابة لسؤالك؟</p>
                    <Link to="/contact">
                        <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                            تواصل معنا
                        </Button>
                    </Link>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border/50 py-8 mt-12">
                <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
                    <p>© 2024 نبض AI. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
};

export default FAQ;
