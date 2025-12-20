import { Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 py-8 border-t border-border/50 glass" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-neon-purple" />
            <span className="font-bold gradient-text">نبض</span>
            <span className="text-foreground/80">AI</span>
          </div>
          <p className="text-muted-foreground text-sm">
            جميع الحقوق محفوظة © 2024 نبض
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
