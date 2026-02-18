import { useState } from 'react';
import { Mail, Send, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSEO } from '@/hooks/useSEO';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useSEO({
    title: isAr ? 'اتصل بنا - نبض AI' : 'Contact Us - Nabd AI',
    description: isAr
      ? 'تواصل مع فريق نبض AI. نسعد بالإجابة على استفساراتك.'
      : 'Contact the Nabd AI team. We are happy to answer your questions.',
    keywords: isAr ? 'اتصل بنا، نبض، دعم' : 'contact, Nabd, support',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success(isAr ? 'تم إرسال رسالتك' : 'Message sent', {
      description: isAr ? 'شكراً لتواصلك معنا. سنرد عليك قريباً.' : 'Thanks for contacting us. We will reply soon.',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            {isAr ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'لديك سؤال أو اقتراح؟ أرسل لنا رسالة وسنرد عليك في أقرب وقت.'
              : 'Have a question or suggestion? Send us a message and we will reply soon.'}
          </p>
        </section>

        <section className="glass rounded-3xl p-8 md:p-12">
          {isSubmitted ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {isAr ? 'شكراً لتواصلك!' : 'Thanks for reaching out!'}
              </h2>
              <p className="text-muted-foreground">
                {isAr ? 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.' : 'Your message was sent successfully. We will contact you soon.'}
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    {isAr ? 'الاسم' : 'Name'}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
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
                  {isAr ? 'الموضوع' : 'Subject'}
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={isAr ? 'موضوع رسالتك' : 'Message subject'}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  {isAr ? 'الرسالة' : 'Message'}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
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
                    {isAr ? 'جاري الإرسال...' : 'Sending...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    {isAr ? 'إرسال الرسالة' : 'Send Message'}
                  </span>
                )}
              </Button>
            </form>
          )}
        </section>

        <section className="text-center space-y-4">
          <p className="text-muted-foreground">{isAr ? 'أو تواصل معنا مباشرة عبر:' : 'Or contact us directly via:'}</p>
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

      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container mx-auto max-w-5xl px-4 text-center text-muted-foreground">
          <p>{isAr ? '© 2024 نبض AI. جميع الحقوق محفوظة.' : '© 2024 Nabd AI. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
