import { Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-12 sm:mt-20 py-6 sm:py-8 border-t border-border/50 glass" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-neon-purple" />
            <span className="font-bold gradient-text text-sm sm:text-base">نبض</span>
            <span className="text-foreground/80 text-sm sm:text-base">AI</span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm text-center">
            جميع الحقوق محفوظة © 2024 نبض
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
