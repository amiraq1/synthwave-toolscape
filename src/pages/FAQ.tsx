import { useEffect } from "react";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "ما هي منصة نبض AI؟",
        answer:
            "نبض دليل عربي منسّق لأدوات الذكاء الاصطناعي يساعدك على اكتشاف الأدوات المناسبة بسرعة عبر تصنيفات واضحة ومقارنات عملية.",
    },
    {
        question: "هل أدوات الذكاء الاصطناعي مجانية؟",
        answer:
            "ليس دائمًا. بعض الأدوات مجانية بالكامل، وبعضها مدفوع، والكثير منها يوفّر خطة مجانية أو تجربة محدودة.",
    },
    {
        question: "كيف أختار الأداة المناسبة؟",
        answer:
            "ابدأ بتحديد المهمة (كتابة، صور، فيديو، برمجة، إنتاجية)، ثم قارن الميزات والسعر والتقييمات وتجربة المستخدم.",
    },
    {
        question: "هل يمكنني اقتراح أداة جديدة؟",
        answer:
            "نعم، يمكنك استخدام خيار \"إضافة أداة\" من الصفحة الرئيسية. تتم مراجعة الأداة قبل اعتمادها ونشرها.",
    },
    {
        question: "كيف يتم تقييم الأدوات؟",
        answer:
            "يمكن للمستخدمين المسجلين إضافة تقييم من 1 إلى 5 نجوم مع مراجعة نصية، ثم نعرض المتوسط وعدد التقييمات لكل أداة.",
    },
    {
        question: "ما التصنيفات المتاحة؟",
        answer:
            "تشمل التصنيفات الأكثر استخدامًا: النصوص، الصور، الفيديو، البرمجة، الإنتاجية، والتعليم.",
    },
    {
        question: "هل نبض متاح كتطبيق؟",
        answer:
            "نعم، يدعم نبض التثبيت كتطبيق ويب تقدمي (PWA) لتجربة أسرع وأسهل على الأجهزة المختلفة.",
    },
    {
        question: "كيف أتواصل مع فريق نبض؟",
        answer: "يمكنك التواصل عبر صفحة \"اتصل بنا\" أو عبر البريد: contact@amiraq.org.",
    },
];

const FAQ = () => {
    useSEO({
        title: "الأسئلة الشائعة - نبض AI",
        description: "إجابات سريعة حول منصة نبض وكيفية اكتشاف أدوات الذكاء الاصطناعي المناسبة.",
        keywords: "الأسئلة الشائعة, نبض, أدوات الذكاء الاصطناعي, مساعدة",
    });

    useEffect(() => {
        const existingScript = document.querySelector("script[data-faq-schema]");
        if (existingScript) existingScript.remove();

        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: item.answer,
                },
            })),
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-faq-schema", "true");
        script.textContent = JSON.stringify(faqSchema);
        document.head.appendChild(script);

        return () => script.remove();
    }, []);

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

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

            <main className="container mx-auto max-w-3xl px-4 py-12 space-y-12">
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
                        إجابات سريعة حول منصة نبض واختيار أفضل أدوات الذكاء الاصطناعي.
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
                    <p className="text-muted-foreground">هل تحتاج مساعدة إضافية؟</p>
                    <Link to="/contact">
                        <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                            تواصل معنا
                        </Button>
                    </Link>
                </section>
            </main>

            <footer className="border-t border-border/50 py-8 mt-12">
                <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
                    <p>© 2026 نبض AI. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
};

export default FAQ;
