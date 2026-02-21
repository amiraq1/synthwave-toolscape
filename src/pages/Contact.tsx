import { useState } from 'react';
import { Mail, Send, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSEO } from '@/hooks/useSEO';
import { toast } from 'sonner';

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    useSEO({
        title: 'تواصل معنا - نبض AI',
        description: 'تواصل مع فريق نبض AI للاستفسارات أو الملاحظات أو فرص الشراكة.',
        keywords: 'تواصل، نبض، دعم، مساعدة، ملاحظات',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);
        toast.success('تم إرسال الرسالة', {
            description: 'شكراً لتواصلك. سنعود إليك قريباً.',
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

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
                            <Mail className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                        تواصل معنا
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        لديك سؤال أو فكرة؟ أرسل لنا رسالة وسنرد عليك في أقرب وقت.
                    </p>
                </section>

                {/* Contact Form */}
                <section className="glass rounded-3xl p-8 md:p-12">
                    {isSubmitted ? (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">شكراً لتواصلك معنا!</h2>
                            <p className="text-muted-foreground">تم إرسال رسالتك بنجاح.</p>
                            <Button onClick={() => setIsSubmitted(false)} variant="outline">
                                إرسال رسالة أخرى
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                                        الاسم
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="اسمك الكامل"
                                        required
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        البريد الإلكتروني
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@example.com"
                                        required
                                        dir="ltr"
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                                    الموضوع
                                </label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="موضوع الرسالة"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-foreground">
                                    الرسالة
                                </label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="اكتب رسالتك هنا..."
                                    required
                                    rows={6}
                                    className="bg-background/50 resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                        جاري الإرسال...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send className="h-5 w-5" />
                                        إرسال الرسالة
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}
                </section>

                {/* Alternative Contact */}
                <section className="text-center space-y-4">
                    <p className="text-muted-foreground">أو تواصل معنا مباشرة عبر:</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <a
                            href="mailto:contact@amiraq.org"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card hover:bg-card/80 transition-colors"
                        >
                            <Mail className="h-5 w-5 text-neon-purple" />
                            <span>contact@amiraq.org</span>
                        </a>
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

export default Contact;
