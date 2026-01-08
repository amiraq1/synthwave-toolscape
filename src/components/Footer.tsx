import { Activity, Mail, Info, Phone, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewsletterForm from './NewsletterForm';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    main: [
      { label: t('nav.home'), href: '/' },
      { label: t('nav.blog'), href: '/blog' },
      { label: 'اتصل بنا', href: '/contact' },
    ],
    categories: [
      { label: 'أدوات النصوص', href: '/?category=نصوص' },
      { label: 'أدوات الصور', href: '/?category=صور' },
      { label: 'أدوات الفيديو', href: '/?category=فيديو' },
      { label: 'أدوات البرمجة', href: '/?category=برمجة' },
      { label: 'أدوات الدراسة والطلاب', href: '/?category=دراسة وطلاب' },
    ],
  };

  return (
    <footer className="mt-12 sm:mt-20 py-8 sm:py-12 border-t border-border/50 glass" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-neon-purple" />
              <span className="font-bold text-xl gradient-text">نبض</span>
              <span className="text-foreground/80 text-xl" lang="en">AI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              {t('footer.about')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="mailto:contact@amiraq.org"
                className="w-9 h-9 rounded-lg bg-card hover:bg-neon-purple/20 flex items-center justify-center transition-colors"
                aria-label="أرسل لنا بريدًا إلكترونيًا"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://twitter.com/NabdAI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-card hover:bg-neon-purple/20 flex items-center justify-center transition-colors"
                aria-label="تابعنا على تويتر"
              >
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://github.com/amiraq1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-card hover:bg-neon-purple/20 flex items-center justify-center transition-colors"
                aria-label="رابط المستودع على جيت هب"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">{t('footer.links')}</h3>
            <nav aria-label="روابط سريعة">
              <ul className="space-y-2">
                {footerLinks.main.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-neon-purple transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">التصنيفات</h3>
            <nav aria-label="تصنيفات الأدوات">
              <ul className="space-y-2">
                {footerLinks.categories.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-neon-purple transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-6 border-t border-border/30 mb-6">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-bold text-lg mb-2">📬 اشترك في نشرتنا الأسبوعية</h3>
            <p className="text-sm text-muted-foreground mb-4">احصل على أحدث أدوات الذكاء الاصطناعي مباشرة في بريدك</p>
            <NewsletterForm variant="compact" className="max-w-md mx-auto" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs sm:text-sm text-center">
            {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-neon-purple transition-colors">
              حول
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-neon-purple transition-colors">
              اتصل بنا
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
