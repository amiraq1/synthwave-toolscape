import { Activity, Mail, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewsletterForm from './NewsletterForm';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const footerLinks = {
    main: [
      { label: t('nav.home'), href: '/' },
      { label: t('nav.blog'), href: '/blog' },
      { label: isAr ? 'اتصل بنا' : 'Contact', href: '/contact' },
    ],
    categories: [
      { label: isAr ? 'أدوات النصوص' : 'Text Tools', href: '/?category=نصوص' },
      { label: isAr ? 'أدوات الصور' : 'Image Tools', href: '/?category=صور' },
      { label: isAr ? 'أدوات الفيديو' : 'Video Tools', href: '/?category=فيديو' },
      { label: isAr ? 'أدوات البرمجة' : 'Coding Tools', href: '/?category=برمجة' },
      { label: isAr ? 'أدوات الدراسة والطلاب' : 'Study Tools', href: '/?category=دراسة وطلاب' },
    ],
  };

  return (
    <footer className="mt-12 sm:mt-20 py-8 sm:py-12 border-t border-white/10 glass-pro relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-neon-purple/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-neon-blue/5 blur-[80px] rounded-full -z-10" />

      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 animated-gradient rounded-lg flex items-center justify-center shadow-lg shadow-neon-purple/20">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl animated-gradient-text">{isAr ? 'نبض' : 'Nabd'}</span>
              <span className="text-foreground/80 text-xl" lang="en">AI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">{t('footer.about')}</p>

            <div className="flex items-center gap-3">
              <a
                href="mailto:contact@amiraq.org"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-purple/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-neon-purple/20 group border border-white/5 hover:border-neon-purple/30"
                aria-label={isAr ? 'أرسل لنا بريدًا إلكترونيًا' : 'Send us an email'}
              >
                <Mail className="h-4 w-4 text-muted-foreground group-hover:text-neon-purple transition-colors" />
              </a>
              <a
                href="https://twitter.com/NabdAI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-blue/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-neon-blue/20 group border border-white/5 hover:border-neon-blue/30"
                aria-label={isAr ? 'تابعنا على تويتر' : 'Follow us on Twitter'}
              >
                <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-neon-blue transition-colors" />
              </a>
              <a
                href="https://github.com/amiraq1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group border border-white/5 hover:border-white/20"
                aria-label={isAr ? 'رابط المستودع على جيت هب' : 'GitHub repository'}
              >
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground">{t('footer.links')}</h3>
            <nav aria-label={isAr ? 'روابط سريعة' : 'Quick links'}>
              <ul className="space-y-2">
                {footerLinks.main.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-neon-purple transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground">{isAr ? 'التصنيفات' : 'Categories'}</h3>
            <nav aria-label={isAr ? 'تصنيفات الأدوات' : 'Tool categories'}>
              <ul className="space-y-2">
                {footerLinks.categories.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-neon-purple transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="py-6 border-t border-border/30 mb-6">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-bold text-lg mb-2">📬 {isAr ? 'اشترك في نشرتنا الأسبوعية' : 'Subscribe to our weekly newsletter'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isAr ? 'احصل على أحدث أدوات الذكاء الاصطناعي مباشرة في بريدك' : 'Get the latest AI tools directly in your inbox'}
            </p>
            <NewsletterForm variant="compact" className="max-w-md mx-auto" />
          </div>
        </div>

        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs sm:text-sm text-center">{t('footer.rights')}</p>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-neon-purple transition-colors p-2 -m-2 block">
              {isAr ? 'من نحن' : 'About'}
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-neon-purple transition-colors p-2 -m-2 block">
              {isAr ? 'اتصل بنا' : 'Contact'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
