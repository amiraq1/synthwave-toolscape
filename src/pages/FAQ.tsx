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
        question: 'What is Nabd AI?',
        answer: 'Nabd is a curated directory for top AI tools. It helps you discover the right products through clear categories and practical comparisons.',
    },
    {
        question: 'Are AI tools free?',
        answer: 'Pricing varies. Some tools are fully free, others are paid, and many offer freemium or trial plans. We show pricing type for each listing.',
    },
    {
        question: 'How do I choose the right AI tool?',
        answer: 'Start with your use case (text, image, video, coding, productivity). Then filter by category, compare features, and review user ratings.',
    },
    {
        question: 'Can I suggest a new tool?',
        answer: 'Yes. Use the "Add Tool" action on the homepage. Submissions are reviewed before publishing.',
    },
    {
        question: 'How are tools rated?',
        answer: 'Signed-in users can rate from 1 to 5 stars and leave reviews. We display average score and review count for each tool.',
    },
    {
        question: 'What categories are available?',
        answer: 'Popular categories include text, image, video, coding, productivity, and education-oriented tools.',
    },
    {
        question: 'Is Nabd available as an app?',
        answer: 'Yes. Nabd supports PWA installation, so you can add it to your device and use core pages faster.',
    },
    {
        question: 'How can I contact the Nabd team?',
        answer: 'Use the contact page or send an email to contact@amiraq.org.',
    },
];

const FAQ = () => {
    useSEO({
        title: 'FAQ - Nabd AI',
        description: 'Answers to common questions about Nabd AI and how to discover the right AI tools.',
        keywords: 'FAQ, Nabd, AI tools directory, help',
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
        <div className="min-h-screen bg-background" dir="ltr">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/50">
                <div className="container mx-auto max-w-5xl px-4 py-4">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowRight className="h-5 w-5 rotate-180" />
                            Back to Home
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
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Quick answers about Nabd and AI tool discovery.
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
                                <AccordionTrigger className="text-left hover:no-underline py-5">
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
                    <p className="text-muted-foreground">Still need help?</p>
                    <Link to="/contact">
                        <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                            Contact Us
                        </Button>
                    </Link>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border/50 py-8 mt-12">
                <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
                    <p>© 2024 Nabd AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default FAQ;
