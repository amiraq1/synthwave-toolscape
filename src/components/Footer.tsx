import { Activity, Mail, Info, Phone, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewsletterForm from './NewsletterForm';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    main: [
      { label: t('nav.home'), href: '/' },
      { label: t('nav.blog'), href: '/blog' },
      { label: t('footer.contact'), href: '/contact' },
    ],
    categories: [
      { label: t('footer.cat_text'), href: '/?category=نصوص' },
      { label: t('footer.cat_images'), href: '/?category=صور' },
      { label: t('footer.cat_video'), href: '/?category=فيديو' },
      { label: t('footer.cat_code'), href: '/?category=برمجة' },
      { label: t('footer.cat_study'), href: '/?category=دراسة وطلاب' },
    ],
  };

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-black/8 bg-[#efe7d8]/92 py-10 sm:mt-16 sm:py-12" dir={i18n.dir()}>
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_35%)]" />

      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-slate-950">{t('brand.name')}</span>
              <span className="text-xl text-slate-600" lang="en">AI</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600">
              {t('footer.about')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="mailto:contact@amiraq.org"
                className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white/75 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                aria-label={t('footer.email_aria')}
              >
                <Mail className="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-950" />
              </a>
              <a
                href="https://twitter.com/NabdAI"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white/75 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                aria-label={t('footer.twitter_aria')}
              >
                <Twitter className="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-950" />
              </a>
              <a
                href="https://github.com/amiraq1"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white/75 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                aria-label={t('footer.github_aria')}
              >
                <Github className="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-950" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-950">{t('footer.links')}</h3>
            <nav aria-label={t('footer.links')}>
              <ul className="space-y-2">
                {footerLinks.main.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-950"
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
            <h3 className="font-bold text-slate-950">{t('footer.categories')}</h3>
            <nav aria-label={t('footer.categories')}>
              <ul className="space-y-2">
                {footerLinks.categories.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-950"
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
        <div className="mb-6 border-t border-black/8 py-6">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="mb-2 text-lg font-bold text-slate-950">{t('footer.newsletter_title')}</h3>
            <p className="mb-4 text-sm text-slate-600">{t('footer.newsletter_desc')}</p>
            <NewsletterForm variant="compact" className="max-w-md mx-auto" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/8 pt-6 sm:flex-row">
          <p className="text-center text-xs text-slate-600 sm:text-sm">
            {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600 sm:text-sm">
            <Link to="/about" className="transition-colors hover:text-slate-950">
              {t('footer.about_link')}
            </Link>
            <span>•</span>
            <Link to="/contact" className="transition-colors hover:text-slate-950">
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
