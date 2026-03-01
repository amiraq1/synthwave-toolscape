import { Activity, Mail, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryLabel } from '@/utils/localization';
import NewsletterForm from '@/components/NewsletterForm';

const Footer = () => {
  const footerLinks = {
    main: [
      { label: "ط§ظ„ط±ط¦ظٹط³ظٹط©", href: '/' },
      { label: "ط§ظ„ظ…ط¯ظˆظ†ط©", href: '/blog' },
      { label: "ط§طھطµظ„ ط¨ظ†ط§", href: '/contact' },
    ],
    categories: [
      { label: getCategoryLabel('ظ†طµظˆطµ', true), href: '/?category=ظ†طµظˆطµ' },
      { label: getCategoryLabel('طµظˆط±', true), href: '/?category=طµظˆط±' },
      { label: getCategoryLabel('ظپظٹط¯ظٹظˆ', true), href: '/?category=ظپظٹط¯ظٹظˆ' },
      { label: getCategoryLabel('ط¨ط±ظ…ط¬ط©', true), href: '/?category=ط¨ط±ظ…ط¬ط©' },
      { label: getCategoryLabel('ط¯ط±ط§ط³ط© ظˆط·ظ„ط§ط¨', true), href: '/?category=ط¯ط±ط§ط³ط© ظˆط·ظ„ط§ط¨' },
    ],
  };

  return (
    <footer className="mt-12 sm:mt-20 py-8 sm:py-12 border-t border-white/10 glass-pro relative overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-neon-purple/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-neon-blue/5 blur-[80px] rounded-full -z-10" />

      <div className="container mx-auto max-w-7xl px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 animated-gradient rounded-lg flex items-center justify-center shadow-lg shadow-neon-purple/20">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl animated-gradient-text">نبض</span>
              <span className="text-foreground/80 text-xl" lang="en">AI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              ظ†ط¨ط¶ AI ظ‡ظˆ ظ…ظ†طµطھظƒ ط§ظ„ط£ظˆظ„ظ‰ ظ„ط§ظƒطھط´ط§ظپ ط£ط¯ظˆط§طھ ط§ظ„ظ…ط³طھظ‚ط¨ظ„.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="mailto:contact@amiraq.org"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-purple/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-neon-purple/20 group border border-white/5 hover:border-neon-purple/30"
                aria-label="ط£ط±ط³ظ„ ظ„ظ†ط§ ط¨ط±ظٹط¯ظ‹ط§ ط¥ظ„ظƒطھط±ظˆظ†ظٹظ‹ط§"
              >
                <Mail className="h-4 w-4 text-muted-foreground group-hover:text-neon-purple transition-colors" />
              </a>
              <a
                href="https://twitter.com/NabdAI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-blue/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-neon-blue/20 group border border-white/5 hover:border-neon-blue/30"
                aria-label="طھط§ط¨ط¹ظ†ط§ ط¹ظ„ظ‰ طھظˆظٹطھط±"
              >
                <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-neon-blue transition-colors" />
              </a>
              <a
                href="https://github.com/amiraq1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group border border-white/5 hover:border-white/20"
                aria-label="ط±ط§ط¨ط· ط§ظ„ظ…ط³طھظˆط¯ط¹ ط¹ظ„ظ‰ ط¬ظٹطھ ظ‡ط¨"
              >
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">ط±ظˆط§ط¨ط· ظ‡ط§ظ…ط©</h3>
            <nav aria-label="ط±ظˆط§ط¨ط· ط³ط±ظٹط¹ط©">
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
            <h3 className="font-bold text-foreground">ط§ظ„طھطµظ†ظٹظپط§طھ</h3>
            <nav aria-label="طھطµظ†ظٹظپط§طھ ط§ظ„ط£ط¯ظˆط§طھ">
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
            <h3 className="font-bold text-lg mb-2">ًں“¬ ط§ط´طھط±ظƒ ظپظٹ ظ†ط´ط±طھظ†ط§ ط§ظ„ط£ط³ط¨ظˆط¹ظٹط©</h3>
            <p className="text-sm text-muted-foreground mb-4">ط§ط­طµظ„ ط¹ظ„ظ‰ ط£ط­ط¯ط« ط£ط¯ظˆط§طھ ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ظ…ط¨ط§ط´ط±ط© ظپظٹ ط¨ط±ظٹط¯ظƒ</p>
            <NewsletterForm variant="compact" className="max-w-md mx-auto" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs sm:text-sm text-center">
            ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط© آ© 2026 ظ†ط¨ط¶ AI
          </p>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-neon-purple transition-colors p-2 -m-2 block">
              ظ…ظ† ظ†ط­ظ†
            </Link>
            <span>â€¢</span>
            <Link to="/contact" className="hover:text-neon-purple transition-colors p-2 -m-2 block">
              ط§طھطµظ„ ط¨ظ†ط§
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

