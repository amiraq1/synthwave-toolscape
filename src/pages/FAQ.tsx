import { useEffect } from 'react';
import { HelpCircle, ArrowRight, ChevronDown } from 'lucide-react';
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

const getFaqData = (t: any): FAQItem[] => [
    {
        question: t('faq.q1'),
        answer: t('faq.a1'),
    },
    {
        question: t('faq.q2'),
        answer: t('faq.a2'),
    },
    {
        question: t('faq.q3'),
        answer: t('faq.a3'),
    },
    {
        question: t('faq.q4'),
        answer: t('faq.a4'),
    },
    {
        question: t('faq.q5'),
        answer: t('faq.a5'),
    },
    {
        question: t('faq.q6'),
        answer: t('faq.a6'),
    },
    {
        question: t('faq.q7'),
        answer: t('faq.a7'),
    },
    {
        question: t('faq.q8'),
        answer: t('faq.a8'),
    },
];

const FAQ = () => {
    const { t, i18n } = useTranslation();
    const faqData = getFaqData(t);

    useSEO({
        title: t('faq.meta_title'),
        description: t('faq.meta_desc'),
        keywords: t('faq.meta_keywords'),
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
        <div className="min-h-screen bg-background" dir={i18n.dir()}>
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/50">
                <div className="container mx-auto max-w-5xl px-4 py-4">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowRight className="h-5 w-5" />
                            {t('nav.back_home')}
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
                        {t('faq.title')}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        {t('faq.subtitle')}
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
                                <AccordionTrigger className="text-start hover:no-underline py-5">
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
                    <p className="text-muted-foreground">{t('faq.not_found')}</p>
                    <Link to="/contact">
                        <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                            {t('about.contact_us')}
                        </Button>
                    </Link>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border/50 py-8 mt-12">
                <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
                    <p>{t('footer.rights')}</p>
                </div>
            </footer>
        </div>
    );
};

export default FAQ;
