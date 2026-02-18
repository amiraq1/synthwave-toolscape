import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Download, Smartphone, CheckCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'} role="main">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 space-y-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <Activity className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl">
              <span className="font-extrabold gradient-text">{isAr ? 'نبض' : 'Nabd'}</span>
              <span className="font-medium text-foreground/80 mx-1">AI</span>
            </h1>
          </div>

          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle className="h-6 w-6" />
                <span className="text-xl font-semibold">{isAr ? 'التطبيق مثبت!' : 'App installed!'}</span>
              </div>
              <p className="text-muted-foreground">{isAr ? 'يمكنك الآن استخدام التطبيق من الشاشة الرئيسية' : 'You can now launch it from your home screen.'}</p>
              <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg">
                {isAr ? 'العودة للرئيسية' : 'Back to home'}
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-neon-purple">
                <Smartphone className="h-6 w-6" />
                <span className="text-xl font-semibold">{isAr ? 'ثبت التطبيق على جهازك' : 'Install on your device'}</span>
              </div>

              <div className={`space-y-4 ${isAr ? 'text-right' : 'text-left'}`}>
                <p className="text-muted-foreground">{isAr ? 'لتثبيت التطبيق على iPhone أو iPad:' : 'To install on iPhone or iPad:'}</p>
                <ol className="space-y-3 text-foreground">
                  <li className="flex items-start gap-3"><span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">1</span><span>{isAr ? 'اضغط على أيقونة المشاركة' : 'Tap the Share icon'} <Share className="inline h-4 w-4 mx-1" /></span></li>
                  <li className="flex items-start gap-3"><span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">2</span><span>{isAr ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"'}</span></li>
                  <li className="flex items-start gap-3"><span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">3</span><span>{isAr ? 'اضغط "إضافة"' : 'Tap "Add"'}</span></li>
                </ol>
              </div>

              <Button onClick={() => navigate('/')} variant="outline" className="w-full py-6 text-lg border-border/50">
                {isAr ? 'العودة للرئيسية' : 'Back to home'}
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-neon-purple">
                <Download className="h-6 w-6" />
                <span className="text-xl font-semibold">{isAr ? 'ثبت التطبيق' : 'Install app'}</span>
              </div>

              <p className="text-muted-foreground">{isAr ? 'ثبت التطبيق للوصول السريع والعمل بدون إنترنت' : 'Install for fast access and offline use.'}</p>

              <div className="space-y-3">
                <Button onClick={handleInstall} className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg gap-2">
                  <Download className="h-5 w-5" />
                  {isAr ? 'تثبيت التطبيق' : 'Install app'}
                </Button>

                <Button onClick={() => navigate('/')} variant="outline" className="w-full py-6 text-lg border-border/50">
                  {isAr ? 'ليس الآن' : 'Not now'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Smartphone className="h-6 w-6" />
                <span className="text-xl font-semibold">{isAr ? 'تصفح الآن' : 'Browse now'}</span>
              </div>

              <p className="text-muted-foreground">{isAr ? 'يمكنك تثبيت التطبيق من قائمة المتصفح أو استخدامه مباشرة' : 'You can install from your browser menu or continue using it now.'}</p>

              <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg">
                {isAr ? 'استكشف الأدوات' : 'Explore tools'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Install;
